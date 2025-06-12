const DEFAULT_T2_CRITERIA = Object.freeze({
    logic: 'AND',
    size: { active: true, threshold: 5.0, condition: '>=' },
    shape: { active: false, value: 'round' },
    border: { active: false, value: 'irregular' },
    homogeneity: { active: false, value: 'heterogeneous' },
    signal: { active: false, value: 'highSignal' }
});

const APP_CONFIG = Object.freeze({
    APP_NAME: "Nodal Staging: Avocado Sign vs. T2 Criteria",
    APP_VERSION: "3.0.1",
    COHORTS: Object.freeze({
        OVERALL: { id: 'Overall', therapyValue: null, displayName: 'Overall' },
        SURGERY_ALONE: { id: 'surgeryAlone', therapyValue: 'surgeryAlone', displayName: 'Surgery alone' },
        NEOADJUVANT: { id: 'neoadjuvantTherapy', therapyValue: 'neoadjuvantTherapy', displayName: 'Neoadjuvant therapy' }
    }),
    DEFAULT_SETTINGS: Object.freeze({
        COHORT: 'Overall',
        T2_LOGIC: 'AND',
        DATA_TABLE_SORT: Object.freeze({ key: 'id', direction: 'asc', subKey: null }),
        ANALYSIS_TABLE_SORT: Object.freeze({ key: 'id', direction: 'asc', subKey: null }),
        STATS_LAYOUT: 'einzel',
        STATS_COHORT1: 'Overall',
        STATS_COHORT2: 'neoadjuvantTherapy',
        PRESENTATION_VIEW: 'as-vs-t2',
        PRESENTATION_STUDY_ID: 'applied_criteria',
        PUBLICATION_SECTION: 'abstract_main',
        PUBLICATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        PUBLICATION_LANG: 'en'
    }),
    AVAILABLE_BRUTE_FORCE_METRICS: Object.freeze([
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'PPV' },
        { value: 'NPV', label: 'NPV' }
    ]),
    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'appliedT2Criteria_v4.2_detailed',
        APPLIED_LOGIC: 'appliedT2Logic_v4.2_detailed',
        CURRENT_COHORT: 'currentCohort_v4.3_unified',
        PUBLICATION_SECTION: 'currentPublicationSection_v4.4_detailed',
        PUBLICATION_BRUTE_FORCE_METRIC: 'currentPublicationBfMetric_v4.4_detailed',
        STATS_LAYOUT: 'currentStatsLayout_v4.2_detailed',
        STATS_COHORT1: 'currentStatsCohort1_v4.3_unified',
        STATS_COHORT2: 'currentStatsCohort2_v4.3_unified',
        PRESENTATION_VIEW: 'currentPresentationView_v4.2_detailed',
        PRESENTATION_STUDY_ID: 'currentPresentationStudyId_v4.2_detailed',
        CHART_COLOR_SCHEME: 'chartColorScheme_v4.2_detailed',
        FIRST_APP_START: 'appFirstStart_v3.0',
        PUBLICATION_LANG: 'publicationLang_v4.4_detailed'
    }),
    PATHS: Object.freeze({
        BRUTE_FORCE_WORKER: 'workers/brute_force_worker.js'
    }),
    PERFORMANCE_SETTINGS: Object.freeze({
        DEBOUNCE_DELAY_MS: 250
    }),
    STATISTICAL_CONSTANTS: Object.freeze({
        BOOTSTRAP_CI_REPLICATIONS: 1000,
        BOOTSTRAP_CI_ALPHA: 0.05,
        SIGNIFICANCE_LEVEL: 0.05,
        SIGNIFICANCE_SYMBOLS: Object.freeze([
            { threshold: 0.001, symbol: '***' },
            { threshold: 0.01, symbol: '**' },
            { threshold: 0.05, symbol: '*' }
        ]),
        DEFAULT_CI_METHOD_PROPORTION: 'Wilson Score',
        DEFAULT_CI_METHOD_EFFECTSIZE: 'Bootstrap Percentile',
        FISHER_EXACT_THRESHOLD: 5
    }),
    T2_CRITERIA_SETTINGS: Object.freeze({
        SIZE_RANGE: Object.freeze({ min: 0.1, max: 25.0, step: 0.1 }),
        SHAPE_VALUES: Object.freeze(['round', 'oval']),
        BORDER_VALUES: Object.freeze(['sharp', 'irregular']),
        HOMOGENEITY_VALUES: Object.freeze(['homogeneous', 'heterogeneous']),
        SIGNAL_VALUES: Object.freeze(['lowSignal', 'intermediateSignal', 'highSignal'])
    }),
    UI_SETTINGS: Object.freeze({
        ICON_SIZE: 20,
        ICON_STROKE_WIDTH: 1.5,
        ICON_COLOR: 'var(--text-dark)',
        TOOLTIP_DELAY: Object.freeze([300, 100]),
        TOAST_DURATION_MS: 4500,
        TRANSITION_DURATION_MS: 350,
        STICKY_HEADER_OFFSET: '111px'
    }),
    CHART_SETTINGS: Object.freeze({
        DEFAULT_WIDTH: 450,
        DEFAULT_HEIGHT: 350,
        DEFAULT_MARGIN: Object.freeze({ top: 30, right: 40, bottom: 70, left: 70 }),
        COMPACT_PIE_MARGIN: Object.freeze({ top: 15, right: 15, bottom: 50, left: 15 }),
        AS_COLOR: '#4472C4',
        T2_COLOR: '#E0DC2C',
        ANIMATION_DURATION_MS: 750,
        AXIS_LABEL_FONT_SIZE: '11px',
        TICK_LABEL_FONT_SIZE: '10px',
        LEGEND_FONT_SIZE: '10px',
        TOOLTIP_FONT_SIZE: '11px',
        PLOT_BACKGROUND_COLOR: '#ffffff',
        ENABLE_GRIDLINES: true
    }),
    EXPORT_SETTINGS: Object.freeze({
        DATE_FORMAT: 'YYYYMMDD',
        FILENAME_TEMPLATE: 'AvocadoSignT2_{TYPE}_{COHORT}_{DATE}.{EXT}',
        TABLE_PNG_EXPORT_SCALE: 2,
        ENABLE_TABLE_PNG_EXPORT: true,
        CSV_DELIMITER: ';',
        FILENAME_TYPES: Object.freeze({
            STATS_CSV: 'Statistics_CSV',
            BRUTEFORCE_TXT: 'BruteForce_Report_TXT',
            DESCRIPTIVE_MD: 'Descriptive_Statistics_MD',
            DATA_MD: 'Data_List_MD',
            ANALYSIS_MD: 'Analysis_Table_MD',
            FILTERED_DATA_CSV: 'Filtered_Data_CSV',
            COMPREHENSIVE_REPORT_HTML: 'Comprehensive_Report_HTML',
            CHART_SINGLE_PNG: '{ChartName}_PNG',
            CHART_SINGLE_SVG: '{ChartName}_SVG',
            TABLE_PNG_EXPORT: '{TableName}_PNG',
            PRES_AS_PERF_CSV: 'Pres_AS_Performance_CSV',
            PRES_AS_PERF_MD: 'Pres_AS_Performance_MD',
            PRES_AS_VS_T2_PERF_CSV: 'Pres_Performance_ASvsT2_{StudyID}_CSV',
            PRES_AS_VS_T2_COMP_MD: 'Pres_Metrics_ASvsT2_{StudyID}_MD',
            PRES_AS_VS_T2_TESTS_MD: 'Pres_Tests_ASvsT2_{StudyID}_MD',
            CRITERIA_COMPARISON_MD: 'Criteria_Comparison_MD',
            PUBLICATION_ABSTRACT_MD: 'Publication_Abstract_MD',
            PUBLICATION_INTRODUCTION_MD: 'Publication_Introduction_MD',
            PUBLICATION_METHODS_MD: 'Publication_Methods_{SectionName}_MD',
            PUBLICATION_RESULTS_MD: 'Publication_Results_{SectionName}_MD',
            PUBLICATION_DISCUSSION_MD: 'Publication_Discussion_MD',
            PUBLICATION_REFERENCES_MD: 'Publication_References_MD',
            PUBLICATION_SECTION_MD: 'Publication_Section_{SectionName}_MD',
            ALL_ZIP: 'Complete_Export_ZIP',
            CSV_ZIP: 'CSV_Package_ZIP',
            MD_ZIP: 'Markdown_Package_ZIP',
            PNG_ZIP: 'Image_Package_PNG_ZIP',
            SVG_ZIP: 'Vector_Package_SVG_ZIP'
        })
    }),
    REPORT_SETTINGS: Object.freeze({
        REPORT_TITLE: 'Comprehensive Analysis Report',
        REPORT_AUTHOR: 'Generated by AvocadoSign Analysis Tool',
        INCLUDE_APP_VERSION: true,
        INCLUDE_GENERATION_TIMESTAMP: true,
        INCLUDE_KOLLEKTIV_INFO: true,
        INCLUDE_T2_CRITERIA: true,
        INCLUDE_DESCRIPTIVES_TABLE: true,
        INCLUDE_DESCRIPTIVES_CHARTS: true,
        INCLUDE_AS_PERFORMANCE_TABLE: true,
        INCLUDE_T2_PERFORMANCE_TABLE: true,
        INCLUDE_AS_VS_T2_COMPARISON_TABLE: true,
        INCLUDE_AS_VS_T2_COMPARISON_CHART: true,
        INCLUDE_ASSOCIATIONS_TABLE: true,
        INCLUDE_BRUTEFORCE_BEST_RESULT: true
    }),
    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Applied T2 Criteria',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    }),
    REFERENCES_FOR_PUBLICATION: Object.freeze({
        STUDY_PERIOD_2020_2023: "January 2020 and November 2023",
        REFERENCE_SIEGEL_2023: { id: 1, text: "Siegel RL, Miller KD, Wagle NS, Jemal A (2023) Cancer statistics, 2023. CA Cancer J Clin 73:17–48. https://doi.org/10.3322/caac.21763" },
        REFERENCE_SAUER_2004: { id: 2, text: "Sauer R, Becker H, Hohenberger W et al (2004) Preoperative versus postoperative chemoradiotherapy for rectal cancer. N Engl J Med 351:1731–1740. https://doi.org/10.1056/NEJMoa040694" },
        REFERENCE_BOSSET_2006: { id: 3, text: "Bosset JF, Collette L, Calais G et al (2006) Chemotherapy with preoperative radiotherapy in rectal cancer. N Engl J Med 355:1114–1123. https://doi.org/10.1056/NEJMoa060829" },
        REFERENCE_HABR_GAMA_2019: { id: 4, text: "Habr-Gama A, São Julião GP, Vailati BB et al (2019) Organ preservation in cT2N0 rectal cancer after neoadjuvant chemoradiation therapy: the impact of radiation therapy dose-escalation and consolidation chemotherapy. Ann Surg 269:102–107. https://doi.org/10.1097/SLA.0000000000002447" },
        REFERENCE_SMITH_2015: { id: 5, text: "Smith JJ, Chow OS, Gollub MJ et al (2015) Organ preservation in rectal adenocarcinoma: a phase II randomized controlled trial evaluating 3-year disease-free survival in patients with locally advanced rectal cancer treated with chemoradiation plus induction or consolidation chemotherapy, and total mesorectal excision or nonoperative management. BMC Cancer 15:767. https://doi.org/10.1186/s12885-015-1632-z" },
        REFERENCE_BEETS_TAN_2018: { id: 6, text: "Beets-Tan RGH, Lambregts DMJ, Maas M et al (2018) Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol 28:1465–1475. https://doi.org/10.1007/s00330-017-5026-2" },
        REFERENCE_ZHANG_2017: { id: 7, text: "Zhang H, Zhang C, Zheng Z et al (2017) Chemical shift effect predicting lymph node status in rectal cancer using high-resolution MR imaging with node-for-node matched histopathological validation. Eur Radiol 27:3845–3855. https://doi.org/10.1007/s00330-017-4738-7" },
        REFERENCE_ALE_ALI_2019: { id: 8, text: "Ale Ali H, Kirsch R, Razaz S et al (2019) Extramural venous invasion in rectal cancer: overview of imaging, histopathology, and clinical implications. Abdom Radiol (NY) 44:1–10. https://doi.org/10.1007/s00261-018-1673-2" },
        REFERENCE_BEWICK_2004: { id: 9, text: "Bewick V, Cheek L, Ball J (2004) Statistics review 8: qualitative data—tests of association. Crit Care 8:46–53. https://doi.org/10.1186/cc2428" },
        REFERENCE_KOH_2008: { id: 10, text: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G (2008) Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys 71:456–461. https://doi.org/10.1016/j.ijrobp.2007.10.016" },
        REFERENCE_AL_SUKHNI_2012: { id: 11, text: "Al-Sukhni E, Milot L, Fruitman M et al (2012) Diagnostic accuracy of MRI for assessment of T category, lymph node metastases, and circumferential resection margin involvement in patients with rectal cancer: a systematic review and meta-analysis. Ann Surg 19:2212–2223. https://doi.org/10.1245/s10434-011-2210-5" },
        REFERENCE_STELZNER_2022: { id: 12, text: "Stelzner S, Ruppert R, Kube R et al (2022) Selection of patients with rectal cancer for neoadjuvant therapy using pre-therapeutic MRI—results from OCUM trial. Eur J Radiol 147:110113. https://doi.org/10.1016/j.ejrad.2021.110113" },
        REFERENCE_LAMBREGTS_2013: { id: 13, text: "Lambregts DMJ, Heijnen LA, Maas M et al (2013) Gadofosveset-enhanced MRI for the assessment of rectal cancer lymph nodes: predictive criteria. Abdom Imaging 38:720–727. https://doi.org/10.1007/s00261-012-9957-4" },
        REFERENCE_BARBARO_2024: { id: 14, text: "Barbaro B, Carafa MRP, Minordi LM et al (2024) Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: a single center experience. Radiother Oncol 193:110124. https://doi.org/10.1016/j.radonc.2024.110124" },
        REFERENCE_HORVAT_2023: { id: 15, text: "Horvat N, El Homsi M, Miranda J, Mazaheri Y, Gollub MJ, Paroder V (2023) Rectal MRI interpretation after neoadjuvant therapy. J Magn Reson Imaging 57:353–369. https://doi.org/10.1002/jmri.28426" },
        REFERENCE_KENNEDY_2019: { id: 16, text: "Kennedy ED, Simunovic M, Jhaveri K et al (2019) Safety and feasibility of using magnetic resonance imaging criteria to identify patients with “good prognosis” rectal cancer eligible for primary surgery: the phase 2 nonrandomized QuickSilver clinical trial. JAMA Oncol 5:961–966. https://doi.org/10.1001/jamaoncol.2019.0186" },
        REFERENCE_HANNA_2021: { id: 17, text: "Hanna CR, O’Cathail SM, Graham JS et al (2021) Durvalumab (MEDI 4736) in combination with extended neoadjuvant regimens in rectal cancer: a study protocol of a randomised phase II trial (PRIME-RT). Radiat Oncol 16:163. https://doi.org/10.1186/s13014-021-01888-1" },
        REFERENCE_SCHRAG_2023: { id: 18, text: "Schrag D, Shi Q, Weiser MR et al (2023) Preoperative treatment of locally advanced rectal cancer. N Engl J Med 389:322–334. https://doi.org/10.1056/NEJMoa2303269" },
        REFERENCE_GARCIA_AGUILAR_2022: { id: 19, text: "Garcia-Aguilar J, Patil S, Gollub MJ et al (2022) Organ preservation in patients with rectal adenocarcinoma treated with total neoadjuvant therapy. J Clin Oncol 40:2546–2556. https://doi.org/10.1200/JCO.22.00032" },
        REFERENCE_HAO_2025: { id: 20, text: "Hao Y, Zheng J, Li W et al (2025) Ultra-high b-value DWI in rectal cancer: image quality assessment and regional lymph node prediction based on radiomics. Eur Radiol 35:49–60. https://doi.org/10.1007/s00330-024-10958-3" },
        REFERENCE_KIM_2019: { id: 21, text: "Kim SH, Song BI, Kim BW et al (2019) Predictive value of [18F]FDG PET/CT for lymph node metastasis in rectal cancer. Sci Rep 9:4979. https://doi.org/10.1038/s41598-019-41422-8" },
        REFERENCE_ZHOU_2021: { id: 22, text: "Zhou H, Lei PJ, Padera TP (2021) Progression of metastasis through lymphatic system. Cells 10:1–23. https://doi.org/10.3390/cells10030627" },
        REFERENCE_LURZ_SCHAEFER_2025: { id: 23, text: "Lurz M, Schäfer AO (2025) The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. https://doi.org/10.1007/s00330-025-11462-y" },
        REFERENCE_RUTEGARD_2025: { id: 24, text: "Rutegård J, Hallberg L, Carlsson J, Olsson J, Jarnheimer A (2025) Anatomically matched mesorectal nodal structures: evaluation of the 2016 ESGAR consensus criteria. Eur Radiol. https://doi.org/10.1007/s00330-024-11357-1" },
        REFERENCE_BARBARO_2024_PDF: { id: 25, text: "Barbaro B, Carafa MRP, Minordi LM et al (2024) Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: a single center experience. Radiother Oncol 193:110124. https://doi.org/10.1016/j.radonc.2024.110124" },
        REFERENCE_BEETS_TAN_2018_PDF: { id: 26, text: "Beets-Tan RGH, Lambregts DMJ, Maas M et al (2018) Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol 28:1465–1475. https://doi.org/10.1007/s00330-017-5026-2" },
        REFERENCE_KOH_2008_PDF: { id: 27, text: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G (2008) Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys 71:456–461. https://doi.org/10.1016/j.ijrobp.2007.10.016" },
        REFERENCE_RUTEGARD_2025_PDF: { id: 28, text: "Rutegård J, Hallberg L, Carlsson J, Olsson J, Jarnheimer A (2025) Anatomically matched mesorectal nodal structures: evaluation of the 2016 ESGAR consensus criteria. Eur Radiol. https://doi.org/10.1007/s00330-024-11357-1" }
    }),
    UI_TEXTS: Object.freeze({
        cohortDisplayNames: {
            'Overall': 'Overall',
            'surgeryAlone': 'Surgery alone',
            'neoadjuvantTherapy': 'Neoadjuvant therapy'
        },
        t2LogicDisplayNames: {
            'AND': 'AND',
            'OR': 'OR',
            'KOMBINIERT': 'COMBINED (ESGAR Logic)'
        },
        publicationTab: {
            bfMetricSelectLabel: 'BF Optimization Metric for T2:',
            sectionLabels: {
                abstract_main: 'Abstract',
                introduction_main: 'Introduction',
                methoden_main: 'Methods',
                ergebnisse_main: 'Results',
                discussion_main: 'Discussion',
                references_main: 'References'
            }
        },
        chartTitles: {
            ageDistribution: 'Age Distribution',
            genderDistribution: 'Sex',
            therapyDistribution: 'Therapy',
            statusN: 'N-Status (Pathology)',
            statusAS: 'AS-Status',
            statusT2: 'T2-Status (Applied)',
            comparisonBar: 'Comparison: AS vs. {T2Name}',
            rocCurve: 'ROC Curve for {Method}',
            asPerformance: 'AS Performance (Current Cohort)'
        },
        axisLabels: {
            age: 'Age (Years)',
            patientCount: 'Number of Patients',
            lymphNodeCount: 'Number of Lymph Nodes',
            metricValue: 'Value',
            metric: 'Diagnostic Metric',
            sensitivity: 'Sensitivity (True Positive Rate)',
            oneMinusSpecificity: '1 - Specificity (False Positive Rate)'
        },
        legendLabels: {
            male: 'Male',
            female: 'Female',
            unknownGender: 'Unknown',
            surgeryAlone: 'Surgery alone',
            neoadjuvantTherapy: 'Neoadjuvant therapy',
            nPositive: 'N+',
            nNegative: 'N-',
            asPositive: 'AS+',
            asNegative: 'AS-',
            t2Positive: 'T2+',
            t2Negative: 'T2-'
        },
        tooltips: Object.freeze({
            statisticsTab: {
                diagnosticPerformance: {
                    sens: {
                        description: '<strong>Sensitivity (True Positive Rate)</strong><br>Measures the proportion of actual positives that are correctly identified. It answers: Of all patients with lymph node metastases, what percentage did the test correctly identify as positive?',
                        interpretation: 'A Sensitivity of <strong>{value}</strong> means that the test correctly identified <strong>{value}</strong> of all patients who truly had lymph node metastases.'
                    },
                    spec: {
                        description: '<strong>Specificity (True Negative Rate)</strong><br>Measures the proportion of actual negatives that are correctly identified. It answers: Of all patients without lymph node metastases, what percentage did the test correctly identify as negative?',
                        interpretation: 'A Specificity of <strong>{value}</strong> means that the test correctly identified <strong>{value}</strong> of all patients who truly did not have lymph node metastases.'
                    },
                    ppv: {
                        description: '<strong>Positive Predictive Value (PPV)</strong><br>The probability that a patient with a positive test result actually has the condition. It answers: If a patient tests positive, what is the probability that they truly have lymph node metastases?',
                        interpretation: 'A PPV of <strong>{value}</strong> means there is a <strong>{value}</strong> probability that a patient with a positive test result actually has lymph node metastases.'
                    },
                    npv: {
                        description: '<strong>Negative Predictive Value (NPV)</strong><br>The probability that a patient with a negative test result is truly free of the condition. It answers: If a patient tests negative, what is the probability that they truly do not have lymph node metastases?',
                        interpretation: 'An NPV of <strong>{value}</strong> means there is a <strong>{value}</strong> probability that a patient with a negative test result is truly free of lymph node metastases.'
                    },
                    acc: {
                        description: '<strong>Accuracy</strong><br>The overall proportion of correct classifications (both true positives and true negatives) among the total number of cases examined.',
                        interpretation: 'An Accuracy of <strong>{value}</strong> means that the test correctly classified <strong>{value}</strong> of all patients.'
                    },
                    balAcc: {
                        description: '<strong>Balanced Accuracy</strong><br>The average of Sensitivity and Specificity. It is a useful metric for imbalanced datasets, as it is not skewed by large differences in the number of positive and negative cases. It is arithmetically equivalent to the AUC for binary classifiers.',
                        interpretation: 'A Balanced Accuracy of <strong>{value}</strong> indicates the average performance across both positive and negative classes, providing a more robust measure than standard accuracy for imbalanced cohorts.'
                    },
                    f1: {
                        description: '<strong>F1-Score</strong><br>The harmonic mean of Precision (PPV) and Recall (Sensitivity). It provides a single score that balances both concerns. A score of 1.0 is perfect, while 0.0 is worst.',
                        interpretation: 'An F1-Score of <strong>{value}</strong> represents the balance between precision and recall. A higher value indicates better overall performance in identifying positive cases.'
                    },
                    auc: {
                        description: '<strong>Area Under the ROC Curve (AUC)</strong><br>Represents the ability of a test to distinguish between positive and negative classes. An AUC of 1.0 is a perfect test; an AUC of 0.5 indicates no discriminative ability (equivalent to chance). For a binary test like this, it is equivalent to Balanced Accuracy.',
                        interpretation: 'An AUC of <strong>{value}</strong> indicates that there is a <strong>{value_pct}</strong> chance that the model will rank a randomly chosen positive instance higher than a randomly chosen negative one. This value suggests <strong>{interpretation}</strong> diagnostic performance.'
                    }
                },
                statisticalComparison: {
                    mcnemar: {
                        description: "<strong>McNemar's Test</strong><br>A non-parametric test used on paired nominal data to determine if there is a significant difference in the proportions of two related outcomes. Here, it compares the number of cases where AS and T2 disagree (one is correct, the other is not) to see if one method is significantly more accurate than the other.",
                        interpretation: 'The p-value of <strong>{p_value}</strong> suggests that there is <strong>{significance}</strong> between the accuracy of the two tests (AS vs. T2).',
                        interpretation_ns: 'no statistically significant difference',
                        interpretation_s: 'a statistically significant difference'
                    },
                    delong: {
                        description: "<strong>DeLong's Test</strong><br>A non-parametric statistical test used to compare the Area Under the Curve (AUC) of two correlated Receiver Operating Characteristic (ROC) curves. It determines if the difference in AUC between two diagnostic tests (here: AS and T2) on the same set of patients is statistically significant.",
                        interpretation: 'The p-value of <strong>{p_value}</strong> suggests that there is <strong>{significance}</strong> between the AUCs of the two tests (AS vs. T2), indicating whether one test has a significantly better ability to discriminate between N+ and N- patients.',
                        interpretation_ns: 'no statistically significant difference',
                        interpretation_s: 'a statistically significant difference'
                    }
                },
                associationAnalysis: {
                    or: {
                        description: '<strong>Odds Ratio (OR)</strong><br>A measure of association between an exposure (e.g., a positive feature) and an outcome (e.g., N+ status). It represents the odds that an outcome will occur given a particular exposure, compared to the odds of the outcome occurring in the absence of that exposure.<br>• OR = 1: Exposure does not affect odds of outcome.<br>• OR > 1: Exposure associated with higher odds of outcome.<br>• OR < 1: Exposure associated with lower odds of outcome.',
                        interpretation_gt1: 'An OR of <strong>{value}</strong> means the odds of having a positive N-status are <strong>{value}</strong> times higher for patients with a positive <strong>{feature}</strong> compared to those without.',
                        interpretation_lt1: 'An OR of <strong>{value}</strong> means the odds of having a positive N-status are <strong>{value_inv}</strong> times lower for patients with a positive <strong>{feature}</strong> compared to those without.',
                        interpretation_eq1: 'An OR of 1.0 indicates no association between <strong>{feature}</strong> and N-status.'
                    },
                    rd: {
                        description: '<strong>Risk Difference (RD)</strong><br>Also known as absolute risk reduction, it is the simple difference between the risk of an outcome in the exposed group and the unexposed group. It provides an absolute measure of the effect size.',
                        interpretation_pos: 'The risk of having a positive N-status is <strong>{value_pct}</strong> percentage points higher for patients with a positive <strong>{feature}</strong>.',
                        interpretation_neg: 'The risk of having a positive N-status is <strong>{value_pct_abs}</strong> percentage points lower for patients with a positive <strong>{feature}</strong>.'
                    },
                    phi: {
                        description: "<strong>Phi (φ) Coefficient</strong><br>A measure of association for two binary variables, equivalent to Pearson's correlation coefficient for dichotomous data. It ranges from -1 (perfect negative association) to +1 (perfect positive association), with 0 indicating no association.",
                        interpretation: 'A Phi coefficient of <strong>{value}</strong> indicates a <strong>{strength}</strong> positive association between the presence of <strong>{feature}</strong> and a positive N-status.'
                    },
                    mwu: {
                        description: "<strong>Mann-Whitney U Test (Z-statistic)</strong><br>A non-parametric test to compare differences between two independent groups when the dependent variable is either ordinal or continuous, but not normally distributed. Here, it tests if the distribution of lymph node sizes differs significantly between N+ and N- patients.",
                        interpretation: 'The p-value of <strong>{p_value}</strong> suggests that the distributions of lymph node sizes are <strong>{significance}</strong> between N+ and N- patients.',
                        interpretation_ns: 'not significantly different',
                        interpretation_s: 'significantly different'
                    },
                    fisher: {
                        description: "<strong>Fisher's Exact Test (p-value)</strong><br>A statistical significance test used to analyze contingency tables. It is employed when sample sizes are small. It calculates the exact probability of observing the results seen in the table, assuming the null hypothesis of no association is true.",
                        interpretation: 'The p-value of <strong>{p_value}</strong> indicates a <strong>{significance}</strong> between the presence of <strong>{feature}</strong> and N-status.',
                        interpretation_ns: 'non-significant association',
                        interpretation_s: 'statistically significant association'
                    }
                }
            },
            exportTab: {
                description: 'All exports are based on the currently selected cohort ([COHORT]) and the applied T2 criteria from the Analysis tab.',
                statscsv: { type: 'Statistics Report', ext: 'csv', description: 'Comprehensive statistical report for the selected cohort, including descriptive statistics, diagnostic performance, comparisons, and associations.' },
                bruteforcetxt: { type: 'Brute-Force Optimization Report', ext: 'txt', description: 'Detailed report of the brute-force optimization, including the best criteria found and top 10 results.' },
                datamd: { type: 'Data List', ext: 'md', description: 'Markdown table of the raw patient data for the selected cohort.' },
                analysismd: { type: 'Analysis Table', ext: 'md', description: 'Markdown table of the patient data with T2 criteria evaluation based on current settings.' },
                filtereddatacsv: { type: 'Filtered Raw Data', ext: 'csv', description: 'Raw patient data filtered by the selected cohort, exported as a CSV file.' },
                comprehensivereport_html: { type: 'Comprehensive HTML Report', ext: 'html', description: 'A single, printable HTML file summarizing all key analyses, tables, and charts for the selected cohort.' },
                allzip: { type: 'All Files', ext: 'zip', description: 'A ZIP archive containing all available data, reports, tables, and graphics.' },
                csvzip: { type: 'CSV Files', ext: 'zip', description: 'A ZIP archive containing all raw data and statistics in CSV format.' },
                mdzip: { type: 'Markdown Files', ext: 'zip', description: 'A ZIP archive containing all data lists, analysis tables, and publication sections in Markdown format.' },
                pngzip: { type: 'PNG Graphics', ext: 'zip', description: 'A ZIP archive of all visible charts and tables (as PNG images).' },
                svgzip: { type: 'SVG Graphics', ext: 'zip', description: 'A ZIP archive of all visible charts (as SVG vector images).' }
            },
            t2Criteria: {
                size: { description: '<strong>Size (Short-Axis Diameter)</strong><br>A lymph node is considered suspicious if its short-axis diameter is greater than or equal to the specified threshold (e.g., ≥5mm).' },
                shape: { description: '<strong>Shape</strong><br>A lymph node is considered suspicious if it has a specific shape (e.g., round).' },
                border: { description: '<strong>Border</strong><br>A lymph node is considered suspicious if its border is irregular.' },
                homogeneity: { description: '<strong>Homogeneity</strong><br>A lymph node is considered suspicious if its internal signal is heterogeneous.' },
                signal: { description: '<strong>Signal Intensity</strong><br>A lymph node is considered suspicious if it exhibits a specific signal intensity (e.g., high signal).' },
                t2Logic: { description: '<strong>Logic Operator (AND / OR)</strong><br>Selects how multiple active T2 criteria are combined:<br>• <strong>AND:</strong> All active criteria must be met for a node to be T2-positive.<br>• <strong>OR:</strong> At least one active criterion must be met for a node to be T2-positive.' },
                reset: { description: '<strong>Reset to Default</strong><br>Resets all T2 criteria and logic to their initial default settings (Size ≥5mm, AND logic).' },
                apply: { description: '<strong>Apply & Save Criteria</strong><br>Applies the currently configured T2 criteria and logic to the patient data, recalculates all statistics and charts, and saves the settings for future sessions.' }
            },
            dataTab: {
                nr: { description: '<strong>Patient ID</strong><br>Unique identifier for the patient.' },
                name: { description: '<strong>Last Name</strong><br>Pseudonymized last name of the patient.' },
                firstName: { description: '<strong>First Name</strong><br>Pseudonymized first name of the patient.' },
                sex: { description: '<strong>Sex</strong><br>Biological sex of the patient (male/female/unknown).' },
                age: { description: '<strong>Age</strong><br>Patient\'s age at the time of examination (calculated from birth date and exam date).' },
                therapy: { description: '<strong>Therapy</strong><br>Type of therapy received: "Surgery alone" (upfront surgery) or "Neoadjuvant therapy" (neoadjuvant chemoradiotherapy prior to surgery).' },
                n_as_t2: { description: '<strong>N-Status (Pathology) / AS-Status / T2-Status</strong><br>• <strong>N-Status:</strong> Histopathologically confirmed nodal status (+: metastatic, -: no metastasis).<br>• <strong>AS-Status:</strong> Avocado Sign status (+: at least one AS+ node, -: no AS+ nodes).<br>• <strong>T2-Status:</strong> T2-weighted criteria status (+: at least one T2+ node based on applied criteria, -: no T2+ nodes).' },
                n_as_t2_n: { description: '<strong>N-Status (Pathology)</strong><br>Histopathologically confirmed nodal status (+: metastatic, -: no metastasis).' },
                n_as_t2_as: { description: '<strong>Avocado Sign Status</strong><br>Avocado Sign status (+: at least one AS+ node, -: no AS+ nodes).' },
                n_as_t2_t2: { description: '<strong>T2-Status (Applied Criteria)</strong><br>T2-weighted criteria status (+: at least one T2+ node based on applied criteria, -: no T2+ nodes).' },
                n_as_t2_subsort: { description: '<strong>Sub-sort by Status</strong><br>Click to sort patients primarily by this specific status (N, AS, or T2) in ascending or descending order. Combined with main column sort.' },
                notes: { description: '<strong>Notes</strong><br>Additional clinical or imaging notes for the patient.' },
                expandRow: { description: '<strong>Toggle Details</strong><br>Expands or collapses the row to show/hide individual T2 lymph node features.' },
                expandAll: { description: '<strong>Expand/Collapse All Details</strong><br>Toggles the detailed view for all patients in the table simultaneously.' }
            },
            analysisTab: {
                n_as_t2_n: { description: '<strong>N-Status (Pathology)</strong><br>Histopathologically confirmed nodal status (+: metastatic, -: no metastasis).' },
                n_as_t2_as: { description: '<strong>Avocado Sign Status</strong><br>Avocado Sign status (+: at least one AS+ node, -: no AS+ nodes).' },
                n_as_t2_t2: { description: '<strong>T2-Status (Applied Criteria)</strong><br>T2-weighted criteria status (+: at least one T2+ node based on applied criteria, -: no T2+ nodes).' },
                n_as_t2_subsort: { description: '<strong>Sub-sort by Status</strong><br>Click to sort patients primarily by this specific status (N, AS, or T2) in ascending or descending order. Combined with main column sort.' },
                n_counts: { description: '<strong>N+/N total</strong><br>Number of histopathologically positive lymph nodes out of the total number of resected lymph nodes.' },
                as_counts: { description: '<strong>AS+/AS total</strong><br>Number of Avocado Sign positive lymph nodes out of the total number of T2-weighted lymph nodes evaluated for AS.' },
                t2_counts: { description: '<strong>T2+/T2 total</strong><br>Number of T2-positive lymph nodes (based on applied criteria) out of the total number of T2-weighted lymph nodes evaluated.' },
                expandRow: { description: '<strong>Toggle Evaluation Details</strong><br>Expands or collapses the row to show/hide the detailed evaluation of individual T2 lymph nodes against the applied criteria.' },
                expandAll: { description: '<strong>Expand/Collapse All Details</strong><br>Toggles the detailed evaluation view for all patients in the table simultaneously.' },
                expandRow_title: { description: '<strong>T2 Lymph Node Evaluation</strong><br>Details how each T2-weighted lymph node was classified (positive or negative) based on the currently applied criteria and logic. Features that contribute to a positive classification are highlighted.' },
                expandRow_posBadge: { description: '<strong>Positive Node</strong><br>This lymph node was classified as positive (suspicious for metastasis) based on the applied T2 criteria.' },
                expandRow_negBadge: { description: '<strong>Negative Node</strong><br>This lymph node was classified as negative (not suspicious for metastasis) based on the applied T2 criteria.' },
                t2MetricsOverview: { description: '<strong>Diagnostic Performance (Applied T2 Criteria)</strong><br>Shows the diagnostic performance metrics (Sensitivity, Specificity, Predictive Values, Accuracy, F1-Score, AUC) for the currently applied T2 criteria against the histopathological N-status.'}
            },
            presentation: {
                viewSelect: {
                    title: '<strong>Presentation View Selection</strong><br>Choose the type of presentation view to generate.',
                    asPerf: '<strong>AS Performance View</strong><br>Focuses on the diagnostic performance of the Avocado Sign across different cohorts.',
                    asVsT2: '<strong>AS vs. T2 Comparison View</strong><br>Compares the diagnostic performance of the Avocado Sign against a selected T2 criteria set.'
                },
                studySelect: '<strong>T2 Comparison Basis Selection</strong><br>Choose which T2 criteria set (either the currently applied custom criteria or a predefined literature-based set) will be used for comparison with the Avocado Sign in the "AS vs. T2 Comparison" view.',
                t2BasisInfoCard: {
                    title: '<strong>T2 Comparison Basis Details</strong><br>Provides an overview of the selected T2 criteria set used for comparison with the Avocado Sign.',
                    reference: '<strong>Reference:</strong> Source of the T2 criteria (e.g., scientific publication, user-defined).',
                    patientCohort: '<strong>Basis Cohort:</strong> The patient cohort on which the selected T2 criteria were originally evaluated or are applicable.',
                    keyCriteriaSummary: '<strong>Criteria Summary:</strong> A concise description of the key T2 morphological features and logic (AND/OR) that define this criteria set.'
                },
                asPerformanceChart: '<strong>AS Performance ROC Curve</strong><br>Receiver Operating Characteristic (ROC) curve illustrating the diagnostic performance of the Avocado Sign for the currently selected cohort.',
                asVsT2PerfTable: {
                    asValue: '<strong>Avocado Sign Performance</strong><br>The value and 95% Confidence Interval for the Avocado Sign diagnostic metric.',
                    t2Value: '<strong>T2 Criteria Performance</strong><br>The value and 95% Confidence Interval for the selected T2 criteria diagnostic metric.'
                },
                asVsT2Chart: '<strong>Comparison Bar Chart (AS vs. T2)</strong><br>Visualizes key diagnostic performance metrics (Sensitivity, Specificity, Accuracy, AUC) side-by-side for the Avocado Sign and the selected T2 criteria.',
                
            },
            statMetrics: {
                associationStrengthTexts: {
                    undetermined: 'undetermined',
                    very_weak: 'very weak',
                    weak: 'weak',
                    moderate: 'moderate',
                    strong: 'strong'
                }
            }
        })
    });

const PUBLICATION_CONFIG = Object.freeze({
    sections: Object.freeze([
        { id: 'abstract_main', labelKey: 'abstract_main', subSections: [{ id: 'abstract_main', label: 'Abstract' }] },
        { id: 'introduction_main', labelKey: 'introduction_main', subSections: [{ id: 'introduction_main', label: 'Introduction' }] },
        { id: 'methoden_main', labelKey: 'methoden_main',
            subSections: [
                { id: 'methoden_studienanlage_ethik', label: 'Study Design and Patients' },
                { id: 'methoden_mrt_protokoll_akquisition', label: 'MRI Protocol' },
                { id: 'methoden_bildanalyse_avocado_sign', label: 'Image Analysis (Avocado Sign)' },
                { id: 'methoden_bildanalyse_t2_kriterien', label: 'Image Analysis (T2 Criteria)' },
                { id: 'methoden_referenzstandard_histopathologie', label: 'Reference Standard (Histopathology)' },
                { id: 'methoden_statistische_analyse_methoden', label: 'Statistical Analysis' }
            ]
        },
        { id: 'ergebnisse_main', labelKey: 'ergebnisse_main',
            subSections: [
                { id: 'ergebnisse_patientencharakteristika', label: 'Patient Characteristics' },
                { id: 'ergebnisse_as_diagnostische_guete', label: 'Diagnostic Performance of the Avocado Sign' },
                { id: 'ergebnisse_t2_literatur_diagnostische_guete', label: 'Diagnostic Performance of Literature-Based T2 Criteria' },
                { id: 'ergebnisse_t2_optimiert_diagnostische_guete', label: 'Diagnostic Performance of Optimized T2 Criteria' },
                { id: 'ergebnisse_vergleich_as_vs_t2', label: 'Comparison of Avocado Sign vs. T2 Criteria' }
            ]
        },
        { id: 'discussion_main', labelKey: 'discussion_main', subSections: [{ id: 'discussion_main', label: 'Discussion' }] },
        { id: 'references_main', labelKey: 'references_main', subSections: [{ id: 'references_main', label: 'References' }] }
    ]),
    literatureCriteriaSets: Object.freeze([
        {
            id: 'beets_tan_esgar_2018_restaging',
            name: 'Beets-Tan et al. (2018) ESGAR Restaging',
            displayShortName: 'ESGAR 2018',
            applicableCohort: APP_CONFIG.COHORTS.NEOADJUVANT.id,
            criteria: {
                logic: 'OR', // For nodes >=5mm, this is effectively an "OR" of a simple size criterion for >=5mm
                size: { active: true, threshold: 5.0, condition: '>=' },
                shape: { active: false },
                border: { active: false },
                homogeneity: { active: false },
                signal: { active: false }
            },
            note: 'Nodes < 5mm are considered benign. Nodes >= 5mm are considered malignant (no reliable criteria, but practical guideline).',
            studyInfo: {
                reference: 'Beets-Tan et al. (2018)', // Uses source 6 from original document (updated to 26 for this context)
                patientCohort: 'Restaging after nCRT',
                investigationType: 'Consensus guidelines',
                focus: 'Updated guidelines for rectal cancer MRI staging',
                keyCriteriaSummary: 'All nodes with short axis diameter < 5 mm should be considered benign. For nodes with a short axis diameter ≥ 5 mm, no reliable criteria exist, but as a practical guideline, they should be considered malignant.'
            }
        },
        {
            id: 'koh_et_al_2008',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh 2008',
            applicableCohort: APP_CONFIG.COHORTS.NEOADJUVANT.id, // Study evaluated pre- and post-nCRT
            criteria: {
                logic: 'OR',
                size: { active: false },
                shape: { active: false },
                border: { active: true, value: 'irregular' },
                homogeneity: { active: true, value: 'heterogeneous' },
                signal: { active: false }
            },
            note: 'A node was considered malignant if it exhibited irregular outlines OR internal signal heterogeneity.',
            studyInfo: {
                reference: 'Koh et al. (2008)', // Uses source 10 from original document (updated to 27 for this context)
                patientCohort: 'Pre- and Post-nCRT',
                investigationType: 'Prospective study',
                focus: 'Morphological criteria for mesorectal lymph nodes',
                keyCriteriaSummary: 'Irregular outlines OR internal signal heterogeneity.'
            }
        },
        {
            id: 'rutegard_et_al_esgar', // This is a special combined logic rule
            name: 'Rutegård et al. (2025) ESGAR 2016 Evaluation',
            displayShortName: 'Rutegård 2025',
            applicableCohort: APP_CONFIG.COHORTS.OVERALL.id, // Study was baseline MRI, applicable to overall
            logic: 'KOMBINIERT', // Custom logic defined in _checkSingleNodeESGAR
            criteria: {
                size: { active: true, threshold: 9.0 }, // Short axis >= 9mm
                shape: { active: true, value: 'round' }, // Round shape
                border: { active: true, value: 'irregular' }, // Irregular border
                homogeneity: { active: true, value: 'heterogeneous' }, // Heterogeneous signal
                signal: { active: false } // Not explicitly used as a direct criterion in their ESGAR 2016 interpretation for morphology
            },
            note: 'Based on ESGAR 2016 criteria: Short axis ≥ 9 mm; OR 5–8 mm AND ≥2 suspicious features; OR < 5 mm AND all 3 suspicious features. Mucinous nodes (any size) also malignant. Suspicious features: round shape, irregular border, heterogeneous signal.',
            studyInfo: {
                reference: 'Rutegård et al. (2025)', // Uses source 24 from original document (updated to 28 for this context)
                patientCohort: 'Baseline MRI',
                investigationType: 'Prospective study evaluating ESGAR 2016 criteria',
                focus: 'Performance of ESGAR 2016 criteria in anatomically matched nodal structures',
                keyCriteriaSummary: 'Short axis ≥ 9 mm; OR (5–8 mm AND ≥2 suspicious morphological features); OR (< 5 mm AND all 3 suspicious morphological features). Suspicious features: round shape, irregular border, heterogeneous signal. (Mucinous nodes also malignant).'
            }
        },
        {
            id: 'barbaro_et_al_2024_size_cutoff',
            name: 'Barbaro et al. (2024) Size Cut-off',
            displayShortName: 'Barbaro 2024 (Size)',
            applicableCohort: APP_CONFIG.COHORTS.NEOADJUVANT.id,
            criteria: {
                logic: 'AND',
                size: { active: true, threshold: 2.2, condition: '<=' }, // Optimal cut-off for ypN0, so nodes <= 2.2mm are benign. Inverse logic for malignancy.
                shape: { active: false },
                border: { active: false },
                homogeneity: { active: false },
                signal: { active: false }
            },
            note: 'Short-axis diameter ≤ 2.2 mm was optimal for predicting ypN0. So, for malignancy, nodes > 2.2mm are considered suspicious.',
            studyInfo: {
                reference: 'Barbaro et al. (2024)', // Uses source 14 from original document (updated to 25 for this context)
                patientCohort: 'Restaging after nCRT',
                investigationType: 'Retrospective study',
                focus: 'Accuracy of MRI in identifying ypN0 after nCRT',
                keyCriteriaSummary: 'Post-nCRT short-axis diameter ≤ 2.2 mm was optimal for predicting ypN0. (Thus, > 2.2mm for malignancy).'
            }
        },
        {
            id: 'barbaro_et_al_2024_size_reduction',
            name: 'Barbaro et al. (2024) Size Reduction (Not directly applicable)',
            displayShortName: 'Barbaro 2024 (Size Red.)',
            applicableCohort: APP_CONFIG.COHORTS.NEOADJUVANT.id,
            criteria: { // This criterion cannot be directly applied to our static, single-time T2 node data
                logic: 'NONE',
                size: { active: false },
                shape: { active: false },
                border: { active: false },
                homogeneity: { active: false },
                signal: { active: false }
            },
            note: '≥ 70% reduction in short-axis diameter of largest node was associated with ypN0. Requires pre- and post-nCRT measurements, not available in current dataset for node-level evaluation.',
            studyInfo: {
                reference: 'Barbaro et al. (2024)',
                patientCohort: 'Restaging after nCRT',
                investigationType: 'Retrospective study',
                focus: 'Accuracy of MRI in identifying ypN0 after nCRT',
                keyCriteriaSummary: '≥ 70% reduction in largest node short-axis diameter (not directly modelable with current data).'
            }
        }
    ]),
    publicationElements: Object.freeze({
        methoden: {
            literaturT2KriterienTabelle: {
                id: 'table-literature-t2-criteria',
                titleEn: 'Table 4: Summary of Literature-Based T2-weighted Criteria Sets'
            }
        },
        ergebnisse: {
            patientenCharakteristikaTabelle: {
                id: 'table-patient-characteristics',
                titleEn: 'Table 2: Patient Demographics and Treatment Approaches'
            },
            diagnostischeGueteASTabelle: {
                id: 'table-as-diagnostic-performance',
                titleEn: 'Table 3: Diagnostic performance and nominal values for the Avocado Sign in predicting nodal status'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'table-optimized-t2-diagnostic-performance',
                titleEn: 'Table 5: Diagnostic Performance of Optimized T2-weighted Criteria (Target Metric: {BF_METRIC})'
            },
            vergleichASvsT2Tabelle: {
                id: 'table-comparison-as-vs-t2',
                titleEn: 'Table 6: Statistical Comparison of Diagnostic Performance (Avocado Sign vs. Optimized T2 Criteria)'
            }
        }
    }),
    T2_ICON_SVGS: Object.freeze({
        SIZE_DEFAULT: (s, sw, color, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/><text x="${c}" y="${c + s * 0.08}" font-size="${s * 0.4}" text-anchor="middle" dominant-baseline="middle" fill="${color}">D</text>`,
        SHAPE_ROUND: (s, sw, color, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}"/>`,
        SHAPE_OVAL: (s, sw, color, c, r, sq, sqPos) => `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.7}" fill="${color}"/>`,
        BORDER_SHARP: (s, sw, color, c, r, sq, sqPos) => `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
        BORDER_IRREGULAR: (s, sw, color, c, r, sq, sqPos) => `<path d="M${sqPos},${sqPos} L${sqPos + sq * 0.3},${sqPos} L${sqPos + sq * 0.4},${sqPos + sq * 0.2} L${sqPos + sq * 0.6},${sqPos} L${sqPos + sq},${sqPos} L${sqPos + sq},${sqPos + sq * 0.3} L${sqPos + sq * 0.8},${sqPos + sq * 0.4} L${sqPos + sq},${sqPos + sq * 0.6} L${sqPos + sq},${sqPos + sq} L${sqPos + sq * 0.7},${sqPos + sq} L${sqPos + sq * 0.6},${sqPos + sq * 0.8} L${sqPos + sq * 0.4},${sqPos + sq} L${sqPos},${sqPos + sq} L${sqPos},${sqPos + sq * 0.7} L${sqPos + sq * 0.2},${sqPos + sq * 0.6} L${sqPos},${sqPos + sq * 0.4} Z" fill="${color}"/>`,
        HOMOGENEITY_HOMOGENEOUS: (s, sw, color, c, r, sq, sqPos) => `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="${color}"/>`,
        HOMOGENEITY_HETEROGENEOUS: (s, sw, color, c, r, sq, sqPos) => `<defs><pattern id="pattern-hetero" x="0" y="0" width="${sq/4}" height="${sq/4}" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="${sq/8}" height="${sq/8}" fill="${color}" /><rect x="${sq/8}" y="${sq/8}" width="${sq/8}" height="${sq/8}" fill="${color}" /></pattern></defs><rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="url(#pattern-hetero)" stroke="${color}" stroke-width="${sw/2}"/>`,
        SIGNAL_LOWSIGNAL: (s, sw, color, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}"/>`,
        SIGNAL_INTERMEDIATESIGNAL: (s, sw, color, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}" fill-opacity="0.6"/>`,
        SIGNAL_HIGHSIGNAL: (s, sw, color, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}" fill-opacity="0.3"/>`,
        UNKNOWN: (s, sw, color, c, r, sq, sqPos) => `<line x1="0" y1="${s}" x2="${s}" y2="0" stroke="${color}" stroke-width="${sw}"/><line x1="0" y1="0" x2="${s}" y2="${s}" stroke="${color}" stroke-width="${sw}"/>`
    })
});

function getDefaultT2Criteria() {
    return DEFAULT_T2_CRITERIA;
}
