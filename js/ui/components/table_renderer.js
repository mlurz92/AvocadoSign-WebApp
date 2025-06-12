const tableRenderer = (() => {

    function _createDataDetailRowContent(patient) {
        if (!Array.isArray(patient.t2Nodes) || patient.t2Nodes.length === 0) {
            return '<p class="m-0 p-2 text-muted small">No T2-weighted lymph nodes recorded for this patient.</p>';
        }

        // Tooltip for the general section header
        const headerTooltipContent = JSON.stringify({
            type: 'generic',
            description: "Details on individual T2-weighted lymph nodes found in this patient, including their morphological characteristics. These are raw findings, not an evaluation against specific criteria."
        });
        
        let content = `<h6 class="w-100 mb-2 ps-1" data-tippy-content='${headerTooltipContent}'>T2 Lymph Node Features:</h6>`;
        patient.t2Nodes.forEach((lk, index) => {
            if (!lk) return;
            const sizeText = formatNumber(lk.size, 1, 'N/A');
            const shapeText = lk.shape || '--';
            const borderText = lk.border || '--';
            const homogeneityText = lk.homogeneity || '--';
            const signalText = lk.signal || 'N/A';

            const shapeIcon = getT2IconSVG('shape', lk.shape);
            const borderIcon = getT2IconSVG('border', lk.border);
            const homogeneityIcon = getT2IconSVG('homogeneity', lk.homogeneity);
            const signalIcon = getT2IconSVG('signal', lk.signal);
            const sizeIcon = getT2IconSVG('size', null);

            // Tooltip content as JSON string for each feature
            const sizeTooltipContent = JSON.stringify({type: 't2CriterionGroup', key: 'size', description: APP_CONFIG.UI_TEXTS.tooltips.t2Size?.description || 'Size (short axis)'});
            const shapeTooltipContent = JSON.stringify({type: 't2CriterionGroup', key: 'shape', description: APP_CONFIG.UI_TEXTS.tooltips.t2Shape?.description || 'Shape'});
            const borderTooltipContent = JSON.stringify({type: 't2CriterionGroup', key: 'border', description: APP_CONFIG.UI_TEXTS.tooltips.t2Border?.description || 'Border'});
            const homogeneityTooltipContent = JSON.stringify({type: 't2CriterionGroup', key: 'homogeneity', description: APP_CONFIG.UI_TEXTS.tooltips.t2Homogeneity?.description || 'Homogeneity'});
            const signalTooltipContent = JSON.stringify({type: 't2CriterionGroup', key: 'signal', description: APP_CONFIG.UI_TEXTS.tooltips.t2Signal?.description || 'Signal Intensity'});

            content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small">
                           <strong class="me-2">LN ${index + 1}:</strong>
                           <span class="me-2 text-nowrap" data-tippy-content='${sizeTooltipContent}'>${sizeIcon}${sizeText !== 'N/A' ? sizeText + 'mm' : sizeText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content='${shapeTooltipContent}'>${shapeIcon}${shapeText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content='${borderTooltipContent}'>${borderIcon}${borderText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content='${homogeneityTooltipContent}'>${homogeneityIcon}${homogeneityText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content='${signalTooltipContent}'>${signalIcon}${signalText}</span>
                        </div>`;
        });
        return content;
    }

    function createDataTableRow(patient) {
        if (!patient || typeof patient.id !== 'number') return '';
        const rowId = `data-row-${patient.id}`;
        const detailRowId = `data-detail-${patient.id}`;
        const hasT2Nodes = Array.isArray(patient.t2Nodes) && patient.t2Nodes.length > 0;
        const sexText = patient.sex === 'm' ? 'Male' : patient.sex === 'f' ? 'Female' : 'Unknown';
        const therapyText = getCohortDisplayName(patient.therapy);
        const naPlaceholder = '--';
        
        const notesText = escapeHTML(patient.notes || '');
        // Tooltip for notes
        const notesTooltipContent = JSON.stringify({
            type: 'generic',
            description: notesText || (APP_CONFIG.UI_TEXTS.tooltips.dataTab?.notes || 'Additional notes')
        });

        const t2StatusClass = patient.t2Status === '+' ? 'plus' : patient.t2Status === '-' ? 'minus' : 'unknown';
        
        // Tooltip content as JSON string for status fields
        const nStatusTooltipContent = JSON.stringify({type: 'generic', description: 'N-Status (Histopathology Reference)'});
        const asStatusTooltipContent = JSON.stringify({type: 'generic', description: 'AS-Status (Avocado Sign Prediction)'});
        const t2StatusTooltipContent = JSON.stringify({type: 'generic', description: 'T2-Status (Prediction based on applied criteria)'});

        const expandRowTooltipContent = JSON.stringify({
            type: 'generic',
            description: hasT2Nodes ? (APP_CONFIG.UI_TEXTS.tooltips.dataTab?.expandRow || 'Toggle Details') : 'No T2 lymph node details available'
        });

        return `
            <tr id="${rowId}" ${hasT2Nodes ? `class="clickable-row"` : ''} ${hasT2Nodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="ID">${patient.id}</td>
                <td data-label="Last Name">${patient.lastName || naPlaceholder}</td>
                <td data-label="First Name">${patient.firstName || naPlaceholder}</td>
                <td data-label="Sex">${sexText}</td>
                <td data-label="Age">${formatNumber(patient.age, 0, naPlaceholder)}</td>
                <td data-label="Therapy">${therapyText}</td>
                <td data-label="N/AS/T2">
                    <span class="status-${patient.nStatus === '+' ? 'plus' : 'minus'}" data-tippy-content='${nStatusTooltipContent}'>${patient.nStatus ?? '?'}</span> /
                    <span class="status-${patient.asStatus === '+' ? 'plus' : 'minus'}" data-tippy-content='${asStatusTooltipContent}'>${patient.asStatus ?? '?'}</span> /
                    <span class="status-${t2StatusClass}" id="status-t2-pat-${patient.id}" data-tippy-content='${t2StatusTooltipContent}'>${patient.t2Status ?? '?'}</span>
                </td>
                <td data-label="Notes" class="text-truncate" style="max-width: 150px;" data-tippy-content='${notesTooltipContent}'>${notesText || naPlaceholder}</td>
                <td class="text-center p-1" style="width: 30px;" data-tippy-content='${expandRowTooltipContent}'>
                     ${hasT2Nodes ? '<button class="btn btn-sm btn-outline-secondary p-1 row-toggle-button" aria-label="Toggle Details"><i class="fas fa-chevron-down row-toggle-icon"></i></button>' : ''}
                </td>
            </tr>
            ${hasT2Nodes ? `
            <tr class="sub-row">
                 <td colspan="9" class="p-0 border-0">
                    <div class="collapse" id="${detailRowId}">
                        <div class="sub-row-content p-2 bg-light border-top border-bottom">
                            ${_createDataDetailRowContent(patient)}
                        </div>
                    </div>
                 </td>
            </tr>` : ''}
        `;
    }

    function _createAnalysisDetailRowContent(patient, appliedCriteria, appliedLogic) {
        if (!Array.isArray(patient.t2NodesEvaluated) || patient.t2NodesEvaluated.length === 0) {
            return '<p class="m-0 p-2 text-muted small">No T2 lymph nodes available for evaluation or evaluation not performed.</p>';
        }
        const criteriaFormatted = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, true);
        const naPlaceholder = '--';

        // Tooltip for the general section header
        const headerTooltipContent = JSON.stringify({
            type: 'generic',
            description: "Shows the evaluation of each T2 lymph node based on the currently applied criteria. Fulfilled criteria contributing to a positive evaluation are highlighted. Logic: " + (APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[appliedLogic] || appliedLogic || 'N/A') + ", Criteria: " + (criteriaFormatted || 'N/A')
        });

        let content = `<h6 class="w-100 mb-2 ps-1" data-tippy-content='${headerTooltipContent}'>T2 LN Evaluation (Logic: ${APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[appliedLogic] || appliedLogic || 'N/A'}, Criteria: ${criteriaFormatted || 'N/A'})</h6>`;

        patient.t2NodesEvaluated.forEach((lk, index) => {
            if (!lk || !lk.checkResult) {
                content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small fst-italic text-muted">LN ${index + 1}: Invalid evaluation data</div>`;
                return;
            }

            const baseClass = "sub-row-item border rounded mb-1 p-1 w-100 align-items-center small";
            const highlightClass = lk.isPositive ? 'bg-status-red-light' : '';
            
            // Tooltip for node status (Positive/Negative badge)
            const nodeStatusTooltipContent = JSON.stringify({
                type: 'generic',
                description: lk.isPositive ? 'This lymph node was evaluated as Positive based on the applied T2 criteria.' : 'This lymph node was evaluated as Negative based on the applied T2 criteria.'
            });

            let itemContent = `<strong class="me-2">LN ${index + 1}: ${lk.isPositive ? `<span class="badge bg-danger text-white ms-1" data-tippy-content='${nodeStatusTooltipContent}'>Pos.</span>` : `<span class="badge bg-success text-white ms-1" data-tippy-content='${nodeStatusTooltipContent}'>Neg.</span>`}</strong>`;

            const formatCriterionCheck = (key, iconType, valueText, checkResultForLK, originalValueInLK) => {
                const criterionActive = appliedCriteria?.[key]?.active;
                if (!criterionActive) return '';

                const checkResultKey = key;
                const checkMet = checkResultForLK[checkResultKey] === true;
                
                let hlClass = '';
                if (lk.isPositive && checkMet) {
                    hlClass = 'highlight-suspect-feature';
                }
                
                const icon = getT2IconSVG(iconType || key, originalValueInLK);
                const text = key === 'size' ? `${formatNumber(originalValueInLK, 1, 'N/A')}mm` : (originalValueInLK || naPlaceholder);
                
                // Tooltip content as JSON string for each criterion check
                const tooltipKey = 't2' + key.charAt(0).toUpperCase() + key.slice(1);
                const tooltipBase = APP_CONFIG.UI_TEXTS.tooltips[tooltipKey]?.description || `Feature ${key}`;
                const statusText = checkMet ? 'Fulfilled' : (checkResultForLK[checkResultKey] === false ? 'Not Fulfilled' : 'Not Applicable');
                const criterionCheckTooltipContent = JSON.stringify({
                    type: 't2CriterionCheck', // Specific type for individual criterion check
                    key: key,
                    status: statusText,
                    originalValue: originalValueInLK,
                    checkMet: checkMet,
                    description: `${tooltipBase} | Status: ${statusText}`
                });

                return `<span class="me-2 text-nowrap ${hlClass}" data-tippy-content='${criterionCheckTooltipContent}'>${icon} ${text}</span>`;
            };

            itemContent += formatCriterionCheck('size', 'size', lk.size, lk.checkResult, lk.size);
            itemContent += formatCriterionCheck('shape', 'shape', lk.shape, lk.checkResult, lk.shape);
            itemContent += formatCriterionCheck('border', 'border', lk.border, lk.checkResult, lk.border);
            itemContent += formatCriterionCheck('homogeneity', 'homogeneity', lk.homogeneity, lk.checkResult, lk.homogeneity);
            itemContent += formatCriterionCheck('signal', 'signal', lk.signal, lk.checkResult, lk.signal);

            content += `<div class="${baseClass} ${highlightClass}">${itemContent}</div>`;
        });
        return content;
    }

    function createAnalysisTableRow(patient, appliedCriteria, appliedLogic) {
        if (!patient || typeof patient.id !== 'number') return '';
        const rowId = `analysis-row-${patient.id}`;
        const detailRowId = `analysis-detail-${patient.id}`;
        const hasEvaluatedNodes = Array.isArray(patient.t2NodesEvaluated) && patient.t2NodesEvaluated.length > 0;
        const therapyText = getCohortDisplayName(patient.therapy);
        const naPlaceholder = '--';

        const nCountsText = `${formatNumber(patient.countPathologyNodesPositive, 0, '-')} / ${formatNumber(patient.countPathologyNodes, 0, '-')}`;
        const asCountsText = `${formatNumber(patient.countASNodesPositive, 0, '-')} / ${formatNumber(patient.countASNodes, 0, '-')}`;
        const t2CountsText = `${formatNumber(patient.countT2NodesPositive, 0, '-')} / ${formatNumber(patient.countT2Nodes, 0, '-')}`;
        
        // Tooltip content as JSON string for status fields
        const nStatusTooltipContent = JSON.stringify({type: 'generic', description: 'N-Status (Histopathology Reference)'});
        const asStatusTooltipContent = JSON.stringify({type: 'generic', description: 'AS-Status (Avocado Sign Prediction)'});
        const t2StatusTooltipContent = JSON.stringify({type: 'generic', description: 'T2-Status (Prediction based on applied criteria)'});

        // Tooltip content as JSON string for count fields
        const nCountsTooltipContent = JSON.stringify({type: 'generic', description: APP_CONFIG.UI_TEXTS.tooltips.analysisTab?.n_counts || 'Pathology Counts'});
        const asCountsTooltipContent = JSON.stringify({type: 'generic', description: APP_CONFIG.UI_TEXTS.tooltips.analysisTab?.as_counts || 'AS Counts'});
        const t2CountsTooltipContent = JSON.stringify({type: 'generic', description: APP_CONFIG.UI_TEXTS.tooltips.analysisTab?.t2_counts || 'T2 Counts'});
        
        const expandRowTooltipContent = JSON.stringify({
            type: 'generic',
            description: hasEvaluatedNodes ? (APP_CONFIG.UI_TEXTS.tooltips.analysisTab?.expandRow || 'Toggle Details') : 'No T2 node evaluation details available'
        });


        const t2StatusClass = patient.t2Status === '+' ? 'plus' : patient.t2Status === '-' ? 'minus' : 'unknown';

        return `
            <tr id="${rowId}" ${hasEvaluatedNodes ? `class="clickable-row"` : ''} ${hasEvaluatedNodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="ID">${patient.id}</td>
                <td data-label="Name">${patient.lastName || naPlaceholder}</td>
                <td data-label="Therapy">${therapyText}</td>
                <td data-label="N/AS/T2">
                    <span class="status-${patient.nStatus === '+' ? 'plus' : 'minus'}" data-tippy-content='${nStatusTooltipContent}'>${patient.nStatus ?? '?'}</span> /
                    <span class="status-${patient.asStatus === '+' ? 'plus' : 'minus'}" data-tippy-content='${asStatusTooltipContent}'>${patient.asStatus ?? '?'}</span> /
                    <span class="status-${t2StatusClass}" id="status-t2-analysis-${patient.id}" data-tippy-content='${t2StatusTooltipContent}'>${patient.t2Status ?? '?'}</span>
                </td>
                <td data-label="N+/N total" class="text-center" data-tippy-content='${nCountsTooltipContent}'>${nCountsText}</td>
                <td data-label="AS+/AS total" class="text-center" data-tippy-content='${asCountsTooltipContent}'>${asCountsText}</td>
                <td data-label="T2+/T2 total" class="text-center" id="t2-counts-${patient.id}" data-tippy-content='${t2CountsTooltipContent}'>${t2CountsText}</td>
                <td class="text-center p-1" style="width: 30px;" data-tippy-content='${expandRowTooltipContent}'>
                     ${hasEvaluatedNodes ? '<button class="btn btn-sm btn-outline-secondary p-1 row-toggle-button" aria-label="Toggle Details"><i class="fas fa-chevron-down row-toggle-icon"></i></button>' : ''}
                </td>
            </tr>
             ${hasEvaluatedNodes ? `
            <tr class="sub-row">
                 <td colspan="8" class="p-0 border-0">
                    <div class="collapse" id="${detailRowId}">
                        <div class="sub-row-content p-2 bg-light border-top border-bottom">
                           ${_createAnalysisDetailRowContent(patient, appliedCriteria, appliedLogic)}
                        </div>
                    </div>
                 </td>
            </tr>` : ''}
        `;
    }

    return Object.freeze({
        createDataTableRow,
        createAnalysisTableRow
    });
})();
