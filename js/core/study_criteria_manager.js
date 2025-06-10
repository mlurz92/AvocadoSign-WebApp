const studyT2CriteriaManager = (() => {

    const studyCriteriaSets = Object.freeze([
        Object.freeze({
            id: 'rutegard_et_al_esgar',
            name: 'Rutegård et al. (2025) / ESGAR 2016',
            displayShortName: 'ESGAR 2016',
            context: 'Primary Staging (Baseline MRI)',
            applicableCohort: 'direkt OP',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 9.0, condition: '>=' }),
                shape: Object.freeze({ active: true, value: 'rund' }),
                border: Object.freeze({ active: true, value: 'irregulär' }),
                homogeneity: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'KOMBINIERT',
            description: 'ESGAR 2016 criteria for primary staging: Size ≥ 9mm OR (Size 5-8mm AND ≥2 features [round, irregular, heterogeneous]) OR (Size < 5mm AND ALL 3 features [round, irregular, heterogeneous]).',
             studyInfo: Object.freeze({
                reference: "Rutegård et al., Eur Radiol (2025); Beets-Tan et al., Eur Radiol (2018) [ESGAR Consensus]",
                patientCohort: "Rutegård: N=46 (27 upfront surgery, 19 nRCT) - analysis on baseline MRI. ESGAR: Consensus.",
                investigationType: "Primary Staging",
                focus: "Validation of ESGAR 2016 criteria (Rutegård) and consensus recommendation (ESGAR).",
                keyCriteriaSummary: "Size ≥ 9mm OR (5-8mm AND ≥2 of [round, irregular, heterogeneous]) OR (<5mm AND 3 of [round, irregular, heterogeneous])."
            })
        }),
        Object.freeze({
            id: 'koh_2008_morphology',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh et al.',
            context: 'Primary & Restaging (Orig. study focused on post-nCRT)',
            applicableCohort: 'Gesamt',
            criteria: Object.freeze({
                size: Object.freeze({ active: false, threshold: null, condition: null }),
                shape: Object.freeze({ active: false, value: null }),
                border: Object.freeze({ active: true, value: 'irregulär' }),
                homogeneity: Object.freeze({ active: true, value: 'heterogen' }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Koh et al. (2008): Morphological criteria - Irregular border OR heterogeneous signal. Evaluated on the overall cohort in this application.',
            studyInfo: Object.freeze({
                reference: "Koh et al., Int J Radiat Oncol Biol Phys (2008)",
                patientCohort: "Original study: N=25 (all nCRT, 'poor-risk'). Application in this tool: Overall cohort.",
                investigationType: "Before and after nCRT (original accuracy analysis post-nCRT)",
                focus: "Originally: Assessment of LNs before and after nCRT using morphology. In this tool: Comparability with Avocado Sign in the overall cohort.",
                keyCriteriaSummary: "Irregular border OR heterogeneous signal."
            })
        }),
        Object.freeze({
            id: 'barbaro_2024_restaging',
            name: 'Barbaro et al. (2024)',
            displayShortName: 'Barbaro et al.',
            context: 'Restaging after nCRT',
            applicableCohort: 'nRCT',
            criteria: Object.freeze({
                size: Object.freeze({ active: true, threshold: 2.3, condition: '>=' }),
                shape: Object.freeze({ active: false, value: null }),
                border: Object.freeze({ active: false, value: null }),
                homogeneity: Object.freeze({ active: false, value: null }),
                signal: Object.freeze({ active: false, value: null })
            }),
            logic: 'ODER',
            description: 'Barbaro et al. (2024): Optimal cut-off for short axis in restaging after nCRT: ≥ 2.3mm (original 2.2mm).',
             studyInfo: Object.freeze({
                reference: "Barbaro et al., Radiother Oncol (2024)",
                patientCohort: "N=191 (all nCRT, LARC)",
                investigationType: "Restaging after nCRT",
                focus: "MRI assessment of N-status after nCRT using size (optimal cut-off).",
                keyCriteriaSummary: "Short axis ≥ 2.3 mm (based on study: 2.2mm)."
            })
        })
    ]);

    function formatCriteriaForDisplay(criteria, logic = null, shortFormat = false) {
        if (!criteria || typeof criteria !== 'object') return 'N/A';
        const parts = [];
        const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);
        if (activeKeys.length === 0) return 'No active criteria';

        const formatValue = (key, criterion, isShort) => {
            if (!criterion) return '?';
            if (key === 'size') {
                const formattedThreshold = formatNumber(criterion.threshold, 1, '?');
                const prefix = isShort ? 'Size' : 'Size';
                return `${prefix} ${criterion.condition || '>='} ${formattedThreshold}mm`;
            }
            let value = criterion.value || '?';
            if (isShort) {
                switch (value) {
                    case 'irregulär': value = 'irreg.'; break;
                    case 'scharf': value = 'smooth'; break;
                    case 'heterogen': value = 'heterog.'; break;
                    case 'homogen': value = 'homog.'; break;
                    case 'signalarm': value = 'low sig.'; break;
                    case 'intermediär': value = 'int. sig.'; break;
                    case 'signalreich': value = 'high sig.'; break;
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
        const sortedActiveKeys = [...activeKeys].sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));

        sortedActiveKeys.forEach(key => {
             parts.push(formatValue(key, criteria[key], shortFormat));
        });

        const effectiveLogic = logic || criteria.logic || 'OR';
        if (effectiveLogic === 'KOMBINIERT') {
             const studySet = studyCriteriaSets.find(s => s.logic === 'KOMBINIERT' && s.criteria.size.threshold === criteria.size.threshold);
             if (studySet?.description) {
                 return shortFormat ? (studySet.displayShortName || studySet.name) : studySet.description;
             }
             return criteria.note || 'Combined ESGAR Logic (see original publication for details)';
        }
        const separator = (effectiveLogic === 'AND') ? ' AND ' : ' OR ';
        if (shortFormat && parts.length > 2) {
             return parts.slice(0, 2).join(separator) + ' ...';
        }
        return parts.join(separator);
    }

    function getAllStudyCriteriaSets() {
        return cloneDeep(studyCriteriaSets);
    }

    function getStudyCriteriaSetById(id) {
        if (typeof id !== 'string') return null;
        const foundSet = studyCriteriaSets.find(set => set.id === id);
        return foundSet ? cloneDeep(foundSet) : null;
    }

    function _checkSingleNodeESGAR(lymphNode, criteria) {
        const checkResult = {
             size: null, shape: null, border: null, homogeneity: null, signal: null,
             esgarCategory: 'N/A', esgarMorphologyCount: 0, isPositive: false
        };
        if (!lymphNode || !criteria) return checkResult;

        const nodeSize = (typeof lymphNode.size === 'number' && !isNaN(lymphNode.size)) ? lymphNode.size : -1;
        const hasRoundShape = lymphNode.shape === criteria.shape?.value;
        const hasIrregularBorder = lymphNode.border === criteria.border?.value;
        const hasHeterogeneousSignal = lymphNode.homogeneity === criteria.homogeneity?.value;

        let morphologyCount = 0;
        if (criteria.shape?.active && hasRoundShape) morphologyCount++;
        if (criteria.border?.active && hasIrregularBorder) morphologyCount++;
        if (criteria.homogeneity?.active && hasHeterogeneousSignal) morphologyCount++;

        checkResult.size_val = nodeSize >= 0 ? nodeSize : null;
        checkResult.shape_val = lymphNode.shape;
        checkResult.border_val = lymphNode.border;
        checkResult.homogeneity_val = lymphNode.homogeneity;
        checkResult.signal_val = lymphNode.signal;

        checkResult.size = (criteria.size?.active && nodeSize >= (criteria.size.threshold || 9.0));
        checkResult.shape = (criteria.shape?.active && hasRoundShape);
        checkResult.border = (criteria.border?.active && hasIrregularBorder);
        checkResult.homogeneity = (criteria.homogeneity?.active && hasHeterogeneousSignal);
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
        if (criteria.signal?.active) checkResult.signal = (lymphNode.signal === criteria.signal.value);
        return checkResult;
    }

    function evaluatePatientWithStudyCriteria(patient, studyCriteriaSet) {
        const defaultReturn = { t2Status: null, positiveNodeCount: 0, evaluatedNodes: [] };
        if (!patient || !studyCriteriaSet) return defaultReturn;
        const lymphNodes = patient.t2Nodes;
        if (!Array.isArray(lymphNodes)) {
             return { t2Status: (Object.keys(studyCriteriaSet.criteria).filter(k => studyCriteriaSet.criteria[k]?.active).length > 0) ? '-' : null, positiveNodeCount: 0, evaluatedNodes: [] };
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
            let checkResult = null;
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
