const statisticsTab = (() => {

    function createDescriptiveStatsContentHTML(stats, indexSuffix, cohortId) {
        if (!stats || !stats.descriptive || !stats.descriptive.patientCount) return '<p class="text-muted small p-3">No descriptive data available.</p>';
        const d = stats.descriptive;
        const total = d.patientCount;
        const na = '--';
        const fv = (val, dig = 1, useStd = true) => formatNumber(val, dig, na, useStd);
        const fP = (val, dig = 1) => formatPercent(val, dig, na);
        const fLK = (lkData) => `<span class="math-inline">\{fv\(lkData?\.median,1\)\} \(</span>{fv(lkData?.min,0)}–<span class="math-inline">\{fv\(lkData?\.max,0\)\}\) \[</span>{fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;
        
        // Prepare tooltip content as JSON string for descriptive metrics
        const getDescriptiveTooltip = (key, currentCohortId) => JSON.stringify({
            type: 'descriptive',
            key: key,
            cohort: currentCohortId,
            description: APP_CONFIG.UI_TEXTS.tooltips.descriptiveStatistics[key]?.description.replace('[COHORT]', `<strong>${getCohortDisplayName(currentCohortId)}</strong>`) || key
        });


        return `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-descriptive-demographics-<span class="math-inline">\{indexSuffix\}"\>
<caption\>Demographics & Status \(N\=</span>{total})</caption>
                            <thead class="visually-hidden"><tr><th>Metric</th><th>Value</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content='<span class="math-inline">\{getDescriptiveTooltip\("age", cohortId\)\}'\><td\>Age, Median \(Min–Max\) \[Mean ± SD\]</td\><td\></span>{fv(d.age?.median,1)} (<span class="math-inline">\{fv\(d\.age?\.min,0\)\}–</span>{fv(d.age?.max,0)}) [${fv(d.age?.mean,1)} ± <span class="math-inline">\{fv\(d\.age?\.sd,1\)\}\]</td\></tr\>
<tr data\-tippy\-content\='</span>{getDescriptiveTooltip("sex", cohortId)}'><td>Sex (male / female) (n / %)</td><td>${d.sex?.m ?? 0} / <span class="math-inline">\{d\.sex?\.f ?? 0\} \(</span>{fP((d.sex?.m ?? 0) / total, 1)} / <span class="math-inline">\{fP\(\(d\.sex?\.f ?? 0\) / total, 1\)\}\)</td\></tr\>
<tr data\-tippy\-content\='</span>{getDescriptiveTooltip("therapy", cohortId)}'><td>Therapy (Surgery alone / Neoadjuvant therapy) (n / %)</td><td>${d.therapy?.surgeryAlone ?? 0} / <span class="math-inline">\{d\.therapy?\.neoadjuvantTherapy ?? 0\} \(</span>{fP((d.therapy?.surgeryAlone ?? 0) / total, 1)} / <span class="math-inline">\{fP\(\(d\.therapy?\.neoadjuvantTherapy ?? 0\) / total, 1\)\}\)</td\></tr\>
<tr data\-tippy\-content\='</span>{getDescriptiveTooltip("nStatus", cohortId)}'><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / <span class="math-inline">\{d\.nStatus?\.minus ?? 0\} \(</span>{fP((d.nStatus?.plus ?? 0) / total, 1)} / <span class="math-inline">\{fP\(\(d\.nStatus?\.minus ?? 0\) / total, 1\)\}\)</td\></tr\>
<tr data\-tippy\-content\='</span>{getDescriptiveTooltip("asStatus", cohortId)}'><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / <span class="math-inline">\{d\.asStatus?\.minus ?? 0\} \(</span>{fP((d.asStatus?.plus ?? 0) / total, 1)} / <span class="math-inline">\{fP\(\(d\.asStatus?\.minus ?? 0\) / total, 1\)\}\)</td\></tr\>
<tr data\-tippy\-content\='</span>{getDescriptiveTooltip("t2Status", cohortId)}'><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / <span class="math-inline">\{d\.t2Status?\.minus ?? 0\} \(</span>{fP((d.t2Status?.plus ?? 0) / total, 1)} / <span class="math-inline">\{fP\(\(d\.t2Status?\.minus ?? 0\) / total, 1\)\}\)</td\></tr\>
</tbody\>
</table\>
</div\>
<div class\="table\-responsive"\>
<table class\="table table\-sm table\-striped small mb\-0 caption\-top" id\="table\-descriptive\-ln\-</span>{indexSuffix}">
                             <caption>Lymph Node Counts (Median (Min–Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metric</th><th>Value</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content='<span class="math-inline">\{getDescriptiveTooltip\("lnCounts\_n\_total", cohortId\)\}'\><td\>LN N total</td\><td\></span>{fLK(d.lnCounts?.n?.total)}</td></tr>
                                <tr data-tippy-content='<span class="math-inline">\{getDescriptiveTooltip\("lnCounts\_n\_plus", cohortId\)\}'\><td\>LN N\+ <sup\>\*</sup\></td\><td\></span>{fLK(d.lnCounts?.n?.plus)}</td></tr>
                                <tr data-tippy-content='<span class="math-inline">\{getDescriptiveTooltip\("lnCounts\_as\_total", cohortId\)\}'\><td\>LN AS total</td\><td\></span>{fLK(d.lnCounts?.as?.total)}</td></tr>
                                <tr data-tippy-content='<span class="math-inline">\{getDescriptiveTooltip\("lnCounts\_as\_plus", cohortId\)\}'\><td\>LN AS\+ <sup\>\*\*</sup\></td\><td\></span>{fLK(d.lnCounts?.as?.plus)}</td></tr>
                                <tr data-tippy-content='<span class="math-inline">\{getDescriptiveTooltip\("lnCounts\_t2\_total", cohortId\)\}'\><td\>LN T2 total</td\><td\></span>{fLK(d.lnCounts?.t2?.total)}</td></tr>
                                <tr data-tippy-content='<span class="math-inline">\{getDescriptiveTooltip\("lnCounts\_t2\_plus", cohortId\)\}'\><td\>LN T2\+ <sup\>\*\*\*</sup\></td\><td\></span>{fLK(d.lnCounts?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Only in N+ patients (n=<span class="math-inline">\{d\.nStatus?\.plus ?? 0\}\); <sup\>\*\*</sup\> Only in AS\+ patients \(n\=</span>{d.asStatus?.plus ?? 0}); <sup>***</sup> Only in T2+ patients (n=<span class="math-inline">\{d\.t2Status?\.plus ?? 0\}\)\.</p\>
</div\>
<div class\="col\-md\-6 d\-flex flex\-column"\>
<div class\="mb\-2 flex\-grow\-1" id\="chart\-stat\-age\-</span>{indexSuffix}" data-tippy-content='<span class="math-inline">\{getDescriptiveTooltip\("chartAge", cohortId\)\}'\></div\>
<div class\="flex\-grow\-1" id\="chart\-stat\-gender\-</span>{indexSuffix}" data-tippy-content='${getDescriptiveTooltip("chartGender", cohortId)}'></div>
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
            <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_header', key\: 'tableHeaderSet', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.criteriaComparisonTable\.tableHeaderSet\}\)\}'\></span>{APP_CONFIG.UI_TEXTS.tooltips.criteriaComparisonTable.tableHeaderSet}</th>
            <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_header', key\: 'tableHeaderSens', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.criteriaComparisonTable\.tableHeaderSens\}\)\}'\></span>{APP_CONFIG.UI_TEXTS.tooltips.criteriaComparisonTable.tableHeaderSens}</th>
            <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_header', key\: 'tableHeaderSpec', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.criteriaComparisonTable\.tableHeaderSpec\}\)\}'\></span>{APP_CONFIG.UI_TEXTS.tooltips.criteriaComparisonTable.tableHeaderSpec}</th>
            <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_header', key\: 'tableHeaderPPV', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.criteriaComparisonTable\.tableHeaderPPV\}\)\}'\></span>{APP_CONFIG.UI_TEXTS.tooltips.criteriaComparisonTable.tableHeaderPPV}</th>
            <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_header', key\: 'tableHeaderNPV', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.criteriaComparisonTable\.tableHeaderNPV\}\)\}'\></span>{APP_CONFIG.UI_TEXTS.tooltips.criteriaComparisonTable.tableHeaderNPV}</th>
            <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_header', key\: 'tableHeaderAcc', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.criteriaComparisonTable\.tableHeaderAcc\}\)\}'\></span>{APP_CONFIG.UI_TEXTS.tooltips.criteriaComparisonTable.tableHeaderAcc}</th>
            <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_header', key\: 'tableHeaderAUC', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.criteriaComparisonTable\.tableHeaderAUC\}\)\}'\></span>{APP_CONFIG.UI_TEXTS.tooltips.criteriaComparisonTable.tableHeaderAUC}</th>
        </tr></thead><tbody>`;

        allTableResults.forEach(r => {
            const cohortInfo = (r.cohort !== getCohortDisplayName(globalCoh)) ? ` (<span class="math-inline">\{r\.cohort\} N\=</span>{r.n})` : ``;
            tableHtml += `<tr>
                <td><span class="math-inline">\{r\.name\}</span>{cohortInfo}</td>
                <td data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_value', metricName\: 'Sens\.', value\: r\.sens, isPercent\: true\}\)\}'\></span>{formatPercent(r.sens, 1, na_stat)}</td>
                <td data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_value', metricName\: 'Spec\.', value\: r\.spec, isPercent\: true\}\)\}'\></span>{formatPercent(r.spec, 1, na_stat)}</td>
                <td data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_value', metricName\: 'PPV', value\: r\.ppv, isPercent\: true\}\)\}'\></span>{formatPercent(r.ppv, 1, na_stat)}</td>
                <td data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_value', metricName\: 'NPV', value\: r\.npv, isPercent\: true\}\)\}'\></span>{formatPercent(r.npv, 1, na_stat)}</td>
                <td data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_value', metricName\: 'Acc\.', value\: r\.acc, isPercent\: true\}\)\}'\></span>{formatPercent(r.acc, 1, na_stat)}</td>
                <td data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'criteria\_comparison\_value', metricName\: 'AUC/Bal\. Acc\.', value\: r\.auc, isPercent\: false\}\)\}'\></span>{formatNumber(r.auc, 2, na_stat, true)}</td>
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
            col.innerHTML = `<h4 class="mb-3">Cohort: <span class="math-inline">\{getCohortDisplayName\(cohortId\)\} \(N\=</span>{data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`;
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
                innerContainer.innerHTML += uiComponents.createStatisticsCard(`descriptive-stats-${i}`, 'Descriptive Statistics', createDescriptiveStatsContentHTML({descriptive: stats.descriptive}, i, cohortId), true, 'descriptiveStatistics', [{id: `dl-desc-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `table-descriptive-demographics-${i}`, tableName: `Descriptive_Demographics_${cohortId.replace(/\s+/g, '_')}`}], `table-descriptive-demographics-${i}`);

                const fCI_p_stat = (m, k) => { const d = (k === 'auc') ? 2 : ((k === 'f1') ? 3 : 1); const p = !(k === 'auc'||k==='f1'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, '--'); };
                const na_stat = '--';
                const createPerfTableHTML = (perfStats, metricType) => { // Added metricType parameter
                    if (!perfStats || typeof perfStats.matrix !== 'object') return '<p class="text-muted small p-2">No diagnostic performance data.</p>';
                    
                    const createPerfRowHTML = (metricKey, label, metricObj) => {
                        const isPercent = !(metricKey === 'auc' || metricKey === 'f1');
                        const digits = (metricKey === 'auc') ? 2 : ((metricKey === 'f1') ? 3 : 1);
                        const metricValueCI = fCI_p_stat(metricObj, metricKey);

                        const tooltipContent = JSON.stringify({
                            type: 'metric',
                            metricKey: metricKey,
                            value: metricObj?.value,
                            ci_lower: metricObj?.ci?.lower,
                            ci_upper: metricObj?.ci?.upper,
                            metricType: metricType,
                            method: metricObj?.method
                        });

                        return `
                            <tr>
                                <td data-tippy-content='<span class="math-inline">\{tooltipContent\}'\></span>{label}</td>
                                <td data-tippy-content='<span class="math-inline">\{tooltipContent\}'\></span>{metricValueCI}</td>
                                <td data-tippy-content='${JSON.stringify({ type: 'metric', metricKey: 'ci_method', method: metricObj?.method, description: APP_CONFIG.UI_TEXTS.tooltips[`diagnosticPerformance${metricType}`].ci_method.description })}'>${metricObj?.method || na_stat}</td>
                            </tr>
                        `;
                    };

                    return `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'generic', description\: 'Diagnostic metric like Sensitivity, Specificity, Accuracy etc\.'\}\)\}'\>Metric</th\>
<th data\-tippy\-content\='</span>{JSON.stringify({type: 'generic', description: 'Value of the diagnostic metric with its 95% Confidence Interval.'})}'>Value (95% CI)</th>
                        <th data-tippy-content='${JSON.stringify({type: 'generic', description: 'Statistical method used to calculate the 95% Confidence Interval.'})}'>CI Method</th>
                    </tr></thead><tbody>
                        ${createPerfRowHTML('sens', 'Sensitivity', perfStats.sens)}
                        ${createPerfRowHTML('spec', 'Specificity', perfStats.spec)}
                        ${createPerfRowHTML('ppv', 'PPV', perfStats.ppv)}
                        ${createPerfRowHTML('npv', 'NPV', perfStats.npv)}
                        ${createPerfRowHTML('acc', 'Accuracy', perfStats.acc)}
                        ${createPerfRowHTML('balAcc', 'Balanced Accuracy', perfStats.balAcc)}
                        ${createPerfRowHTML('f1', 'F1-Score', perfStats.f1)}
                        ${createPerfRowHTML('auc', 'AUC', perfStats.auc)}
                    </tbody></table></div>`;
                };

                const createCompTableHTML = (compStats) => {
                    if (!compStats) return '<p class="text-muted small p-2">No comparison data.</p>';
                    const fPVal = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? '<0.001' : formatNumber(p, 3, '--', true)) : na_stat;
                    
                    const mcnemarTooltipContent = JSON.stringify({
                        type: 'comparison',
                        testKey: 'mcnemar',
                        statistic: compStats.mcnemar?.statistic,
                        pValue: compStats.mcnemar?.pValue,
                        cohortName: getCohortDisplayName(cohortId)
                    });
                    const delongTooltipContent = JSON.stringify({
                        type: 'comparison',
                        testKey: 'delong',
                        statistic: compStats.delong?.Z,
                        pValue: compStats.delong?.pValue,
                        diffAUC: compStats.delong?.diffAUC,
                        cohortName: getCohortDisplayName(cohortId)
                    });
                    const pValueTooltipContent = (pValue) => JSON.stringify({
                        type: 'p_value',
                        pValue: pValue
                    });
                    const methodTooltipContent = (methodName) => JSON.stringify({
                        type: 'generic',
                        description: `The statistical method used was: ${methodName}.`
                    });

                    return `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'generic', description\: 'Statistical test performed to compare diagnostic methods\.'\}\)\}'\>Test</th\>
<th data\-tippy\-content\='</span>{JSON.stringify({type: 'generic', description: 'Resulting statistic value from the test.'})}'>Statistic</th>
                        <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'generic', description\: 'Probability \(p\-value\) of observing the results by chance if there is no true difference\.'\}\)\}'\>p\-Value</th\>
