const analysisTab = (() => {

    function createAnalysisTableHTML(data, sortState, appliedCriteria, appliedLogic) {
        if (!Array.isArray(data)) return '<p class="text-danger">Error: Invalid data for analysis table.</p>';
        const tableId = 'analysis-table';
        const columns = [
            { key: 'id', label: 'ID', tooltipKey: 'nr' },
            { key: 'name', label: 'Name', tooltipKey: 'name' },
            { key: 'therapy', label: 'Therapy', tooltipKey: 'therapy' },
            { key: 'status', label: 'N/AS/T2', tooltipKey: 'n_as_t2', subKeys: [{key: 'nStatus', label: 'N'}, {key: 'asStatus', label: 'AS'}, {key: 't2Status', label: 'T2'}]},
            { key: 'countPathologyNodes', label: 'N+/N total', tooltipKey: 'n_counts', textAlign: 'center' },
            { key: 'countASNodes', label: 'AS+/AS total', tooltipKey: 'as_counts', textAlign: 'center' },
            { key: 'countT2Nodes', label: 'T2+/T2 total', tooltipKey: 't2_counts', textAlign: 'center' },
            { key: 'details', label: '', width: '30px', tooltipKey: 'expandRow'}
        ];

        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let thStyle = col.width ? `style="width: ${col.width};"` : '';
            if (col.textAlign) thStyle += ` text-align: ${col.textAlign};`;
            let activeSubKey = null;

            if (sortState && sortState.key === col.key) {
                if (col.subKeys && col.subKeys.some(sk => sk.key === sortState.subKey)) {
                    activeSubKey = sortState.subKey;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                } else if (!col.subKeys) {
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                }
            }
            
            const baseTooltipContent = UI_TEXTS.tooltips.analysisTab[col.tooltipKey] || col.label;
            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                const isActiveSubSort = activeSubKey === sk.key;
                const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="Sort by Status ${sk.label}">${sk.label}</span>`;
            }).join(' / ') : '';
            
            const mainTooltip = col.subKeys ? `${baseTooltipContent}` : `Sort by ${col.label}.`;
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            
            headerHTML += `<th scope="col" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle ? `style="${thStyle}"`: ''}>${col.label}${subHeaders ? ` (${subHeaders})` : ''} ${col.key !== 'details' ? sortIconHTML : ''}</th>`;
        });
        headerHTML += `</tr></thead>`;

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">${headerHTML}<tbody id="${tableId}-body">`;
        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">No patients found in the selected cohort.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += tableRenderer.createAnalysisTableRow(patient, appliedCriteria, appliedLogic);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function createAnalysisTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
        const tableHTML = createAnalysisTableHTML(data, sortState, appliedCriteria, appliedLogic);
        const toggleButtonTooltip = UI_TEXTS.tooltips.analysisTab.expandAll || 'Toggle detail views for all patients.';
        return `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>Patient Overview & Analysis Results (based on applied T2 criteria)</span>
                    <button id="analysis-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${toggleButtonTooltip}">
                       Expand All Details <i class="fas fa-chevron-down ms-1"></i>
                   </button>
                </div>
                <div class="card-body p-0">
                    <div id="analysis-table-container" class="table-responsive">
                       ${tableHTML}
                    </div>
                </div>
            </div>`;
    }

    function renderDashboardCharts(stats) {
        const ids = ['chart-dash-age', 'chart-dash-gender', 'chart-dash-therapy', 'chart-dash-status-n', 'chart-dash-status-as', 'chart-dash-status-t2'];
        if (!stats || stats.patientCount === 0) {
            ids.forEach(id => uiManager.updateElementHTML(id, '<p class="text-muted small text-center p-2">N/A</p>'));
            return;
        }
        const histOpts = { height: 130, margin: { top: 5, right: 10, bottom: 25, left: 35 }, useCompactMargins: true };
        const pieOpts = { height: 130, margin: { top: 5, right: 5, bottom: 35, left: 5 }, innerRadiusFactor: 0.45, fontSize: '8px', useCompactMargins: true, legendBelow: true };
        const genderData = [{label: UI_TEXTS.legendLabels.male, value: stats.sex?.m ?? 0}, {label: UI_TEXTS.legendLabels.female, value: stats.sex?.f ?? 0}];
        if(stats.sex?.unknown > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: stats.sex.unknown });
        const therapyData = [{label: UI_TEXTS.legendLabels.direktOP, value: stats.therapy?.['direkt OP'] ?? 0}, {label: UI_TEXTS.legendLabels.nRCT, value: stats.therapy?.nRCT ?? 0}];
        
        try {
            chartRenderer.renderAgeDistributionChart(stats.ageData || [], ids[0], histOpts);
            chartRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length});
            chartRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.nPositive, value: stats.nStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels.nNegative, value: stats.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.asPositive, value: stats.asStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels.asNegative, value: stats.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.t2Positive, value: stats.t2Status?.plus ?? 0}, {label: UI_TEXTS.legendLabels.t2Negative, value: stats.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2});
        }
        catch(error) { ids.forEach(id => uiManager.updateElementHTML(id, '<p class="text-danger small text-center p-2">Chart Error</p>')); }
    }

    function render(data, currentCriteria, currentLogic, sortState, currentCohort, bfWorkerAvailable, currentCohortStats, bruteForceResultForCohort) {
        if (!data || !currentCriteria || !currentLogic) throw new Error("Data or criteria for Analysis Tab not available.");
        const criteriaControlsHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic);
        const analysisTableCardHTML = createAnalysisTableCardHTML(data, sortState, currentCriteria, currentLogic);

        const dashboardContainerId = 'analysis-dashboard';
        const metricsOverviewContainerId = 't2-metrics-overview';
        const bruteForceCardContainerId = 'brute-force-card-container';

        let finalHTML = `
            <div class="row g-2 mb-3" id="${dashboardContainerId}"><div class="col-12"><p class="text-muted text-center small p-3">Loading Dashboard...</p></div></div>
            <div class="row g-4">
                <div class="col-12">${criteriaControlsHTML}</div>
                <div class="col-12 mb-3" id="${metricsOverviewContainerId}"></div>
                <div class="col-12" id="${bruteForceCardContainerId}"></div>
                <div class="col-12">${analysisTableCardHTML}</div>
            </div>`;

        setTimeout(() => {
            const stats = statisticsService.calculateDescriptiveStats(data);
            const dashboardContainer = document.getElementById(dashboardContainerId);
            if (dashboardContainer) {
                if (!stats || stats.patientCount === 0) {
                    uiManager.updateElementHTML(dashboardContainerId, '<div class="col-12"><p class="text-muted text-center small p-3">No data for dashboard.</p></div>');
                } else {
                    const dlBtns = (baseId, title) => [{id:`dl-${baseId}-png`, icon: 'fa-image', tooltip: `Download '${title}' as PNG`, format:'png', chartId: baseId, chartName: title}, {id:`dl-${baseId}-svg`, icon: 'fa-file-code', tooltip: `Download '${title}' as SVG`, format:'svg', chartId: baseId, chartName: title}];
                    dashboardContainer.innerHTML = `
                        ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.ageDistribution, `<p class="mb-0 small">Median: ${formatNumber(stats.age?.median, 1)} (${formatNumber(stats.age?.min, 0)} - ${formatNumber(stats.age?.max, 0)})</p>`, 'chart-dash-age', '', '', 'p-1', dlBtns('chart-dash-age', UI_TEXTS.chartTitles.ageDistribution))}
                        ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.genderDistribution, `<p class="mb-0 small">M: ${stats.sex?.m ?? 0} F: ${stats.sex?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', dlBtns('chart-dash-gender', UI_TEXTS.chartTitles.genderDistribution))}
                        ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.therapyDistribution, `<p class="mb-0 small">Upfront: ${stats.therapy?.['direkt OP'] ?? 0} nRCT: ${stats.therapy?.nRCT ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', dlBtns('chart-dash-therapy', UI_TEXTS.chartTitles.therapyDistribution))}
                        ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusN, `<p class="mb-0 small">N+: ${stats.nStatus?.plus ?? 0} N-: ${stats.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', dlBtns('chart-dash-status-n', UI_TEXTS.chartTitles.statusN))}
                        ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusAS, `<p class="mb-0 small">AS+: ${stats.asStatus?.plus ?? 0} AS-: ${stats.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', dlBtns('chart-dash-as', UI_TEXTS.chartTitles.statusAS))}
                        ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusT2, `<p class="mb-0 small">T2+: ${stats.t2Status?.plus ?? 0} T2-: ${stats.t2Status?.minus ?? 0}</p>`, 'chart-dash-t2', '', '', 'p-1', dlBtns('chart-dash-t2', UI_TEXTS.chartTitles.statusT2))}
                    `;
                    renderDashboardCharts(stats);
                }
            }

            const metricsOverviewContainer = document.getElementById(metricsOverviewContainerId);
            if(metricsOverviewContainer) {
                if (currentCohortStats && currentCohortStats.performanceT2Applied) {
                    const statsT2 = currentCohortStats.performanceT2Applied;
                    const fCI = (m, d=1, p=true) => {
                        const digits = (m?.name === 'auc') ? 2 : ((m?.name === 'f1') ? 3 : d);
                        return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, p, '--');
                    };
                    const na = '--';

                    const metricsHtml = `
                        <div class="table-responsive">
                            <table class="table table-sm small mb-0 table-striped">
                                <thead>
                                    <tr>
                                        <th>Metric</th>
                                        <th>Value (95% CI)</th>
                                        <th>CI Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>Sensitivity</td><td>${fCI(statsT2.sens, 1, true)}</td><td>${statsT2.sens?.method || na}</td></tr>
                                    <tr><td>Specificity</td><td>${fCI(statsT2.spec, 1, true)}</td><td>${statsT2.spec?.method || na}</td></tr>
                                    <tr><td>PPV</td><td>${fCI(statsT2.ppv, 1, true)}</td><td>${statsT2.ppv?.method || na}</td></tr>
                                    <tr><td>NPV</td><td>${fCI(statsT2.npv, 1, true)}</td><td>${statsT2.npv?.method || na}</td></tr>
                                    <tr><td>Accuracy</td><td>${fCI(statsT2.acc, 1, true)}</td><td>${statsT2.acc?.method || na}</td></tr>
                                    <tr><td>Balanced Accuracy</td><td>${fCI(statsT2.balAcc, 1, true)}</td><td>${statsT2.balAcc?.method || na}</td></tr>
                                    <tr><td>F1-Score</td><td>${fCI(statsT2.f1, 3, false)}</td><td>${statsT2.f1?.method || na}</td></tr>
                                    <tr><td>AUC</td><td>${fCI(statsT2.auc, 2, false)}</td><td>${statsT2.auc?.method || na}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                    uiManager.updateElementHTML(metricsOverviewContainer.id, uiComponents.createStatisticsCard(
                        't2-metrics-overview-card',
                        'Diagnostic Performance (Applied T2)',
                        metricsHtml,
                        false,
                        't2MetricsOverview',
                        [{id: 'dl-t2-metrics-overview-png', icon: 'fa-image', format: 'png', tableId: 't2-metrics-overview-card-content table', tableName: `T2_Metrics_Overview_${getCohortDisplayName(currentCohort).replace(/\s+/g, '_')}`}],
                        't2-metrics-overview-card-content table'
                    ));
                } else {
                    uiManager.updateElementHTML(metricsOverviewContainer.id, `<div class="col-12"><div class="alert alert-info small p-2">No diagnostic performance data available for current T2 criteria in cohort '${getCohortDisplayName(currentCohort)}'. Apply criteria or check data.</div></div>`);
                }
            }
            
            const bruteForceCardContainer = document.getElementById(bruteForceCardContainerId);
            if(bruteForceCardContainer) {
                 uiManager.updateBruteForceUI(bruteForceManager.isRunning() ? 'progress' : 'initial', bruteForceResultForCohort, bfWorkerAvailable, currentCohort);
            }

            const tableBody = document.getElementById('analysis-table-body');
            const tableHeader = document.getElementById('analysis-table-header');
            if (tableBody && data.length > 0) uiManager.attachRowCollapseListeners(tableBody.id);
            if (tableHeader) uiManager.updateSortIcons(tableHeader.id, sortState);
            uiManager.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
            uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }, 10);

        return finalHTML;
    }

    return {
        render
    };
})();
