const uiManager = (() => {

    let tippyInstances = [];
    let collapseEventListenersAttached = new Set();
    let quickGuideModalInstance = null;

    function showToast(message, type = 'info', duration = 3000) {
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.UI_SETTINGS?.TOAST_DURATION_MS) {
            duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS;
        }
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        if (!message) return;
        if (typeof bootstrap === 'undefined' || !bootstrap.Toast) return;

        const toastId = `toast-${generateUUID()}`;
        let bgClass = 'bg-secondary', iconClass = 'fa-info-circle', textClass = 'text-white';
        switch (type) {
            case 'success': bgClass = 'bg-success'; iconClass = 'fa-check-circle'; break;
            case 'warning': bgClass = 'bg-warning'; iconClass = 'fa-exclamation-triangle'; textClass = 'text-dark'; break;
            case 'danger': bgClass = 'bg-danger'; iconClass = 'fa-exclamation-circle'; break;
            case 'info':
            default: bgClass = 'bg-info'; iconClass = 'fa-info-circle'; textClass = 'text-dark'; break;
        }

        const toastElement = document.createElement('div');
        toastElement.id = toastId;
        toastElement.className = `toast align-items-center ${textClass} ${bgClass} border-0 fade`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${iconClass} fa-fw me-2"></i> ${escapeHTML(message)}</div><button type="button" class="btn-close me-2 m-auto ${textClass === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
        toastContainer.appendChild(toastElement);

        try {
            const toastInstance = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
            toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove(), { once: true });
            toastInstance.show();
        } catch (e) {
            toastElement.remove();
        }
    }

    function initializeTooltips(scope = document.body) {
        if (!window.tippy || typeof scope?.querySelectorAll !== 'function') return;

        const newInstances = tippy(scope.querySelectorAll('[data-tippy-content]'), {
            allowHTML: true, theme: 'glass', placement: 'top', animation: 'fade',
            interactive: false, appendTo: () => document.body,
            delay: (APP_CONFIG && APP_CONFIG.UI_SETTINGS) ? APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY : [200, 100],
            maxWidth: 400, duration: [150, 150], zIndex: 3050,
            onCreate(instance) { if (!instance.props.content || String(instance.props.content).trim() === '') { instance.disable(); } },
            onShow(instance) { const content = instance.reference.getAttribute('data-tippy-content'); return !!content && String(content).trim() !== ''; }
        });
        if (Array.isArray(newInstances)) tippyInstances = tippyInstances.concat(newInstances);
        else if (newInstances) tippyInstances.push(newInstances);
    }

    function updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text ?? '';
        }
    }

    function updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html ?? '';
            initializeTooltips(element);
        }
    }

    function toggleElementClass(elementId, className, add) {
        const element = document.getElementById(elementId);
        if (element && className) {
            element.classList.toggle(className, add);
        }
    }

    function setElementDisabled(elementId, isDisabled) {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = !!isDisabled;
        }
    }

    function highlightElement(elementId, highlightClass = 'element-flash-highlight', duration = 1500) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(highlightClass);
            void element.offsetWidth;
            element.classList.add(highlightClass);
            setTimeout(() => element.classList.remove(highlightClass), duration);
        }
    }

    function attachRowCollapseListeners(tableBodyId) {
        if (!tableBodyId || collapseEventListenersAttached.has(tableBodyId)) return;
        const tableBodyElement = document.getElementById(tableBodyId);
        if (!tableBodyElement) return;
        const handleCollapseEvent = (event) => {
            const triggerRow = event.target.closest('tr.sub-row')?.previousElementSibling;
            if (!triggerRow) return;
            const icon = triggerRow.querySelector('.row-toggle-icon');
            if (icon) {
                const isShowing = event.type.startsWith('show');
                icon.classList.toggle('fa-chevron-up', isShowing);
                icon.classList.toggle('fa-chevron-down', !isShowing);
            }
        };
        tableBodyElement.addEventListener('show.bs.collapse', handleCollapseEvent);
        tableBodyElement.addEventListener('hide.bs.collapse', handleCollapseEvent);
        collapseEventListenersAttached.add(tableBodyId);
    }

    function renderTabContent(tabId, renderFunction) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) return;
        updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');
        try {
            const contentHTML = renderFunction();
            updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">No content generated.</p>');
        } catch (error) {
            const errorMessage = `<div class="alert alert-danger m-3">Error loading tab: ${error.message}</div>`;
            updateElementHTML(containerId, errorMessage);
            showToast(`Error loading tab '${tabId}'.`, 'danger');
        }
    }

    function showQuickGuide() {
        if (quickGuideModalInstance) {
            quickGuideModalInstance.show();
            return;
        }
        let modalElement = document.getElementById('quick-guide-modal');
        if (!modalElement) {
            const appVersion = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.APP_VERSION : '3.0.1';
            const quickGuideContent = `
                <h2>1. Introduction</h2>
                <p>The <strong>Nodal Staging: Avocado Sign vs. T2 Criteria</strong> analysis tool is a client-side web application designed for scientific research in the radiological diagnosis of rectal cancer. It enables in-depth analyses and detailed comparisons of diagnostic performance for various MRI-based criteria for assessing mesorectal lymph node status (N-status). The application focuses on evaluating the novel "Avocado Sign" (AS) against established T2-weighted (T2w) morphological criteria. It is intended solely as a <strong>research instrument</strong>. The results are <strong>not for clinical diagnosis or direct patient treatment decisions</strong>. </p>
                <h3>Core functionalities include:</h3>
                <ul>
                    <li>Interactive exploration and visualization of pseudonymized patient data.</li>
                    <li>Flexible definition and immediate application of complex T2w criteria sets.</li>
                    <li>Automated identification of optimal T2w criteria combinations via an integrated brute-force optimization algorithm.</li>
                    <li>Comprehensive statistical evaluation of diagnostic performance (sensitivity, specificity, predictive values, accuracy, AUC with CIs and p-values).</li>
                    <li>Generation of manuscript drafts and materials for scientific publications (specifically tailored to <em>Radiology</em> journal requirements).</li>
                    <li>Creation of content for scientific presentations.</li>
                    <li>Versatile export options for data, results, and graphics.</li>
                </ul>
                <p>The application operates on a fixed, integrated, pseudonymized dataset of <strong>106 patient cases</strong>.
                </p>
                <h2>2. Global UI Elements</h2>
                <ul>
                    <li><strong>Application Title:</strong> "Nodal Staging: Avocado Sign vs. T2".</li>
                    <li><strong>Global Cohort Selection:</strong> Buttons ("Overall", "Upfront Surgery", "nRCT") to select the patient cohort, affecting all analyses and displays.</li>
                    <li><strong>Dynamic Meta-Statistics:</strong> Displays key metrics for the current cohort (total patients, N+, AS+, T2+ percentages).</li>
                    <li><strong>Main Navigation (Tab Bar):</strong> Switches between Data, Analysis, Statistics, Presentation, Publication, and Export tabs.</li>
                    <li><strong>Quick Guide Button:</strong> Opens this modal.</li>
                </ul>
                <h2>3. Core Concepts</h2>
                <ul>
                    <li><strong>Patient Cohort Selection:</strong> Filters data globally based on "Overall" (all 106 patients), "Upfront Surgery" (primary surgery), or "nRCT" (neoadjuvant chemoradiotherapy).</li>
                    <li><strong>Interactive Tooltips:</strong> Hover over UI elements for explanations.</li>
                </ul>
                <h2>4. Tab Descriptions</h2>
                <h3>4.1 Data Tab</h3>
                <ul>
                    <li><strong>Purpose:</strong> Display and explore underlying patient data.</li>
                    <li><strong>Features:</strong> Patient table with ID, Name, Sex, Age, Therapy, N/AS/T2 status, Notes. Sortable columns. Expandable rows for T2 lymph node details (size, shape, border, homogeneity, signal). "Expand All Details" button.</li>
                </ul>
                <h3>4.2 Analysis Tab</h3>
                <ul>
                    <li><strong>Purpose:</strong> Define T2 criteria, run brute-force optimization, evaluate criteria at patient level.</li>
                    <li><strong>Features:</strong> Dashboard (age, sex, therapy, N/AS/T2 distributions). "Define T2 Malignancy Criteria" card (interactive controls for Size, Shape, Border, Homogeneity, Signal, with AND/OR logic). "Apply & Save" button (persists settings). "Diagnostic Performance (Applied T2)" card (Sens, Spec, PPV, NPV, Acc, AUC). "Criteria Optimization (Brute-Force)" card (select target metric, "Start Optimization" with Web Worker, real-time progress, "Apply Best Criteria"). Analysis table with patient N, AS, T2 status and expandable T2 lymph node evaluation.</li>
                </ul>
                <h3>4.3 Statistics Tab</h3>
                <ul>
                    <li><strong>Purpose:</strong> Comprehensive statistical evaluation of AS and T2 criteria.</li>
                    <li><strong>Features:</strong> "Single View" / "Comparison" layout toggle. Displays Descriptive Statistics, Diagnostic Performance (AS vs. N and T2 vs. N), Statistical Comparison (AS vs. T2 via McNemar's and DeLong's tests), Association Analyses (OR, RD, Phi), and Cohort Comparison (unpaired tests). Criteria Comparison table with AS, applied T2, and literature-based sets.</li>
                </ul>
                <h3>4.4 Presentation Tab</h3>
                <ul>
                    <li><strong>Purpose:</strong> Formats selected analysis results for scientific presentations.</li>
                    <li><strong>Features:</strong> "AS Performance" / "AS vs. T2 Comparison" view selection. T2 Comparison Basis Selection (applied or literature). Dynamic content (info cards, comparison tables, statistical tests, bar charts). Download functions (CSV, MD, PNG, SVG).</li>
                </ul>
                <h3>4.5 Publication Tab</h3>
                <ul>
                    <li><strong>Purpose:</strong> Assists in writing scientific manuscripts, generating text, tables, and figures adhering to <em>Radiology</em> journal style.</li>
                    <li><strong>Features:</strong> Section Navigation (Abstract, Intro, Methods, Results, Discussion, References). BF Target Metric Selection. Dynamically generated, professionally formulated English text integrating data and results (e.g., P < .001). Embedded tables and figures. Stylistic adherence (abbreviations, reporting language).</li>
                </ul>
                <h3>4.6 Export Tab</h3>
                <ul>
                    <li><strong>Purpose:</strong> Exports raw data, analysis results, tables, figures, and publication texts.</li>
                    <li><strong>Features:</strong> "Single Exports" and "Export Packages (.zip)" categories. Available exports: Raw data (CSV), data lists (MD), analysis tables (MD), comprehensive statistics (CSV), brute-force report (TXT), all charts/tables (PNG, SVG in ZIP), comprehensive HTML analysis report, bundled Markdown publication sections. All exports are context-aware (current cohort, applied T2 criteria).</li>
                </ul>
                <h2>5. Technical Appendix</h2>
                <ul>
                    <li><strong>Configuration:</strong> <code>js/config.js</code> centralizes settings, UI texts, statistical constants, and publication configurations.</li>
                    <li><strong>Glossary of Key Terms:</strong> AS (Avocado Sign), AUC (Area Under the Curve), BF (Brute-Force), CI (Confidence Interval), nRCT (Neoadjuvant Chemoradiotherapy), NPV (Negative Predictive Value), OR (Odds Ratio), PPV (Positive Predictive Value), RD (Risk Difference), T2w (T2-weighted).</li>
                </ul>
                <p class="small text-muted text-end"><em>Description generated for Application Version ${appVersion}. Last updated: June 12, 2025.</em></p>
            `;
            const modalHTML = `
                <div class="modal fade" id="quick-guide-modal" tabindex="-1" aria-labelledby="quickGuideModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content modal-glass">
                      <div class="modal-header">
                        <h5 class="modal-title" id="quickGuideModalLabel">Quick Guide & Notes</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">${quickGuideContent}</div>
                      <div class="modal-footer"><button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button></div>
                    </div>
                  </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modalElement = document.getElementById('quick-guide-modal');
        }
        if (modalElement && !quickGuideModalInstance) {
             quickGuideModalInstance = new bootstrap.Modal(modalElement);
        }
        if (quickGuideModalInstance) quickGuideModalInstance.show();
    }

    function updateHeaderStatsUI(stats) {
        if (!stats) return;
        updateElementText('header-cohort', stats.cohort);
        updateElementText('header-patient-count', stats.patientCount);
        updateElementText('header-status-n', stats.statusN);
        updateElementText('header-status-as', stats.statusAS);
        updateElementText('header-status-t2', stats.statusT2);
    }

    function updateCohortButtonsUI(currentCohort) {
        Object.values(APP_CONFIG.COHORTS).forEach(cohort => {
            const button = document.getElementById(`btn-cohort-${cohort.id}`);
            if (button) {
                button.classList.toggle('active', cohort.id === currentCohort);
            }
        });
    }

    function updateExportButtonStates(activeTabId, hasBruteForceResults, hasData) {
        const bfModalExportBtn = document.getElementById('export-bruteforce-modal-txt');
        if (bfModalExportBtn) {
            setElementDisabled(bfModalExportBtn.id, !hasBruteForceResults);
        }
        const exportTabButtons = document.querySelectorAll('#export-pane button[id^="export-"]');
        exportTabButtons.forEach(button => {
            if (button.id.includes('bruteforce')) {
                setElementDisabled(button.id, !hasBruteForceResults);
            } else {
                setElementDisabled(button.id, !hasData);
            }
        });
    }

    function updateStatisticsSelectorsUI(layout, cohort1, cohort2) {
        const layoutToggleBtn = document.getElementById('statistics-toggle-comparison');
        const cohortSelectorsContainer = document.getElementById('statistics-cohort-selectors');
        if (layoutToggleBtn) {
            layoutToggleBtn.classList.toggle('active', layout === 'vergleich');
            layoutToggleBtn.textContent = layout === 'vergleich' ? 'Comparison Active' : 'Single View';
        }
        if (cohortSelectorsContainer) {
            cohortSelectorsContainer.style.display = layout === 'vergleich' ? 'flex' : 'none';
        }
        const select1 = document.getElementById('statistics-cohort-select-1');
        if (select1) {
            select1.value = cohort1;
        }
        const select2 = document.getElementById('statistics-cohort-select-2');
        if (select2) {
            select2.value = cohort2;
        }
    }

    function updatePresentationViewUI(currentView, currentStudyId) {
        const viewAsPerf = document.getElementById('view-as-perf');
        const viewAsVsT2 = document.getElementById('view-as-vs-t2');
        if (viewAsPerf) {
            viewAsPerf.checked = currentView === 'as-pur';
        }
        if (viewAsVsT2) {
            viewAsVsT2.checked = currentView === 'as-vs-t2';
        }

        const presStudySelect = document.getElementById('pres-study-select');
        if (presStudySelect) {
            presStudySelect.value = currentStudyId || '';
            presStudySelect.disabled = currentView === 'as-pur';
        }
    }

    function updatePublicationUI(currentSectionId, currentBruteForceMetric) {
        document.querySelectorAll('#publication-sections-nav .nav-link').forEach(link => {
            if (link) {
                link.classList.toggle('active', link.dataset.sectionId === currentSectionId);
            }
        });
        const bfMetricSelect = document.getElementById('publication-bf-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.value = currentBruteForceMetric;
        }
    }

    function updateT2CriteriaControlsUI(currentCriteria, currentLogic) {
        if (!currentCriteria) return;
        const sizeRangeInput = document.getElementById('range-size');
        const sizeValueDisplay = document.getElementById('value-size');
        const sizeManualInput = document.getElementById('input-size');
        const logicSwitch = document.getElementById('t2-logic-switch');
        const logicLabel = document.getElementById('t2-logic-label');

        Object.keys(currentCriteria).forEach(key => {
            if (key === 'logic') return;
            const criterion = currentCriteria[key];
            const checkbox = document.getElementById(`check-${key}`);
            const optionsContainer = checkbox?.closest('.criteria-group')?.querySelector('.criteria-options-container');
            if (checkbox) checkbox.checked = criterion.active;
            if (key === 'size') {
                if (sizeRangeInput) { sizeRangeInput.value = criterion.threshold; sizeRangeInput.disabled = !criterion.active; }
                if (sizeValueDisplay) { sizeValueDisplay.textContent = formatNumber(criterion.threshold, 1); }
                if (sizeManualInput) { sizeManualInput.value = formatNumber(criterion.threshold, 1, '', true); sizeManualInput.disabled = !criterion.active; }
            } else if (optionsContainer) {
                optionsContainer.querySelectorAll('.t2-criteria-button').forEach(button => {
                    button.classList.toggle('active', criterion.active && button.dataset.value === criterion.value);
                    button.classList.toggle('inactive-option', !criterion.active);
                    button.disabled = !criterion.active;
                });
            }
        });
        if (logicSwitch) logicSwitch.checked = currentLogic === 'OR';
        if (logicLabel) logicLabel.textContent = APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[currentLogic] || currentLogic;
    }

    function updateBruteForceUI(status, payload = {}, isWorkerAvailable = false, currentCohort = null) {
        const container = document.getElementById('brute-force-card-container');
        if (!container) return;
        let contentHTML = '';
        let showResultControls = false;
        const cohortDisplayName = getCohortDisplayName(currentCohort);

        if (!isWorkerAvailable) {
            contentHTML = `<p class="text-danger small p-3">Web Workers are not supported. Brute-force optimization is unavailable.</p>`;
        } else if (status === 'started' || status === 'progress') {
            const progress = (payload.total > 0) ? (payload.tested / payload.total) * 100 : 0;
            const currentBestText = payload.currentBest ? `Current best ${payload.metric}: ${formatNumber(payload.currentBest.metricValue, 4, 'N/A', true)}` : 'Searching...';
            const totalDisplay = payload.total > 0 ? formatNumber(payload.total, 0) : '...';
            contentHTML = `
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-3" style="height: 20px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">${formatPercent(progress/100, 0)}</div>
                    </div>
                    <span class="small text-muted text-nowrap">Tested: ${formatNumber(payload.tested, 0)} / ${totalDisplay}</span>
                </div>
                <p class="small text-muted mt-2 mb-0">${currentBestText}</p>
            `;
        } else {
            const bfResult = bruteForceManager.getResultsForCohort(currentCohort);
            if (bfResult && bfResult.bestResult) {
                const best = bfResult.bestResult;
                const criteriaDisplay = studyT2CriteriaManager.formatCriteriaForDisplay(best.criteria, best.logic);
                let cohortStats = `(N=${bfResult.nTotal}, N+: ${bfResult.nPlus}, N-: ${bfResult.nMinus})`;

                const resultTooltipTemplate = `Best result of the completed brute-force optimization for the selected cohort ([N_TOTAL] patients, including [N_PLUS] N+ and [N_MINUS] N-) and the target metric.`;
                const resultTooltip = resultTooltipTemplate
                    .replace('[N_TOTAL]', bfResult.nTotal)
                    .replace('[N_PLUS]', bfResult.nPlus)
                    .replace('[N_MINUS]', bfResult.nMinus);

                contentHTML = `
                    <p class="small text-muted" data-tippy-content="${resultTooltip}">
                        <strong>Optimization complete for cohort '${cohortDisplayName}'.</strong><br>
                        Best ${bfResult.metric}: <strong class="text-primary">${formatNumber(best.metricValue, 4, 'N/A', true)}</strong><br>
                        Criteria: <code>${criteriaDisplay}</code><br>
                        Duration: ${formatNumber(bfResult.duration / 1000, 1, 'N/A', true)}s for ${formatNumber(bfResult.totalTested, 0)} combinations.
                    </p>
                `;
                showResultControls = true;
            } else if (status === 'cancelled') {
                 contentHTML = `<p class="text-warning small p-3">Brute-force optimization was cancelled for cohort '${cohortDisplayName}'.</p>`;
            } else {
                contentHTML = `<p class="text-muted small p-3">No brute-force optimization has been performed yet for cohort '${cohortDisplayName}'.</p>`;
            }
        }

        const infoTooltipTemplate = `Shows the status of the optimization worker and the currently analyzed patient cohort: [COHORT_NAME].`;
        const cardTitleTooltip = infoTooltipTemplate.replace('[COHORT_NAME]', `<strong>${cohortDisplayName}</strong>`);
        const isRunning = status === 'started' || status === 'progress';

        container.innerHTML = `
            <div class="card h-100" id="brute-force-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span data-tippy-content="${cardTitleTooltip}">Criteria Optimization (Brute-Force)</span>
                    <div class="d-flex align-items-center">
                        <label for="brute-force-metric" class="me-2 small text-muted" data-tippy-content="Select the target metric for the brute-force optimization.">Target:</label>
                        <select class="form-select form-select-sm me-2" id="brute-force-metric" ${isRunning ? 'disabled' : ''}>
                            ${APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(metric => `<option value="${metric.value}" ${payload.metric === metric.value ? 'selected' : ''}>${metric.label}</option>`).join('')}
                        </select>
                        <button class="btn btn-sm btn-success me-2" id="btn-start-brute-force" data-tippy-content="Starts the brute-force search." ${isRunning || !isWorkerAvailable ? 'disabled' : ''}><i class="fas fa-play me-1"></i> Start</button>
                        <button class="btn btn-sm btn-danger me-2" id="btn-cancel-brute-force" ${!isRunning ? 'disabled' : ''}><i class="fas fa-stop me-1"></i> Cancel</button>
                        <button class="btn btn-sm btn-primary" id="btn-apply-best-bf-criteria" ${!showResultControls || isRunning ? 'disabled' : ''}><i class="fas fa-magic me-1"></i> Apply Best</button>
                        <button class="btn btn-sm btn-outline-info ms-2" ${!showResultControls ? 'disabled' : ''} data-bs-toggle="modal" data-bs-target="#brute-force-modal" id="btn-show-bf-details" data-tippy-content="Opens a window with the top 10 results."><i class="fas fa-info-circle"></i> Top 10</button>
                    </div>
                </div>
                <div class="card-body">
                    ${contentHTML}
                </div>
            </div>
        `;
        initializeTooltips(container);
    }

    function updateSortIcons(tableHeaderId, sortState) {
        const tableHeader = document.getElementById(tableHeaderId);
        if (!tableHeader) return;
        tableHeader.querySelectorAll('th[data-sort-key]').forEach(th => {
            const sortKey = th.dataset.sortKey;
            const sortIcon = th.querySelector('.fa-sort, .fa-sort-up, .fa-sort-down');
            if (sortIcon) {
                sortIcon.className = 'fas fa-sort text-muted opacity-50 ms-1';
            }
            if (sortKey === 'status') {
                 th.querySelectorAll('.sortable-sub-header').forEach(sub => {
                     sub.style.fontWeight = 'normal';
                     sub.style.textDecoration = 'none';
                 });
            }
        });
        if (sortState?.key) {
            const activeTh = tableHeader.querySelector(`th[data-sort-key="${sortState.key}"]`);
            if (activeTh) {
                const activeIcon = activeTh.querySelector('.fa-sort, .fa-sort-up, .fa-sort-down');
                if (activeIcon) {
                    activeIcon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1`;
                }
                if (sortState.key === 'status' && sortState.subKey) {
                    const activeSub = activeTh.querySelector(`.sortable-sub-header[data-sub-key="${sortState.subKey}"]`);
                    if(activeSub) {
                        activeSub.style.fontWeight = 'bold';
                        activeSub.style.textDecoration = 'underline';
                    }
                }
            }
        }
    }

    function markCriteriaSavedIndicator(isUnsaved) {
        const criteriaCard = document.getElementById('t2-criteria-card');
        if (criteriaCard) {
            criteriaCard.classList.toggle('criteria-unsaved-indicator', isUnsaved);
            let instance = criteriaCard._tippy;
            const unsavedTooltipText = "<strong>Attention:</strong> There are unsaved changes to the T2 criteria or logic. Click 'Apply & Save' to update the results and save the settings.";
            if (isUnsaved && !instance) {
                tippy(criteriaCard, {
                    content: unsavedTooltipText,
                    theme: 'warning',
                    placement: 'top',
                });
            } else if (instance) {
                instance.setProps({
                    content: unsavedTooltipText,
                });
                if (isUnsaved) instance.enable(); else instance.disable();
            }
        }
    }

    function toggleAllDetails(tableBodyId, buttonId) {
        const tableBody = document.getElementById(tableBodyId);
        const toggleButton = document.getElementById(buttonId);
        if (!tableBody || !toggleButton) return;

        const isExpanding = toggleButton.dataset.action === 'expand';
        const collapseElements = tableBody.querySelectorAll('.collapse');

        collapseElements.forEach(collapseEl => {
            const bsCollapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl, { toggle: false });
            if (isExpanding) bsCollapse.show(); else bsCollapse.hide();
        });

        toggleButton.dataset.action = isExpanding ? 'collapse' : 'expand';
        const expandAllTooltip = "Expand All Details";
        const collapseAllTooltip = "Collapse All Details";
        toggleButton.innerHTML = isExpanding
            ? `Collapse All Details <i class="fas fa-chevron-up ms-1"></i>`
            : `Expand All Details <i class="fas fa-chevron-down ms-1"></i>`;
        toggleButton.setAttribute('data-tippy-content', isExpanding ? collapseAllTooltip : expandAllTooltip);
    }


    return Object.freeze({
        showToast,
        initializeTooltips,
        updateElementText,
        updateElementHTML,
        toggleElementClass,
        setElementDisabled,
        highlightElement,
        attachRowCollapseListeners,
        renderTabContent,
        showQuickGuide,
        updateHeaderStatsUI,
        updateCohortButtonsUI,
        updateExportButtonStates,
        updateStatisticsSelectorsUI,
        updatePresentationViewUI,
        updatePublicationUI,
        updateT2CriteriaControlsUI,
        updateBruteForceUI,
        updateSortIcons,
        markCriteriaSavedIndicator,
        toggleAllDetails,
    });
})();
