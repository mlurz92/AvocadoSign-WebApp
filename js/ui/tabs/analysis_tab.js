const analysisTab = (() => {

    function createAnalysisTableCardHTML(data, sortState, appliedCriteria, appliedLogic) {
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
            
            const baseTooltipContent = APP_CONFIG.UI_TEXTS.tooltips.analysisTab[col.tooltipKey] || `Sort by ${col.label}`;
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
                tableHTML += tableRenderer.createAnalysisTableRow(patient, appliedCriteria, appliedLogic);
            });
        }
        tableHTML += `</tbody></table>`;
        
        const toggleButtonTooltip = APP_CONFIG.UI_TEXTS.tooltips.analysisTab.expandAll || 'Expand or collapse all details';
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
        
        const genderData = [{label: APP_CONFIG.UI_TEXTS.legendLabels.male, value: stats.sex?.m ?? 0}, {label: APP_CONFIG.UI_TEXTS.legendLabels.female, value: stats.sex?.f ?? 0}];
        if(stats.sex?.unknown > 0) genderData.push({label: APP_CONFIG.UI_TEXTS.legendLabels.unknownGender, value: stats.sex.unknown });
        
        const therapyData = [
            {label: APP_CONFIG.UI_TEXTS.legendLabels.surgeryAlone, value: stats.therapy?.surgeryAlone ?? 0}, 
            {label: APP_CONFIG.UI_TEXTS.legendLabels.neoadjuvantTherapy, value: stats.therapy?.neoadjuvantTherapy ?? 0}
        ];
        
        try {
            chartRenderer.renderAgeDistributionChart(stats.ageData || [], ids[0], histOpts);
            chartRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length});
            chartRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length});
            chartRenderer.renderPieChart([{label: APP_CONFIG.UI_TEXTS.legendLabels.nPositive, value: stats.nStatus?.plus ?? 0}, {label: APP_CONFIG.UI_TEXTS.legendLabels.nNegative, value: stats.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: APP_CONFIG.UI_TEXTS.legendLabels.asPositive, value: stats.asStatus?.plus ?? 0}, {label: APP_CONFIG.UI_TEXTS.legendLabels.asNegative, value: stats.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: APP_CONFIG.UI_TEXTS.legendLabels.t2Positive, value: stats.t2Status?.plus ?? 0}, {label: APP_CONFIG.UI_TEXTS.legendLabels.t2Negative, value: stats.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2});
        }
        catch(error) { ids.forEach(id => uiManager.updateElementHTML(id, '<p class="text-danger small text-center p-2">Chart Error</p>')); }
    }

    function render(data, currentCriteria, currentLogic, sortState, currentCohort, bfWorkerAvailable, cohortStats, bruteForceResultForCohort) {
        if (!data || !currentCriteria || !currentLogic) throw new Error("Data or criteria for Analysis Tab not available.");
        const criteriaControlsHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic);
        const analysisTableCardHTML = createAnalysisTableCardHTML(data, sortState, currentCriteria, currentLogic);

        const dashboardContainerId = 'analysis-dashboard';
        const metricsOverviewContainerId = 't2-metrics-overview';
        const bruteForceCardContainerId = 'brute-force-card-container';

        const stats = cohortStats?.descriptive;
        const cohortDisplayName = getCohortDisplayName(currentCohort);

        let dashboardCardsHTML = '';
        if (stats && stats.patientCount > 0) {
            const dlBtns = (baseId, titleKey) => [{id:`dl-${baseId}-png`, icon: 'fa-image', tooltip: `Download '${APP_CONFIG.UI_TEXTS.chartTitles[titleKey]}' as PNG`, format:'png', chartId: baseId, chartName: APP_CONFIG.UI_TEXTS.chartTitles[titleKey]}, {id:`dl-${baseId}-svg`, icon: 'fa-file-code', tooltip: `Download '${APP_CONFIG.UI_TEXTS.chartTitles[titleKey]}' as SVG`, format:'svg', chartId: baseId, chartName: APP_CONFIG.UI_TEXTS.chartTitles[titleKey]}];
            
            dashboardCardsHTML = `
                ${uiComponents.createDashboardCard(APP_CONFIG.UI_TEXTS.chartTitles.ageDistribution, `<p class="mb-0 small">Median: ${formatNumber(stats.age?.median, 1)} (${formatNumber(stats.age?.min, 0)} - ${formatNumber(stats.age?.max, 0)})</p>`, 'chart-dash-age', '', '', 'p-1', dlBtns('chart-dash-age', 'ageDistribution'), cohortDisplayName)}
                ${uiComponents.createDashboardCard(APP_CONFIG.UI_TEXTS.chartTitles.genderDistribution, `<p class="mb-0 small">M: ${stats.sex?.m ?? 0} F: ${stats.sex?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', dlBtns('chart-dash-gender', 'genderDistribution'), cohortDisplayName)}
                ${uiComponents.createDashboardCard(APP_CONFIG.UI_TEXTS.chartTitles.therapyDistribution, `<p class="mb-0 small">Surgery alone: ${stats.therapy?.surgeryAlone ?? 0} Neoadjuvant therapy: ${stats.therapy?.neoadjuvantTherapy ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', dlBtns('chart-dash-therapy', 'therapyDistribution'), cohortDisplayName)}
                ${uiComponents.createDashboardCard(APP_CONFIG.UI_TEXTS.chartTitles.statusN, `<p class="mb-0 small">N+: ${stats.nStatus?.plus ?? 0} N-: ${stats.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', dlBtns('chart-dash-status-n', 'statusN'), cohortDisplayName)}
                ${uiComponents.createDashboardCard(APP_CONFIG.UI_TEXTS.chartTitles.statusAS, `<p class="mb-0 small">AS+: ${stats.asStatus?.plus ?? 0} AS-: ${stats.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', dlBtns('chart-dash-status-as', 'statusAS'), cohortDisplayName)}
                ${uiComponents.createDashboardCard(APP_CONFIG.UI_TEXTS.chartTitles.statusT2, `<p class="mb-0 small">T2+: ${stats.t2Status?.plus ?? 0} T2-: ${stats.t2Status?.minus ?? 0}</p>`, 'chart-dash-status-t2', '', '', 'p-1', dlBtns('chart-dash-status-t2', 'statusT2'), cohortDisplayName)}
            `;
        } else {
            dashboardCardsHTML = '<div class="col-12"><p class="text-muted text-center small p-3">No data for dashboard.</p></div>';
        }


        let finalHTML = `
            <div class="row g-2 mb-3" id="${dashboardContainerId}">${dashboardCardsHTML}</div>
            <div class="row g-4">
                <div class="col-12">${criteriaControlsHTML}</div>
                <div class="col-12 mb-3" id="${metricsOverviewContainerId}"></div>
                <div class="col-12" id="${bruteForceCardContainerId}"></div>
                <div class="col-12">${analysisTableCardHTML}</div>
            </div>`;

        setTimeout(() => {
            if (stats && stats.patientCount > 0) {
                renderDashboardCharts(stats);
            }

            const metricsOverviewContainer = document.getElementById(metricsOverviewContainerId);
            if(metricsOverviewContainer) {
                if (cohortStats && cohortStats.performanceT2Applied) {
                    const statsT2 = cohortStats.performanceT2Applied;
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
                                        <td data-tippy-content="${getInterpretationTooltip('auc', statsT2.auc)}">${fCI(statsT2.auc, 2, false)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                    uiManager.updateElementHTML(metricsOverviewContainer.id, uiComponents.createStatisticsCard(
                        't2-metrics-overview-card',
                        'Diagnostic Performance (Applied T2)',
                        metricsHtml,
                        false,
                        null,
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
