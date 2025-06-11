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
    APP_VERSION: "3.0.0",
    DEFAULT_SETTINGS: Object.freeze({
        KOLLEKTIV: 'Gesamt',
        T2_LOGIC: 'AND',
        DATEN_TABLE_SORT: Object.freeze({ key: 'id', direction: 'asc', subKey: null }),
        AUSWERTUNG_TABLE_SORT: Object.freeze({ key: 'id', direction: 'asc', subKey: null }),
        STATS_LAYOUT: 'einzel',
        STATS_KOLLEKTIV1: 'Gesamt',
        STATS_KOLLEKTIV2: 'neoadjuvantTherapy',
        PRESENTATION_VIEW: 'as-vs-t2',
        PRESENTATION_STUDY_ID: 'applied_criteria',
        PUBLICATION_SECTION: 'abstract_main',
        PUBLICATION_BRUTE_FORCE_METRIC: 'Balanced Accuracy',
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
            PUBLICATION_SECTION_MD: 'Publication_Section_{SectionName}_MD',
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
            for(let i=0;i<3;i++){for(let j=0;j<3;j++){if((i+j)%2===0){svgContent+=`<rect x="${sqPos+i*pSize+pSize/2}" y="${sqPos+j*pSize+pSize/2}" width="${pSize}" height="${pSize}" fill="${iconColor}" stroke="none" style="opacity:0.6;"/>`;}}}
            return svgContent;
        },
        SIGNAL_LOWSIGNAL: (s, sw, iconColor, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="#555555" stroke="rgba(0,0,0,0.1)" stroke-width="${sw * 0.75}"/>`,
        SIGNAL_INTERMEDIATESIGNAL: (s, sw, iconColor, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="#aaaaaa" stroke="rgba(0,0,0,0.1)" stroke-width="${sw * 0.75}"/>`,
        SIGNAL_HIGHSIGNAL: (s, sw, iconColor, c, r, sq, sqPos) => `<circle cx="${c}" cy="${c}" r="${r}" fill="#f0f0f0" stroke="#333333" stroke-width="${sw * 0.75}"/>`,
        UNKNOWN: (s, sw, iconColor, c, r, sq, sqPos) => `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" stroke-dasharray="2 2" /><line x1="${sqPos}" y1="${sqPos}" x2="${sqPos+sq}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/><line x1="${sqPos+sq}" y1="${sqPos}" x2="${sqPos}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`
    }),
    UI_TEXTS: Object.freeze({
        cohortDisplayNames: {
            'Gesamt': 'Overall',
            'surgeryAlone': 'Upfront Surgery',
            'neoadjuvantTherapy': 'nRCT'
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
            surgeryAlone: 'Upfront Surgery',
            neoadjuvantTherapy: 'nRCT',
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
                collapseAll: "Collapse all detail views of T2-weighted lymph node features.",
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
                collapseAll: "Collapse all detail views of the evaluated T2-weighted lymph nodes and the fulfilled criteria.",
                expandRow: "Click here or the arrow button to show/hide the detailed evaluation of this patient's individual T2-weighted lymph nodes according to the currently applied criteria. Fulfilled positive criteria are highlighted."
            },
            t2Logic: { description: "Logical operator for active T2 criteria: <strong>AND</strong> (A lymph node is positive only if ALL active criteria are met). <strong>OR</strong> (A lymph node is positive if AT LEAST ONE active criterion is met). The choice affects the T2 status calculation." },
            t2Size: { description: "Size criterion (short axis): Lymph nodes with a diameter <strong>greater than or equal to (≥)</strong> the set threshold are considered suspicious. Adjustable range: [MIN] - [MAX] mm (step: [STEP] mm). Enable/disable with checkbox." },
            t2Shape: { description: "Shape criterion: Select which shape ('round' or 'oval') is considered suspicious. Enable/disable with checkbox." },
            t2Border: { description: "Border criterion: Select which border ('sharp' or 'irregular') is considered suspicious. Enable/disable with checkbox." },
            t2Homogeneity: { description: "Homogeneity criterion: Select whether 'homogeneous' or 'heterogeneous' internal signal on T2w is considered suspicious. Enable/disable with checkbox." },
            t2Signal: { description: "Signal criterion: Select which T2 signal intensity ('low', 'intermediate', or 'high') relative to surrounding muscle is considered suspicious. Nodes with non-assessable signal (value 'null') never fulfill this criterion. Enable/disable with checkbox." },
            t2Actions: {
                reset: "Resets the logic and all criteria to their default settings. The changes are not yet applied.",
                apply: "Apply the currently set T2 criteria and logic to the entire dataset. This updates the T2 columns in the tables, all statistical analyses, and charts. The setting is also saved for future sessions."
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
                cardTitle: "Demographics, clinical data, and baseline lymph node counts for cohort <strong>[COHORT]</strong>. All CIs are 95% CIs.",
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
                description: "Allows exporting analysis results, tables, and charts based on the currently selected global cohort ([COHORT]) and the currently applied T2 criteria.",
                statscsv: { description: "Detailed table of all calculated statistical metrics (descriptive, AS & T2 performance, comparisons, associations) from the Statistics tab as a CSV file.", type: 'STATS_CSV', ext: "csv" },
                bruteforcetxt: { description: "Detailed report of the last brute-force optimization for the current cohort (Top 10 results, configuration) as a text file (.txt), if performed.", type: 'BRUTEFORCE_TXT', ext: "txt" },
                datatablemd: { description: "Current data list (Data tab) as a Markdown table (.md).", type: 'DATEN_MD', ext: "md" },
                analysistablemd: { description: "Current analysis table (Analysis tab, incl. T2 results) as a Markdown (.md) file.", type: 'AUSWERTUNG_MD', ext: "md" },
                filtereddatacsv: { description: "Raw data of the currently selected cohort (incl. T2 evaluation) as a CSV file (.csv).", type: 'FILTERED_DATA_CSV', ext: "csv" },
                comprehensivereporthtml: { description: "Comprehensive analysis report as an HTML file (statistics, configurations, charts), printable.", type: 'COMPREHENSIVE_REPORT_HTML', ext: "html" },
                allzip: { description: "All available single files (Statistics CSV, BruteForce TXT, all MDs, Raw Data CSV, HTML Report) in one ZIP archive.", type: 'ALL_ZIP', ext: "zip"},
                csvzip: { description: "All available CSV files (Statistics, Raw Data) in one ZIP archive.", type: 'CSV_ZIP', ext: "zip"},
                mdzip: { description: "All available Markdown files (Descriptive, Data, Analysis, Publication Texts) in one ZIP archive.", type: 'MD_ZIP', ext: "zip"},
                pngzip: { description: "All currently visible charts (Statistics, Analysis, Presentation) and selected tables as individual PNG files (ZIP archive).", type: 'PNG_ZIP', ext: "zip" },
                svgzip: { description: "All currently visible charts (Statistics, Analysis, Presentation) as individual SVG files (ZIP archive).", type: 'SVG_ZIP', ext: "zip"}
            }
        })
    })
});

