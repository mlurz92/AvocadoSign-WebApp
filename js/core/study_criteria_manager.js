window.studyT2CriteriaManager = (() => {

    function formatCriteriaForDisplay(criteria, logic = null, shortFormat = false) {
        if (!criteria || typeof criteria !== 'object') return 'N/A';
        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);
        if (activeKeys.length === 0) return 'No active criteria';

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, '?', true);
                return `Size ${criterion.condition || '>='} ${formattedThreshold}mm`;
            }
            let value = criterion.value || '?';
            if (isShort) {
                switch (value) {
                    case 'irregular': value = 'irreg.'; break;
                    case 'sharp': value = 'smooth'; break;
                    case 'heterogeneous': value = 'heterog.'; break;
                    case 'homogeneous': value = 'homog.'; break;
                    case 'lowSignal': value = 'low sig.'; break;
                    case 'intermediateSignal': value = 'int. sig.'; break;
                    case 'highSignal': value = 'high sig.'; break;
                }
            }

            let prefix = '';
            switch(key) {
                case 'shape': prefix = isShort ? 'Sh=' : 'Shape='; break;
                case 'border': prefix = isShort ? 'Bo=' : 'Border='; break;
                case 'homogeneity': prefix = isShort ? 'Ho=' : 'Homog.='; break;
                case 'signal': prefix = isShort ? 'Si=' : 'Signal='; break;
                default: prefix = key + '=';
            }
            return `${prefix}${value}`;
        };

        const priorityOrder = ['size', 'border', 'homogeneity', 'shape', 'signal'];
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
             const studySet = window.PUBLICATION_CONFIG.literatureCriteriaSets.find(s => s.logic === 'KOMBINIERT');
             if (studySet?.studyInfo?.keyCriteriaSummary) {
                 return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.studyInfo.keyCriteriaSummary;
             }
             return 'Combined ESGAR Logic (see original publication for details)';
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
        return cloneDeep(window.PUBLICATION_CONFIG.literatureCriteriaSets);
    }

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = window.PUBLICATION_CONFIG.literatureCriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function _checkSingleNodeESGAR(lymphNode, criteria) {
        const checkResult = {
             size: null, shape: null, border: null, homogeneity: null, signal: null,
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false
        };
        if (!lymphNode || !criteria) return checkResult;

        const nodeSize = (typeof lymphNode.size === 'number' && !isNaN(lymphNode.size)) ? lymphNode.size : -1;
        
        const hasRoundShape = (lymphNode.shape === 'round');
        const hasIrregularBorder = (lymphNode.border === 'irregular');
        const hasHeterogeneousHomogeneity = (lymphNode.homogeneity === 'heterogeneous');

        let morphologyCount = 0;
        if (hasRoundShape) morphologyCount++;
        if (hasIrregularBorder) morphologyCount++;
        if (hasHeterogeneousHomogeneity) morphologyCount++;

        checkResult.size = (criteria.size?.active && nodeSize >= (criteria.size.threshold || 9.0));
        checkResult.shape = (criteria.shape?.active && hasRoundShape);
        checkResult.border = (criteria.border?.active && hasIrregularBorder);
        checkResult.homogeneity = (criteria.homogeneity?.active && hasHeterogeneousHomogeneity);
        checkResult.signal = (criteria.signal?.active && lymphNode.signal === criteria.signal.value);
        checkResult.esgarMorphologyCount = morphologyCount;

        if (nodeSize >= 9.0) {
            checkResult.isPositive = true;
            checkResult.esgarCategory = '≥9mm';
        } else if (nodeSize >= 5.0 && nodeSize < 9.0) {
            checkResult.esgarCategory = '5-8mm';
            if (morphologyCount >= 2) {
                checkResult.isPositive = true;
            }
        } else if (nodeSize >= 0 && nodeSize < 5.0) {
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
            } else { checkResult.size = false; }
        }
        if (criteria.shape?.active) checkResult.shape = (lymphNode.shape === criteria.shape.value);
        if (criteria.border?.active) checkResult.border = (lymphNode.border === criteria.border.value);
        if (criteria.homogeneity?.active) checkResult.homogeneity = (lymphNode.homogeneity === criteria.homogeneity.value);
        if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

        return checkResult;
    }

    function evaluatePatientWithStudyCriteria(patient, studyCriteriaSet) {
        const defaultReturn = { t2Status: null, positiveNodeCount: 0, evaluatedNodes: [] };
        if (!patient || !studyCriteriaSet) return defaultReturn;
        
        const lymphNodes = patient.t2Nodes;
        const criteria = studyCriteriaSet.criteria;
        const logic = studyCriteriaSet.logic;
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active);
        const criteriaAreActive = activeKeys.length > 0 || logic === 'KOMBINIERT';

        if (!criteriaAreActive) {
            return { t2Status: null, positiveNodeCount: 0, evaluatedNodes: [] };
        }

        if (!Array.isArray(lymphNodes) || lymphNodes.length === 0) {
            return { t2Status: '-', positiveNodeCount: 0, evaluatedNodes: [] };
        }

        let patientIsPositive = false;
        let positiveNodeCount = 0;
        
        const evaluatedNodes = lymphNodes.map(lk => {
            if (!lk) return null;
            let isNodePositive = false;
            let checkResult = {};

            if (logic === 'KOMBINIERT') {
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

        return {
            t2Status: patientIsPositive ? '+' : '-',
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
        evaluatePatientWithStudyCriteria,
        evaluateDatasetWithStudyCriteria,
        formatCriteriaForDisplay
    });
})();