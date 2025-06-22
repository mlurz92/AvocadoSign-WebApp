window.methodsGenerator = (() => {

    function generateStudyDesignHTML(stats, commonData) {
        const { nOverall, nNeoadjuvantTherapy, nSurgeryAlone } = commonData || {};
        const helpers = window.publicationHelpers;

        if (nOverall === undefined || nNeoadjuvantTherapy === undefined || nSurgeryAlone === undefined) {
            return '<h3 id="methoden_studienanlage_ethik">Study Design and Patients</h3><p class="text-warning">Patient cohort data is missing.</p>';
        }

        const regulatoryStatement = window.APP_CONFIG.UI_TEXTS.PUBLICATION_TEXTS.MIM_REGULATORY_STATEMENT;

        return `
            <h3 id="methoden_studienanlage_ethik">Study Design and Patients</h3>
            <p>${regulatoryStatement} We analyzed a previously described cohort of ${helpers.formatValueForPublication(nOverall, 0)} consecutive patients with histologically confirmed rectal cancer who underwent pelvic MRI for primary staging or restaging between January 2020 and November 2023 ${helpers.getReference('Lurz_Schaefer_2025')}.</p>
            <p>While the patient cohort is identical to that of the initial study, the present study is based on a new, fully blinded re-evaluation of all imaging data to prevent recall bias and ensure a methodologically sound comparison. Inclusion criteria were the availability of high-quality T2-weighted and contrast-enhanced T1-weighted MRI sequences and a definitive histopathological reference standard from the subsequent total mesorectal excision specimen. Of the final cohort, ${helpers.formatValueForPublication(nSurgeryAlone, 0)} (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 0, true)}%) underwent primary surgery, and ${helpers.formatValueForPublication(nNeoadjuvantTherapy, 0)} (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 0, true)}%) received neoadjuvant chemoradiotherapy followed by restaging MRI prior to surgery.</p>
        `;
    }

    function generateMriProtocolAndImageAnalysisHTML(stats, commonData) {
        const helpers = window.publicationHelpers;
        return `
            <h3 id="methoden_mrt_protokoll_akquisition">MRI Protocol and Image Analysis</h3>
            <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers) with a phased-array body coil. To minimize bowel peristalsis, butylscopolamine was administered intravenously. The standardized protocol included high-resolution, multiplanar T2-weighted turbo spin-echo sequences and an axial diffusion-weighted sequence. Following the intravenous administration of a weight-based dose (0.2 mL/kg) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco), a fat-suppressed, T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence was acquired. Key imaging parameters for the axial T2-weighted sequence were: repetition time 4400 msec, echo time 81 msec, slice thickness 2 mm. For the post-contrast VIBE sequence, parameters included: repetition time 5.8 msec, echo time 2.5/3.7 msec, slice thickness 1.5 mm.</p>
            <p>Two board-certified radiologists (M.L. and A.S., with 7 and 29 years of experience in abdominal MRI, respectively), who were blinded to the histopathological outcomes and each other's findings, independently reviewed all MRI studies. To minimize recall bias and intra-reader variability, the T2-weighted sequences were evaluated in a separate reading session at least four weeks prior to the assessment of the contrast-enhanced sequences. Any discrepancies in final patient-level assessment were resolved by consensus with a third radiologist with 19 years of experience.</p>
            <p><strong>Avocado Sign (AS) Assessment:</strong> On the contrast-enhanced T1-weighted VIBE images, all visible mesorectal lymph nodes were assessed for the presence of the Avocado Sign, defined as a distinct hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape (Fig 2) ${helpers.getReference('Lurz_Schaefer_2025')}. No minimum size threshold was applied. A patient was classified as AS-positive if at least one such node was identified.</p>
            <p><strong>T2-weighted (T2w) Criteria Assessment:</strong> The same radiologists evaluated the T2w images for five standard morphological features: size (short-axis diameter), shape (round vs oval), border (sharp vs irregular), internal homogeneity (homogeneous vs heterogeneous), and signal intensity (low, intermediate, or high relative to muscle). A patient with no visible T2w nodes was considered T2-negative if any T2w criterion was active. This feature set formed the basis for all subsequent comparative analyses.</p>
        `;
    }

    function generateComparativeCriteriaHTML(stats, commonData) {
        const { bruteForceMetricForPublication } = commonData || {};
        const helpers = window.publicationHelpers;

        if (!bruteForceMetricForPublication) {
            return '<h3 id="methoden_vergleichskriterien_t2">Comparative T2w Criteria Sets</h3><p class="text-warning">Brute-force metric for publication is not defined.</p>';
        }

        const table2Config = {
            id: 'table-methods-t2-literature',
            caption: 'Table 2: Literature-Based T2-Weighted MRI Criteria Sets Used for Comparison',
            headers: ['Criteria Set', 'Study', 'Applicable Cohort', 'Key Criteria Summary', 'Logic'],
            rows: []
        };

        const literatureSets = window.PUBLICATION_CONFIG?.literatureCriteriaSets || [];
        literatureSets.forEach(set => {
            if (set && set.studyInfo) {
                table2Config.rows.push([
                    set.name || 'N/A',
                    helpers.getReference(set.studyInfo.refKey) || 'N/A',
                    set.studyInfo.patientCohort || 'N/A',
                    set.studyInfo.keyCriteriaSummary || 'N/A',
                    set.logic === 'KOMBINIERT' ? 'Combined' : set.logic || 'N/A'
                ]);
            }
        });

        return `
            <h3 id="methoden_vergleichskriterien_t2">Comparative T2w Criteria Sets</h3>
            <p>To provide a robust benchmark for the Avocado Sign, we evaluated two distinct types of T2w criteria sets:</p>
            <p><strong>1. Literature-Based Criteria:</strong> We applied three criteria sets from previously published, influential studies to their respective target populations within our cohort (Table 2). These included the complex, size-dependent criteria from the ESGAR consensus group for the surgery-alone cohort, criteria based on morphological features by Koh et al. for the overall cohort, and a size-only criterion for post-nCRT restaging by Barbaro et al. ${helpers.getReference('Rutegard_2025')}${helpers.getReference('Koh_2008')}${helpers.getReference('Barbaro_2024')}.</p>
            ${helpers.createPublicationTableHTML(table2Config)}
            <p><strong>2. Cohort-Optimized Criteria (Brute-Force):</strong> To establish a data-driven "best-case" benchmark for T2w morphology within our specific dataset, we performed a systematic brute-force optimization. A computational algorithm exhaustively tested all combinations of the five T2w features (size, shape, border, homogeneity, signal), their respective values (e.g., size thresholds from 0.1 mm to 25.0 mm in 0.1 mm increments), and the logical operators 'AND' and 'OR' to identify the set that maximized a pre-selected diagnostic metric (${bruteForceMetricForPublication}). This optimization was intentionally performed on the entire respective cohort without a separate hold-out test set to define a data-driven, best-case performance benchmark for T2w criteria specific to our study population, acknowledging the inherent risk of overfitting. The best-performing criteria set for each cohort was used for secondary comparisons against the Avocado Sign.</p>
        `;
    }

    function generateReferenceStandardHTML(stats, commonData) {
        return `
            <h3 id="methoden_referenzstandard_histopathologie">Reference Standard</h3>
            <p>The definitive reference standard for N-status was the histopathological examination of the total mesorectal excision specimens performed by experienced gastrointestinal pathologists. All identified lymph nodes were meticulously dissected and analyzed for the presence of metastatic tumor cells. A patient was classified as N-positive if metastases were found in at least one lymph node.</p>
        `;
    }

    function generateStatisticalAnalysisHTML(stats, commonData) {
        const helpers = window.publicationHelpers;
        const statisticalSignificanceLevel = window.APP_CONFIG?.STATISTICAL_CONSTANTS?.SIGNIFICANCE_LEVEL;
        const nBootstrap = window.APP_CONFIG?.STATISTICAL_CONSTANTS?.BOOTSTRAP_CI_REPLICATIONS;
        const appVersion = window.APP_CONFIG?.APP_VERSION;

        if (!statisticalSignificanceLevel || !nBootstrap || !appVersion) {
            return '<h3 id="methoden_statistische_analyse_methoden">Statistical Analysis</h3><p class="text-warning">Configuration for statistical analysis is missing.</p>';
        }
        
        const methodsText = window.APP_CONFIG.UI_TEXTS.PUBLICATION_TEXTS.STATISTICAL_ANALYSIS_METHODS
            .replace('[N_BOOTSTRAP]', helpers.formatValueForPublication(nBootstrap, 0));
            
        const comparisonText = window.APP_CONFIG.UI_TEXTS.PUBLICATION_TEXTS.STATISTICAL_ANALYSIS_COMPARISON
            .replace('[APP_VERSION]', appVersion)
            .replace('[P_LEVEL]', helpers.formatPValueForPublication(statisticalSignificanceLevel).replace(/<em/g, '').replace(/<\/em>/g, ''));

        return `
            <h3 id="methoden_statistische_analyse_methoden">Statistical Analysis</h3>
            <p>${methodsText}</p>
            <p>${comparisonText}</p>
        `;
    }

    return Object.freeze({
        generateStudyDesignHTML,
        generateMriProtocolAndImageAnalysisHTML,
        generateComparativeCriteriaHTML,
        generateReferenceStandardHTML,
        generateStatisticalAnalysisHTML
    });

})();