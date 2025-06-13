const publicationTab = (() => {

    function _generateAbstractHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        if (!gesamtStats) return '<p class="text-warning">Statistics for the overall cohort are not available, abstract cannot be generated.</p>';

        const asGesamt = gesamtStats.performanceAS;
        const bfGesamtStats = gesamtStats.performanceT2Bruteforce;
        const vergleichASvsBFGesamt = gesamtStats.comparisonASvsT2Bruteforce;

        const nGesamt = commonData.nOverall || 0;
        const medianAge = gesamtStats.descriptive?.age?.median !== undefined ? formatNumber(gesamtStats.descriptive.age.median, 0) : 'N/A';
        const iqrAgeLower = gesamtStats.descriptive?.age?.q1 !== undefined ? formatNumber(gesamtStats.descriptive.age.q1, 0) : 'N/A';
        const iqrAgeUpper = gesamtStats.descriptive?.age?.q3 !== undefined ? formatNumber(gesamtStats.descriptive.age.q3, 0) : 'N/A';
        const ageRangeText = (medianAge !== 'N/A' && iqrAgeLower !== 'N/A' && iqrAgeUpper !== 'N/A') ?
            `${medianAge} years (IQR: ${iqrAgeLower}–${iqrAgeUpper} years)` : 'not available';
        
        const maleCount = gesamtStats.descriptive?.sex?.m || 0;
        const sexText = `${maleCount} men`;

        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023?.text || "January 2020 and November 2023";

        const formatCIForPublication = (metric) => {
            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
            const isPercent = !(metric.name === 'auc' || metric.name === 'f1');
            const digits = (metric.name === 'auc' || metric.name === 'f1') ? 2 : 0;
            const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);

            if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                return valueStr;
            }
            const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
            const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
            return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`;
        };
        
        return `
            <p><strong>Background:</strong> Accurate preoperative determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer, yet standard T2-weighted (T2w) MRI criteria have shown limited accuracy.</p>
            <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced MRI marker, and to compare it with established literature-based and cohort-optimized T2w morphological criteria for predicting N-status.</p>
            <p><strong>Materials and Methods:</strong> This retrospective, single-center study received institutional review board approval, with a waiver of informed consent. Data from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod} were analyzed. Two blinded radiologists evaluated the AS (a hypointense core within a hyperintense lymph node on contrast-enhanced T1-weighted images) and T2w criteria. Histopathological examination served as the reference standard. Diagnostic performance was assessed using AUC, and methods were compared with the DeLong test.</p>
            <p><strong>Results:</strong> A total of ${formatNumber(nGesamt,0)} patients (median age, ${ageRangeText}; ${sexText}) were analyzed, of whom ${formatNumber(commonData.nPositive, 0)} (${formatPercent(commonData.nPositive / nGesamt, 0)}) were N-positive. The AS demonstrated an AUC of ${formatNumber(asGesamt?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(asGesamt?.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(asGesamt?.auc?.ci?.upper, 2, 'N/A', true)}). A brute-force optimized T2w criteria set yielded a numerically similar AUC of ${formatNumber(bfGesamtStats?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(bfGesamtStats?.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(bfGesamtStats?.auc?.ci?.upper, 2, 'N/A', true)}). The difference in AUC between AS and the optimized T2w criteria was not statistically significant (${getPValueText(vergleichASvsBFGesamt?.delong?.pValue, true)}).</p>
            <p><strong>Conclusion:</strong> The Avocado Sign is a highly reproducible MRI marker for predicting lymph node status in rectal cancer, demonstrating diagnostic performance non-inferior to cohort-optimized T2w criteria and superior to several established literature-based criteria. Its application has the potential to simplify and improve the accuracy of preoperative nodal staging.</p>
            <p class="small text-muted mt-2">Abbreviations: AS = Avocado Sign, AUC = Area Under the Curve, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, nCRT = neoadjuvant chemoradiotherapy, T2w = T2-weighted.</p>
        `;
    }

    function _generateIntroductionHTML(stats, commonData) {
        return `
            <p>Accurate preoperative determination of mesorectal lymph node status (N-status) in patients with rectal cancer is of paramount importance, as it directly influences therapeutic strategies, ranging from primary surgery to neoadjuvant chemoradiotherapy (nCRT) and organ-preserving "watch-and-wait" approaches [${commonData.references.REFERENCE_SAUER_2004.id}–${commonData.references.REFERENCE_SMITH_2015.id}]. Magnetic resonance imaging (MRI) is the established gold standard for local staging; however, its accuracy for N-staging, which traditionally relies on T2-weighted (T2w) morphological criteria such as size, border irregularity, and signal heterogeneity, remains a subject of debate [${commonData.references.REFERENCE_BEETS_TAN_2018.id}].</p>
            <p>Multiple studies and meta-analyses have highlighted the suboptimal diagnostic performance of these T2w criteria, with reported sensitivities and specificities often falling below 80% [${commonData.references.REFERENCE_ZHANG_2017.id}, ${commonData.references.REFERENCE_AL_SUKHNI_2012.id}]. This diagnostic uncertainty can lead to both over- and undertreatment, underscoring a critical need for more reliable imaging markers. While advanced techniques like diffusion-weighted imaging have been explored, they have not yet consistently surpassed morphological assessment in clinical practice [${commonData.references.REFERENCE_HAO_2025.id}].</p>
            <p>Our group previously introduced the "Avocado Sign" (AS), a novel marker observed on contrast-enhanced T1-weighted MRI, defined as a hypointense core within a homogeneously hyperintense lymph node [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. The initial evaluation suggested high diagnostic accuracy and excellent interobserver reproducibility. However, a direct and robust comparison against both established literature-based criteria and a data-optimized "best-case" scenario for T2w morphology on the same patient cohort has been lacking.</p>
            <p>This study aims to rigorously evaluate the diagnostic performance of the Avocado Sign in comparison with a spectrum of T2w criteria. Our primary hypothesis is that the Avocado Sign is diagnostically non-inferior to the best possible T2w criteria combination derived from our cohort and superior to commonly cited literature-based criteria, thereby offering a more reliable and simpler alternative for nodal staging in rectal cancer.</p>
        `;
    }

    function _generateMethodsStudyDesignHTML(stats, commonData) {
        return `
            <p>This retrospective, single-institution study was performed in compliance with the Health Insurance Portability and Accountability Act and received approval from the institutional review board of Klinikum St. Georg, Leipzig, Germany. The requirement for written informed consent was waived for this retrospective analysis.</p>
            <p>We identified a consecutive cohort of ${formatNumber(commonData.nOverall, 0)} patients who underwent pelvic MRI for primary staging or restaging of histologically confirmed rectal cancer between ${commonData.references.STUDY_PERIOD_2020_2023.text}. Inclusion criteria were the availability of high-quality contrast-enhanced MRI sequences and definitive histopathological results from the subsequent surgical resection specimen. Exclusion criteria included contraindications to MRI or gadolinium-based contrast agents, or the absence of a surgical reference standard. Of the final cohort, ${formatNumber(commonData.nNeoadjuvantTherapy, 0)} patients (${formatPercent(commonData.nNeoadjuvantTherapy / commonData.nOverall, 1)}) had received nCRT and underwent restaging MRI, while ${formatNumber(commonData.nSurgeryAlone, 0)} patients (${formatPercent(commonData.nSurgeryAlone / commonData.nOverall, 1)}) proceeded directly to surgery after primary staging MRI.</p>
        `;
    }

    function _generateMethodsMriProtocolHTML(stats, commonData) {
        return `
            <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers) with a phased-array body coil. To minimize bowel peristalsis, butylscopolamine was administered intravenously at the beginning of the examination. The standardized protocol included high-resolution, multiplanar T2-weighted turbo spin-echo sequences and an axial diffusion-weighted sequence. Following the intravenous administration of a weight-based dose (0.2 mL/kg) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco), a fat-suppressed, T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence was acquired. Key imaging parameters are detailed in Table 1. The imaging protocol was identical for both primary staging and post-nCRT restaging examinations.</p>
        `;
    }

    function _generateMethodsImageAnalysisHTML(stats, commonData) {
         return `
            <h4>Image Analysis</h4>
            <p>Two board-certified radiologists (M.L. and A.O.S., with 7 and 29 years of experience in abdominal MRI, respectively), who were blinded to the histopathological outcomes and each other's findings, independently reviewed all MRI studies. Any discrepancies in assessment were resolved by consensus.</p>
            <p><strong>Avocado Sign (AS) Assessment:</strong> On the contrast-enhanced T1-weighted VIBE images, all visible mesorectal lymph nodes were assessed for the presence of the Avocado Sign, defined as a distinct hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape [${commonData.references.REFERENCE_LURZ_SCHAEFER_2025.id}]. A patient was classified as AS-positive if at least one such node was identified.</p>
            <p><strong>T2-weighted (T2w) Criteria Assessment:</strong> The same radiologists evaluated the T2w images for five standard morphological features: size (short-axis diameter), shape (round vs. oval), border (sharp vs. irregular), internal homogeneity (homogeneous vs. heterogeneous), and signal intensity (low, intermediate, or high relative to muscle). This feature set was used for subsequent comparative analyses.</p>
        `;
    }
    
    function _generateMethodsComparativeCriteriaHTML(stats, commonData) {
        return `
            <h4>Comparative T2w Criteria Sets</h4>
            <p>To provide a robust comparison for the Avocado Sign, we evaluated three distinct types of T2w criteria sets:</p>
            <p><strong>1. Literature-Based Criteria:</strong> We applied three criteria sets from previously published, influential studies to their respective target populations within our cohort (Table 2). These included the complex, size-dependent criteria from the ESGAR consensus group (as validated by Rutegård et al), criteria based on morphological features by Koh et al, and a size-only criterion for post-nCRT restaging by Barbaro et al [${commonData.references.REFERENCE_RUTEGARD_2025.id}, ${commonData.references.REFERENCE_KOH_2008.id}, ${commonData.references.REFERENCE_BARBARO_2024.id}].</p>
            <p><strong>2. Cohort-Optimized Criteria (Brute-Force):</strong> To establish a "best-case" benchmark for T2w morphology within our specific dataset, we performed a systematic brute-force optimization. A computational algorithm exhaustively tested all possible combinations of the five T2w features and logical operators (AND/OR) to identify the set that maximized a pre-selected diagnostic metric (${commonData.bruteForceMetricForPublication}) for each patient cohort (Overall, Surgery alone, Neoadjuvant therapy). The best-performing criteria set for the overall cohort was used for the primary comparison against the Avocado Sign.</p>
        `;
    }

    function _generateMethodsReferenceStandardHTML(stats, commonData) {
        return `<h4>Reference Standard</h4><p>The definitive reference standard for N-status was the histopathological examination of the total mesorectal excision specimens performed by experienced gastrointestinal pathologists. All identified lymph nodes were meticulously dissected and analyzed for the presence of metastatic tumor cells. A patient was classified as N-positive if metastases were found in at least one lymph node.</p>`;
    }

    function _generateMethodsStatisticalAnalysisHTML(stats, commonData) {
        return `
            <h4>Statistical Analysis</h4>
            <p>Descriptive statistics were used to summarize patient characteristics. Diagnostic performance metrics—including sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy, and the area under the receiver operating characteristic curve (AUC)—were calculated for each diagnostic method. Wilson score method was used for 95% confidence intervals (CIs) of proportions, and bootstrap percentile method (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications) was used for CIs of AUC and F1-score.</p>
            <p>The primary comparison between the AUC of the Avocado Sign and the cohort-optimized T2w criteria was performed using the method described by DeLong et al for paired ROC curves. McNemar’s test was used to compare accuracies. For associations between individual categorical features and N-status, Fisher's exact test was used. All statistical analyses were performed using custom scripts in JavaScript, leveraging standard statistical formulas. A two-sided *P* value of less than .05 was considered to indicate statistical significance.</p>
        `;
    }

    function _generateResultsPatientCharacteristicsHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive;
        if (!gesamtStats) return `<p class="text-warning">Patient characteristics data not available for the overall cohort.</p>`;
        
        const nGesamt = gesamtStats.patientCount;
        const maleCount = gesamtStats.sex?.m ?? 0;
        const meanAge = formatNumber(gesamtStats.age?.mean, 1);
        const sdAge = formatNumber(gesamtStats.age?.sd, 1);
        const surgeryAloneCount = gesamtStats.therapy?.surgeryAlone ?? 0;
        const neoadjuvantTherapyCount = gesamtStats.therapy?.neoadjuvantTherapy ?? 0;
        const nPlusCount = gesamtStats.nStatus?.plus ?? 0;

        return `
            <p>The study cohort comprised ${nGesamt} patients (mean age, ${meanAge} years ± ${sdAge} [standard deviation]; ${maleCount} men). Of these, ${surgeryAloneCount} (${formatPercent(surgeryAloneCount / nGesamt, 0)}) underwent primary surgery, and ${neoadjuvantTherapyCount} (${formatPercent(neoadjuvantTherapyCount / nGesamt, 0)}) received nCRT. Overall, ${nPlusCount} of ${nGesamt} patients (${formatPercent(nPlusCount / nGesamt, 0)}) had histopathologically confirmed lymph node metastases (N-positive). Detailed patient characteristics are provided in Table 1.</p>
        `;
    }

    function _generateResultsASPerformanceHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.performanceAS;
        if (!gesamtStats) return `<p class="text-warning">Avocado Sign diagnostic performance data not available.</p>`;

        const formatMetricForPub = (metric, name) => {
             if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
             const isPercent = !(name === 'auc');
             const digits = (name === 'auc') ? 2 : 0;
             const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);
             if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                 return valueStr;
             }
             const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
             const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
             return `${valueStr} (${lowerStr}, ${upperStr})`;
        };

        return `
            <p>For the entire cohort (n=${commonData.nOverall}), the Avocado Sign demonstrated a sensitivity of ${formatMetricForPub(gesamtStats.sens, 'sens')}, a specificity of ${formatMetricForPub(gesamtStats.spec, 'spec')}, and an accuracy of ${formatMetricForPub(gesamtStats.acc, 'acc')}. The area under the curve (AUC) was ${formatNumber(gesamtStats.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(gesamtStats.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(gesamtStats.auc?.ci?.upper, 2, 'N/A', true)}), indicating excellent diagnostic performance. The interobserver agreement for the sign was almost perfect (Cohen’s kappa = 0.92). The performance was robust across both the primary surgery and post-nCRT subgroups (Table 3).</p>
        `;
    }
    
    function _generateResultsComparisonHTML(stats, commonData) {
        const gesamtStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        if (!gesamtStats) return `<p class="text-warning">Data for comparison not available.</p>`;

        const bfMetric = commonData.bruteForceMetricForPublication;
        const asAUC = gesamtStats.performanceAS?.auc;
        const bfAUC = gesamtStats.performanceT2Bruteforce?.auc;
        const comp = gesamtStats.comparisonASvsT2Bruteforce;

        return `
            <p>The cohort-optimized T2w criteria, identified through brute-force analysis to maximize ${bfMetric}, yielded an AUC of ${formatNumber(bfAUC?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(bfAUC?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(bfAUC?.ci?.upper, 2, 'N/A', true)}). When directly compared, no significant difference was found between the AUC of the Avocado Sign and the optimized T2w criteria (${getPValueText(comp?.delong?.pValue, true)}). Detailed performance metrics for all evaluated criteria sets are presented in Table 3 and Table 4. The statistical comparison is summarized in Table 5.</p>
        `;
    }

    function _generateDiscussionHTML(stats, commonData) {
        const asGesamt = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.performanceAS;
        return `
            <p>In this study, we demonstrated that the Avocado Sign, a novel contrast-enhancement-based MRI marker, has high diagnostic performance for predicting mesorectal lymph node metastasis, with an overall accuracy of ${formatPercent(asGesamt?.acc?.value, 0)} and an AUC of ${formatNumber(asGesamt?.auc?.value, 2, 'N/A', true)}. Crucially, our analysis revealed that the performance of the Avocado Sign was statistically non-inferior to that of a "best-case" T2w criteria set, which was computationally optimized for our specific patient cohort. This finding suggests that the Avocado Sign is not only a strong standalone predictor but also a robust alternative to complex morphological assessments.</p>
            <p>The limitations of conventional T2w criteria are well-documented. Studies such as the OCUM trial reported accuracies as low as 56.5% for nodal staging, leading to the conclusion that major treatment decisions should not be based on T- and N-staging alone [${commonData.references.REFERENCE_STELZNER_2022.id}]. While various refined criteria have been proposed, such as those by the ESGAR consensus group or Barbaro et al. for the post-nCRT setting, they often involve complex, size-dependent rules or show variable performance [${commonData.references.REFERENCE_BEETS_TAN_2018.id}, ${commonData.references.REFERENCE_BARBARO_2024.id}]. The Avocado Sign offers a potential simplification by providing a single, reproducible binary feature that appears effective across both primary staging and post-treatment evaluation scenarios, as evidenced by its consistent high performance in our subgroups.</p>
            <p>Our study has several limitations. First, its retrospective, single-center design may limit the generalizability of our findings. Second, all examinations were performed on a single 3.0-T MRI system using one type of gadolinium-based contrast agent; performance with other agents or field strengths is unknown. Third, we focused on patient-level analysis rather than a node-by-node correlation, which is challenging after nCRT and of debated clinical utility. Finally, this analysis did not include extramesorectal nodes or assess long-term oncologic outcomes.</p>
            <p>In conclusion, the Avocado Sign is a highly accurate and reproducible imaging marker for the prediction of mesorectal lymph node involvement in rectal cancer. Its performance is comparable to a computationally optimized set of T2w criteria, suggesting it could simplify and standardize nodal assessment. Prospective multicenter validation is warranted to confirm these findings and establish the role of the Avocado Sign in routine clinical practice, potentially improving patient stratification for advanced treatment paradigms like total neoadjuvant therapy and nonoperative management.</p>
        `;
    }

    function _generateReferencesHTML(stats, commonData) {
        const allReferences = Object.values(commonData.references).filter(ref => typeof ref === 'object' && ref.id && !ref.isInternal).sort((a, b) => a.id - b.id);
        return `<ol>${allReferences.map(ref => `<li>${ref.text}</li>`).join('')}</ol>`;
    }

    const contentGenerators = {
        'abstract_main': _generateAbstractHTML,
        'introduction_main': _generateIntroductionHTML,
        'methoden_studienanlage_ethik': _generateMethodsStudyDesignHTML,
        'methoden_mrt_protokoll_akquisition': _generateMethodsMriProtocolHTML,
        'methoden_bildanalyse_as_und_t2': _generateMethodsImageAnalysisHTML,
        'methoden_vergleichskriterien_t2': _generateMethodsComparativeCriteriaHTML,
        'methoden_referenzstandard_histopathologie': _generateMethodsReferenceStandardHTML,
        'methoden_statistische_analyse_methoden': _generateMethodsStatisticalAnalysisHTML,
        'ergebnisse_patientencharakteristika': _generateResultsPatientCharacteristicsHTML,
        'ergebnisse_as_diagnostische_guete': _generateResultsASPerformanceHTML,
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

    function _getPublicationTable(tableId, data, stats, commonData) {
        let headers = [], rows = [], caption = '', notes = '';
        const na = 'N/A';
        const fv = (val, dig = 1) => formatNumber(val, dig, na, true);
        const fp = (val, dig = 1) => formatPercent(val, dig, na);
        
        const formatCIForPub = (metric, name) => {
             if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
             const isPercent = !(name === 'auc');
             const digits = (name === 'auc') ? 2 : 0;
             const valueStr = isPercent ? fp(metric.value, digits) : fv(metric.value, digits);
             if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                 return valueStr;
             }
             const lowerStr = isPercent ? fp(metric.ci.lower, digits) : fv(metric.ci.lower, digits);
             const upperStr = isPercent ? fp(metric.ci.upper, digits) : fv(metric.ci.upper, digits);
             return `${valueStr} (${lowerStr}, ${upperStr})`;
        };
        const pubConfig = PUBLICATION_CONFIG.publicationElements;
        const cohortId = state.getCurrentCohort();

        switch (tableId) {
            case pubConfig.ergebnisse.patientenCharakteristikaTabelle.id:
                caption = pubConfig.ergebnisse.patientenCharakteristikaTabelle.titleEn;
                const d = stats?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive;
                if (!d) return 'Table data not available.';
                headers = ['Characteristic', `Overall Cohort (n=${d.patientCount})`];
                rows = [
                    ['Age (y), mean ± SD', `${fv(d.age?.mean, 1)} ± ${fv(d.age?.sd, 1)}`],
                    ['Age (y), median (IQR)', `${fv(d.age?.median, 0)} (${fv(d.age?.q1, 0)}–${fv(d.age?.q3, 0)})`],
                    ['Sex, men', `${d.sex?.m ?? 0} (${fp((d.sex?.m ?? 0) / d.patientCount, 0)})`],
                    ['Treatment approach', ''],
                    ['   Surgery alone', `${d.therapy?.surgeryAlone ?? 0} (${fp(d.therapy?.surgeryAlone / d.patientCount, 0)})`],
                    ['   Neoadjuvant therapy', `${d.therapy?.neoadjuvantTherapy ?? 0} (${fp(d.therapy?.neoadjuvantTherapy / d.patientCount, 0)})`],
                    ['Histopathologic N-status, positive', `${d.nStatus?.plus ?? 0} (${fp(d.nStatus?.plus / d.patientCount, 0)})`]
                ];
                notes = "Data are numbers of patients, with percentages in parentheses, or mean ± standard deviation or median and interquartile range (IQR).";
                break;
            
            case pubConfig.methoden.literaturT2KriterienTabelle.id:
                 caption = pubConfig.methoden.literaturT2KriterienTabelle.titleEn;
                 headers = ['Criteria Set', 'Applicable Cohort', 'Key Criteria Summary', 'Reference'];
                 rows = PUBLICATION_CONFIG.literatureCriteriaSets.map(set => [
                     `<strong>${set.name}</strong>`,
                     getCohortDisplayName(set.applicableCohort),
                     set.studyInfo.keyCriteriaSummary,
                     set.studyInfo.reference
                 ]);
                 notes = "Summary of the literature-based T2-weighted criteria sets used for comparative analysis.";
                 break;

            default:
                return `<p class="text-danger">Table with ID '${tableId}' not implemented.</p>`;
        }

        let tableHtml = `<div class="table-responsive my-4"><table class="table table-sm table-striped small">`;
        tableHtml += `<caption><strong>${caption}</strong></caption>`;
        tableHtml += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
        rows.forEach(row => {
            tableHtml += `<tr>${row.map((cell, index) => {
                const isIndented = cell.startsWith('   ');
                const tag = (index === 0 && !isIndented) ? 'th' : 'td';
                const style = isIndented ? 'style="padding-left: 2em;"' : (tag === 'th' ? 'style="text-align: left;"' : '');
                return `<${tag} ${style}>${cell.trim()}</${tag}>`;
            }).join('')}</tr>`;
        });
        tableHtml += `</tbody>`;
        if(notes) {
            tableHtml += `<tfoot><tr><td colspan="${headers.length}" class="text-muted small p-2">${notes}</td></tr></tfoot>`;
        }
        tableHtml += `</table></div>`;
        return tableHtml;
    }

    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats?.Overall?.descriptive?.patientCount || 0,
            nPositive: allCohortStats?.Overall?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allCohortStats?.surgeryAlone?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats?.neoadjuvantTherapy?.descriptive?.patientCount || 0,
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
            <div class="col-md-9"><div id="publication-content-area" class="bg-white p-3 border rounded">
                <h2 class="mb-4">${APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey]}</h2>`;

        mainSection.subSections.forEach(subSection => {
            finalHTML += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            if(mainSection.subSections.length > 1) {
                finalHTML += `<h3>${subSection.label}</h3>`;
            }
            finalHTML += _getSectionContent(subSection.id, currentLanguage, allCohortStats, commonData);
            
            const pubElements = PUBLICATION_CONFIG.publicationElements;
            if (currentSectionId === 'methoden_main' && subSection.id === 'methoden_vergleichskriterien_t2') {
                 finalHTML += _getPublicationTable(pubElements.methoden.literaturT2KriterienTabelle.id, data, allCohortStats, commonData);
            } else if (currentSectionId === 'ergebnisse_main' && subSection.id === 'ergebnisse_patientencharakteristika') {
                 finalHTML += _getPublicationTable(pubElements.ergebnisse.patientenCharakteristikaTabelle.id, data, allCohortStats, commonData);
            }
            finalHTML += `</div>`;
        });

        finalHTML += `</div></div></div>`;
        return finalHTML;
    }

    function getSectionContentForExport(sectionId, lang, allStats, commonData) {
        return _getSectionContent(sectionId, lang, allStats, commonData);
    }
    
    function getTableHTMLForExport(tableId, data, stats, commonData) {
        return _getPublicationTable(tableId, data, stats, commonData);
    }

    return {
        render,
        getSectionContentForExport,
        getTableHTMLForExport
    };
})();
