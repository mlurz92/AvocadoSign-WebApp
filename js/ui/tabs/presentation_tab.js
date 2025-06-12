const presentationTab = (() => {

    function _createASPerformanceViewHTML(presentationData) {
        const { statsGesamt, statsSurgeryAlone, statsNeoadjuvantTherapy, cohort, statsCurrentCohort, patientCount } = presentationData || {};
        
        const cohortsData = [
            { id: APP_CONFIG.COHORTS.OVERALL.id, stats: statsGesamt },
            { id: APP_CONFIG.COHORTS.SURGERY_ALONE.id, stats: statsSurgeryAlone },
            { id: APP_CONFIG.COHORTS.NEOADJUVANT.id, stats: statsNeoadjuvantTherapy }
        ];

        const currentCohortName = getCohortDisplayName(cohort);
        const displayPatientCount = patientCount > 0 ? patientCount : (statsCurrentCohort?.matrix?.tp + statsCurrentCohort?.matrix?.fp + statsCurrentCohort?.matrix?.fn + statsCurrentCohort?.matrix?.tn) || 0;
        const hasDataForCurrent = !!(statsCurrentCohort && statsCurrentCohort.matrix && displayPatientCount > 0);

        const createPerfTableRow = (stats, cohortKey) => {
            const cohortDisplayName = getCohortDisplayName(cohortKey);
            const na = '--';
            const fCI_p = (m, k) => { 
                const d = (k === 'auc') ? 2 : ((k === 'f1') ? 3 : 1); 
                const p = !(k === 'auc' || k === 'f1'); 
                return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na); 
            };
            if (!stats || typeof stats.matrix !== 'object') {
                const nPatients = stats?.patientCount || '?';
                return `<tr><td class="fw-bold">${cohortDisplayName} (N=${nPatients})</td><td colspan="6" class="text-muted text-center">Data missing</td></tr>`;
            }
            const count = stats.matrix ? (stats.matrix.tp + stats.matrix.fp + stats.matrix.fn + stats.matrix.tn) : 0;
            return `<tr>
                        <td class="fw-bold">${cohortDisplayName} (N=${count})</td>
                        <td data-tippy-key="statisticsTab.diagnosticPerformance.sens" data-value="${stats.sens?.value}">${fCI_p(stats.sens, 'sens')}</td>
                        <td data-tippy-key="statisticsTab.diagnosticPerformance.spec" data-value="${stats.spec?.value}">${fCI_p(stats.spec, 'spec')}</td>
                        <td data-tippy-key="statisticsTab.diagnosticPerformance.ppv" data-value="${stats.ppv?.value}">${fCI_p(stats.ppv, 'ppv')}</td>
                        <td data-tippy-key="statisticsTab.diagnosticPerformance.npv" data-value="${stats.npv?.value}">${fCI_p(stats.npv, 'npv')}</td>
                        <td data-tippy-key="statisticsTab.diagnosticPerformance.acc" data-value="${stats.acc?.value}">${fCI_p(stats.acc, 'acc')}</td>
                        <td data-tippy-key="statisticsTab.diagnosticPerformance.auc" data-value="${stats.auc?.value}">${fCI_p(stats.auc, 'auc')}</td>
                    </tr>`;
        };
        const tableId = "pres-as-perf-table";
        const chartId = "pres-as-perf-chart";

        let tableHTML = `
            <div class="col-12">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center"><span>AS Performance vs. N for All Cohorts</span>${uiComponents.createHeaderButtonHTML([{id: `dl-${tableId}-png`, icon: 'fa-image', format: 'png', tableId: tableId, tableName: `Pres_AS_Perf_Overview`}], tableId, "AS_Performance_Overview")}</div>
                    <div class="card-body p-0"><div class="table-responsive"><table class="table table-striped table-hover table-sm small mb-0" id="${tableId}">
                        <thead class="small"><tr>
                            <th>Cohort</th>
                            <th data-tippy-key="statisticsTab.diagnosticPerformance.sens">Sens. (95% CI)</th>
                            <th data-tippy-key="statisticsTab.diagnosticPerformance.spec">Spec. (95% CI)</th>
                            <th data-tippy-key="statisticsTab.diagnosticPerformance.ppv">PPV (95% CI)</th>
                            <th data-tippy-key="statisticsTab.diagnosticPerformance.npv">NPV (95% CI)</th>
                            <th data-tippy-key="statisticsTab.diagnosticPerformance.acc">Acc. (95% CI)</th>
                            <th data-tippy-key="statisticsTab.diagnosticPerformance.auc">AUC (95% CI)</th>
                        </tr></thead>
                        <tbody>${cohortsData.map(c => createPerfTableRow(c.stats, c.id)).join('')}</tbody>
                    </table></div></div>
                    <div class="card-footer text-end p-1">
                        <button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-pur-csv"><i class="fas fa-file-csv me-1"></i>CSV</button>
                        <button class="btn btn-sm btn-outline-secondary" id="download-performance-as-pur-md"><i class="fab fa-markdown me-1"></i>MD</button>
                    </div>
                </div>
            </div>`;

        let chartHTML = `
            <div class="col-lg-8 offset-lg-2">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center"><span>Performance Visualization (AS vs. N) - Cohort: ${currentCohortName}</span>
                        <span class="card-header-buttons">${uiComponents.createHeaderButtonHTML([{id: `dl-${chartId}-png`, icon: 'fa-image', format: 'png', chartId: chartId, chartName: `AS_Performance_${currentCohortName.replace(/\s+/g, '_')}`}, {id: `dl-${chartId}-svg`, icon: 'fa-file-code', format: 'svg', chartId: chartId, chartName: `AS_Performance_${currentCohortName.replace(/\s+/g, '_')}`}], chartId, "AS_Performance_Chart")}</span>
                    </div>
                    <div class="card-body p-1"><div id="${chartId}" class="pres-chart-container border rounded" style="min-height: 280px;" data-tippy-key="presentation.asPerformanceChart">${hasDataForCurrent ? '' : `<p class="text-center text-muted p-3">No data for chart (${currentCohortName}).</p>`}</div></div>
                </div>
            </div>`;
        return `<div class="row g-3"><div class="col-12"><h3 class="text-center mb-3">Diagnostic Performance - Avocado Sign</h3></div>${tableHTML}${chartHTML}</div>`;
    }
    
    function _createASvsT2ComparisonViewHTML(presentationData, selectedStudyId, currentGlobalCohort) {
        const { performanceAS, performanceT2, comparison, comparisonCriteriaSet, cohortForComparison, patientCountForComparison, t2ShortName } = presentationData || {};
        const displayCohortForComparison = getCohortDisplayName(cohortForComparison);
        const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const appliedName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME || "Applied Criteria";
        
        let comparisonBasisName = "N/A", comparisonInfoHTML = '<p class="text-muted small">Please select a T2 criteria basis for comparison.</p>';
        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            comparisonBasisName = comparisonCriteriaSet.displayShortName || comparisonCriteriaSet.name || (isApplied ? appliedName : selectedStudyId);
            let criteriaHTML = comparisonCriteriaSet.logic === 'KOMBINIERT' ? (studyInfo?.keyCriteriaSummary || comparisonCriteriaSet.description) : studyT2CriteriaManager.formatCriteriaForDisplay(comparisonCriteriaSet.criteria, comparisonCriteriaSet.logic, false);
            comparisonInfoHTML = `<dl class="row small mb-0">
                <dt class="col-sm-4" data-tippy-key="presentation.t2BasisInfoCard.reference">Reference:</dt><dd class="col-sm-8">${studyInfo?.reference || (isApplied ? 'User-defined (currently in Analysis Tab)' : 'N/A')}</dd>
                <dt class="col-sm-4" data-tippy-key="presentation.t2BasisInfoCard.patientCohort">Basis Cohort:</dt><dd class="col-sm-8">${studyInfo?.patientCohort || `Current: ${displayCohortForComparison} (N=${patientCountForComparison || '?'})`}</dd>
                <dt class="col-sm-4" data-tippy-key="presentation.t2BasisInfoCard.keyCriteriaSummary">Criteria:</dt><dd class="col-sm-8">${criteriaHTML}</dd>
            </dl>`;
        }

        const studySets = studyT2CriteriaManager.getAllStudyCriteriaSets();
        const appliedOptionHTML = `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${isApplied ? 'selected' : ''}>-- ${appliedName} --</option>`;
        const studyOptionsHTML = studySets.map(set => `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${set.name || set.id}</option>`).join('');

        let resultsHTML = '';
        const canDisplayResults = !!(selectedStudyId && performanceAS && performanceT2 && comparison && comparisonCriteriaSet && patientCountForComparison > 0);

        if (canDisplayResults) {
            const t2ShortNameEffective = t2ShortName || (comparisonCriteriaSet?.displayShortName || 'T2');
            const metrics = ['sens', 'spec', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = { sens: 'Sensitivity', spec: 'Specificity', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', balAcc: 'Bal. Accuracy', f1: 'F1-Score', auc: 'AUC' };
            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="pres-as-vs-t2-comp-table"><thead class="small"><tr><th>Metric</th>
                <th data-tippy-key="presentation.asVsT2PerfTable.asValue">AS (Value, 95% CI)</th>
                <th data-tippy-key="presentation.asVsT2PerfTable.t2Value" data-value="${t2ShortNameEffective}">${t2ShortNameEffective} (Value, 95% CI)</th>
                </tr></thead><tbody>`;
            metrics.forEach(key => {
                const isRate = !(key === 'f1' || key === 'auc'); 
                const digits = (key === 'auc') ? 2 : ((key === 'f1') ? 3 : 1);
                const valAS = formatCI(performanceAS[key]?.value, performanceAS[key]?.ci?.lower, performanceAS[key]?.ci?.upper, digits, isRate, '--');
                const valT2 = formatCI(performanceT2[key]?.value, performanceT2[key]?.ci?.lower, performanceT2[key]?.ci?.upper, digits, isRate, '--');
                comparisonTableHTML += `<tr><td data-tippy-key="statisticsTab.diagnosticPerformance.${key}">${metricNames[key]}</td>
                    <td data-tippy-key="statisticsTab.diagnosticPerformance.${key}" data-value="${performanceAS[key]?.value}">${valAS}</td>
                    <td data-tippy-key="statisticsTab.diagnosticPerformance.${key}" data-value="${performanceT2[key]?.value}">${valT2}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;
            const comparisonTableCardHTML = uiComponents.createStatisticsCard('pres-as-vs-t2-comp-table_card', `Performance Metrics (AS vs. ${t2ShortNameEffective})`, comparisonTableHTML, false, null, [{id: 'dl-pres-as-vs-t2-comp-table-png', icon: 'fa-image', format: 'png', tableId: 'pres-as-vs-t2-comp-table', tableName: `Pres_ASvsT2_Metrics_${comparisonCriteriaSet?.id || 'T2'}`}]);

            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="pres-as-vs-t2-test-table"><thead class="small visually-hidden"><tr><th>Test</th><th>Statistic</th><th>p-Value</th><th>Method</th></tr></thead><tbody>`;
            testsTableHTML += `<tr><td data-tippy-key="statisticsTab.statisticalComparison.mcnemar">McNemar (Acc)</td><td>${formatNumber(comparison?.mcnemar?.statistic, 3, '--', true)} (df=${comparison?.mcnemar?.df || '--'})</td><td data-tippy-key="statisticsTab.statisticalComparison.mcnemar" data-value="${comparison?.mcnemar?.pValue}">${getPValueText(comparison?.mcnemar?.pValue, true)} ${getStatisticalSignificanceSymbol(comparison?.mcnemar?.pValue)}</td><td class="text-muted">${comparison?.mcnemar?.method || '--'}</td></tr>`;
            testsTableHTML += `<tr><td data-tippy-key="statisticsTab.statisticalComparison.delong">DeLong (AUC)</td><td>Z=${formatNumber(comparison?.delong?.Z, 3, '--', true)}</td><td data-tippy-key="statisticsTab.statisticalComparison.delong" data-value="${comparison?.delong?.pValue}">${getPValueText(comparison?.delong?.pValue, true)} ${getStatisticalSignificanceSymbol(comparison?.delong?.pValue)}</td><td class="text-muted">${comparison?.delong?.method || '--'}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            const testsCardHTML = uiComponents.createStatisticsCard('pres-as-vs-t2-test-table_card', `Statistical Comparison (AS vs. ${t2ShortNameEffective})`, testsTableHTML, false, null, [{id: `dl-pres-as-vs-t2-test-table-png`, icon: 'fa-image', format: 'png', tableId: 'pres-as-vs-t2-test-table', tableName: `Pres_ASvsT2_Tests_${comparisonCriteriaSet?.id || 'T2'}`}]);
            
            const chartContainerId = "pres-comp-chart-container";
            const chartBaseName = `AS_vs_${(comparisonCriteriaSet?.displayShortName || selectedStudyId || 'T2').replace(/\s+/g, '_')}_Cohort_${displayCohortForComparison.replace(/\s+/g, '_')}`;

            resultsHTML = `<div class="row g-3 presentation-comparison-row">
                     <div class="col-lg-7 col-xl-7 presentation-comparison-col-left">
                        <div class="card h-100">
                             <div class="card-header d-flex justify-content-between align-items-center"><span>Comparison Chart (AS vs. ${t2ShortNameEffective})</span>
                                 <span class="card-header-buttons">${uiComponents.createHeaderButtonHTML([{id: `download-chart-as-vs-t2-png`, icon: 'fa-image', format: 'png', chartId: chartContainerId, chartName: chartBaseName}, {id: `download-chart-as-vs-t2-svg`, icon: 'fa-file-code', format: 'svg', chartId: chartContainerId, chartName: chartBaseName}], chartContainerId, "AS_vs_T2_Comparison_Chart")}</span>
                             </div>
                            <div class="card-body p-1 d-flex align-items-center justify-content-center"><div id="${chartContainerId}" class="pres-chart-container w-100" style="min-height: 300px;" data-tippy-key="presentation.asVsT2Chart"><p class="text-muted small text-center p-3">Loading comparison chart...</p></div></div>
                            <div class="card-footer text-end p-1"><button class="btn btn-sm btn-outline-secondary me-1" id="download-performance-as-vs-t2-csv"><i class="fas fa-file-csv me-1"></i>Table (CSV)</button><button class="btn btn-sm btn-outline-secondary" id="download-comp-table-as-vs-t2-md"><i class="fab fa-markdown me-1"></i>Metrics (MD)</button></div>
                        </div>
                    </div>
                    <div class="col-lg-5 col-xl-5 presentation-comparison-col-right d-flex flex-column">
                         <div class="card mb-3 flex-shrink-0" id="pres-t2-basis-info-card" data-tippy-key="presentation.t2BasisInfoCard.title"><div class="card-header card-header-sm">T2 Comparison Basis Details</div><div class="card-body p-2">${comparisonInfoHTML}</div></div>
                         <div class="card mb-3 flex-grow-0">${comparisonTableCardHTML}</div>
                         <div class="card flex-grow-1">${testsCardHTML}<div class="card-footer text-end p-1"><button class="btn btn-sm btn-outline-secondary" id="download-tests-as-vs-t2-md"><i class="fab fa-markdown me-1"></i>Tests (MD)</button></div></div>
                    </div>
                </div>`;
        } else {
             resultsHTML = `<div class="alert alert-info">Please select a comparison basis for cohort '<strong>${displayCohortForComparison}</strong>'.</div>`;
        }

        const displayGlobalCohort = getCohortDisplayName(currentGlobalCohort);
        const cohortNotice = (cohortForComparison !== currentGlobalCohort)
            ? `(Global cohort: <strong>${displayGlobalCohort}</strong>. T2 comparison basis evaluated on <strong>${displayCohortForComparison}</strong>, N=${patientCountForComparison || '?'}).`
            : `(N=${patientCountForComparison || '?'})`;

        return `<div class="row mb-4"><div class="col-12"><h4 class="text-center mb-1">Comparison: Avocado Sign vs. T2 Criteria</h4><p class="text-center text-muted small mb-3">Current comparison cohort: <strong>${displayCohortForComparison}</strong> ${cohortNotice}</p><div class="row justify-content-center"><div class="col-md-9 col-lg-7"><div class="input-group input-group-sm"><label class="input-group-text" for="pres-study-select" data-tippy-key="presentation.studySelect">T2 Comparison Basis:</label><select class="form-select" id="pres-study-select"><option value="" ${!selectedStudyId ? 'selected' : ''} disabled>-- Please select --</option>${appliedOptionHTML}<option value="" disabled>--- Published Criteria ---</option>${studyOptionsHTML}</select></div></div></div></div></div><div id="presentation-as-vs-t2-results">${resultsHTML}</div>`;
    }

    function render(view, presentationData, selectedStudyIdFromState, currentGlobalCohort, processedData, criteria, logic) {
        let chartDataForComparison = [];
        let t2ShortNameEffectiveForChart = "T2";

        if (presentationData && presentationData.performanceAS && presentationData.performanceT2) {
            const performanceAS = presentationData.performanceAS;
            const performanceT2 = presentationData.performanceT2;
            t2ShortNameEffectiveForChart = presentationData.t2ShortName || (presentationData.comparisonCriteriaSet?.displayShortName || 'T2');

            chartDataForComparison = [
                { metric: 'Sens.', AS: performanceAS.sens?.value || 0, T2: performanceT2.sens?.value || 0 },
                { metric: 'Spec.', AS: performanceAS.spec?.value || 0, T2: performanceT2.spec?.value || 0 },
                { metric: 'Acc.', AS: performanceAS.acc?.value || 0, T2: performanceT2.acc?.value || 0 },
                { metric: 'AUC', AS: performanceAS.auc?.value || 0, T2: performanceT2.auc?.value || 0 }
            ];
        }

        let viewSelectorHTML = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Presentation View Selection" data-tippy-key="presentation.viewSelect.title">
                        <input type="radio" class="btn-check" name="presentationView" id="view-as-perf" autocomplete="off" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary pres-view-btn" for="view-as-perf" data-tippy-key="presentation.viewSelect.asPerf"><i class="fas fa-star me-1"></i> AS Performance</label>
                        <input type="radio" class="btn-check" name="presentationView" id="view-as-vs-t2" value="as-vs-t2" autocomplete="off" ${view === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary pres-view-btn" for="view-as-vs-t2" data-tippy-key="presentation.viewSelect.asVsT2"><i class="fas fa-exchange-alt me-1"></i> AS vs. T2 Comparison</label>
                    </div>
                </div>
            </div>`;

        let contentHTML = (view === 'as-pur') 
            ? _createASPerformanceViewHTML(presentationData)
            : _createASvsT2ComparisonViewHTML(presentationData, selectedStudyIdFromState, currentGlobalCohort);
        
        setTimeout(() => {
            uiManager.initializeTooltips(document.getElementById('presentation-content-area'));

            if (view === 'as-pur' && presentationData?.statsCurrentCohort) {
                const chartId = "pres-as-perf-chart";
                const dataForROC = dataProcessor.filterDataByCohort(processedData, presentationData.cohort);
                if (document.getElementById(chartId) && dataForROC.length > 0) {
                    chartRenderer.renderDiagnosticPerformanceChart(dataForROC, 'asStatus', 'nStatus', chartId, APP_CONFIG.UI_TEXTS.legendLabels.avocadoSign);
                } else if (document.getElementById(chartId)) {
                    uiManager.updateElementHTML(chartId, `<p class="text-center text-muted p-3">No data for chart (${getCohortDisplayName(presentationData.cohort)}).</p>`);
                }
            } else if (view === 'as-vs-t2' && presentationData?.performanceAS && presentationData?.performanceT2) {
                const chartContainerId = "pres-comp-chart-container";
                if (document.getElementById(chartContainerId)) {
                    chartRenderer.renderComparisonBarChart(chartDataForComparison, chartContainerId, {}, t2ShortNameEffectiveForChart);
                }
            }
        }, 100);

        return viewSelectorHTML + `<div id="presentation-content-area">${contentHTML}</div>`;
    }
    
    return {
        render
    };
})();
