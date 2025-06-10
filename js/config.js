const APP_CONFIG = Object.freeze({
    APP_NAME: "Nodal Staging: Avocado Sign vs. T2 Criteria",
    APP_VERSION: "3.0.0",
    DEFAULT_SETTINGS: Object.freeze({
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'AND',
        DATEN_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'nr', direction: 'asc', subKey: null }),
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'nRCT',
        PRESENTATION_VIEW: 'as-vs-t2',
        PRESENTATION_STUDY_ID: 'applied_criteria',
        PUBLICATION_SECTION: 'abstract',
        PUBLICATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        CHART_COLOR_SCHEME: 'default',
        BRUTE_FORCE_METRIC: 'Balanced Accuracy'
    }),
    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'appliedT2Criteria_v4.2_detailed',
        APPLIED_LOGIC: 'appliedT2Logic_v4.2_detailed',
        CURRENT_KOLLEKTIV: 'currentKollektiv_v4.2_detailed',
        PUBLICATION_SECTION: 'currentPublicationSection_v4.2_detailed',
        PUBLICATION_BRUTE_FORCE_METRIC: 'currentPublicationBfMetric_v4.2_detailed',
        STATS_LAYOUT: 'currentStatsLayout_v4.2_detailed',
        STATS_KOLLEKTIV1: 'currentStatsKollektiv1_v4.2_detailed',
        STATS_KOLLEKTIV2: 'currentStatsKollektiv2_v4.2_detailed',
        PRESENTATION_VIEW: 'currentPresentationView_v4.2_detailed',
        PRESENTATION_STUDY_ID: 'currentPresentationStudyId_v4.2_detailed',
        CHART_COLOR_SCHEME: 'chartColorScheme_v4.2_detailed',
        FIRST_APP_START: 'appFirstStart_v3.0'
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
        FORM_VALUES: Object.freeze(['rund', 'oval']),
        KONTUR_VALUES: Object.freeze(['scharf', 'irregulär']),
        HOMOGENITAET_VALUES: Object.freeze(['homogen', 'heterogen']),
        SIGNAL_VALUES: Object.freeze(['signalarm', 'intermediär', 'signalreich'])
    }),
    UI_SETTINGS: Object.freeze({
        ICON_SIZE: 20,
        ICON_STROKE_WIDTH: 1.5,
        ICON_COLOR: 'var(--text-dark)',
        TOOLTIP_DELAY: Object.freeze([200, 100]),
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
        FILENAME_TEMPLATE: 'AvocadoSignT2_{TYPE}_{KOLLEKTIV}_{DATE}.{EXT}',
        TABLE_PNG_EXPORT_SCALE: 2,
        ENABLE_TABLE_PNG_EXPORT: true,
        CSV_DELIMITER: ';',
        FILENAME_TYPES: Object.freeze({
            STATS_CSV: 'Statistics_CSV',
            BRUTEFORCE_TXT: 'BruteForce_Report_TXT',
            DESKRIPTIV_MD: 'Descriptive_Statistics_MD',
            DATEN_MD: 'Data_List_MD',
            AUSWERTUNG_MD: 'Analysis_Table_MD',
            FILTERED_DATA_CSV: 'Filtered_Data_CSV',
            COMPREHENSIVE_REPORT_HTML: 'Comprehensive_Report_HTML',
            CHART_SINGLE_PNG: '{ChartName}_PNG',
            CHART_SINGLE_SVG: '{ChartName}_SVG',
            TABLE_PNG_EXPORT: '{TableName}_PNG',
            PRAES_AS_PERF_CSV: 'Pres_AS_Performance_CSV',
            PRAES_AS_PERF_MD: 'Pres_AS_Performance_MD',
            PRAES_AS_VS_T2_PERF_CSV: 'Pres_Performance_ASvsT2_{StudyID}_CSV',
            PRAES_AS_VS_T2_COMP_MD: 'Pres_Metrics_ASvsT2_{StudyID}_MD',
            PRAES_AS_VS_T2_TESTS_MD: 'Pres_Tests_ASvsT2_{StudyID}_MD',
            CRITERIA_COMPARISON_MD: 'Criteria_Comparison_MD',
            PUBLICATION_SECTION_MD: 'Publication_{SectionName}_MD',
            ALL_ZIP: 'Complete_Export_ZIP',
            CSV_ZIP: 'CSV_Package_ZIP',
            MD_ZIP: 'Markdown_Package_ZIP',
            PNG_ZIP: 'Image_Package_PNG_ZIP',
            SVG_ZIP: 'Vector_Package_SVG_ZIP'
        })
    }),
    SPECIAL_IDS: Object.freeze({
        APPLIED_CRITERIA_STUDY_ID: 'applied_criteria',
        APPLIED_CRITERIA_DISPLAY_NAME: 'Applied T2 Criteria',
        AVOCADO_SIGN_ID: 'avocado_sign',
        AVOCADO_SIGN_DISPLAY_NAME: 'Avocado Sign'
    })
});

