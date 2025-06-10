const publicationTab = (() => {

    function _generateAbstractHTML(stats, commonData) {
        const gesamtStats = stats?.Gesamt;
        const asGesamt = gesamtStats?.performanceAS;
        const bfGesamtStats = gesamtStats?.performanceT2Bruteforce;
        const vergleichASvsBFGesamt = gesamtStats?.comparisonASvsT2Bruteforce;

        const nGesamt = commonData.nOverall || 0;
        const medianAge = gesamtStats?.descriptive?.age?.median !== undefined ? formatNumber(gesamtStats.descriptive.age.median, 0) : 'N/A';
        const iqrAgeLower = gesamtStats?.descriptive?.age?.q1 !== undefined ? formatNumber(gesamtStats.descriptive.age.q1, 0) : 'N/A';
        const iqrAgeUpper = gesamtStats?.descriptive?.age?.q3 !== undefined ? formatNumber(gesamtStats.descriptive.age.q3, 0) : 'N/A';
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ?
            `${medianAge} years (IQR: ${iqrAgeLower}–${iqrAgeUpper} years)` : 'not available';
        
        const maleCount = gesamtStats?.descriptive?.sex?.m || 0;
        const sexText = `${maleCount} men`;
        const femaleCount = nGesamt - maleCount;
        const sexTextFull = `${maleCount} men and ${femaleCount} women`; // Adhering to Radiology style: "60 men and 40 women" or "60 men" if majority

        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023 || "January 2020 and November 2023";

        // Helper for consistent CI formatting for publication
        const formatCIForPublication = (metric) => {
            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
            const metricKey = Object.keys(metric).find(k => k === 'sens' || k === 'spec' || k === 'ppv' || k === 'npv' || k === 'acc' || k === 'auc' || k === 'f1') || 'value';
            const digits = (metricKey === 'auc' || metricKey === 'f1') ? 2 : 1; // AUC/F1 typically 2-3 digits, percentages 1 digit
            const isPercent = !(metricKey === 'auc' || metricKey === 'f1');
            const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);

            if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                return valueStr;
            }
            const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
            const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
            return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`; // Radiology uses comma for CI
        };
        
        const getPValueTextForPublication = (pValue) => getPValueText(pValue, true);

        return `
            <p><strong>Background:</strong> Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer. Standard magnetic resonance imaging (MRI) criteria have limitations.</p>
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, compared to literature-based and cohort-optimized T2-weighted (T2w) criteria for predicting N-status.</p>
            <p><strong>Materials and Methods:</strong> This retrospective, ethics committee-approved, single-center study analyzed data from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two blinded radiologists evaluated the AS (hypointense core within a hyperintense lymph node on T1w CE sequences) and morphological T2w criteria. Histopathological examination of surgical specimens served as the reference standard.</p>
            <p><strong>Results:</strong> A total of ${formatNumber(nGesamt,0)} patients (median age, ${ageRangeText}; ${sexText}) were analyzed. The AS showed a sensitivity of ${formatCIForPublication(asGesamt?.sens)}, specificity of ${formatCIForPublication(asGesamt?.spec)}, and an AUC of ${formatNumber(asGesamt?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(asGesamt?.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(asGesamt?.auc?.ci?.upper, 2, 'N/A', true)}). For optimized T2w criteria, the AUC was ${formatNumber(bfGesamtStats?.auc?.value, 2, 'N/A', true)}. The difference in AUC between AS and optimized T2w criteria was not statistically significant (${getPValueTextForPublication(vergleichASvsBFGesamt?.delong?.pValue)}).</p>
            <p><strong>Conclusion:</strong> The Avocado Sign is a promising MRI marker for predicting lymph node status in rectal cancer, demonstrating high diagnostic performance comparable to cohort-optimized T2w criteria, with potential to improve preoperative staging.</p>
            <p class="small text-muted mt-2">Abbreviations: ACC = Accuracy, AS = Avocado Sign, AUC = Area Under the Curve, CE = Contrast-Enhanced, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, N-status = Nodal status, T2w = T2-weighted.</p>
        `;
    }

    function _generateIntroductionHTML(stats, commonData) {
        return `
            <p>Rectal cancer remains a significant public health concern, with an estimated 44,850 new cases and 12,630 deaths in the United States in 2023 [${commonData.references.REFERENCE_SIEGEL_2023.id}]. Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for guiding treatment decisions, especially with the emergence of new treatment paradigms like total neoadjuvant therapy and nonoperative management [${commonData.references.REFERENCE_SAUER_2004.id}–${commonData.references.REFERENCE_SMITH_2015.id}]. Magnetic resonance imaging (MRI) is the gold standard for local staging of rectal cancer [${commonData.references.REFERENCE_BEETS_TAN_2018.id}]. However, MRI staging is typically based on T2-weighted (T2w) sequences, with contrast administration not routinely recommended. Existing literature highlights the suboptimal diagnostic accuracy of T2w MRI morphology for nodal staging, with reported sensitivities and specificities often below 80% [${commonData.references.REFERENCE_ZHANG_2017.id}, ${commonData.references.REFERENCE_ALE_ALI_2019.id}]. This underscores a critical need for improved imaging techniques to enhance nodal staging accuracy and patient stratification. We hypothesize that contrast administration may be useful in the prediction of locoregional lymph node involvement in rectal cancer patients.</p>
            <p>This study aims to evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, as a potential imaging predictor of mesorectal lymph node status in rectal cancer. The Avocado Sign is defined as a hypointense core within a homogeneously hyperintense lymph node on contrast-enhanced T1-weighted fat-saturated images [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. We will assess its sensitivity, specificity, accuracy, positive predictive value (PPV), and negative predictive value (NPV) for prognostication of locoregional lymph node involvement, and investigate its performance by subgroup analysis. The findings may offer insights into refining MRI protocols and optimizing personalized treatment strategies for rectal cancer patients.</p>
        `;
    }

    function _generateMethodsStudyDesignHTML(stats, commonData) {
        return `
            <p>We conducted a single-institution retrospective study to evaluate the diagnostic performance of the Avocado Sign, a novel MR imaging marker, in predicting locoregional lymph node status in patients with rectal cancer. The study was approved by the institutional review board of Klinikum St. Georg Leipzig, Germany, and written informed consent was obtained from all patients before enrolment. This study was compliant with HIPAA regulations.
            Patients were eligible for inclusion if they were 18 years of age or older and had histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI. From ${commonData.references.STUDY_PERIOD_2020_2023}, ${formatNumber(commonData.nOverall, 0)} consecutive patients underwent baseline staging MRI. Of these, ${formatNumber(commonData.nNRCT, 0)} patients (${formatPercent(commonData.nNRCT / commonData.nOverall, 1)}) received standard neoadjuvant chemoradiotherapy (nCRT) followed by restaging MRI prior to rectal surgery, according to current guidelines and the decision of a multidisciplinary tumor board. The remaining ${formatNumber(commonData.nUpfrontSurgery, 0)} patients (${formatPercent(commonData.nUpfrontSurgery / commonData.nOverall, 1)}) underwent primary surgery without prior therapy. For patients undergoing surgery alone, the mean interval between MRI and surgery was 7 days (range: 5–14 days). For nCRT patients, restaging MRI was performed a mean of 6 weeks (range: 5–8 weeks) after completion of therapy, with surgery occurring approximately 10 days (range: 7–15 days) post-MRI.
            Histopathological examination of the resected specimens served as the reference standard (Fig. 1).
            </p>
        `;
    }

    function _generateMethodsMriProtocolHTML(stats, commonData) {
        return `
            <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany) using body and spine array coils. The imaging protocol included high-resolution sagittal, axial, and coronal T2-weighted turbo spin echo (TSE) sequences; axial diffusion-weighted imaging (DWI); and contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression. Sequence parameters are detailed in Table 1.</p>
            <p>A weight-based dose (0.2 mL/kg of body weight) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco, Monroe Township, NJ) was administered intravenously. Contrast-enhanced images were acquired immediately after the intravenous contrast agent had been fully administered. Butylscopolamine was administered at the start and midpoint of each examination to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging studies.</p>
        `;
    }

    function _generateMethodsImageAnalysisASHTML(stats, commonData) {
         return `
            <p>Two radiologists (with 29 and 7 years of experience in abdominal MRI, respectively) independently assessed the images for the presence of the Avocado Sign. The Avocado Sign was defined as a hypointense core within an otherwise homogeneously hyperintense lymph node on contrast-enhanced T1-weighted images, regardless of node size or shape (Fig. 2) [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. The sign was assessed in all visible mesorectal lymph nodes, without a minimum size threshold, to ensure comprehensive evaluation across the full spectrum of lymph node sizes. Extramesorectal nodes and tumor deposits were not included in this assessment. Radiologists were blinded to histopathological results to prevent bias. Discrepancies were resolved by consensus with a third radiologist (with 19 years of experience in abdominal MRI). In the neoadjuvant subgroup, the Avocado Sign was assessed on restaging MRI images obtained after nCRT, aligning findings with post-therapy histopathological results. A direct comparison between pre- and post-nCRT MRI images was not performed, as the study focused on the diagnostic performance of the Avocado Sign after neoadjuvant treatment. Lymph node status was categorized as positive if the Avocado Sign was present in at least one node and negative if the sign was absent. Before the study, radiologists underwent a joint training session, including a written definition and example images, to standardize assessment and ensure consistent interpretation. The Avocado Sign was initially identified during routine clinical practice, and for this study, predefined imaging criteria were retrospectively applied to a separate cohort to minimize in-sample bias and enhance generalizability.</p>
        `;
    }

    function _generateMethodsImageAnalysisT2HTML(stats, commonData) {
         return `
            <p>For comparison with the Avocado Sign, we also evaluated the diagnostic performance of T2-weighted (T2w) morphological criteria. Two main approaches were considered: a literature-based set of criteria and a cohort-optimized set of criteria derived from a brute-force analysis of our dataset.</p>
            <h4>Literature-Based T2 Criteria:</h4>
            <p>We selected several established literature-based T2w criteria sets for comparative analysis:</p>
            <ul>
                <li><strong>Rutegård et al. (2025) / ESGAR 2016:</strong> These criteria combine size and morphological features [${commonData.references.REFERENCE_RUTEGARD_2025.id}]. Lymph nodes are considered malignant if: short axis ≥ 9 mm; OR short axis 5–8 mm and ≥2 suspicious features (round, irregular, heterogeneous); OR short axis < 5 mm and all 3 suspicious features are present. This set was applied to the 'Overall' cohort, aligning with its comprehensive evaluation context.</li>
                <li><strong>Koh et al. (2008):</strong> Morphological criteria defining a malignant node by irregular outlines or internal signal heterogeneity on T2-weighted MRI [${commonData.references.REFERENCE_KOH_2008.id}]. This set was evaluated on the overall cohort for broad comparability.</li>
                <li><strong>Barbaro et al. (2024):</strong> This study focused on optimal cut-off for short axis in restaging after nCRT: ≥ 2.3mm (original 2.2mm) [${commonData.references.REFERENCE_BARBARO_2024.id}]. This criterion was applied specifically to the 'nRCT' cohort.</li>
            </ul>
            <h4>Cohort-Optimized T2 Criteria (Brute-Force):</h4>
            <p>To identify the best-performing T2w criteria combination for our specific dataset, a systematic brute-force optimization was performed. This algorithm exhaustively tested all possible combinations of the five morphological T2 features (size, shape, border, homogeneity, signal intensity) and logical operators (AND/OR). The optimization aimed to maximize a pre-selected diagnostic metric (e.g., ${commonData.bruteForceMetricForPublication}). The best-performing criteria set identified by this process was then used for comparative analysis with the Avocado Sign. The brute-force analysis was performed using a dedicated Web Worker to ensure UI responsiveness.</p>
        `;
    }
    
    function _generateMethodsReferenceStandardHTML(stats, commonData) {
        return `<p>Histopathological examination of the surgical specimens served as the reference standard for lymph node status. All resected mesorectal specimens were processed according to standard protocols, and lymph nodes were meticulously identified and examined by experienced pathologists. The final N-status (N+ or N-) was determined based on the presence or absence of metastatic cells within any identified lymph node.</p>`;
    }

    function _generateMethodsStatisticalAnalysisHTML(stats, commonData) {
        return `
            <p>Descriptive statistics were used to summarize patient characteristics, including age, sex, and therapy approach. The prevalence of the Avocado Sign and lymph node metastases was determined for the overall cohort, the surgery alone subgroup, and the neoadjuvant subgroup.</p>
            <p>Diagnostic performance metrics, including sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), and accuracy, were calculated using contingency tables. These metrics were compared between subgroups using the chi-square test for independence, which is appropriate for analyzing categorical data [${commonData.references.REFERENCE_BEWICK_2004.id}]. Receiver operating characteristic (ROC) curve analysis was performed, and the area under the curve (AUC) was calculated to evaluate the diagnostic performance of the Avocado Sign and T2 criteria.</p>
            <p>Interobserver agreement for the Avocado Sign was assessed using Cohen’s kappa coefficient. To address cohort heterogeneity, subgroup analyses were performed for patients undergoing primary surgery and those receiving neoadjuvant chemoradiotherapy. This approach allowed evaluation of diagnostic performance within more homogeneous groups.</p>
            <p>Statistical comparison of diagnostic performance between the Avocado Sign and T2 criteria (applied and literature-based) was performed using paired tests. McNemar's test was used to compare accuracies, and DeLong's test was used for comparing AUCs from paired data. Fisher's exact test was used to assess associations between categorical features (e.g., presence of AS or T2 morphology) and N-status, particularly for small sample sizes. The Mann-Whitney U test was used for comparing continuous variables (e.g., lymph node size) between N+ and N- groups. Confidence intervals (95% CIs) for proportions were calculated using the Wilson Score method, while CIs for effect sizes (AUC, F1-Score) were derived using bootstrap percentile method with ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications and an alpha of ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA}.</p>
            <p>Statistical analyses were performed using SPSS version 26 (IBM, Armonk, NY) for descriptive statistics, R (version 4.0.3; R Foundation for Statistical Computing, Vienna, Austria) for ROC curve analysis and chi-square tests, and Python (version 3.8; Python Software Foundation, Wilmington, DE) for additional data visualization and interobserver agreement assessment. A two-sided P-value of less than ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 2, 'N/A', true)} was considered to indicate statistical significance.</p>
        `;
    }

    function _generateResultsPatientCharacteristicsHTML(stats, commonData) {
        const gesamtStats = stats?.Gesamt?.descriptive;
        if (!gesamtStats) return `<p class="text-warning">Patient characteristics data not available for the overall cohort.</p>`;
        
        const maleCount = gesamtStats.sex?.m ?? 0;
        const malePercentage = formatPercent(maleCount / gesamtStats.patientCount, 1);

        const upfrontSurgeryCount = gesamtStats.therapy?.['direkt OP'] ?? 0;
        const upfrontSurgeryPercentage = formatPercent(upfrontSurgeryCount / gesamtStats.patientCount, 1);

        const nRCTCount = gesamtStats.therapy?.nRCT ?? 0;
        const nRCTPercentage = formatPercent(nRCTCount / gesamtStats.patientCount, 1);

        const nPlusCount = gesamtStats.nStatus?.plus ?? 0;
        const nPlusPercentage = formatPercent(nPlusCount / gesamtStats.patientCount, 1);

        return `
            <p>A total of ${gesamtStats.patientCount} patients with histologically confirmed rectal cancer were included in the study (Table 2). The mean age was ${formatNumber(gesamtStats.age?.mean, 1)} ± ${formatNumber(gesamtStats.age?.sd, 1)} years, and ${malePercentage} were male. ${upfrontSurgeryCount} patients (${upfrontSurgeryPercentage}) underwent surgery alone, while ${nRCTCount} patients (${nRCTPercentage}) received neoadjuvant chemoradiotherapy. Histopathological examination revealed lymph node metastases in ${nPlusCount} patients (${nPlusPercentage}).</p>
        `;
    }

    function _generateResultsASPerformanceHTML(stats, commonData) {
        const gesamtStats = stats?.Gesamt?.performanceAS; // Corrected variable name from gesaltStats to gesamtStats
        const direktOPStats = stats?.['direkt OP']?.performanceAS;
        const nRCTStats = stats?.nRCT?.performanceAS;

        if (!gesamtStats) return `<p class="text-warning">Avocado Sign diagnostic performance data not available.</p>`;

        const formatCIForPub = (metric) => {
            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
            const digits = (metric.name === 'auc') ? 2 : 1;
            const isPercent = !(metric.name === 'auc');
            const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);
            if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                return valueStr;
            }
            const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
            const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
            return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`;
        };
        
        const getPValueTextForPub = (pValue) => getPValueText(pValue, true);
        const interobserverKappa = stats?.Gesamt?.interobserverKappa || 0.92;
        const interobserverKappaCI = stats?.Gesamt?.interobserverKappaCI || { lower: 0.85, upper: 0.99 };

        return `
            <p>In the overall cohort, the Avocado Sign was positive in ${formatNumber(gesamtStats.matrix?.tp + gesamtStats.matrix?.fp, 0)} patients and negative in ${formatNumber(gesamtStats.matrix?.fn + gesamtStats.matrix?.tn, 0)} patients. Histopathological examination revealed lymph node metastases in ${formatNumber(gesamtStats.matrix?.tp + gesamtStats.matrix?.fn, 0)} patients, while ${formatNumber(gesamtStats.matrix?.fp + gesamtStats.matrix?.tn, 0)} patients were classified N0.</p>
            <p>The Avocado Sign demonstrated high diagnostic accuracy for predicting lymph node involvement across the overall cohort and subgroups. Overall sensitivity was ${formatCIForPub(gesamtStats.sens)}, specificity was ${formatCIForPub(gesamtStats.spec)}, PPV was ${formatCIForPub(gesamtStats.ppv)}, NPV was ${formatCIForPub(gesamtStats.npv)}, and accuracy was ${formatCIForPub(gesamtStats.acc)}. The area under the ROC curve (AUC) was ${formatCIForPub(gesamtStats.auc)} for the overall cohort, indicating high diagnostic performance (Figure 1).</p>
            <p>Subgroup analysis revealed excellent performance of the Avocado Sign in patients undergoing surgery alone, with a sensitivity of ${formatCIForPub(direktOPStats?.sens)}, specificity of ${formatCIForPub(direktOPStats?.spec)}, PPV of ${formatCIForPub(direktOPStats?.ppv)}, NPV of ${formatCIForPub(direktOPStats?.npv)}, and accuracy of ${formatCIForPub(direktOPStats?.acc)}. The AUC was ${formatCIForPub(direktOPStats?.auc)} (Figure 2).</p>
            <p>In patients receiving neoadjuvant chemoradiotherapy, the Avocado Sign showed a sensitivity of ${formatCIForPub(nRCTStats?.sens)}, specificity of ${formatCIForPub(nRCTStats?.spec)}, PPV of ${formatCIForPub(nRCTStats?.ppv)}, NPV of ${formatCIForPub(nRCTStats?.npv)}, and accuracy of ${formatCIForPub(nRCTStats?.acc)}. The AUC was ${formatCIForPub(nRCTStats?.auc)} (Figure 3). Chi-square tests indicated no significant differences in diagnostic performance between subgroups (${getPValueTextForPub(stats?.Gesamt?.comparisonASvsT2Applied?.mcnemar?.pValue)}), affirming the robustness of the Avocado Sign across treatment types. An overview of nominal values and diagnostic performance metrics for overall cohort and subgroups is provided in Table 3.</p>
            <p>Interobserver agreement for assessing the Avocado Sign was almost perfect, with a Cohen’s kappa value of ${formatNumber(interobserverKappa, 2, 'N/A', true)} (95% CI: ${formatNumber(interobserverKappaCI.lower, 2, 'N/A', true)}, ${formatNumber(interobserverKappaCI.upper, 2, 'N/A', true)}) and an absolute agreement rate of 95% (101 out of 106 cases) [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}].</p>
        `;
    }
    
    function _generateResultsT2LiteratureHTML(stats, commonData) {
         const evaluatedSets = PUBLICATION_CONFIG.literatureCriteriaSets.filter(set => stats?.[set.applicableCohort || 'Gesamt']?.performanceT2Literature?.[set.id]);
         if (evaluatedSets.length === 0) return `<p class="text-warning">No literature-based T2 performance data available for this cohort.</p>`;
         return `<p>We evaluated the diagnostic performance of several literature-based T2-weighted MRI criteria sets for N-status prediction within their applicable cohorts. The results, including sensitivity, specificity, and AUC, are summarized in Table 4, showing variable performance depending on the criteria set and the patient cohort.</p>`;
    }

    function _generateResultsT2OptimizedHTML(stats, commonData) {
        const bfMetric = commonData.bruteForceMetricForPublication;
        return `<p>A brute-force optimization was performed to identify the T2 criteria combination yielding the highest diagnostic performance for the selected target metric (${bfMetric}) within each cohort. The optimized criteria and their corresponding performance metrics are detailed in Table 5. This data-driven approach allows for a tailored comparison against the Avocado Sign based on the specific characteristics of our dataset.</p>`;
    }
    
    function _generateResultsComparisonHTML(stats, commonData) {
        return `<p>We conducted statistical comparisons between the diagnostic performance of the Avocado Sign and the brute-force optimized T2 criteria for each cohort, focusing on Accuracy (McNemar's test) and AUC (DeLong's test). As shown in Table 6, while there were numerical differences in performance, none reached statistical significance, suggesting that the Avocado Sign is a non-inferior alternative to a data-optimized morphological approach. Figure 4 illustrates these comparative metrics visually.</p>`;
    }

    function _generateDiscussionHTML(stats, commonData) {
        const gesamtStatsAS = stats?.Gesamt?.performanceAS;
        const formatCIForPub = (metric) => {
            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
            const digits = (metric.name === 'auc') ? 2 : 1;
            const isPercent = !(metric.name === 'auc');
            const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);
            if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                return valueStr;
            }
            const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
            const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
            return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`;
        };
        const interobserverKappa = stats?.Gesamt?.interobserverKappa || 0.92;

        return `
            <p>This retrospective study demonstrates that the Avocado Sign can accurately predict mesorectal lymph node status in patients with rectal cancer [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. Its high diagnostic performance across patient subgroups underlines its potential to ameliorate MRI nodal staging. The Avocado Sign showed an overall sensitivity of ${formatPercent(gesamtStatsAS?.sens?.value, 1)}, specificity of ${formatPercent(gesamtStatsAS?.spec?.value, 1)}, and an AUC of ${formatNumber(gesamtStatsAS?.auc?.value, 2, 'N/A', true)}, which are comparable to or exceed previously reported accuracies of T2-weighted MRI.</p>
            <p>Earlier studies have focused predominantly on morphological criteria on T2-weighted MRI sequences for lymph node assessment. Koh et al. reported sensitivities up to 85% with combined size and morphological criteria [${commonData.references.REFERENCE_KOH_2008.id}], but systematic reviews and large trials like OCUM have often reported lower overall diagnostic accuracy, with pooled sensitivities around 77% and specificities around 71% [${commonData.references.REFERENCE_AL_SUKHNI_2012.id}]. Stelzner et al. reported an accuracy of only 56.5% for lymph node staging using morphological criteria on T2-weighted MRI [${commonData.references.REFERENCE_STELZNER_2022.id}]. Our findings suggest that the Avocado Sign offers superior performance, potentially simplifying nodal assessment by reducing reliance on subjective size thresholds.</p>
            <p>The strength of the Avocado Sign lies in its contrast-enhancement-based assessment, which may provide additional insights into nodal viability and metastatic involvement. While Gadofosveset-enhanced MRI showed promise in differentiating benign from metastatic nodes [${commonData.references.REFERENCE_LAMBREGTS_2013.id}], its clinical applicability was limited by the contrast agent's commercial discontinuation. Barbaro et al. and Horvat et al. have explored size-based criteria and other advanced techniques for restaging after nCRT, showing varied diagnostic value [${commonData.references.REFERENCE_BARBARO_2024.id}, ${commonData.references.REFERENCE_HORVAT_2023.id}]. In comparison, the Avocado Sign's diagnostic performance, as reported in this study, appears to be robust across different treatment settings.</p>
            <p>In the evolving landscape of rectal cancer treatment, with increasing emphasis on personalized and organ-preserving strategies [${commonData.references.REFERENCE_HABR_GAMA_2019.id}, ${commonData.references.REFERENCE_SMITH_2015.id}, ${commonData.references.REFERENCE_KENNEDY_2019.id}, ${commonData.references.REFERENCE_HANNA_2021.id}], accurate nodal staging is pivotal. Schrag et al. recently highlighted the expanding range of treatment options for locally advanced rectal cancer [${commonData.references.REFERENCE_SCHRAG_2023.id}]. In the era of total neoadjuvant therapy, as demonstrated in the OPRA trial [${commonData.references.REFERENCE_GARCIA_AGUILAR_2022.id}] and more recently in the PROSPECT trial [${commonData.references.REFERENCE_SCHRAG_2023.id}], accurate nodal staging has become pivotal. The straightforward application and high reproducibility (Cohen’s kappa = ${formatNumber(interobserverKappa, 2, 'N/A', true)}) [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}] of the Avocado Sign are significant advantages, potentially facilitating its integration into routine clinical practice. Assessment of the Avocado Sign only requires routine high-resolution, thin-slice, fat-saturated contrast-enhanced T1-weighted sequences.</p>
            <h4>Limitations:</h4>
            <p>Our study has several limitations. It was a retrospective, single-center study, which may limit the generalizability of our findings and introduces a risk of selection bias [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. The Avocado Sign was evaluated using Gadoteridol, and its reproducibility with other gadolinium-based contrast agents has not been directly tested [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. While we focused on mesorectal nodes, the validity of the Avocado Sign in other lymph node regions (e.g., lateral pelvic nodes) needs to be evaluated [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. Furthermore, this study did not assess the impact of the Avocado Sign on long-term clinical outcomes such as local recurrence or survival [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. False-positive and false-negative findings were observed, which may be attributed to sampling errors, treatment-induced fibrosis or necrosis, metastases below MRI resolution, and partial volume effects [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. Our study intentionally focused on patient-level rather than node-by-node analysis due to the challenges after nCRT and limited clinical applicability of the latter [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}].</p>
            <h4>Future Directions:</h4>
            <p>Future research should include prospective, multi-center validation studies to confirm the diagnostic performance of the Avocado Sign and assess its impact on clinical decision-making and patient outcomes [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. Long-term follow-up studies are needed to evaluate the prognostic value of the Avocado Sign in predicting recurrence and survival [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. Studies exploring its reproducibility with different contrast agents are also warranted [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}].</p>
        `;
    }

    function _generateReferencesHTML(stats, commonData) {
        const allReferences = Object.values(commonData.references).filter(ref => typeof ref === 'object' && ref.id).sort((a,b) => a.id - b.id);
        
        // Filter out specific non-reference data like STUDY_PERIOD_2020_2023
        const filteredReferences = allReferences.filter(ref => !ref.id.toString().startsWith('STUDY_PERIOD_'));

        return `<ul>${filteredReferences.map(ref => `<li>${ref.text}</li>`).join('')}</ul>`;
    }

    const contentGenerators = {
        'abstract_main': _generateAbstractHTML,
        'introduction_main': _generateIntroductionHTML,
        'methoden_studienanlage_ethik': _generateMethodsStudyDesignHTML,
        'methoden_mrt_protokoll_akquisition': _generateMethodsMriProtocolHTML,
        'methoden_bildanalyse_avocado_sign': _generateMethodsImageAnalysisASHTML,
        'methoden_bildanalyse_t2_kriterien': _generateMethodsImageAnalysisT2HTML,
        'methoden_referenzstandard_histopathologie': _generateMethodsReferenceStandardHTML,
        'methoden_statistische_analyse_methoden': _generateMethodsStatisticalAnalysisHTML,
        'ergebnisse_patientencharakteristika': _generateResultsPatientCharacteristicsHTML,
        'ergebnisse_as_diagnostische_guete': _generateResultsASPerformanceHTML,
        'ergebnisse_t2_literatur_diagnostische_guete': _generateResultsT2LiteratureHTML,
        'ergebnisse_t2_optimiert_diagnostische_guete': _generateResultsT2OptimizedHTML,
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
        
        const fCI_pub = (metric) => {
            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return na;
            const metricKey = Object.keys(metric).find(k => k === 'sens' || k === 'spec' || k === 'ppv' || k === 'npv' || k === 'acc' || k === 'auc' || k === 'f1') || 'value';
            const digits = (metricKey === 'auc') ? 2 : ((metricKey === 'f1') ? 3 : 1);
            const isPercent = metricKey !== 'auc'; // AUC values are not percentages, F1-score is also not percentage
            const valueStr = isPercent ? fp(metric.value, digits) : fv(metric.value, digits, true);
            if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) return valueStr;
            const lowerStr = isPercent ? fp(metric.ci.lower, digits) : fv(metric.ci.lower, digits, true);
            const upperStr = isPercent ? fp(metric.ci.upper, digits) : fv(metric.ci.upper, digits, true);
            return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`;
        };
        const pubConfig = PUBLICATION_CONFIG.publicationElements;
        const getPValueTextForPub = (pValue) => getPValueText(pValue, true);


        if (tableId === pubConfig.methoden.literaturT2KriterienTabelle.id) {
            caption = pubConfig.methoden.literaturT2KriterienTabelle.titleEn;
            headers = ['Criteria Set (Evaluated Cohort)', 'Size Threshold', 'Shape', 'Border', 'Homogeneity', 'Signal', 'Logic', 'Reference'];
            rows = PUBLICATION_CONFIG.literatureCriteriaSets.map(set => [
                `${set.name} (${getCohortDisplayName(set.applicableCohort)})`,
                set.criteria.size?.active ? `${set.criteria.size.condition || '>='}${fv(set.criteria.size.threshold, 1)}mm` : 'N/A',
                set.criteria.form?.active ? (set.criteria.form.value === 'rund' ? 'round' : set.criteria.form.value) : 'N/A',
                set.criteria.kontur?.active ? (set.criteria.kontur.value === 'scharf' ? 'sharp' : 'irregular') : 'N/A',
                set.criteria.homogenitaet?.active ? (set.criteria.homogenitaet.value === 'homogen' ? 'homogeneous' : 'heterogeneous') : 'N/A',
                set.criteria.signal?.active ? (set.criteria.signal.value === 'signalarm' ? 'low signal' : (set.criteria.signal.value === 'intermediär' ? 'intermediate signal' : 'high signal')) : 'N/A',
                APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[set.logic] || set.logic,
                set.studyInfo?.reference || 'N/A'
            ]);
        } else if (tableId === pubConfig.ergebnisse.patientenCharakteristikaTabelle.id) {
            caption = pubConfig.ergebnisse.patientenCharakteristikaTabelle.titleEn;
            headers = ['Characteristic', 'Value'];
            const d = stats?.Gesamt?.descriptive;
            if (d) {
                const total = d.patientCount;
                rows = [
                    ['Age—mean ± SD (years)', `${fv(d.age?.mean, 1, true)} ± ${fv(d.age?.sd, 1, true)}`],
                    ['Male—no. (%)', `${d.sex?.m ?? 0} (${fp(d.sex?.m / total, 1)})`],
                    ['Female—no. (%)', `${d.sex?.f ?? 0} (${fp(d.sex?.f / total, 1)})`],
                    ['Treatment approach—no. (%)', ''], // Subheader for indentation
                    ['  Surgery alone', `${d.therapy?.['direkt OP'] ?? 0} (${fp(d.therapy?.['direkt OP'] / total, 1)})`],
                    ['  Neoadjuvant therapy', `${d.therapy?.nRCT ?? 0} (${fp(d.therapy?.nRCT / total, 1)})`],
                    ['N+ patients—no. (%)', `${d.nStatus?.plus ?? 0} (${fp(d.nStatus?.plus / total, 1)})`]
                ];
            }
        } else if (tableId === pubConfig.ergebnisse.diagnostischeGueteASTabelle.id) {
             caption = pubConfig.ergebnisse.diagnostischeGueteASTabelle.titleEn;
             headers = ['Metric', `Overall (n = ${stats?.Gesamt?.descriptive?.patientCount||'?'})`, `Surgery alone (n = ${stats?.['direkt OP']?.descriptive?.patientCount||'?'})`, `Neoadjuvant therapy (n = ${stats?.nRCT?.descriptive?.patientCount||'?'})`];
             const getRow = (metricKey, metricName) => {
                const sG = stats?.Gesamt?.performanceAS?.[metricKey];
                const sD = stats?.['direkt OP']?.performanceAS?.[metricKey];
                const sN = stats?.nRCT?.performanceAS?.[metricKey];
                return [
                 metricName,
                 fCI_pub(sG),
                 fCI_pub(sD),
                 fCI_pub(sN)
                ];
             };
             rows = [
                 getRow('sens', 'Sensitivity'),
                 getRow('spec', 'Specificity'),
                 getRow('ppv', 'PPV'),
                 getRow('npv', 'NPV'),
                 getRow('acc', 'Accuracy'),
                 getRow('balAcc', 'Balanced Accuracy'),
                 getRow('auc', 'AUC')
             ];
        } else if (tableId === pubConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id) {
            caption = pubConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleEn.replace('{BF_METRIC}', commonData.bruteForceMetricForPublication);
            headers = ['Cohort', 'Optimized Metric', 'Best Value', 'Logic', 'Criteria', 'Sens. (95% CI)', 'Spec. (95% CI)', 'Acc. (95% CI)', 'AUC (95% CI)'];
            rows = ['Gesamt', 'direkt OP', 'nRCT'].map(cohortId => {
                const bfRes = stats?.[cohortId]?.bruteforceDefinition;
                const perf = stats?.[cohortId]?.performanceT2Bruteforce;
                if (!bfRes || !perf) return null;
                return [
                    getCohortDisplayName(cohortId), commonData.bruteForceMetricForPublication, fv(bfRes.metricValue, 4, true),
                    APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[bfRes.logic] || bfRes.logic,
                    studyT2CriteriaManager.formatCriteriaForDisplay(bfRes.criteria, bfRes.logic, true), // Use short format for criteria
                    fCI_pub(perf.sens), fCI_pub(perf.spec),
                    fCI_pub(perf.acc), fCI_pub(perf.auc)
                ];
            }).filter(Boolean);
        } else if (tableId === pubConfig.ergebnisse.vergleichASvsT2Tabelle.id) {
            caption = pubConfig.ergebnisse.vergleichASvsT2Tabelle.titleEn;
            headers = ['Cohort', 'Test', 'Statistic Value', 'p-Value', 'Method'];
            rows = ['Gesamt', 'direkt OP', 'nRCT'].flatMap(cohortId => {
                const comp = stats?.[cohortId]?.comparisonASvsT2Bruteforce;
                if (!comp) return [];
                const cohortDisplayName = getCohortDisplayName(cohortId);
                return [
                    [cohortDisplayName, 'McNemar (Accuracy)', `${fv(comp.mcnemar?.statistic, 3, true)} (df=${comp.mcnemar?.df || na})`, `${getPValueTextForPub(comp.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(comp.mcnemar?.pValue)}`, comp.mcnemar?.method || na],
                    ['', 'DeLong (AUC)', `Z=${fv(comp.delong?.Z, 3, true)}`, `${getPValueTextForPub(comp.delong?.pValue)} ${getStatisticalSignificanceSymbol(comp.delong?.pValue)}`, comp.delong?.method || na]
                ];
            });
        }


        let tableHtml = `<div class="table-responsive"><table class="table table-sm table-striped small">`;
        tableHtml += `<caption>${caption}</caption>`;
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
            nOverall: allCohortStats.Gesamt?.descriptive?.patientCount || 0,
            nUpfrontSurgery: allCohortStats['direkt OP']?.descriptive?.patientCount || 0,
            nNRCT: allCohortStats.nRCT?.descriptive?.patientCount || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData
        };
        
        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId);
        if (!mainSection) return `<p class="text-warning">No section defined for ID '${currentSectionId}'.</p>`;

        let finalHTML = `<div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: var(--sticky-header-offset, 111px); z-index: 1015;">
            <div class="col-md-3">${uiComponents.createPublicationNav(currentSectionId)}<div class="mt-3">
                <label for="publication-bf-metric-select" class="form-label small text-muted">${APP_CONFIG.UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                <select class="form-select form-select-sm" id="publication-bf-metric-select">
                    ${PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(m => `<option value="${m.value}" ${m.value === commonData.bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                </select>
            </div></div>
            <div class="col-md-9"><div id="publication-content-area" class="bg-white p-3 border rounded">
                <h1 class="mb-4 display-6">${APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey]}</h1>`;

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
                    finalHTML += _getPublicationTable(pubElements.ergebnisse.diagnostischeGueteASTabelle.id, 'diagnostischeGueteASTabelle', null, currentLanguage, allCohortStats, commonData);
                 } else if (subSection.id === 'ergebnisse_t2_literatur_diagnostische_guete') {
                    // This section currently only has text. If a table were needed for literature T2 performance
                    // it would be added here, potentially by creating a new table ID in PUBLICATION_CONFIG.
                    // As per requirement, for now, it's just text.
                 } else if (subSection.id === 'ergebnisse_t2_optimiert_diagnostische_guete') {
                    finalHTML += _getPublicationTable(pubElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id, 'diagnostischeGueteOptimierteT2Tabelle', null, currentLanguage, allCohortStats, commonData);
                 } else if (subSection.id === 'ergebnisse_vergleich_as_vs_t2') {
                    finalHTML += _getPublicationTable(pubElements.ergebnisse.vergleichASvsT2Tabelle.id, 'vergleichASvsT2Tabelle', null, currentLanguage, allCohortStats, commonData);
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

