window.publicationService = (() => {

    const contentGenerators = {
        'title_main': window.titlePageGenerator.generateTitlePageHTML,
        'abstract_main': window.abstractGenerator.generateAbstractHTML,
        'introduction_main': window.introductionGenerator.generateIntroductionHTML,
        'methoden_studienanlage_ethik': window.methodsGenerator.generateStudyDesignHTML,
        'methoden_mrt_protokoll_akquisition': window.methodsGenerator.generateMriProtocolAndImageAnalysisHTML,
        'methoden_vergleichskriterien_t2': window.methodsGenerator.generateComparativeCriteriaHTML,
        'methoden_referenzstandard_histopathologie': window.methodsGenerator.generateReferenceStandardHTML,
        'methoden_statistische_analyse_methoden': window.methodsGenerator.generateStatisticalAnalysisHTML,
        'ergebnisse_patientencharakteristika': window.resultsGenerator.generatePatientCharacteristicsHTML,
        'ergebnisse_vergleich_as_vs_t2': window.resultsGenerator.generateComparisonHTML,
        'discussion_main': window.discussionGenerator.generateDiscussionHTML,
        'stard_checklist': window.stardGenerator.renderStardChecklist
    };

    function _generateAbbreviationsHTML(fullHtmlContent) {
        const potentialAbbreviations = {
            'AS': 'Avocado Sign',
            'AUC': 'Area under the receiver operating characteristic curve',
            'CI': 'Confidence interval',
            'nCRT': 'neoadjuvant chemoradiotherapy',
            'T2w': 'T2-weighted',
            'VIBE': 'volumetric interpolated breath-hold examination',
            'DWI': 'diffusion-weighted imaging',
            'ESGAR': 'European Society of Gastrointestinal and Abdominal Radiology',
            'STARD': 'Standards for Reporting of Diagnostic Accuracy Studies'
        };

        const textContent = fullHtmlContent.replace(/<[^>]+>/g, ' ');
        const counts = {};

        Object.keys(potentialAbbreviations).forEach(abbr => {
            const regex = new RegExp(`\\b${abbr}\\b`, 'g');
            const matches = textContent.match(regex);
            counts[abbr] = matches ? matches.length : 0;
        });

        const validAbbreviations = Object.entries(counts)
            .filter(([abbr, count]) => count >= 5 && potentialAbbreviations[abbr])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([abbr]) => `<li><strong>${abbr}</strong> = ${potentialAbbreviations[abbr]}</li>`)
            .join('');

        if (validAbbreviations) {
            return `<div id="abbreviations-list" style="margin-top: 1.5rem;">
                        <h4 style="font-size: 1.1rem; font-weight: bold;">Abbreviations</h4>
                        <ul style="padding-left: 20px; margin-top: 0.5rem; list-style-position: inside; text-align: left;">${validAbbreviations}</ul>
                    </div>`;
        }
        return '';
    }

    function generateSectionHTML(sectionId, stats, commonData) {
        const generator = contentGenerators[sectionId];
        if (typeof generator === 'function') {
            try {
                return generator(stats, commonData);
            } catch (error) {
                console.error(`Error in generator for section '${sectionId}':`, error);
                return `<div class="alert alert-danger">An error occurred while generating content for section '${sectionId}'. Check console for details.</div>`;
            }
        }
        
        const mainSection = window.PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (mainSection && Array.isArray(mainSection.subSections) && mainSection.subSections.length > 0) {
            let combinedHTML = '';
            mainSection.subSections.forEach(sub => {
                const subGenerator = contentGenerators[sub.id];
                if (typeof subGenerator === 'function') {
                    try {
                        combinedHTML += subGenerator(stats, commonData);
                    } catch (error) {
                        console.error(`Error in sub-generator for section '${sub.id}' (part of '${sectionId}'):`, error);
                        combinedHTML += `<div class="alert alert-danger">An error occurred while generating content for sub-section '${sub.label}'. Check console for details.</div>`;
                    }
                }
            });
            return combinedHTML;
        }
        
        if (sectionId === 'references_main') {
            return '';
        }

        return `<div class="alert alert-warning">Content generator for section ID '${sectionId}' not found.</div>`;
    }
    
    function generateFullPublicationHTML(allCohortStats, commonData) {
        if (!allCohortStats || !commonData) {
            return '<div class="alert alert-warning">Statistical data or common configuration is missing for publication generation.</div>';
        }

        let mainBodyHTML = '';
        window.PUBLICATION_CONFIG.sections.forEach(section => {
            if (['title_main', 'references_main', 'stard_checklist'].includes(section.id)) {
                return;
            }
            const sectionLabel = window.APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[section.labelKey] || section.labelKey;
            mainBodyHTML += `<section id="${section.id}"><h2>${sectionLabel}</h2>`;
            mainBodyHTML += generateSectionHTML(section.id, allCohortStats, commonData);
            mainBodyHTML += `</section>`;
        });
        
        const abbreviationsHTML = _generateAbbreviationsHTML(mainBodyHTML);
        let titlePageHTML = generateSectionHTML('title_main', allCohortStats, commonData);

        if (abbreviationsHTML) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = titlePageHTML;
            const keyResultsList = tempDiv.querySelector('h4+ul');
            if (keyResultsList) {
                keyResultsList.insertAdjacentHTML('afterend', abbreviationsHTML);
                titlePageHTML = tempDiv.innerHTML;
            }
        }
        
        const allReferences = commonData?.references || {};
        const { processedHtml, referencesHtml } = window.referencesGenerator.processAndNumberReferences(mainBodyHTML, allReferences);
        
        const stardHtml = generateSectionHTML('stard_checklist', allCohortStats, commonData);

        return titlePageHTML + processedHtml + referencesHtml + stardHtml;
    }

    return Object.freeze({
        generateFullPublicationHTML,
        generateSectionHTML
    });

})();