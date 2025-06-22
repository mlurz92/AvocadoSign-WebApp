window.comparisonTab = (() => {

    function _createASPerformanceViewHTML(comparisonData, processedData) {
        const { statsGesamt, statsSurgeryAlone, statsNeoadjuvantTherapy, globalCohort, statsCurrentCohort, patientCount } = comparisonData || {};
        const na = window.APP_CONFIG.NA_PLACEHOLDER;

        const cohortsData = [
            { id: window.APP_CONFIG.COHORTS.OVERALL.id, stats: statsGesamt?.performanceAS },
            { id: window.APP_CONFIG.COHORTS.SURGERY_ALONE.id, stats: statsSurgeryAlone?.performanceAS },
            { id: window.APP_CONFIG.COHORTS.NEOADJUVANT.id, stats: statsNeoadjuvantTherapy?.performanceAS }
        ];

        const currentCohortName = getCohortDisplayName(globalCohort);
        const displayPatientCount = patientCount > 0 ? patientCount : (statsCurrentCohort?.matrix?.tp + statsCurrentCohort?.matrix?.fp + statsCurrentCohort?.matrix?.fn + statsCurrentCohort?.matrix?.tn) || 0;
        const hasDataForCurrent = !!(statsCurrentCohort && statsCurrentCohort.matrix && displayPatientCount > 0);

        const createPerfTableRow = (stats, cohortKey) => {
            const cohortDisplayName = getCohortDisplayName(cohortKey);
            const fCI_p = (m, k) => { 
                const d = (k === 'auc' || k === 'f1' || k ==='youden' || k === 'balAcc') ? 3 : 1; 
                const p = !(k === 'auc' || k === 'f1' || k ==='youden' || k === 'balAcc'); 
                return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na); 
            };
            if (!stats || typeof stats.matrix !== 'object') {
                const nPatients = (cohortKey === 'Overall' ? statsGesamt?.descriptive?.patientCount : (cohortKey === 'surgeryAlone' ? statsSurgeryAlone?.descriptive?.patientCount : statsNeoadjuvantTherapy?.descriptive?.patientCount)) || '?';
                return `<tr><td class="fw-bold">${cohortDisplayName} (N=${nPatients})</td><td colspan="6" class="text-muted text-center">Data missing</td></tr>`;
            }
            const count = stats.matrix ? (stats.matrix.tp + stats.matrix.fp + stats.matrix.fn + stats.matrix.tn) : 0;
            return `<tr>
                        <td class="fw-bold">${cohortDisplayName} (N=${count})</td>
                        <td data-tippy-content="${getInterpretationTooltip('sens', stats.sens)}">${fCI_p(stats.sens, 'sens')}</td>
                        <td data-tippy-content="${getInterpretationTooltip('spec', stats.spec)}">${fCI_p(stats.spec, 'spec')}</td>
                        <td data-tippy-content="${getInterpretationTooltip('ppv', stats.ppv)}">${fCI_p(stats.ppv, 'ppv')}</td>
                        <td data-tippy-content="${getInterpretationTooltip('npv', stats.npv)}">${fCI_p(stats.npv, 'npv')}</td>
                        <td data-tippy-content="${getInterpretationTooltip('acc', stats.acc)}">${fCI_p(stats.acc, 'acc')}</td>
                        <td data-tippy-content="${getInterpretationTooltip('auc', stats.auc)}">${fCI_p(stats.auc, 'auc')}</td>
                    </tr>`;
        };
        const tableId = "comp-as-perf-table";
        const chartId = "comp-as-perf-chart";

        let tableHTML = `
            <div class="col-12">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center"><span>AS Performance vs. N for All Cohorts</span></div>
                    <div class="card-body p-0"><div class="table-responsive"><table class="table table-striped table-hover table-sm small mb-0" id="${tableId}">
                        <thead class="small"><tr>
                            <th data-tippy-content="Patient cohort and its size (N).">Cohort</th>
                            <th data-tippy-content="${getDefinitionTooltip('sens')}">Sens. (95% CI)</th>
                            <th data-tippy-content="${getDefinitionTooltip('spec')}">Spec. (95% CI)</th>
                            <th data-tippy-content="${getDefinitionTooltip('ppv')}">PPV (95% CI)</th>
                            <th data-tippy-content="${getDefinitionTooltip('npv')}">NPV (95% CI)</th>
                            <th data-tippy-content="${getDefinitionTooltip('acc')}">Acc. (95% CI)</th>
                            <th data-tippy-content="${getDefinitionTooltip('auc')}">AUC (95% CI)</th>
                        </tr></thead>
                        <tbody>${cohortsData.map(c => createPerfTableRow(c.stats, c.id)).join('')}</tbody>
                    </table></div></div>
                </div>
            </div>`;

        let chartHTML = `
            <div class="col-lg-8 offset-lg-2">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center"><span>Performance Visualization (AS vs. N) - Cohort: ${currentCohortName}</span>
                    </div>
                    <div class="card-body p-1"><div id="${chartId}" class="comp-chart-container border rounded" style="min-height: 280px;">${hasDataForCurrent ? '' : `<p class="text-center text-muted p-3">No data for chart (${currentCohortName}).</p>`}</div></div>
                </div>
            </div>`;
        return `<div class="row g-3"><div class="col-12"><h3 class="text-center mb-3">Diagnostic Performance - Avocado Sign</h3></div>${tableHTML}${chartHTML}</div>`;
    }
    
    function _createASvsT2ComparisonViewHTML(comparisonData, selectedStudyId, currentGlobalCohort) {
        const { performanceAS, performanceT2, comparison, comparisonCriteriaSet, cohortForComparison, patientCountForComparison, t2ShortName } = comparisonData || {};
        const na_stat = window.APP_CONFIG.NA_PLACEHOLDER;
        const displayCohortForComparison = getCohortDisplayName(cohortForComparison);
        const isApplied = selectedStudyId === window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
        const appliedName = window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME || "Applied Criteria";
        
        let comparisonBasisName = "N/A", comparisonInfoHTML = '<p class="text-muted small">Please select a T2 criteria basis for comparison.</p>';
        if (selectedStudyId && comparisonCriteriaSet) {
            const studyInfo = comparisonCriteriaSet.studyInfo;
            comparisonBasisName = comparisonCriteriaSet.displayShortName || comparisonCriteriaSet.name || (isApplied ? appliedName : selectedStudyId);
            let criteriaHTML = comparisonCriteriaSet.logic === 'KOMBINIERT' ? (studyInfo?.keyCriteriaSummary || comparisonCriteriaSet.description) : window.studyT2CriteriaManager.formatCriteriaForDisplay(comparisonCriteriaSet.criteria, comparisonCriteriaSet.logic, false);
            comparisonInfoHTML = `<dl class="row small mb-0"><dt class="col-sm-4">Reference:</dt><dd class="col-sm-8">${studyInfo?.reference || (isApplied ? 'User-defined (currently in Analysis Tab)' : 'N/A')}</dd><dt class="col-sm-4">Basis Cohort:</dt><dd class="col-sm-8">${studyInfo?.patientCohort || `Current: ${displayCohortForComparison} (N=${patientCountForComparison || '?'})`}</dd><dt class="col-sm-4">Criteria:</dt><dd class="col-sm-8">${criteriaHTML}</dd></dl>`;
        }

        const studySets = window.studyT2CriteriaManager.getAllStudyCriteriaSets();
        const appliedOptionHTML = `<option value="${window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${isApplied ? 'selected' : ''}>-- ${appliedName} --</option>`;
        const studyOptionsHTML = studySets.map(set => `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${set.name || set.id}</option>`).join('');

        let resultsHTML = '';
        const canDisplayResults = !!(selectedStudyId && performanceAS && performanceT2 && comparison && comparisonCriteriaSet && patientCountForComparison > 0);

        if (canDisplayResults) {
            const t2ShortNameEffective = t2ShortName || (comparisonCriteriaSet?.displayShortName || 'T2');
            const metrics = ['sens', 'spec', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
            const metricNames = { sens: 'Sensitivity', spec: 'Specificity', ppv: 'PPV', npv: 'NPV', acc: 'Accuracy', balAcc: 'Bal. Accuracy', f1: 'F1-Score', auc: 'AUC' };
            let comparisonTableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0" id="comp-as-vs-t2-comp-table"><thead class="small"><tr><th>Metric</th><th>AS (Value, 95% CI)</th><th>${t2ShortNameEffective} (Value, 95% CI)</th></tr></thead><tbody>`;
            metrics.forEach(key => {
                const isRate = !(key === 'f1' || key === 'auc' || key === 'balAcc'); 
                const digits = (key === 'auc' || key === 'f1' || key === 'balAcc') ? 3 : 1;
                const valAS = formatCI(performanceAS[key]?.value, performanceAS[key]?.ci?.lower, performanceAS[key]?.ci?.upper, digits, isRate, '--');
                const valT2 = formatCI(performanceT2[key]?.value, performanceT2[key]?.ci?.lower, performanceT2[key]?.ci?.upper, digits, isRate, '--');
                comparisonTableHTML += `<tr><td data-tippy-content="${getDefinitionTooltip(key)}">${metricNames[key]}</td><td data-tippy-content="${getInterpretationTooltip(key, performanceAS[key])}">${valAS}</td><td data-tippy-content="${getInterpretationTooltip(key, performanceT2[key])}">${valT2}</td></tr>`;
            });
            comparisonTableHTML += `</tbody></table></div>`;
            const comparisonTableCardHTML = window.uiComponents.createStatisticsCard('comp-as-vs-t2-comp-table_card', `Performance Metrics (AS vs. ${t2ShortNameEffective})`, comparisonTableHTML, false, null, []);
            
            const mcnemarTooltip = getInterpretationTooltip('pValue', {value: comparison.mcnemar?.pValue, testName: 'McNemar'}, { method1: 'AS', method2: t2ShortNameEffective, metricName: 'Accuracy'});
            const delongTooltip = getInterpretationTooltip('pValue', {value: comparison.delong?.pValue, testName: 'DeLong'}, { method1: 'AS', method2: t2ShortNameEffective, metricName: 'AUC'});

            let testsTableHTML = `<table class="table table-sm table-striped small mb-0" id="comp-as-vs-t2-test-table"><thead class="small visually-hidden"><tr><th>Test</th><th>Statistic</th><th>p-Value</th><th>Method</th></tr></thead><tbody>`;
            testsTableHTML += `<tr><td data-tippy-content="${getDefinitionTooltip('mcnemar')}">McNemar (Acc)</td><td>${formatNumber(comparison?.mcnemar?.statistic, 3, na_stat, true)} (df=${comparison?.mcnemar?.df || na_stat})</td><td data-tippy-content="${mcnemarTooltip}">${getPValueText(comparison?.mcnemar?.pValue, false)} ${getStatisticalSignificanceSymbol(comparison?.mcnemar?.pValue)}</td><td>${comparison?.mcnemar?.method || na_stat}</td></tr>`;
            testsTableHTML += `<tr><td data-tippy-content="${getDefinitionTooltip('delong')}">DeLong (AUC)</td><td>Z=${formatNumber(comparison?.delong?.Z, 3, na_stat, true)}</td><td data-tippy-content="${delongTooltip}">${getPValueText(comparison?.delong?.pValue, false)} ${getStatisticalSignificanceSymbol(comparison?.delong?.pValue)}</td><td>${comparison?.delong?.method || na_stat}</td></tr>`;
            testsTableHTML += `</tbody></table>`;
            const testsCardHTML = window.uiComponents.createStatisticsCard('comp-as-vs-t2-test-table_card', `Statistical Comparison (AS vs. ${t2ShortNameEffective})`, testsTableHTML, false, null, []);
            
            const chartContainerId = "comp-chart-container";
            resultsHTML = `<div class="row g-3 comparison-row">
                     <div class="col-lg-7 col-xl-7 comparison-col-left">
                        <div class="card h-100">
                             <div class="card-header d-flex justify-content-between align-items-center"><span>Comparison Chart (AS vs. ${t2ShortNameEffective})</span>
                             </div>
                            <div class="card-body p-1 d-flex align-items-center justify-content-center"><div id="${chartContainerId}" class="comp-chart-container w-100" style="min-height: 300px;"><p class="text-muted small text-center p-3">Loading comparison chart...</p></div></div>
                        </div>
                    </div>
                    <div class="col-lg-5 col-xl-5 comparison-col-right d-flex flex-column">
                         <div class="card mb-3 flex-shrink-0" id="comp-t2-basis-info-card"><div class="card-header card-header-sm">T2 Comparison Basis Details</div><div class="card-body p-2">${comparisonInfoHTML}</div></div>
                         <div class="card mb-3 flex-grow-0">${comparisonTableCardHTML}</div>
                         <div class="card flex-grow-1">${testsCardHTML}</div>
                    </div>
                </div>`;
        } else {
             resultsHTML = `<div class="alert alert-info">Please select a comparison basis. The analysis will be performed on the methodologically correct cohort for the selected criteria set.</div>`;
        }

        let contextBannerHTML = '';
        const analysisContext = window.state.getAnalysisContext();
        if (analysisContext) {
            contextBannerHTML = window.uiComponents.createAnalysisContextBannerHTML(analysisContext, patientCountForComparison);
        } else {
            contextBannerHTML = `<p class="text-center text-muted small mb-3">Current cohort: <strong>${getCohortDisplayName(currentGlobalCohort)}</strong> (N=${patientCountForComparison || '?'})</p>`;
        }

        return `<div class="row mb-4"><div class="col-12"><h4 class="text-center mb-1">Comparison: Avocado Sign vs. T2 Criteria</h4>${contextBannerHTML}<div class="row justify-content-center mt-2"><div class="col-md-9 col-lg-7"><div class="input-group input-group-sm"><label class="input-group-text" for="comp-study-select">T2 Comparison Basis:</label><select class="form-select" id="comp-study-select"><option value="" ${!selectedStudyId ? 'selected' : ''} disabled>-- Please select --</option>${appliedOptionHTML}<option value="" disabled>--- Published Criteria ---</option>${studyOptionsHTML}</select></div></div></div></div></div><div id="comparison-as-vs-t2-results">${resultsHTML}</div>`;
    }

    function render(view, comparisonData, selectedStudyIdFromState, currentGlobalCohort, processedData, criteria, logic) {
        let chartDataForComparison = [];
        let t2ShortNameEffectiveForChart = "T2";

        if (comparisonData && comparisonData.performanceAS && comparisonData.performanceT2) {
            const performanceAS = comparisonData.performanceAS;
            const performanceT2 = comparisonData.performanceT2;
            t2ShortNameEffectiveForChart = comparisonData.t2ShortName || (comparisonData.comparisonCriteriaSet?.displayShortName || 'T2');

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
                    <div class="btn-group btn-group-sm" role="group" aria-label="Comparison View Selection">
                        <input type="radio" class="btn-check" name="comparisonView" id="view-as-perf" autocomplete="off" value="as-pur" ${view === 'as-pur' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary comp-view-btn" for="view-as-perf"><i class="fas fa-star me-1"></i> AS Performance</label>
                        <input type="radio" class="btn-check" name="comparisonView" id="view-as-vs-t2" value="as-vs-t2" autocomplete="off" ${view === 'as-vs-t2' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary comp-view-btn" for="view-as-vs-t2"><i class="fas fa-exchange-alt me-1"></i> AS vs. T2 Comparison</label>
                    </div>
                </div>
            </div>`;

        let contentHTML = (view === 'as-pur') 
            ? _createASPerformanceViewHTML(comparisonData, processedData)
            : _createASvsT2ComparisonViewHTML(comparisonData, selectedStudyIdFromState, currentGlobalCohort);
        
        setTimeout(() => {
            if (view === 'as-pur' && comparisonData?.statsCurrentCohort) {
                const chartId = "comp-as-perf-chart";
                const dataForROC = window.dataProcessor.filterDataByCohort(processedData, comparisonData.globalCohort);
                if (document.getElementById(chartId) && dataForROC.length > 0) {
                    window.chartRenderer.renderDiagnosticPerformanceChart(dataForROC, 'asStatus', 'nStatus', chartId, window.APP_CONFIG.UI_TEXTS.legendLabels.avocadoSign);
                } else if (document.getElementById(chartId)) {
                    window.uiManager.updateElementHTML(chartId, `<p class="text-center text-muted p-3">No data for chart (${getCohortDisplayName(comparisonData.globalCohort)}).</p>`);
                }
            } else if (view === 'as-vs-t2' && comparisonData?.performanceAS && comparisonData?.performanceT2) {
                const chartContainerId = "comp-chart-container";
                if (document.getElementById(chartContainerId)) {
                    window.chartRenderer.renderComparisonBarChart(chartDataForComparison, chartContainerId, {}, t2ShortNameEffectiveForChart);
                }
            }
        }, 100);

        return viewSelectorHTML + `<div id="comparison-content-area">${contentHTML}</div>`;
    }
    
    return Object.freeze({
        render
    });
})();