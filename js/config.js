window.DEFAULT_T2_CRITERIA = Object.freeze({
    logic: 'AND',
    size: { active: true, threshold: 5.0, condition: '>=' },
    shape: { active: false, value: 'round' },
    border: { active: false, value: 'irregular' },
    homogeneity: { active: false, value: 'heterogeneous' },
    signal: { active: false, value: 'lowSignal' }
});

window.APP_CONFIG = Object.freeze({
    APP_NAME: "Nodal Staging: Avocado Sign vs. T2 Criteria",
    APP_VERSION: "4.2.0-radiology-optimized",
    NA_PLACEHOLDER: '--',
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
        COMPARISON_VIEW: 'as-vs-t2',
        COMPARISON_STUDY_ID: 'Rutegard_2025',
        PUBLICATION_SECTION: 'title_main',
        PUBLICATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        PUBLICATION_LANG: 'en'
    }),
    AVAILABLE_BRUTE_FORCE_METRICS: Object.freeze([
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy (AUC)' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'PPV' },
        { value: 'NPV', label: 'NPV' }
    ]),
    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'appliedT2Criteria_v4.2_detailed',
        APPLIED_LOGIC: 'appliedT2Logic_v4.2_detailed',
        BRUTE_FORCE_RESULTS: 'bruteForceResults_v3.2_detailed',
        CURRENT_COHORT: 'currentCohort_v4.3_unified',
        PUBLICATION_SECTION: 'currentPublicationSection_v4.4_detailed',
        PUBLICATION_BRUTE_FORCE_METRIC: 'currentPublicationBfMetric_v4.4_detailed',
        PUBLICATION_LANG: 'publicationLang_v4.4_detailed',
        STATS_LAYOUT: 'currentStatsLayout_v4.2_detailed',
        STATS_COHORT1: 'currentStatsCohort1_v4.3_unified',
        STATS_COHORT2: 'currentStatsCohort2_v4.3_unified',
        COMPARISON_VIEW: 'currentComparisonView_v4.2_detailed',
        COMPARISON_STUDY_ID: 'currentComparisonStudyId_v4.2_detailed',
        CHART_COLOR_SCHEME: 'chartColorScheme_v4.2_detailed',
        FIRST_APP_START: 'appFirstStart_v4.2.0'
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
        FISHER_EXACT_THRESHOLD: 5,
        INTEROBSERVER_KAPPA: Object.freeze({
            value: 0.92,
            ci: { lower: 0.85, upper: 0.99 }
        })
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
        STICKY_HEADER_OFFSET: '111px',
        HIDDEN_CHART_CONTAINER_ID: 'hidden-chart-export-container'
    }),
    CHART_SETTINGS: Object.freeze({
        DEFAULT_WIDTH: 450,
        DEFAULT_HEIGHT: 350,
        DEFAULT_MARGIN: Object.freeze({ top: 30, right: 40, bottom: 70, left: 70 }),
        COMPACT_PIE_MARGIN: Object.freeze({ top: 15, right: 15, bottom: 50, left: 15 }),
        AS_COLOR: '#005f73',
        T2_COLOR: '#ae2012',
        ANIMATION_DURATION_MS: 750,
        AXIS_LABEL_FONT_SIZE: '12px',
        TICK_LABEL_FONT_SIZE: '11px',
        LEGEND_FONT_SIZE: '11px',
        TOOLTIP_FONT_SIZE: '11px',
        PLOT_BACKGROUND_COLOR: '#ffffff',
        ENABLE_GRIDLINES: true
    }),
    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Applied T2',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    }),
    REFERENCES_FOR_PUBLICATION: Object.freeze({
        Schrag_2023: { id: 1, text: "Schrag D, Shi Q, Weiser MR, et al. Preoperative treatment of locally advanced rectal cancer. N Engl J Med. 2023;389:322–334. doi:10.1056/NEJMoa2303269" },
        Garcia_Aguilar_2022: { id: 2, text: "Garcia-Aguilar J, Patil S, Gollub MJ, et al. Organ preservation in patients with rectal adenocarcinoma treated with total neoadjuvant therapy. J Clin Oncol. 2022;40:2546–2556. doi:10.1200/JCO.22.00032" },
        Beets_Tan_2018: { id: 3, text: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28:1465–1475. doi:10.1007/s00330-017-5026-2" },
        Al_Sukhni_2012: { id: 4, text: "Al-Sukhni E, Milot L, Fruitman M, et al. Diagnostic accuracy of MRI for assessment of T category, lymph node metastases, and circumferential resection margin involvement in patients with rectal cancer: a systematic review and meta-analysis. Ann Surg Oncol. 2012;19:2212–2223. doi:10.1245/s10434-011-2210-5" },
        Stelzner_2022: { id: 5, text: "Stelzner S, Ruppert R, Kube R, et al. Selection of patients with rectal cancer for neoadjuvant therapy using pre-therapeutic MRI—results from OCUM trial. Eur J Radiol. 2022;147:110113. doi:10.1016/j.ejrad.2021.110113" },
        Lurz_Schaefer_2025: { id: 6, text: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025. doi:10.1007/s00330-025-11462-y" },
        Koh_2008: { id: 7, text: "Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71:456–461. doi:10.1016/j.ijrobp.2007.10.016" },
        Barbaro_2024: { id: 8, text: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: a single center experience. Radiother Oncol. 2024;193:110124. doi:10.1016/j.radonc.2024.110124" },
        Rutegard_2025: { id: 9, text: "Rutegård M, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025. doi:10.1007/s00330-025-11361-2" },
        Horvat_2023: { id: 10, text: "Horvat N, El Homsi M, Miranda J, Mazaheri Y, Gollub MJ, Paroder V. Rectal MRI interpretation after neoadjuvant therapy. J Magn Reson Imaging. 2023;57:353–369. doi:10.1002/jmri.28426" },
        Hao_2025: { id: 11, text: "Hao Y, Zheng J, Li W, et al. Ultra-high b-value DWI in rectal cancer: image quality assessment and regional lymph node prediction based on radiomics. Eur Radiol. 2025;35:49–60. doi:10.1007/s00330-024-10958-3" },
        Kim_2019: { id: 12, text: "Kim SH, Song BI, Kim BW, et al. Predictive value of [18F]FDG PET/CT for lymph node metastasis in rectal cancer. Sci Rep. 2019;9:4979. doi:10.1038/s41598-019-41422-8" },
        Lord_2019: { id: 13, text: "Lord AC, D’Souza N, Shaw A, Day N, Brown G. The Current Status of Nodal Staging in Rectal Cancer. Curr Colorectal Cancer Rep. 2019;15:143-48. doi:10.1007/s11888-019-00441-3" },
        Zhuang_2021: { id: 14, text: "Zhuang Z, Zhang Y, Wei M, Yang X, Wang Z. Magnetic Resonance Imaging Evaluation of the Accuracy of Various Lymph Node Staging Criteria in Rectal Cancer: A Systematic Review and Meta-Analysis. Front Oncol. 2021;11:709070. doi:10.3389/fonc.2021.709070" }
    }),
    UI_TEXTS: Object.freeze({
        analysisContextBanner: {
            title: "Analysis Context Active",
            text: "Comparing against <strong>[CRITERIA_NAME]</strong>. Analysis is locked to the <strong>[COHORT_NAME]</strong> cohort (N=[COUNT]) to ensure methodological validity."
        },
        t2LogicDisplayNames: {
            'AND': 'AND',
            'OR': 'OR',
            'KOMBINIERT': 'Combined (ESGAR Logic)'
        },
        publicationTab: {
            bfMetricSelectLabel: 'BF Optimization Metric for Publication:',
            sectionLabels: {
                title_main: 'Title Page',
                abstract_main: 'Abstract',
                introduction_main: 'Introduction',
                methoden_main: 'Materials and Methods',
                ergebnisse_main: 'Results',
                discussion_main: 'Discussion',
                references_main: 'References',
                stard_checklist: 'STARD Checklist'
            }
        },
        PUBLICATION_TEXTS: Object.freeze({
            MIM_REGULATORY_STATEMENT: "This secondary analysis of a retrospective, single-institution study was compliant with the Health Insurance Portability and Accountability Act and approved by our institutional review board, which waived the requirement for additional written informed consent.",
            STATISTICAL_ANALYSIS_METHODS: "Descriptive statistics were used to summarize patient characteristics. Diagnostic performance metrics—including sensitivity, specificity, positive predictive value, negative predictive value, and accuracy—were calculated for each diagnostic method. Wilson score method was used for 95% confidence intervals (CIs) of proportions, and the bootstrap percentile method ([N_BOOTSTRAP] replications) was used for CIs of the area under the receiver operating characteristic curve (AUC).",
            STATISTICAL_ANALYSIS_COMPARISON: "The primary comparison between the AUC of the Avocado Sign and other criteria was performed using the method described by DeLong et al. for correlated ROC curves. McNemar’s test was used to compare accuracies. For associations between individual categorical features and N-status, Fisher's exact test was used. For comparison of demographic data and AUCs between independent cohorts, Welch's t-test and Fisher's exact test were used, respectively. All statistical analyses were performed using custom software scripts (JavaScript, ES2020+) implemented in the analysis tool itself (Version [APP_VERSION]). A two-sided P value of less than [P_LEVEL] was considered to indicate statistical significance."
        }),
        chartTitles: {
            ageDistribution: 'Age Distribution',
            genderDistribution: 'Sex',
            therapyDistribution: 'Therapy',
            statusN: 'N-Status (Pathology)',
            statusAS: 'AS-Status',
            statusT2: 'T2-Status'
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
            definition: {
                sens: { title: 'Sensitivity (True Positive Rate)', text: 'The ability of a test to correctly identify patients with the disease.<br><strong>Formula:</strong> TP / (TP + FN)' },
                spec: { title: 'Specificity (True Negative Rate)', text: 'The ability of a test to correctly identify patients without the disease.<br><strong>Formula:</strong> TN / (TN + FP)' },
                ppv: { title: 'Positive Predictive Value (Precision)', text: 'The probability that a patient with a positive test result actually has the disease.<br><strong>Formula:</strong> TP / (TP + FP)' },
                npv: { title: 'Negative Predictive Value', text: 'The probability that a patient with a negative test result actually does not have the disease.<br><strong>Formula:</strong> TN / (TN + FN)' },
                acc: { title: 'Accuracy', text: 'The proportion of all tests that are correct.<br><strong>Formula:</strong> (TP + TN) / Total' },
                auc: { title: 'Area Under the ROC Curve (AUC)', text: 'A measure of the overall performance of a diagnostic test. A value of 1.0 represents a perfect test, while 0.5 represents a test with no discriminative ability. For binary tests, this is equivalent to Balanced Accuracy.' },
                f1: { title: 'F1-Score', text: 'The harmonic mean of PPV and sensitivity. It provides a single score that balances both concerns.<br><strong>Formula:</strong> 2 * (PPV * Sensitivity) / (PPV + Sensitivity)' },
                or: { title: 'Odds Ratio', text: 'Represents the odds that an outcome will occur given a particular exposure, compared to the odds of the outcome occurring in the absence of that exposure.<br><strong>Formula:</strong> (TP*TN) / (FP*FN)' },
                rd: { title: 'Risk Difference (Absolute Risk Reduction)', text: 'The absolute difference in the outcome rates between the exposed and unexposed groups.<br><strong>Formula:</strong> (TP / (TP+FP)) - (FN / (FN+TN))' },
                phi: { title: 'Phi Coefficient (Matthews Correlation Coefficient)', text: 'A measure of the quality of a binary classification, ranging from -1 (total disagreement) to +1 (perfect agreement). 0 indicates a random guess.' },
                mcnemar: { title: 'McNemar\'s Test', text: 'A statistical test used on paired nominal data to determine if there are significant differences between two dependent diagnostic tests.' },
                delong: { title: 'DeLong\'s Test', text: 'A non-parametric statistical test used to compare the Area Under the Curve (AUC) of two correlated ROC curves.' },
                pValue: { title: 'P value', text: 'The probability of obtaining test results at least as extreme as the results actually observed, under the assumption that the null hypothesis is correct. A smaller P value (typically < .05) indicates strong evidence against the null hypothesis.' }
            },
            interpretation: {
                notAvailable: 'Data for this metric is not available or could not be calculated for the current selection.',
                sens: 'A Sensitivity of <strong>{value}</strong> indicates that the test correctly identified <strong>{value}</strong> of all true positive cases (N+).<br>The 95% CI from <strong>{lower}</strong> to <strong>{upper}</strong> suggests the true sensitivity is likely within this range.',
                spec: 'A Specificity of <strong>{value}</strong> indicates that the test correctly identified <strong>{value}</strong> of all true negative cases (N-).<br>The 95% CI from <strong>{lower}</strong> to <strong>{upper}</strong> suggests the true specificity is likely within this range.',
                ppv: 'A Positive Predictive Value of <strong>{value}</strong> means that if a patient tests positive, there is a <strong>{value}</strong> probability they are truly N+.<br>The 95% CI from <strong>{lower}</strong> to <strong>{upper}</strong>.',
                npv: 'A Negative Predictive Value of <strong>{value}</strong> means that if a patient tests negative, there is a <strong>{value}</strong> probability they are truly N-.<br>The 95% CI from <strong>{lower}</strong> to <strong>{upper}</strong>.',
                acc: 'An Accuracy of <strong>{value}</strong> means the test provided the correct classification for <strong>{value}</strong> of all patients.<br>The 95% CI from <strong>{lower}</strong> to <strong>{upper}</strong>.',
                auc: 'An AUC of <strong>{value}</strong> indicates a <strong>{strength}</strong> overall ability of the test to discriminate between N+ and N- patients.',
                f1: 'An F1-Score of <strong>{value}</strong> indicates the harmonic mean of PPV and sensitivity. A score of 1.0 is perfect.',
                pValue: {
                    default: "A P value of {pValue} indicates that {significanceText}. This means there is a {strength} statistical evidence of a difference between {comparison} for the metric '{metric}'.",
                    mcnemar: "A P value of {pValue} for McNemar's test suggests that the difference in accuracy between {method1} and {method2} is {significanceText}. This indicates a {strength} evidence of a difference in their classification agreement with the reference standard.",
                    delong: "A P value of {pValue} for DeLong's test suggests that the difference in AUC between {method1} and {method2} is {significanceText}. This indicates a {strength} evidence of a difference in their overall diagnostic performance.",
                    fisher: "A P value of {pValue} from Fisher's exact test indicates that the association between having feature '{featureName}' and being N-positive is {significanceText}. This suggests a {strength} evidence of a non-random association."
                },
                or: {
                    value: "An Odds Ratio of {value} means the odds of a patient being N-positive are {value} times {direction} for patients with '{featureName}' compared to those without it. This indicates a {strength} association.",
                    ci: "The 95% Confidence Interval from {lower} to {upper} {ciInterpretationText}."
                },
                rd: {
                    value: "A Risk Difference of {value} indicates that the absolute risk of being N-positive is {value} {direction} for patients with feature '{featureName}' compared to those without it.",
                    ci: "The 95% Confidence Interval from {lower} to {upper} {ciInterpretationText}."
                },
                phi: {
                    value: "A Phi coefficient of {value} indicates a {strength} positive correlation between the presence of feature '{featureName}' and a positive N-status.",
                },
                ci: {
                    includesOne: "does not exclude an odds ratio of 1, so the association is not statistically significant at the P < .05 level",
                    excludesOne: "excludes an odds ratio of 1, suggesting a statistically significant association at the P < .05 level",
                    includesZero: "crosses zero, indicating the observed risk difference is not statistically significant at the P < .05 level",
                    excludesZero: "does not cross zero, suggesting a statistically significant risk difference at the P < .05 level"
                },
                strength: {
                    very_strong: "very strong",
                    strong: "strong",
                    moderate: "moderate",
                    weak: "weak",
                    very_weak: "very weak",
                    undetermined: "undetermined"
                },
                direction: {
                    increased: "higher",
                    decreased: "lower",
                    unchanged: "unchanged"
                },
                significance: {
                    significant: "statistically significant",
                    not_significant: "not statistically significant"
                }
            },
            dataTab: {
                nr: "Patient's sequential ID number.",
                name: "Patient's last name (anonymized/coded).",
                firstName: "Patient's first name (anonymized/coded).",
                sex: "Patient's sex (male/female/unknown).",
                age: "Patient's age in years at the time of MRI.",
                therapy: "Therapy administered before surgery (Neoadjuvant therapy, Surgery alone).",
                n_as_t2: "Direct status comparison: N (Histopathology reference), AS (Avocado Sign prediction), T2 (current criteria prediction). Click N, AS, or T2 in the column header for sub-sorting.",
                notes: "Additional clinical or radiological notes on the case, if available.",
                expandAll: "Expand or collapse the detail view of T2-weighted lymph node features for all patients in the current table view.",
                expandRow: "Click here or the arrow button to show/hide details on the morphological properties of this patient's T2-weighted lymph nodes. Only available if T2 node data exists."
            },
            analysisTab: {
                nr: "Patient's sequential ID number.",
                name: "Patient's last name (anonymized/coded).",
                therapy: "Therapy administered before surgery.",
                n_as_t2: "Direct status comparison: N (Histopathology reference), AS (Avocado Sign prediction), T2 (current criteria prediction). Click N, AS, or T2 in the column header for sub-sorting.",
                n_counts: "Number of pathologically positive (N+) lymph nodes / Total number of histopathologically examined lymph nodes for this patient.",
                as_counts: "Number of Avocado Sign positive (AS+) lymph nodes / Total number of lymph nodes visible on T1-CE MRI for this patient.",
                t2_counts: "Number of T2-positive lymph nodes (based on current criteria) / Total number of lymph nodes visible on T2-MRI for this patient.",
                expandAll: "Expand or collapse the detail view of the evaluated T2-weighted lymph nodes and the fulfilled criteria for all patients in the current table view.",
                expandRow: "Click here or the arrow button to show/hide the detailed evaluation of this patient's individual T2-weighted lymph nodes according to the currently applied criteria. Fulfilled positive criteria are highlighted."
            },
            descriptiveStatistics: {
                'age': { description: 'Distribution of patient ages in the [COHORT] cohort.' },
                'gender': { description: 'Distribution of patient sex in the [COHORT] cohort.' },
                'therapy': { description: 'Distribution of pre-surgical therapy in the [COHORT] cohort.' },
                'status-n': { description: 'Distribution of final histopathological N-Status in the [COHORT] cohort.' },
                'status-as': { description: 'Distribution of Avocado Sign status in the [COHORT] cohort.' },
                'status-t2': { description: 'Distribution of T2-weighted criteria status in the [COHORT] cohort.' },
                'criteriaComparisonTable': { cardTitle: 'Comparison of diagnostic performance between the Avocado Sign and various T2-weighted criteria sets for the [COHORT] cohort. P-values represent the statistical comparison of each set\'s AUC against the Avocado Sign\'s AUC.' }
            },
            t2Logic: { description: "Logical operator for active T2 criteria: <strong>AND</strong> (A lymph node is positive only if ALL active criteria are met). <strong>OR</strong> (A lymph node is positive if AT LEAST ONE active criterion is met). The choice affects the T2 status calculation." },
            t2Size: { description: "Size criterion (short axis): Lymph nodes with a diameter <strong>greater than or equal to (≥)</strong> the set threshold are considered suspicious. Adjustable range: [MIN] - [MAX] mm (step: [STEP] mm). Enable/disable with checkbox." },
            t2Shape: { description: "Shape criterion: Select which shape ('round' or 'oval') is considered suspicious. Enable/disable with checkbox." },
            t2Border: { description: "Border criterion: Select which border ('sharp' or 'irregular') is considered suspicious. Enable/disable with checkbox." },
            t2Homogeneity: { description: "Homogeneity criterion: Select whether 'homogeneous' or 'heterogeneous' internal signal on T2w is considered suspicious. Nodes with non-assessable signal (value 'null') never fulfill this criterion. Enable/disable with checkbox." },
            t2Signal: { description: "Signal criterion: Select which T2 signal intensity ('low', 'intermediate', or 'high') relative to surrounding muscle is considered suspicious. Nodes with non-assessable signal (value 'null') never fulfill this criterion. Enable/disable with checkbox." },
            t2Actions: {
                reset: "Resets the logic and all criteria to their default settings. The changes are not yet applied.",
                apply: "Apply the currently set T2 criteria and logic to the entire dataset. This updates the T2 columns in the tables, all statistical analyses, and charts. The setting is also saved for future sessions."
            }
        })
    }),
    TABLE_COLUMN_DEFINITIONS: Object.freeze({
        DATA_TABLE_COLUMNS: Object.freeze([
            { key: 'id', label: 'ID', tooltipKey: 'nr', width: 'auto' },
            { key: 'lastName', label: 'Last Name', tooltipKey: 'name', width: 'auto' },
            { key: 'firstName', label: 'First Name', tooltipKey: 'firstName', width: 'auto' },
            { key: 'sex', label: 'Sex', tooltipKey: 'sex', width: 'auto' },
            { key: 'age', label: 'Age', tooltipKey: 'age', width: 'auto' },
            { key: 'therapy', label: 'Therapy', tooltipKey: 'therapy', width: 'auto' },
            { key: 'status', label: 'N/AS/T2', tooltipKey: 'n_as_t2', subKeys: [{key: 'nStatus', label: 'N'}, {key: 'asStatus', label: 'AS'}, {key: 't2Status', label: 'T2'}], width: 'auto' },
            { key: 'notes', label: 'Notes', tooltipKey: 'notes', width: '150px' },
            { key: 'details', label: '', width: '30px', tooltipKey: 'expandRow'}
        ]),
        ANALYSIS_TABLE_COLUMNS: Object.freeze([
            { key: 'id', label: 'ID', tooltipKey: 'nr', width: 'auto' },
            { key: 'lastName', label: 'Name', tooltipKey: 'name', width: 'auto' },
            { key: 'therapy', label: 'Therapy', tooltipKey: 'therapy', width: 'auto' },
            { key: 'status', label: 'N/AS/T2', tooltipKey: 'n_as_t2', subKeys: [{key: 'nStatus', label: 'N'}, {key: 'asStatus', label: 'AS'}, {key: 't2Status', label: 'T2'}], width: 'auto' },
            { key: 'countPathologyNodes', label: 'N+/N total', tooltipKey: 'n_counts', textAlign: 'center', width: 'auto' },
            { key: 'countASNodes', label: 'AS+/AS total', tooltipKey: 'as_counts', textAlign: 'center', width: 'auto' },
            { key: 'countT2Nodes', label: 'T2+/T2 total', tooltipKey: 't2_counts', textAlign: 'center', width: 'auto' },
            { key: 'details', label: '', width: '30px', tooltipKey: 'expandRow'}
        ])
    }),
    T2_ICON_SVGS: Object.freeze({
        SIZE_DEFAULT: (s, sw, iconColor, c, r, sq, sqPos) => `<path d="M${sw/2} ${c} H${s-sw/2} M${c} ${sw/2} V${s-sw/2}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`,
        SHAPE_ROUND: (s, sw, iconColor, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${iconColor}" stroke-width="${sw}"/>`,
        SHAPE_OVAL: (s, sw, iconColor, c, r, sq, sqPos) => `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.65}" fill="none" stroke="${iconColor}" stroke-width="${sw}"/>`,
        BORDER_SHARP: (s, sw, iconColor, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${iconColor}" stroke-width="${sw * 1.2}"/>`,
        BORDER_IRREGULAR: (s, sw, iconColor, c, r, sq, sqPos) => `<path d="M ${c + r} ${c} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${r*0.8} ${r*1.2} 0 0 1 ${c-r*0.9} ${c-r*0.3} A ${r*1.1} ${r*0.7} 0 0 1 ${c+r} ${c} Z" fill="none" stroke="${iconColor}" stroke-width="${sw * 1.2}"/>`,
        HOMOGENEITY_HOMOGENEOUS: (s, sw, iconColor, c, r, sq, sqPos) => `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="${iconColor}" stroke="none" rx="1" ry="1"/>`,
        HOMOGENEITY_HETEROGENEOUS: (s, sw, iconColor, c, r, sq, sqPos) => {
            let svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" rx="1" ry="1"/>`;
            const pSize = sq / 4;
            for(let i=0;i<3;i++){for(let j=0;j<3;j++){if((i+j)%2===0){svgContent+=`<rect x="${sqPos+i*pSize+pSize/2}" y="${sqPos+j*pSize+pSize/2}" width="${pSize}" height="${pSize}" fill="${iconColor}" style="opacity:0.6;"/>`;}}}
            return svgContent;
        },
        SIGNAL_LOWSIGNAL: (s, sw, iconColor, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="#555555" stroke="rgba(0,0,0,0.1)" stroke-width="${sw * 0.75}"/>`,
        SIGNAL_INTERMEDIATESIGNAL: (s, sw, iconColor, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="#aaaaaa" stroke="rgba(0,0,0,0.1)" stroke-width="${sw * 0.75}"/>`,
        SIGNAL_HIGHSIGNAL: (s, sw, iconColor, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="#f0f0f0" stroke="#333333" stroke-width="${sw * 0.75}"/>`,
        UNKNOWN: (s, sw, iconColor, c, r, sq, sqPos) => `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" stroke-dasharray="2 2" /><line x1="${sqPos}" y1="${sqPos}" x2="${sqPos+sq}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/><line x1="${sqPos+sq}" y1="${sqPos}" x2="${sqPos}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`
    })
});

window.PUBLICATION_CONFIG = Object.freeze({
    sections: [
        { id: 'title_main', labelKey: 'title_main', subSections: [] },
        { id: 'abstract_main', labelKey: 'abstract_main', countType: 'word', limit: 300, subSections: [] },
        { id: 'introduction_main', labelKey: 'introduction_main', countType: 'word', limit: 400, subSections: [] },
        {
            id: 'methoden_main', labelKey: 'methoden_main', countType: 'word', limit: 800, subSections: [
                { id: 'methoden_studienanlage_ethik', label: 'Study Design and Patients' },
                { id: 'methoden_mrt_protokoll_akquisition', label: 'MRI Protocol and Image Analysis' },
                { id: 'methoden_vergleichskriterien_t2', label: 'Comparative T2w Criteria Sets' },
                { id: 'methoden_referenzstandard_histopathologie', label: 'Reference Standard' },
                { id: 'methoden_statistische_analyse_methoden', label: 'Statistical Analysis' }
            ]
        },
        {
            id: 'ergebnisse_main', labelKey: 'ergebnisse_main', countType: 'word', limit: 1000, subSections: [
                { id: 'ergebnisse_patientencharakteristika', label: 'Patient Characteristics' },
                { id: 'ergebnisse_vergleich_as_vs_t2', label: 'Diagnostic Performance and Comparison' }
            ]
        },
        { id: 'discussion_main', labelKey: 'discussion_main', countType: 'word', limit: 800, subSections: [] },
        { id: 'references_main', labelKey: 'references_main', countType: 'item', limit: 35, subSections: [] },
        { id: 'stard_checklist', labelKey: 'stard_checklist', subSections: [] }
    ],
    literatureCriteriaSets: [
        {
            id: 'Koh_2008',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh 2008',
            logic: 'OR',
            applicableCohort: 'Overall',
            criteria: {
                size: { active: false },
                shape: { active: false },
                border: { active: true, value: 'irregular' },
                homogeneity: { active: true, value: 'heterogeneous' },
                signal: { active: false }
            },
            studyInfo: {
                refKey: 'Koh_2008',
                patientCohort: 'Overall (n=25)',
                investigationType: 'Prospective, Pre- and Post-nCRT',
                keyCriteriaSummary: 'Irregular Border OR Heterogeneous Signal'
            }
        },
        {
            id: 'Barbaro_2024',
            name: 'Barbaro et al. (2024)',
            displayShortName: 'Barbaro 2024',
            logic: 'OR',
            applicableCohort: 'neoadjuvantTherapy',
            criteria: {
                size: { active: true, threshold: 2.2, condition: '>' },
                shape: { active: false },
                border: { active: false },
                homogeneity: { active: false },
                signal: { active: false }
            },
            studyInfo: {
                refKey: 'Barbaro_2024',
                patientCohort: 'Neoadjuvant Therapy (n=191)',
                investigationType: 'Retrospective, Post-nCRT',
                focus: 'Size criteria for predicting ypN0',
                keyCriteriaSummary: 'A node is considered malignant if short-axis diameter > 2.2 mm (inverse of optimal ypN0 cut-off).'
            }
        },
        {
            id: 'Rutegard_2025',
            name: 'ESGAR 2016 (Rutegård et al.)',
            displayShortName: 'ESGAR 2016',
            logic: 'KOMBINIERT',
            applicableCohort: 'surgeryAlone',
            criteria: {
                size: { active: true, threshold: 9.0, condition: '>=' },
                shape: { active: true, value: 'round' },
                border: { active: true, value: 'irregular' },
                homogeneity: { active: true, value: 'heterogeneous' },
                signal: { active: false }
            },
            studyInfo: {
                refKey: 'Rutegard_2025',
                patientCohort: 'Surgery Alone (n=46)',
                investigationType: 'Prospective, Node-by-Node',
                focus: 'Validation of combined ESGAR 2016 criteria',
                keyCriteriaSummary: '≥9mm OR (5–8mm AND ≥2 features) OR (<5mm AND 3 features)'
            },
            description: 'ESGAR 2016 consensus criteria: A lymph node is considered malignant if it has a short-axis diameter of ≥9 mm, OR if it has a diameter of 5–8 mm and at least two suspicious morphological features (round shape, irregular border, or heterogeneous signal), OR if it has a diameter of <5 mm and all three suspicious features.'
        }
    ]
});

function getDefaultT2Criteria() {
    return cloneDeep(window.DEFAULT_T2_CRITERIA);
}