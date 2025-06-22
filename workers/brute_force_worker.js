let isRunning = false;
let currentData = [];
let targetMetric = 'Accuracy';
let cohortName = '';
let bestResult = null;
let allResults = [];
let combinationsTested = 0;
let totalCombinations = 0;
let startTime = 0;
let t2SizeRange = { min: 0.1, max: 25.0, step: 0.1 };
const reportIntervalFactor = 200;

function cloneDeep(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
        if (typeof self !== 'undefined' && self.structuredClone) {
            return self.structuredClone(obj);
        } else {
            return JSON.parse(JSON.stringify(obj));
        }
    } catch (e) {
        if (Array.isArray(obj)) {
            const arrCopy = [];
            for (let i = 0; i < obj.length; i++) {
                arrCopy[i] = cloneDeep(obj[i]);
            }
            return arrCopy;
        }
        if (typeof obj === 'object') {
            const objCopy = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    objCopy[key] = cloneDeep(obj[key]);
                }
            }
            return objCopy;
        }
        return obj;
    }
}

function checkNode(lymphNode, criteria) {
    const checkResult = { size: null, shape: null, border: null, homogeneity: null, signal: null };
    if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

    if (criteria.size?.active) {
        const threshold = criteria.size.threshold;
        const nodeSize = lymphNode.size;
        const condition = criteria.size.condition || '>=';
        if (typeof nodeSize === 'number' && !isNaN(nodeSize) && typeof threshold === 'number' && !isNaN(threshold)) {
            switch (condition) {
                case '>=': checkResult.size = nodeSize >= threshold; break;
                case '>': checkResult.size = nodeSize > threshold; break;
                case '<=': checkResult.size = nodeSize <= threshold; break;
                case '<': checkResult.size = nodeSize < threshold; break;
                case '==': checkResult.size = nodeSize === threshold; break;
                default: checkResult.size = false;
            }
        } else { checkResult.size = false; }
    }
    if (criteria.shape?.active) checkResult.shape = (lymphNode.shape === criteria.shape.value);
    if (criteria.border?.active) checkResult.border = (lymphNode.border === criteria.border.value);
    if (criteria.homogeneity?.active) checkResult.homogeneity = (lymphNode.homogeneity === criteria.homogeneity.value);
    if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

    return checkResult;
}

function applyCriteriaToPatient(patient, criteria, logic) {
    if (!patient || !criteria || (logic !== 'AND' && logic !== 'OR')) return null;
    const lymphNodes = patient.t2Nodes;
    if (!Array.isArray(lymphNodes)) return null;

    const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

    if (activeKeys.length === 0) return null;
    if (lymphNodes.length === 0) return '-';

    for (let k = 0; k < lymphNodes.length; k++) {
        const lk = lymphNodes[k];
        if (!lk) continue;
        const checkResult = checkNode(lk, criteria);
        let lkIsPositive = false;
        if (logic === 'AND') {
            lkIsPositive = activeKeys.every(key => checkResult[key] === true);
        } else {
            lkIsPositive = activeKeys.some(key => checkResult[key] === true);
        }
        if (lkIsPositive) return '+';
    }
    return '-';
}

function calculateMetric(data, criteria, logic, metricName) {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    if (!Array.isArray(data)) return NaN;

    data.forEach(p => {
        if (!p || typeof p !== 'object') return;
        const predictedT2 = applyCriteriaToPatient(p, criteria, logic);
        const actualN = p.nStatus === '+';
        const validN = p.nStatus === '+' || p.nStatus === '-';
        const validT2 = predictedT2 === '+' || predictedT2 === '-';

        if (validN && validT2) {
            const predicted = predictedT2 === '+';
            if (predicted && actualN) tp++;
            else if (predicted && !actualN) fp++;
            else if (!predicted && actualN) fn++;
            else if (!predicted && !actualN) tn++;
        }
    });

    const total = tp + fp + fn + tn;
    if (total === 0) return NaN;

    const sens = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const spec = (fp + tn) > 0 ? tn / (fp + tn) : 0;
    const ppv = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const npv = (fn + tn) > 0 ? tn / (fn + tn) : 0;
    let result;

    switch (metricName) {
        case 'Accuracy':
            result = (tp + tn) / total;
            break;
        case 'Balanced Accuracy':
            result = (isNaN(sens) || isNaN(spec)) ? NaN : (sens + spec) / 2.0;
            break;
        case 'F1-Score':
            if (isNaN(ppv) || isNaN(sens)) {
                result = NaN;
            } else if (ppv + sens < 1e-9) {
                result = 0.0;
            } else {
                result = 2.0 * (ppv * sens) / (ppv + sens);
            }
            break;
        case 'PPV':
            result = ppv;
            break;
        case 'NPV':
            result = npv;
            break;
        case 'Youden-Index':
            result = (isNaN(sens) || isNaN(spec)) ? NaN : (sens + spec - 1);
            break;
        default:
            result = (isNaN(sens) || isNaN(spec)) ? NaN : (sens + spec) / 2.0;
            break;
    }
    return isNaN(result) ? -Infinity : result;
}

