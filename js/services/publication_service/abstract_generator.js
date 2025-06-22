window.abstractGenerator = (() => {

    function generateAbstractHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        
        if (!overallStats || !overallStats.descriptive || !overallStats.performanceAS) {
            return '<div class="alert alert-warning">Required statistics for abstract generation are missing. Please ensure the analysis has been run.</div>';
        }

        const { nOverall, nPositive, bruteForceMetricForPublication } = commonData;
        const helpers = window.publicationHelpers;
        
        const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        const bfResultsAvailable = !!(bfResultForPub && bfComparisonForPub);
        
        const bfComparisonText = bfResultsAvailable
            ? `(AUC, ${helpers.formatMetricForPublication(overallStats?.performanceAS?.auc, 'auc', true)} vs ${helpers.formatMetricForPublication(bfResultForPub?.auc, 'auc', true)}; ${helpers.formatPValueForPublication(bfComparisonForPub?.delong?.pValue)})`
            : '(comparison pending)';

        const meanAgeFormatted = helpers.formatValueForPublication(overallStats?.descriptive?.age?.mean, 0);
        const ageSDFormatted = helpers.formatValueForPublication(overallStats?.descriptive?.age?.sd, 0);
        const demographicsString = `${nOverall} patients (mean age, ${meanAgeFormatted} years ± ${ageSDFormatted} [standard deviation]; ${overallStats?.descriptive?.sex?.m ?? 'N/A'} men)`;

        const resultsSectionHTML = `
            <p>A total of ${demographicsString} were evaluated, of whom ${nPositive} of ${nOverall} (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%) were N-positive at histopathology. The Avocado Sign demonstrated a sensitivity of ${helpers.formatMetricForPublication(overallStats?.performanceAS?.sens, 'sens')} and a specificity of ${helpers.formatMetricForPublication(overallStats?.performanceAS?.spec, 'spec')}, with an AUC of ${helpers.formatMetricForPublication(overallStats?.performanceAS?.auc, 'auc')}. Its performance was superior to established literature-based T2w criteria. Furthermore, its diagnostic accuracy was not inferior to a cohort-optimized T2w criteria set derived from a brute-force analysis ${bfComparisonText}.</p>
        `;
        
        const conclusionText = `
            <p>The Avocado Sign is an accurate and reproducible MRI marker for predicting lymph node status in rectal cancer, demonstrating superior performance to established T2-weighted criteria and comparable performance to a cohort-optimized benchmark, suggesting it could simplify and improve current staging protocols.</p>
        `;

        const abstractContentHTML = `
            <div class="structured-abstract">
                <h3>Background</h3>
                <p>Accurate preoperative determination of mesorectal lymph node status is crucial for treatment decisions in rectal cancer, yet standard T2-weighted (T2w) MRI criteria have shown limited diagnostic accuracy.</p>
                
                <h3>Purpose</h3>
                <p>To evaluate the diagnostic performance of the Avocado Sign, a novel contrast-enhanced MRI marker, and to compare it with both established literature-based and cohort-optimized T2w morphological criteria for predicting N-status.</p>
                
                <h3>Materials and Methods</h3>
                <p>This secondary analysis of a retrospective, single-institution study received institutional review board approval with a waiver of informed consent. Data from ${nOverall} consecutive patients with histologically confirmed rectal cancer who underwent 3.0-T MRI between January 2020 and November 2023 were analyzed. Two blinded radiologists performed a new evaluation of the Avocado Sign on contrast-enhanced T1-weighted images and morphological features on T2w images. Histopathologic examination of the surgical specimen served as the reference standard. Diagnostic performance was assessed using the area under the receiver operating characteristic curve (AUC), and methods were compared using the DeLong test.</p>
                
                <h3>Results</h3>
                ${resultsSectionHTML}
                
                <h3>Conclusion</h3>
                ${conclusionText}
            </div>
        `;

        return abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();