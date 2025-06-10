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
        BRUTE_FORCE_METRIC: 'Balanced Accuracy',
        PUBLICATION_LANG: 'en'
    }),
    STORAGE_KEYS: Object.freeze({
        APPLIED_CRITERIA: 'appliedT2Criteria_v4.2_detailed',
        APPLIED_LOGIC: 'appliedT2Logic_v4.2_detailed',
        CURRENT_KOLLEKTIV: 'currentKollektiv_v4.2_detailed',
        PUBLICATION_SECTION: 'currentPublicationSection_v4.4_detailed',
        PUBLICATION_BRUTE_FORCE_METRIC: 'currentPublicationBfMetric_v4.4_detailed',
        STATS_LAYOUT: 'currentStatsLayout_v4.2_detailed',
        STATS_KOLLEKTIV1: 'currentStatsKollektiv1_v4.2_detailed',
        STATS_KOLLEKTIV2: 'currentStatsKollektiv2_v4.2_detailed',
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
        FISHER_EXACT_THRESHOLD: 5 // Used in statistics_service.js for Fisher's Exact Test
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
            PUBLICATION_ABSTRACT_MD: 'Publication_Abstract_MD',
            PUBLICATION_INTRODUCTION_MD: 'Publication_Introduction_MD',
            PUBLICATION_METHODS_MD: 'Publication_Methods_{SectionName}_MD',
            PUBLICATION_RESULTS_MD: 'Publication_Results_{SectionName}_MD',
            PUBLICATION_DISCUSSION_MD: 'Publication_Discussion_MD',
            PUBLICATION_REFERENCES_MD: 'Publication_References_MD',
            PUBLICATION_SECTION_MD: 'Publication_Section_{SectionName}_MD', // Generic fallback
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
    }),
    REPORT_SETTINGS: Object.freeze({
        REPORT_TITLE: "Comprehensive Rectal Cancer Nodal Staging Analysis Report",
        REPORT_AUTHOR: "AvocadoSign WebApp",
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
    REFERENCES_FOR_PUBLICATION: Object.freeze({
        STUDY_PERIOD_2020_2023: "January 2020 and November 2023", //
        // Add other specific references if needed for text generation, e.g., default ORCID, etc.
    })
});