function generateCriteriaCombinations() {
    const CRITERIA_KEYS = ['size', 'shape', 'border', 'homogeneity', 'signal'];
    const VALUE_OPTIONS = {
        size: [],
        shape: ['round', 'oval'],
        border: ['sharp', 'irregular'],
        homogeneity: ['homogeneous', 'heterogeneous'],
        signal: ['lowSignal', 'intermediateSignal', 'highSignal']
    };
    const LOGICS = ['AND', 'OR'];

    const { min, max, step } = t2SizeRange;
    if (typeof min === 'number' && typeof max === 'number' && typeof step === 'number' && step > 0 && min <= max) {
        const stepInTenths = Math.max(1, Math.round(step * 10));
        for (let s = Math.round(min * 10); s <= Math.round(max * 10); s += stepInTenths) {
            VALUE_OPTIONS.size.push(parseFloat((s / 10).toFixed(1)));
        }
        VALUE_OPTIONS.size = [...new Set(VALUE_OPTIONS.size)].sort((a, b) => a - b);
    }
    
    if (VALUE_OPTIONS.size.length === 0) {
        VALUE_OPTIONS.size = Array.from({ length: Math.round((25.0 - 0.1)/0.1) + 1 }, (_, i) => 0.1 + i * 0.1);
    }
    
    const combinations = [];
    let calculatedTotal = 0;
    const numCriteria = CRITERIA_KEYS.length;

    for (let i = 1; i < (1 << numCriteria); i++) {
        const activeKeys = [];
        const baseTemplate = {};
        CRITERIA_KEYS.forEach((key, index) => {
            const isActive = ((i >> index) & 1) === 1;
            baseTemplate[key] = { active: isActive };
            if (isActive) activeKeys.push(key);
        });

        let combinationsForSubset = [];
        function generateValues(keyIndex, currentCombo) {
            if (keyIndex === activeKeys.length) {
                combinationsForSubset.push(currentCombo);
                return;
            }

            const currentKey = activeKeys[keyIndex];
            const options = VALUE_OPTIONS[currentKey];
            options.forEach(value => {
                const nextCombo = cloneDeep(currentCombo);
                if (currentKey === 'size') {
                    nextCombo[currentKey].threshold = value;
                    nextCombo[currentKey].condition = '>=';
                } else {
                    nextCombo[currentKey].value = value;
                }
                generateValues(keyIndex + 1, nextCombo);
            });
        }
        generateValues(0, baseTemplate);

        calculatedTotal += combinationsForSubset.length * LOGICS.length;

        combinationsForSubset.forEach(combo => {
            LOGICS.forEach(logic => {
                const finalCombo = { logic: logic, criteria: cloneDeep(combo) };
                CRITERIA_KEYS.forEach(k => {
                    if (!finalCombo.criteria[k]) finalCombo.criteria[k] = { active: false };
                });
                combinations.push(finalCombo);
            });
        });
    }

    return { combinations, total: calculatedTotal };
}


