const statisticsTab = (() => {

    function createDescriptiveStatsContentHTML(stats, indexSuffix, cohortId) {
        if (!stats || !stats.descriptive || !stats.descriptive.patientCount) return '<p class="text-muted small p-3">No descriptive data available.</p>';
        const d = stats.descriptive;
        const total = d.patientCount;
        const na = '--';
        const fv = (val, dig = 1, useStd = true) => formatNumber(val, dig, na, useStd);
        const fP = (val, dig = 1) => formatPercent(val, dig, na);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}–${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;

        return `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-descriptive-demographics-${indexSuffix}">
                            <caption>Demographics & Status (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>Metric</th><th>Value</th></tr></thead>
                            <tbody>
                                <tr><td>Age, Median (Min–Max) [Mean ± SD]</td><td>${fv(d.age?.median,1)} (${fv(d.age?.min,0)}–${fv(d.age?.max,0)}) [${fv(d.age?.mean,1)} ± ${fv(d.age?.sd,1)}]</td></tr>
                                <tr><td>Sex (male / female) (n / %)</td><td>${d.sex?.m ?? 0} / ${d.sex?.f ?? 0} (${fP((d.sex?.m ?? 0) / total, 1)} / ${fP((d.sex?.f ?? 0) / total, 1)})</td></tr>
                                <tr><td>Therapy (Surgery alone / Neoadjuvant therapy) (n / %)</td><td>${d.therapy?.surgeryAlone ?? 0} / ${d.therapy?.neoadjuvantTherapy ?? 0} (${fP((d.therapy?.surgeryAlone ?? 0) / total, 1)} / ${fP((d.therapy?.neoadjuvantTherapy ?? 0) / total, 1)})</td></tr>
                                <tr><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP((d.nStatus?.plus ?? 0) / total, 1)} / ${fP((d.nStatus?.minus ?? 0) / total, 1)})</td></tr>
                                <tr><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP((d.asStatus?.plus ?? 0) / total, 1)} / ${fP((d.asStatus?.minus ?? 0) / total, 1)})</td></tr>
                                <tr><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP((d.t2Status?.plus ?? 0) / total, 1)} / ${fP((d.t2Status?.minus ?? 0) / total, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-descriptive-ln-${indexSuffix}">
                             <caption>Lymph Node Counts (Median (Min–Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metric</th><th>Value</th></tr></thead>
                             <tbody>
                                <tr><td>LN N total</td><td>${fLK(d.lnCounts?.n?.total)}</td></tr>
                                <tr><td>LN N+ <sup>*</sup></td><td>${fLK(d.lnCounts?.n?.plus)}</td></tr>
                                <tr><td>LN AS total</td><td>${fLK(d.lnCounts?.as?.total)}</td></tr>
                                <tr><td>LN AS+ <sup>**</sup></td><td>${fLK(d.lnCounts?.as?.plus)}</td></tr>
                                <tr><td>LN T2 total</td><td>${fLK(d.lnCounts?.t2?.total)}</td></tr>
                                <tr><td>LN T2+ <sup>***</sup></td><td>${fLK(d.lnCounts?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Only in N+ patients (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Only in AS+ patients (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Only in T2+ patients (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="chart-stat-age-${indexSuffix}"></div>
                    <div class="flex-grow-1" id="chart-stat-gender-${indexSuffix}"></div>
                </div>
            </div>`;
    }

    function createCriteriaComparisonTableHTML(allStats, globalCoh) {
        const availableSets = studyT2CriteriaManager.getAllStudyCriteriaSets().filter(s => s.applicableCohort === APP_CONFIG.COHORTS.OVERALL.id || s.applicableCohort === globalCoh);
        const allTableResults = [];
        const na_stat = '--';

        const asPerf = allStats[globalCoh]?.performanceAS;
        if (asPerf) {
            allTableResults.push({
                id: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID,
                name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME,
                sens: asPerf.sens?.value,
                spec: asPerf.spec?.value,
                ppv: asPerf.ppv?.value,
                npv: asPerf.npv?.value,
                acc: asPerf.acc?.value,
                auc: asPerf.auc?.value,
                cohort: getCohortDisplayName(globalCoh),
                n: allStats[globalCoh]?.descriptive?.patientCount || '?'
            });
        }

        const appliedT2Perf = allStats[globalCoh]?.performanceT2Applied;
        if (appliedT2Perf) {
            allTableResults.push({
                id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                sens: appliedT2Perf.sens?.value,
                spec: appliedT2Perf.spec?.value,
                ppv: appliedT2Perf.ppv?.value,
                npv: appliedT2Perf.npv?.value,
                acc: appliedT2Perf.acc?.value,
                auc: appliedT2Perf.auc?.value,
                cohort: getCohortDisplayName(globalCoh),
                n: allStats[globalCoh]?.descriptive?.patientCount || '?'
            });
        }

        availableSets.forEach(set => {
            const cohortToUse = set.applicableCohort || APP_CONFIG.COHORTS.OVERALL.id;
            const perf = allStats[cohortToUse]?.performanceT2Literature?.[set.id];
            if (perf) {
                allTableResults.push({
                    id: set.id,
                    name: set.name,
                    sens: perf.sens?.value,
                    spec: perf.spec?.value,
                    ppv: perf.ppv?.value,
                    npv: perf.npv?.value,
                    acc: perf.acc?.value,
                    auc: perf.auc?.value,
                    cohort: getCohortDisplayName(cohortToUse),
                    n: allStats[cohortToUse]?.descriptive?.patientCount || '?'
                });
            }
        });

        if (allTableResults.length === 0) return '<p class="text-muted small p-3">No criteria comparison data.</p>';

        let tableHtml = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
            <th>Set / Criteria</th>
            <th data-tooltip-key="performance.sens">Sens.</th>
            <th data-tooltip-key="performance.spec">Spec.</th>
            <th data-tooltip-key="performance.ppv">PPV</th>
            <th data-tooltip-key="performance.npv">NPV</th>
            <th data-tooltip-key="performance.acc">Acc.</th>
            <th data-tooltip-key="performance.auc">AUC</th>
        </tr></thead><tbody>`;

        allTableResults.forEach(r => {
            const cohortInfo = (r.cohort !== getCohortDisplayName(globalCoh)) ? ` (${r.cohort} N=${r.n})` : ``;
            tableHtml += `<tr>
                <td>${r.name}${cohortInfo}</td>
                <td>${formatPercent(r.sens, 1, na_stat)}</td>
                <td>${formatPercent(r.spec, 1, na_stat)}</td>
                <td>${formatPercent(r.ppv, 1, na_stat)}</td>
                <td>${formatPercent(r.npv, 1, na_stat)}</td>
                <td>${formatPercent(r.acc, 1, na_stat)}</td>
                <td>${formatNumber(r.auc, 2, na_stat, true)}</td>
            </tr>`;
        });

        tableHtml += `</tbody></table></div>`;
        return tableHtml;
    }


    function render(processedData, appliedCriteria, appliedLogic, layout, cohort1, cohort2, globalCohort) {
        if (!processedData) throw new Error("Statistics data not available.");
        let datasets = [], cohortNames = [];
        let baseEvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(processedData), appliedCriteria, appliedLogic);
        if (layout === 'einzel') {
            datasets.push(dataProcessor.filterDataByCohort(baseEvaluatedData, globalCohort));
            cohortNames.push(globalCohort);
        } else {
            datasets.push(dataProcessor.filterDataByCohort(baseEvaluatedData, cohort1));
            datasets.push(dataProcessor.filterDataByCohort(baseEvaluatedData, cohort2));
            cohortNames.push(cohort1, cohort2);
        }
        if (datasets.length === 0 || datasets.every(d => !Array.isArray(d) || d.length === 0)) {
            return '<div class="col-12"><div class="alert alert-warning">No data available for the selected statistics cohort(s).</div></div>';
        }
        const outerRow = document.createElement('div');
        outerRow.className = 'row g-4';
        datasets.forEach((data, i) => {
            const cohortId = cohortNames[i];
            const col = document.createElement('div');
            col.className = layout === 'vergleich' ? 'col-xl-6' : 'col-12';
            const innerRowId = `inner-stat-row-${i}`;
            col.innerHTML = `<h4 class="mb-3">Cohort: ${getCohortDisplayName(cohortId)} (N=${data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`;
            outerRow.appendChild(col);
            const innerContainer = col.querySelector(`#${innerRowId}`);
            if (data.length > 0) {
                const stats = {
                    descriptive: statisticsService.calculateDescriptiveStats(data),
                    performanceAS: statisticsService.calculateDiagnosticPerformance(data, 'asStatus', 'nStatus'),
                    performanceT2: statisticsService.calculateDiagnosticPerformance(data, 't2Status', 'nStatus'),
                    comparisonASvsT2: statisticsService.compareDiagnosticMethods(data, 'asStatus', 't2Status', 'nStatus'),
                    associations: statisticsService.calculateAssociations(data, appliedCriteria)
                };
                innerContainer.innerHTML += uiComponents.createStatisticsCard(`descriptive-stats-${i}`, 'Descriptive Statistics', createDescriptiveStatsContentHTML({descriptive: stats.descriptive}, i, cohortId), true, null, [{id: `dl-desc-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `table-descriptive-demographics-${i}`, tableName: `Descriptive_Demographics_${cohortId.replace(/\s+/g, '_')}`}], `table-descriptive-demographics-${i}`);

                const fVal = (m) => JSON.stringify({ value: m?.value, ci: m?.ci });
                const createPerfTableHTML = (perfStats) => {
                    if (!perfStats || typeof perfStats.matrix !== 'object') return '<p class="text-muted small p-2">No diagnostic performance data.</p>';
                    return `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tooltip-key="performance.metric">Metric</th>
                        <th data-tooltip-key="performance.value">Value (95% CI)</th>
                        <th data-tooltip-key="performance.ci_method">CI Method</th>
                        </tr></thead><tbody>
                        <tr><td data-tooltip-key="performance.sens">Sensitivity</td><td data-tooltip-key="performance.sens" data-tooltip-value='${fVal(perfStats.sens)}'>${formatCI(perfStats.sens?.value, perfStats.sens?.ci?.lower, perfStats.sens?.ci?.upper, 1, true, '--')}</td><td>${perfStats.sens?.method || '--'}</td></tr>
                        <tr><td data-tooltip-key="performance.spec">Specificity</td><td data-tooltip-key="performance.spec" data-tooltip-value='${fVal(perfStats.spec)}'>${formatCI(perfStats.spec?.value, perfStats.spec?.ci?.lower, perfStats.spec?.ci?.upper, 1, true, '--')}</td><td>${perfStats.spec?.method || '--'}</td></tr>
                        <tr><td data-tooltip-key="performance.ppv">PPV</td><td data-tooltip-key="performance.ppv" data-tooltip-value='${fVal(perfStats.ppv)}'>${formatCI(perfStats.ppv?.value, perfStats.ppv?.ci?.lower, perfStats.ppv?.ci?.upper, 1, true, '--')}</td><td>${perfStats.ppv?.method || '--'}</td></tr>
                        <tr><td data-tooltip-key="performance.npv">NPV</td><td data-tooltip-key="performance.npv" data-tooltip-value='${fVal(perfStats.npv)}'>${formatCI(perfStats.npv?.value, perfStats.npv?.ci?.lower, perfStats.npv?.ci?.upper, 1, true, '--')}</td><td>${perfStats.npv?.method || '--'}</td></tr>
                        <tr><td data-tooltip-key="performance.acc">Accuracy</td><td data-tooltip-key="performance.acc" data-tooltip-value='${fVal(perfStats.acc)}'>${formatCI(perfStats.acc?.value, perfStats.acc?.ci?.lower, perfStats.acc?.ci?.upper, 1, true, '--')}</td><td>${perfStats.acc?.method || '--'}</td></tr>
                        <tr><td data-tooltip-key="performance.balAcc">Balanced Accuracy</td><td data-tooltip-key="performance.balAcc" data-tooltip-value='${fVal(perfStats.balAcc)}'>${formatCI(perfStats.balAcc?.value, perfStats.balAcc?.ci?.lower, perfStats.balAcc?.ci?.upper, 1, true, '--')}</td><td>${perfStats.balAcc?.method || '--'}</td></tr>
                        <tr><td data-tooltip-key="performance.f1">F1-Score</td><td data-tooltip-key="performance.f1" data-tooltip-value='${fVal(perfStats.f1)}'>${formatCI(perfStats.f1?.value, perfStats.f1?.ci?.lower, perfStats.f1?.ci?.upper, 3, false, '--')}</td><td>${perfStats.f1?.method || '--'}</td></tr>
                        <tr><td data-tooltip-key="performance.auc">AUC</td><td data-tooltip-key="performance.auc" data-tooltip-value='${fVal(perfStats.auc)}'>${formatCI(perfStats.auc?.value, perfStats.auc?.ci?.lower, perfStats.auc?.ci?.upper, 2, false, '--')}</td><td>${perfStats.auc?.method || '--'}</td></tr>
                    </tbody></table></div>`;
                };

                const createCompTableHTML = (compStats) => {
                    if (!compStats) return '<p class="text-muted small p-2">No comparison data.</p>';
                    const fPVal = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? '<0.001' : formatNumber(p, 3, '--', true)) : '--';
                    const fValMcNemar = JSON.stringify({ stat: compStats.mcnemar?.statistic, p: compStats.mcnemar?.pValue });
                    const fValDeLong = JSON.stringify({ stat: compStats.delong?.Z, p: compStats.delong?.pValue });
                    return `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr><th>Test</th><th>Statistic</th><th>p-Value</th><th>Method</th></tr></thead><tbody>
                        <tr><td data-tooltip-key="comparison.mcnemar">McNemar (Acc)</td><td>${formatNumber(compStats.mcnemar?.statistic, 3, '--', true)} (df=${compStats.mcnemar?.df || '--'})</td><td data-tooltip-key="comparison.mcnemar" data-tooltip-value='${fValMcNemar}'>${fPVal(compStats.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(compStats.mcnemar?.pValue)}</td><td>${compStats.mcnemar?.method || '--'}</td></tr>
                        <tr><td data-tooltip-key="comparison.delong">DeLong (AUC)</td><td>Z=${formatNumber(compStats.delong?.Z, 3, '--', true)}</td><td data-tooltip-key="comparison.delong" data-tooltip-value='${fValDeLong}'>${fPVal(compStats.delong?.pValue)} ${getStatisticalSignificanceSymbol(compStats.delong?.pValue)}</td><td>${compStats.delong?.method || '--'}</td></tr>
                    </tbody></table></div>`;
                };
                
                const createAssocTableHTML = (assocStats, appliedCrit) => {
                    if (!assocStats || Object.keys(assocStats).length === 0) return '<p class="text-muted small p-2">No association data.</p>';
                    const fPVal = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? '<0.001' : formatNumber(p, 3, '--', true)) : '--';
                    const fORCI = (orObj) => `${formatNumber(orObj?.value, 2, '--', true)} (${formatNumber(orObj?.ci?.lower, 2, '--', true)}-${formatNumber(orObj?.ci?.upper, 2, '--', true)})`;
                    const fRDCI = (rdObj) => `${formatNumber(rdObj?.value * 100, 1, '--', true)}% (${formatNumber(rdObj?.ci?.lower * 100, 1, '--', true)}%-${formatNumber(rdObj?.ci?.upper * 100, 1, '--', true)}%)`;
                    const fPhi = (phiObj) => formatNumber(phiObj?.value, 2, '--', true);

                    let html = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th>Feature</th>
                        <th data-tooltip-key="association.or">OR (95% CI)</th>
                        <th data-tooltip-key="association.rd">RD (95% CI)</th>
                        <th data-tooltip-key="association.phi">Phi</th>
                        <th data-tooltip-key="association.fisher">p-Value</th>
                        <th>Test</th></tr></thead><tbody>`;

                    const addRow = (key, name, obj) => {
                        html += `<tr><td>${name}</td>
                            <td data-tooltip-key="association.or" data-tooltip-value='${JSON.stringify({value: obj.or?.value, ci: obj.or?.ci})}'>${fORCI(obj.or)}</td>
                            <td data-tooltip-key="association.rd" data-tooltip-value='${JSON.stringify({value: obj.rd?.value, ci: obj.rd?.ci})}'>${fRDCI(obj.rd)}</td>
                            <td data-tooltip-key="association.phi" data-tooltip-value='${JSON.stringify({value: obj.phi?.value})}'>${fPhi(obj.phi)}</td>
                            <td data-tooltip-key="association.fisher" data-tooltip-value='${JSON.stringify({p: obj.pValue})}'>${fPVal(obj.pValue)} ${getStatisticalSignificanceSymbol(obj.pValue)}</td>
                            <td>${obj.testName || '--'}</td></tr>`;
                    };

                    if (assocStats.as) addRow('as', 'AS Positive', assocStats.as);
                    if (assocStats.size_mwu) {
                        html += `<tr><td>${assocStats.size_mwu.featureName}</td><td>--</td><td>--</td><td>--</td>
                            <td data-tooltip-key="association.mwu" data-tooltip-value='${JSON.stringify({p: assocStats.size_mwu.pValue})}'>${fPVal(assocStats.size_mwu.pValue)} ${getStatisticalSignificanceSymbol(assocStats.size_mwu.pValue)}</td>
                            <td>${assocStats.size_mwu.testName || '--'}</td></tr>`;
                    }

                    ['size', 'shape', 'border', 'homogeneity', 'signal'].forEach(fKey => {
                        if (assocStats[fKey]) {
                            const activeStatus = appliedCrit?.[fKey]?.active ? '' : ' (inactive)';
                            addRow(fKey, `${assocStats[fKey].featureName}${activeStatus}`, assocStats[fKey]);
                        }
                    });
                    html += `</tbody></table></div>`;
                    return html;
                };

                innerContainer.innerHTML += uiComponents.createStatisticsCard(`performance-as-${i}`, 'Diagnostic Performance: Avocado Sign (AS vs. N)', createPerfTableHTML(stats.performanceAS), false, null, [{id: `dl-as-perf-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `performance-as-${i}-content table`, tableName: `AS_Performance_${cohortId.replace(/\s+/g, '_')}`}], `performance-as-${i}-content table`);
                innerContainer.innerHTML += uiComponents.createStatisticsCard(`performance-t2-${i}`, 'Diagnostic Performance: T2 (Applied Criteria vs. N)', createPerfTableHTML(stats.performanceT2), false, null, [{id: `dl-t2-perf-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `performance-t2-${i}-content table`, tableName: `T2_Applied_Performance_${cohortId.replace(/\s+/g, '_')}`}], `performance-t2-${i}-content table`);
                innerContainer.innerHTML += uiComponents.createStatisticsCard(`comparison-as-t2-${i}`, 'Statistical Comparison: AS vs. T2 (Applied Criteria)', createCompTableHTML(stats.comparisonASvsT2), false, null, [{id: `dl-comp-as-t2-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `comparison-as-t2-${i}-content table`, tableName: `Comp_AS_T2_Applied_${cohortId.replace(/\s+/g, '_')}`}], `comparison-as-t2-${i}-content table`);
                innerContainer.innerHTML += uiComponents.createStatisticsCard(`associations-${i}`, 'Association with N-Status', createAssocTableHTML(stats.associations, appliedCriteria), false, null, [{id: `dl-assoc-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `associations-${i}-content table`, tableName: `Associations_${cohortId.replace(/\s+/g, '_')}`}], `associations-${i}-content table`);

            } else {
                innerContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning small p-2">No data for this cohort.</div></div>';
            }
        });
        if (layout === 'einzel') {
            const criteriaComparisonCard = document.createElement('div');
            criteriaComparisonCard.className = 'col-12';
            criteriaComparisonCard.innerHTML = uiComponents.createStatisticsCard(
                'criteria-comparison',
                `Criteria Comparison: AS, Applied T2, & Literature Sets (for Cohort: ${getCohortDisplayName(globalCohort)})`,
                createCriteriaComparisonTableHTML(statisticsService.calculateAllPublicationStats(processedData, appliedCriteria, appliedLogic, bruteForceManager.getAllResults()), globalCohort),
                false,
                null,
                [{id: 'dl-criteria-comp-table-png', icon: 'fa-image', format: 'png', tableId: 'criteria-comparison-content table', tableName: `Criteria_Comparison_${globalCohort.replace(/\s+/g, '_')}`}],
                'criteria-comparison-content table'
            );
            outerRow.appendChild(criteriaComparisonCard);
        }

        setTimeout(() => {
            datasets.forEach((data, i) => {
                if (data.length > 0) {
                    const stats = statisticsService.calculateDescriptiveStats(data);
                    if (document.getElementById(`chart-stat-age-${i}`)) {
                        chartRenderer.renderAgeDistributionChart(stats.ageData, `chart-stat-age-${i}`, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 40 } });
                    }
                    if (document.getElementById(`chart-stat-gender-${i}`)) {
                        const genderData = [{label: 'Male', value: stats.sex.m ?? 0}, {label: 'Female', value: stats.sex.f ?? 0}];
                        if (stats.sex.unknown > 0) genderData.push({label: 'Unknown', value: stats.sex.unknown });
                        chartRenderer.renderPieChart(genderData, `chart-stat-gender-${i}`, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true });
                    }
                }
            });
            uiManager.initializeTooltips(outerRow);
        }, 50);
        return outerRow.outerHTML;
    }

    return { render };
})();
