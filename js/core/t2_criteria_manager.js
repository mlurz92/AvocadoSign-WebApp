window.t2CriteriaManager = (() => {
    let currentCriteria = null;
    let appliedCriteria = null;
    let currentLogic = window.APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let appliedLogic = window.APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    let isUnsaved = false;

    function init() {
        const savedCriteria = loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        const savedLogic = loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);
        const defaultCriteria = getDefaultT2Criteria();

        appliedCriteria = deepMerge(cloneDeep(defaultCriteria), savedCriteria || {});
        appliedLogic = (savedLogic === 'AND' || savedLogic === 'OR') ? savedLogic : defaultCriteria.logic;

        currentCriteria = cloneDeep(appliedCriteria);
        currentLogic = appliedLogic;
        isUnsaved = false;
    }

    function getCurrentCriteria() {
        return cloneDeep(currentCriteria);
    }

    function getAppliedCriteria() {
        return cloneDeep(appliedCriteria);
    }

    function getCurrentLogic() {
        return currentLogic;
    }

    function getAppliedLogic() {
        return appliedLogic;
    }

    function getIsUnsaved() {
        return isUnsaved;
    }

    function updateCriterionValue(key, value) {
        if (!currentCriteria || !currentCriteria[key]) return false;
        
        const allowedValuesKey = key.toUpperCase() + '_VALUES';
        const allowedValues = window.APP_CONFIG.T2_CRITERIA_SETTINGS[allowedValuesKey];
        
        if (allowedValues && !allowedValues.includes(value)) return false;

        if (currentCriteria[key].value !== value) {
            currentCriteria[key].value = value;
            isUnsaved = true;
            return true;
        }
        return false;
    }

    function updateCriterionThreshold(value) {
        const numValue = parseFloat(value);
        if (!currentCriteria || !currentCriteria.size || isNaN(numValue) || !isFinite(numValue)) {
            return false;
        }
        const clampedValue = clampNumber(numValue, window.APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min, window.APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max);
        if (currentCriteria.size.threshold !== clampedValue) {
            currentCriteria.size.threshold = clampedValue;
            isUnsaved = true;
            return true;
        }
        return false;
    }

    function toggleCriterionActive(key, isActive) {
        if (!currentCriteria || !currentCriteria[key]) return false;
        const isActiveBool = !!isActive;
        if (currentCriteria[key].active !== isActiveBool) {
            currentCriteria[key].active = isActiveBool;
            isUnsaved = true;
            return true;
        }
        return false;
    }

    function updateLogic(logic) {
        if ((logic === 'AND' || logic === 'OR') && currentLogic !== logic) {
            currentLogic = logic;
            isUnsaved = true;
            return true;
        }
        return false;
    }

    function resetCriteria() {
        const defaultCriteria = getDefaultT2Criteria();
        currentCriteria = cloneDeep(defaultCriteria);
        currentLogic = defaultCriteria.logic;
        isUnsaved = true;
    }

    function applyCriteria() {
        appliedCriteria = cloneDeep(currentCriteria);
        appliedLogic = currentLogic;
        saveToLocalStorage(window.APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, appliedCriteria);
        saveToLocalStorage(window.APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, appliedLogic);
        isUnsaved = false;
    }

    function checkNode(lymphNode, criteria) {
        const checkResult = { size: null, shape: null, border: null, homogeneity: null, signal: null };
        if (!lymphNode || !criteria) return checkResult;

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
            } else {
                checkResult.size = false;
            }
        }

        if (criteria.shape?.active) checkResult.shape = (lymphNode.shape === criteria.shape.value);
        if (criteria.border?.active) checkResult.border = (lymphNode.border === criteria.border.value);
        if (criteria.homogeneity?.active) checkResult.homogeneity = (lymphNode.homogeneity === criteria.homogeneity.value);
        if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

        return checkResult;
    }

    function evaluatePatient(patient, criteria, logic) {
        const defaultReturn = { t2Status: null, positiveNodeCount: 0, evaluatedNodes: [] };
        if (!patient || !criteria || (logic !== 'AND' && logic !== 'OR')) return defaultReturn;

        const lymphNodes = patient.t2Nodes;
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active);

        if (activeKeys.length === 0) {
             return { t2Status: null, positiveNodeCount: 0, evaluatedNodes: (lymphNodes || []).map(lk => ({...lk, isPositive: false, checkResult: {}})) };
        }
        
        if (!Array.isArray(lymphNodes) || lymphNodes.length === 0) {
            return { t2Status: '-', positiveNodeCount: 0, evaluatedNodes: [] };
        }

        let patientIsPositive = false;
        let positiveNodeCount = 0;
        const evaluatedNodes = lymphNodes.map(lk => {
            if (!lk) return null;
            const checkResult = checkNode(lk, criteria);
            
            let isNodePositive = (logic === 'AND')
                ? activeKeys.every(key => checkResult[key] === true)
                : activeKeys.some(key => checkResult[key] === true);

            if (isNodePositive) {
                patientIsPositive = true;
                positiveNodeCount++;
            }
            return { ...lk, isPositive: isNodePositive, checkResult };
        }).filter(node => node !== null);

        return {
            t2Status: patientIsPositive ? '+' : '-',
            positiveNodeCount: positiveNodeCount,
            evaluatedNodes: evaluatedNodes
        };
    }

    function evaluateDataset(dataset, criteria, logic) {
        if (!Array.isArray(dataset)) return [];
        if (!criteria || (logic !== 'AND' && logic !== 'OR')) {
            return dataset.map(p => ({
                ...cloneDeep(p),
                t2Status: null,
                countT2NodesPositive: 0,
                t2NodesEvaluated: (p.t2Nodes || []).map(lk => ({...lk, isPositive: false, checkResult: {}}))
            }));
        }

        return dataset.map(patient => {
            if (!patient) return null;
            const patientCopy = cloneDeep(patient);
            const { t2Status, positiveNodeCount, evaluatedNodes } = evaluatePatient(patientCopy, criteria, logic);
            patientCopy.t2Status = t2Status;
            patientCopy.countT2NodesPositive = positiveNodeCount;
            patientCopy.t2NodesEvaluated = evaluatedNodes;
            return patientCopy;
        }).filter(p => p !== null);
    }

    return Object.freeze({
        init,
        getCurrentCriteria,
        getAppliedCriteria,
        getCurrentLogic,
        getAppliedLogic,
        isUnsaved: getIsUnsaved,
        updateCriterionValue,
        updateCriterionThreshold,
        toggleCriterionActive,
        updateLogic,
        resetCriteria,
        applyCriteria,
        checkNode,
        evaluatePatient,
        evaluateDataset
    });
})();