const tableRenderer = (() => {

    function _createDataDetailRowContent(patient) {
        if (!Array.isArray(patient.t2Nodes) || patient.t2Nodes.length === 0) {
            return '<p class="m-0 p-2 text-muted small">No T2-weighted lymph nodes recorded for this patient.</p>';
        }

        let content = '<h6 class="w-100 mb-2 ps-1">T2 Lymph Node Features:</h6>';
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

            content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small">
                           <strong class="me-2">LN ${index + 1}:</strong>
                           <span class="me-2 text-nowrap" data-tippy-key="t2Criteria.size">${sizeIcon}${sizeText !== 'N/A' ? sizeText + 'mm' : sizeText}</span>
                           <span class="me-2 text-nowrap" data-tippy-key="t2Criteria.shape">${shapeIcon}${shapeText}</span>
                           <span class="me-2 text-nowrap" data-tippy-key="t2Criteria.border">${borderIcon}${borderText}</span>
                           <span class="me-2 text-nowrap" data-tippy-key="t2Criteria.homogeneity">${homogeneityIcon}${homogeneityText}</span>
                           <span class="me-2 text-nowrap" data-tippy-key="t2Criteria.signal">${signalIcon}${signalText}</span>
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
        
        const t2StatusClass = patient.t2Status === '+' ? 'plus' : patient.t2Status === '-' ? 'minus' : 'unknown';

        return `
            <tr id="${rowId}" ${hasT2Nodes ? `class="clickable-row"` : ''} ${hasT2Nodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="ID">${patient.id}</td>
                <td data-label="Last Name">${patient.lastName || naPlaceholder}</td>
                <td data-label="First Name">${patient.firstName || naPlaceholder}</td>
                <td data-label="Sex">${sexText}</td>
                <td data-label="Age">${formatNumber(patient.age, 0, naPlaceholder)}</td>
                <td data-label="Therapy">${therapyText}</td>
                <td data-label="N/AS/T2">
                    <span class="status-${patient.nStatus === '+' ? 'plus' : 'minus'}" data-tippy-key="dataTab.n_as_t2_n">${patient.nStatus ?? '?'}</span> /
                    <span class="status-${patient.asStatus === '+' ? 'plus' : 'minus'}" data-tippy-key="dataTab.n_as_t2_as">${patient.asStatus ?? '?'}</span> /
                    <span class="status-${t2StatusClass}" id="status-t2-pat-${patient.id}" data-tippy-key="dataTab.n_as_t2_t2">${patient.t2Status ?? '?'}</span>
                </td>
                <td data-label="Notes" class="text-truncate" style="max-width: 150px;" data-tippy-content="${notesText || 'No additional notes.'}">${notesText || naPlaceholder}</td>
                <td class="text-center p-1" style="width: 30px;" data-tippy-key="dataTab.expandRow" data-tippy-content="${hasT2Nodes ? 'Toggle Details' : 'No T2 lymph node details available'}">
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

        let content = `<h6 class="w-100 mb-2 ps-1" data-tippy-key="analysisTab.expandRow_title">T2 LN Evaluation (Logic: ${APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[appliedLogic] || appliedLogic || 'N/A'}, Criteria: ${criteriaFormatted || 'N/A'})</h6>`;

        patient.t2NodesEvaluated.forEach((lk, index) => {
            if (!lk || !lk.checkResult) {
                content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small fst-italic text-muted">LN ${index + 1}: Invalid evaluation data</div>`;
                return;
            }

            const baseClass = "sub-row-item border rounded mb-1 p-1 w-100 align-items-center small";
            const highlightClass = lk.isPositive ? 'bg-status-red-light' : '';
            const posBadge = `<span class="badge bg-danger text-white ms-1" data-tippy-key="analysisTab.expandRow_posBadge">Pos.</span>`;
            const negBadge = `<span class="badge bg-success text-white ms-1" data-tippy-key="analysisTab.expandRow_negBadge">Neg.</span>`;
            let itemContent = `<strong class="me-2">LN ${index + 1}: ${lk.isPositive ? posBadge : negBadge}</strong>`;

            const formatCriterionCheck = (key, iconType, originalValueInLK, checkResultForLK) => {
                const criterionActive = appliedCriteria?.[key]?.active;
                if (!criterionActive) return '';

                const checkMet = checkResultForLK[key] === true;
                const hlClass = (lk.isPositive && checkMet) ? 'highlight-suspect-feature' : '';
                const icon = getT2IconSVG(iconType || key, originalValueInLK);
                const text = key === 'size' ? `${formatNumber(originalValueInLK, 1, 'N/A')}mm` : (originalValueInLK || naPlaceholder);
                
                const statusText = checkMet ? 'Fulfilled' : (checkResultForLK[key] === false ? 'Not Fulfilled' : 'Not Applicable');
                const description = getObjectValueByPath(APP_CONFIG.UI_TEXTS.tooltips, `t2Criteria.${key}.description`) || `Feature ${key}`;
                const tooltipContent = `${description}<hr class='my-1 border-light opacity-25'>Evaluation Status: <strong>${statusText}</strong>`;

                return `<span class="me-2 text-nowrap ${hlClass}" data-tippy-content="${tooltipContent}">${icon} ${text}</span>`;
            };

            itemContent += formatCriterionCheck('size', 'size', lk.size, lk.checkResult);
            itemContent += formatCriterionCheck('shape', 'shape', lk.shape, lk.checkResult);
            itemContent += formatCriterionCheck('border', 'border', lk.border, lk.checkResult);
            itemContent += formatCriterionCheck('homogeneity', 'homogeneity', lk.homogeneity, lk.checkResult);
            itemContent += formatCriterionCheck('signal', 'signal', lk.signal, lk.checkResult);

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
        
        const t2StatusClass = patient.t2Status === '+' ? 'plus' : patient.t2Status === '-' ? 'minus' : 'unknown';

        return `
            <tr id="${rowId}" ${hasEvaluatedNodes ? `class="clickable-row"` : ''} ${hasEvaluatedNodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="ID">${patient.id}</td>
                <td data-label="Name">${patient.lastName || naPlaceholder}</td>
                <td data-label="Therapy">${therapyText}</td>
                <td data-label="N/AS/T2">
                    <span class="status-${patient.nStatus === '+' ? 'plus' : 'minus'}" data-tippy-key="analysisTab.n_as_t2_n">${patient.nStatus ?? '?'}</span> /
                    <span class="status-${patient.asStatus === '+' ? 'plus' : 'minus'}" data-tippy-key="analysisTab.n_as_t2_as">${patient.asStatus ?? '?'}</span> /
                    <span class="status-${t2StatusClass}" id="status-t2-analysis-${patient.id}" data-tippy-key="analysisTab.n_as_t2_t2">${patient.t2Status ?? '?'}</span>
                </td>
                <td data-label="N+/N total" class="text-center" data-tippy-key="analysisTab.n_counts">${nCountsText}</td>
                <td data-label="AS+/AS total" class="text-center" data-tippy-key="analysisTab.as_counts">${asCountsText}</td>
                <td data-label="T2+/T2 total" class="text-center" id="t2-counts-${patient.id}" data-tippy-key="analysisTab.t2_counts">${t2CountsText}</td>
                <td class="text-center p-1" style="width: 30px;" data-tippy-key="analysisTab.expandRow" data-tippy-content="${hasEvaluatedNodes ? 'Toggle Evaluation Details' : 'No T2 node evaluation details available'}">
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
