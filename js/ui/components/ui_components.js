const uiComponents = (() => {

    function createHeaderButtonHTML(buttons, targetId, defaultTitle = 'Element') {
        let headerButtonHtml = '';
        if (buttons && buttons.length > 0 && targetId) {
            headerButtonHtml = buttons.map(btn => {
                const btnId = btn.id || `dl-${targetId.replace(/[^a-zA-Z0-9_-]/g, '')}-${btn.format || 'action'}`;
                const iconClass = btn.icon || 'fa-download';
                let tooltip = btn.tooltip || `Download as ${String(btn.format || 'action').toUpperCase()}`;

                const safeDefaultTitle = String(defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const safeChartName = String(btn.chartName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const safeTableName = String(btn.tableName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);

                const dataAttributes = [];
                if (btn.chartId) dataAttributes.push(`data-chart-id="${btn.chartId}"`);
                if (btn.tableId) dataAttributes.push(`data-table-id="${btn.tableId}"`);
                if (btn.tableName) dataAttributes.push(`data-table-name="${safeTableName.replace(/\s/g, '_')}"`);
                else if (btn.chartId) dataAttributes.push(`data-chart-name="${safeChartName.replace(/\s/g, '_')}"`);
                else dataAttributes.push(`data-default-name="${safeDefaultTitle.replace(/\s/g, '_')}"`);
                if (btn.format) dataAttributes.push(`data-format="${btn.format}"`);

                return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 ${btn.tableId ? 'table-download-png-btn' : (btn.chartId ? 'chart-download-btn' : '')}" id="${btnId}" ${dataAttributes.join(' ')} data-tippy-content="${tooltip}"><i class="fas ${iconClass}"></i></button>`;
            }).join('');
        }
        return headerButtonHtml;
    }

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = [], cohortDisplayName = '') {
        const headerButtonHtml = createHeaderButtonHTML(downloadButtons, chartId || title.replace(/[^a-z0-9]/gi, '_'), title);
        const tooltipKey = chartId ? chartId.replace(/^chart-dash-/, '') : title.toLowerCase().replace(/\s+/g, '');
        let tooltipContent = UI_TEXTS.tooltips.descriptiveStatistics[tooltipKey]?.description || title || '';
        if (cohortDisplayName) {
            tooltipContent = tooltipContent.replace('[COHORT]', `<strong>${cohortDisplayName}</strong>`);
        }

        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses} d-flex justify-content-between align-items-center" data-tippy-content="${tooltipContent}">
                        <span class="text-truncate">${title}</span>
                        <span class="card-header-buttons flex-shrink-0 ps-1">${headerButtonHtml}</span>
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between ${bodyClasses}">
                        <div class="dashboard-card-content">${content}</div>
                        ${chartId ? `<div id="${chartId}" class="mt-1 w-100 dashboard-chart-container"></div>` : ''}
                    </div>
                </div>
            </div>`;
    }

    function createT2CriteriaControls(initialCriteria, initialLogic) {
        if (!initialCriteria || !initialLogic) return '<p class="text-danger">Error: Could not load initial criteria.</p>';
        const logicChecked = initialLogic === 'OR';
        const defaultCriteria = getDefaultT2Criteria();
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteria?.size?.threshold ?? 5.0;
        const { min, max, step } = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE;
        const formattedThreshold = formatNumber(sizeThreshold, 1, '5.0', true);

        const createButtonOptions = (key, isChecked, criterionLabel) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = uiManager.getT2IconSVG(key, value);
                const buttonTooltip = `Set criterion '${criterionLabel}' to '${value}'. ${isChecked ? '' : '(Criterion is currently inactive)'}`;
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
            }).join('');
        };

        const createCriteriaGroup = (key, label, tooltipKey, contentGenerator) => {
            const isChecked = initialCriteria[key]?.active === true;
            let tooltip = UI_TEXTS.tooltips[tooltipKey]?.description || label;
            if (tooltipKey === 't2Size') {
                tooltip = tooltip.replace('[MIN]', min).replace('[MAX]', max).replace('[STEP]', step);
            }
            return `
                <div class="col-md-6 criteria-group">
                    <div class="form-check mb-2">
                        <input class="form-check-input criteria-checkbox" type="checkbox" value="${key}" id="check-${key}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label fw-bold" for="check-${key}">${label}</label>
                         <span data-tippy-content="${tooltip}"> <i class="fas fa-info-circle text-muted ms-1"></i></span>
                    </div>
                    <div class="criteria-options-container ps-3">
                        ${contentGenerator(key, isChecked, label)}
                    </div>
                </div>`;
        };

        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>Define T2 Malignancy Criteria</span>
                    <div class="form-check form-switch" data-tippy-content="${UI_TEXTS.tooltips.t2Logic.description}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">Logic:</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', 'Size', 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${min}" max="${max}" step="${step}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} data-tippy-content="Set short-axis diameter threshold (≥).">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${min}" max="${max}" step="${step}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="Enter size manually" data-tippy-content="Enter threshold manually.">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', 'Shape', 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', 'Border', 't2Contour', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', 'Homogeneity', 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', 'Signal', 't2Signal', createButtonOptions)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${UI_TEXTS.tooltips.t2Actions.reset}">
                                <i class="fas fa-undo me-1"></i> Reset to Default
                            </button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${UI_TEXTS.tooltips.t2Actions.apply}">
                                <i class="fas fa-check me-1"></i> Apply & Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createStatisticsCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null, cohortId = '') {
        let cardTooltipHtml = `data-tippy-content="${title}"`;
        if (tooltipKey && UI_TEXTS.tooltips[tooltipKey]?.cardTitle) {
            let tooltipTemplate = UI_TEXTS.tooltips[tooltipKey].cardTitle;
            let cohortName = cohortId ? getCohortDisplayName(cohortId) : 'the current cohort';
            let finalTooltip = tooltipTemplate.replace('[COHORT]', `<strong>${cohortName}</strong>`);
            cardTooltipHtml = `data-tippy-content="${finalTooltip}"`;
        }
        
        const headerButtonHtml = createHeaderButtonHTML(downloadButtons, id + '-content', title);
        return `
            <div class="col-12 stat-card" id="${id}-card-container">
                <div class="card h-100">
                    <div class="card-header" ${cardTooltipHtml}>
                         ${title}
                         <span class="float-end card-header-buttons">${headerButtonHtml}</span>
                     </div>
                    <div class="card-body ${addPadding ? '' : 'p-0'}" style="overflow-y: auto; overflow-x: hidden;">
                        <div id="${id}-content">${content}</div>
                    </div>
                </div>
            </div>`;
    }

    function createPublicationNav(currentSectionId) {
        const navItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            const sectionTooltip = UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey;
            return `
                <li class="nav-item">
                    <a class="nav-link py-2 publication-section-link ${mainSection.id === currentSectionId ? 'active' : ''}" href="#" data-section-id="${mainSection.id}" data-tippy-content="${sectionTooltip}">
                        ${UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey]}
                    </a>
                </li>`;
        }).join('');
        return `<nav id="publication-sections-nav" class="nav flex-column nav-pills">${navItems}</nav>`;
    }

    function createBruteForceModalContent(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) {
            return '<p class="text-center text-muted">No brute-force results available.</p>';
        }

        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
        const { results, metric, duration, totalTested, cohort, nTotal, nPlus, nMinus } = resultsData;

        let html = `
            <div class="mb-4">
                <h5>Optimization Summary for Cohort: ${getCohortDisplayName(cohort)}</h5>
                <ul class="list-unstyled small mb-2">
                    <li><strong>Target Metric:</strong> ${metric}</li>
                    <li><strong>Total Combinations Tested:</strong> ${formatNumber(totalTested, 0)}</li>
                    <li><strong>Duration:</strong> ${formatNumber(duration / 1000, 1, true)} seconds</li>
                    <li><strong>Patient Count (N):</strong> ${formatNumber(nTotal, 0)} (N+: ${formatNumber(nPlus, 0)}, N-: ${formatNumber(nMinus, 0)})</li>
                </ul>
            </div>
            <h5>Top 10 Results:</h5>
            <div class="table-responsive">
                <table class="table table-sm table-striped small" id="bruteforce-results-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>${metric}</th>
                            <th>Logic</th>
                            <th>Criteria</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let rank = 1;
        let displayedCount = 0;
        let lastMetricValue = -Infinity;
        const precision = 8; 

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue;

            const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision));
            const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));

            let currentRank = rank;
            const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8;

            if (i > 0 && isNewRank) {
                rank = displayedCount + 1;
                currentRank = rank;
            } else if (i > 0) {
                currentRank = rank;
            }

            if (rank > 10 && isNewRank) break;

            html += `
                <tr>
                    <td>${currentRank}</td>
                    <td>${formatNumber(result.metricValue, 4, true)}</td>
                    <td>${result.logic.toUpperCase()}</td>
                    <td>${formatCriteriaFunc(result.criteria, result.logic)}</td>
                </tr>
            `;

            if (isNewRank || i === 0) {
                lastMetricValue = result.metricValue;
            }
            displayedCount++;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }


    return Object.freeze({
        createDashboardCard,
        createT2CriteriaControls,
        createStatisticsCard,
        createPublicationNav,
        createBruteForceModalContent
    });
})();
