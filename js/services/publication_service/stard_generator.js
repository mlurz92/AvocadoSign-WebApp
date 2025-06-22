window.stardGenerator = (() => {

    function generateStardChecklistData() {
        return [
            {
                section: 'TITLE AND ABSTRACT',
                item: 1,
                label: 'Title or Abstract: Identification as a study of diagnostic accuracy',
                location: 'Title Page, Abstract'
            },
            {
                section: 'INTRODUCTION',
                item: 2,
                label: 'Introduction: Scientific and clinical background, including the intended use and clinical role of the index test',
                location: 'Introduction'
            },
            {
                section: 'INTRODUCTION',
                item: 3,
                label: 'Introduction: Study objectives and hypotheses',
                location: 'Introduction, last paragraph'
            },
            {
                section: 'METHODS',
                item: 4,
                label: 'Methods: Study design',
                location: 'Materials and Methods / Study Design and Patients'
            },
            {
                section: 'METHODS',
                item: 5,
                label: 'Methods: Participants - Eligibility criteria',
                location: 'Materials and Methods / Study Design and Patients; Figure 1'
            },
            {
                section: 'METHODS',
                item: 6,
                label: 'Methods: Participants - Information on setting, locations, and dates of recruitment',
                location: 'Materials and Methods / Study Design and Patients'
            },
            {
                section: 'METHODS',
                item: 7,
                label: 'Methods: Participants - Consecutive or random sample?',
                location: 'Materials and Methods / Study Design and Patients'
            },
            {
                section: 'METHODS',
                item: 8,
                label: 'Methods: Data collection - Was data collection planned before the index test and reference standard were performed (prospectively) or after (retrospectively)?',
                location: 'Materials and Methods / Study Design and Patients'
            },
            {
                section: 'METHODS',
                item: 9,
                label: 'Methods: Index test - Rationale for choosing the index test',
                location: 'Introduction'
            },
            {
                section: 'METHODS',
                item: 10,
                label: 'Methods: Index test - Detailed description of the index test, how it was conducted and interpreted',
                location: 'Materials and Methods / MRI Protocol and Image Analysis'
            },
            {
                section: 'METHODS',
                item: 11,
                label: 'Methods: Reference standard - Rationale for choosing the reference standard',
                location: 'Introduction; Materials and Methods / Reference Standard'
            },
            {
                section: 'METHODS',
                item: 12,
                label: 'Methods: Reference standard - Detailed description of the reference standard, how it was conducted and interpreted',
                location: 'Materials and Methods / Reference Standard'
            },
            {
                section: 'METHODS',
                item: 13,
                label: 'Methods: Blinding - Were the interpreters of the index test blinded to the results of the reference standard and vice versa?',
                location: 'Materials and Methods / MRI Protocol and Image Analysis'
            },
            {
                section: 'METHODS',
                item: 14,
                label: 'Methods: Statistical methods - Methods for calculating or comparing measures of diagnostic accuracy',
                location: 'Materials and Methods / Statistical Analysis'
            },
            {
                section: 'METHODS',
                item: 15,
                label: 'Methods: Statistical methods - How indeterminate index test or reference standard results were handled',
                location: 'Not applicable; all cases had determinate results.'
            },
            {
                section: 'METHODS',
                item: 16,
                label: 'Methods: Statistical methods - How missing data on the index test and reference standard were handled',
                location: 'Not applicable; cohort had complete data for the analysis.'
            },
            {
                section: 'METHODS',
                item: 17,
                label: 'Methods: Statistical methods - Any analyses of variability in diagnostic accuracy, subgroup analyses',
                location: 'Materials and Methods / Statistical Analysis; Results / Table 4'
            },
            {
                section: 'METHODS',
                item: 18,
                label: 'Methods: Statistical methods - How sample size was determined',
                location: 'Materials and Methods / Study Design and Patients (retrospective analysis of a consecutive cohort)'
            },
            {
                section: 'RESULTS',
                item: 19,
                label: 'Results: Participants - Flow of participants, using a diagram',
                location: 'Results / Patient Characteristics; Figure 1'
            },
            {
                section: 'RESULTS',
                item: 20,
                label: 'Results: Participants - Baseline demographic and clinical characteristics',
                location: 'Results / Patient Characteristics; Table 1'
            },
            {
                section: 'RESULTS',
                item: 21,
                label: 'Results: Participants - Distribution of severity of disease in those with the target condition; other diagnoses in those without the target condition',
                location: 'Results / Table 1 (N-status breakdown)'
            },
            {
                section: 'RESULTS',
                item: 22,
                label: 'Results: Test results - Time interval and any clinical interventions between index test and reference standard',
                location: 'Materials and Methods / Study Design and Patients'
            },
            {
                section: 'RESULTS',
                item: 23,
                label: 'Results: Test results - Cross tabulation of the index test results by the results of the reference standard',
                location: 'Results / Diagnostic Performance and Comparison; Tables are aggregated per-patient.'
            },
            {
                section: 'RESULTS',
                item: 24,
                label: 'Results: Test results - Estimates of diagnostic accuracy and their precision (such as 95% confidence intervals)',
                location: 'Results / Table 3, Table 4'
            },
            {
                section: 'RESULTS',
                item: 25,
                label: 'Results: Test results - Any adverse events from performing the index test or the reference standard',
                location: 'Not applicable for this retrospective image analysis study.'
            },
            {
                section: 'DISCUSSION',
                item: 26,
                label: 'Discussion: Study limitations, including sources of potential bias, statistical uncertainty, and generalizability',
                location: 'Discussion'
            },
            {
                section: 'DISCUSSION',
                item: 27,
                label: 'Discussion: Conclusions about the clinical utility of the index test, with a balanced discussion of benefits and harms',
                location: 'Discussion'
            },
            {
                section: 'OTHER INFORMATION',
                item: 28,
                label: 'Other information: Registration number and name of registry',
                location: 'Not applicable; diagnostic accuracy study.'
            },
            {
                section: 'OTHER INFORMATION',
                item: 29,
                label: 'Other information: Where the full study protocol can be accessed',
                location: 'Not applicable.'
            },
            {
                section: 'OTHER INFORMATION',
                item: 30,
                label: 'Other information: Sources of funding and other support; role of funders',
                location: 'Title Page'
            }
        ];
    }

    function renderStardChecklist() {
        const stardData = generateStardChecklistData();
        let html = `
            <h2 id="stard_checklist">STARD 2015 Checklist</h2>
            <p class="small text-muted">This checklist indicates where each of the 30 items from the Standards for Reporting of Diagnostic Accuracy Studies (STARD) is addressed within the generated manuscript.</p>
            <div class="table-responsive">
                <table class="table table-sm table-bordered small">
                    <thead class="table-light">
                        <tr>
                            <th style="width: 15%;">Section</th>
                            <th style="width: 10%;">Item</th>
                            <th>Description</th>
                            <th style="width: 25%;">Reported in Section</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        stardData.forEach(item => {
            html += `
                <tr>
                    <td>${item.section}</td>
                    <td>${item.item}</td>
                    <td>${item.label}</td>
                    <td><em>${item.location}</em></td>
                </tr>
            `;
        });
        html += '</tbody></table></div>';
        return html;
    }

    return Object.freeze({
        generateStardChecklistData,
        renderStardChecklist
    });

})();