<th data\-tippy\-content\='</span>{JSON.stringify({type: 'generic', description: 'Name of the statistical test used.'})}'>Method</th>
                    </tr></thead><tbody>
                        <tr>
                            <td data-tippy-content='<span class="math-inline">\{mcnemarTooltipContent\}'\>McNemar \(Acc\)</td\>
<td data\-tippy\-content\='</span>{mcnemarTooltipContent}'><span class="math-inline">\{formatNumber\(compStats\.mcnemar?\.statistic, 3, na\_stat, true\)\} \(df\=</span>{compStats.mcnemar?.df || na_stat})</td>
                            <td data-tippy-content='<span class="math-inline">\{pValueTooltipContent\(compStats\.mcnemar?\.pValue\)\}'\></span>{fPVal(compStats.mcnemar?.pValue)} <span class="math-inline">\{getStatisticalSignificanceSymbol\(compStats\.mcnemar?\.pValue\)\}</td\>
<td data\-tippy\-content\='</span>{methodTooltipContent(compStats.mcnemar?.method)}'><span class="math-inline">\{compStats\.mcnemar?\.method \|\| na\_stat\}</td\>
</tr\>
<tr\>
<td data\-tippy\-content\='</span>{delongTooltipContent}'>DeLong (AUC)</td>
                            <td data-tippy-content='<span class="math-inline">\{delongTooltipContent\}'\>Z\=</span>{formatNumber(compStats.delong?.Z, 3, na_stat, true)}</td>
                            <td data-tippy-content='<span class="math-inline">\{pValueTooltipContent\(compStats\.delong?\.pValue\)\}'\></span>{fPVal(compStats.delong?.pValue)} <span class="math-inline">\{getStatisticalSignificanceSymbol\(compStats\.delong?\.pValue\)\}</td\>
