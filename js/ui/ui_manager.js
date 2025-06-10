const uiManager = (() => {

    let tippyInstances = [];
    let collapseEventListenersAttached = new Set();
    let quickGuideModalInstance = null;

    function escapeHTML(text) {
        if (typeof text !== 'string') return text === null ? '' : String(text);
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, match => map[match]);
    }

    function showToast(message, type = 'info', duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS) {
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
        // Destroy existing tooltips to prevent duplicates and stale content
        tippyInstances.forEach(instance => {
            if (instance && !instance.state.isDestroyed) {
                instance.destroy();
            }
        });
        tippyInstances = [];

        const elementsInScope = Array.from(scope.matches('[data-tippy-content]') ? [scope] : scope.querySelectorAll('[data-tippy-content]'));
        const newInstances = tippy(elementsInScope, {
            allowHTML: true, theme: 'glass', placement: 'top', animation: 'fade',
            interactive: false, appendTo: () => document.body, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
            maxWidth: 400, duration: [150, 150], zIndex: 3050,
            onCreate(instance) { if (!instance.props.content || String(instance.props.content).trim() === '') { instance.disable(); } },
            onShow(instance) { const content = instance.reference.getAttribute('data-tippy-content'); return !!content && String(content).trim() !== ''; }
        });
        if (Array.isArray(newInstances)) tippyInstances = tippyInstances.concat(newInstances);
        else if (newInstances) tippyInstances.push(newInstances);
    }

    function updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = text ?? '';
    }

    function updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html ?? '';
            initializeTooltips(element); // Re-initialize tooltips for new content
        }
    }

    function toggleElementClass(elementId, className, add) {
        const element = document.getElementById(elementId);
        if (element && className) element.classList.toggle(className, add);
    }

    function setElementDisabled(elementId, isDisabled) {
        const element = document.getElementById(elementId);
        if (element) element.disabled = !!isDisabled;
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

    function getT2IconSVG(type, value) {
        const s = APP_CONFIG.UI_SETTINGS.ICON_SIZE;
        const sw = APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH;
        const iconColor = APP_CONFIG.UI_SETTINGS.ICON_COLOR;
        const c = s / 2;
        const r = (s - sw) / 2;
        const sq = s - sw * 1.5;
        const sqPos = (s - sq) / 2;
        let svgContent = '';
        let fillColor = 'none';
        const unknownIconSVG = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" stroke-dasharray="2 2" /><line x1="${sqPos}" y1="${sqPos}" x2="${sqPos+sq}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/><line x1="${sqPos+sq}" y1="${sqPos}" x2="${sqPos}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;

        switch (type) {
            case 'shape':
                if (value === 'rund') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${iconColor}" stroke-width="${sw}"/>`;
                else if (value === 'oval') svgContent = `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.65}" fill="${fillColor}" stroke="${iconColor}" stroke-width="${sw}"/>`;
                else svgContent = unknownIconSVG;
                break;
            case 'border':
                if (value === 'scharf') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${iconColor}" stroke-width="${sw * 1.2}"/>`;
                else if (value === 'irregulär') svgContent = `<path d="M ${c + r} ${c} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${r*0.8} ${r*1.2} 0 0 1 ${c-r*0.9} ${c-r*0.3} A ${r*1.1} ${r*0.7} 0 0 1 ${c+r} ${c} Z" fill="${fillColor}" stroke="${iconColor}" stroke-width="${sw * 1.2}"/>`;
                else svgContent = unknownIconSVG;
                break;
            case 'homogeneity':
                if (value === 'homogen') svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="${iconColor}" stroke="none" rx="1" ry="1"/>`;
                else if (value === 'heterogen') { const pSize = sq / 4; svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" rx="1" ry="1"/>`; for(let i=0;i<3;i++){for(let j=0;j<3;j++){if((i+j)%2===0){svgContent+=`<rect x="${sqPos+i*pSize+pSize/2}" y="${sqPos+j*pSize+pSize/2}" width="${pSize}" height="${pSize}" fill="${iconColor}" stroke="none" style="opacity:0.6;"/>`;}}} }
                else svgContent = unknownIconSVG;
                break;
            case 'signal':
                if (value === 'signalarm') fillColor = '#555555';
                else if (value === 'intermediär') fillColor = '#aaaaaa';
                else if (value === 'signalreich') fillColor = '#f0f0f0';
                else { svgContent = unknownIconSVG; break; }
                const strokeColor = (value === 'signalreich') ? '#333333' : 'rgba(0,0,0,0.1)';
                svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw * 0.75}"/>`;
                break;
            case 'ruler-horizontal':
                svgContent = `<path d="M${sw/2} ${c} H${s-sw/2} M${c} ${sw/2} V${s-sw/2}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;
                type = 'size';
                break;
            default: svgContent = unknownIconSVG;
        }
        return `<svg class="icon-t2 icon-${type}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: ${value || 'unknown'}">${svgContent}</svg>`;
    }

    function showQuickGuide() {
        let modalElement = document.getElementById('quick-guide-modal');
        if (!modalElement) {
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
                <p class="small text-muted text-end"><em>Description generated for Application Version 3.0.0. Last updated: June 10, 2025.</em></p>
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
            quickGuideModalInstance = new bootstrap.Modal(modalElement);
            initializeTooltips(modalElement); // Initialize tooltips for the modal content
        }
        if (quickGuideModalInstance) quickGuideModalInstance.show();
    }

    function updateHeaderStatsUI(stats) {
        updateElementText('header-cohort', stats.cohort);
        updateElementText('header-patient-count', stats.patientCount);
        updateElementText('header-status-n', stats.statusN);
        updateElementText('header-status-as', stats.statusAS);
        updateElementText('header-status-t2', stats.statusT2);
    }

    function updateCohortButtonsUI(currentCohort) {
        ['Gesamt', 'direkt OP', 'nRCT'].forEach(cohortId => {
            const button = document.getElementById(`btn-cohort-${cohortId.replace(/\s+/g, '-')}`);
            if (button) {
                button.classList.toggle('active', cohortId === currentCohort);
            }
        });
    }

    function updateExportButtonStates(activeTabId, hasBruteForceResults, hasData) {
        const exportBfBtn = document.getElementById('export-bruteforce-modal-txt');
        if (exportBfBtn) {
            setElementDisabled('export-bruteforce-modal-txt', !hasBruteForceResults);
        }

        const exportTabButtons = document.querySelectorAll('#export-tab-pane button[id^="export-"]');
        exportTabButtons.forEach(button => {
            if (button.id === 'export-bruteforce-txt') {
                setElementDisabled(button.id, !hasBruteForceResults);
            } else if (button.id === 'export-charts-png-zip' || button.id === 'export-charts-svg-zip') {
                // These are enabled based on presence of charts in other tabs, which is assumed
                // for simplicity here to be if data is present and tabs are functional.
                setElementDisabled(button.id, !hasData);
            } else {
                setElementDisabled(button.id, !hasData);
            }
        });
    }

    function updateStatisticsSelectorsUI(layout, cohort1, cohort2) {
        const layoutToggleBtn = document.getElementById('statistics-toggle-comparison');
        const cohort1Select = document.getElementById('statistics-cohort-select-1');
        const cohort2Select = document.getElementById('statistics-cohort-select-2');
        const cohortSelectorsContainer = document.getElementById('statistics-cohort-selectors');

        if (layoutToggleBtn) {
            layoutToggleBtn.classList.toggle('active', layout === 'vergleich');
            layoutToggleBtn.textContent = layout === 'vergleich' ? 'Comparison Active' : 'Single View';
        }

        if (cohortSelectorsContainer) {
            cohortSelectorsContainer.style.display = layout === 'vergleich' ? 'flex' : 'none';
        }

        if (cohort1Select) {
            Array.from(cohort1Select.options).forEach(option => {
                option.selected = option.value === cohort1;
            });
        }
        if (cohort2Select) {
            Array.from(cohort2Select.options).forEach(option => {
                option.selected = option.value === cohort2;
            });
        }
    }

    function updatePresentationViewUI(currentView, currentStudyId) {
        document.getElementById('view-as-perf').checked = currentView === 'as-pur';
        document.getElementById('view-as-vs-t2').checked = currentView === 'as-vs-t2';

        const presStudySelect = document.getElementById('pres-study-select');
        if (presStudySelect) {
            Array.from(presStudySelect.options).forEach(option => {
                option.selected = option.value === currentStudyId;
            });
            // Disable selection if AS Performance view is active
            presStudySelect.disabled = currentView === 'as-pur';
        }
    }

    function updatePublicationUI(currentSectionId, currentBruteForceMetric) {
        const navLinks = document.querySelectorAll('#publication-sections-nav .nav-link');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.sectionId === currentSectionId);
        });

        const bfMetricSelect = document.getElementById('publication-bf-metric-select');
        if (bfMetricSelect) {
            Array.from(bfMetricSelect.options).forEach(option => {
                option.selected = option.value === currentBruteForceMetric;
            });
        }
    }
    
    function updateT2CriteriaControlsUI(currentCriteria, currentLogic) {
        if (!currentCriteria) return;

        const sizeRangeInput = document.getElementById('range-size');
        const sizeValueDisplay = document.getElementById('value-size');
        const sizeManualInput = document.getElementById('input-size');
        const logicSwitch = document.getElementById('t2-logic-switch');
        const logicLabel = document.getElementById('t2-logic-label');

        const criteriaCard = document.getElementById('t2-criteria-card');
        if (criteriaCard) {
            const hasUnsavedChanges = t2CriteriaManager.isUnsaved();
            criteriaCard.classList.toggle('criteria-unsaved-indicator', hasUnsavedChanges);
            // Re-initialize tooltip to update its content for the unsaved indicator if it has one.
            const existingTippyInstance = tippyInstances.find(inst => inst.reference === criteriaCard);
            if (existingTippyInstance) {
                existingTippyInstance.setContent(UI_TEXTS.tooltips.t2CriteriaCard.unsavedIndicator);
                if (hasUnsavedChanges && existingTippyInstance.state.isDestroyed) {
                    existingTippyInstance.enable();
                } else if (!hasUnsavedChanges && !existingTippyInstance.state.isDestroyed) {
                    existingTippyInstance.disable();
                }
            } else if (hasUnsavedChanges) {
                // If it doesn't have an instance but should, create it.
                tippy(criteriaCard, {
                    allowHTML: true, theme: 'warning', placement: 'top', animation: 'fade',
                    interactive: false, appendTo: () => document.body, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
                    maxWidth: 400, duration: [150, 150], zIndex: 3050,
                    content: UI_TEXTS.tooltips.t2CriteriaCard.unsavedIndicator
                });
            }
        }


        Object.keys(currentCriteria).forEach(key => {
            if (key === 'logic') return;

            const criterion = currentCriteria[key];
            const checkbox = document.getElementById(`check-${key}`);
            const optionsContainer = checkbox?.closest('.criteria-group')?.querySelector('.criteria-options-container');

            if (checkbox) {
                checkbox.checked = criterion.active;
            }

            if (key === 'size') {
                if (sizeRangeInput) {
                    sizeRangeInput.value = criterion.threshold;
                    sizeRangeInput.disabled = !criterion.active;
                }
                if (sizeValueDisplay) {
                    sizeValueDisplay.textContent = formatNumber(criterion.threshold, 1);
                }
                if (sizeManualInput) {
                    sizeManualInput.value = formatNumber(criterion.threshold, 1);
                    sizeManualInput.disabled = !criterion.active;
                }
            } else {
                if (optionsContainer) {
                    const buttons = optionsContainer.querySelectorAll('.t2-criteria-button');
                    buttons.forEach(button => {
                        button.classList.toggle('active', criterion.active && button.dataset.value === criterion.value);
                        button.classList.toggle('inactive-option', !criterion.active);
                        button.disabled = !criterion.active;
                    });
                }
            }
        });

        if (logicSwitch) {
            logicSwitch.checked = currentLogic === 'OR';
        }
        if (logicLabel) {
            logicLabel.textContent = currentLogic;
        }
    }
    
    function updateBruteForceUI(status, payload = {}, isWorkerAvailable = false, currentCohort = null) {
        const bfCardContainer = document.getElementById('brute-force-card-container');
        if (!bfCardContainer) return;

        let contentHTML = '';
        let showModalButton = false;
        let exportModalButtonEnabled = false;

        const startButton = document.getElementById('btn-start-brute-force');
        const cancelButton = document.getElementById('btn-cancel-brute-force');
        const applyBestButton = document.getElementById('btn-apply-best-bf-criteria');
        const bfModalExportBtn = document.getElementById('export-bruteforce-modal-txt');

        if (!isWorkerAvailable) {
            contentHTML = `<p class="text-danger small p-3">Web Workers are not supported by your browser or failed to initialize. Brute-force optimization is unavailable.</p>`;
            if (startButton) setElementDisabled(startButton.id, true);
            if (cancelButton) setElementDisabled(cancelButton.id, true);
            if (applyBestButton) setElementDisabled(applyBestButton.id, true);
            if (bfModalExportBtn) setElementDisabled(bfModalExportBtn.id, true);
        } else if (status === 'started' || status === 'progress') {
            const progress = (payload.tested / payload.total) * 100;
            const currentBestText = payload.currentBest ? `Current best ${payload.metric}: ${formatNumber(payload.currentBest.metricValue, 4, true)}` : '';
            const totalDisplay = payload.total > 0 ? formatNumber(payload.total, 0) : '...';
            contentHTML = `
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-3" style="height: 20px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">${formatPercent(progress/100, 0)}</div>
                    </div>
                    <span class="small text-muted text-nowrap" data-tippy-content="${UI_TEXTS.tooltips.bruteForceProgress.description}">Tested: ${formatNumber(payload.tested, 0)} / ${totalDisplay}</span>
                </div>
                <p class="small text-muted mt-2 mb-0">${currentBestText}</p>
            `;
            if (startButton) setElementDisabled(startButton.id, true);
            if (cancelButton) setElementDisabled(cancelButton.id, false);
            if (applyBestButton) setElementDisabled(applyBestButton.id, true);
            if (bfModalExportBtn) setElementDisabled(bfModalExportBtn.id, true);
        } else if (status === 'result' || status === 'cancelled' || status === 'error') {
            const bfResult = bruteForceManager.getResultsForCohort(currentCohort);
            if (bfResult && bfResult.bestResult) {
                const best = bfResult.bestResult;
                const metric = bfResult.metric;
                const criteriaDisplay = studyT2CriteriaManager.formatCriteriaForDisplay(best.criteria, best.logic);
                const cohortStats = bfResult.nTotal ? `N=${bfResult.nTotal} (N+: ${bfResult.nPlus}, N-: ${bfResult.nMinus})` : '';

                contentHTML = `
                    <p class="small text-muted" data-tippy-content="${UI_TEXTS.tooltips.bruteForceResult.description.replace('[N_TOTAL]', bfResult.nTotal).replace('[N_PLUS]', bfResult.nPlus).replace('[N_MINUS]', bfResult.nMinus)}">
                        <strong>Optimization complete for cohort '${getCohortDisplayName(currentCohort)}'.</strong><br>
                        Best ${metric}: <strong class="text-primary">${formatNumber(best.metricValue, 4, true)}</strong><br>
                        Criteria: <code>${criteriaDisplay}</code> (Logic: ${best.logic})
                        ${bfResult.duration ? `<br>Duration: ${formatNumber(bfResult.duration / 1000, 1, true)}s for ${formatNumber(bfResult.totalTested, 0)} combinations.` : ''}
                        ${cohortStats ? `<span data-tippy-content="${UI_TEXTS.tooltips.bruteForceResult.cohortStats}">Cohort Stats: ${cohortStats}</span>` : ''}
                    </p>
                `;
                showModalButton = true;
                exportModalButtonEnabled = true;
            } else {
                contentHTML = `<p class="text-muted small p-3">Brute-force optimization completed, but no valid results found for cohort '${getCohortDisplayName(currentCohort)}'. Try another metric or cohort, or check data quality.</p>`;
            }
            if (startButton) setElementDisabled(startButton.id, false);
            if (cancelButton) setElementDisabled(cancelButton.id, true);
            if (applyBestButton) setElementDisabled(applyBestButton.id, showModalButton);
            if (bfModalExportBtn) setElementDisabled(bfModalExportBtn.id, !exportModalButtonEnabled);
        } else { // Initial state / No run yet
             contentHTML = `<p class="text-muted small p-3">No brute-force optimization has been performed yet for cohort '${getCohortDisplayName(currentCohort)}'.</p>`;
             if (startButton) setElementDisabled(startButton.id, false);
             if (cancelButton) setElementDisabled(cancelButton.id, true);
             if (applyBestButton) setElementDisabled(applyBestButton.id, true);
             if (bfModalExportBtn) setElementDisabled(bfModalExportBtn.id, true);
        }
        
        // Re-create the card if it doesn't exist or is in a different state
        const bfCardTitle = `Criteria Optimization (Brute-Force) <span class="badge bg-info text-dark ms-2 small" data-tippy-content="${UI_TEXTS.tooltips.bruteForceInfo.description.replace('[COHORT_NAME]', getCohortDisplayName(currentCohort))}">Cohort: ${getCohortDisplayName(currentCohort)}</span>`;
        
        bfCardContainer.innerHTML = `
            <div class="card h-100" id="brute-force-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${bfCardTitle}</span>
                    <div class="d-flex align-items-center">
                        <label for="brute-force-metric" class="me-2 small text-muted" data-tippy-content="${UI_TEXTS.tooltips.bruteForceMetric.description}">Target:</label>
                        <select class="form-select form-select-sm me-2" id="brute-force-metric" ${bruteForceManager.isRunning() ? 'disabled' : ''}>
                            ${['Balanced Accuracy', 'Accuracy', 'F1-Score', 'PPV', 'NPV'].map(metric => `<option value="${metric}" ${payload.metric === metric ? 'selected' : ''}>${metric}</option>`).join('')}
                        </select>
                        <button class="btn btn-sm btn-success me-2" id="btn-start-brute-force" data-tippy-content="${UI_TEXTS.tooltips.bruteForceStart.description}"><i class="fas fa-play me-1"></i> Start</button>
                        <button class="btn btn-sm btn-danger me-2" id="btn-cancel-brute-force" ${bruteForceManager.isRunning() ? '' : 'disabled'}><i class="fas fa-stop me-1"></i> Cancel</button>
                        <button class="btn btn-sm btn-primary" id="btn-apply-best-bf-criteria" ${!showModalButton || bruteForceManager.isRunning() ? 'disabled' : ''}><i class="fas fa-magic me-1"></i> Apply Best</button>
                        <button class="btn btn-sm btn-outline-info ms-2" ${!showModalButton ? 'disabled' : ''} data-bs-toggle="modal" data-bs-target="#brute-force-modal" id="btn-show-bf-details" data-tippy-content="${UI_TEXTS.tooltips.bruteForceDetailsButton.description}"><i class="fas fa-info-circle"></i> Top 10</button>
                    </div>
                </div>
                <div class="card-body">
                    ${contentHTML}
                </div>
            </div>
        `;
        initializeTooltips(bfCardContainer);
    }

    return Object.freeze({
        escapeHTML,
        showToast,
        initializeTooltips,
        updateElementText,
        updateElementHTML,
        toggleElementClass,
        setElementDisabled,
        highlightElement,
        attachRowCollapseListeners,
        renderTabContent,
        getT2IconSVG,
        showQuickGuide,
        updateHeaderStatsUI,
        updateCohortButtonsUI,
        updateExportButtonStates,
        updateStatisticsSelectorsUI,
        updatePresentationViewUI,
        updatePublicationUI,
        updateT2CriteriaControlsUI,
        updateBruteForceUI
    });
})();
