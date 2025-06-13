const statisticsTab = (() => {

    function createDescriptiveStatsContentHTML(stats, indexSuffix, cohortId) {
        if (!stats || !stats.descriptive || !stats.descriptive.patientCount) return '<p class="text-muted small p-3">No descriptive data available.</p>';
        const d = stats.descriptive;
        const total = d.patientCount;
        const na = '--';
        const fv = (val, dig = 1, useStd = true) => formatNumber(val, dig, na, useStd);
        const fP = (val, dig = 1) => formatPercent(val, dig, na);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}–${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;

        const tooltips = {
            age: "Patient age in years (Median, Min-Max, Mean ± Standard Deviation).",
            sex: "Distribution of male and female patients.",
            therapy: "Distribution of treatment approaches before surgery.",
            nStatus: "Distribution of final histopathological N-Status (N+/N-).",
            asStatus: "Distribution of Avocado Sign status (AS+/AS-).",
            t2Status: "Distribution of T2-weighted criteria status (T2+/T2-) based on applied settings.",
            lnCounts_n_total: "Number of histopathologically examined lymph nodes per patient.",
            lnCounts_n_plus: `Number of pathologically positive lymph nodes per patient, evaluated only in N+ patients (n=${d.nStatus?.plus ?? 0}).`,
            lnCounts_as_total: "Total number of lymph nodes visible on T1-CE MRI per patient.",
            lnCounts_as_plus: `Number of Avocado Sign positive lymph nodes per patient, evaluated only in AS+ patients (n=${d.asStatus?.plus ?? 0}).`,
            lnCounts_t2_total: "Total number of lymph nodes visible on T2-MRI per patient.",
            lnCounts_t2_plus: `Number of T2-positive lymph nodes (based on applied criteria) per patient, evaluated only in T2+ patients (n=${d.t2Status?.plus ?? 0}).`,
            chartAge: `Histogram showing the distribution of patient ages in the <strong>${getCohortDisplayName(cohortId)}</strong> cohort.`,
            chartGender: `Pie chart illustrating the distribution of male and female patients in the <strong>${getCohortDisplayName(cohortId)}</strong> cohort.`
        };

        return `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-descriptive-demographics-${indexSuffix}">
                            <caption>Demographics & Status (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>Metric</th><th>Value</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content="${tooltips.age}"><td>Age, Median (Min–Max) [Mean ± SD]</td><td>${fv(d.age?.median,1)} (${fv(d.age?.min,0)}–${fv(d.age?.max,0)}) [${fv(d.age?.mean,1)} ± ${fv(d.age?.sd,1)}]</td></tr>
                                <tr data-tippy-content="${tooltips.sex}"><td>Sex (male / female) (n / %)</td><td>${d.sex?.m ?? 0} / ${d.sex?.f ?? 0} (${fP((d.sex?.m ?? 0) / total, 1)} / ${fP((d.sex?.f ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${tooltips.therapy}"><td>Therapy (Surgery alone / Neoadjuvant therapy) (n / %)</td><td>${d.therapy?.surgeryAlone ?? 0} / ${d.therapy?.neoadjuvantTherapy ?? 0} (${fP((d.therapy?.surgeryAlone ?? 0) / total, 1)} / ${fP((d.therapy?.neoadjuvantTherapy ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${tooltips.nStatus}"><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP((d.nStatus?.plus ?? 0) / total, 1)} / ${fP((d.nStatus?.minus ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${tooltips.asStatus}"><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP((d.asStatus?.plus ?? 0) / total, 1)} / ${fP((d.asStatus?.minus ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${tooltips.t2Status}"><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP((d.t2Status?.plus ?? 0) / total, 1)} / ${fP((d.t2Status?.minus ?? 0) / total, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-descriptive-ln-${indexSuffix}">
                             <caption>Lymph Node Counts (Median (Min–Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metric</th><th>Value</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${tooltips.lnCounts_n_total}"><td>LN N total</td><td>${fLK(d.lnCounts?.n?.total)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_n_plus}"><td>LN N+ <sup>*</sup></td><td>${fLK(d.lnCounts?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_as_total}"><td>LN AS total</td><td>${fLK(d.lnCounts?.as?.total)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_as_plus}"><td>LN AS+ <sup>**</sup></td><td>${fLK(d.lnCounts?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_t2_total}"><td>LN T2 total</td><td>${fLK(d.lnCounts?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_t2_plus}"><td>LN T2+ <sup>***</sup></td><td>${fLK(d.lnCounts?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Only in N+ patients (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Only in AS+ patients (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Only in T2+ patients (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="chart-stat-age-${indexSuffix}" data-tippy-content="${tooltips.chartAge}"></div>
                    <div class="flex-grow-1" id="chart-stat-gender-${indexSuffix}" data-tippy-content="${tooltips.chartGender}"></div>
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
            <th data-tippy-content="Method or criteria set being evaluated.">Set</th>
            <th data-tippy-content="${getDefinitionTooltip('sens')}">Sens.</th>
            <th data-tippy-content="${getDefinitionTooltip('spec')}">Spec.</th>
            <th data-tippy-content="${getDefinitionTooltip('ppv')}">PPV</th>
            <th data-tippy-content="${getDefinitionTooltip('npv')}">NPV</th>
            <th data-tippy-content="${getDefinitionTooltip('acc')}">Acc.</th>
            <th data-tippy-content="${getDefinitionTooltip('auc')}">AUC</th>
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

                const fCI_p_stat = (m, k) => { const d = (k === 'auc') ? 2 : ((k === 'f1') ? 3 : 1); const p = !(k === 'auc'||k==='f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, '--'); };
                const na_stat = '--';
                const createPerfTableHTML = (perfStats) => {
                    if (!perfStats || typeof perfStats.matrix !== 'object') return '<p class="text-muted small p-2">No diagnostic performance data.</p>';
                    return `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content="The diagnostic metric being evaluated.">Metric</th>
                        <th data-tippy-content="The calculated value for the metric, with its 95% Confidence Interval in parentheses.">Value (95% CI)</th>
                        <th data-tippy-content="The statistical method used to calculate the confidence interval.">CI Method</th></tr></thead><tbody>
                        <tr><td data-tippy-content="${getDefinitionTooltip('sens')}">Sensitivity</td><td data-tippy-content="${getInterpretationTooltip('sens', perfStats.sens)}">${fCI_p_stat(perfStats.sens, 'sens')}</td><td>${perfStats.sens?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('spec')}">Specificity</td><td data-tippy-content="${getInterpretationTooltip('spec', perfStats.spec)}">${fCI_p_stat(perfStats.spec, 'spec')}</td><td>${perfStats.spec?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('ppv')}">PPV</td><td data-tippy-content="${getInterpretationTooltip('ppv', perfStats.ppv)}">${fCI_p_stat(perfStats.ppv, 'ppv')}</td><td>${perfStats.ppv?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('npv')}">NPV</td><td data-tippy-content="${getInterpretationTooltip('npv', perfStats.npv)}">${fCI_p_stat(perfStats.npv, 'npv')}</td><td>${perfStats.npv?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('acc')}">Accuracy</td><td data-tippy-content="${getInterpretationTooltip('acc', perfStats.acc)}">${fCI_p_stat(perfStats.acc, 'acc')}</td><td>${perfStats.acc?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('balAcc')}">Balanced Accuracy</td><td data-tippy-content="${getInterpretationTooltip('balAcc', perfStats.balAcc)}">${fCI_p_stat(perfStats.balAcc, 'balAcc')}</td><td>${perfStats.balAcc?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('f1')}">F1-Score</td><td data-tippy-content="${getInterpretationTooltip('f1', perfStats.f1)}">${fCI_p_stat(perfStats.f1, 'f1')}</td><td>${perfStats.f1?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('auc')}">AUC</td><td data-tippy-content="${getInterpretationTooltip('auc', perfStats.auc)}">${fCI_p_stat(perfStats.auc, 'auc')}</td><td>${perfStats.auc?.method || na_stat}</td></tr>
                    </tbody></table></div>`;
                };

                const createCompTableHTML = (compStats) => {
                    if (!compStats) return '<p class="text-muted small p-2">No comparison data.</p>';
                    const mcnemarTooltip = getInterpretationTooltip('pValue', compStats.mcnemar, { method1: 'AS', method2: 'T2 (Applied)', metricName: 'Accuracy'});
                    const delongTooltip = getInterpretationTooltip('pValue', compStats.delong, { method1: 'AS', method2: 'T2 (Applied)', metricName: 'AUC'});
                    
                    return `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content="Statistical test used to compare the two methods.">Test</th>
                        <th data-tippy-content="The calculated value of the test statistic.">Statistic</th>
                        <th data-tippy-content="${getDefinitionTooltip('pValue')}">p-Value</th>
                        <th data-tippy-content="Name of the statistical test and any corrections applied.">Method</th></tr></thead><tbody>
                        <tr><td data-tippy-content="${getDefinitionTooltip('mcnemar')}">McNemar (Acc)</td><td>${formatNumber(compStats.mcnemar?.statistic, 3, na_stat, true)} (df=${compStats.mcnemar?.df || na_stat})</td><td data-tippy-content="${mcnemarTooltip}">${getPValueText(compStats.mcnemar?.pValue, false)} ${getStatisticalSignificanceSymbol(compStats.mcnemar?.pValue)}</td><td>${compStats.mcnemar?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('delong')}">DeLong (AUC)</td><td>Z=${formatNumber(compStats.delong?.Z, 3, na_stat, true)}</td><td data-tippy-content="${delongTooltip}">${getPValueText(compStats.delong?.pValue, false)} ${getStatisticalSignificanceSymbol(compStats.delong?.pValue)}</td><td>${compStats.delong?.method || na_stat}</td></tr>
                    </tbody></table></div>`;
                };

                const createAssocTableHTML = (assocStats, appliedCrit) => {
                    if (!assocStats || Object.keys(assocStats).length === 0) return '<p class="text-muted small p-2">No association data.</p>';
                    const fORCI = (orObj) => { const val = formatNumber(orObj?.value, 2, na_stat, true); const ciL = formatNumber(orObj?.ci?.lower, 2, na_stat, true); const ciU = formatNumber(orObj?.ci?.upper, 2, na_stat, true); return (val !== na_stat && ciL !== na_stat && ciU !== na_stat) ? `${val} (${ciL}-${ciU})` : val; };
                    const fRDCI = (rdObj) => { const val = formatNumber(rdObj?.value * 100, 1, na_stat, true); const ciL = formatNumber(rdObj?.ci?.lower * 100, 1, na_stat, true); const ciU = formatNumber(rdObj?.ci?.upper * 100, 1, na_stat, true); return (val !== na_stat && ciL !== na_stat && ciU !== na_stat) ? `${val}% (${ciL}%-${ciU}%)` : (val !== na_stat ? `${val}%` : na_stat); };
                    const fPhi = (phiObj) => formatNumber(phiObj?.value, 2, na_stat, true);

                    let html = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content="The specific imaging feature being tested for association with N-Status.">Feature</th>
                        <th data-tippy-content="${getDefinitionTooltip('or')}">OR (95% CI)</th>
                        <th data-tippy-content="${getDefinitionTooltip('rd')}">RD (95% CI)</th>
                        <th data-tippy-content="${getDefinitionTooltip('phi')}">Phi</th>
                        <th data-tippy-content="${getDefinitionTooltip('pValue')}">p-Value</th>
                        <th data-tippy-content="The statistical test used to calculate the p-value.">Test</th></tr></thead><tbody>`;

                    const addRow = (key, name, obj) => {
                        const pValueTooltip = getInterpretationTooltip('pValue', { ...obj, value: obj.pValue }, { comparisonName: `association of '${escapeHTML(name)}' with N-Status` });
                        html += `<tr><td>${escapeHTML(name)}</td>
                            <td data-tippy-content="${getInterpretationTooltip('or', obj.or)}">${fORCI(obj.or)}</td>
                            <td data-tippy-content="${getInterpretationTooltip('rd', obj.rd)}">${fRDCI(obj.rd)}</td>
                            <td data-tippy-content="${getInterpretationTooltip('phi', obj.phi)}">${fPhi(obj.phi)}</td>
                            <td data-tippy-content="${pValueTooltip}">${getPValueText(obj.pValue, false)} ${getStatisticalSignificanceSymbol(obj.pValue)}</td>
                            <td>${obj.testName || na_stat}</td></tr>`;
                    };

                    if (assocStats.as) addRow('as', 'AS Positive', assocStats.as);
                    if (assocStats.size_mwu) {
                         const mwuTooltip = getInterpretationTooltip('pValue', { ...assocStats.size_mwu, value: assocStats.size_mwu.pValue }, { comparisonName: 'median LN size between N+ and N- groups' });
                        html += `<tr><td>${assocStats.size_mwu.featureName}</td><td>${na_stat}</td><td>${na_stat}</td><td>${na_stat}</td><td data-tippy-content="${mwuTooltip}">${getPValueText(assocStats.size_mwu.pValue, false)} ${getStatisticalSignificanceSymbol(assocStats.size_mwu.pValue)}</td><td>${assocStats.size_mwu.testName || na_stat}</td></tr>`;
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
                'criteriaComparisonTable',
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