const PUBLICATION_CONFIG = Object.freeze({
    sections: Object.freeze([
        { id: 'abstract_main', labelKey: 'abstract_main', subSections: [{ id: 'abstract_main', label: 'Abstract' }] },
        { id: 'introduction_main', labelKey: 'introduction_main', subSections: [{ id: 'introduction_main', label: 'Introduction' }] },
        {
            id: 'methoden_main', labelKey: 'methoden_main',
            subSections: Object.freeze([
                { id: 'methoden_studienanlage_ethik', label: 'Study Design and Patients' },
                { id: 'methoden_mrt_protokoll_akquisition', label: 'MRI Protocol and Acquisition' },
                { id: 'methoden_bildanalyse_avocado_sign', label: 'Image Analysis: Avocado Sign' },
                { id: 'methoden_bildanalyse_t2_kriterien', label: 'Image Analysis: T2 Criteria' },
                { id: 'methoden_referenzstandard_histopathologie', label: 'Reference Standard: Histopathology' },
                { id: 'methoden_statistische_analyse_methoden', label: 'Statistical Analysis' }
            ])
        },
        {
            id: 'ergebnisse_main', labelKey: 'ergebnisse_main',
            subSections: Object.freeze([
                { id: 'ergebnisse_patientencharakteristika', label: 'Patient Characteristics' },
                { id: 'ergebnisse_as_diagnostische_guete', label: 'Diagnostic Performance of the Avocado Sign' },
                { id: 'ergebnisse_t2_literatur_diagnostische_guete', label: 'Diagnostic Performance of Literature-Based T2 Criteria' },
                { id: 'ergebnisse_t2_optimiert_diagnostische_guete', label: 'Diagnostic Performance of Cohort-Optimized T2 Criteria' },
                { id: 'ergebnisse_vergleich_as_vs_t2', label: 'Comparison: Avocado Sign vs. T2 Criteria' }
            ])
        },
        { id: 'discussion_main', labelKey: 'discussion_main', subSections: [{ id: 'discussion_main', label: 'Discussion' }] },
        { id: 'references_main', labelKey: 'references_main', subSections: [{ id: 'references_main', label: 'References' }] }
    ]),
    bruteForceMetricsForPublication: Object.freeze([
        { value: 'Balanced Accuracy', label: 'Balanced Accuracy' },
        { value: 'Accuracy', label: 'Accuracy' },
        { value: 'F1-Score', label: 'F1-Score' },
        { value: 'PPV', label: 'PPV' },
        { value: 'NPV', label: 'NPV' }
    ]),
    literatureCriteriaSets: Object.freeze([
        {
            id: 'rutegard_et_al_esgar',
            name: 'ESGAR 2016 (Rutegård et al. 2025)',
            displayShortName: 'ESGAR 2016',
            applicableCohort: 'Gesamt',
            logic: 'KOMBINIERT',
            criteria: Object.freeze({
                size: { active: true, threshold: 9.0, condition: '>=' },
                shape: { active: true, value: 'round' },
                border: { active: true, value: 'irregular' },
                homogeneity: { active: true, value: 'heterogeneous' },
                signal: { active: false, value: null }
            }),
            studyInfo: Object.freeze({
                reference: 'Rutegård et al. (2025)',
                patientCohort: '46 rectal cancer patients (anatomically matched nodal structures)',
                investigationType: 'Prospective study of baseline MRI',
                focus: 'Evaluation of 2016 ESGAR consensus criteria for malignancy',
                keyCriteriaSummary: 'Short axis ≥ 9 mm; OR short axis 5–8 mm and ≥2 suspicious features (round, irregular, heterogeneous); OR short axis < 5 mm and all 3 suspicious features.'
            })
        },
        {
            id: 'koh_2008',
            name: 'Koh et al. (2008)',
            displayShortName: 'Koh 2008',
            applicableCohort: 'Gesamt',
            logic: 'OR',
            criteria: Object.freeze({
                size: { active: false, threshold: 5.0, condition: '>=' },
                shape: { active: false, value: null },
                border: { active: true, value: 'irregular' },
                homogeneity: { active: true, value: 'heterogeneous' },
                signal: { active: false, value: null }
            }),
            studyInfo: Object.freeze({
                reference: 'Koh et al. (2008)',
                patientCohort: '25 patients (pre/post nCRT)',
                investigationType: 'Prospective study',
                focus: 'Evaluating mesorectal lymph nodes before and after nCRT using thin-section T2w MRI. Criteria based on morphology.',
                keyCriteriaSummary: 'Irregular outlines OR internal signal heterogeneity.'
            })
        },
        {
            id: 'barbaro_2024',
            name: 'Barbaro et al. (2024)',
            displayShortName: 'Barbaro 2024',
            applicableCohort: 'neoadjuvantTherapy',
            logic: 'AND',
            criteria: Object.freeze({
                size: { active: true, threshold: 2.3, condition: '>=' },
                shape: { active: false, value: null },
                border: { active: false, value: null },
                homogeneity: { active: false, value: null },
                signal: { active: false, value: null }
            }),
            studyInfo: Object.freeze({
                reference: 'Barbaro et al. (2024)',
                patientCohort: '191 LARC patients (restaging after nCRT)',
                investigationType: 'Retrospective, single-center study',
                focus: 'Accuracy of MRI in identifying ypN0 status after nCRT, using short-axis diameter cut-off.',
                keyCriteriaSummary: 'Optimal cut-off for short-axis diameter ≤ 2.2mm (predicting ypN0, so nodes > 2.2mm are positive).'
            })
        }
    ]),
    publicationElements: Object.freeze({
        methoden: {
            literaturT2KriterienTabelle: {
                id: 'table-methods-t2-literature',
                titleEn: 'Table 1. Literature-Based T2-Weighted MRI Criteria for Nodal Malignancy'
            }
        },
        ergebnisse: {
            patientenCharakteristikaTabelle: {
                id: 'table-results-patient-char',
                titleEn: 'Table 2. Patient Demographics and Treatment Approaches'
            },
            diagnostischeGueteASTabelle: {
                id: 'table-results-as-performance',
                titleEn: 'Table 3. Diagnostic Performance and Nominal Values for the Avocado Sign in Predicting Nodal Status'
            },
            diagnostischeGueteOptimierteT2Tabelle: {
                id: 'table-results-optimized-t2-performance',
                titleEn: 'Table 4. Diagnostic Performance of Cohort-Optimized T2-Weighted Criteria by Target Metric ({BF_METRIC})'
            },
            vergleichASvsT2Tabelle: {
                id: 'table-results-comparison-as-t2',
                titleEn: 'Table 5. Statistical Comparison of Diagnostic Performance (Avocado Sign vs. Optimized T2 Criteria)'
            },
            rocKurveOverall: {
                id: 'fig-results-roc-overall',
                titleEn: 'Figure 1. ROC Curve for the Avocado Sign in the Overall Cohort'
            },
            rocKurveSurgeryAlone: {
                id: 'fig-results-roc-surgery-alone',
                titleEn: 'Figure 2. ROC Curve for the Avocado Sign in the Upfront Surgery Cohort'
            },
            rocKurveNRCT: {
                id: 'fig-results-roc-nrcT',
                titleEn: 'Figure 3. ROC Curve for the Avocado Sign in the nRCT Cohort'
            },
            asVsT2ComparisonChart: {
                id: 'fig-results-as-t2-comparison',
                titleEn: 'Figure 4. Comparison of Key Diagnostic Metrics: Avocado Sign vs. Cohort-Optimized T2 Criteria'
            }
        }
    })
});

function getDefaultT2Criteria() {
    return DEFAULT_T2_CRITERIA;
}