function runBruteForce() {
    if (!isRunning) return;
    if (!currentData || currentData.length === 0) {
        self.postMessage({ type: 'error', payload: { message: "No data available in worker for brute-force analysis." } });
        isRunning = false;
        return;
    }
    startTime = performance.now();
    combinationsTested = 0;
    allResults = [];
    bestResult = { metricValue: -Infinity, criteria: null, logic: null };

    const { combinations: allCombinations, total: calculatedTotal } = generateCriteriaCombinations();
    totalCombinations = calculatedTotal;
    
    if (totalCombinations === 0 || allCombinations.length === 0) {
        self.postMessage({ type: 'error', payload: { message: "No criteria combinations were generated. Please check the t2SizeRange configuration." } });
        isRunning = false;
        return;
    }

    self.postMessage({ type: 'started', payload: { totalCombinations: totalCombinations, cohort: cohortName } });

    const reportInterval = Math.max(50, Math.floor(totalCombinations / reportIntervalFactor));
    let lastReportTime = performance.now();

    for (let i = 0; i < allCombinations.length; i++) {
        if (!isRunning) break;

        const combo = allCombinations[i];
        let metricValue = -Infinity;

        try {
            metricValue = calculateMetric(currentData, combo.criteria, combo.logic, targetMetric);
        } catch (error) {
            metricValue = -Infinity;
        }

        const result = { logic: combo.logic, criteria: combo.criteria, metricValue: metricValue };
        allResults.push(result);

        if (result.metricValue > bestResult.metricValue && isFinite(result.metricValue)) {
            bestResult = result;
        }
        combinationsTested++;
        const now = performance.now();

        if (combinationsTested % reportInterval === 0 || combinationsTested === totalCombinations || (now - lastReportTime > 1000)) {
            self.postMessage({
                type: 'progress',
                payload: {
                    tested: combinationsTested,
                    total: totalCombinations,
                    currentBest: bestResult.criteria ? cloneDeep(bestResult) : null,
                    metric: targetMetric,
                    cohort: cohortName
                }
            });
            lastReportTime = now;
        }
    }
    const endTime = performance.now();

    if (isRunning) {
        const validResults = allResults.filter(r => r && isFinite(r.metricValue));
        validResults.sort((a, b) => b.metricValue - a.metricValue);

        const topResults = [];
        const precision = 1e-8;
        let rank = 0;
        let countAtRank = 0;
        let lastScore = Infinity;

        for (let i = 0; i < validResults.length; i++) {
            const currentScore = validResults[i].metricValue;
            const isNewRank = Math.abs(currentScore - lastScore) > precision;

            if (isNewRank) {
                rank = i + 1;
                countAtRank = 1;
            } else {
                countAtRank++;
            }
            lastScore = currentScore;

            if (rank <= 10) {
                topResults.push(validResults[i]);
            } else {
                if (rank === 11 && Math.abs(currentScore - (topResults[topResults.length - 1]?.metricValue ?? -Infinity)) < precision) {
                    topResults.push(validResults[i]);
                } else {
                    break;
                }
            }
        }
        const finalBest = bestResult.criteria ? cloneDeep(bestResult) : (topResults[0] ? cloneDeep(topResults[0]) : null);

        let nTotal = 0;
        let nPlus = 0;
        let nMinus = 0;
        if (Array.isArray(currentData)) {
            nTotal = currentData.length;
            currentData.forEach(p => {
                if (p && p.nStatus === '+') nPlus++;
                else if (p && p.nStatus === '-') nMinus++;
            });
        }

        self.postMessage({
            type: 'result',
            payload: {
                results: topResults.map(r => ({
                    logic: r.logic,
                    criteria: r.criteria,
                    metricValue: r.metricValue
                })),
                bestResult: finalBest,
                metric: targetMetric,
                cohort: cohortName,
                duration: endTime - startTime,
                totalTested: combinationsTested,
                nTotal: nTotal,
                nPlus: nPlus,
                nMinus: nMinus
            }
        });
    }
    isRunning = false;
    currentData = [];
    allResults = [];
}

self.onmessage = function(event) {
    if (!event || !event.data) {
        self.postMessage({ type: 'error', payload: { message: "Invalid message received from main thread." } });
        return;
    }
    const { action, payload } = event.data;

    if (action === 'start') {
        if (isRunning) {
            self.postMessage({ type: 'error', payload: { message: "Worker is already running." } });
            return;
        }
        try {
            if (!payload || !Array.isArray(payload.data) || !payload.metric || !payload.cohort || !payload.t2SizeRange) {
                throw new Error("Incomplete start data for brute-force. Required: data, metric, cohort, t2SizeRange.");
            }
            if (typeof payload.t2SizeRange.min !== 'number' || typeof payload.t2SizeRange.max !== 'number' || typeof payload.t2SizeRange.step !== 'number' || payload.t2SizeRange.step <= 0) {
                throw new Error("Invalid t2SizeRange configuration: min, max, step must be numbers and step > 0.");
            }

            currentData = payload.data;
            targetMetric = payload.metric;
            cohortName = payload.cohort;
            t2SizeRange = payload.t2SizeRange;

            if (currentData.length === 0) {
                throw new Error("Empty dataset received for brute-force analysis.");
            }
            isRunning = true;
            runBruteForce();
        } catch (error) {
            self.postMessage({ type: 'error', payload: { message: `Initialization error in worker: ${error.message}` } });
            isRunning = false;
        }
    } else if (action === 'cancel') {
        if (isRunning) {
            isRunning = false;
            self.postMessage({ type: 'cancelled', payload: { cohort: cohortName } });
        }
    } else {
        self.postMessage({ type: 'error', payload: { message: `Unknown action from main thread: ${action}` } });
    }
};

self.onerror = function(error) {
    self.postMessage({ type: 'error', payload: { message: `Global worker error: ${error.message || 'Unknown worker error'}` } });
    isRunning = false;
};