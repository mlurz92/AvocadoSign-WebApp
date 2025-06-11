const eventManager = (() => {
    let app;

    const debouncedUpdateSizeInput = debounce(value => {
        if (t2CriteriaManager.updateCriterionThreshold(value)) {
            if (!t2CriteriaManager.getCurrentCriteria().size?.active) {
                t2CriteriaManager.toggleCriterionActive('size', true);
            }
            uiManager.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

    function init(appInstance) {
        app = appInstance;
        document.body.addEventListener('click', handleBodyClick);
        document.body.addEventListener('change', handleBodyChange);
        document.body.addEventListener('input', handleBodyInput);
        const mainTabEl = document.getElementById('main-tabs');
        if (mainTabEl) {
            mainTabEl.addEventListener('shown.bs.tab', handleTabShown);
        }
    }

    function handleTabShown(event) {
        if (event.target?.id) {
            app.processTabChange(event.target.id.replace('-tab', ''));
        }
    }

    function handleBodyClick(event) {
        const target = event.target;
        const button = target.closest('button');
        
        if (button?.dataset.cohort) {
            app.handleCohortChange(button.dataset.cohort, "user");
            return;
        }

        if (target.closest('th[data-sort-key]')) {
            const header = target.closest('th[data-sort-key]');
            const subHeader = target.closest('.sortable-sub-header');
            handleSortClick(header, subHeader);
            return;
        }

        if (target.closest('.publication-section-link')) {
            event.preventDefault();
            handlePublicationSectionChange(target.closest('.publication-section-link').dataset.sectionId);
            return;
        }

        if (!button) return;

        const singleClickActions = {
            'btn-quick-guide': () => uiManager.showQuickGuide(),
            'data-toggle-details': () => uiManager.toggleAllDetails('data-table-body', button.id),
            'analysis-toggle-details': () => uiManager.toggleAllDetails('analysis-table-body', button.id),
            'btn-reset-criteria': () => {
                t2CriteriaManager.resetCriteria();
                uiManager.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
                uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
                uiManager.showToast('T2 criteria have been reset to default.', 'info');
            },
            'btn-apply-criteria': () => app.applyAndRefreshAll(),
            'btn-start-brute-force': () => app.startBruteForceAnalysis(),
            'btn-cancel-brute-force': () => bruteForceManager.cancelAnalysis(),
            'btn-apply-best-bf-criteria': () => app.applyBestBruteForceCriteria(),
            'statistics-toggle-comparison': () => handleStatsLayoutToggle(button),
            'export-bruteforce-modal-txt': () => exportService.exportBruteForceReport(bruteForceManager.getResultsForCohort(state.getCurrentCohort()))
        };

        if (singleClickActions[button.id] && !button.disabled) {
            singleClickActions[button.id]();
            return;
        }
        
        if (button.classList.contains('t2-criteria-button') && !button.disabled) {
            if (t2CriteriaManager.updateCriterionValue(button.dataset.criterion, button.dataset.value)) {
                uiManager.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
                uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            }
            return;
        }

        if (button.classList.contains('chart-download-btn') && !button.disabled) {
            exportService.exportSingleChart(
                button.dataset.chartId, 
                button.dataset.format, 
                state.getCurrentCohort(), 
                { chartName: button.dataset.chartName || button.dataset.defaultName }
            );
            return;
        }

        if (button.classList.contains('table-download-png-btn') && !button.disabled) {
            exportService.exportTablePNG(button.dataset.tableId, state.getCurrentCohort(), 'TABLE_PNG_EXPORT', button.dataset.tableName);
            return;
        }

        if (button.closest('#export-pane') && button.id.startsWith('export-') && !button.disabled) {
            handleExportClick(button);
            return;
        }

        if (button.closest('#presentation-tab-pane') && button.id.startsWith('download-') && !button.disabled) {
            exportService.exportPraesentationData(button.id, app.getPresentationDataForExport(), state.getCurrentCohort());
            return;
        }
    }

    function handleBodyChange(event) {
        const target = event.target;
        if (target.classList.contains('criteria-checkbox')) {
            handleT2CheckboxChange(target);
            return;
        }
        
        const changeActions = {
            't2-logic-switch': () => handleT2LogicChange(target),
            'statistics-cohort-select-1': () => handleStatsCohortChange(target),
            'statistics-cohort-select-2': () => handleStatsCohortChange(target),
            'pres-study-select': () => handlePresentationStudyChange(target.value),
            'publication-bf-metric-select': () => handlePublicationBfMetricChange(target.value)
        };
        
        if (changeActions[target.id]) {
            changeActions[target.id]();
            return;
        }

        if (target.name === 'presentationView') {
            handlePresentationViewChange(target.value);
            return;
        }
    }

    function handleBodyInput(event) {
        const target = event.target;
        if (target.id === 'range-size' || target.id === 'input-size') {
            const sizeValueDisplay = document.getElementById('value-size');
            const sizeRangeInput = document.getElementById('range-size');
            const sizeManualInput = document.getElementById('input-size');
            const newValue = formatNumber(target.value, 1, '', true);

            if (target.id === 'range-size') {
                if(sizeValueDisplay) sizeValueDisplay.textContent = formatNumber(newValue, 1);
                if(sizeManualInput) sizeManualInput.value = newValue;
            } else {
                if(sizeValueDisplay) sizeValueDisplay.textContent = formatNumber(newValue, 1);
                if(sizeRangeInput) sizeRangeInput.value = parseFloat(newValue);
            }
            debouncedUpdateSizeInput(newValue);
        }
    }

    function handleSortClick(header, subHeader) {
        const key = header.dataset.sortKey;
        if (!key) return;
        const subKey = subHeader?.dataset.subKey || null;
        const tableId = header.closest('table')?.id;
        const context = tableId === 'data-table' ? 'data' : 'analysis';
        app.handleSortRequest(context, key, subKey);
    }

    function handleT2CheckboxChange(checkbox) {
        if (t2CriteriaManager.toggleCriterionActive(checkbox.value, checkbox.checked)) {
            uiManager.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }

    function handleT2LogicChange(logicSwitch) {
        const newLogic = logicSwitch.checked ? 'OR' : 'AND';
        if (t2CriteriaManager.updateLogic(newLogic)) {
            uiManager.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
            uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
        }
    }

    function handleStatsLayoutToggle(button) {
        const newLayout = button.classList.contains('active') ? 'einzel' : 'vergleich';
        if (state.setStatsLayout(newLayout)) {
            app.updateUI();
            if (state.getActiveTabId() === 'statistics') app.refreshCurrentTab();
        }
    }

    function handleStatsCohortChange(selectElement) {
        const newValue = selectElement.value;
        let needsRender = false;
        if (selectElement.id === 'statistics-cohort-select-1') {
            needsRender = state.setStatsCohort1(newValue);
        } else if (selectElement.id === 'statistics-cohort-select-2') {
            needsRender = state.setStatsCohort2(newValue);
        }
        if (needsRender && state.getStatsLayout() === 'vergleich' && state.getActiveTabId() === 'statistics') {
            app.refreshCurrentTab();
        }
    }

    function handlePresentationViewChange(view) {
        if (state.setPresentationView(view)) {
            app.updateUI();
            if (state.getActiveTabId() === 'presentation') app.refreshCurrentTab();
        }
    }

    function handlePresentationStudyChange(studyId) {
        if (state.getPresentationStudyId() === studyId) return;
        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
        let refreshNeeded = state.setPresentationStudyId(studyId);
        if (studySet?.applicableCohort && state.getCurrentCohort() !== studySet.applicableCohort) {
            app.handleCohortChange(studySet.applicableCohort, "auto_presentation");
            refreshNeeded = false;
        }
        if (refreshNeeded) {
            app.updateUI();
            if (state.getActiveTabId() === 'presentation') app.refreshCurrentTab();
        }
    }

    function handlePublicationSectionChange(sectionId) {
        if (state.setPublicationSection(sectionId)) {
            app.updateUI();
            if (state.getActiveTabId() === 'publication') {
                app.refreshCurrentTab();
                const contentArea = document.getElementById('publication-content-area');
                if(contentArea) contentArea.scrollTo(0, 0);
            }
        }
    }

    function handlePublicationBfMetricChange(newMetric) {
        if (state.setPublicationBruteForceMetric(newMetric)) {
            app.updateUI();
            if (state.getActiveTabId() === 'publication') app.refreshCurrentTab();
        }
    }

    function handleExportClick(button) {
        const exportType = button.id.replace('export-', '');
        if (exportType.endsWith('-zip')) {
            const category = exportType.replace('-zip', '');
            exportService.exportCategoryZip(category, app.getProcessedData(), bruteForceManager.getAllResults(), state.getCurrentCohort(), t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
        } else {
            app.handleSingleExport(exportType);
        }
    }

    return {
        init
    };
})();
