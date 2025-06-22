window.resultsGenerator = (() => {

    function generatePatientCharacteristicsHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        const surgeryAloneStats = stats?.[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id];
        const neoadjuvantStats = stats?.[window.APP_CONFIG.COHORTS.NEOADJUVANT.id];

        if (!overallStats?.descriptive || !surgeryAloneStats?.descriptive || !neoadjuvantStats?.descriptive) {
            return '<h3 id="ergebnisse_patientencharakteristika">Patient Characteristics</h3><p class="text-warning">Patient characteristics data is incomplete and could not be generated.</p>';
        }
        
        const helpers = window.publicationHelpers;
        const { nOverall, nSurgeryAlone, nNeoadjuvantTherapy, nPositive } = commonData;
        const descriptiveComparison = stats?.interCohortDemographicComparison;

        const text = `
            <h3 id="ergebnisse_patientencharakteristika">Patient Characteristics</h3>
            <p>The study cohort comprised ${helpers.formatValueForPublication(nOverall, 0)} patients (mean age, ${helpers.formatValueForPublication(overallStats?.descriptive?.age?.mean, 1)} years ± ${helpers.formatValueForPublication(overallStats?.descriptive?.age?.sd, 1)} [standard deviation]; ${overallStats?.descriptive?.sex?.m} men). The process of patient enrollment is detailed in the study flowchart (Fig 1). Of the included patients, ${helpers.formatValueForPublication(nSurgeryAlone, 0)} (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 0, true)}%) underwent primary surgery, and ${helpers.formatValueForPublication(nNeoadjuvantTherapy, 0)} (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 0, true)}%) received neoadjuvant chemoradiotherapy. Overall, ${helpers.formatValueForPublication(nPositive, 0)} of ${nOverall} patients (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%) had histopathologically confirmed lymph node metastases (N-positive). There were no significant differences in age, sex distribution, or the prevalence of N-positive status between the primary surgery and neoadjuvant therapy subgroups. Detailed patient characteristics for the overall cohort and by treatment subgroup are provided in Table 1.</p>
        `;

        const figurePlaceholder = `
            <div class="my-4 p-3 border rounded text-center bg-light" id="figure-1-flowchart-container-wrapper">
                <p class="mb-1 fw-bold">Figure 1: Study Flowchart</p>
                <div id="figure-1-flowchart-container" class="publication-chart-container">
                    <p class="mb-0 text-muted small">[Flowchart showing participant enrollment and cohort allocation will be rendered here.]</p>
                </div>
            </div>
            <div class="my-4 p-3 border rounded bg-light" id="figure-2-examples-container-wrapper">
                <p class="mb-2 fw-bold text-center">Figure 2: MRI Examples of Nodal Assessment</p>
                <div id="figure-2-examples-container" class="publication-chart-container text-start small">
                    <p class="mb-2"><strong>[Instruction for Author: Please insert a 4-panel figure here showing the following:]</strong></p>
                    <ul class="list-unstyled ps-3">
                        <li><strong>Panel A:</strong> Axial T2w image of a morphologically suspicious lymph node (e.g., irregular border).</li>
                        <li><strong>Panel B:</strong> Corresponding axial contrast-enhanced T1w VIBE image showing a positive Avocado Sign in the same node.</li>
                        <li><strong>Panel C:</strong> Axial T2w image of a morphologically inconspicuous lymph node (e.g., small, oval, smooth border).</li>
                        <li><strong>Panel D:</strong> Corresponding axial contrast-enhanced T1w VIBE image demonstrating a positive Avocado Sign in this otherwise unremarkable node.</li>
                    </ul>
                    <hr>
                    <p class="mb-1"><strong>Suggested Figure Legend (Radiology Style):</strong></p>
                    <p class="fst-italic" style="font-size: 9pt; line-height: 1.4;">
                        Figure 2: Images in a [Age]-year-old [man/woman] with histopathologically confirmed N-positive rectal cancer. 
                        <strong>(a)</strong> Axial T2-weighted image shows a mesorectal lymph node (arrow) with an irregular border, a feature suspicious for malignancy. 
                        <strong>(b)</strong> Corresponding axial contrast-enhanced T1-weighted fat-suppressed image demonstrates a distinct hypointense core within the enhancing node (arrow), representing a positive Avocado Sign. 
                        <strong>(c)</strong> In a different patient, an axial T2-weighted image shows a small, oval lymph node with smooth borders (arrowhead), appearing morphologically benign. 
                        <strong>(d)</strong> The corresponding contrast-enhanced T1-weighted image, however, reveals a clear Avocado Sign (arrowhead), correctly identifying metastatic involvement despite the benign T2w morphology.
                    </p>
                </div>
            </div>
        `;
        
        const getAgeRow = (statsObj, type) => {
            if (!statsObj?.age) return 'N/A';
            if (type === 'mean') return `${helpers.formatValueForPublication(statsObj.age.mean, 1)} ± ${helpers.formatValueForPublication(statsObj.age.sd, 1)}`;
            if (type === 'median') return `${helpers.formatValueForPublication(statsObj.age.median, 0)} (${helpers.formatValueForPublication(statsObj.age.q1, 0)}–${helpers.formatValueForPublication(statsObj.age.q3, 0)})`;
            return 'N/A';
        };

        const getCountRow = (count, total) => {
            if(total === 0 || count === undefined || count === null) return '0 (N/A)';
            return `${helpers.formatValueForPublication(count, 0)} (${helpers.formatValueForPublication(count / total, 0, true)}%)`;
        };
        
        const tableConfig = {
            id: 'table-results-patient-char',
            caption: 'Table 1: Patient Demographics and Clinical Characteristics',
            headers: [`Characteristic`, `Overall Cohort (n=${nOverall})`, `Surgery alone (n=${nSurgeryAlone})`, `Neoadjuvant therapy (n=${nNeoadjuvantTherapy})`, '<em>P</em> value'],
            rows: [
                ['Age (y), mean ± SD', getAgeRow(overallStats?.descriptive, 'mean'), getAgeRow(surgeryAloneStats?.descriptive, 'mean'), getAgeRow(neoadjuvantStats?.descriptive, 'mean'), helpers.formatPValueForPublication(descriptiveComparison?.age?.pValue)],
                ['   Age (y), median (IQR)', getAgeRow(overallStats?.descriptive, 'median'), getAgeRow(surgeryAloneStats?.descriptive, 'median'), getAgeRow(neoadjuvantStats?.descriptive, 'median'), ''],
                ['Men', getCountRow(overallStats?.descriptive?.sex?.m, nOverall), getCountRow(surgeryAloneStats?.descriptive?.sex?.m, nSurgeryAlone), getCountRow(neoadjuvantStats?.descriptive?.sex?.m, nNeoadjuvantTherapy), helpers.formatPValueForPublication(descriptiveComparison?.sex?.pValue)],
                ['Histopathologic N-status, positive', getCountRow(overallStats?.descriptive?.nStatus?.plus, nOverall), getCountRow(surgeryAloneStats?.descriptive?.nStatus?.plus, nSurgeryAlone), getCountRow(neoadjuvantStats?.descriptive?.nStatus?.plus, nNeoadjuvantTherapy), helpers.formatPValueForPublication(descriptiveComparison?.nStatus?.pValue)]
            ],
            notes: "Data are numbers of patients, with percentages in parentheses, or mean ± standard deviation or median and interquartile range (IQR). P values were derived from Welch's t-test for continuous variables and Fisher exact tests for categorical variables, comparing the surgery-alone and neoadjuvant therapy groups."
        };
        
        return text + figurePlaceholder + helpers.createPublicationTableHTML(tableConfig);
    }
    
    function generateComparisonHTML(stats, commonData) {
        const { bruteForceMetricForPublication } = commonData;
        const helpers = window.publicationHelpers;

        if (!stats || !bruteForceMetricForPublication) {
            return '<h3 id="ergebnisse_vergleich_as_vs_t2">Diagnostic Performance and Comparison</h3><p class="text-warning">Statistical data for comparison is incomplete.</p>';
        }

        const overallStats = stats[window.APP_CONFIG.COHORTS.OVERALL.id];
        const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        
        const bfComparisonText = (bfResultForPub && bfComparisonForPub)
            ? `(AUC, ${helpers.formatMetricForPublication(overallStats?.performanceAS?.auc, 'auc', true)} vs ${helpers.formatMetricForPublication(bfResultForPub?.auc, 'auc', true)}; ${helpers.formatPValueForPublication(bfComparisonForPub?.delong?.pValue)})`
            : '(comparison pending)';

        const text = `
            <h3 id="ergebnisse_vergleich_as_vs_t2">Diagnostic Performance and Comparison</h3>
            <p>The Avocado Sign demonstrated robust diagnostic performance across all patient subgroups, as detailed in Table 3. For the entire cohort (n=${commonData.nOverall}), the AUC was ${helpers.formatMetricForPublication(overallStats?.performanceAS?.auc, 'auc')}. The interobserver agreement for the sign was previously reported as almost perfect for this cohort (Cohen’s kappa = ${helpers.formatValueForPublication(overallStats?.interobserverKappa, 2, false, true)}${(overallStats?.interobserverKappaCI && isFinite(overallStats?.interobserverKappaCI.lower) && isFinite(overallStats?.interobserverKappaCI.upper)) ? `; 95% CI: ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.lower, 2, false, true)}, ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.upper, 2, false, true)}` : ''}) ${helpers.getReference('Lurz_Schaefer_2025')}.</p>
            <p>When compared with established literature-based T2w criteria within their respective, methodologically appropriate cohorts, the Avocado Sign consistently showed superior diagnostic performance (Table 4). In the surgery-alone cohort, the AUC of the Avocado Sign was significantly higher than that of the ESGAR 2016 criteria. Similarly, its performance surpassed that of other literature-based criteria in their corresponding cohorts. Furthermore, the performance of the Avocado Sign was not inferior to a cohort-optimized T2w criteria set derived from a brute-force analysis ${bfComparisonText}, which represents a data-driven benchmark for conventional morphology in our cohort.</p>
        `;

        const table3Config = {
            id: 'table-results-as-performance-by-cohort',
            caption: 'Table 3: Diagnostic Performance of the Avocado Sign by Patient Cohort',
            headers: ['Cohort', 'n', 'AUC (95% CI)', 'Sensitivity (95% CI)', 'Specificity (95% CI)', 'Accuracy (95% CI)'],
            rows: [],
            notes: 'Performance metrics for the Avocado Sign are calculated within each specified treatment subgroup.'
        };

        const addPerfRow = (cohortId) => {
            const cohortStats = stats[cohortId];
            if (!cohortStats || !cohortStats.performanceAS) return ['N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
            return [
                `<strong>${getCohortDisplayName(cohortId)}</strong>`,
                cohortStats.descriptive.patientCount,
                helpers.formatMetricForPublication(cohortStats.performanceAS.auc, 'auc'),
                helpers.formatMetricForPublication(cohortStats.performanceAS.sens, 'sens'),
                helpers.formatMetricForPublication(cohortStats.performanceAS.spec, 'spec'),
                helpers.formatMetricForPublication(cohortStats.performanceAS.acc, 'acc')
            ];
        };
        table3Config.rows.push(addPerfRow(window.APP_CONFIG.COHORTS.OVERALL.id));
        table3Config.rows.push(addPerfRow(window.APP_CONFIG.COHORTS.SURGERY_ALONE.id));
        table3Config.rows.push(addPerfRow(window.APP_CONFIG.COHORTS.NEOADJUVANT.id));

        const table4Config = {
            id: 'table-results-literature-comparison',
            caption: 'Table 4: Comparison of Avocado Sign vs Literature-Based T2w Criteria in Applicable Cohorts',
            headers: ['Cohort', 'Criteria Set', 'AUC (95% CI)', 'Sensitivity', 'Specificity', '<em>P</em> value (vs AS)'],
            rows: [],
            notes: 'Performance metrics are calculated within the specified treatment subgroup. The P value (DeLong test) indicates the statistical significance of the difference in AUC compared to the Avocado Sign (AS) within that same cohort.'
        };

        const addLitCompRow = (cohortId, litSetId) => {
            const cohortStats = stats[cohortId];
            const litSet = window.studyT2CriteriaManager.getStudyCriteriaSetById(litSetId);
            if (!cohortStats || !litSet) return;

            const asPerf = cohortStats.performanceAS;
            const t2Perf = cohortStats.performanceT2Literature?.[litSetId];
            const comp = cohortStats.comparisonASvsT2Literature?.[litSetId];
            if (!asPerf || !t2Perf || !comp) return;

            const pValueTooltip = getInterpretationTooltip('pValue', { ...comp.delong, value: comp.delong.pValue, testName: 'DeLong' }, { comparisonName: 'AUC', method1: 'AS', method2: litSet.name });

            table4Config.rows.push([
                `<strong>${getCohortDisplayName(cohortId)}</strong> (n=${cohortStats.descriptive.patientCount})`,
                '   Avocado Sign',
                helpers.formatMetricForPublication(asPerf.auc, 'auc'),
                helpers.formatMetricForPublication(asPerf.sens, 'sens', true),
                helpers.formatMetricForPublication(asPerf.spec, 'spec', true),
                '–'
            ]);
            table4Config.rows.push([
                '',
                `   ${litSet.name}`,
                helpers.formatMetricForPublication(t2Perf.auc, 'auc'),
                helpers.formatMetricForPublication(t2Perf.sens, 'sens', true),
                helpers.formatMetricForPublication(t2Perf.spec, 'spec', true),
                `<span data-tippy-content="${pValueTooltip}">${helpers.formatPValueForPublication(comp.delong.pValue)}</span>`
            ]);
        };
        
        addLitCompRow(window.APP_CONFIG.COHORTS.OVERALL.id, 'Koh_2008');
        table4Config.rows.push(['', '', '', '', '', '']); // Spacer row
        addLitCompRow(window.APP_CONFIG.COHORTS.SURGERY_ALONE.id, 'Rutegard_2025');
        table4Config.rows.push(['', '', '', '', '', '']); // Spacer row
        addLitCompRow(window.APP_CONFIG.COHORTS.NEOADJUVANT.id, 'Barbaro_2024');

        return text + helpers.createPublicationTableHTML(table3Config) + helpers.createPublicationTableHTML(table4Config);
    }

    return Object.freeze({
        generatePatientCharacteristicsHTML,
        generateComparisonHTML
    });

})();