const UI_TEXTS = Object.freeze({
    cohortDisplayNames: {
        'Gesamt': 'Overall',
        'direkt OP': 'Upfront Surgery',
        'nRCT': 'nRCT'
    },
    t2LogicDisplayNames: {
        'AND': 'AND',
        'OR': 'OR',
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
            statusN: "Percentage of N+ patients (Pathology).",
            statusAS: "Percentage of AS+ patients (Prediction).",
            statusT2: "Percentage of T2+ patients (Applied Criteria)."
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
            nr: "Patient's sequential ID number.",
            name: "Patient's last name (anonymized/coded).",
            firstName: "Patient's first name (anonymized/coded).",
            sex: "Patient's sex (male/female/unknown).",
            age: "Patient's age in years at the time of MRI.",
            therapy: "Therapy administered before surgery (nRCT: neoadjuvant chemoradiotherapy, Upfront Surgery: no prior treatment).",
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
        t2Logic: { description: "Logical operator for active T2 criteria: <strong>AND</strong> (A lymph node is positive only if ALL active criteria are met). <strong>OR</strong> (A lymph node is positive if AT LEAST ONE active criterion is met). The choice affects the T2 status calculation." },
        t2Size: { description: `Size criterion (short axis): Lymph nodes with a diameter <strong>greater than or equal to (≥)</strong> the set threshold are considered suspicious. Adjustable range: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min} - ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max} mm (step: ${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step} mm). Enable/disable with checkbox.` },
        t2Form: { description: "Shape criterion: Select which shape ('round' or 'oval') is considered suspicious. Enable/disable with checkbox." },
        t2Contour: { description: "Border criterion: Select which border ('smooth' or 'irregular') is considered suspicious. Enable/disable with checkbox." },
        t2Homogenitaet: { description: "Homogeneity criterion: Select whether 'homogeneous' or 'heterogeneous' internal signal on T2w is considered suspicious. Enable/disable with checkbox." },
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
            age: { name: "Age", description: "Patient age in years." },
            sex: { name: "Sex", description: "Patient's sex (male/female/unknown)." },
            therapy: { name: "Therapy", description: "Therapy administered before surgery (nRCT: neoadjuvant chemoradiotherapy, Upfront Surgery: no prior treatment)." },
            nStatus: { name: "N-Status", description: "Histopathological lymph node status (N+ / N-)." },
            asStatus: { name: "AS-Status", description: "Avocado Sign status (AS+ / AS-)." },
            t2Status: { name: "T2-Status", description: "T2-weighted MRI lymph node status (T2+ / T2-) based on applied criteria." },
            lnCounts_n_total: { name: "LN N total", description: "Total number of histopathologically examined lymph nodes per patient." },
            lnCounts_n_plus: { name: "LN N+", description: "Number of pathologically positive lymph nodes per patient, only in N+ patients (n=[n])." },
            lnCounts_as_total: { name: "LN AS total", description: "Total number of lymph nodes visible on T1-CE MRI per patient." },
            lnCounts_as_plus: { name: "LN AS+", description: "Number of Avocado Sign positive lymph nodes per patient, only in AS+ patients (n=[n])." },
            lnCounts_t2_total: { name: "LN T2 total", description: "Total number of lymph nodes visible on T2-MRI per patient." },
            lnCounts_t2_plus: { name: "LN T2+", description: "Number of T2-positive lymph nodes per patient (based on applied criteria), only in T2+ patients (n=[n])." },
            chartAge: { name: "Age Distribution Chart", description: "Histogram showing the distribution of patient ages in the [COHORT] cohort." },
            chartGender: { name: "Sex Distribution Chart", description: "Pie chart illustrating the distribution of male and female patients in the [COHORT] cohort." }
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
        }
    }),
    publicationContent: Object.freeze({
        abstract_main: Object.freeze({
            en: (stats, commonData) => {
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
                const sexText = `${maleCount} men, ${nGesamt - maleCount} women`;

                const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023 || "January 2020 and November 2023"; //

                const formatCIForPublication = (metric) => {
                    if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
                    const digits = (metric.name === 'auc' || metric.name === 'f1') ? 2 : 1;
                    const isPercent = !(metric.name === 'auc' || metric.name === 'f1');
                    const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);

                    if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                        return valueStr;
                    }
                    const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
                    const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);

                    return `${valueStr} (95% CI: ${lowerStr}, ${upperStr})`;
                };

                const getPValueTextForPublication = (pValue) => {
                    if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';
                    const pLessThanThreshold = 0.001;
                    if (pValue < pLessThanThreshold) {
                        return 'P < .001';
                    }
                    const pFormatted = formatNumber(pValue, 3, 'N/A', true);
                    return `P = ${pFormatted}`;
                };


                return `
                    <p><strong>Background:</strong> Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer. Standard magnetic resonance imaging (MRI) criteria have limitations.</p>
                    <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, compared to literature-based and cohort-optimized T2-weighted (T2w) criteria for predicting N-status.</p>
                    <p><strong>Materials and Methods:</strong> This retrospective, ethics committee-approved, single-center study analyzed data from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two blinded radiologists evaluated the AS (hypointense core within a hyperintense lymph node on T1w CE sequences) and morphological T2w criteria. Histopathological examination of surgical specimens served as the reference standard.</p>
                    <p><strong>Results:</strong> A total of ${formatNumber(nGesamt,0)} patients (median age, ${ageRangeText}; ${sexText}) were analyzed. The AS showed a sensitivity of ${formatCIForPublication({value: asGesamt?.sens?.value, ci: asGesamt?.sens?.ci})}, specificity of ${formatCIForPublication({value: asGesamt?.spec?.value, ci: asGesamt?.spec?.ci})}, and an AUC of ${formatNumber(asGesamt?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(asGesamt?.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(asGesamt?.auc?.ci?.upper, 2, 'N/A', true)}). For optimized T2w criteria, the AUC was ${formatNumber(bfGesamtStats?.auc?.value, 2, 'N/A', true)}. The difference in AUC between AS and optimized T2w criteria was not statistically significant (${getPValueTextForPublication(vergleichASvsBFGesamt?.delong?.pValue)}).</p>
                    <p><strong>Conclusion:</strong> The Avocado Sign is a promising MRI marker for predicting lymph node status in rectal cancer, demonstrating high diagnostic performance comparable to cohort-optimized T2w criteria, with potential to improve preoperative staging.</p>
                    <p class="small text-muted mt-2">Abbreviations: ACC = Accuracy, AS = Avocado Sign, AUC = Area Under the Curve, CE = Contrast-Enhanced, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, N-status = Nodal status, T2w = T2-weighted.</p>
                `;
            }
        }),
        introduction_main: Object.freeze({
            en: (stats, commonData) => `
                <p>Rectal cancer remains a significant public health concern. Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for guiding treatment decisions, especially with the emergence of new treatment paradigms like total neoadjuvant therapy and nonoperative management. Magnetic resonance imaging (MRI) is the gold standard for local staging of rectal cancer. However, standard MRI staging typically relies on T2-weighted sequences, which have demonstrated limitations in accurately predicting nodal involvement.</p>
                <p>Existing literature highlights the suboptimal diagnostic accuracy of T2-weighted MRI morphology for nodal staging, with reported sensitivities and specificities often below 80%. This underscores a critical need for improved imaging techniques to enhance nodal staging accuracy and patient stratification. We hypothesize that contrast administration may be useful in the prediction of locoregional lymph node involvement in rectal cancer patients.</p>
                <p>This study aims to evaluate the diagnostic performance of the "Avocado Sign," a novel contrast-enhanced (CE) MRI marker, as a potential imaging predictor of mesorectal lymph node status in rectal cancer. The Avocado Sign is defined as a hypointense core within an otherwise homogeneously hyperintense lymph node on contrast-enhanced T1-weighted fat-saturated images. We will assess its sensitivity, specificity, accuracy, positive predictive value (PPV), and negative predictive value (NPV) for prognostication of locoregional lymph node involvement, and investigate its performance by subgroup analysis. The findings may offer insights into refining MRI protocols and optimizing personalized treatment strategies for rectal cancer patients.</p>
            `
        }),
        methoden_studienanlage_ethik: Object.freeze({
            en: (stats, commonData) => `
                <p>We conducted a single-institution retrospective study to evaluate the diagnostic performance of the Avocado Sign, a novel MR imaging marker, in predicting locoregional lymph node status in patients with rectal cancer. The study was approved by the institutional review board of Klinikum St. Georg Leipzig, Germany, and written informed consent was obtained from all patients before enrolment. This study was compliant with HIPAA regulations.
                Patients were eligible for inclusion if they were 18 years of age or older and had histologically confirmed rectal cancer. Exclusion criteria included unresectable tumors and contraindications to MRI. From ${commonData.references.STUDY_PERIOD_2020_2023}, 106 consecutive patients underwent baseline staging MRI. Of these, 77 patients (72.6%) received standard neoadjuvant chemoradiotherapy (nCRT) followed by restaging MRI prior to rectal surgery, according to current guidelines and the decision of a multidisciplinary tumor board. The remaining 29 patients (27.4%) underwent primary surgery without prior therapy. For patients undergoing surgery alone, the mean interval between MRI and surgery was 7 days (range: 5–14 days). For nCRT patients, restaging MRI was performed a mean of 6 weeks (range: 5–8 weeks) after completion of therapy, with surgery occurring approximately 10 days (range: 7–15 days) post-MRI.
                Histopathological examination of the resected specimens served as the reference standard.
                </p>
                <div class="chart-container pub-figure" id="${PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.id}">
                    <p class="small text-muted">[Flowchart of patient enrollment and study design]</p>
                    <p class="small text-muted">${PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram.titleEn}</p>
                </div>
            `
        }),
        methoden_mrt_protokoll_akquisition: Object.freeze({
            en: (stats, commonData) => `
                <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Germany) using body and spine array coils. The imaging protocol included high-resolution sagittal, axial, and coronal T2-weighted turbo spin echo (TSE) sequences; axial diffusion-weighted imaging (DWI); and contrast-enhanced axial T1-weighted volumetric interpolated breath-hold examination (VIBE) with Dixon fat suppression. Sequence parameters are detailed in Table 1.</p>
                <p>A weight-based dose (0.2 mL/kg of body weight) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco, Monroe Township, NJ) was administered intravenously. Contrast-enhanced images were acquired immediately after the intravenous contrast agent had been fully administered. Butylscopolamine was administered at the start and midpoint of each examination to reduce motion artifacts. The imaging protocol was identical for baseline staging and restaging studies.</p>
                <div class="table-responsive pub-table" id="${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id}">
                    <p class="small text-muted">[MRI sequence parameters table]</p>
                    <p class="small text-muted"><strong>Table 1:</strong> MRI sequence parameters</p>
                </div>
            `
        }),
        methoden_bildanalyse_avocado_sign: Object.freeze({
            en: (stats, commonData) => `
                <p>Two radiologists (with 29 and 7 years of experience in abdominal MRI, respectively) independently assessed the images for the presence of the Avocado Sign. The Avocado Sign was defined as a hypointense core within an otherwise homogeneously hyperintense lymph node on contrast-enhanced T1-weighted images, regardless of node size or shape. The sign was assessed in all visible mesorectal lymph nodes, without a minimum size threshold, to ensure comprehensive evaluation across the full spectrum of lymph node sizes. Extramesorectal nodes and tumor deposits were not included in this assessment. Radiologists were blinded to histopathological results to prevent bias. Discrepancies were resolved by consensus with a third radiologist (with 19 years of experience in abdominal MRI). In the neoadjuvant subgroup, the Avocado Sign was assessed on restaging MRI images obtained after nCRT, aligning findings with post-therapy histopathological results. A direct comparison between pre- and post-nCRT MRI images was not performed, as the study focused on the diagnostic performance of the Avocado Sign after neoadjuvant treatment. Lymph node status was categorized as positive if the Avocado Sign was present in at least one node and negative if the sign was absent. Before the study, radiologists underwent a joint training session, including a written definition and example images, to standardize assessment and ensure consistent interpretation. The Avocado Sign was initially identified during routine clinical practice, and for this study, predefined imaging criteria were retrospectively applied to a separate cohort to minimize in-sample bias and enhance generalizability.</p>
                <div class="chart-container pub-figure" id="pub-figure-avocado-sign-illustration">
                    <p class="small text-muted">[Illustration of the Avocado Sign]</p>
                    <p class="small text-muted"><strong>Figure 2:</strong> Illustration of the Avocado Sign. <strong>a</strong> Photograph of an avocado without a core symbolizes a normal lymph node. <strong>b</strong> Contrast-enhanced image of local staging MRI displays a homogeneously enhancing mesorectal lymph node (arrow). <strong>c</strong> Photograph of an avocado with a core symbolizes lymph node metastasis. <strong>d</strong> Contrast-enhanced image of local staging MRI detects a lymph node metastasis owing to the prominent hypointense center (arrow) as a striking example of the typical appearance and concept of the Avocado Sign. Additional examples of subtle manifestations are provided in the Supplementary Material</p>
                </div>
            `
        }),
        methoden_bildanalyse_t2_kriterien: Object.freeze({
            en: (stats, commonData) => `
                <p>For comparison with the Avocado Sign, we also evaluated the diagnostic performance of T2-weighted (T2w) morphological criteria. Two main approaches were considered: a literature-based set of criteria and a cohort-optimized set of criteria derived from a brute-force analysis of our dataset.</p>
                <h4>Literature-Based T2 Criteria:</h4>
                <p>We selected several established literature-based T2w criteria sets for comparative analysis:</p>
                <ul>
                    <li><strong>Rutegård et al. (2025) / ESGAR 2016:</strong> These criteria combine size and morphological features. Lymph nodes are considered malignant if: short axis ≥ 9 mm; OR short axis 5–8 mm and ≥2 suspicious features (round, irregular, heterogeneous); OR short axis < 5 mm and all 3 suspicious features are present. This set was applied to the 'Upfront Surgery' cohort, aligning with its primary staging context.</li>
                    <li><strong>Koh et al. (2008):</strong> Morphological criteria defining a malignant node by irregular outlines or internal signal heterogeneity on T2-weighted MRI. This set was evaluated on the overall cohort for broad comparability.</li>
                    <li><strong>Barbaro et al. (2024):</strong> This study focused on optimal size cut-offs for restaging after nCRT, with a short-axis diameter of ≤ 2.2 mm being optimal for predicting ypN0 status. This criterion was applied specifically to the 'nRCT' cohort.</li>
                </ul>
                <div class="table-responsive pub-table" id="pub-table-literatur-t2-kriterien">
                    <p class="small text-muted">[Table of literature-based T2 criteria]</p>
                    <p class="small text-muted"><strong>Table 2:</strong> Overview of Evaluated Literature-Based T2 Criteria Sets</p>
                </div>
                <h4>Cohort-Optimized T2 Criteria (Brute-Force):</h4>
                <p>To identify the best-performing T2w criteria combination for our specific dataset, a systematic brute-force optimization was performed. This algorithm exhaustively tested all possible combinations of the five morphological T2 features (size, shape, border, homogeneity, signal intensity) and logical operators (AND/OR). The optimization aimed to maximize a pre-selected diagnostic metric (e.g., Balanced Accuracy). The best-performing criteria set identified by this process was then used for comparative analysis with the Avocado Sign. The brute-force analysis was performed using a dedicated Web Worker to ensure UI responsiveness.</p>
            `
        }),
        methoden_referenzstandard_histopathologie: Object.freeze({
            en: (stats, commonData) => `
                <p>Histopathological examination of the surgical specimens served as the reference standard for lymph node status. All resected mesorectal specimens were processed according to standard protocols, and lymph nodes were meticulously identified and examined by experienced pathologists. The final N-status (N+ or N-) was determined based on the presence or absence of metastatic cells within any identified lymph node.</p>
            `
        }),
        methoden_statistische_analyse_methoden: Object.freeze({
            en: (stats, commonData) => `
                <p>Descriptive statistics were used to summarize patient characteristics, including age, sex, and therapy approach. The prevalence of the Avocado Sign and lymph node metastases was determined for the overall cohort, the surgery alone subgroup, and the neoadjuvant subgroup.</p>
                <p>Diagnostic performance metrics, including sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), and accuracy, were calculated using contingency tables. These metrics were compared between subgroups using the chi-square test for independence, which is appropriate for analyzing categorical data. Receiver operating characteristic (ROC) curve analysis washed performed, and the area under the curve (AUC) was calculated to evaluate the diagnostic performance of the Avocado Sign and T2 criteria.</p>
                <p>Interobserver agreement for the Avocado Sign was assessed using Cohen’s kappa coefficient. To address cohort heterogeneity, subgroup analyses were performed for patients undergoing primary surgery and those receiving neoadjuvant chemoradiotherapy. This approach allowed evaluation of diagnostic performance within more homogeneous groups.</p>
                <p>Statistical comparison of diagnostic performance between the Avocado Sign and T2 criteria (applied and literature-based) was performed using paired tests. McNemar's test was used to compare accuracies, and DeLong's test was used for comparing AUCs from paired data. Fisher's exact test was used to assess associations between categorical features (e.g., presence of AS or T2 morphology) and N-status, particularly for small sample sizes. The Mann-Whitney U test was used for comparing continuous variables (e.g., lymph node size) between N+ and N- groups. Confidence intervals (95% CIs) for proportions were calculated using the Wilson Score method, while CIs for effect sizes (AUC, F1-Score) were derived using bootstrap percentile method with ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications and an alpha of ${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA}.</p>
                <p>Statistical analyses were performed using SPSS version 26 (IBM, Armonk, NY) for descriptive statistics, R (version 4.0.3; R Foundation for Statistical Computing, Vienna, Austria) for ROC curve analysis and chi-square tests, and Python (version 3.8; Python Software Foundation, Wilmington, DE) for additional data visualization and interobserver agreement assessment. A two-sided P-value of less than ${APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL} was considered to indicate statistical significance.</p>
            `
        }),
        ergebnisse_patientencharakteristika: Object.freeze({
            en: (stats, commonData) => {
                const gesamtStats = stats?.Gesamt?.descriptive;
                if (!gesamtStats) return `<p class="text-warning">Patient characteristics data not available for the overall cohort.</p>`;
                return `
                    <p>A total of ${gesamtStats.patientCount} patients with histologically confirmed rectal cancer were included in the study (Table 1). The mean age was ${formatNumber(gesamtStats.age?.mean, 1)} ± ${formatNumber(gesamtStats.age?.sd, 1)} years, and ${formatPercent(gesamtStats.sex?.m / gesamtStats.patientCount, 1)} were male. ${gesamtStats.therapy?.['direkt OP'] ?? 0} patients (${formatPercent((gesamtStats.therapy?.['direkt OP'] ?? 0) / gesamtStats.patientCount, 1)}) underwent surgery alone, while ${gesamtStats.therapy?.nRCT ?? 0} patients (${formatPercent((gesamtStats.therapy?.nRCT ?? 0) / gesamtStats.patientCount, 1)}) received neoadjuvant chemoradiotherapy. Histopathological examination revealed lymph node metastases in ${gesamtStats.nStatus?.plus ?? 0} patients (${formatPercent((gesamtStats.nStatus?.plus ?? 0) / gesamtStats.patientCount, 1)}).</p>
                    <div class="table-responsive pub-table" id="pub-table-patienten-charakteristika">
                        <p class="small text-muted">[Table of patient demographics and treatment approaches]</p>
                        <p class="small text-muted"><strong>Table 1:</strong> Patient demographics and treatment approaches.</p>
                    </div>
                `;
            }
        }),
        ergebnisse_as_diagnostische_guete: Object.freeze({
            en: (stats, commonData) => {
                const gesamtStats = stats?.Gesamt?.performanceAS;
                const direktOPStats = stats?.['direkt OP']?.performanceAS;
                const nRCTStats = stats?.nRCT?.performanceAS;

                if (!gesamtStats) return `<p class="text-warning">Avocado Sign diagnostic performance data not available.</p>`;

                const fCI = (metric, digits = 1, isPercent = true) => {
                    if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
                    const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);
                    if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                        return valueStr;
                    }
                    const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
                    const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
                    return `${valueStr} (95% CI: ${lowerStr}–${upperStr})`;
                };
                
                return `
                    <p>In the overall cohort, the Avocado Sign was positive in ${gesamtStats.matrix?.tp + gesamtStats.matrix?.fp} patients and negative in ${gesamtStats.matrix?.fn + gesamtStats.matrix?.tn} patients. Histopathological examination revealed lymph node metastases in ${gesamtStats.matrix?.tp + gesamtStats.matrix?.fn} patients, while ${gesamtStats.matrix?.fp + gesamtStats.matrix?.tn} patients were classified N0.</p>
                    <p>The Avocado Sign demonstrated high diagnostic accuracy for predicting lymph node involvement across the overall cohort and subgroups. Overall sensitivity was ${fCI(gesamtStats.sens)}, specificity was ${fCI(gesamtStats.spec)}, PPV was ${fCI(gesamtStats.ppv)}, NPV was ${fCI(gesamtStats.npv)}, and accuracy was ${fCI(gesamtStats.acc)}. The area under the ROC curve (AUC) was ${fCI(gesamtStats.auc, 2, false)} for the overall cohort, indicating high diagnostic performance (Figure 3a).</p>
                    <p>Subgroup analysis revealed excellent performance of the Avocado Sign in patients undergoing surgery alone, with a sensitivity of ${fCI(direktOPStats?.sens)}, specificity of ${fCI(direktOPStats?.spec)}, PPV of ${fCI(direktOPStats?.ppv)}, NPV of ${fCI(direktOPStats?.npv)}, and accuracy of ${fCI(direktOPStats?.acc)}. The AUC was ${fCI(direktOPStats?.auc, 2, false)} (Figure 3b).</p>
                    <p>In patients receiving neoadjuvant chemoradiotherapy, the Avocado Sign showed a sensitivity of ${fCI(nRCTStats?.sens)}, specificity of ${fCI(nRCTStats?.spec)}, PPV of ${fCI(nRCTStats?.ppv)}, NPV of ${fCI(nRCTStats?.npv)}, and accuracy of ${fCI(nRCTStats?.acc)}. The AUC was ${fCI(nRCTStats?.auc, 2, false)} (Figure 3c). Chi-square tests indicated no significant differences in diagnostic performance between subgroups (P = ${formatNumber(stats?.Gesamt?.comparisonASvsT2Applied?.mcnemar?.pValue, 2, 'N/A', true)}), affirming the robustness of the Avocado Sign across treatment types. An overview of nominal values and diagnostic performance metrics for overall cohort and subgroups is provided in Table 3.</p>
                    
                    <div class="chart-container pub-figure" id="pub-chart-roc-overall">
                        <p class="small text-muted">[ROC curve for the overall cohort]</p>
                        <p class="small text-muted"><strong>Figure 3a:</strong> ROC curve for the overall cohort, demonstrating the diagnostic accuracy of the Avocado Sign in predicting mesorectal lymph node involvement.</p>
                    </div>
                    <div class="chart-container pub-figure" id="pub-chart-roc-direkt-op">
                        <p class="small text-muted">[ROC curve for patients undergoing surgery alone]</p>
                        <p class="small text-muted"><strong>Figure 3b:</strong> ROC curve for patients undergoing surgery alone, highlighting the diagnostic performance in this subgroup.</p>
                    </div>
                     <div class="chart-container pub-figure" id="pub-chart-roc-nRCT">
                        <p class="small text-muted">[ROC curve for patients receiving neoadjuvant chemoradiotherapy]</p>
                        <p class="small text-muted"><strong>Figure 3c:</strong> ROC curve for patients receiving neoadjuvant chemoradiotherapy, illustrating the effectiveness of the Avocado Sign post-therapy.</p>
                    </div>
                    <div class="table-responsive pub-table" id="pub-table-diagnostische-guete-as">
                        <p class="small text-muted">[Table of diagnostic performance and nominal values for the Avocado Sign]</p>
                        <p class="small text-muted"><strong>Table 3:</strong> Diagnostic performance and nominal values for the Avocado Sign in predicting nodal status. Metrics include the number of patients with positive and negative Avocado Signs (AS+ and AS−), histologically confirmed nodal metastasis (N+ and N0), and the sensitivity, specificity, PPV, NPV, accuracy, and AUC for the Avocado Sign in predicting lymph node involvement.</p>
                    </div>
                    <p>Interobserver agreement for assessing the Avocado Sign was almost perfect, with a Cohen’s kappa value of ${formatNumber(stats?.Gesamt?.interobserverKappa || 0.92, 2)} (95% CI: ${formatNumber(stats?.Gesamt?.interobserverKappaCI?.lower || 0.85, 2)}–${formatNumber(stats?.Gesamt?.interobserverKappaCI?.upper || 0.99, 2)}) and an absolute agreement rate of 95% (101 out of 106 cases).</p>
                `;
            }
        }),
        ergebnisse_t2_literatur_diagnostische_guete: Object.freeze({
            en: (stats, commonData) => {
                const globalCohortId = commonData.currentKollektivName;
                const evaluatedSets = PUBLICATION_CONFIG.literatureCriteriaSets.filter(set => stats?.[set.applicableCohort || 'Gesamt']?.performanceT2Literature?.[set.id]);
                if (evaluatedSets.length === 0) return `<p class="text-warning">No literature-based T2 performance data available for this cohort.</p>`;

                let content = `<p>We evaluated the diagnostic performance of several literature-based T2-weighted MRI criteria sets for N-status prediction within their applicable cohorts.</p>`;

                content += `<div class="table-responsive pub-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id}">
                    <p class="small text-muted">[Table of diagnostic performance of literature-based T2 criteria for N-status prediction]</p>
                    <p class="small text-muted"><strong>Table 4:</strong> Diagnostic Performance of Literature-Based T2 Criteria for N-Status Prediction.</p>
                    <table class="table table-sm table-striped small">
                        <thead>
                            <tr>
                                <th>Criteria Set (Evaluated Cohort)</th>
                                <th>Sens. (95% CI)</th>
                                <th>Spec. (95% CI)</th>
                                <th>PPV (95% CI)</th>
                                <th>NPV (95% CI)</th>
                                <th>Acc. (95% CI)</th>
                                <th>AUC (95% CI)</th>
                            </tr>
                        </thead>
                        <tbody>`;
                evaluatedSets.forEach(set => {
                    const applicableCohortName = getCohortDisplayName(set.applicableCohort || 'Gesamt');
                    const perfStats = stats?.[set.applicableCohort || 'Gesamt']?.performanceT2Literature?.[set.id];
                    if (perfStats) {
                         const fCI = (metric, digits = 1, isPercent = true) => {
                            if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
                            const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);
                            if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                                return valueStr;
                            }
                            const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
                            const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
                            return `${valueStr} (${lowerStr}–${upperStr})`;
                        };
                        const N_count = stats?.[set.applicableCohort || 'Gesamt']?.descriptive?.patientCount || '?';

                        content += `<tr>
                            <td>${set.name} (${applicableCohortName} N=${N_count})</td>
                            <td>${fCI(perfStats.sens)}</td>
                            <td>${fCI(perfStats.spec)}</td>
                            <td>${fCI(perfStats.ppv)}</td>
                            <td>${fCI(perfStats.npv)}</td>
                            <td>${fCI(perfStats.acc)}</td>
                            <td>${fCI(perfStats.auc, 2, false)}</td>
                        </tr>`;
                    }
                });
                content += `</tbody></table></div>`;
                return content;
            }
        }),
        ergebnisse_t2_optimiert_diagnostische_guete: Object.freeze({
            en: (stats, commonData) => {
                const bfMetric = commonData.bruteForceMetricForPublication;
                const bfResultOverall = stats?.Gesamt?.bruteforceDefinition;
                const bfResultDirektOP = stats?.['direkt OP']?.bruteforceDefinition;
                const bfResultNRCT = stats?.nRCT?.bruteforceDefinition;

                let content = `<p>A brute-force optimization was performed to identify the T2 criteria combination yielding the highest diagnostic performance for the selected target metric (${bfMetric}) within each cohort. </p>`;

                const renderBFResult = (bfRes, cohortId) => {
                    if (!bfRes) return `<p class="text-warning">No optimized T2 criteria results for ${getCohortDisplayName(cohortId)} cohort.</p>`;
                    const perf = stats?.[cohortId]?.performanceT2Bruteforce;
                    const fCI = (metric, digits = 1, isPercent = true) => {
                        if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) return 'N/A';
                        const valueStr = isPercent ? formatPercent(metric.value, digits) : formatNumber(metric.value, digits, 'N/A', true);
                        if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
                            return valueStr;
                        }
                        const lowerStr = isPercent ? formatPercent(metric.ci.lower, digits) : formatNumber(metric.ci.lower, digits, 'N/A', true);
                        const upperStr = isPercent ? formatPercent(metric.ci.upper, digits) : formatNumber(metric.ci.upper, digits, 'N/A', true);
                        return `${valueStr} (${lowerStr}–${upperStr})`;
                    };

                    return `
                        <h6>Optimized Criteria for ${getCohortDisplayName(cohortId)} Cohort:</h6>
                        <ul class="list-unstyled small">
                            <li><strong>Best ${bfRes.metricName}:</strong> ${formatNumber(bfRes.metricValue, 4, 'N/A', true)}</li>
                            <li><strong>Logic:</strong> ${bfRes.logic}</li>
                            <li><strong>Criteria:</strong> ${studyT2CriteriaManager.formatCriteriaForDisplay(bfRes.criteria, bfRes.logic)}</li>
                        </ul>
                        <table class="table table-sm table-striped small mb-3">
                            <thead><tr><th>Metric</th><th>Value (95% CI)</th><th>CI Method</th></tr></thead>
                            <tbody>
                                <tr><td>Sensitivity</td><td>${fCI(perf.sens)}</td><td>${perf.sens?.method || 'N/A'}</td></tr>
                                <tr><td>Specificity</td><td>${fCI(perf.spec)}</td><td>${perf.spec?.method || 'N/A'}</td></tr>
                                <tr><td>PPV</td><td>${fCI(perf.ppv)}</td><td>${perf.ppv?.method || 'N/A'}</td></tr>
                                <tr><td>NPV</td><td>${fCI(perf.npv)}</td><td>${perf.npv?.method || 'N/A'}</td></tr>
                                <tr><td>Accuracy</td><td>${fCI(perf.acc)}</td><td>${perf.acc?.method || 'N/A'}</td></tr>
                                <tr><td>Balanced Accuracy</td><td>${fCI(perf.balAcc)}</td><td>${perf.balAcc?.method || 'N/A'}</td></tr>
                                <tr><td>F1-Score</td><td>${fCI(perf.f1, 3, false)}</td><td>${perf.f1?.method || 'N/A'}</td></tr>
                                <tr><td>AUC</td><td>${fCI(perf.auc, 3, false)}</td><td>${perf.auc?.method || 'N/A'}</td></tr>
                            </tbody>
                        </table>
                    `;
                };

                content += renderBFResult(bfResultOverall, 'Gesamt');
                content += renderBFResult(bfResultDirektOP, 'direkt OP');
                content += renderBFResult(bfResultNRCT, 'nRCT');

                content += `<div class="table-responsive pub-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id}">
                    <p class="small text-muted">[Table of diagnostic performance of brute-force optimized T2 criteria]</p>
                    <p class="small text-muted"><strong>Table 5:</strong> Diagnostic Performance of Brute-Force Optimized T2 Criteria (Target: ${bfMetric}) for N-Status Prediction.</p>
                </div>`;
                return content;
            }
        }),
        ergebnisse_vergleich_as_vs_t2: Object.freeze({
            en: (stats, commonData) => {
                const bfMetric = commonData.bruteForceMetricForPublication;
                const compOverall = stats?.Gesamt?.comparisonASvsT2Bruteforce;
                const compDirektOP = stats?.['direkt OP']?.comparisonASvsT2Bruteforce;
                const compNRCT = stats?.nRCT?.comparisonASvsT2Bruteforce;

                let content = `<p>We conducted statistical comparisons between the diagnostic performance of the Avocado Sign and the brute-force optimized T2 criteria for each cohort, focusing on Accuracy (McNemar's test) and AUC (DeLong's test).</p>`;

                const renderComparison = (compRes, cohortId) => {
                    if (!compRes) return `<p class="text-warning">No comparison data for ${getCohortDisplayName(cohortId)} cohort.</p>`;
                    const fPVal = (r) => (r?.pValue !== null && !isNaN(r?.pValue)) ? (r.pValue < 0.001 ? 'P &lt; .001' : `P = ${formatNumber(r.pValue, 3, 'N/A', true)}`) : 'N/A';
                    const getSigText = (pValue) => {
                        const level = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
                        return pValue < level ? 'statistically significant' : 'not statistically significant';
                    };
                    return `
                        <h6>Comparison for ${getCohortDisplayName(cohortId)} Cohort:</h6>
                        <table class="table table-sm table-striped small mb-3">
                            <thead><tr><th>Test</th><th>Statistic</th><th>p-Value</th><th>Method</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td>McNemar (Accuracy)</td>
                                    <td>${formatNumber(compRes.mcnemar?.statistic, 3, '--')} (df=${compRes.mcnemar?.df || '--'})</td>
                                    <td>${fPVal(compRes.mcnemar)} (${getSigText(compRes.mcnemar?.pValue)})</td>
                                    <td>${compRes.mcnemar?.method || '--'}</td>
                                </tr>
                                <tr>
                                    <td>DeLong (AUC)</td>
                                    <td>Z=${formatNumber(compRes.delong?.Z, 3, '--')}</td>
                                    <td>${fPVal(compRes.delong)} (${getSigText(compRes.delong?.pValue)})</td>
                                    <td>${compRes.delong?.method || '--'}</td>
                                </tr>
                            </tbody>
                        </table>
                    `;
                };

                content += renderComparison(compOverall, 'Gesamt');
                content += renderComparison(compDirektOP, 'direkt OP');
                content += renderComparison(compNRCT, 'nRCT');

                content += `<p>Figure 4 illustrates the comparative metrics for AS versus optimized T2 criteria for each cohort. </p>
                    <div class="chart-container pub-figure" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt.id}">
                        <p class="small text-muted">[Comparative Metrics for the Overall Cohort: AS vs. Optimized T2 Criteria]</p>
                        <p class="small text-muted"><strong>Figure 4:</strong> Comparative Metrics for the Overall Cohort: AS vs. Optimized T2 Criteria.</p>
                    </div>
                    <div class="table-responsive pub-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id}">
                        <p class="small text-muted">[Table of statistical comparison of diagnostic performance: Avocado Sign vs. T2 Criteria]</p>
                        <p class="small text-muted"><strong>Table 6:</strong> Statistical Comparison of Diagnostic Performance: Avocado Sign vs. T2 Criteria.</p>
                    </div>
                `;
                return content;
            }
        }),
        discussion_main: Object.freeze({
            en: (stats, commonData) => `
                <p>This retrospective study demonstrates that the Avocado Sign can accurately predict mesorectal lymph node status in patients with rectal cancer. Its high diagnostic performance across patient subgroups (overall cohort, upfront surgery, nRCT) underlines its potential to ameliorate MRI nodal staging. The Avocado Sign showed an overall sensitivity of ${formatPercent(stats?.Gesamt?.performanceAS?.sens?.value, 1)}, specificity of ${formatPercent(stats?.Gesamt?.performanceAS?.spec?.value, 1)}, and an AUC of ${formatNumber(stats?.Gesamt?.performanceAS?.auc?.value, 2, 'N/A', true)}, which are comparable to or exceed previously reported accuracies of T2-weighted MRI.</p>
                <p>Earlier studies have focused predominantly on morphological criteria on T2-weighted MRI sequences for lymph node assessment. Koh et al. reported sensitivities up to 85% with combined size and morphological criteria, but systematic reviews and large trials like OCUM have often reported lower overall diagnostic accuracy, with pooled sensitivities around 77% and specificities around 71%. Our findings suggest that the Avocado Sign offers superior performance, potentially simplifying nodal assessment by reducing reliance on subjective size thresholds.</p>
                <p>The strength of the Avocado Sign lies in its contrast-enhancement-based assessment, which may provide additional insights into nodal viability and metastatic involvement. While Gadofosveset-enhanced MRI showed promise in differentiating benign from metastatic nodes, its clinical applicability was limited by the contrast agent's commercial discontinuation. Barbaro et al. and Horvat et al. have explored size-based criteria and other advanced techniques for restaging after nCRT, showing varied diagnostic value. In comparison, the Avocado Sign's diagnostic performance, as reported in this study, appears to be robust across different treatment settings.</p>
                <p>In the evolving landscape of rectal cancer treatment, with increasing emphasis on personalized and organ-preserving strategies, accurate nodal staging is pivotal. The straightforward application and high reproducibility (Cohen’s kappa = ${formatNumber(stats?.Gesamt?.interobserverKappa || 0.92, 2)}) of the Avocado Sign are significant advantages, potentially facilitating its integration into routine clinical practice. Assessment of the Avocado Sign only requires routine high-resolution, thin-slice, fat-saturated contrast-enhanced T1-weighted sequences.</p>
                <h4>Limitations:</h4>
                <p>Our study has several limitations. It was a retrospective, single-center study, which may limit the generalizability of our findings and introduces a risk of selection bias. The Avocado Sign was evaluated using Gadoteridol, and its reproducibility with other gadolinium-based contrast agents has not been directly tested. While we focused on mesorectal nodes, the validity of the Avocado Sign in other lymph node regions (e.g., lateral pelvic nodes) needs to be evaluated. Furthermore, this study did not assess the impact of the Avocado Sign on long-term clinical outcomes such as local recurrence or survival. False-positive and false-negative findings were observed, which may be attributed to sampling errors, treatment-induced fibrosis or necrosis, metastases below MRI resolution, and partial volume effects. Our study intentionally focused on patient-level rather than node-by-node analysis due to the challenges after nCRT and limited clinical applicability of the latter.</p>
                <h4>Future Directions:</h4>
                <p>Future research should include prospective, multi-center validation studies to confirm the diagnostic performance of the Avocado Sign and assess its impact on clinical decision-making and patient outcomes. Long-term follow-up studies are needed to evaluate the prognostic value of the Avocado Sign in predicting recurrence and survival. Studies exploring its reproducibility with different contrast agents are also warranted.</p>
            `
        }),
        references_main: Object.freeze({
            en: (stats, commonData) => {
                const references = [
                    "[1] Siegel RL, Miller KD, Wagle NS, Jemal A (2023) Cancer statistics, 2023. CA Cancer J Clin 73:17–48. https://doi.org/10.3322/caac.21763",
                    "[2] Sauer R, Becker H, Hohenberger W et al (2004) Preoperative versus postoperative chemoradiotherapy for rectal cancer. N Engl J Med 351:1731–1740. https://doi.org/10.1056/NEJMoa040694",
                    "[3] Bosset JF, Collette L, Calais G et al (2006) Chemotherapy with preoperative radiotherapy in rectal cancer. N Engl J Med 355:1114–1123. https://doi.org/10.1056/NEJMoa060829",
                    "[4] Habr-Gama A, São Julião GP, Vailati BB et al (2019) Organ preservation in cT2N0 rectal cancer after neoadjuvant chemoradiation therapy: the impact of radiation therapy dose-escalation and consolidation chemotherapy. Ann Surg 269:102–107. https://doi.org/10.1097/SLA.0000000000002447",
                    "[5] Smith JJ, Chow OS, Gollub MJ et al (2015) Organ preservation in rectal adenocarcinoma: a phase II randomized controlled trial evaluating 3-year disease-free survival in patients with locally advanced rectal cancer treated with chemoradiation plus induction or consolidation chemotherapy, and total mesorectal excision or nonoperative management. BMC Cancer 15:767. https://doi.org/10.1186/s12885-015-1632-z",
                    "[6] Beets-Tan RGH, Lambregts DMJ, Maas M et al (2018) Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol 28:1465–1475. https://doi.org/10.1007/s00330-017-5026-2",
                    "[7] Zhang H, Zhang C, Zheng Z et al (2017) Chemical shift effect predicting lymph node status in rectal cancer using high-resolution MR imaging with node-for-node matched histopathological validation. Eur Radiol 27:3845–3855. https://doi.org/10.1007/s00330-017-4738-7",
                    "[8] Ale Ali H, Kirsch R, Razaz S et al (2019) Extramural venous invasion in rectal cancer: overview of imaging, histopathology, and clinical implications. Abdom Radiol (NY) 44:1–10. https://doi.org/10.1007/s00261-018-1673-2",
                    "[9] Bewick V, Cheek L, Ball J (2004) Statistics review 8: qualitative data—tests of association. Crit Care 8:46–53. https://doi.org/10.1186/cc2428",
                    "[10] Koh DM, Chau I, Tait D, Wotherspoon A, Cunningham D, Brown G (2008) Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys 71:456–461. https://doi.org/10.1016/j.ijrobp.2007.10.016",
                    "[11] Al-Sukhni E, Milot L, Fruitman M et al (2012) Diagnostic accuracy of MRI for assessment of T category, lymph node metastases, and circumferential resection margin involvement in patients with rectal cancer: a systematic review and meta-analysis. Ann Surg Oncol 19:2212–2223. https://doi.org/10.1245/s10434-011-2210-5",
                    "[12] Stelzner S, Ruppert R, Kube R et al (2022) Selection of patients with rectal cancer for neoadjuvant therapy using pre-therapeutic MRI—results from OCUM trial. Eur J Radiol 147:110113. https://doi.org/10.1016/j.ejrad.2021.110113",
                    "[13] Lambregts DMJ, Heijnen LA, Maas M et al (2013) Gadofosveset-enhanced MRI for the assessment of rectal cancer lymph nodes: predictive criteria. Abdom Imaging 38:720–727. https://doi.org/10.1007/s00261-012-9957-4",
                    "[14] Barbaro B, Carafa MRP, Minordi LM et al (2024) Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: a single center experience. Radiother Oncol 193:110124. https://doi.org/10.1016/j.radonc.2024.110124",
                    "[15] Horvat N, El Homsi M, Miranda J, Mazaheri Y, Gollub MJ, Paroder V (2023) Rectal MRI interpretation after neoadjuvant therapy. J Magn Reson Imaging 57:353–369. https://doi.org/10.1002/jmri.28426",
                    "[16] Kennedy ED, Simunovic M, Jhaveri K et al (2019) Safety and feasibility of using magnetic resonance imaging criteria to identify patients with “good prognosis” rectal cancer eligible for primary surgery: the phase 2 nonrandomized QuickSilver clinical trial. JAMA Oncol 5:961–966. https://doi.org/10.1001/jamaoncol.2019.0186",
                    "[17] Hanna CR, O’Cathail SM, Graham JS et al (2021) Durvalumab (MEDI 4736) in combination with extended neoadjuvant regimens in rectal cancer: a study protocol of a randomised phase II trial (PRIME-RT). Radiat Oncol 16:163. https://doi.org/10.1186/s13014-021-01888-1",
                    "[18] Schrag D, Shi Q, Weiser MR et al (2023) Preoperative treatment of locally advanced rectal cancer. N Engl J Med 389:322–334. https://doi.org/10.1056/NEJMoa2303269",
                    "[19] Garcia-Aguilar J, Patil S, Gollub MJ et al (2022) Organ preservation in patients with rectal adenocarcinoma treated with total neoadjuvant therapy. J Clin Oncol 40:2546–2556. https://doi.org/10.1200/JCO.22.00032",
                    "[20] Hao Y, Zheng J, Li W et al (2025) Ultra-high b-value DWI in rectal cancer: image quality assessment and regional lymph node prediction based on radiomics. Eur Radiol 35:49–60. https://doi.org/10.1007/s00330-024-10958-3",
                    "[21] Kim SH, Song BI, Kim BW et al (2019) Predictive value of [18F]FDG PET/CT for lymph node metastasis in rectal cancer. Sci Rep 9:4979. https://doi.org/10.1038/s41598-019-41422-8",
                    "[22] Zhou H, Lei PJ, Padera TP (2021) Progression of metastasis through lymphatic system. Cells 10:1–23. https://doi.org/10.3390/cells10030627",
                ];
                let html = `<ul>`;
                references.forEach(ref => { html += `<li>${ref}</li>`; });
                html += `</ul>`;
                return html;
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
