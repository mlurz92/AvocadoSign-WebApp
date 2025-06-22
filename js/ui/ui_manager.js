window.uiManager = (() => {

    function updateCohortButtonsUI(currentCohortId, isLocked) {
        if (!window.APP_CONFIG) return;
        const cohortButtonGroup = document.querySelector('.btn-group[aria-label="Cohort Selection"]');
        
        if (cohortButtonGroup) {
            const tooltipContent = isLocked 
                ? "Cohort selection is locked because a specific analysis context (e.g., literature comparison) or view (e.g., statistics comparison) is active." 
                : "Select the patient cohort for analysis.";
            
            let tippyInstance = cohortButtonGroup._tippy;
            if (tippyInstance) {
                tippyInstance.setContent(tooltipContent);
            } else {
                tippy(cohortButtonGroup, { content: tooltipContent });
            }
        }

        Object.values(window.APP_CONFIG.COHORTS).forEach(cohort => {
            const button = document.getElementById(`btn-cohort-${cohort.id}`);
            if (button) {
                button.classList.toggle('active', cohort.id === currentCohortId);
                button.disabled = isLocked;
            }
        });
    }

    function renderTabContent(tabId, contentGenerator) {
        const paneId = `${tabId}-pane`;
        const paneElement = document.getElementById(paneId);
        if (paneElement) {
            const oldTippys = paneElement.querySelectorAll('[data-tippy-content]');
            oldTippys.forEach(el => { if (el._tippy) el._tippy.destroy(); });

            paneElement.innerHTML = contentGenerator();
            initializeTooltips(paneElement);
        }
    }

    function attachRowCollapseListeners(tableBodyId) {
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) return;

        function handleRowClick(event) {
            const row = event.currentTarget;
            if (!row) return;

            const isToggleButton = event.target.closest('.row-toggle-button');
            const targetId = row.dataset.bsTarget;
            const collapseElement = targetId ? document.querySelector(targetId) : null;
            if (!collapseElement) return;

            const bsCollapse = bootstrap.Collapse.getInstance(collapseElement);
            if (!bsCollapse) return;

            if (isToggleButton) {
                bsCollapse.toggle();
            } else {
                const isExpanded = collapseElement.classList.contains('show');
                if (isExpanded) {
                    bsCollapse.hide();
                } else {
                    bsCollapse.show();
                }
            }
        }
    
        tableBody.querySelectorAll('tr.clickable-row').forEach(row => {
            row.removeEventListener('click', handleRowClick);
            row.addEventListener('click', handleRowClick);
            
            const collapseElement = document.querySelector(row.dataset.bsTarget);
            if (collapseElement) {
                collapseElement.addEventListener('show.bs.collapse', () => {
                    const icon = row.querySelector('.row-toggle-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                    row.setAttribute('aria-expanded', 'true');
                });
                collapseElement.addEventListener('hide.bs.collapse', () => {
                    const icon = row.querySelector('.row-toggle-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                     row.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    function toggleAllDetails(tableBodyId, toggleButtonId) {
        const tableBody = document.getElementById(tableBodyId);
        const toggleButton = document.getElementById(toggleButtonId);
        if (!tableBody || !toggleButton) return;

        const isExpanding = toggleButton.dataset.action === 'expand';
        const rows = tableBody.querySelectorAll('tr.clickable-row');

        rows.forEach(row => {
            const targetId = row.dataset.bsTarget;
            const collapseElement = targetId ? document.querySelector(targetId) : null;
            if (collapseElement) {
                const bsCollapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement, { toggle: false });
                if (isExpanding) {
                    if (!collapseElement.classList.contains('show')) {
                        bsCollapse.show();
                    }
                } else {
                    if (collapseElement.classList.contains('show')) {
                        bsCollapse.hide();
                    }
                }
            }
        });

        toggleButton.dataset.action = isExpanding ? 'collapse' : 'expand';
        toggleButton.innerHTML = isExpanding ? 'Collapse All Details <i class="fas fa-chevron-up ms-1"></i>' : 'Expand All Details <i class="fas fa-chevron-down ms-1"></i>';
    }

    function updateSortIcons(tableHeaderId, sortState) {
        const header = document.getElementById(tableHeaderId);
        if (!header) return;

        header.querySelectorAll('th[data-sort-key]').forEach(th => {
            let sortIcon = th.querySelector('.fa-sort, .fa-sort-up, .fa-sort-down');
            if (!sortIcon) {
                sortIcon = document.createElement('i');
                sortIcon.className = 'fas fa-sort text-muted opacity-50 ms-1';
                th.appendChild(sortIcon);
            }

            sortIcon.className = 'fas ms-1';
            if (th.dataset.sortKey === sortState.key) {
                const subHeaders = th.querySelectorAll('.sortable-sub-header');
                if (subHeaders.length > 0) {
                    let subKeyMatched = false;
                    subHeaders.forEach(subH => {
                        if (subH.dataset.subKey === sortState.subKey) {
                            subKeyMatched = true;
                            subH.style.fontWeight = 'bold';
                            subH.style.textDecoration = 'underline';
                            subH.style.color = 'var(--primary-color)';
                        } else {
                            subH.style.fontWeight = '';
                            subH.style.textDecoration = '';
                            subH.style.color = '';
                        }
                    });
                    if (subKeyMatched) {
                        sortIcon.classList.add(sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
                        sortIcon.classList.remove('text-muted', 'opacity-50', 'fa-sort');
                        sortIcon.classList.add('text-primary');
                    } else {
                        sortIcon.classList.add('fa-sort', 'text-muted', 'opacity-50');
                        sortIcon.classList.remove('text-primary', 'fa-sort-up', 'fa-sort-down');
                    }
                } else {
                    sortIcon.classList.add(sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
                    sortIcon.classList.remove('text-muted', 'opacity-50', 'fa-sort');
                    sortIcon.classList.add('text-primary');
                }
            } else {
                sortIcon.classList.add('fa-sort', 'text-muted', 'opacity-50');
                sortIcon.classList.remove('text-primary', 'fa-sort-up', 'fa-sort-down');
                th.querySelectorAll('.sortable-sub-header').forEach(subH => {
                    subH.style.fontWeight = '';
                    subH.style.textDecoration = '';
                    subH.style.color = '';
                });
            }
        });
    }

    function initializeTooltips(containerElement) {
        if (typeof tippy === 'undefined' || !containerElement) return;

        const elementsWithTooltips = containerElement.querySelectorAll('[data-tippy-content]');

        elementsWithTooltips.forEach(element => {
            if (element._tippy) {
                element._tippy.destroy();
            }
            const content = element.getAttribute('data-tippy-content');
            if (content) {
                let theme = 'glass';
                if (content.toLowerCase().includes('warning') || content.toLowerCase().includes('error')) {
                    theme = 'warning';
                }

                tippy(element, {
                    content: content,
                    allowHTML: true,
                    animation: 'fade',
                    placement: 'auto',
                    delay: window.APP_CONFIG?.UI_SETTINGS?.TOOLTIP_DELAY || [300, 100],
                    theme: theme,
                    touch: ['hold', 500]
                });
            }
        });
    }

    function destroyTooltips(containerElement) {
        if (!containerElement) return;
        const elementsWithTooltips = containerElement.querySelectorAll('[data-tippy-content]');
        elementsWithTooltips.forEach(element => {
            if (element._tippy) {
                element._tippy.destroy();
            }
        });
    }

    function showToast(message, type = 'info', duration = window.APP_CONFIG?.UI_SETTINGS?.TOAST_DURATION_MS || 1500) {
        if (typeof bootstrap === 'undefined') return;
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type} border-0 fade show`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.style.maxWidth = '350px';
        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        toastContainer.appendChild(toastElement);

        const bsToast = new bootstrap.Toast(toastElement, {
            delay: duration,
            autohide: true
        });
        bsToast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    function updateT2CriteriaControlsUI(currentCriteria, currentLogic) {
        if (!window.APP_CONFIG || !window.utils) return;

        ['size', 'shape', 'border', 'homogeneity', 'signal'].forEach(key => {
            const checkbox = document.getElementById(`check-${key}`);
            if (checkbox) {
                checkbox.checked = currentCriteria[key]?.active || false;
            }
        });

        const sizeThreshold = currentCriteria.size?.threshold ?? window.APP_CONFIG.DEFAULT_T2_CRITERIA.size.threshold;
        const formattedThresholdForInput = formatNumber(sizeThreshold, 1, '5.0', true);
        const rangeSize = document.getElementById('range-size');
        const inputSize = document.getElementById('input-size');
        const valueSize = document.getElementById('value-size');
        const isSizeActive = currentCriteria.size?.active;

        if (rangeSize) {
            rangeSize.value = formattedThresholdForInput;
            rangeSize.disabled = !isSizeActive;
        }
        if (inputSize) {
            inputSize.value = formattedThresholdForInput;
            inputSize.disabled = !isSizeActive;
        }
        if (valueSize) {
            valueSize.textContent = formatNumber(sizeThreshold, 1);
        }

        ['shape', 'border', 'homogeneity', 'signal'].forEach(key => {
            const optionsContainer = document.querySelector(`.criteria-group:has(#check-${key}) .criteria-options-container`);
            const isKeyActive = currentCriteria[key]?.active;
            const currentValue = currentCriteria[key]?.value;

            if (optionsContainer) {
                optionsContainer.querySelectorAll('.t2-criteria-button').forEach(button => {
                    const buttonValue = button.dataset.value;
                    button.classList.toggle('active', isKeyActive && currentValue === buttonValue);
                    button.classList.toggle('inactive-option', !isKeyActive);
                    button.disabled = !isKeyActive;
                });
            }
        });

        const logicSwitch = document.getElementById('t2-logic-switch');
        const logicLabel = document.getElementById('t2-logic-label');
        if (logicSwitch) {
            logicSwitch.checked = (currentLogic === 'OR');
        }
        if (logicLabel && window.APP_CONFIG.UI_TEXTS?.t2LogicDisplayNames) {
            logicLabel.textContent = window.APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[currentLogic] || currentLogic;
        }
    }

    function markCriteriaSavedIndicator(isUnsaved) {
        const criteriaCard = document.getElementById('t2-criteria-card');
        const applyButton = document.getElementById('btn-apply-criteria');
        if (criteriaCard) {
            criteriaCard.classList.toggle('criteria-unsaved-indicator', isUnsaved);
        }
        if (applyButton) {
            applyButton.disabled = !isUnsaved;
        }
    }

    function updateBruteForceUI(state, payload, bfWorkerAvailable, currentCohort) {
        const runnerCardContainer = document.getElementById('brute-force-runner-card-container');
        if (!runnerCardContainer) return;

        const selectedMetric = document.getElementById('brute-force-metric')?.value || window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
        
        const runnerCardHTML = window.uiComponents.createBruteForceRunnerCardHTML(state, payload, bfWorkerAvailable, currentCohort, selectedMetric);
        
        updateElementHTML(runnerCardContainer.id, runnerCardHTML);
    }

    function updateComparisonViewUI(view, selectedStudyId) {
        if (!window.APP_CONFIG || !window.utils || !window.studyT2CriteriaManager) return;
        
        const asPerfBtn = document.getElementById('view-as-perf');
        const asVsT2Btn = document.getElementById('view-as-vs-t2');
        const compStudySelect = document.getElementById('comp-study-select');

        if (asPerfBtn) asPerfBtn.checked = (view === 'as-pur');
        if (asVsT2Btn) asVsT2Btn.checked = (view === 'as-vs-t2');

        if (compStudySelect) {
            compStudySelect.disabled = (view === 'as-pur');
        }
    }

    function updatePublicationUI(currentSectionId, currentBruteForceMetric) {
        if (!window.APP_CONFIG || !window.PUBLICATION_CONFIG) return;
        
        const navContainer = document.getElementById('publication-sections-nav');
        if (navContainer) {
            navContainer.innerHTML = window.uiComponents.createPublicationNav(currentSectionId);
            initializeTooltips(navContainer);
        }

        const bfMetricSelect = document.getElementById('publication-bf-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.innerHTML = window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m =>
                `<option value="${m.value}" ${m.value === currentBruteForceMetric ? 'selected' : ''}>${m.label}</option>`
            ).join('');
        }
    }

    function showQuickGuide() {
        if (typeof bootstrap === 'undefined') return;
        
        const modalElement = document.getElementById('quick-guide-modal');
        if (!modalElement) return;

        const quickGuideModal = bootstrap.Modal.getOrCreateInstance(modalElement);
        quickGuideModal.show();
    }

    function updateElementHTML(elementId, htmlContent) {
        const element = document.getElementById(elementId);
        if (element) {
            const oldTippys = element.querySelectorAll('[data-tippy-content]');
            oldTippys.forEach(el => { if (el._tippy) el._tippy.destroy(); });
            element.innerHTML = htmlContent;
            initializeTooltips(element);
        }
    }

    function highlightElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('element-flash-highlight');
            setTimeout(() => {
                element.classList.remove('element-flash-highlight');
            }, 1500);
        }
    }

    return Object.freeze({
        updateCohortButtonsUI,
        renderTabContent,
        attachRowCollapseListeners,
        toggleAllDetails,
        updateSortIcons,
        initializeTooltips,
        destroyTooltips,
        showToast,
        updateT2CriteriaControlsUI,
        markCriteriaSavedIndicator,
        updateBruteForceUI,
        updateComparisonViewUI,
        updatePublicationUI,
        showQuickGuide,
        updateElementHTML,
        highlightElement
    });
})();