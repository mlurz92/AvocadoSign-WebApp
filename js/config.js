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
        REFERENCE_RUTEGARD_2025: { id: 24, text: "Rutegård J, Hallberg L, Carlsson J, Olsson J, Jarnheimer A (2025) Anatomically matched mesorectal nodal structures: evaluation of the 2016 ESGAR consensus criteria. Eur Radiol. https://doi.org/10.1007/s00330-024-11357-1" }
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
            t2Negative: 'T2-',
            avocadoSign: 'Avocado Sign'
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
            }
        })
    })
});

function getDefaultT2Criteria() {
    return DEFAULT_T2_CRITERIA;
}
