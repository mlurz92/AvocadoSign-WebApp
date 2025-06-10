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
            const sizeIcon = getT2IconSVG('ruler-horizontal', null);

            const sizeTooltip = UI_TEXTS.tooltips.t2Size?.description || 'Size (short axis)';
            const shapeTooltip = UI_TEXTS.tooltips.t2Form?.description || 'Shape';
            const borderTooltip = UI_TEXTS.tooltips.t2Contour?.description || 'Border';
            const homogeneityTooltip = UI_TEXTS.tooltips.t2Homogenitaet?.description || 'Homogeneity';
            const signalTooltip = UI_TEXTS.tooltips.t2Signal?.description || 'Signal Intensity';

            content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small">
                           <strong class="me-2">LN ${index + 1}:</strong>
                           <span class="me-2 text-nowrap" data-tippy-content="${sizeTooltip}">${sizeIcon}${sizeText !== 'N/A' ? sizeText + 'mm' : sizeText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${shapeTooltip}">${shapeIcon}${shapeText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${borderTooltip}">${borderIcon}${borderText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${homogeneityTooltip}">${homogeneityIcon}${homogeneityText}</span>
                           <span class="me-2 text-nowrap" data-tippy-content="${signalTooltip}">${signalIcon}${signalText}</span>
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
        const tooltipNotes = notesText ? notesText : (UI_TEXTS.tooltips.dataTab.notes || 'Notes');

        const t2StatusClass = patient.t2Status === '+' ? 'plus' : patient.t2Status === '-' ? 'minus' : 'unknown';

        return `
            <tr id="${rowId}" ${hasT2Nodes ? `class="clickable-row"` : ''} ${hasT2Nodes ? `data-bs-toggle="collapse"` : ''} data-bs-target="#${detailRowId}" aria-expanded="false" aria-controls="${detailRowId}">
                <td data-label="ID">${patient.id}</td>
                <td data-label="Last Name">${patient.name || naPlaceholder}</td>
                <td data-label="First Name">${patient.firstName || naPlaceholder}</td>
                <td data-label="Sex">${sexText}</td>
                <td data-label="Age">${formatNumber(patient.age, 0, naPlaceholder)}</td>
                <td data-label="Therapy">${therapyText}</td>
                <td data-label="N/AS/T2">
                    <span class="status-${patient.nStatus === '+' ? 'plus' : 'minus'}" data-tippy-content="Pathology N-Status (Reference)">${patient.nStatus ?? '?'}</span> /
                    <span class="status-${patient.asStatus === '+' ? 'plus' : 'minus'}" data-tippy-content="Avocado Sign Status (Prediction)">${patient.asStatus ?? '?'}</span> /
                    <span class="status-${t2StatusClass}" id="status-t2-pat-${patient.id}" data-tippy-content="T2 Status (Prediction based on applied criteria)">${patient.t2Status ?? '?'}</span>
                </td>
                <td data-label="Notes" class="text-truncate" style="max-width: 150px;" data-tippy-content="${tooltipNotes}">${notesText || naPlaceholder}</td>
                <td class="text-center p-1" style="width: 30px;" data-tippy-content="${hasT2Nodes ? (UI_TEXTS.tooltips.dataTab.expandRow) : 'No T2 lymph node details available'}">
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
        const activeKeys = Object.keys(appliedCriteria || {}).filter(key => key !== 'logic' && appliedCriteria[key]?.active === true);
        const criteriaFormatted = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, true);
        const naPlaceholder = '--';

        let content = `<h6 class="w-100 mb-2 ps-1" data-tippy-content="Shows the evaluation of each T2 lymph node based on the currently applied criteria. Fulfilled criteria contributing to a positive evaluation are highlighted.">T2 LN Evaluation (Logic: ${UI_TEXTS.t2LogicDisplayNames[appliedLogic] || appliedLogic || 'N/A'}, Criteria: ${criteriaFormatted || 'N/A'})</h6>`;

        patient.t2NodesEvaluated.forEach((lk, index) => {
            if (!lk || !lk.checkResult) {
                content += `<div class="sub-row-item border rounded mb-1 p-1 w-100 align-items-center small fst-italic text-muted">LN ${index + 1}: Invalid evaluation data</div>`;
                return;
            }

            const baseClass = "sub-row-item border rounded mb-1 p-1 w-100 align-items-center small";
            const highlightClass = lk.isPositive ? 'bg-status-red-light' : '';
            let itemContent = `<strong class="me-2">LN ${index + 1}: ${lk.isPositive ? '<span class="badge bg-danger text-white ms-1" data-tippy-content="Evaluated as Positive">Pos.</span>' : '<span class="badge bg-success text-white ms-1" data-tippy-content="Evaluated as Negative">Neg.</span>'}</strong>`;

            const formatCriterionCheck = (key, iconType, valueText, checkResultForLK) => {
                if (!appliedCriteria?.[key]?.active) return '';
                const checkMet = checkResultForLK[key.replace('border','kontur').replace('homogeneity','homogenitaet').replace('shape','form')] === true;
                const checkFailed = checkResultForLK[key.replace('border','kontur').replace('homogeneity','homogenitaet').replace('shape','form')] === false;
                let hlClass = '';
                if (lk.isPositive && checkMet) {
                    hlClass = 'highlight-suspect-feature';
                }
                const icon = getT2IconSVG(iconType || key, valueText);
                const text = valueText || naPlaceholder;
                const tooltipKey = 't2' + key.charAt(0).toUpperCase() + key.slice(1);
                const tooltipBase = UI_TEXTS.tooltips[tooltipKey]?.description || `Feature ${key}`;
                const statusText = checkMet ? 'Fulfilled' : (checkFailed ? 'Not Fulfilled' : 'Not Applicable');
                const tooltip = `${tooltipBase} | Status: ${statusText}`;

                return `<span class="me-2 text-nowrap ${hlClass}" data-tippy-content="${tooltip}">${icon} ${text}</span>`;
            };

            itemContent += formatCriterionCheck('size', 'ruler-horizontal', `${formatNumber(lk.size, 1, 'N/A')}mm`, lk.checkResult);
            itemContent += formatCriterionCheck('shape', null, lk.shape, lk.checkResult);
            itemContent += formatCriterionCheck('border', null, lk.border, lk.checkResult);
            itemContent += formatCriterionCheck('homogeneity', null, lk.homogeneity, lk.checkResult);
            itemContent += formatCriterionCheck('signal', null, lk.signal || 'N/A', lk.checkResult);

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
                <td data-label="Name">${patient.name || naPlaceholder}</td>
                <td data-label="Therapy">${therapyText}</td>
                <td data-label="N/AS/T2">
                    <span class="status-${patient.nStatus === '+' ? 'plus' : 'minus'}" data-tippy-content="Pathology N-Status (Reference)">${patient.nStatus ?? '?'}</span> /
                    <span class="status-${patient.asStatus === '+' ? 'plus' : 'minus'}" data-tippy-content="Avocado Sign Status (Prediction)">${patient.asStatus ?? '?'}</span> /
                    <span class="status-${t2StatusClass}" id="status-t2-analysis-${patient.id}" data-tippy-content="T2 Status (Prediction based on applied criteria)">${patient.t2Status ?? '?'}</span>
                </td>
                <td data-label="N+/N total" class="text-center">${nCountsText}</td>
                <td data-label="AS+/AS total" class="text-center">${asCountsText}</td>
                <td data-label="T2+/T2 total" class="text-center" id="t2-counts-${patient.id}">${t2CountsText}</td>
                <td class="text-center p-1" style="width: 30px;" data-tippy-content="${hasEvaluatedNodes ? UI_TEXTS.tooltips.analysisTab.expandRow : 'No T2 node evaluation details available'}">
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