<td data\-tippy\-content\='</span>{methodTooltipContent(compStats.delong?.method)}'>${compStats.delong?.method || na_stat}</td>
                        </tr>
                    </tbody></table></div>`;
                };

                const createAssocTableHTML = (assocStats, appliedCrit) => {
                    if (!assocStats || Object.keys(assocStats).length === 0) return '<p class="text-muted small p-2">No association data.</p>';
                    const fPVal = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? '<0.001' : formatNumber(p, 3, na_stat, true)) : na_stat;
                    const fORCI = (orObj) => { const val = formatNumber(orObj?.value, 2, na_stat, true); const ciL = formatNumber(orObj?.ci?.lower, 2, na_stat, true); const ciU = formatNumber(orObj?.ci?.upper, 2, na_stat, true); return `<span class="math-inline">\{val\} \(</span>{ciL}-${ciU})`; };
                    const fRDCI = (rdObj) => { const val = formatNumber(rdObj?.value * 100, 1, na_stat, true); const ciL = formatNumber(rdObj?.ci?.lower * 100, 1, na_stat, true); const ciU = formatNumber(rdObj?.ci?.upper * 100, 1, na_stat, true); return `<span class="math-inline">\{val\}% \(</span>{ciL}%-${ciU}%)`; };
                    const fPhi = (phiObj) => formatNumber(phiObj?.value, 2, na_stat, true);

                    let html = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'generic', description\: 'Feature analyzed for association with N\-status\.'\}\)\}'\>Feature</th\>
<th data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'or', description: APP_CONFIG.UI_TEXTS.tooltips.associationSingleCriteria.or.description})}'>OR (95% CI)</th>
                        <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'association', metricKey\: 'rd', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.associationSingleCriteria\.rd\.description\}\)\}'\>RD \(95% CI\)</th\>
<th data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'phi', description: APP_CONFIG.UI_TEXTS.tooltips.associationSingleCriteria.phi.description})}'>Phi</th>
                        <th data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'association', metricKey\: 'pValue', description\: APP\_CONFIG\.UI\_TEXTS\.tooltips\.associationSingleCriteria\.pValue\.description\}\)\}'\>p\-Value</th\>
<th data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'test', description: APP_CONFIG.UI_TEXTS.tooltips.associationSingleCriteria.test.description})}'>Test</th>
                    </tr></thead><tbody>`;

                    const addRow = (key, name, obj) => {
                        if (!obj) return; // Ensure obj exists
                        const orValue = obj.or?.value;
                        const orCIL = obj.or?.ci?.lower;
                        const orCIU = obj.or?.ci?.upper;

                        const rdValue = obj.rd?.value;
                        const rdCIL = obj.rd?.ci?.lower;
                        const rdCIU = obj.rd?.ci?.upper;

                        const phiValue = obj.phi?.value;
                        const pValue = obj.pValue;
                        const testName = obj.testName;

                        html += `<tr>
                            <td><span class="math-inline">\{name\}</td\>
<td data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'or', value: orValue, ci_lower: orCIL, ci_upper: orCIU, pValue: pValue, featureName: name, testName: testName})}'><span class="math-inline">\{fORCI\(obj\.or\)\}</td\>
<td data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'rd', value: rdValue, ci_lower: rdCIL, ci_upper: rdCIU, pValue: pValue, featureName: name, testName: testName})}'><span class="math-inline">\{fRDCI\(obj\.rd\)\}</td\>
<td data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'phi', value: phiValue, pValue: pValue, featureName: name, testName: testName})}'><span class="math-inline">\{fPhi\(obj\.phi\)\}</td\>
<td data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'pValue', pValue: pValue, featureName: name})}'>${fPVal(pValue)} <span class="math-inline">\{getStatisticalSignificanceSymbol\(pValue\)\}</td\>
<td data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'test', testName: testName})}'>${testName || na_stat}</td>
                        </tr>`;
                    };

                    if (assocStats.as) addRow('as', 'AS Positive', assocStats.as);
                    if (assocStats.size_mwu) {
                        const mwuPValue = assocStats.size_mwu.pValue;
                        const mwuTestName = assocStats.size_mwu.testName;
                        html += `<tr>
                            <td><span class="math-inline">\{assocStats\.size\_mwu\.featureName\}</td\>
<td\></span>{na_stat}</td>
                            <td><span class="math-inline">\{na\_stat\}</td\>
<td\></span>{na_stat}</td>
                            <td data-tippy-content='<span class="math-inline">\{JSON\.stringify\(\{type\: 'association', metricKey\: 'pValue', pValue\: mwuPValue, featureName\: assocStats\.size\_mwu\.featureName\}\)\}'\></span>{fPVal(mwuPValue)} <span class="math-inline">\{getStatisticalSignificanceSymbol\(mwuPValue\)\}</td\>
<td data\-tippy\-content\='</span>{JSON.stringify({type: 'association', metricKey: 'test', testName: mwuTestName})}'>${mwuTestName || na_stat}</td>
                        </tr>`;
                    }

                    ['size', 'shape', 'border', 'homogeneity', 'signal'].forEach(fKey => {
                        if (assocStats[fKey]) {
                            const activeStatus = appliedCrit?.[fKey]?.active ? '' : ' (inactive)';
                            addRow(fKey, `${assocStats[fK<ctrl63>
