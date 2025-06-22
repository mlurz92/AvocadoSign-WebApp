window.uiComponents = (() => {

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', cohortDisplayName = '') {
        const tooltipKey = chartId ? chartId.replace(/^chart-dash-/, '').replace(/-/g, '') : title.toLowerCase().replace(/\s+/g, '');
        
        const tooltipConfig = window.APP_CONFIG.UI_TEXTS.tooltips.descriptiveStatistics;
        let tooltipContent = title || '';
        if (tooltipConfig && tooltipConfig[tooltipKey] && tooltipConfig[tooltipKey].description) {
            tooltipContent = tooltipConfig[tooltipKey].description;
        }

        if (cohortDisplayName) {
            tooltipContent = tooltipContent.replace('[COHORT]', `<strong>${cohortDisplayName}</strong>`);
        }

        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses} d-flex justify-content-between align-items-center" data-tippy-content="${tooltipContent}">
                        <span class="text-truncate">${title}</span>
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between ${bodyClasses}">
                        <div class="dashboard-card-content">${content}</div>
                        ${chartId ? `<div id="${chartId}" class="mt-1 w-100 dashboard-chart-container"></div>` : ''}
                    </div>
                </div>
            </div>`;
    }

    function createT2CriteriaControls(initialCriteria, initialLogic) {
        if (!initialCriteria || !initialLogic) return '<p class="text-danger">Error: Could not load initial criteria.</p>';
        const logicChecked = initialLogic === 'OR';
        const defaultCriteria = getDefaultT2Criteria();
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteria.size.threshold;
        const { min, max, step } = window.APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE;
        const formattedThresholdForInput = formatNumber(sizeThreshold, 1, '5.0', true);

        const createButtonOptions = (key, isChecked, criterionLabel) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = window.APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey];
            if (!Array.isArray(values)) return '';
            const currentValue = initialCriteria[key]?.value;

            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = getT2IconSVG(key, value);
                const buttonTooltip = `Set criterion '${criterionLabel}' to '${value}'. ${isChecked ? '' : '(Criterion is currently inactive)'}`;
                
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${!isChecked ? 'inactive-option' : ''}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${!isChecked ? 'disabled' : ''}>${icon}</button>`;
            }).join('');
        };

        const createCriteriaGroup = (key, label, tooltipKey, contentGenerator) => {
            const isChecked = initialCriteria[key]?.active === true;
            let tooltip = window.APP_CONFIG.UI_TEXTS.tooltips[tooltipKey]?.description || label;
            if (tooltipKey === 't2Size') {
                tooltip = tooltip.replace('[MIN]', min).replace('[MAX]', max).replace('[STEP]', step);
            }
            return `
                <div class="col-md-6 criteria-group">
                    <div class="form-check mb-2">
                        <input class="form-check-input criteria-checkbox" type="checkbox" value="${key}" id="check-${key}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label fw-bold" for="check-${key}">${label}</label>
                         <span data-tippy-content="${tooltip}"> <i class="fas fa-info-circle text-muted ms-1"></i></span>
                    </div>
                    <div class="criteria-options-container ps-3">
                        ${contentGenerator(key, isChecked, label)}
                    </div>
                </div>`;
        };

        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>Define T2 Malignancy Criteria</span>
                    <div class="form-check form-switch" data-tippy-content="${window.APP_CONFIG.UI_TEXTS.tooltips.t2Logic.description}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">Logic:</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${window.APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[initialLogic] || initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', 'Size', 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${min}" max="${max}" step="${step}" value="${formattedThresholdForInput}" ${!isChecked ? 'disabled' : ''} data-tippy-content="Set short-axis diameter threshold (≥).">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${min}" max="${max}" step="${step}" value="${formattedThresholdForInput}" ${!isChecked ? 'disabled' : ''} style="width: 70px;" aria-label="Enter size manually" data-tippy-content="Enter threshold manually.">
                            </div>
                        `)}
                        ${createCriteriaGroup('shape', 'Shape', 't2Shape', createButtonOptions)}
                        ${createCriteriaGroup('border', 'Border', 't2Border', createButtonOptions)}
                        ${createCriteriaGroup('homogeneity', 'Homogeneity', 't2Homogeneity', createButtonOptions)}
                        ${createCriteriaGroup('signal', 'Signal', 't2Signal', createButtonOptions)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${window.APP_CONFIG.UI_TEXTS.tooltips.t2Actions.reset}">
                                <i class="fas fa-undo me-1"></i> Reset to Default
                            </button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${window.APP_CONFIG.UI_TEXTS.tooltips.t2Actions.apply}">
                                <i class="fas fa-check me-1"></i> Apply & Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createStatisticsCard(id, title, content = '', addPadding = true, tooltipKey = null, cohortId = '') {
        let cardTooltipHtml = `data-tippy-content="${title}"`;
        if (tooltipKey && window.APP_CONFIG.UI_TEXTS.tooltips[tooltipKey] && window.APP_CONFIG.UI_TEXTS.tooltips[tooltipKey].cardTitle) {
            let tooltipTemplate = window.APP_CONFIG.UI_TEXTS.tooltips[tooltipKey].cardTitle;
            let cohortName = cohortId ? getCohortDisplayName(cohortId) : 'the current cohort';
            let finalTooltip = tooltipTemplate.replace('[COHORT]', `<strong>${cohortName}</strong>`);
            cardTooltipHtml = `data-tippy-content="${finalTooltip}"`;
        }
        
        return `
            <div class="col-12 stat-card" id="${id}-card-container">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center" ${cardTooltipHtml}>
                         <span>${title}</span>
                     </div>
                    <div class="card-body ${addPadding ? '' : 'p-0'}" style="overflow-y: auto; overflow-x: hidden;">
                        <div id="${id}-content">${content}</div>
                    </div>
                </div>
            </div>`;
    }

    function createPublicationNav(currentSectionId) {
        const navItems = window.PUBLICATION_CONFIG.sections.map(mainSection => {
            const sectionLabel = window.APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey] || mainSection.id.replace(/_/g, ' ');
            const isMainActive = mainSection.id === currentSectionId || (mainSection.subSections && mainSection.subSections.some(sub => sub.id === currentSectionId));
            
            let subNavHTML = '';
            if (isMainActive && mainSection.subSections && mainSection.subSections.length > 0) {
                subNavHTML += '<ul class="nav flex-column ps-3 mt-1 mb-2">';
                mainSection.subSections.forEach(sub => {
                    const isSubActive = sub.id === currentSectionId;
                    subNavHTML += `
                        <li class="nav-item">
                            <a class="nav-link nav-link-sub py-1 publication-section-link ${isSubActive ? 'active' : ''}" href="#" data-section-id="${sub.id}" data-tippy-content="${sub.label}">
                                ${sub.label}
                            </a>
                        </li>`;
                });
                subNavHTML += '</ul>';
            }
            
            const mainLinkClass = (mainSection.subSections && mainSection.subSections.length > 0) ? 'nav-link-main' : '';
            const wordCountSpan = mainSection.limit ? '<span class="word-count-indicator"></span>' : '';

            return `
                <li class="nav-item">
                    <a class="nav-link py-2 publication-section-link d-flex justify-content-between align-items-center ${mainLinkClass} ${isMainActive && !subNavHTML ? 'active' : ''}" href="#" data-section-id="${mainSection.id}" data-tippy-content="${sectionLabel}">
                        ${sectionLabel}
                        ${wordCountSpan}
                    </a>
                    ${subNavHTML}
                </li>`;
        }).join('');

        return `<nav id="publication-sections-nav" class="nav flex-column nav-pills">${navItems}</nav>`;
    }

    function createBruteForceModalContent(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) {
            return '<p class="text-center text-muted">No brute-force results available.</p>';
        }

        const formatCriteriaFunc = typeof window.studyT2CriteriaManager !== 'undefined' ? window.studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
        const { results, metric, duration, totalTested, cohort, nTotal, nPlus, nMinus } = resultsData;

        let html = `
            <div class="mb-4">
                <h5>Optimization Summary for Cohort: ${getCohortDisplayName(cohort)}</h5>
                <ul class="list-unstyled small mb-2">
                    <li><strong>Target Metric:</strong> ${metric}</li>
                    <li><strong>Total Combinations Tested:</strong> ${formatNumber(totalTested, 0)}</li>
                    <li><strong>Duration:</strong> ${formatNumber(duration / 1000, 1, 'N/A', true)} seconds</li>
                    <li><strong>Patient Count (N):</strong> ${formatNumber(nTotal, 0)} (N+: ${formatNumber(nPlus, 0)}, N-: ${formatNumber(nMinus, 0)})</li>
                </ul>
            </div>
            <h5>Top Results (including ties):</h5>
            <div class="table-responsive">
                <table class="table table-sm table-striped small" id="bruteforce-results-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>${metric}</th>
                            <th>Logic</th>
                            <th>Criteria</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let rank = 1;
        let displayedCount = 0;
        let lastMetricValue = -Infinity;
        const precision = 1e-8;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue;

            const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision));
            const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));

            let currentRank = rank;
            const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > precision;

            if (i > 0 && isNewRank) {
                rank = displayedCount + 1;
                currentRank = rank;
            } else if (i > 0) {
                currentRank = rank;
            }

            if (rank > 10 && isNewRank) {
                break;
            }

            html += `
                <tr>
                    <td>${currentRank}</td>
                    <td>${formatNumber(result.metricValue, 4, 'N/A', true)}</td>
                    <td>${result.logic.toUpperCase()}</td>
                    <td><code>${formatCriteriaFunc(result.criteria, result.logic)}</code></td>
                </tr>
            `;

            if (isNewRank || i === 0) {
                lastMetricValue = result.metricValue;
            }
            displayedCount++;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    function createBruteForceOverviewTableHTML(allBfResultsByCohort) {
        if (!allBfResultsByCohort || Object.keys(allBfResultsByCohort).length === 0) {
            return '<p class="text-muted small p-3">No saved brute-force optimization results available. Run optimization on the Analysis tab.</p>';
        }

        const formatCriteriaFunc = typeof window.studyT2CriteriaManager !== 'undefined' ? window.studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
        const na = window.APP_CONFIG.NA_PLACEHOLDER;
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-sm table-striped small caption-top">
                    <caption>Saved Brute-Force Optima</caption>
                    <thead>
                        <tr>
                            <th>Cohort</th>
                            <th>Target Metric</th>
                            <th>Best Value</th>
                            <th>Criteria</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        const cohortOrder = ['Overall', 'surgeryAlone', 'neoadjuvantTherapy'];
        let hasContent = false;

        cohortOrder.forEach(cohortId => {
            if (allBfResultsByCohort[cohortId]) {
                const cohortResults = allBfResultsByCohort[cohortId];
                Object.keys(cohortResults).forEach(metricName => {
                    const result = cohortResults[metricName];
                    if(result && result.bestResult) {
                        hasContent = true;
                        tableHTML += `
                            <tr>
                                <td>${getCohortDisplayName(cohortId)}</td>
                                <td>${metricName}</td>
                                <td>${formatNumber(result.bestResult.metricValue, 4, na, true)}</td>
                                <td><code>${formatCriteriaFunc(result.bestResult.criteria, result.bestResult.logic, true)}</code></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary p-0 px-2" 
                                            data-action="apply-saved-bf" 
                                            data-cohort="${cohortId}" 
                                            data-metric="${metricName}"
                                            data-tippy-content="Apply this set of criteria to the 'Define T2 Malignancy Criteria' panel.">
                                        Apply
                                    </button>
                                </td>
                            </tr>
                        `;
                    }
                });
            }
        });

        if (!hasContent) {
            return '<p class="text-muted small p-3">No saved brute-force optimization results available. Run optimization on the Analysis tab.</p>';
        }

        tableHTML += '</tbody></table></div>';
        return tableHTML;
    }

    function createBruteForceRunnerCardHTML(state, payload, bfWorkerAvailable, currentCohort, selectedMetric) {
        const metricOptions = window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS;
        let startButtonDisabled = true;
        let cancelButtonDisabled = true;
        let applyBestButtonDisabled = true;
        let showDetailsButtonDisabled = true;
        let progressHTML = '';

        const currentCohortResults = window.bruteForceManager.getAllResultsForCohort(currentCohort);
        const currentBestResultForMetric = currentCohortResults?.[selectedMetric]?.bestResult;
        const formatCriteriaFunc = typeof window.studyT2CriteriaManager !== 'undefined' ? window.studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';

        switch (state) {
            case 'initial':
                startButtonDisabled = !bfWorkerAvailable;
                cancelButtonDisabled = true;
                applyBestButtonDisabled = !currentBestResultForMetric;
                showDetailsButtonDisabled = !currentBestResultForMetric;
                progressHTML = `
                    <p class="mb-2 small text-muted">Select metric and start optimization.</p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-muted mt-2 mb-0">Progress: 0%</p>
                `;
                break;
            case 'progress':
                startButtonDisabled = true;
                cancelButtonDisabled = false;
                applyBestButtonDisabled = true;
                showDetailsButtonDisabled = true;
                const tested = payload?.tested || 0;
                const total = payload?.total || 1;
                const percent = total > 0 ? Math.floor((tested / total) * 100) : 0;
                const currentBest = payload?.currentBest;
                const currentBestInfo = currentBest ? `Current Best: <strong>${formatNumber(currentBest.metricValue, 4)}</strong> with <code>${formatCriteriaFunc(currentBest.criteria, currentBest.logic, true)}</code>` : 'No best found yet.';
                progressHTML = `
                    <p class="mb-2 small text-muted">Running on cohort: <strong>${getCohortDisplayName(currentCohort)}</strong>, Metric: <strong>${payload?.metric || selectedMetric}</strong></p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: ${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-muted mt-2 mb-0">Combinations tested: ${formatNumber(tested, 0)} / ${formatNumber(total, 0)} (${percent}%)</p>
                    <p class="small text-muted mb-0">${currentBestInfo}</p>
                `;
                break;
            case 'result':
                startButtonDisabled = !bfWorkerAvailable;
                cancelButtonDisabled = true;
                applyBestButtonDisabled = !(payload && payload.bestResult);
                showDetailsButtonDisabled = !(payload && payload.bestResult);
                const best = payload;
                const durationSeconds = (best?.duration || 0) / 1000;
                progressHTML = `
                    <p class="mb-2 small text-muted">Optimization finished for cohort: <strong>${getCohortDisplayName(best?.cohort || currentCohort)}</strong>, Metric: <strong>${best?.metric || selectedMetric}</strong></p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-muted mt-2 mb-0">Total Tested: ${formatNumber(best?.totalTested || 0, 0)} in ${formatNumber(durationSeconds, 1)} seconds</p>
                    <p class="small text-muted mb-0">Best Result: <strong>${formatNumber(best?.bestResult?.metricValue, 4)}</strong> with <code>${formatCriteriaFunc(best?.bestResult?.criteria, best?.bestResult?.logic, true)}</code></p>
                `;
                break;
            case 'cancelled':
                startButtonDisabled = !bfWorkerAvailable;
                cancelButtonDisabled = true;
                applyBestButtonDisabled = !currentBestResultForMetric;
                showDetailsButtonDisabled = !currentBestResultForMetric;
                progressHTML = `
                    <p class="mb-2 small text-muted">Optimization cancelled for cohort: <strong>${getCohortDisplayName(payload?.cohort || currentCohort)}</strong>.</p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar bg-warning" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-muted mt-2 mb-0">Progress: Cancelled</p>
                `;
                break;
            case 'error':
                startButtonDisabled = !bfWorkerAvailable;
                cancelButtonDisabled = true;
                applyBestButtonDisabled = !currentBestResultForMetric;
                showDetailsButtonDisabled = !currentBestResultForMetric;
                progressHTML = `
                    <p class="mb-2 small text-danger">Error during optimization for cohort: <strong>${getCohortDisplayName(payload?.cohort || currentCohort)}</strong>.</p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar bg-danger" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-danger mt-2 mb-0">Error: ${payload?.message || 'Unknown error'}</p>
                `;
                break;
            default:
                 progressHTML = `<p class="text-muted small">Waiting for state...</p>`;
        }

        const content = `
            <div class="p-3">
                <div class="mb-3">
                    <label for="brute-force-metric" class="form-label small text-muted mb-1">Optimize for Metric:</label>
                    <select class="form-select form-select-sm" id="brute-force-metric" ${window.bruteForceManager.isRunning() ? 'disabled' : ''}>
                        ${metricOptions.map(m => `<option value="${m.value}" ${m.value === selectedMetric ? 'selected' : ''}>${m.label}</option>`).join('')}
                    </select>
                </div>
                ${progressHTML}
                <div class="d-flex justify-content-end mt-3">
                    <button class="btn btn-sm btn-outline-primary me-2" id="btn-start-brute-force" ${startButtonDisabled ? 'disabled' : ''}><i class="fas fa-play me-1"></i> Start</button>
                    <button class="btn btn-sm btn-outline-warning me-2" id="btn-cancel-brute-force" ${cancelButtonDisabled ? 'disabled' : ''}><i class="fas fa-stop me-1"></i> Cancel</button>
                    <button class="btn btn-sm btn-info me-2" id="btn-show-bf-details" ${showDetailsButtonDisabled ? 'disabled' : ''}><i class="fas fa-info-circle me-1"></i> Top 10</button>
                    <button class="btn btn-sm btn-success" id="btn-apply-best-bf-criteria" data-metric="${selectedMetric}" ${applyBestButtonDisabled ? 'disabled' : ''}><i class="fas fa-arrow-alt-circle-up me-1"></i> Apply Best</button>
                </div>
            </div>
        `;
        
        return createStatisticsCard('bf-runner-card', 'Criteria Optimization (Brute-Force)', content, false);
    }

    function createAnalysisContextBannerHTML(context, patientCount) {
        if (!context) return '';
        const { cohortId, criteriaName } = context;
        const cohortName = getCohortDisplayName(cohortId);
        const count = patientCount ?? '?';
        
        let text = window.APP_CONFIG.UI_TEXTS.analysisContextBanner.text
            .replace('[CRITERIA_NAME]', criteriaName || 'the selected criteria')
            .replace('[COHORT_NAME]', cohortName)
            .replace('[COUNT]', count);
        
        return `
            <div class="alert alert-info small p-2 mt-3 text-center" role="alert" id="analysis-context-banner">
                <i class="fas fa-info-circle me-1"></i>
                <strong>${window.APP_CONFIG.UI_TEXTS.analysisContextBanner.title}:</strong> ${text}
            </div>
        `;
    }

    function createAddedValueCardHTML(addedValueStats, t2SetName) {
        const na = window.APP_CONFIG.NA_PLACEHOLDER;
        const fP = (val, dig = 1) => formatPercent(val, dig, na);
        const fCI_p = (m, k) => { const d = (k === 'auc' || k === 'f1' || k === 'youden' || k === 'balAcc') ? 3 : 1; const p = !(k === 'auc' || k === 'f1' || k === 'youden' || k === 'balAcc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na); };
        
        const fpData = addedValueStats?.t2FalsePositives;
        const fnData = addedValueStats?.t2FalseNegatives;

        if (!fpData || !fnData) {
            return '<p class="text-muted small p-2">Added value analysis data not available.</p>';
        }

        const fpPerf = fpData.performanceAS;
        const fnPerf = fnData.performanceAS;

        return `
            <div class="table-responsive">
                <table class="table table-sm table-striped small mb-0">
                    <thead class="small">
                        <tr>
                            <th data-tippy-content="Analysis of subgroups where the initial T2 criteria failed.">Subgroup (T2 Failure)</th>
                            <th data-tippy-content="Number of patients in this subgroup.">N</th>
                            <th data-tippy-content="Specificity of the Avocado Sign within this subgroup.">AS Specificity</th>
                            <th data-tippy-content="Sensitivity of the Avocado Sign within this subgroup.">AS Sensitivity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>T2 False Positives (T2+, N-)</td>
                            <td>${fpData.count}</td>
                            <td data-tippy-content="Of the ${fpData.count} patients incorrectly flagged by T2, the Avocado Sign correctly identified ${fP(fpPerf?.spec?.value, 1)} as negative.">${fCI_p(fpPerf?.spec, 'spec')}</td>
                            <td>${na}</td>
                        </tr>
                        <tr>
                            <td>T2 False Negatives (T2-, N+)</td>
                            <td>${fnData.count}</td>
                            <td>${na}</td>
                            <td data-tippy-content="Of the ${fnData.count} patients missed by T2, the Avocado Sign correctly identified ${fP(fnPerf?.sens?.value, 1)} as positive.">${fCI_p(fnPerf?.sens, 'sens')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
    }

    return Object.freeze({
        createDashboardCard,
        createT2CriteriaControls,
        createStatisticsCard,
        createPublicationNav,
        createBruteForceModalContent,
        createBruteForceOverviewTableHTML,
        createBruteForceRunnerCardHTML,
        createAnalysisContextBannerHTML,
        createAddedValueCardHTML
    });
})();