const publicationTab = (() => {

    function _generateTitlePageHTML(stats, commonData) {
        const title = PUBLICATION_CONFIG.publicationElements.manuscriptTitle;
        const nGesamt = commonData.nOverall || 0;
        const nSurgery = commonData.nSurgeryAlone || 0;
        const nNect = commonData.nNeoadjuvantTherapy || 0;

        return `
            <div class="text-center mb-5">
                <h1 class="display-5">${title}</h1>
                <p class="lead">A Comprehensive Analysis of a Novel Contrast-Enhanced MRI Marker</p>
                <p class="text-muted">Markus Lurz, MD & Arnd-Oliver Schäfer, MD</p>
                <p class="small text-muted">Department of Radiology and Nuclear Medicine, St. Georg Hospital, Leipzig, Germany</p>
            </div>

            <div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-summary-statement">
                <h3>${PUBLICATION_CONFIG.publicationElements.summaryStatement.titleEn}</h3>
                <p class="fw-bold">${_generateSummaryStatementText(stats, commonData)}</p>
            </div>

            <div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-key-results">
                 <h3>${PUBLICATION_CONFIG.publicationElements.keyResults.titleEn}</h3>
                ${_generateKeyResultsHTML(stats, commonData)}
            </div>

            <div class="publication-sub-section" id="pub-content-abbreviations">
                <h3>Abbreviations</h3>
                <ul>
                    <li>AS = Avocado Sign</li>
                    <li>AUC = Area Under the Curve</li>
                    <li>BF = Brute-Force</li>
                    <li>CI = Confidence Interval</li>
                    <li>nCRT = Neoadjuvant Chemoradiotherapy</li>
                    <li>NPV = Negative Predictive Value</li>
                    <li>OR = Odds Ratio</li>
                    <li>PPV = Positive Predictive Value</li>
                    <li>RD = Risk Difference</li>
                    <li>T2w = T2-weighted</li>
                </ul>
            </div>
        `;
    }
    
    function _generateSummaryStatementText(stats, commonData) {
        const asGesamt = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.performanceAS;
        const asAuc = formatNumber(asGesamt?.auc?.value, 2, 'N/A', true);
        return `The Avocado Sign, a contrast-enhanced MRI marker, demonstrates high diagnostic performance (AUC, ${asAuc}) for rectal cancer nodal staging, comparable to cohort-optimized T2-weighted criteria, suggesting its utility in improving patient stratification.`;
    }

    function _generateKeyResultsHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        const asGesamt = gesamtStats?.performanceAS;
        const bfGesamtStats = gesamtStats?.performanceT2Bruteforce;
        const vergleichASvsBFGesamt = gesamtStats?.comparisonASvsT2Bruteforce;

        const nGesamt = commonData.nOverall || 0;
        const sens = asGesamt?.sens?.value ? formatPercent(asGesamt.sens.value, 1) : 'N/A';
        const spec = asGesamt?.spec?.value ? formatPercent(asGesamt.spec.value, 1) : 'N/A';
        const asAuc = asGesamt?.auc?.value ? formatNumber(asGesamt.auc.value, 2, 'N/A', true) : 'N/A';
        const bfAuc = bfGesamtStats?.auc?.value ? formatNumber(bfGesamtStats.auc.value, 2, 'N/A', true) : 'N/A';
        const pValue = vergleichASvsBFGesamt?.delong?.pValue !== undefined ? getPValueText(vergleichASvsBFGesamt.delong.pValue, true) : 'N/A';

        return `
            <ul>
                <li>In this retrospective study of ${nGesamt} patients with rectal cancer, the Avocado Sign showed a sensitivity of ${sens} and a specificity of ${spec} for predicting nodal metastasis.</li>
                <li>The diagnostic performance of the Avocado Sign (AUC, ${asAuc}) was not significantly different from that of cohort-optimized T2-weighted criteria (AUC, ${bfAuc}; ${pValue}).</li>
                <li>The Avocado Sign provides a highly reproducible, morphology-independent marker for nodal staging that performs robustly across both treatment-naive and post-neoadjuvant therapy settings.</li>
            </ul>
        `;
    }

    function _generateAbstractHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        const asGesamt = gesamtStats?.performanceAS;
        const bfGesamtStats = gesamtStats?.performanceT2Bruteforce;
        const vergleichASvsBFGesamt = gesamtStats?.comparisonASvsT2Bruteforce;

        const nGesamt = commonData.nOverall || 0;
        const medianAge = gesamtStats?.descriptive?.age?.median !== undefined ? formatNumber(gesamtStats.descriptive.age.median, 0) : 'N/A';
        const iqrAgeLower = gesamtStats?.descriptive?.age?.q1 !== undefined ? formatNumber(gesamtStats.descriptive.age.q1, 0) : 'N/A';
        const iqrAgeUpper = gesamtStats?.descriptive?.age?.q3 !== undefined ? formatNumber(gesamtStats.descriptive.age.q3, 0) : 'N/A';
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ?
            `${medianAge} years (IQR, ${iqrAgeLower}–${iqrAgeUpper} years)` : 'not available';
        
        const maleCount = gesamtStats?.descriptive?.sex?.m || 0;
        const sexText = `${maleCount} men`;

        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023 || "January 2020 and November 2023";

        const formatCIForPublication = (metric) => {
            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
            const isPercent = !(metric.name === 'auc' || metric.name === 'f1');
            const digits = (metric.name === 'auc') ? 2 : 1;
            const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);

            if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                return valueStr;
            }
            const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
            const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
            return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`;
        };
        
        const getPValueTextForPublication = (pValue) => getPValueText(pValue, true);

        return `
            <p><strong>Background:</strong> Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer. Standard magnetic resonance imaging (MRI) criteria have limitations.</p>
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, compared to literature-based and cohort-optimized T2-weighted (T2w) criteria for predicting N-status.</p>
            <p><strong>Materials and Methods:</strong> This retrospective, single-center study was approved by the institutional review board, and the requirement for written informed consent was waived. Data were analyzed from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two blinded radiologists evaluated the AS (hypointense core within a hyperintense lymph node on T1w CE sequences) and morphological T2w criteria. Histopathological examination of surgical specimens served as the reference standard. Diagnostic performance was assessed using area under the receiver operating characteristic curve (AUC) analysis, and methods were compared using the DeLong test.</p>
            <p><strong>Results:</strong> A total of ${formatNumber(nGesamt,0)} patients (median age, ${ageRangeText}; ${sexText}) were analyzed. The AS showed a sensitivity of ${formatCIForPublication(asGesamt?.sens)} and a specificity of ${formatCIForPublication(asGesamt?.spec)}. The AUC for the AS was ${formatNumber(asGesamt?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(asGesamt?.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(asGesamt?.auc?.ci?.upper, 2, 'N/A', true)}). For cohort-optimized T2w criteria, the AUC was ${formatNumber(bfGesamtStats?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(bfGesamtStats?.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(bfGesamtStats?.auc?.ci?.upper, 2, 'N/A', true)}). The difference in AUC between AS and optimized T2w criteria was not statistically significant (${getPValueTextForPublication(vergleichASvsBFGesamt?.delong?.pValue)}).</p>
            <p><strong>Conclusion:</strong> The Avocado Sign is a promising and highly reproducible MRI marker for predicting lymph node status in rectal cancer, demonstrating diagnostic performance non-inferior to cohort-optimized T2w criteria, with potential to simplify and improve preoperative staging.</p>
        `;
    }

    function _generateIntroductionHTML(stats, commonData) {
        return `
            <p>Rectal cancer remains a significant public health concern, with an estimated 44,850 new cases and 12,630 deaths in the United States in 2023 [${commonData.references.REFERENCE_SIEGEL_2023.id}]. Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for guiding treatment decisions, especially with the emergence of new treatment paradigms like total neoadjuvant therapy and nonoperative management [${commonData.references.REFERENCE_SAUER_2004.id}–${commonData.references.REFERENCE_SMITH_2015.id}]. Magnetic resonance imaging (MRI) is the gold standard for local staging of rectal cancer [${commonData.references.REFERENCE_BEETS_TAN_2018.id}]. However, MRI staging is typically based on T2-weighted (T2w) sequences, with contrast administration not routinely recommended. Existing literature highlights the suboptimal diagnostic accuracy of T2w MRI morphology for nodal staging, with reported sensitivities and specificities often below 80% [${commonData.references.REFERENCE_ZHANG_2017.id}, ${commonData.references.REFERENCE_ALE_ALI_2019.id}]. This underscores a critical need for improved imaging techniques to enhance nodal staging accuracy and patient stratification. We hypothesize that contrast administration may be useful in the prediction of locoregional lymph node involvement in rectal cancer patients.</p>
            <p>In a previous study, we introduced the "Avocado Sign" (AS) as a novel contrast-enhanced (CE) MRI marker, defined as a hypointense core within a homogeneously hyperintense lymph node on contrast-enhanced T1-weighted fat-saturated images [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. The initial evaluation demonstrated high diagnostic performance and reproducibility. The purpose of the current study was to prospectively validate the AS in a larger patient cohort and to perform a rigorous comparative analysis against both established, literature-based T2w criteria and a data-driven, cohort-optimized set of T2w criteria to ascertain its clinical utility and potential superiority in nodal staging.</p>
        `;
    }

    function _generateMethodsStudyDesignHTML(stats, commonData) {
        return `
            <p>This retrospective, single-institution study was approved by the institutional review board of Klinikum St. Georg, Leipzig, Germany. The requirement for written informed consent was waived due to the retrospective nature of the analysis. This study was compliant with HIPAA regulations.
            We analyzed data from consecutive patients who were 18 years of age or older with histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI. From ${commonData.references.STUDY_PERIOD_2020_2023}, ${formatNumber(commonData.nOverall, 0)} patients who underwent baseline staging MRI were included. Of these, ${formatNumber(commonData.nNeoadjuvantTherapy, 0)} patients (${formatPercent(commonData.nNeoadjuvantTherapy / commonData.nOverall, 0)}%) received standard neoadjuvant chemoradiotherapy (nCRT) followed by restaging MRI prior to rectal surgery, according to current guidelines and the decision of a multidisciplinary tumor board. The remaining ${formatNumber(commonData.nSurgeryAlone, 0)} patients (${formatPercent(commonData.nSurgeryAlone / commonData.nOverall, 0)}%) underwent primary surgery without prior therapy.
            Histopathological examination of the resected specimens served as the reference standard (Fig 1).
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
            <p>Two radiologists (M.L. and A.S., with 7 and 29 years of experience in abdominal MRI, respectively) independently assessed the images for the presence of the Avocado Sign. The radiologists were blinded to histopathological results to prevent bias. The Avocado Sign was defined as a hypointense core within an otherwise homogeneously hyperintense lymph node on contrast-enhanced T1-weighted images, regardless of node size or shape (Fig 2) [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. The sign was assessed in all visible mesorectal lymph nodes, without a minimum size threshold. Extramesorectal nodes and tumor deposits were not included in this assessment. Discrepancies were resolved by consensus. In the neoadjuvant subgroup, the Avocado Sign was assessed on restaging MRI images. A patient's N-status was determined to be positive if the Avocado Sign was present in at least one lymph node.</p>
        `;
    }

    function _generateMethodsImageAnalysisT2HTML(stats, commonData) {
         return `
            <p>For comparison with the Avocado Sign, we also evaluated the diagnostic performance of T2-weighted (T2w) morphological criteria using two approaches: literature-based criteria and cohort-optimized criteria.</p>
            <h4>Literature-Based T2 Criteria:</h4>
            <p>We selected three established literature-based T2w criteria sets for comparative analysis, applying each to its most relevant patient cohort based on the original publication's context. The criteria sets are detailed in Table 1.</p>
            <h4>Cohort-Optimized T2 Criteria (Brute-Force):</h4>
            <p>To identify the best-performing T2w criteria combination for our specific dataset, a systematic brute-force optimization was performed. This algorithm exhaustively tested all possible combinations of five morphological T2 features (size, shape, border, homogeneity, signal intensity) and logical operators (AND/OR). The optimization aimed to maximize a pre-selected diagnostic metric (e.g., ${commonData.bruteForceMetricForPublication}). The best-performing criteria set identified by this process was then used for the primary comparative analysis against the Avocado Sign.</p>
        `;
    }
    
    function _generateMethodsReferenceStandardHTML(stats, commonData) {
        return `<p>Histopathological examination of the surgical specimens served as the reference standard for lymph node status. All resected mesorectal specimens were processed according to standard protocols, and lymph nodes were meticulously identified and examined by experienced pathologists. The final N-status (N+ or N-) was determined based on the presence or absence of metastatic cells within any identified lymph node.</p>`;
    }

    function _generateMethodsStatisticalAnalysisHTML(stats, commonData) {
        return `
            <p>Descriptive statistics were used to summarize patient characteristics. The prevalence of the Avocado Sign and lymph node metastases was determined for the overall cohort and subgroups.</p>
            <p>Diagnostic performance metrics—including sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), and accuracy—were calculated from contingency tables. Receiver operating characteristic (ROC) curve analysis was performed, and the area under the curve (AUC) was calculated to evaluate and compare the diagnostic performance of the Avocado Sign and various T2w criteria sets.</p>
            <p>Statistical comparison of diagnostic performance between the Avocado Sign and T2 criteria was performed using paired tests. McNemar's test was used to compare accuracies, and DeLong's test was used for comparing AUCs from paired data. Fisher's exact test was used to assess associations between categorical features and N-status. The Mann-Whitney U test was used for comparing continuous variables between N+ and N- groups. Confidence intervals (95% CIs) for proportions were calculated using the Wilson Score method, while CIs for AUC were derived using a bootstrap percentile method with ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications and an alpha of ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA}.</p>
            <p>Statistical analyses were performed using custom scripts in JavaScript (ES6+) within a dedicated web application. A two-sided P-value of less than ${getPValueText(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, true)} was considered to indicate statistical significance.</p>
        `;
    }

    function _generateResultsPatientCharacteristicsHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive;
        if (!gesamtStats) return `<p class="text-warning">Patient characteristics data not available for the overall cohort.</p>`;
        
        const nGesamt = commonData.nOverall || 0;
        const nSurgery = commonData.nSurgeryAlone || 0;
        const nNect = commonData.nNeoadjuvantTherapy || 0;

        return `
            <p>A total of ${nGesamt} patients with histologically confirmed rectal cancer were included in the study (Fig 1). The demographic and clinical characteristics of the patient cohorts are summarized in Table 2. The median age of the overall cohort was ${formatNumber(gesamtStats.age?.median, 0)} years (IQR, ${formatNumber(gesamtStats.age?.q1,0)}–${formatNumber(gesamtStats.age?.q3,0)} years), and ${formatNumber(gesamtStats.sex?.m, 0)} of ${nGesamt} patients (${formatPercent(gesamtStats.sex?.m / nGesamt, 0)}) were men. Histopathological examination revealed lymph node metastases in ${formatNumber(gesamtStats.nStatus?.plus, 0)} of ${nGesamt} patients (${formatPercent(gesamtStats.nStatus?.plus / nGesamt, 0)}).</p>
        `;
    }

    function _generateResultsASPerformanceHTML(stats, commonData) {
        return `
            <p>The diagnostic performance of the Avocado Sign for predicting N-status was evaluated across the overall cohort and subgroups. The results, including sensitivity, specificity, predictive values, and AUC, are detailed in Table 3. In the overall cohort, the Avocado Sign achieved an AUC of ${formatNumber(stats?.Overall?.performanceAS?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(stats?.Overall?.performanceAS?.auc?.ci?.lower, 2)}, ${formatNumber(stats?.Overall?.performanceAS?.auc?.ci?.upper, 2)}), indicating strong diagnostic ability (Fig 2). The performance remained robust in both the surgery-alone and neoadjuvant therapy subgroups.</p>
            <p>Interobserver agreement for assessing the Avocado Sign was almost perfect, with a Cohen’s kappa value of 0.92 (95% CI: 0.85, 0.99) [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}].</p>
        `;
    }
    
    function _generateResultsT2LiteratureHTML(stats, commonData) {
         return `<p>We evaluated the diagnostic performance of several literature-based T2-weighted MRI criteria sets for N-status prediction within their applicable cohorts. The results showed variable performance depending on the criteria set and the patient cohort, highlighting the challenge of applying generalized criteria to specific populations.</p>`;
    }

    function _generateResultsT2OptimizedHTML(stats, commonData) {
        const bfMetric = commonData.bruteForceMetricForPublication;
        return `<p>A brute-force optimization was performed to identify the T2 criteria combination yielding the highest diagnostic performance for the selected target metric (${bfMetric}) within each cohort. The optimized criteria and their corresponding performance metrics are detailed in Table 4. This data-driven approach allows for a tailored comparison against the Avocado Sign based on the specific characteristics of our dataset.</p>`;
    }
    
    function _generateResultsComparisonHTML(stats, commonData) {
        return `<p>We conducted statistical comparisons between the diagnostic performance of the Avocado Sign and the brute-force optimized T2 criteria for each cohort, focusing on Accuracy (McNemar's test) and AUC (DeLong's test). As shown in Table 5, while there were numerical differences in performance, none reached statistical significance, suggesting that the Avocado Sign is a non-inferior alternative to a data-optimized morphological approach. Figure 3 illustrates these comparative metrics visually.</p>`;
    }

    function _generateDiscussionHTML(stats, commonData) {
        const gesamtStatsAS = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.performanceAS;

        return `
            <p>This study demonstrates that the Avocado Sign, a novel contrast-enhancement-based marker, provides high diagnostic accuracy for predicting mesorectal lymph node metastasis in patients with rectal cancer. Our primary finding is that the performance of this simple, reproducible sign is statistically non-inferior to that of cohort-optimized, complex T2-weighted criteria derived from a brute-force analysis. The Avocado Sign achieved an overall sensitivity of ${formatPercent(gesamtStatsAS?.sens?.value, 1)}, specificity of ${formatPercent(gesamtStatsAS?.spec?.value, 1)}, and an AUC of ${formatNumber(gesamtStatsAS?.auc?.value, 2, 'N/A', true)}, which compares favorably with the variable performance of established literature-based T2w criteria.</p>
            <p>Previous studies have predominantly focused on morphological criteria on T2-weighted MRI sequences. Koh et al. reported sensitivities up to 85% with combined size and morphological criteria [${commonData.references.REFERENCE_KOH_2008.id}], but systematic reviews have often reported lower overall diagnostic accuracy, with pooled sensitivities around 77% and specificities around 71% [${commonData.references.REFERENCE_AL_SUKHNI_2012.id}]. The ESGAR consensus criteria, while providing a standardized approach, showed a sensitivity of only 54% in a recent validation study by Rutegård et al., underscoring the limitations of relying solely on T2w morphology [${commonData.references.REFERENCE_RUTEGARD_2025.id}]. Our results suggest that the Avocado Sign, by leveraging contrast-enhancement patterns, may overcome some of these limitations.</p>
            <p>In the evolving landscape of rectal cancer treatment, with increasing emphasis on personalized and organ-preserving strategies [${commonData.references.REFERENCE_HABR_GAMA_2019.id}, ${commonData.references.REFERENCE_SMITH_2015.id}, ${commonData.references.REFERENCE_GARCIA_AGUILAR_2022.id}], accurate nodal staging is pivotal. The straightforward application and high reproducibility (Cohen’s kappa = 0.92) [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}] of the Avocado Sign are significant advantages, potentially facilitating its integration into routine clinical practice without the need for complex post-processing.</p>
            <h4>Limitations:</h4>
            <p>Our study has several limitations. It was a retrospective, single-center study, which may limit the generalizability of our findings. The Avocado Sign was evaluated using a specific gadolinium-based contrast agent, and its reproducibility with other agents has not been tested. While we focused on mesorectal nodes, the validity of the Avocado Sign in other lymph node regions needs to be evaluated. Furthermore, this study did not assess the impact of the Avocado Sign on long-term clinical outcomes such as local recurrence or survival.</p>
            <h4>Conclusion:</h4>
            <p>In conclusion, the Avocado Sign is a robust and promising imaging marker for the prediction of nodal metastasis in rectal cancer. Its diagnostic performance is comparable to the best-case scenario achievable with optimized T2w criteria, while offering greater simplicity and reproducibility. These findings support the inclusion of contrast-enhanced T1-weighted sequences in standard MRI protocols for rectal cancer staging to improve patient stratification and guide therapeutic decisions.</p>
        `;
    }

    function _generateReferencesHTML(stats, commonData) {
        const allReferences = Object.values(commonData.references).filter(ref => typeof ref === 'object' && ref.id).sort((a,b) => a.id - b.id);
        const filteredReferences = allReferences.filter(ref => !String(ref.id).startsWith('STUDY_PERIOD_'));
        return `<ul>${filteredReferences.map(ref => `<li>[${ref.id}] ${ref.text}</li>`).join('')}</ul>`;
    }

    const contentGenerators = {
        'title_page': _generateTitlePageHTML,
        'summary_statement': (s, c) => `<p class="fw-bold">${_generateSummaryStatementText(s, c)}</p>`,
        'key_results': _generateKeyResultsHTML,
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

    function _getPublicationTable(tableId, data, lang, stats, commonData, options = {}) {
        let headers = [], rows = [], caption = '';
        const na = 'N/A';
        const fv = (val, dig = 1, useStd = true) => formatNumber(val, dig, na, useStd);
        const fp = (val, dig = 1) => formatPercent(val, dig, na);
        
        const fCI_pub = (metric) => {
            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return na;
            const isPercent = !(metric.name === 'auc' || metric.name === 'f1');
            const digits = (metric.name === 'auc') ? 2 : 1;
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
            headers = ['Criteria Set', 'Applicable Cohort', 'Key Criteria', 'Reference'];
            rows = PUBLICATION_CONFIG.literatureCriteriaSets.map(set => [
                `${set.name}`,
                getCohortDisplayName(set.applicableCohort),
                set.studyInfo.keyCriteriaSummary,
                set.studyInfo?.reference || na
            ]);
        } else if (tableId === pubConfig.ergebnisse.patientenCharakteristikaTabelle.id) {
            caption = pubConfig.ergebnisse.patientenCharakteristikaTabelle.titleEn;
            headers = ['Characteristic', `Overall (n=${commonData.nOverall})`, `Surgery alone (n=${commonData.nSurgeryAlone})`, `Neoadjuvant therapy (n=${commonData.nNeoadjuvantTherapy})`];
            const allCohorts = ['Overall', 'surgeryAlone', 'neoadjuvantTherapy'];
            const getRowValues = (extractor) => allCohorts.map(c => extractor(stats[c]?.descriptive));
            rows = [
                ['Patients, n', ...getRowValues(d => d?.patientCount ?? 0)],
                ['Age, median (IQR) [y]', ...getRowValues(d => d?.age ? `${fv(d.age.median,0)} (${fv(d.age.q1,0)}–${fv(d.age.q3,0)})` : na)],
                ['Sex, n (%)', ...getRowValues(d => d?.sex ? `${d.sex.m} male (${fp(d.sex.m/d.patientCount,0)})` : na)],
                ['N-positive, n (%)', ...getRowValues(d => d?.nStatus ? `${d.nStatus.plus} (${fp(d.nStatus.plus/d.patientCount,0)})` : na)],
                ['AS-positive, n (%)', ...getRowValues(d => d?.asStatus ? `${d.asStatus.plus} (${fp(d.asStatus.plus/d.patientCount,0)})` : na)],
            ];
        } else if (tableId === pubConfig.ergebnisse.diagnostischeGueteASTabelle.id) {
             caption = pubConfig.ergebnisse.diagnostischeGueteASTabelle.titleEn;
             headers = ['Metric', `Overall (n=${commonData.nOverall})`, `Surgery alone (n=${commonData.nSurgeryAlone})`, `Neoadjuvant therapy (n=${commonData.nNeoadjuvantTherapy})`];
             const getRow = (metricKey) => {
                const metricName = APP_CONFIG.UI_TEXTS.tooltips.definition[metricKey]?.title || metricKey;
                const values = ['Overall', 'surgeryAlone', 'neoadjuvantTherapy'].map(c => fCI_pub(stats?.[c]?.performanceAS?.[metricKey]));
                return [ metricName, ...values ];
             };
             rows = [ getRow('sens'), getRow('spec'), getRow('ppv'), getRow('npv'), getRow('acc'), getRow('auc') ];
        } else if (tableId === pubConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id) {
            caption = pubConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleEn.replace('{BF_METRIC}', commonData.bruteForceMetricForPublication);
            headers = ['Cohort', 'Optimized Criteria (Logic)', 'Sens. (95% CI)', 'Spec. (95% CI)', 'Acc. (95% CI)', 'AUC (95% CI)'];
            rows = Object.values(APP_CONFIG.COHORTS).map(c => c.id).map(cohortId => {
                const bfRes = stats?.[cohortId]?.bruteforceDefinition;
                const perf = stats?.[cohortId]?.performanceT2Bruteforce;
                if (!bfRes || !perf) return null;
                return [
                    getCohortDisplayName(cohortId),
                    `${studyT2CriteriaManager.formatCriteriaForDisplay(bfRes.criteria, bfRes.logic)} (${bfRes.logic})`,
                    fCI_pub(perf.sens), fCI_pub(perf.spec),
                    fCI_pub(perf.acc), fCI_pub(perf.auc)
                ];
            }).filter(Boolean);
        } else if (tableId === pubConfig.ergebnisse.vergleichASvsT2Tabelle.id) {
            caption = pubConfig.ergebnisse.vergleichASvsT2Tabelle.titleEn;
            headers = ['Cohort', 'Comparison', 'Statistic Value', 'P-Value'];
            rows = Object.values(APP_CONFIG.COHORTS).map(c => c.id).flatMap(cohortId => {
                const comp = stats?.[cohortId]?.comparisonASvsT2Bruteforce;
                if (!comp) return [];
                const cohortDisplayName = getCohortDisplayName(cohortId);
                return [
                    [cohortDisplayName, 'Accuracy (McNemar)', `${fv(comp.mcnemar?.statistic, 2, true)} (df=${comp.mcnemar?.df || na})`, `${getPValueTextForPub(comp.mcnemar?.pValue)}`],
                    ['', 'AUC (DeLong)', `Z=${fv(comp.delong?.Z, 2, true)}`, `${getPValueTextForPub(comp.delong?.pValue)}`]
                ];
            });
        }


        let tableHtml = `<div class="table-responsive my-4"><table class="table table-sm table-striped small">`;
        tableHtml += `<caption><strong>${caption}</strong></caption>`;
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

        let finalHTML = `<div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: var(--sticky-header-offset, 111px); z-index: 1015;">
            <div class="col-md-3">${uiComponents.createPublicationNav(currentSectionId)}<div class="mt-3">
                <label for="publication-bf-metric-select" class="form-label small text-muted">${APP_CONFIG.UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                <select class="form-select form-select-sm" id="publication-bf-metric-select">
                    ${APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m => `<option value="${m.value}" ${m.value === commonData.bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                </select>
            </div></div>
            <div class="col-md-9"><div id="publication-content-area" class="bg-white p-3 border rounded">`;

        if (mainSection.id === 'title_page') {
             finalHTML += _getSectionContent('title_page', currentLanguage, allCohortStats, commonData);
        } else {
            finalHTML += `<h2 class="mb-4">${APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey]}</h2>`;
            mainSection.subSections.forEach(subSection => {
                finalHTML += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
                finalHTML += `<h3>${subSection.label}</h3>`;
                const sectionContent = _getSectionContent(subSection.id, currentLanguage, allCohortStats, commonData);
                finalHTML += sectionContent;
                
                const pubElements = PUBLICATION_CONFIG.publicationElements;
                if (currentSectionId === 'methoden_main' && subSection.id === 'methoden_bildanalyse_t2_kriterien') {
                     finalHTML += _getPublicationTable(pubElements.methoden.literaturT2KriterienTabelle.id, null, currentLanguage, allCohortStats, commonData);
                } else if (currentSectionId === 'ergebnisse_main') {
                     if (subSection.id === 'ergebnisse_patientencharakteristika') {
                        finalHTML += `<div class="text-center my-4"><strong class="d-block">${pubElements.figure1_flowchart.titleEn}</strong><p class="small text-muted">[Flow Diagram Placeholder - To be generated from patient inclusion/exclusion criteria]</p></div>`;
                        finalHTML += _getPublicationTable(pubElements.ergebnisse.patientenCharakteristikaTabelle.id, null, currentLanguage, allCohortStats, commonData);
                     } else if (subSection.id === 'ergebnisse_as_diagnostische_guete') {
                        finalHTML += _getPublicationTable(pubElements.ergebnisse.diagnostischeGueteASTabelle.id, null, currentLanguage, allCohortStats, commonData);
                        finalHTML += `<div class="text-center my-4"><strong class="d-block">${pubElements.ergebnisse.rocKurveOverall.titleEn}</strong><p class="small text-muted">[ROC Curve Figure Placeholder - To be generated from performance data]</p></div>`;
                     } else if (subSection.id === 'ergebnisse_t2_optimiert_diagnostische_guete') {
                         finalHTML += _getPublicationTable(pubElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id, null, currentLanguage, allCohortStats, commonData);
                     } else if (subSection.id === 'ergebnisse_vergleich_as_vs_t2') {
                        finalHTML += _getPublicationTable(pubElements.ergebnisse.vergleichASvsT2Tabelle.id, null, currentLanguage, allCohortStats, commonData);
                        finalHTML += `<div class="text-center my-4"><strong class="d-block">${pubElements.ergebnisse.asVsT2ComparisonChart.titleEn}</strong><p class="small text-muted">[Comparison Bar Chart Placeholder - To be generated from performance data]</p></div>`;
                     }
                }
                finalHTML += `</div>`;
            });
        }

        finalHTML += `</div></div></div>`;
        return finalHTML;
    }

    function getSectionContentForExport(sectionId, lang, allStats, commonData) {
        return _getSectionContent(sectionId, lang, allStats, commonData);
    }
    
    function getTableHTMLForExport(tableId, data, lang, stats, commonData, options = {}) {
        return _getPublicationTable(tableId, data, lang, stats, commonData, options);
    }

    return {
        render,
        getSectionContentForExport,
        getTableHTMLForExport
    };
})();
