window.publicationTab = (() => {

    function renderWordCounts() {
        const sectionsWithLimits = window.PUBLICATION_CONFIG.sections.filter(s => s.limit && s.countType);

        sectionsWithLimits.forEach(section => {
            const contentElement = document.getElementById(section.id);
            const navElement = document.querySelector(`.publication-section-link[data-section-id="${section.id}"]`);

            if (contentElement && navElement) {
                let currentCount = 0;
                
                if (section.countType === 'word') {
                    const text = contentElement.textContent || contentElement.innerText || '';
                    currentCount = text.trim().split(/\s+/).filter(Boolean).length;
                } else if (section.countType === 'item') {
                    currentCount = contentElement.querySelectorAll('li').length;
                }

                let countIndicator = navElement.querySelector('.word-count-indicator');
                if (!countIndicator) {
                    countIndicator = document.createElement('span');
                    countIndicator.className = 'badge rounded-pill ms-2 word-count-indicator';
                    navElement.appendChild(countIndicator);
                }
                
                countIndicator.textContent = `${currentCount} / ${section.limit}`;
                
                const ratio = currentCount / section.limit;
                let bgColorClass = 'bg-success-subtle text-success-emphasis';
                if (ratio > 1) {
                    bgColorClass = 'bg-danger text-white';
                } else if (ratio > 0.9) {
                    bgColorClass = 'bg-warning-subtle text-warning-emphasis';
                }
                countIndicator.className = `badge rounded-pill ms-2 word-count-indicator ${bgColorClass}`;
            }
        });
    }

    function render(data, currentSectionId) {
        const { preRenderedHTML, allCohortStats, bruteForceMetricForPublication } = data;
        
        if (!preRenderedHTML) {
            return '<div class="alert alert-warning">Publication content could not be pre-rendered. Please check for errors.</div>';
        }

        const finalHTML = `
            <div class="row mb-3">
                <div class="col-md-3">
                    <div class="sticky-top" style="top: var(--sticky-header-offset);">
                        ${window.uiComponents.createPublicationNav(currentSectionId)}
                        <div class="mt-3">
                            <label for="publication-bf-metric-select" class="form-label small text-muted">${window.APP_CONFIG.UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                            <select class="form-select form-select-sm" id="publication-bf-metric-select">
                                ${window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m => `<option value="${m.value}" ${m.value === bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <div id="publication-content-area" class="bg-white p-4 border rounded">
                        <div class="publication-content-wrapper">
                            ${preRenderedHTML}
                        </div>
                    </div>
                </div>
            </div>`;
        
        setTimeout(() => {
            const flowchartContainerId = 'figure-1-flowchart-container';
            if (document.getElementById(flowchartContainerId)) {
                if (typeof window.flowchartRenderer !== 'undefined' && allCohortStats?.Overall) {
                    const flowchartStats = {
                        Overall: allCohortStats[window.APP_CONFIG.COHORTS.OVERALL.id],
                        surgeryAlone: allCohortStats[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id],
                        neoadjuvantTherapy: allCohortStats[window.APP_CONFIG.COHORTS.NEOADJUVANT.id]
                    };
                    window.flowchartRenderer.renderFlowchart(flowchartStats, flowchartContainerId);
                }
            }
            renderWordCounts();

            const contentArea = document.getElementById('publication-content-area');
            const elementToScroll = document.getElementById(currentSectionId);
            if (contentArea && elementToScroll) {
                const offsetTop = elementToScroll.offsetTop - contentArea.offsetTop;
                contentArea.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }, 50);
            
        return finalHTML;
    }

    return Object.freeze({
        render
    });

})();