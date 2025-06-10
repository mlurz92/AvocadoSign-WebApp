const publicationTab = (() => {

    let allCohortStats = null;
    let rawGlobalData = null;
    let bruteForceResults = null;

    function _getSafeLink(elementId) {
        return `#${elementId}`;
    }

    function _formatCIForPublication(metric) {
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
    }

    function _getAbstractText(commonData) {
        const gesamtStats = allCohortStats?.Gesamt;
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

        const studyPeriod = commonData.references?.STUDY_PERIOD_2020_2023 || "January 2020 and November 2023";

        return `
            <div class="publication-abstract-section">
                <h2 id="abstract-title">Abstract</h2>
                <div class="abstract-content">
                    <p><strong>Background:</strong> Accurate pretherapeutic determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer. Standard magnetic resonance imaging (MRI) criteria have limitations.</p>
                    <p><strong>Purpose:</strong> To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced (CE) MRI marker, compared to literature-based and cohort-optimized T2-weighted (T2w) criteria for predicting N-status.</p>
                    <p><strong>Materials and Methods:</strong> This retrospective, ethics committee-approved, single-center study analyzed data from consecutive patients with histologically confirmed rectal cancer enrolled between ${studyPeriod}. Two blinded radiologists evaluated the AS (hypointense core within a hyperintense lymph node on T1w CE sequences) and morphological T2w criteria. Histopathological examination of surgical specimens served as the reference standard. Sensitivity, specificity, accuracy, and area under the receiver operating characteristic curve (AUC), with 95% confidence intervals (CIs), were calculated, and AUCs were compared using the DeLong test.</p>
                    <p><strong>Results:</strong> A total of ${formatNumber(nGesamt,0)} patients (median age, ${ageRangeText}; ${sexText}) were analyzed. The AS showed a sensitivity of ${_formatCIForPublication({value: asGesamt?.sens?.value, ci: asGesamt?.sens?.ci})}, specificity of ${_formatCIForPublication({value: asGesamt?.spec?.value, ci: asGesamt?.spec?.ci})}, and an AUC of ${formatNumber(asGesamt?.auc?.value, 2, 'N/A', true)} (95% CI: ${formatNumber(asGesamt?.auc?.ci?.lower, 2, 'N/A', true)}, ${formatNumber(asGesamt?.auc?.ci?.upper, 2, 'N/A', true)}). For optimized T2w criteria, the AUC was ${formatNumber(bfGesamtStats?.auc?.value, 2, 'N/A', true)}. The difference in AUC between AS and optimized T2w criteria was not statistically significant (${getPValueText(vergleichASvsBFGesamt?.delong?.pValue, 'en', true)}).</p>
                    <p><strong>Conclusion:</strong> The Avocado Sign is a promising MRI marker for predicting lymph node status in rectal cancer, demonstrating high diagnostic performance comparable to cohort-optimized T2w criteria, with potential to improve preoperative staging.</p>
                    <p class="small text-muted mt-2">Abbreviations: ACC = Accuracy, AS = Avocado Sign, AUC = Area Under the Curve, CE = Contrast-Enhanced, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, N-status = Nodal status, T2w = T2-weighted.</p>
                </div>
            </div>
        `;
    }
    
    function render(data, currentSectionId) {
        rawGlobalData = data.rawData;
        allCohortStats = data.allCohortStats;
        bruteForceResults = data.bruteForceResults;
        
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats.Gesamt?.descriptive?.patientCount || 0,
            nUpfrontSurgery: allCohortStats['direkt OP']?.descriptive?.patientCount || 0,
            nNRCT: allCohortStats.nRCT?.descriptive?.patientCount || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {}
        };
        
        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId);
        if (!mainSection) return `<p class="text-warning">No section defined for ID '${currentSectionId}'.</p>`;

        let finalHTML = `<div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: var(--sticky-header-offset); z-index: 1015;">
            <div class="col-md-3">${uiComponents.createPublicationNav(currentSectionId)}</div>
            <div class="col-md-9"><div id="publication-content-area" class="bg-white p-3 border rounded">
                <h1 class="mb-4 display-6">${UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey]}</h1>`;

        mainSection.subSections.forEach(subSection => {
            finalHTML += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            if (subSection.id === 'abstract_main') {
                finalHTML += _getAbstractText(commonData);
            } else {
                 finalHTML += `<p class="text-muted">Content for section '${subSection.label}' is under construction.</p>`;
            }
            finalHTML += `</div>`;
        });

        finalHTML += `</div></div></div>`;
        return finalHTML;
    }

    return {
        render,
        _getAbstractText // Expose this function for export_service.js
    };
})();
