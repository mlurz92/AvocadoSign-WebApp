const publicationTab = (() => {

    function _getSectionContent(sectionId, lang, stats, commonData) {
        if (!UI_TEXTS.publicationContent || !UI_TEXTS.publicationContent[sectionId] || !UI_TEXTS.publicationContent[sectionId][lang]) {
            return `<p class="text-warning">Content for section '${sectionId}' in language '${lang}' is not available.</p>`;
        }
        return UI_TEXTS.publicationContent[sectionId][lang](stats, commonData);
    }

    function _getPublicationTable(tableId, tableType, data, lang, stats, commonData, options = {}) {
        let headers = [], rows = [], caption = '';
        const na = 'N/A';
        const fv = (val, dig = 1, useStd = true) => formatNumber(val, dig, na, useStd);
        const fP = (val, dig = 1) => formatPercent(val, dig, na);
        const fCI_pub = (metric) => {
            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return na;
            const digits = (metric.name === 'auc') ? 2 : ((metric.name === 'f1') ? 3 : 1);
            const isPercent = !(metric.name === 'auc' || metric.name === 'f1');
            const valueStr = isPercent ? fP(metric.value, digits) : fv(metric.value, digits, true);

            if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                return valueStr;
            }
            const lowerStr = isPercent ? fP(metric.ci.lower, digits) : fv(metric.ci.lower, digits, true);
            const upperStr = isPercent ? fP(metric.ci.upper, digits) : fv(metric.ci.upper, digits, true);
            return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`;
        };
        const getPValueTextForPublication = (pValue) => {
            if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';
            const pLessThanThreshold = 0.001;
            if (pValue < pLessThanThreshold) { return 'P < .001'; }
            const pFormatted = formatNumber(pValue, 3, 'N/A', true);
            return `P = ${pFormatted}`;
        };

        if (tableId === PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id) {
            caption = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle[`title${lang === 'en' ? 'En' : 'De'}`];
            headers = ['Criteria Set (Evaluated Cohort)', 'Size Threshold', 'Shape', 'Border', 'Homogeneity', 'Signal', 'Logic', 'Reference'];
            rows = PUBLICATION_CONFIG.literatureCriteriaSets.map(set => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(set.id);
                if (!studySet) return null;
                const criteria = studySet.criteria;
                return [
                    `${studySet.name} (${getCohortDisplayName(studySet.applicableCohort)})`,
                    criteria.size?.active ? `${criteria.size.condition}${fv(criteria.size.threshold, 1)}mm` : 'N/A',
                    criteria.shape?.active ? criteria.shape.value : 'N/A',
                    criteria.border?.active ? criteria.border.value : 'N/A',
                    criteria.homogeneity?.active ? criteria.homogeneity.value : 'N/A',
                    criteria.signal?.active ? criteria.signal.value : 'N/A',
                    studySet.logic,
                    studySet.studyInfo?.reference || 'N/A'
                ];
            }).filter(row => row !== null);
        } else if (tableId === PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id) {
            caption = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle[`title${lang === 'en' ? 'En' : 'De'}`];
            headers = ['Characteristic', 'Value'];
            const d = stats?.Gesamt?.descriptive;
            if (d) {
                const total = d.patientCount;
                rows = [
                    ['Age—mean ± SD', `${fv(d.age?.mean, 1)} ± ${fv(d.age?.sd, 1)}`],
                    ['Male—no. (%)', `${d.sex?.m ?? 0} (${fP((d.sex?.m ?? 0) / total, 1)})`],
                    ['Female—no. (%)', `${d.sex?.f ?? 0} (${fP((d.sex?.f ?? 0) / total, 1)})`],
                    ['Treatment approach—no. (%)', ''],
                    ['  Surgery alone', `${d.therapy?.['direkt OP'] ?? 0} (${fP((d.therapy?.['direkt OP'] ?? 0) / total, 1)})`],
                    ['  Neoadjuvant therapy', `${d.therapy?.nRCT ?? 0} (${fP((d.therapy?.nRCT ?? 0) / total, 1)})`],
                    ['N+ patients—no. (%)', `${d.nStatus?.plus ?? 0} (${fP((d.nStatus?.plus ?? 0) / total, 1)})`]
                ];
            } else {
                rows = [['No data available', '']];
            }
        } else if (tableId === PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id) {
            caption = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle[`title${lang === 'en' ? 'En' : 'De'}`];
            headers = ['Metric', `Overall (n = ${stats?.Gesamt?.descriptive?.patientCount || '?'})`, `Surgery alone (n = ${stats?.['direkt OP']?.descriptive?.patientCount || '?'})`, `Neoadjuvant therapy (n = ${stats?.nRCT?.descriptive?.patientCount || '?'})`];
            const getRow = (metricKey, formatFn) => {
                return [
                    UI_TEXTS.statMetrics[metricKey]?.name || metricKey,
                    formatFn(stats?.Gesamt?.performanceAS?.[metricKey]),
                    formatFn(stats?.['direkt OP']?.performanceAS?.[metricKey]),
                    formatFn(stats?.nRCT?.performanceAS?.[metricKey])
                ];
            };
            const fCI = (metric, digits = 1, isPercent = true) => {
                if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return na;
                const valueStr = isPercent ? formatPercent(metric.value, digits) : fv(metric.value, digits, true);
                if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                    return valueStr;
                }
                const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : fv(metric.ci.lower, digits, true);
                const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : fv(metric.ci.upper, digits, true);
                return `${valueStr} (${lowerStr}–${upperStr})`;
            };

            const confusionMatrixRow = (statsObj, label) => {
                if (!statsObj || !statsObj.matrix) return [`${label}`, ...Array(3).fill(na)];
                return [
                    label,
                    `${statsObj.matrix.tp + statsObj.matrix.fp}`,
                    `${statsObj.matrix.fn + statsObj.matrix.tn}`,
                    `${statsObj.matrix.tp + statsObj.matrix.fn}`,
                    `${statsObj.matrix.fp + statsObj.matrix.tn}`,
                    `${statsObj.matrix.tp}`,
                    `${statsObj.matrix.fp}`,
                    `${statsObj.matrix.fn}`,
                    `${statsObj.matrix.tn}`
                ];
            };

            let tableHtmlContent = `
                <table class="table table-sm table-striped small">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Overall (n = ${stats?.Gesamt?.descriptive?.patientCount || '?'})</th>
                            <th>Surgery alone (n = ${stats?.['direkt OP']?.descriptive?.patientCount || '?'})</th>
                            <th>Neoadjuvant therapy (n = ${stats?.nRCT?.descriptive?.patientCount || '?'})</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>AS+</td><td>${stats?.Gesamt?.performanceAS?.matrix?.tp + stats?.Gesamt?.performanceAS?.matrix?.fp || na}</td><td>${stats?.['direkt OP']?.performanceAS?.matrix?.tp + stats?.['direkt OP']?.performanceAS?.matrix?.fp || na}</td><td>${stats?.nRCT?.performanceAS?.matrix?.tp + stats?.nRCT?.performanceAS?.matrix?.fp || na}</td></tr>
                        <tr><td>AS−</td><td>${stats?.Gesamt?.performanceAS?.matrix?.fn + stats?.Gesamt?.performanceAS?.matrix?.tn || na}</td><td>${stats?.['direkt OP']?.performanceAS?.matrix?.fn + stats?.['direkt OP']?.performanceAS?.matrix?.tn || na}</td><td>${stats?.nRCT?.performanceAS?.matrix?.fn + stats?.nRCT?.performanceAS?.matrix?.tn || na}</td></tr>
                        <tr><td>N+</td><td>${stats?.Gesamt?.performanceAS?.matrix?.tp + stats?.Gesamt?.performanceAS?.matrix?.fn || na}</td><td>${stats?.['direkt OP']?.performanceAS?.matrix?.tp + stats?.['direkt OP']?.performanceAS?.matrix?.fn || na}</td><td>${stats?.nRCT?.performanceAS?.matrix?.tp + stats?.nRCT?.performanceAS?.matrix?.fn || na}</td></tr>
                        <tr><td>N0</td><td>${stats?.Gesamt?.performanceAS?.matrix?.fp + stats?.Gesamt?.performanceAS?.matrix?.tn || na}</td><td>${stats?.['direkt OP']?.performanceAS?.matrix?.fp + stats?.['direkt OP']?.performanceAS?.matrix?.tn || na}</td><td>${stats?.nRCT?.performanceAS?.matrix?.fp + stats?.nRCT?.performanceAS?.matrix?.tn || na}</td></tr>
                        <tr><td>AS+ N+</td><td>${stats?.Gesamt?.performanceAS?.matrix?.tp || na}</td><td>${stats?.['direkt OP']?.performanceAS?.matrix?.tp || na}</td><td>${stats?.nRCT?.performanceAS?.matrix?.tp || na}</td></tr>
                        <tr><td>AS+ N0</td><td>${stats?.Gesamt?.performanceAS?.matrix?.fp || na}</td><td>${stats?.['direkt OP']?.performanceAS?.matrix?.fp || na}</td><td>${stats?.nRCT?.performanceAS?.matrix?.fp || na}</td></tr>
                        <tr><td>AS− N+</td><td>${stats?.Gesamt?.performanceAS?.matrix?.fn || na}</td><td>${stats?.['direkt OP']?.performanceAS?.matrix?.fn || na}</td><td>${stats?.nRCT?.performanceAS?.matrix?.fn || na}</td></tr>
                        <tr><td>AS− N0</td><td>${stats?.Gesamt?.performanceAS?.matrix?.tn || na}</td><td>${stats?.['direkt OP']?.performanceAS?.matrix?.tn || na}</td><td>${stats?.nRCT?.performanceAS?.matrix?.tn || na}</td></tr>
                        <tr><td>Sensitivity (95% CI)</td><td>${fCI(stats?.Gesamt?.performanceAS?.sens)}</td><td>${fCI(stats?.['direkt OP']?.performanceAS?.sens)}</td><td>${fCI(stats?.nRCT?.performanceAS?.sens)}</td></tr>
                        <tr><td>Specificity (95% CI)</td><td>${fCI(stats?.Gesamt?.performanceAS?.spec)}</td><td>${fCI(stats?.['direkt OP']?.performanceAS?.spec)}</td><td>${fCI(stats?.nRCT?.performanceAS?.spec)}</td></tr>
                        <tr><td>PPV (95% CI)</td><td>${fCI(stats?.Gesamt?.performanceAS?.ppv)}</td><td>${fCI(stats?.['direkt OP']?.performanceAS?.ppv)}</td><td>${fCI(stats?.nRCT?.performanceAS?.ppv)}</td></tr>
                        <tr><td>NPV (95% CI)</td><td>${fCI(stats?.Gesamt?.performanceAS?.npv)}</td><td>${fCI(stats?.['direkt OP']?.performanceAS?.npv)}</td><td>${fCI(stats?.nRCT?.performanceAS?.npv)}</td></tr>
                        <tr><td>Accuracy (95% CI)</td><td>${fCI(stats?.Gesamt?.performanceAS?.acc)}</td><td>${fCI(stats?.['direkt OP']?.performanceAS?.acc)}</td><td>${fCI(stats?.nRCT?.performanceAS?.acc)}</td></tr>
                        <tr><td>AUC (95% CI)</td><td>${fCI(stats?.Gesamt?.performanceAS?.auc, 2, false)}</td><td>${fCI(stats?.['direkt OP']?.performanceAS?.auc, 2, false)}</td><td>${fCI(stats?.nRCT?.performanceAS?.auc, 2, false)}</td></tr>
                    </tbody>
                </table>
            `;
            return tableHtmlContent;
        } else if (tableId === PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id) {
            caption = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle[`title${lang === 'en' ? 'En' : 'De'}`];
            headers = ['Criteria Set (Evaluated Cohort)', 'Sens. (95% CI)', 'Spec. (95% CI)', 'PPV (95% CI)', 'NPV (95% CI)', 'Acc. (95% CI)', 'AUC (95% CI)'];
            rows = PUBLICATION_CONFIG.literatureCriteriaSets.map(set => {
                const applicableCohort = set.applicableCohort || 'Gesamt';
                const perfStats = stats?.[applicableCohort]?.performanceT2Literature?.[set.id];
                if (!perfStats) return null;
                return [
                    `${set.name} (${getCohortDisplayName(applicableCohort)} N=${stats?.[applicableCohort]?.descriptive?.patientCount || '?'})`,
                    fCI_pub(perfStats.sens),
                    fCI_pub(perfStats.spec),
                    fCI_pub(perfStats.ppv),
                    fCI_pub(perfStats.npv),
                    fCI_pub(perfStats.acc),
                    fCI_pub(perfStats.auc)
                ];
            }).filter(row => row !== null);
        } else if (tableId === PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id) {
            caption = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle[`title${lang === 'en' ? 'En' : 'De'}`.replace('{BF_METRIC}', commonData.bruteForceMetricForPublication)];
            headers = ['Cohort', 'Optimized Metric', 'Best Value', 'Logic', 'Criteria', 'Sens. (95% CI)', 'Spec. (95% CI)', 'Acc. (95% CI)', 'AUC (95% CI)'];
            rows = ['Gesamt', 'direkt OP', 'nRCT'].map(cohortId => {
                const bfRes = stats?.[cohortId]?.bruteforceDefinition;
                const perf = stats?.[cohortId]?.performanceT2Bruteforce;
                if (!bfRes || !perf) return null;
                return [
                    getCohortDisplayName(cohortId),
                    bfRes.metricName,
                    fv(bfRes.metricValue, 4, true),
                    bfRes.logic,
                    studyT2CriteriaManager.formatCriteriaForDisplay(bfRes.criteria, bfRes.logic, true),
                    fCI_pub(perf.sens),
                    fCI_pub(perf.spec),
                    fCI_pub(perf.acc),
                    fCI_pub(perf.auc)
                ];
            }).filter(row => row !== null);
        } else if (tableId === PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id) {
            caption = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle[`title${lang === 'en' ? 'En' : 'De'}`];
            headers = ['Test', 'Statistic', 'p-Value', 'Method'];
            rows = ['Gesamt', 'direkt OP', 'nRCT'].flatMap(cohortId => {
                const comp = stats?.[cohortId]?.comparisonASvsT2Bruteforce;
                if (!comp) return [];
                return [
                    [`${getCohortDisplayName(cohortId)} - McNemar (Accuracy)`, fv(comp.mcnemar?.statistic, 3, true) + ` (df=${comp.mcnemar?.df || na})`, getPValueTextForPublication(comp.mcnemar?.pValue), comp.mcnemar?.method || na],
                    [`${getCohortDisplayName(cohortId)} - DeLong (AUC)`, `Z=${fv(comp.delong?.Z, 3, true)}`, getPValueTextForPublication(comp.delong?.pValue), comp.delong?.method || na]
                ];
            }).filter(row => row !== null);
        }
        
        let tableHtml = `<div class="table-responsive"><table class="table table-sm table-striped small">`;
        tableHtml += `<caption>${caption}</caption>`;
        tableHtml += `<thead><tr>`;
        headers.forEach(h => tableHtml += `<th>${h}</th>`);
        tableHtml += `</tr></thead><tbody>`;

        rows.forEach(row => {
            tableHtml += `<tr>`;
            row.forEach(cell => tableHtml += `<td>${cell}</td>`);
            tableHtml += `</tr>`;
        });
        tableHtml += `</tbody></table></div>`;
        return tableHtml;
    }

    function _getPublicationChart(chartId, stats, commonData) {
        let chartData = [];
        let chartTitle = '';
        let targetId = chartId;
        let chartType = '';
        let options = {};
        let dataForROC = null; // To pass raw data for ROC curve

        const getChartHTML = (id, title, opts = {}) => {
            return `<div class="chart-container pub-figure" id="${id}_container" style="min-height: ${opts.height || APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT}px;">
                        <p class="small text-muted">[${title}]</p>
                        <p class="small text-muted"><strong>Figure X:</strong> ${title}</p>
                        <div id="${id}" style="width:100%; height:100%;"></div>
                    </div>`;
        };

        if (chartId === PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id) {
            chartData = stats?.Gesamt?.descriptive?.ageData || [];
            chartTitle = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.titleEn;
            chartType = 'ageDistribution';
            options = { height: 250, margin: { top: 20, right: 30, bottom: 50, left: 60 } };
        } else if (chartId === PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id) {
            const genderStats = stats?.Gesamt?.descriptive?.sex;
            chartData = [{label: 'Male', value: genderStats?.m ?? 0}, {label: 'Female', value: genderStats?.f ?? 0}];
            if(genderStats?.unknown > 0) chartData.push({label: 'Unknown', value: genderStats.unknown });
            chartTitle = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.titleEn;
            chartType = 'pie';
            options = { height: 250, margin: { top: 20, right: 20, bottom: 60, left: 20 }, innerRadiusFactor: 0.5, legendBelow: true };
        } else if (chartId.startsWith('pub-chart-vergleich')) {
            const cohortKey = chartId.replace('pub-chart-vergleich-', '');
            const perfAS = stats?.[cohortKey]?.performanceAS;
            const perfT2BF = stats?.[cohortKey]?.performanceT2Bruteforce;
            if (perfAS && perfT2BF) {
                chartData = [
                    { metric: 'Sens.', AS: perfAS.sens?.value || 0, T2: perfT2BF.sens?.value || 0 },
                    { metric: 'Spec.', AS: perfAS.spec?.value || 0, T2: perfT2BF.spec?.value || 0 },
                    { metric: 'Acc.', AS: perfAS.acc?.value || 0, T2: perfT2BF.acc?.value || 0 },
                    { metric: 'AUC', AS: perfAS.auc?.value || 0, T2: perfT2BF.auc?.value || 0 }
                ];
                chartTitle = PUBLICATION_CONFIG.publicationElements.ergebnisse[`vergleichPerformanceChart${cohortKey}`].titleEn;
                chartType = 'comparisonBar';
                options = { height: 300, margin: { top: 20, right: 30, bottom: 70, left: 60 } };
            }
        } else if (chartId.startsWith('pub-chart-roc')) {
             const cohortKey = chartId.replace('pub-chart-roc-', '');
             dataForROC = commonData.rawData.filter(p => p.therapy === cohortKey || cohortKey === 'overall_cohort'); // Assuming 'overall_cohort' maps to 'Gesamt' for display
             if (cohortKey === 'overall_cohort') dataForROC = commonData.rawData;

             chartTitle = `ROC Curve for Avocado Sign - ${getCohortDisplayName(cohortKey === 'overall_cohort' ? 'Gesamt' : cohortKey)}`;
             chartType = 'rocCurve';
             return `<div class="chart-container pub-figure" id="${chartId}_container" style="min-height: ${300}px;">
                        <p class="small text-muted">[${chartTitle}]</p>
                        <p class="small text-muted"><strong>Figure X:</strong> ${chartTitle}</p>
                        <div id="${chartId}" style="width:100%; height:100%;"></div>
                    </div>`;
        } else if (chartId === 'pub-figure-avocado-sign-illustration') {
             return '';
        } else if (chartId === PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id) {
            return '';
        }

        if (chartData.length > 0 || chartType === 'rocCurve') {
            const containerHtml = getChartHTML(targetId, chartTitle, options);
            setTimeout(() => {
                const chartElement = document.getElementById(targetId);
                if (chartElement) {
                    if (chartType === 'ageDistribution') {
                        chartRenderer.renderAgeDistributionChart(chartData, targetId, options);
                    } else if (chartType === 'pie') {
                        chartRenderer.renderPieChart(chartData, targetId, options);
                    } else if (chartType === 'comparisonBar') {
                        chartRenderer.renderComparisonBarChart(chartData, targetId, options, 'Optimized T2');
                    } else if (chartType === 'rocCurve' && dataForROC) {
                         // The rawData needs to be processed to have t2Status and asStatus for ROC calculation
                         // This re-processing needs to happen in the main app to ensure consistency
                         // For now, it will use existing 'asStatus' if available in commonData.rawData
                         // In a real scenario, this would likely be pre-processed data with necessary keys
                         const processedDataForROC = dataProcessor.processAllData(dataForROC);
                         chartRenderer.renderDiagnosticPerformanceChart(processedDataForROC, 'asStatus', 'nStatus', targetId, UI_TEXTS.legendLabels.avocadoSign);
                    }
                }
            }, 50);
            return containerHtml;
        }
        return '';
    }

    function render(data, currentSectionId) {
        rawGlobalData = data.rawData;
        allCohortStats = data.allCohortStats;
        bruteForceResults = data.bruteForceResults;
        currentPubLang = data.currentLanguage;

        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats.Gesamt?.descriptive?.patientCount || 0,
            nUpfrontSurgery: allCohortStats['direkt OP']?.descriptive?.patientCount || 0,
            nNRCT: allCohortStats.nRCT?.descriptive?.patientCount || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: state.getPublicationBruteForceMetric(),
            currentLanguage: currentPubLang,
            rawData: rawGlobalData // Pass raw data for ROC curve generation in Charts
        };
        
        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId);
        if (!mainSection) return `<p class="text-warning">No section defined for ID '${currentSectionId}'.</p>`;

        let finalHTML = `<div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: var(--sticky-header-offset); z-index: 1015;">
            <div class="col-md-3">${uiComponents.createPublicationNav(currentSectionId)}<div class="mt-3">
                <label for="publication-bf-metric-select" class="form-label small text-muted">${UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                <select class="form-select form-select-sm" id="publication-bf-metric-select">
                    ${PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(m => `<option value="${m.value}" ${m.value === commonData.bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                </select>
                <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" role="switch" id="publication-lang-switch" ${currentPubLang === 'de' ? 'checked' : ''}>
                    <label class="form-check-label small text-muted" for="publication-lang-switch">Deutsch / English</label>
                </div>
            </div></div>
            <div class="col-md-9"><div id="publication-content-area" class="bg-white p-3 border rounded">
                <h1 class="mb-4 display-6">${UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey]}</h1>`;

        mainSection.subSections.forEach(subSection => {
            finalHTML += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            finalHTML += `<h3>${subSection.label}</h3>`;
            const sectionContent = _getSectionContent(subSection.id, currentPubLang, allCohortStats, commonData);
            finalHTML += sectionContent;

            const elementsConfig = PUBLICATION_CONFIG.publicationElements;

            if (elementsConfig.methoden.flowDiagram.id === subSection.id) {
            }

            if (currentSectionId === 'methoden') {
                if (subSection.id === 'methoden_bildanalyse_t2_kriterien') {
                    finalHTML += _getPublicationTable(elementsConfig.methoden.literaturT2KriterienTabelle.id, 'literaturT2KriterienTabelle', null, currentPubLang, allCohortStats, commonData);
                }
            } else if (currentSectionId === 'ergebnisse') {
                if (subSection.id === 'ergebnisse_patientencharakteristika') {
                    finalHTML += _getPublicationTable(elementsConfig.ergebnisse.patientenCharakteristikaTabelle.id, 'patientenCharakteristikaTabelle', null, currentPubLang, allCohortStats, commonData);
                    if (elementsConfig.ergebnisse.alterVerteilungChart.id) {
                        finalHTML += _getPublicationChart(elementsConfig.ergebnisse.alterVerteilungChart.id, allCohortStats, commonData);
                    }
                    if (elementsConfig.ergebnisse.geschlechtVerteilungChart.id) {
                        finalHTML += _getPublicationChart(elementsConfig.ergebnisse.geschlechtVerteilungChart.id, allCohortStats, commonData);
                    }
                } else if (subSection.id === 'ergebnisse_as_diagnostische_guete') {
                    finalHTML += _getPublicationTable(elementsConfig.ergebnisse.diagnostischeGueteASTabelle.id, 'diagnostischeGueteASTabelle', null, currentPubLang, allCohortStats, commonData);
                    finalHTML += _getPublicationChart('pub-chart-roc-overall', allCohortStats, commonData);
                    finalHTML += _getPublicationChart('pub-chart-roc-direkt OP', allCohortStats, commonData);
                    finalHTML += _getPublicationChart('pub-chart-roc-nRCT', allCohortStats, commonData);
                } else if (subSection.id === 'ergebnisse_t2_literatur_diagnostische_guete') {
                    finalHTML += _getPublicationTable(elementsConfig.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id, 'diagnostischeGueteLiteraturT2Tabelle', null, currentPubLang, allCohortStats, commonData);
                } else if (subSection.id === 'ergebnisse_t2_optimiert_diagnostische_guete') {
                    finalHTML += _getPublicationTable(elementsConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id, 'diagnostischeGueteOptimierteT2Tabelle', null, currentPubLang, allCohortStats, commonData);
                } else if (subSection.id === 'ergebnisse_vergleich_as_vs_t2') {
                    finalHTML += _getPublicationTable(elementsConfig.ergebnisse.statistischerVergleichAST2Tabelle.id, 'statistischerVergleichAST2Tabelle', null, currentPubLang, allCohortStats, commonData);
                    finalHTML += _getPublicationChart(elementsConfig.ergebnisse.vergleichPerformanceChartGesamt.id, allCohortStats, commonData);
                    finalHTML += _getPublicationChart(elementsConfig.ergebnisse.vergleichPerformanceChartdirektOP.id, allCohortStats, commonData);
                    finalHTML += _getPublicationChart(elementsConfig.ergebnisse.vergleichPerformanceChartnRCT.id, allCohortStats, commonData);
                }
            }
            
            finalHTML += `</div>`;
        });

        finalHTML += `</div></div></div>`;
        return finalHTML;
    }

    function getSectionContentForExport(sectionId, lang, allStats, commonData) {
        return _getSectionContent(sectionId, lang, allStats, commonData);
    }

    function getTableHTMLForExport(tableId, tableType, data, lang, stats, commonData, options = {}) {
        return _getPublicationTable(tableId, tableType, data, lang, stats, commonData, options);
    }

    return {
        render,
        getSectionContentForExport,
        getTableHTMLForExport
    };
})();
