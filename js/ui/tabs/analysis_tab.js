window.analysisTab = (() => {

    function createAnalysisTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
        const tableId = 'analysis-table';
        const columns = window.APP_CONFIG.TABLE_COLUMN_DEFINITIONS.ANALYSIS_TABLE_COLUMNS;
        const formattedCriteria = window.studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, true);
        const cardTitle = `Patient Overview & Analysis Results (Applied T2: ${formattedCriteria})`;

        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let thStyle = col.width ? `width: ${col.width};` : '';
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
            
            const baseTooltipContent = window.APP_CONFIG.UI_TEXTS.tooltips.analysisTab[col.tooltipKey] || `Sort by ${col.label}`;
            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                const isActiveSubSort = activeSubKey === sk.key;
                const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="Sort by Status ${sk.label}">${sk.label}</span>`;
            }).join(' / ') : '';
            
            const mainTooltip = col.subKeys ? `${baseTooltipContent}` : `Sort by ${col.label}. ${baseTooltipContent}`;
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            
            headerHTML += `<th scope="col" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle ? `style="${thStyle}"`: ''}>${col.label}${subHeaders ? ` (${subHeaders})` : ''} ${col.key !== 'details' ? sortIconHTML : ''}</th>`;
        });
        headerHTML += `</tr></thead>`;

        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">${headerHTML}<tbody id="${tableId}-body">`;
        if (!Array.isArray(data) || data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">No patients found in the selected cohort.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += window.tableRenderer.createAnalysisTableRow(patient, appliedCriteria, appliedLogic);
            });
        }
        tableHTML += `</tbody></table>`;
        
        const toggleButtonTooltip = window.APP_CONFIG.UI_TEXTS.tooltips.analysisTab.expandAll || 'Expand or collapse all details';
        return `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${cardTitle}</span>
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
        if (!stats || !stats.descriptive || stats.descriptive.patientCount === 0) {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '<p class="text-muted small text-center p-2">N/A</p>';
            });
            return;
        }
        const desc = stats.descriptive;
        const histOpts = { height: 130, margin: { top: 5, right: 10, bottom: 25, left: 35 }, useCompactMargins: true };
        const pieOpts = { height: 130, margin: { top: 5, right: 5, bottom: 35, left: 5 }, innerRadiusFactor: 0.45, fontSize: '8px', useCompactMargins: true, legendBelow: true };
        
        const genderData = [{label: window.APP_CONFIG.UI_TEXTS.legendLabels.male, value: desc.sex?.m ?? 0}, {label: window.APP_CONFIG.UI_TEXTS.legendLabels.female, value: desc.sex?.f ?? 0}];
        if(desc.sex?.unknown > 0) genderData.push({label: window.APP_CONFIG.UI_TEXTS.legendLabels.unknownGender, value: desc.sex.unknown });
        
        const therapyData = [
            {label: window.APP_CONFIG.UI_TEXTS.legendLabels.surgeryAlone, value: desc.therapy?.surgeryAlone ?? 0}, 
            {label: window.APP_CONFIG.UI_TEXTS.legendLabels.neoadjuvantTherapy, value: desc.therapy?.neoadjuvantTherapy ?? 0}
        ];
        
        try {
            window.chartRenderer.renderAgeDistributionChart(desc.ageData || [], ids[0], histOpts);
            window.chartRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length});
            window.chartRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length});
            window.chartRenderer.renderPieChart([{label: window.APP_CONFIG.UI_TEXTS.legendLabels.nPositive, value: desc.nStatus?.plus ?? 0}, {label: window.APP_CONFIG.UI_TEXTS.legendLabels.nNegative, value: desc.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2});
            window.chartRenderer.renderPieChart([{label: window.APP_CONFIG.UI_TEXTS.legendLabels.asPositive, value: desc.asStatus?.plus ?? 0}, {label: window.APP_CONFIG.UI_TEXTS.legendLabels.asNegative, value: desc.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2});
            window.chartRenderer.renderPieChart([{label: window.APP_CONFIG.UI_TEXTS.legendLabels.t2Positive, value: desc.t2Status?.plus ?? 0}, {label: window.APP_CONFIG.UI_TEXTS.legendLabels.t2Negative, value: desc.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2});
        }
        catch(error) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = '<p class="text-danger small text-center p-2">Chart Error</p>'; }); }
    }

    function render(data, currentCriteria, currentLogic, sortState, currentCohort, bfWorkerAvailable, currentCohortStats, allBruteForceResults) {
        if (!data || !currentCriteria || !currentLogic) throw new Error("Data or criteria for Analysis Tab not available.");
        
        const criteriaControlsHTML = window.uiComponents.createT2CriteriaControls(currentCriteria, currentLogic);
        const analysisTableCardHTML = createAnalysisTableCardHTML(data, sortState, window.t2CriteriaManager.getAppliedCriteria(), window.t2CriteriaManager.getAppliedLogic());

        const dashboardContainerId = 'analysis-dashboard';
        const metricsOverviewContainerId = 't2-metrics-overview';
        const bruteForceRunnerCardContainerId = 'brute-force-runner-card-container';
        const bruteForceOverviewCardContainerId = 'brute-force-overview-card-container';
        
        const stats = currentCohortStats;
        const cohortDisplayName = getCohortDisplayName(currentCohort);
        
        const metricSelectValue = document.getElementById('brute-force-metric')?.value || window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
        const bruteForceResultForCurrentCohortAndMetric = allBruteForceResults[currentCohort] ? allBruteForceResults[currentCohort][metricSelectValue] : null;

        let dashboardCardsHTML = '';
        if (stats && stats.descriptive && stats.descriptive.patientCount > 0) {
            const desc = stats.descriptive;
            const formattedAppliedT2 = window.studyT2CriteriaManager.formatCriteriaForDisplay(currentCriteria, currentLogic, true);
            const t2DashboardTitle = `T2-Status (${formattedAppliedT2})`;

            dashboardCardsHTML = `
                ${window.uiComponents.createDashboardCard(window.APP_CONFIG.UI_TEXTS.chartTitles.ageDistribution, `<p class="mb-0 small">Median: ${formatNumber(desc.age?.median, 1)} (${formatNumber(desc.age?.min, 0)} - ${formatNumber(desc.age?.max, 0)})</p>`, 'chart-dash-age', '', '', 'p-1', [], cohortDisplayName)}
                ${window.uiComponents.createDashboardCard(window.APP_CONFIG.UI_TEXTS.chartTitles.genderDistribution, `<p class="mb-0 small">M: ${desc.sex?.m ?? 0} F: ${desc.sex?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', [], cohortDisplayName)}
                ${window.uiComponents.createDashboardCard(window.APP_CONFIG.UI_TEXTS.chartTitles.therapyDistribution, `<p class="mb-0 small">Surgery alone: ${desc.therapy?.surgeryAlone ?? 0} Neoadjuvant therapy: ${desc.therapy?.neoadjuvantTherapy ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', [], cohortDisplayName)}
                ${window.uiComponents.createDashboardCard(window.APP_CONFIG.UI_TEXTS.chartTitles.statusN, `<p class="mb-0 small">N+: ${desc.nStatus?.plus ?? 0} N-: ${desc.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', [], cohortDisplayName)}
                ${window.uiComponents.createDashboardCard(window.APP_CONFIG.UI_TEXTS.chartTitles.statusAS, `<p class="mb-0 small">AS+: ${desc.asStatus?.plus ?? 0} AS-: ${desc.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', [], cohortDisplayName)}
                ${window.uiComponents.createDashboardCard(t2DashboardTitle, `<p class="mb-0 small">T2+: ${desc.t2Status?.plus ?? 0} T2-: ${desc.t2Status?.minus ?? 0}</p>`, 'chart-dash-status-t2', '', '', 'p-1', [], cohortDisplayName)}
            `;
        } else {
            dashboardCardsHTML = '<div class="col-12"><p class="text-muted text-center small p-3">No data for dashboard.</p></div>';
        }

        const bruteForceOverviewHTML = window.uiComponents.createStatisticsCard(
            'bf-overview-card',
            'Brute-Force Optima (Saved Results)',
            window.uiComponents.createBruteForceOverviewTableHTML(allBruteForceResults),
            false
        );

        const bfRunnerState = window.bruteForceManager.isRunning() ? 'progress' : 'initial';
        const bruteForceRunnerHTML = window.uiComponents.createBruteForceRunnerCardHTML(bfRunnerState, bruteForceResultForCurrentCohortAndMetric, bfWorkerAvailable, currentCohort, metricSelectValue);

        let metricsOverviewHTML = '';
        const evaluatedDataForPerf = window.t2CriteriaManager.evaluateDataset(data, currentCriteria, currentLogic);
        const statsT2 = window.statisticsService.calculateDiagnosticPerformance(evaluatedDataForPerf, 't2Status', 'nStatus');

        if (statsT2) {
            const fCI = (m, d=1, p=true) => {
                const digits = (m?.name === 'auc') ? 3 : ((m?.name === 'f1') ? 3 : d); 
                return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, digits, p, '--');
            };
            
            const formattedCurrentT2 = window.studyT2CriteriaManager.formatCriteriaForDisplay(currentCriteria, currentLogic, true);
            const perfCardTitle = `Diagnostic Performance (Current T2: ${formattedCurrentT2})`;

            const metricsTable = `
                <div class="table-responsive">
                    <table class="table table-sm small mb-0 table-striped">
                        <thead>
                            <tr>
                                <th data-tippy-content="${getDefinitionTooltip('sens')}">Sensitivity</th>
                                <th data-tippy-content="${getDefinitionTooltip('spec')}">Specificity</th>
                                <th data-tippy-content="${getDefinitionTooltip('ppv')}">PPV</th>
                                <th data-tippy-content="${getDefinitionTooltip('npv')}">NPV</th>
                                <th data-tippy-content="${getDefinitionTooltip('acc')}">Accuracy</th>
                                <th data-tippy-content="${getDefinitionTooltip('auc')}">AUC</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td data-tippy-content="${getInterpretationTooltip('sens', statsT2.sens)}">${fCI(statsT2.sens, 1, true)}</td>
                                <td data-tippy-content="${getInterpretationTooltip('spec', statsT2.spec)}">${fCI(statsT2.spec, 1, true)}</td>
                                <td data-tippy-content="${getInterpretationTooltip('ppv', statsT2.ppv)}">${fCI(statsT2.ppv, 1, true)}</td>
                                <td data-tippy-content="${getInterpretationTooltip('npv', statsT2.npv)}">${fCI(statsT2.npv, 1, true)}</td>
                                <td data-tippy-content="${getInterpretationTooltip('acc', statsT2.acc)}">${fCI(statsT2.acc, 1, true)}</td>
                                <td data-tippy-content="${getInterpretationTooltip('auc', statsT2.auc)}">${fCI(statsT2.auc, 3, false)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            metricsOverviewHTML = window.uiComponents.createStatisticsCard(
                't2-metrics-overview-card',
                perfCardTitle,
                metricsTable,
                false
            );
        } else {
            metricsOverviewHTML = `<div class="col-12"><div class="alert alert-info small p-2">No diagnostic performance data available for current T2 criteria in cohort '${getCohortDisplayName(currentCohort)}'. Apply criteria or check data.</div></div>`;
        }

        let finalHTML = `
            <div class="row g-2 mb-3" id="${dashboardContainerId}">${dashboardCardsHTML}</div>
            <div class="row g-4">
                <div class="col-12">${criteriaControlsHTML}</div>
                <div class="col-12" id="${metricsOverviewContainerId}">${metricsOverviewHTML}</div>
                <div class="col-lg-6" id="${bruteForceRunnerCardContainerId}">${bruteForceRunnerHTML}</div>
                <div class="col-lg-6" id="${bruteForceOverviewCardContainerId}">${bruteForceOverviewHTML}</div>
                <div class="col-12">${analysisTableCardHTML}</div>
            </div>`;

        setTimeout(() => {
            if (stats && stats.descriptive && stats.descriptive.patientCount > 0) {
                renderDashboardCharts(stats);
            }
            const tableBody = document.getElementById('analysis-table-body');
            const tableHeader = document.getElementById('analysis-table-header');
            if (tableBody && data.length > 0) window.uiManager.attachRowCollapseListeners(tableBody.id);
            if (tableHeader) window.uiManager.updateSortIcons(tableHeader.id, sortState);
        }, 10);

        return finalHTML;
    }

    return Object.freeze({
        render
    });
})();