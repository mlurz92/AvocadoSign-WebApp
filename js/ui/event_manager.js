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
        const header = target.closest('th[data-sort-key]');
        const subHeader = target.closest('.sortable-sub-header');
        const sectionLink = target.closest('.publication-section-link');

        if (button?.dataset.cohort) { app.handleCohortChange(button.dataset.cohort, "user"); return; }
        if (header) { handleSortClick(header, subHeader); return; }
        if (button?.classList.contains('chart-download-btn')) { 
            const chartId = button.dataset.chartId;
            const format = button.dataset.format;
            const chartName = button.dataset.chartName;
            const defaultName = button.dataset.defaultName;
            exportService.exportSingleChart(chartId, format, state.getCurrentCohort(), { chartName: chartName || defaultName }); 
            return; 
        }
        if (button?.classList.contains('table-download-png-btn')) { 
            const tableId = button.dataset.tableId;
            const tableName = button.dataset.tableName;
            exportService.exportTablePNG(tableId, state.getCurrentCohort(), 'TABLE_PNG_EXPORT', tableName); 
            return; 
        }
        if (button?.id === 'data-toggle-details') { uiManager.toggleAllDetails('data-table-body', button.id); return; }
        if (button?.id === 'analysis-toggle-details') { uiManager.toggleAllDetails('analysis-table-body', button.id); return; }
        if (button?.id === 'btn-quick-guide') { uiManager.showQuickGuide(); return; }
        if (button?.id === 'export-bruteforce-modal-txt' && !button.disabled) { exportService.exportBruteForceReport(bruteForceManager.getResultsForCohort(state.getCurrentCohort())); return; }
        if (button?.closest('#export-tab-pane') && button.id.startsWith('export-') && !button.disabled) { handleExportClick(button); return; }
        if (button?.closest('#presentation-tab-pane') && button.id.startsWith('download-') && !button.disabled && !button.classList.contains('chart-download-btn') && !button.classList.contains('table-download-png-btn')) { 
            exportService.exportPraesentationData(button.id, app.getPresentationDataForExport(), state.getCurrentCohort()); 
            return; 
        }
        if (sectionLink) { event.preventDefault(); handlePublicationSectionChange(sectionLink.dataset.sectionId); return; }
        if (button?.closest('#analysis-tab-pane')) { handleAnalysisTabClick(button); return; }
        if (button?.id === 'statistics-toggle-comparison') { handleStatsLayoutToggle(button); return; }
    }

    function handleBodyChange(event) {
        const target = event.target;
        if (target.id === 'input-size') { debouncedUpdateSizeInput(target.value); return; }
        if (target.classList.contains('criteria-checkbox')) { handleT2CheckboxChange(target); return; }
        if (target.id === 't2-logic-switch') { handleT2LogicChange(target); return; }
        if (target.id === 'brute-force-metric') { return; }
        if (target.id === 'statistics-cohort-select-1') { handleStatsCohortChange(target); return; }
        if (target.id === 'statistics-cohort-select-2') { handleStatsCohortChange(target); return; }
        if (target.name === 'presentationView') { handlePresentationViewChange(target.value); return; }
        if (target.id === 'pres-study-select') { handlePresentationStudyChange(target.value); return; }
        if (target.id === 'publication-bf-metric-select') { handlePublicationBfMetricChange(target.value); return; }
    }
    
    function handleBodyInput(event) {
        const target = event.target;
        if (target.id === 'range-size') {
            document.getElementById('value-size').textContent = formatNumber(target.value, 1);
            debouncedUpdateSizeInput(target.value);
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
    
    function handleAnalysisTabClick(button) {
        if (button.classList.contains('t2-criteria-button')) {
            if (t2CriteriaManager.updateCriterionValue(button.dataset.criterion, button.dataset.value)) {
                uiManager.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
                uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            }
        } else {
            switch(button.id) {
                case 'btn-reset-criteria':
                    t2CriteriaManager.resetCriteria();
                    uiManager.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
                    uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
                    uiManager.showToast('T2 criteria have been reset to default.', 'info');
                    break;
                case 'btn-apply-criteria':
                    app.applyAndRefreshAll();
                    break;
                case 'btn-start-brute-force':
                    app.startBruteForceAnalysis();
                    break;
                case 'btn-cancel-brute-force':
                    bruteForceManager.cancelAnalysis();
                    break;
                case 'btn-apply-best-bf-criteria':
                    app.applyBestBruteForceCriteria();
                    break;
            }
        }
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
            if (state.getActiveTabId() === 'publication') app.refreshCurrentTab();
            document.getElementById('publication-content-area')?.scrollTo(0, 0);
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
