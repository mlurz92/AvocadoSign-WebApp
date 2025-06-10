const studyT2CriteriaManager = (() => {

    function formatCriteriaForDisplay(criteria, logic = null, shortFormat = false) {
        if (!criteria || typeof criteria !== 'object') return 'N/A';
        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);
        if (activeKeys.length === 0) return 'No active criteria';

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, '?');
                return `Size ${criterion.condition || '>='} ${formattedThreshold}mm`;
            }
            let value = criterion.value || '?';
            // Translate German values to English for display, especially for short format
            if (isShort) {
                switch (value) {
                    case 'irregulär': value = 'irreg.'; break;
                    case 'scharf': value = 'smooth'; break;
                    case 'heterogen': value = 'heterog.'; break;
                    case 'homogen': value = 'homog.'; break;
                    case 'signalarm': value = 'low sig.'; break;
                    case 'intermediär': value = 'int. sig.'; break;
                    case 'signalreich': value = 'high sig.'; break;
                    case 'rund': value = 'round'; break;
                    case 'oval': value = 'oval'; break;
                }
            } else { // Full format, just ensure translation
                switch (value) {
                    case 'irregulär': value = 'irregular'; break;
                    case 'scharf': value = 'sharp'; break;
                    case 'heterogen': value = 'heterogeneous'; break;
                    case 'homogen': value = 'homogeneous'; break;
                    case 'signalarm': value = 'low signal'; break;
                    case 'intermediär': value = 'intermediate signal'; break;
                    case 'signalreich': value = 'high signal'; break;
                    case 'rund': value = 'round'; break;
                    case 'oval': value = 'oval'; break;
                }
            }

            let prefix = '';
            switch(key) {
                case 'form': prefix = isShort ? 'Sh=' : 'Shape='; break;
                case 'kontur': prefix = isShort ? 'Bo=' : 'Border='; break;
                case 'homogenitaet': prefix = isShort ? 'Ho=' : 'Homog.='; break;
                case 'signal': prefix = isShort ? 'Si=' : 'Signal='; break;
                default: prefix = key + '=';
            }
            return `${prefix}${value}`;
        };

        const priorityOrder = ['size', 'kontur', 'homogenitaet', 'form', 'signal'];
        const sortedActiveKeys = [...activeKeys].sort((a, b) => {
            const indexA = priorityOrder.indexOf(a);
            const indexB = priorityOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        const effectiveLogic = logic || criteria.logic || 'OR';
        if (effectiveLogic === 'KOMBINIERT') {
             const studySet = PUBLICATION_CONFIG.literatureCriteriaSets.find(s => s.logic === 'KOMBINIERT' && s.id === 'rutegard_et_al_esgar');
             if (studySet?.studyInfo?.keyCriteriaSummary) {
                 return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.studyInfo.keyCriteriaSummary;
             }
             return criteria.note || 'Combined ESGAR Logic (see original publication for details)';
        }
        
        sortedActiveKeys.forEach(key => {
             parts.push(formatValue(key, criteria[key], shortFormat));
        });

        const separator = (effectiveLogic === 'AND') ? ' AND ' : ' OR ';
        if (shortFormat && parts.length > 2) {
             return parts.slice(0, 2).join(separator) + ' ...';
        }
        return parts.join(separator);
    }

    function getAllStudyCriteriaSets() {
        return cloneDeep(PUBLICATION_CONFIG.literatureCriteriaSets);
    }

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = PUBLICATION_CONFIG.literatureCriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function _checkSingleNodeESGAR(lymphNode, criteria) {
        const checkResult = {
             size: null, form: null, kontur: null, homogenitaet: null, signal: null, // Basic checks
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false // ESGAR specific
        };
        if (!lymphNode || !criteria) return checkResult;

        const nodeSize = (typeof lymphNode.size === 'number' && !isNaN(lymphNode.size)) ? lymphNode.size : -1;
        
        // Morphological suspicious features based on ESGAR 2016 from docs
        // 1) Round shape, 2) Irregular border, and 3) Heterogeneous signal
        // Note: The 'signal' property is not explicitly listed as a morphology feature in ESGAR's suspicious criteria for this rule.
        // Therefore, only shape, kontur (border), and homogenitaet are considered for the morphology count.
        const hasRoundShape = (lymphNode.shape === 'rund'); // 'rund' is from data.js
        const hasIrregularBorder = (lymphNode.border === 'irregulär'); // 'irregulär' is from data.js
        const hasHeterogeneousHomogeneity = (lymphNode.homogeneity === 'heterogen'); // 'heterogen' is from data.js

        let morphologyCount = 0;
        if (hasRoundShape) morphologyCount++;
        if (hasIrregularBorder) morphologyCount++; // Corrected variable name: hasIrregularBorder
        if (hasHeterogeneousHomogeneity) morphologyCount++;

        // Record individual checks for detailed display
        checkResult.size = (criteria.size?.active && nodeSize >= (criteria.size.threshold || 9.0)); // The threshold is for >=9mm rule
        checkResult.form = (criteria.form?.active && hasRoundShape);
        checkResult.kontur = (criteria.kontur?.active && hasIrregularBorder); // Corrected variable name
        checkResult.homogenitaet = (criteria.homogenitaet?.active && hasHeterogeneousHomogeneity);
        // Signal is not part of the ESGAR morphology count for this specific rule but can be recorded if active
        checkResult.signal = (criteria.signal?.active && lymphNode.signal === criteria.signal.value);

        checkResult.esgarMorphologyCount = morphologyCount;

        // Apply ESGAR 2016 combined logic
        if (nodeSize >= 9.0) { // Short axis ≥ 9 mm: considered malignant regardless of features
            checkResult.isPositive = true;
            checkResult.esgarCategory = '≥9mm';
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) { // Short axis 5–8 mm: requires 2 suspicious features
            checkResult.esgarCategory = '5-8mm';
            if (morphologyCount >= 2) {
                checkResult.isPositive = true;
            }
        } else if (nodeSize >= 0 && nodeSize < 5.0) { // Short axis < 5 mm: requires 3 suspicious features
             checkResult.esgarCategory = '<5mm';
             if (morphologyCount >= 3) {
                 checkResult.isPositive = true;
             }
        } else {
            checkResult.esgarCategory = 'N/A (Invalid Size)';
        }
        return checkResult;
    }

    function _checkSingleNodeSimple(lymphNode, criteria) {
        const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
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
            } else { checkResult.size = false; }
        }
        // Direct comparison for other categorical features from data.js
        if (criteria.form?.active) checkResult.form = (lymphNode.shape === criteria.form.value);
        if (criteria.kontur?.active) checkResult.kontur = (lymphNode.border === criteria.kontur.value);
        if (criteria.homogenitaet?.active) checkResult.homogenitaet = (lymphNode.homogeneity === criteria.homogenitaet.value);
        if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

        return checkResult;
    }

    function evaluatePatientWithStudyCriteria(patient, studyCriteriaSet) {
        const defaultReturn = { t2Status: null, positiveNodeCount: 0, evaluatedNodes: [] };
        if (!patient || !studyCriteriaSet) return defaultReturn;
        const lymphNodes = patient.t2Nodes;
        if (!Array.isArray(lymphNodes)) {
             return { t2Status: (Object.keys(studyCriteriaSet.criteria).filter(k => studyCriteriaSet.criteria[k]?.active).length > 0 || studyCriteriaSet.logic === 'KOMBINIERT') ? '-' : null, positiveNodeCount: 0, evaluatedNodes: [] };
        }

        let patientIsPositive = false;
        let positiveNodeCount = 0;
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active);
        
        if (lymphNodes.length === 0 && (activeKeys.length > 0 || logic === 'KOMBINIERT')) {
            return { t2Status: '-', positiveNodeCount: 0, evaluatedNodes: [] };
        }
        if (lymphNodes.length === 0) {
             return { t2Status: null, positiveNodeCount: 0, evaluatedNodes: [] };
        }

        const evaluatedNodes = lymphNodes.map(lk => {
            if (!lk) return null;
            let isNodePositive = false;
            let checkResult = {}; // Initialize to empty object

            if (logic === 'KOMBINIERT' && studyCriteriaSet.id === 'rutegard_et_al_esgar') {
                checkResult = _checkSingleNodeESGAR(lk, criteria);
                isNodePositive = checkResult.isPositive;
            } else {
                checkResult = _checkSingleNodeSimple(lk, criteria);
                if (activeKeys.length > 0) {
                    isNodePositive = (logic === 'AND')
                        ? activeKeys.every(key => checkResult[key] === true)
                        : activeKeys.some(key => checkResult[key] === true);
                }
            }
            if (isNodePositive) {
                patientIsPositive = true;
                positiveNodeCount++;
            }
            return { ...lk, isPositive: isNodePositive, checkResult };
        }).filter(node => node !== null);

        let finalStatus = null;
        // A patient's T2 status is defined if any criteria are active or if a combined logic is used
        if (logic === 'KOMBINIERT' || activeKeys.length > 0) {
            finalStatus = patientIsPositive ? '+' : '-';
        }

        return {
            t2Status: finalStatus,
            positiveNodeCount,
            evaluatedNodes
        };
    }

    function evaluateDatasetWithStudyCriteria(dataset, studyCriteriaSet) {
        if (!studyCriteriaSet) {
            return (dataset || []).map(p => ({ ...cloneDeep(p), t2Status: null, countT2NodesPositive: 0, t2NodesEvaluated: [] }));
        }
        if (!Array.isArray(dataset)) return [];
        return dataset.map(patient => {
            if (!patient) return null;
            const patientCopy = cloneDeep(patient);
            const { t2Status, positiveNodeCount, evaluatedNodes } = evaluatePatientWithStudyCriteria(patientCopy, studyCriteriaSet);
            patientCopy.t2Status = t2Status;
            patientCopy.countT2NodesPositive = positiveNodeCount;
            patientCopy.t2NodesEvaluated = evaluatedNodes;
            return patientCopy;
        }).filter(p => p !== null);
    }

    return Object.freeze({
        getAllStudyCriteriaSets,
        getStudyCriteriaSetById,
        applyStudyCriteriaToPatient: evaluatePatientWithStudyCriteria,
        applyStudyCriteriaToDataset: evaluateDatasetWithStudyCriteria,
        formatCriteriaForDisplay
    });
})();
