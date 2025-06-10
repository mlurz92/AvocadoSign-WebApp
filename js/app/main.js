class App {
    constructor() {
        this.rawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];
        this.processedData = [];
        this.currentCohortData = [];
    }

    init() {
        try {
            this.checkDependencies();
            
            state.init();
            t2CriteriaManager.init();
            eventManager.init(this);
            this.initializeBruteForceManager();

            this.processedData = dataProcessor.processAllData(this.rawData);
            if (this.processedData.length === 0) {
                uiManager.showToast("Warning: No valid patient data loaded.", "warning");
            }
            
            this.filterAndPrepareData();
            this.updateUI();

            const initialTabId = state.getActiveTabId() || 'publication';
            const initialTabElement = document.getElementById(`${initialTabId}-tab`);
            if (initialTabElement && typeof bootstrap !== 'undefined' && bootstrap.Tab) {
                const tab = new bootstrap.Tab(initialTabElement);
                tab.show();
            }
            this.processTabChange(initialTabId);

            if (!loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START)) {
                uiManager.showQuickGuide();
                saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, true);
            }
            
            uiManager.initializeTooltips(document.body);
            uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            uiManager.showToast('Application initialized.', 'success', 2500);

        } catch (error) {
            console.error("Fatal error during app initialization:", error);
            uiManager.updateElementHTML('app-container', `<div class="alert alert-danger m-5">Initialization Error: ${error.message}. Please check the console for details.</div>`);
        }
    }

    checkDependencies() {
        const dependencies = { 
            state, t2CriteriaManager, studyT2CriteriaManager, dataProcessor, 
            statisticsService, bruteForceManager, 
            uiManager, uiComponents, tableRenderer, chartRenderer, 
            dataTab, analysisTab, statisticsTab, presentationTab, publicationTab, exportTab, // exportTab hinzugefügt
            eventManager, 
            // utils wird global über <script> Tag geladen und ist nicht Teil eines Moduls, das hier explizit geprüft werden muss
            // Die globalen Funktionen wie getCohortDisplayName, formatNumber, cloneDeep etc. aus utils.js sind nach der Korrektur der Ladereihenfolge verfügbar
        };
        for (const dep in dependencies) {
            if (typeof dependencies[dep] === 'undefined') {
                throw new Error(`Core module '${dep}' is not available. Check script loading order.`);
            }
        }
    }

    initializeBruteForceManager() {
        const bfCallbacks = {
            onStarted: (payload) => uiManager.updateBruteForceUI('started', payload, true, state.getCurrentCohort()),
            onProgress: (payload) => uiManager.updateBruteForceUI('progress', payload, true, state.getCurrentCohort()),
            onResult: (payload) => {
                uiManager.updateBruteForceUI('result', payload, true, payload.cohort);
                if (payload?.results?.length > 0) {
                    uiManager.updateElementHTML('brute-force-modal-body', uiComponents.createBruteForceModalContent(payload));
                    uiManager.initializeTooltips(document.getElementById('brute-force-modal-body'));
                    uiManager.showToast('Optimization finished.', 'success');
                    if (state.getActiveTabId() === 'publication') this.refreshCurrentTab();
                } else {
                    uiManager.showToast('Optimization finished with no valid results.', 'warning');
                }
                this.updateUI();
            },
            onCancelled: (payload) => {
                uiManager.updateBruteForceUI('cancelled', {}, bruteForceManager.isWorkerAvailable(), payload.cohort);
                uiManager.showToast('Optimization cancelled.', 'warning');
                this.updateUI();
            },
            onError: (payload) => {
                uiManager.showToast(`Optimization Error: ${payload?.message || 'Unknown'}`, 'danger');
                uiManager.updateBruteForceUI('error', payload, bruteForceManager.isWorkerAvailable(), payload.cohort);
                this.updateUI();
            }
        };
        bruteForceManager.init(bfCallbacks);
    }
    
    filterAndPrepareData() {
        try {
            const currentCohort = state.getCurrentCohort();
            const filteredByCohort = dataProcessor.filterDataByCohort(this.processedData, currentCohort);
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = t2CriteriaManager.getAppliedLogic();
            const evaluatedData = t2CriteriaManager.evaluateDataset(filteredByCohort, appliedCriteria, appliedLogic);

            const activeTabId = state.getActiveTabId();
            const sortState = activeTabId === 'data' ? state.getDataTableSort() : state.getAnalysisTableSort();
            if(sortState && sortState.key) {
                 evaluatedData.sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
            }
            this.currentCohortData = evaluatedData;
        } catch (error) {
            this.currentCohortData = [];
            uiManager.showToast("Error during data preparation.", "danger");
        }
    }

    updateUI() {
        const currentCohort = state.getCurrentCohort();
        const headerStats = dataProcessor.calculateHeaderStats(this.currentCohortData, currentCohort);
        uiManager.updateHeaderStatsUI(headerStats);
        uiManager.updateCohortButtonsUI(currentCohort);
        
        if (state.getActiveTabId() === 'statistics') {
            uiManager.updateStatisticsSelectorsUI(state.getStatsLayout(), state.getStatsCohort1(), state.getStatsCohort2());
        } else if (state.getActiveTabId() === 'presentation') {
            uiManager.updatePresentationViewUI(state.getPresentationView(), state.getPresentationStudyId());
        } else if (state.getActiveTabId() === 'publication') {
            uiManager.updatePublicationUI(state.getPublicationSection(), state.getPublicationBruteForceMetric());
        }
        
        const bfResults = bruteForceManager.getAllResults();
        uiManager.updateExportButtonStates(state.getActiveTabId(), !!bfResults && Object.keys(bfResults).length > 0, this.currentCohortData.length > 0);
    }

    processTabChange(tabId) {
        if (state.setActiveTabId(tabId)) {
            this.filterAndPrepareData();
            this.updateUI();
            this.renderCurrentTab();
        }
    }

    renderCurrentTab() {
        const tabId = state.getActiveTabId();
        const cohort = state.getCurrentCohort();
        const criteria = t2CriteriaManager.getAppliedCriteria();
        const logic = t2CriteriaManager.getAppliedLogic();
        const publicationData = {
            rawData: this.rawData,
            allCohortStats: statisticsService.calculateAllPublicationStats(this.processedData, criteria, logic, bruteForceManager.getAllResults()),
            bruteForceResults: bruteForceManager.getAllResults()
        };

        switch (tabId) {
            case 'data': uiManager.renderTabContent(tabId, () => dataTab.render(this.currentCohortData, state.getDataTableSort())); break;
            case 'analysis': uiManager.renderTabContent(tabId, () => analysisTab.render(this.currentCohortData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.getAnalysisTableSort(), cohort, bruteForceManager.isWorkerAvailable())); break;
            case 'statistics': uiManager.renderTabContent(tabId, () => statisticsTab.render(this.processedData, criteria, logic, state.getStatsLayout(), state.getStatsCohort1(), state.getStatsCohort2(), cohort)); break;
            case 'presentation': uiManager.renderTabContent(tabId, () => presentationTab.render(state.getPresentationView(), state.getPresentationStudyId(), cohort, this.processedData, criteria, logic)); break;
            case 'publication': uiManager.renderTabContent(tabId, () => publicationTab.render(publicationData, state.getPublicationSection())); break;
            case 'export': uiManager.renderTabContent(tabId, () => exportTab.render(cohort)); break;
        }
    }

    handleCohortChange(newCohort, source = "user") {
        if (state.setCurrentCohort(newCohort)) {
            this.filterAndPrepareData();
            this.updateUI();
            this.renderCurrentTab();
            if (source === "user") {
                uiManager.showToast(`Cohort '${getCohortDisplayName(newCohort)}' selected.`, 'info');
            } else if (source === "auto_presentation") {
                uiManager.showToast(`Global cohort automatically set to '${getCohortDisplayName(newCohort)}' to match the study selection in the Presentation tab.`, 'info', 4000);
                uiManager.highlightElement(`btn-cohort-${newCohort.replace(/\s+/g, '-')}`);
            }
        }
    }
    
    handleSortRequest(context, key, subKey) {
        if (context === 'data') state.updateDataTableSort(key, subKey);
        else if (context === 'analysis') state.updateAnalysisTableSort(key, subKey);
        this.refreshCurrentTab();
    }
    
    applyAndRefreshAll() {
        t2CriteriaManager.applyCriteria();
        this.refreshCurrentTab();
        uiManager.markCriteriaSavedIndicator(false);
        uiManager.showToast('T2 criteria applied & saved.', 'success');
    }

    startBruteForceAnalysis() {
        const metric = document.getElementById('brute-force-metric')?.value || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;
        const cohortId = state.getCurrentCohort();
        const dataForWorker = dataProcessor.filterDataByCohort(this.processedData, cohortId).map(p => ({
            id: p.id, nStatus: p.nStatus, t2Nodes: cloneDeep(p.t2Nodes)
        }));
        if (dataForWorker.length > 0) {
            bruteForceManager.startAnalysis(dataForWorker, metric, cohortId);
        } else {
            uiManager.showToast("No data for optimization in the current cohort.", "warning");
        }
    }

    applyBestBruteForceCriteria() {
        const cohortId = state.getCurrentCohort();
        const bfResult = bruteForceManager.getResultsForCohort(cohortId);
        if (!bfResult?.bestResult?.criteria) {
            uiManager.showToast('No valid brute-force results to apply for this cohort.', 'warning');
            return;
        }
        const best = bfResult.bestResult;
        Object.keys(best.criteria).forEach(key => {
            if (key === 'logic') return;
            const criterion = best.criteria[key];
            t2CriteriaManager.toggleCriterionActive(key, criterion.active);
            if (criterion.active) {
                if (key === 'size') t2CriteriaManager.updateCriterionThreshold(criterion.threshold);
                else t2CriteriaManager.updateCriterionValue(key, criterion.value);
            }
        });
        t2CriteriaManager.updateLogic(best.logic);
        uiManager.updateT2CriteriaControlsUI(t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic());
        this.applyAndRefreshAll();
        uiManager.showToast('Best brute-force criteria applied & saved.', 'success');
    }
    
    handleSingleExport(exportType) {
        const cohort = state.getCurrentCohort();
        const data = dataProcessor.filterDataByCohort(this.processedData, cohort);
        const bfResults = bruteForceManager.getResultsForCohort(cohort);
        const criteria = t2CriteriaManager.getAppliedCriteria();
        const logic = t2CriteriaManager.getAppliedLogic();
        
        switch(exportType) {
            case 'stats-csv':
                const allCohortStats = statisticsService.calculateAllPublicationStats(this.processedData, criteria, logic, bruteForceManager.getAllResults());
                exportTab.exportStatistikCSV(allCohortStats[cohort], cohort, criteria, logic);
                break;
            case 'bruteforce-txt':
                exportTab.exportBruteForceReport(bfResults);
                break;
            case 'datatable-md':
                exportTab.exportTableMarkdown(data, 'daten', cohort); // 'data' to 'daten'
                break;
            case 'analysistable-md':
                 exportTab.exportTableMarkdown(data, 'auswertung', cohort, criteria, logic); // 'analysis' to 'auswertung'
                break;
            case 'filtered-data-csv':
                exportTab.exportFilteredDataCSV(data, cohort);
                break;
            case 'comprehensive-report-html':
                 exportTab.exportComprehensiveReportHTML(this.processedData, bfResults, cohort, criteria, logic);
                 break;
        }
    }

    refreshCurrentTab() {
        this.filterAndPrepareData();
        this.updateUI();
        this.renderCurrentTab();
    }
    
    getRawData() { return this.rawData; }
    getProcessedData() { return this.processedData; }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