const UI_TEXTS = Object.freeze({
    cohortDisplayNames: {
        'Gesamt': 'Overall',
        'direkt OP': 'Upfront Surgery',
        'nRCT': 'nRCT'
    },
    t2LogicDisplayNames: {
        'UND': 'AND',
        'ODER': 'OR',
        'KOMBINIERT': 'COMBINED (ESGAR Logic)'
    },
    publicationTab: {
        bfMetricSelectLabel: 'BF Optimization Metric for T2:',
        sectionLabels: {
            abstract: 'Abstract',
            introduction: 'Introduction',
            methoden: 'Methods',
            ergebnisse: 'Results',
            discussion: 'Discussion',
            references: 'References'
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
        direktOP: 'Upfront Surgery',
        nRCT: 'nRCT',
        nPositive: 'N+',
        nNegative: 'N-',
        asPositive: 'AS+',
        asNegative: 'AS-',
        t2Positive: 'T2+',
        t2Negative: 'T2-',
        avocadoSign: 'Avocado Sign (AS)',
        currentT2: '{T2ShortName}'
    },
    statMetrics: {
        significanceTexts: {
            SIGNIFICANT: "statistically significant",
            NOT_SIGNIFICANT: "not statistically significant"
        },
        orFactorTexts: {
            INCREASED: "increased",
            DECREASED: "decreased",
            UNCHANGED: "unchanged"
        },
        rdDirectionTexts: {
            HIGHER: "higher",
            LOWER: "lower",
            EQUAL: "equal"
        },
        associationStrengthTexts: {
            strong: "strong",
            moderate: "moderate",
            weak: "weak",
            very_weak: "very weak",
            undetermined: "undetermined"
        }
    },
    tooltips: Object.freeze({
        quickGuideButton: { description: "Show a quick guide and important notes about the application." },
        cohortButtons: { description: "Select the patient cohort for the analysis: <strong>Overall</strong>, <strong>Upfront Surgery</strong>, or <strong>nRCT</strong>. This choice filters the data for all application tabs." },
        headerStats: {
            cohort: "Currently selected patient cohort for analysis.",
            patientCount: "Total number of patients in the selected cohort.",
            statusN: "Percentage of patients with positive (+) vs. negative (-) histopathological lymph node status (N-status, reference standard) in the selected cohort.",
            statusAS: "Percentage of patients with positive (+) vs. negative (-) lymph node status according to the Avocado Sign (AS) prediction (based on T1-CE MRI) in the selected cohort.",
            statusT2: "Percentage of patients with positive (+) vs. negative (-) lymph node status according to the currently **applied and saved** T2 criteria (see Analysis tab) for the selected cohort."
        },
        mainTabs: {
            data: "Display the list of all patient data in the selected cohort with basic information and status (N/AS/T2). Allows sorting and expanding details on T2 lymph node features.",
            analysis: "Central tab for defining T2 criteria, viewing a descriptive dashboard, running brute-force optimization, and detailed analysis results per patient based on the applied criteria.",
            statistics: "Provides detailed statistical analyses (performance metrics, comparisons, associations) for the globally selected cohort or a comparison of two specifically chosen cohorts. All confidence intervals (CI) are 95% CIs.",
            presentation: "Presents analysis results in a format optimized for presentations, focusing on the comparison of the Avocado Sign with T2-based approaches (applied or literature).",
            publication: "Generates text suggestions and materials for scientific publications.",
            export: "Offers extensive options for downloading raw data, analysis results, tables, and charts in various file formats."
        },
        dataTab: {
            nr: "Patient's sequential number.",
            name: "Patient's last name (anonymized/coded).",
            firstName: "Patient's first name (anonymized/coded).",
            sex: "Patient's sex (m/f/unknown).",
            age: "Patient's age in years at the time of MRI.",
            therapy: "Therapy administered before surgery (nRCT: neoadjuvant chemoradiotherapy, Upfront Surgery: no prior treatment).",
            n_as_t2: "Direct status comparison: N (Pathology reference), AS (Avocado Sign), T2 (current criteria). Click N, AS, or T2 in the column header for sub-sorting.",
            notes: "Additional clinical or radiological notes on the case, if available.",
            expandAll: "Expand or collapse the detail view of T2-weighted lymph node features for all patients in the current table view.",
            expandRow: "Click here or the arrow button to show/hide details on the morphological properties of this patient's T2-weighted lymph nodes. Only available if T2 node data exists."
        },
        analysisTab: {
            nr: "Patient's sequential number.",
            name: "Patient's last name (anonymized/coded).",
            therapy: "Therapy administered before surgery.",
            n_as_t2: "Direct status comparison: N (Pathology reference), AS (Avocado Sign), T2 (current criteria). Click N, AS, or T2 in the column header for sub-sorting.",
            n_counts: "Number of pathologically positive (N+) lymph nodes / Total number of histopathologically examined lymph nodes for this patient.",
            as_counts: "Number of Avocado Sign positive (AS+) lymph nodes / Total number of lymph nodes visible on T1-CE MRI for this patient.",
            t2_counts: "Number of T2-positive lymph nodes (based on current criteria) / Total number of lymph nodes visible on T2-MRI for this patient.",
            expandAll: "Expand or collapse the detail view of the evaluated T2-weighted lymph nodes and the fulfilled criteria for all patients in the current table view.",
            expandRow: "Click here or the arrow button to show/hide the detailed evaluation of this patient's individual T2-weighted lymph nodes according to the currently applied criteria. Fulfilled positive criteria are highlighted."
        },
        t2Logic: { description: "Logical operator for active T2 criteria: <strong>AND</strong> (A lymph node is positive only if ALL active criteria are met). <strong>OR</strong> (A lymph node is positive if AT LEAST ONE active criterion is met). The choice affects the T2 status calculation." },
        t2Size: { description: `Size criterion (short axis): Lymph nodes with a diameter <strong>greater than or equal to (≥)</strong> the set threshold are considered suspicious. Adjustable range: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm (step: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm). Enable/disable with checkbox.` },
        t2Form: { description: "Shape criterion: Select which shape ('round' or 'oval') is considered suspicious. Enable/disable with checkbox." },
        t2Contour: { description: "Border criterion: Select which border ('smooth' or 'irregular') is considered suspicious. Enable/disable with checkbox." },
        t2Homogeneity: { description: "Homogeneity criterion: Select whether 'homogeneous' or 'heterogeneous' internal signal on T2w is considered suspicious. Enable/disable with checkbox." },
        t2Signal: { description: "Signal criterion: Select which T2 signal intensity ('low', 'intermediate', or 'high') relative to surrounding muscle is considered suspicious. Nodes with non-assessable signal (value 'null') never fulfill this criterion. Enable/disable with checkbox." },
        t2Actions: {
            reset: "Resets the logic and all criteria to their default settings. The changes are not yet applied.",
            apply: "Applies the currently set T2 criteria and logic to the entire dataset. This updates the T2 columns in the tables, all statistical analyses, and charts. The setting is also saved for future sessions."
        },
        t2CriteriaCard: { unsavedIndicator: "<strong>Attention:</strong> There are unsaved changes to the T2 criteria or logic. Click 'Apply & Save' to update the results and save the settings." },
        t2MetricsOverview: {
            cardTitle: "Quick overview of diagnostic performance (T2 vs. N) for the currently applied and saved T2 criteria for the selected cohort: <strong>[COHORT]</strong>. All confidence intervals (CI) are 95% CIs.",
            sens: "Sensitivity (T2 vs. N): Proportion of N+ cases correctly identified as positive by the T2 criteria.",
            spez: "Specificity (T2 vs. N): Proportion of N- cases correctly identified as negative by the T2 criteria.",
            ppv: "Positive Predictive Value (PPV, T2 vs. N): Probability that a T2+ case is actually N+.",
            npv: "Negative Predictive Value (NPV, T2 vs. N): Probability that a T2- case is actually N-.",
            acc: "Accuracy (T2 vs. N): Overall proportion of correctly classified cases.",
            balAcc: "Balanced Accuracy (T2 vs. N): Average of sensitivity and specificity. Useful for imbalanced class sizes.",
            f1: "F1-Score (T2 vs. N): Harmonic mean of PPV and sensitivity. A value of 1 is optimal.",
            auc: "AUC (T2 vs. N): Area Under the ROC Curve; for binary tests like this, equivalent to Balanced Accuracy."
        },
        bruteForceMetric: { description: "Select the target metric for the brute-force optimization.<br><strong>Accuracy:</strong> Proportion of correct classifications.<br><strong>Balanced Accuracy:</strong> (Sens+Spec)/2; good for imbalanced classes.<br><strong>F1-Score:</strong> Harmonic mean of PPV & Sensitivity.<br><strong>PPV:</strong> Precision for positive predictions.<br><strong>NPV:</strong> Precision for negative predictions." },
        bruteForceStart: { description: "Starts the brute-force search for the T2 criteria combination that maximizes the selected target metric in the current cohort. This may take some time and runs in the background." },
        bruteForceInfo: { description: "Shows the status of the optimization worker and the currently analyzed patient cohort: <strong>[COHORT_NAME]</strong>." },
        bruteForceProgress: { description: "Progress of the ongoing optimization: Tested combinations / Total count ([TOTAL]). Displays the current best metric and the corresponding criteria." },
        bruteForceResult: {
            description: "Best result of the completed brute-force optimization for the selected cohort ([N_TOTAL] patients, including [N_PLUS] N+ and [N_MINUS] N-) and the target metric.",
            cohortStats: "Statistics of the cohort used for this optimization: N (total count), N+ (count N-positive), N- (count N-negative)."
        },
        bruteForceDetailsButton: { description: "Opens a window with the top 10 results and more details about the completed optimization." },
        bruteForceModal: { exportButton: "Exports the detailed report of the brute-force optimization (Top 10 results, cohort statistics, configuration) as a formatted text file (.txt)." },
        statisticsLayout: { description: "Select the display mode: <strong>Single View</strong> for the globally selected cohort or <strong>Comparison Active</strong> to select and compare two specific cohorts." },
        statisticsCohort1: { description: "Select the first cohort for statistical analysis or comparison (only active in 'Comparison Active' layout)." },
        statisticsCohort2: { description: "Select the second cohort for comparison (only active in 'Comparison Active' layout)." },
        statisticsToggleComparison: { description: "Toggle between the detailed single view for the globally selected cohort and the comparison view of two specifically chosen cohorts." },
        descriptiveStatistics: {
            cardTitle: "Demographics, clinical data, and baseline lymph node counts for cohort <strong>[COHORT]</strong>.",
            age: { name: "Age", description: "Patient age in years." }
        },
        diagnosticPerformanceAS: { cardTitle: "Diagnostic performance of the Avocado Sign (AS) vs. Histopathology (N) for cohort <strong>[COHORT]</strong>. All CIs are 95% CIs." },
        diagnosticPerformanceT2: { cardTitle: "Diagnostic performance of the currently applied T2 criteria vs. Histopathology (N) for cohort <strong>[COHORT]</strong>. All CIs are 95% CIs." },
        statisticalComparisonASvsT2: { cardTitle: "Statistical comparison of the diagnostic performance of AS vs. currently applied T2 criteria (paired tests) in cohort <strong>[COHORT]</strong>." },
        associationSingleCriteria: { cardTitle: "Association between AS status or individual T2 features and N-status (+/-) in cohort <strong>[COHORT]</strong>. OR: Odds Ratio, RD: Risk Difference, φ: Phi Coefficient. All CIs are 95% CIs." },
        cohortComparison: { cardTitle: "Statistical comparison of Accuracy and AUC (for AS and T2) between <strong>[COHORT1]</strong> and <strong>[COHORT2]</strong> (unpaired tests)." },
        criteriaComparisonTable: {
            cardTitle: "Tabular performance comparison: Avocado Sign, applied T2 criteria, and literature sets for the globally selected cohort <strong>[GLOBAL_COHORT_NAME]</strong>. Literature-based sets are evaluated on their specific target cohort if different (indicated in parentheses). All values are without CIs.",
            tableHeaderSet: "Method / Criteria Set (Eval. on Cohort N)",
            tableHeaderSens: "Sens.",
            tableHeaderSpec: "Spec.",
            tableHeaderPPV: "PPV",
            tableHeaderNPV: "NPV",
            tableHeaderAcc: "Acc.",
            tableHeaderAUC: "AUC/Bal. Acc."
        },
        presentation: {
            viewSelect: { description: "Select the view: <strong>Avocado Sign (Performance)</strong> for an overview of AS performance, or <strong>AS vs. T2 (Comparison)</strong> for a direct comparison of AS with a selectable T2 criteria basis." },
            studySelect: { description: "Select a T2 criteria basis for comparison with the Avocado Sign. Options: currently applied criteria in the app or predefined sets from published studies. The selection updates the comparisons below. The global cohort may adapt to the study's target cohort." },
            t2BasisInfoCard: {
                title: "Information on T2 Comparison Basis",
                description: "Shows details about the selected T2 criteria for comparison with AS and the current comparison cohort.",
                reference: "Study reference or source of the criteria.",
                patientCohort: "Original study cohort or current comparison cohort (with patient count).",
                investigationType: "Type of examination in the original study (e.g., primary staging, restaging).",
                focus: "Main focus of the original study regarding these criteria.",
                keyCriteriaSummary: "Summary of the applied T2 criteria and their logic."
            },
            asPurPerfTable: {
                cohort: "Patient cohort and its size (N).",
                sens: "Sensitivity of the Avocado Sign (vs. N) in this cohort.",
            },
            asVsT2PerfTable: {
                metric: "Diagnostic metric.",
                asValue: "Value for Avocado Sign (AS) (vs. N) in cohort <strong>[COHORT_NAME_COMPARISON]</strong>, incl. 95% CI.",
                t2Value: "Value for the T2 basis <strong>[T2_SHORT_NAME]</strong> (vs. N) in cohort <strong>[COHORT_NAME_COMPARISON]</strong>, incl. 95% CI."
            },
            asVsT2TestTable: {
                test: "Statistical test comparing AS vs. <strong>[T2_SHORT_NAME]</strong>.",
                statistic: "Value of the test statistic.",
                pValue: "p-value of the test. p < 0.05 indicates a statistically significant difference between AS and <strong>[T2_SHORT_NAME]</strong> regarding the tested metric (Accuracy or AUC) in cohort <strong>[COHORT_NAME_COMPARISON]</strong>.",
                method: "Name of the statistical test used."
            }
        },
        exportTab: {
            singleExports: "Single Exports",
            exportPackages: "Export Packages (.zip)",
            description: "Allows exporting analysis results, tables, and charts based on the currently selected global cohort (<strong>[COHORT]</strong>) and the currently applied T2 criteria.",
            statsCSV: { description: "Detailed table of all calculated statistical metrics (descriptive, AS & T2 performance, comparisons, associations) from the Statistics tab as a CSV file.", type: 'STATS_CSV', ext: "csv" },
            bruteForceTXT: { description: "Detailed report of the last brute-force optimization for the current cohort (Top 10 results, configuration) as a text file (.txt), if performed.", type: 'BRUTEFORCE_TXT', ext: "txt" },
            deskriptivMD: { description: "Table of descriptive statistics (Statistics tab) as a Markdown (.md) file.", type: 'DESKRIPTIV_MD', ext: "md" },
            datenMD: { description: "Current data list (Data tab) as a Markdown table (.md).", type: 'DATEN_MD', ext: "md" },
            auswertungMD: { description: "Current analysis table (Analysis tab, incl. T2 results) as a Markdown (.md) file.", type: 'AUSWERTUNG_MD', ext: "md" },
            filteredDataCSV: { description: "Raw data of the currently selected cohort (incl. T2 evaluation) as a CSV file (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
            comprehensiveReportHTML: { description: "Comprehensive analysis report as an HTML file (statistics, configurations, charts), printable.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
            pngZIP: { description: "All currently visible charts (Statistics, Analysis, Presentation) and selected tables as individual PNG files (ZIP archive).", type: 'PNG_ZIP', ext: "zip" },
            svgZIP: { description: "All currently visible charts (Statistics, Analysis, Presentation) as individual SVG files (ZIP archive).", type: 'SVG_ZIP', ext: "zip" },
            chartSinglePNG: { description: "Selected chart '{ChartName}' as a PNG file.", type: 'CHART_SINGLE_PNG', ext: "png"},
            chartSingleSVG: { description: "Selected chart '{ChartName}' as a vector SVG file.", type: 'CHART_SINGLE_SVG', ext: "svg"},
            tableSinglePNG: { description: "Selected table '{TableName}' as a PNG image file.", type: 'TABLE_PNG_EXPORT', ext: "png"},
            allZIP: { description: "All available single files (Statistics CSV, BruteForce TXT, all MDs, Raw Data CSV, HTML Report) in one ZIP archive.", type: 'ALL_ZIP', ext: "zip"},
            csvZIP: { description: "All available CSV files (Statistics, Raw Data) in one ZIP archive.", type: 'CSV_ZIP', ext: "zip"},
            mdZIP: { description: "All available Markdown files (Descriptive, Data, Analysis, Publication Texts) in one ZIP archive.", type: 'MD_ZIP', ext: "md"}
        },
        publicationTab: {
            spracheSwitch: { description: "Switch the language of generated texts and some labels in the Publication tab between German and English." },
            sectionSelect: { description: "Select the section of the scientific publication for which text suggestions and relevant data/graphics should be displayed." },
            bruteForceMetricSelect: { description: "Select the target metric whose brute-force optimization results should be displayed in the results section. Default texts usually refer to the default optimization metric (Balanced Accuracy)." }
        },
        statMetrics: {
            sens: { name: "Sensitivity", description: "Sensitivity ([METHODE] vs. N): Proportion of true positive cases (N+) correctly identified by the method [METHODE].<br><i>Formula: TP / (TP + FN)</i>", interpretation: "The method [METHODE] correctly identified <strong>[VALUE]%</strong> of actual N+ patients (95% CI via [METHOD_CI]: [LOWER]% – [UPPER]%) in the [COHORT] cohort."},
            spec: { name: "Specificity", description: "Specificity ([METHODE] vs. N): Proportion of true negative cases (N-) correctly identified by the method [METHODE].<br><i>Formula: TN / (TN + FP)</i>", interpretation: "The method [METHODE] correctly identified <strong>[VALUE]%</strong> of actual N- patients (95% CI via [METHOD_CI]: [LOWER]% – [UPPER]%) in the [COHORT] cohort."},
            ppv: { name: "Positive Predictive Value (PPV)", description: "PPV ([METHODE] vs. N): Probability that a patient with a positive test result from method [METHODE] is actually diseased (N+).<br><i>Formula: TP / (TP + FP)</i>", interpretation: "If method [METHODE] yielded a positive result, the probability of an actual N+ status was <strong>[VALUE]%</strong> (95% CI via [METHOD_CI]: [LOWER]% – [UPPER]%) in the [COHORT] cohort. This value is highly prevalence-dependent."},
            npv: { name: "Negative Predictive Value (NPV)", description: "NPV ([METHODE] vs. N): Probability that a patient with a negative test result from method [METHODE] is actually healthy (N-).<br><i>Formula: TN / (TN + FN)</i>", interpretation: "If method [METHODE] yielded a negative result, the probability of an actual N- status was <strong>[VALUE]%</strong> (95% CI via [METHOD_CI]: [LOWER]% – [UPPER]%) in the [COHORT] cohort. This value is highly prevalence-dependent."},
            acc: { name: "Accuracy", description: "Accuracy ([METHODE] vs. N): Proportion of all cases correctly classified by method [METHODE].<br><i>Formula: (TP + TN) / Total</i>", interpretation: "Method [METHODE] correctly classified a total of <strong>[VALUE]%</strong> of all patients (95% CI via [METHOD_CI]: [LOWER]% – [UPPER]%) in the [COHORT] cohort."},
            balAcc: { name: "Balanced Accuracy", description: "Balanced Accuracy ([METHODE] vs. N): The average of sensitivity and specificity. Useful for imbalanced class sizes (prevalence).<br><i>Formula: (Sensitivity + Specificity) / 2</i>", interpretation: "The balanced accuracy of method [METHODE], which weights sensitivity and specificity equally, was <strong>[VALUE]</strong> (95% CI via [METHOD_CI]: [LOWER] – [UPPER]) in the [COHORT] cohort."},
            f1: { name: "F1-Score", description: "F1-Score ([METHODE] vs. N): The harmonic mean of PPV (Precision) and Sensitivity (Recall). A value of 1 is optimal.<br><i>Formula: 2 * (PPV * Sensitivity) / (PPV + Sensitivity)</i>", interpretation: "The F1-Score for method [METHODE], combining precision and sensitivity, is <strong>[VALUE]</strong> (95% CI via [METHOD_CI]: [LOWER] – [UPPER]) in the [COHORT] cohort."},
            auc: { name: "Area Under Curve (AUC)", description: "AUC ([METHODE] vs. N): Area under the Receiver Operating Characteristic (ROC) curve. Represents the ability of a method to distinguish between positive and negative cases. 0.5 corresponds to chance, 1.0 to perfect separation.<br><i>For binary tests like AS or a fixed T2 rule, AUC = Balanced Accuracy.</i>", interpretation: "An AUC of <strong>[VALUE]</strong> (95% CI via [METHOD_CI]: [LOWER] – [UPPER]) indicates a <strong>[RATING]</strong> overall discriminative ability of method [METHODE] between N+ and N- cases in the [COHORT] cohort."},
            mcnemar: { name: "McNemar's Test", description: "Tests for a significant difference in the discordant pairs (cases where AS and [T2_SHORT_NAME] yield different results) on paired data (i.e., both tests on the same patient).<br><i>Null Hypothesis (H0): Number(AS+ / [T2_SHORT_NAME]-) = Number(AS- / [T2_SHORT_NAME]+). A small p-value argues against H0.</i>", interpretation: "McNemar's test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. This indicates that the misclassification rates (discordant pairs) of AS and [T2_SHORT_NAME] in the [COHORT] cohort are [SIGNIFICANCE_TEXT] different."},
            delong: { name: "DeLong's Test", description: "Compares two AUC values from ROC curves based on the same (paired) data, accounting for covariance.<br><i>Null Hypothesis (H0): AUC(AS) = AUC([T2_SHORT_NAME]). A small p-value argues against H0.</i>", interpretation: "The DeLong test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. This indicates that the AUC values (or Balanced Accuracies) of AS and [T2_SHORT_NAME] in the [COHORT] cohort are [SIGNIFICANCE_TEXT] different."},
            phi: { name: "Phi Coefficient (φ)", description: "A measure of the strength and direction of association between two binary variables (e.g., presence of feature '[FEATURE]' and N-status). Ranges from -1 to +1. 0 means no association.", interpretation: "The Phi coefficient of <strong>[VALUE]</strong> indicates a <strong>[STRENGTH]</strong> association between the feature '[FEATURE]' and N-status in the [COHORT] cohort."},
            rd: { name: "Risk Difference (RD)", description: "The absolute difference in the probability (risk) of being N+ between patients with and without the feature '[FEATURE]'. RD = P(N+|Feature+) - P(N+|Feature-). An RD of 0 means no difference.", interpretation: "The risk of an N+ status was <strong>[VALUE]%</strong> absolutely [HIGHER_LOWER] for patients with the feature '[FEATURE]' compared to patients without it (95% CI via [METHOD_CI]: [LOWER]% – [UPPER]%) in the [COHORT] cohort."},
            or: { name: "Odds Ratio (OR)", description: "The ratio of the odds of being N+ in the presence vs. absence of the feature '[FEATURE]'. OR = Odds(N+|Feature+) / Odds(N+|Feature-).<br>OR > 1: Increased odds for N+ when the feature is present.<br>OR < 1: Decreased odds.<br>OR = 1: No association.", interpretation: "The odds of an N+ status were [FACTOR_TEXT] by a factor of <strong>[VALUE]</strong> for patients with the feature '[FEATURE]' compared to patients without it (95% CI via [METHOD_CI]: [LOWER] – [UPPER], p=[P_VALUE], [SIGNIFICANCE]) in the [COHORT] cohort."},
            fisher: { name: "Fisher's Exact Test", description: "An exact test to check for a significant association between two categorical variables (e.g., feature '[FEATURE]' vs. N-status). Suitable for small samples/low expected frequencies.<br><i>Null Hypothesis (H0): No association.</i>", interpretation: "Fisher's exact test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>, indicating a [SIGNIFICANCE_TEXT] association between the feature '[FEATURE]' and N-status in the [COHORT] cohort."},
            mannwhitney: { name: "Mann-Whitney U Test", description: "A non-parametric test to compare the central tendency (median) of a continuous variable (e.g., '[VARIABLE]') between two independent groups (e.g., N+ vs. N-).<br><i>Null Hypothesis (H0): No difference in medians/distributions.</i>", interpretation: "The Mann-Whitney U test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. This shows a [SIGNIFICANCE_TEXT] difference in the distribution of the variable '[VARIABLE]' between N+ and N- patients in the [COHORT] cohort."},
            defaultP: { interpretation: "The calculated p-value is <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. At a significance level of ${formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, 2)}, the result is <strong>[SIGNIFICANCE_TEXT]</strong>." },
            size_mwu: {name: "LN Size MWU", description: "Comparison of the median lymph node sizes between N+ and N- patients using the Mann-Whitney U test. This considers all lymph nodes, not patient-level status.", interpretation: "The Mann-Whitney U test yielded a p-value of <strong>[P_VALUE] ([SIGNIFICANCE])</strong>. This shows a [SIGNIFICANCE_TEXT] difference in the distribution of lymph node sizes between the lymph nodes of N+ and N- patients in the [COHORT] cohort."}
        }
    })
});

const PUBLICATION_CONFIG = Object.freeze({
    defaultSection: 'abstract',
    sections: Object.freeze([
        { id: 'abstract', labelKey: 'abstract', subSections: [{ id: 'abstract_main', label: 'Abstract & Key Results' }] },
        { id: 'introduction', labelKey: 'introduction', subSections: [{ id: 'introduction_main', label: 'Introduction' }] },
        { id: 'methoden', labelKey: 'methoden', subSections: [
            { id: 'methoden_studienanlage_ethik', label: 'Study Design and Ethics' },
            { id: 'methoden_patientenkohorte', label: 'Patient Cohort' },
            { id: 'methoden_mrt_protokoll_akquisition', label: 'MRI Protocol' },
            { id: 'methoden_bildanalyse_avocado_sign', label: 'Image Analysis: Avocado Sign' },
            { id: 'methoden_bildanalyse_t2_kriterien', label: 'Image Analysis: T2 Criteria' },
            { id: 'methoden_referenzstandard_histopathologie', label: 'Reference Standard: Histopathology' },
            { id: 'methoden_statistische_analyse_methoden', label: 'Statistical Analysis' }
        ]},
        { id: 'ergebnisse', labelKey: 'ergebnisse', subSections: [
            { id: 'ergebnisse_patientencharakteristika', label: 'Patient Characteristics' },
            { id: 'ergebnisse_as_diagnostische_guete', label: 'Performance: Avocado Sign' },
            { id: 'ergebnisse_t2_literatur_diagnostische_guete', label: 'Performance: T2 Criteria (Literature)' },
            { id: 'ergebnisse_t2_optimiert_diagnostische_guete', label: 'Performance: T2 Criteria (Optimized)' },
            { id: 'ergebnisse_vergleich_as_vs_t2', label: 'Comparative Analyses' }
        ]},
        { id: 'discussion', labelKey: 'discussion', subSections: [{ id: 'discussion_main', label: 'Discussion' }] },
        { id: 'references', labelKey: 'references', subSections: [{ id: 'references_main', label: 'References' }] }
    ]),
    literatureCriteriaSets: Object.freeze([
        { id: 'koh_2008_morphology', labelKey: 'Koh et al. (2008)' },
        { id: 'barbaro_2024_restaging', labelKey: 'Barbaro et al. (2024)' },
        { id: 'rutegard_et_al_esgar', labelKey: 'Rutegård et al. (2025) / ESGAR 2016' }
    ]),
    bruteForceMetricsForPublication: Object.freeze([
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'Positive Predictive Value (PPV)' },
        { value: 'NPV', label: 'Negative Predictive Value (NPV)' }
    ]),
    defaultBruteForceMetricForPublication: 'Balanced Accuracy',
    publicationElements: Object.freeze({
        methoden: Object.freeze({
            literaturT2KriterienTabelle: {
                id: 'pub-table-literatur-t2-kriterien',
                titleEn: 'Overview of Evaluated Literature-Based T2 Criteria Sets'
            },
            flowDiagram: {
                id: 'pub-figure-flow-diagram',
                titleEn: 'Patient Recruitment and Analysis Flowchart'
            }
        }),
        ergebnisse: Object.freeze({
            patientenCharakteristikaTabelle: {
                id: 'pub-table-patienten-charakteristika',
                titleEn: 'Baseline Patient Characteristics and Clinical Data'
            },
            diagnostischeGueteASTabelle: {
                id: 'pub-table-diagnostische-guete-as',
                titleEn: 'Diagnostic Performance of the Avocado Sign for N-Status Prediction'
            },
            diagnostischeGueteLiteraturT2Tabelle: {
                id: 'pub-table-diagnostische-guete-literatur-t2',
                titleEn: 'Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'pub-table-diagnostische-guete-optimierte-t2',
                titleEn: 'Diagnostic Performance of Brute-Force Optimized T2 Criteria (Target: {BF_METRIC}) for N-Status Prediction'
            },
            statistischerVergleichAST2Tabelle: {
                id: 'pub-table-statistischer-vergleich-as-t2',
                titleEn: 'Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria'
            },
            alterVerteilungChart: {
                id: 'pub-chart-alter-Gesamt',
                titleEn: 'Age Distribution in the Overall Cohort'
            },
            geschlechtVerteilungChart: {
                id: 'pub-chart-gender-Gesamt',
                titleEn: 'Sex Distribution in the Overall Cohort'
            },
            vergleichPerformanceChartGesamt: {
                id: 'pub-chart-vergleich-Gesamt',
                titleEn: 'Comparative Metrics for the Overall Cohort: AS vs. Optimized T2 Criteria'
            },
            vergleichPerformanceChartdirektOP: {
                id: 'pub-chart-vergleich-direkt-OP',
                titleEn: 'Comparative Metrics for the Upfront Surgery Cohort: AS vs. Optimized T2 Criteria'
            },
            vergleichPerformanceChartnRCT: {
                id: 'pub-chart-vergleich-nRCT',
                titleEn: 'Comparative Metrics for the nRCT Cohort: AS vs. Optimized T2 Criteria'
            }
        })
    })
});

function getDefaultT2Criteria() {
    return Object.freeze({
        logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        size: { active: true, threshold: 5.0, condition: '>=' },
        form: { active: false, value: 'rund' },
        kontur: { active: false, value: 'irregulär' },
        homogenitaet: { active: false, value: 'heterogen' },
        signal: { active: false, value: 'signalreich' }
    });
}
