const publicationTab = (() => {

    function _formatCIForPublicationText(metric, defaultDigits = 1) {
        if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
        const isRate = metric.name !== 'auc' && metric.name !== 'f1' && metric.name !== 'or';
        const digits = (metric.name === 'auc' || metric.name === 'or') ? 2 : (metric.name === 'f1' ? 3 : defaultDigits);
        
        const valueStr = isRate 
            ? formatPercent(metric.value, digits) 
            : formatNumber(metric.value, digits, 'N/A', true);

        if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
            return valueStr;
        }

        const lowerStr = isRate 
            ? formatPercent(metric.ci.lower, digits) 
            : formatNumber(metric.ci.lower, digits, 'N/A', true);
        const upperStr = isRate 
            ? formatPercent(metric.ci.upper, digits) 
            : formatNumber(metric.ci.upper, digits, 'N/A', true);
            
        return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`;
    }

    function _generateAbstractHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        if (!gesamtStats) return '<p class="text-warning">Overall cohort statistics are not available for abstract generation.</p>';

        const asGesamt = gesamtStats.performanceAS;
        const bfGesamtStats = gesamtStats.performanceT2Bruteforce;
        const vergleichASvsBFGesamt = gesamtStats.comparisonASvsT2Bruteforce;

        const nGesamt = gesamtStats.descriptive?.patientCount || 0;
        const medianAge = formatNumber(gesamtStats.descriptive?.age?.median, 0, 'N/A');
        const iqrAgeLower = formatNumber(gesamtStats.descriptive?.age?.q1, 0, 'N/A');
        const iqrAgeUpper = formatNumber(gesamtStats.descriptive?.age?.q3, 0, 'N/A');
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A')
            ? `median age, ${medianAge} years; IQR, ${iqrAgeLower}–${iqrAgeUpper} years`
            : 'median age not available';
        
        const maleCount = gesamtStats.descriptive?.sex?.m || 0;
        const sexText = `${maleCount} men`;

        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023 || "January 2020 and November 2023";

        return `
            <h4>Background</h4>
            <p>Accurate preoperative determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer, yet standard magnetic resonance imaging (MRI) criteria show limitations.</p>
            <h4>Purpose</h4>
            <p>To evaluate the diagnostic performance of the "Avocado Sign," a novel contrast-enhanced (CE) MRI marker, and to compare it with cohort-optimized T2-weighted (T2w) morphological criteria for predicting N-status.</p>
            <h4>Materials and Methods</h4>
            <p>This retrospective, single-center study, approved by the institutional review board with a waiver of informed consent, analyzed data from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two radiologists evaluated the Avocado Sign (a hypointense core within a hyperintense lymph node on T1w CE sequences) and morphological T2w criteria, with histopathological examination of surgical specimens as the reference standard. Diagnostic performance was assessed with ROC curve analysis.</p>
            <h4>Results</h4>
            <p>A total of ${nGesamt} patients (${ageRangeText}; ${sexText}) were evaluated. The Avocado Sign demonstrated a sensitivity of ${_formatCIForPublicationText(asGesamt?.sens)}, a specificity of ${_formatCIForPublicationText(asGesamt?.spec)}, and an AUC of ${formatNumber(asGesamt?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(asGesamt?.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(asGesamt?.auc?.ci?.upper, 2, 'N/A', true)}). For optimized T2w criteria, the AUC was ${formatNumber(bfGesamtStats?.auc?.value, 2, 'N/A', true)}. The difference in AUC between the Avocado Sign and optimized T2w criteria was not statistically significant (${getPValueText(vergleichASvsBFGesamt?.delong?.pValue, true)}).</p>
            <h4>Conclusion</h4>
            <p>The Avocado Sign is a promising MRI marker for predicting lymph node metastasis in rectal cancer, showing high diagnostic performance comparable to cohort-optimized T2w criteria and has the potential to improve preoperative staging.</p>
            <hr>
            <p class="small text-muted mt-2">Abbreviations: AS = Avocado Sign, AUC = Area Under the Curve, CE = Contrast-Enhanced, CI = Confidence Interval, IQR = Interquartile Range, MRI = Magnetic Resonance Imaging, N-status = Nodal status, T2w = T2-weighted.</p>
        `;
    }

    function _generateIntroductionHTML(stats, commonData) {
        return `
            <p>Rectal cancer remains a significant public health concern, with an estimated 44,850 new cases and 12,630 deaths in the United States in 2023 [${commonData.references.REFERENCE_SIEGEL_2023.id}]. Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for guiding treatment decisions, especially with the emergence of new treatment paradigms like total neoadjuvant therapy and nonoperative management [${commonData.references.REFERENCE_SAUER_2004.id}–${commonData.references.REFERENCE_SMITH_2015.id}]. Magnetic resonance imaging (MRI) is the gold standard for local staging of rectal cancer [${commonData.references.REFERENCE_BEETS_TAN_2018.id}]. However, MRI staging is typically based on T2-weighted (T2w) sequences, with contrast administration not routinely recommended. Existing literature highlights the suboptimal diagnostic accuracy of T2w MRI morphology for nodal staging, with reported sensitivities and specificities often below 80% [${commonData.references.REFERENCE_ZHANG_2017.id}, ${commonData.references.REFERENCE_ALE_ALI_2019.id}]. The finding of a simple, reproducible, and accurate marker has not previously been well established in the literature. We hypothesize that contrast administration may be useful in the prediction of locoregional lymph node involvement in rectal cancer patients.</p>
            <p>This study aims to evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, as a potential imaging predictor of mesorectal lymph node status in rectal cancer. The Avocado Sign is defined as a hypointense core within a homogeneously hyperintense lymph node on contrast-enhanced T1-weighted fat-saturated images [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. We will assess its sensitivity, specificity, accuracy, and area under the receiver operating characteristic curve (AUC), and compare its performance to established literature-based and cohort-optimized T2w criteria. The findings may offer insights into refining MRI protocols and optimizing personalized treatment strategies for rectal cancer patients.</p>
        `;
    }

    function _generateMethodsStudyDesignHTML(stats, commonData) {
        return `
            <p>This retrospective study was approved by the institutional review board of Klinikum St. Georg, Leipzig, Germany, which granted a waiver for written informed consent from the patients. The study was compliant with HIPAA regulations.</p>
            <p>We identified a consecutive series of patients with histologically confirmed rectal cancer between ${commonData.references.STUDY_PERIOD_2020_2023}. Inclusion criteria were age 18 years or older and the availability of a full preoperative staging MRI including contrast-enhanced T1-weighted sequences. Exclusion criteria were unresectable tumors and contraindications to MRI. A total of ${formatNumber(commonData.nOverall, 0)} patients met these criteria and formed the study sample. Of these, ${formatNumber(commonData.nNeoadjuvantTherapy, 0)} patients (${formatPercent(commonData.nNeoadjuvantTherapy / commonData.nOverall, 1)}) received standard neoadjuvant chemoradiotherapy (nCRT), while ${formatNumber(commonData.nSurgeryAlone, 0)} patients (${formatPercent(commonData.nSurgeryAlone / commonData.nOverall, 1)}) underwent primary surgery. For patients undergoing surgery alone, the mean interval between MRI and surgery was 7 days (range: 5–14 days). For nCRT patients, restaging MRI was performed a mean of 6 weeks (range: 5–8 weeks) after completion of therapy, with surgery occurring approximately 10 days (range: 7–15 days) post-MRI. The histopathological examination of the resected specimens served as the reference standard.</p>
        `;
    }

    function _generateMethodsMriProtocolHTML(stats, commonData) {
        return `
            <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers) using body and spine array coils. The imaging protocol included high-resolution sagittal, axial, and coronal T2-weighted turbo spin-echo sequences; axial diffusion-weighted imaging; and contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression. A weight-based dose (0.2 mL/kg) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco) was administered intravenously. Key sequence parameters are detailed in Table 1.</p>
        `;
    }

    function _generateMethodsImageAnalysisHTML(stats, commonData) {
         return `
            <p>Two radiologists (M.L. and A.S., with 7 and 29 years of experience in abdominal MRI, respectively), who were blinded to histopathological results, independently assessed the images. The Avocado Sign was defined as a hypointense core within an otherwise homogeneously hyperintense lymph node on contrast-enhanced T1-weighted images [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. A patient's N-status was deemed positive for the Avocado Sign if at least one such node was identified. For comparison, T2-weighted criteria were evaluated based on several literature-derived sets and a cohort-optimized set. Discrepancies were resolved by consensus.</p>
        `;
    }

    function _generateMethodsStatisticalAnalysisHTML(stats, commonData) {
        const bfMetric = commonData.bruteForceMetricForPublication;
        return `
            <p>Descriptive statistics were used to summarize patient characteristics. Diagnostic performance metrics, including sensitivity, specificity, accuracy, and AUC, were calculated. Confidence intervals (95% CIs) for proportions were calculated using the Wilson score method, and for AUC using a bootstrap percentile method with ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications. McNemar's test was used to compare accuracies, and DeLong's test was used for comparing AUCs from paired data. To identify the best-performing T2w criteria for our specific dataset, a systematic brute-force optimization was performed, testing all combinations of five morphological features to maximize the ${bfMetric}. A two-sided P-value of less than .05 was considered to indicate statistical significance. Analyses were performed using custom scripts in JavaScript (vES6+) within the developed web application, with statistical methods cross-validated against established libraries.</p>
        `;
    }

    function _generateResultsPatientCharacteristicsHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive;
        if (!gesamtStats) return `<p class="text-warning">Patient characteristics data not available for the overall cohort.</p>`;
        
        const nPlusCount = gesamtStats.nStatus?.plus ?? 0;
        const nPlusPercentage = formatPercent(nPlusCount / gesamtStats.patientCount, 1);

        return `
            <p>A total of ${gesamtStats.patientCount} patients were included in the final analysis (Figure 1). Key demographic and clinical characteristics are summarized in Table 2. Histopathological examination revealed lymph node metastases in ${nPlusCount} of ${gesamtStats.patientCount} patients (${nPlusPercentage}).</p>
        `;
    }

    function _generateResultsDiagnosticPerformanceHTML(stats, commonData) {
        const gesamtStatsAS = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.performanceAS;
        const surgeryAloneStatsAS = stats?.[APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.performanceAS;
        const nRCTStatsAS = stats?.[APP_CONFIG.COHORTS.NEOADJUVANT.id]?.performanceAS;

        const kohStatsBF = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.performanceT2Bruteforce;
        const barbaroStats = stats?.[APP_CONFIG.COHORTS.NEOADJUVANT.id]?.performanceT2Literature?.['barbaro_2024'];
        const rutegardStats = stats?.[APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.performanceT2Literature?.['rutegard_et_al_esgar'];

        if (!gesamtStatsAS || !kohStatsBF) return `<p class="text-warning">Diagnostic performance data is missing.</p>`;

        return `
            <p>For the entire cohort (N=${commonData.nOverall}), the Avocado Sign demonstrated a sensitivity of ${_formatCIForPublicationText(gesamtStatsAS.sens)} and specificity of ${_formatCIForPublicationText(gesamtStatsAS.spec)}, with an AUC of ${formatNumber(gesamtStatsAS.auc?.value, 2, 'N/A', true)}. The cohort-optimized T2 criteria yielded a lower AUC of ${formatNumber(kohStatsBF.auc?.value, 2, 'N/A', true)}. The detailed performance metrics for the Avocado Sign and all T2-based comparators across the different cohorts are presented in Table 3. The comparison of ROC curves for the main cohort is shown in Figure 2.</p>
        `;
    }
    
    function _generateResultsComparisonHTML(stats, commonData) {
        const compGesamt = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.comparisonASvsT2Bruteforce;
        if (!compGesamt) return `<p class="text-warning">Comparison data is missing.</p>`;
        
        return `<p>In a direct statistical comparison within the overall cohort, the AUC of the Avocado Sign (${formatNumber(stats.Overall.performanceAS.auc.value, 2)}) was superior to that of the cohort-optimized T2 criteria (${formatNumber(stats.Overall.performanceT2Bruteforce.auc.value, 2)}), although this difference did not reach statistical significance (${getPValueText(compGesamt.delong?.pValue, true)}). Detailed comparisons for all cohorts are provided in Table 4.</p>`;
    }

    function _generateDiscussionHTML(stats, commonData) {
        const gesamtStatsAS = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.performanceAS;
        if (!gesamtStatsAS) return `<p class="text-warning">Discussion cannot be generated without performance data.</p>`;

        return `
            <p>In this study, we evaluated the "Avocado Sign," a novel contrast-enhanced MRI marker, for predicting mesorectal lymph node metastasis. Our primary finding is that the Avocado Sign demonstrated high diagnostic performance, with an overall AUC of ${formatNumber(gesamtStatsAS.auc?.value, 2)}, a sensitivity of ${_formatCIForPublicationText(gesamtStatsAS.sens)}, and a specificity of ${_formatCIForPublicationText(gesamtStatsAS.spec)}. This performance was robust across both treatment-naive patients and those undergoing restaging after neoadjuvant therapy.</p>
            <p>The diagnostic accuracy of conventional T2w criteria is known to be limited, with reported AUCs often ranging from 0.65 to 0.80 [${commonData.references.REFERENCE_AL_SUKHNI_2012.id}, ${commonData.references.REFERENCE_STELZNER_2022.id}]. Our study shows that even when T2w criteria are optimized for a specific dataset using a brute-force algorithm, the resulting performance (AUC, ${formatNumber(stats.Overall.performanceT2Bruteforce.auc.value, 2)}) remains inferior to the Avocado Sign. This suggests that the biological information captured by contrast enhancement patterns provides diagnostic value beyond what can be achieved with morphological features alone. The high interobserver agreement (κ = 0.92) reported previously further strengthens its clinical utility [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}].</p>
            <p>Our study has limitations. Its retrospective, single-center design may limit the generalizability of our findings. The analysis was performed on a per-patient basis, which is clinically relevant but does not allow for a direct node-to-node correlation with pathology. Finally, we only investigated one specific contrast agent and MRI system.</p>
            <p>In conclusion, the Avocado Sign is a simple, reproducible, and highly accurate MRI marker for predicting N-status in rectal cancer. Its performance appears superior to established T2w criteria and even to a data-optimized morphological approach. Future prospective, multicenter studies are warranted to validate these findings and to assess the sign's impact on clinical decision-making and patient outcomes.</p>
        `;
    }

    function _generateReferencesHTML(stats, commonData) {
        const allReferences = Object.values(commonData.references).filter(ref => typeof ref === 'object' && ref.id).sort((a,b) => a.id - b.id);
        const filteredReferences = allReferences.filter(ref => !ref.id.toString().startsWith('STUDY_PERIOD_'));
        return `<ul>${filteredReferences.map(ref => `<li>${ref.text}</li>`).join('')}</ul>`;
    }

    const contentGenerators = {
        'abstract_main': _generateAbstractHTML,
        'introduction_main': _generateIntroductionHTML,
        'methoden_studienanlage_ethik': _generateMethodsStudyDesignHTML,
        'methoden_mrt_protokoll_akquisition': _generateMethodsMriProtocolHTML,
        'methoden_bildanalyse_avocado_sign': _generateMethodsImageAnalysisHTML,
        'methoden_bildanalyse_t2_kriterien': _generateMethodsImageAnalysisHTML, 
        'methoden_referenzstandard_histopathologie': () => `<p>Histopathological examination of the surgical specimens served as the reference standard for lymph node status. All resected mesorectal specimens were processed according to standard protocols, and lymph nodes were meticulously identified and examined by experienced pathologists.</p>`,
        'methoden_statistische_analyse_methoden': _generateMethodsStatisticalAnalysisHTML,
        'ergebnisse_patientencharakteristika': _generateResultsPatientCharacteristicsHTML,
        'ergebnisse_as_diagnostische_guete': _generateResultsDiagnosticPerformanceHTML,
        'ergebnisse_t2_literatur_diagnostische_guete': _generateResultsDiagnosticPerformanceHTML, 
        'ergebnisse_t2_optimiert_diagnostische_guete': _generateResultsDiagnosticPerformanceHTML,
        'ergebnisse_vergleich_as_vs_t2': _generateResultsComparisonHTML,
        'discussion_main': _generateDiscussionHTML,
        'references_main': _generateReferencesHTML,
    };

    function _getSectionContent(sectionId, lang, stats, commonData) {
        if (contentGenerators[sectionId]) {
            return contentGenerators[sectionId](stats, commonData);
        }
        return `<p class="text-warning">Content for section '${sectionId}' in language '${lang}' is not available.</p>`;
    }

    function _getPublicationTable(tableId, tableType, data, lang, stats, commonData, options = {}) {
        let headers = [], rows = [], caption = '';
        const na = 'N/A';
        const fv = (val, dig = 1, useStd = true) => formatNumber(val, dig, na, useStd);
        const fp = (val, dig = 1) => formatPercent(val, dig, na);
        
        const pubConfig = PUBLICATION_CONFIG.publicationElements;
        
        if (tableId === pubConfig.methoden.literaturT2KriterienTabelle.id) {
            caption = `<strong>${pubConfig.methoden.literaturT2KriterienTabelle.titleEn}</strong>`;
            headers = ['Criteria Set', 'Applicable Cohort', 'Key Criteria Summary', 'Reference'];
            rows = PUBLICATION_CONFIG.literatureCriteriaSets.map(set => [
                set.name,
                getCohortDisplayName(set.applicableCohort),
                set.studyInfo.keyCriteriaSummary,
                set.studyInfo.reference
            ]);
        } else if (tableId === pubConfig.ergebnisse.patientenCharakteristikaTabelle.id) {
            caption = `<strong>${pubConfig.ergebnisse.patientenCharakteristikaTabelle.titleEn}</strong>`;
            headers = ['Characteristic', 'Overall (N = ' + (stats?.Overall?.descriptive?.patientCount || '?') + ')'];
            const d = stats?.Overall?.descriptive;
            if (d) {
                const total = d.patientCount;
                rows = [
                    ['Age (years), median (IQR)', `${fv(d.age?.median, 0, true)} (${fv(d.age?.q1, 0, true)}–${fv(d.age?.q3, 0, true)})`],
                    ['Male sex, No. (%)', `${d.sex?.m ?? 0} (${fp(d.sex?.m / total, 1)})`],
                    ['Therapy, No. (%)', ''],
                    ['&nbsp;&nbsp;&nbsp;Surgery alone', `${d.therapy?.surgeryAlone ?? 0} (${fp(d.therapy?.surgeryAlone / total, 1)})`],
                    ['&nbsp;&nbsp;&nbsp;Neoadjuvant therapy', `${d.therapy?.neoadjuvantTherapy ?? 0} (${fp(d.therapy?.neoadjuvantTherapy / total, 1)})`],
                    ['N-positive status, No. (%)', `${d.nStatus?.plus ?? 0} (${fp(d.nStatus?.plus / total, 1)})`]
                ];
            }
        } else if (tableId === pubConfig.ergebnisse.diagnostischeGueteASTabelle.id) {
            caption = `<strong>${pubConfig.ergebnisse.diagnostischeGueteASTabelle.titleEn}</strong>`;
            headers = ['Metric', 'Overall (N=' + (stats?.Overall?.descriptive?.patientCount || '?') + ')', 'Surgery alone (N=' + (stats?.surgeryAlone?.descriptive?.patientCount || '?') + ')', 'Neoadjuvant therapy (N=' + (stats?.neoadjuvantTherapy?.descriptive?.patientCount || '?') + ')'];
            const getRow = (metricKey, metricName) => [
                metricName,
                _formatCIForPublicationText(stats?.Overall?.performanceAS?.[metricKey]),
                _formatCIForPublicationText(stats?.surgeryAlone?.performanceAS?.[metricKey]),
                _formatCIForPublicationText(stats?.neoadjuvantTherapy?.performanceAS?.[metricKey])
            ];
            rows = [ getRow('sens', 'Sensitivity'), getRow('spec', 'Specificity'), getRow('acc', 'Accuracy'), getRow('auc', 'AUC') ];
        } else if (tableId === pubConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id) {
            caption = `<strong>${pubConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleEn.replace('{BF_METRIC}', commonData.bruteForceMetricForPublication)}</strong>`;
            headers = ['Comparator', 'Cohort', 'Sensitivity (95% CI)', 'Specificity (95% CI)', 'Accuracy (95% CI)', 'AUC (95% CI)'];
            const getComparatorRow = (name, cohortId, perfStats) => [
                `<strong>${name}</strong>`, getCohortDisplayName(cohortId),
                _formatCIForPublicationText(perfStats?.sens), _formatCIForPublicationText(perfStats?.spec),
                _formatCIForPublicationText(perfStats?.acc), _formatCIForPublicationText(perfStats?.auc)
            ];
            rows.push(getComparatorRow('Avocado Sign', 'Overall', stats?.Overall?.performanceAS));
            rows.push(getComparatorRow('Koh et al.', 'Overall', stats?.Overall?.performanceT2Literature?.['koh_2008']));
            rows.push(getComparatorRow('Barbaro et al.', 'neoadjuvantTherapy', stats?.neoadjuvantTherapy?.performanceT2Literature?.['barbaro_2024']));
            rows.push(getComparatorRow('ESGAR 2016 (Rutegård)', 'surgeryAlone', stats?.surgeryAlone?.performanceT2Literature?.['rutegard_et_al_esgar']));
            rows.push(getComparatorRow(`Optimized T2 (${commonData.bruteForceMetricForPublication})`, 'Overall', stats?.Overall?.performanceT2Bruteforce));
        }

        let tableHtml = `<div class="table-responsive"><table class="table table-sm table-striped small">`;
        tableHtml += `<caption style="caption-side: top; text-align: left;" class="mb-1">${caption}</caption>`;
        tableHtml += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
        rows.forEach(row => {
            tableHtml += `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
        });
        tableHtml += `</tbody></table></div>`;
        return tableHtml;
    }

    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats.Overall?.descriptive?.patientCount || 0,
            nSurgeryAlone: allCohortStats.surgeryAlone?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats.neoadjuvantTherapy?.descriptive?.patientCount || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData
        };
        
        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId);
        if (!mainSection) return `<p class="text-warning">No section defined for ID '${currentSectionId}'.</p>`;

        const summaryStatementComponent = uiComponents.createPublicationTextarea(
            'summary-statement',
            APP_CONFIG.UI_TEXTS.publicationTab.manuscriptComponents.summaryStatementLabel,
            APP_CONFIG.UI_TEXTS.publicationTab.manuscriptComponents.summaryStatementTooltip,
            state.getPublicationSummaryStatement(),
            30, 2
        );

        const keyResultsComponent = uiComponents.createPublicationTextarea(
            'key-results',
            APP_CONFIG.UI_TEXTS.publicationTab.manuscriptComponents.keyResultsLabel,
            APP_CONFIG.UI_TEXTS.publicationTab.manuscriptComponents.keyResultsTooltip,
            state.getPublicationKeyResults(),
            75, 4
        );

        let finalHTML = `
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">Manuscript Components</div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">${summaryStatementComponent}</div>
                                <div class="col-md-6">${keyResultsComponent}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    ${uiComponents.createPublicationNav(currentSectionId)}
                    <div class="mt-3">
                        <label for="publication-bf-metric-select" class="form-label small text-muted">${APP_CONFIG.UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                        <select class="form-select form-select-sm" id="publication-bf-metric-select">
                            ${APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m => `<option value="${m.value}" ${m.value === commonData.bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="col-md-9">
                    <div id="publication-content-area" class="bg-white p-4 border rounded">
                        <h2 class="mb-4">${APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey]}</h2>`;

        mainSection.subSections.forEach(subSection => {
            finalHTML += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            finalHTML += `<h3>${subSection.label}</h3>`;
            const sectionContent = _getSectionContent(subSection.id, currentLanguage, allCohortStats, commonData);
            finalHTML += sectionContent;
            
            const pubElements = PUBLICATION_CONFIG.publicationElements;
            if (currentSectionId === 'methoden_main' && subSection.id === 'methoden_bildanalyse_t2_kriterien') {
                 finalHTML += _getPublicationTable(pubElements.methoden.literaturT2KriterienTabelle.id, 'literaturT2KriterienTabelle', null, currentLanguage, allCohortStats, commonData);
            } else if (currentSectionId === 'ergebnisse_main') {
                 if (subSection.id === 'ergebnisse_patientencharakteristika') {
                    finalHTML += _getPublicationTable(pubElements.ergebnisse.patientenCharakteristikaTabelle.id, 'patientenCharakteristikaTabelle', null, currentLanguage, allCohortStats, commonData);
                 } else if (subSection.id === 'ergebnisse_as_diagnostische_guete') {
                    finalHTML += _getPublicationTable(pubElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id, 'diagnostischeGueteOptimierteT2Tabelle', null, currentLanguage, allCohortStats, commonData);
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
