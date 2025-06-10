class App {
    constructor() {
        this.rawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];
        this.processedData = [];
        this.currentCohortData = [];
        this.presentationDataForExport = null;
        this.allPublicationStats = null;
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
            dataTab, analysisTab, statisticsTab, presentationTab, publicationTab, exportTab,
            eventManager, 
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
        
        // Calculate all publication stats once and store them
        this.allPublicationStats = statisticsService.calculateAllPublicationStats(this.processedData, criteria, logic, bruteForceManager.getAllResults());

        const publicationData = {
            rawData: this.rawData,
            allCohortStats: this.allPublicationStats,
            bruteForceResults: bruteForceResults,
            currentLanguage: state.getCurrentPublikationLang()
        };

        let currentPresentationData = null;
        if (tabId === 'presentation') {
            const currentPresentationView = state.getPresentationView();
            const selectedStudyId = state.getPresentationStudyId();
            const cohortForPresentation = state.getCurrentCohort(); 
            const filteredDataForPresentation = dataProcessor.filterDataByCohort(this.processedData, cohortForPresentation);
            
            const statsCurrentCohort = this.allPublicationStats[cohortForPresentation];
            const statsGesamt = this.allPublicationStats['Gesamt'];
            const statsDirektOP = this.allPublicationStats['direkt OP'];
            const statsNRCT = this.allPublicationStats['nRCT'];

            let performanceT2 = null;
            let comparisonCriteriaSet = null;
            let t2ShortName = null;
            let comparisonASvsT2 = null;

            if (selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                performanceT2 = statsCurrentCohort?.performanceT2Applied;
                comparisonCriteriaSet = {
                    id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                    name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                    displayShortName: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                    criteria: criteria,
                    logic: logic,
                    studyInfo: {
                        reference: 'User-defined criteria',
                        patientCohort: `Current: ${getCohortDisplayName(cohortForPresentation)} (N=${filteredDataForPresentation.length})`,
                        investigationType: 'Interactive analysis',
                        focus: 'Custom T2 criteria',
                        keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(criteria, logic, false)
                    }
                };
                t2ShortName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                comparisonASvsT2 = statsCurrentCohort?.comparisonASvsT2Applied;
            } else if (selectedStudyId) {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                if (studySet) {
                    const studyDataCohort = dataProcessor.filterDataByCohort(this.processedData, studySet.applicableCohort);
                    const evaluatedDataStudy = studyT2CriteriaManager.applyStudyCriteriaToDataset(cloneDeep(studyDataCohort), studySet);
                    const statsForStudyCohort = statisticsService.calculateDiagnosticPerformance(evaluatedDataStudy, 't2Status', 'nStatus');
                    
                    performanceT2 = statsForStudyCohort;
                    comparisonCriteriaSet = studySet;
                    t2ShortName = studySet.displayShortName || studySet.name;
                    comparisonASvsT2 = statisticsService.compareDiagnosticMethods(evaluatedDataStudy, 'asStatus', 't2Status', 'nStatus');
                }
            }

            currentPresentationData = {
                view: currentPresentationView,
                cohort: cohortForPresentation,
                patientCount: filteredDataForPresentation.length,
                statsCurrentCohort: statsCurrentCohort,
                statsGesamt: statsGesamt,
                statsDirektOP: statsDirektOP,
                statsNRCT: statsNRCT,
                performanceAS: statsCurrentCohort?.performanceAS,
                performanceT2: performanceT2,
                comparison: comparisonASvsT2,
                comparisonCriteriaSet: comparisonCriteriaSet,
                cohortForComparison: selectedStudyId ? (comparisonCriteriaSet?.applicableCohort || cohortForPresentation) : cohortForPresentation,
                patientCountForComparison: selectedStudyId ? (dataProcessor.filterDataByCohort(this.processedData, comparisonCriteriaSet?.applicableCohort || cohortForPresentation).length) : filteredDataForPresentation.length,
                t2ShortName: t2ShortName
            };
            this.presentationDataForExport = currentPresentationData; // Store for export
        }

        switch (tabId) {
            case 'data': uiManager.renderTabContent(tabId, () => dataTab.render(this.currentCohortData, state.getDataTableSort())); break;
            case 'analysis': uiManager.renderTabContent(tabId, () => analysisTab.render(this.currentCohortData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.getAnalysisTableSort(), cohort, bruteForceManager.isWorkerAvailable(), this.allPublicationStats[cohort], bruteForceManager.getResultsForCohort(cohort))); break;
            case 'statistics': uiManager.renderTabContent(tabId, () => statisticsTab.render(this.processedData, criteria, logic, state.getStatsLayout(), state.getStatsCohort1(), state.getStatsCohort2(), cohort)); break;
            case 'presentation': uiManager.renderTabContent(tabId, () => presentationTab.render(state.getPresentationView(), currentPresentationData, state.getPresentationStudyId(), cohort, this.processedData, criteria, logic)); break;
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
        // The rawData has German keys, which is expected by brute_force_worker.js
        const dataForWorker = this.rawData.filter(p => p.therapie === cohortId || cohortId === 'Gesamt').map(p => ({
            id: p.nr, n: p.n, lymphknoten_t2: cloneDeep(p.lymphknoten_t2), name: p.name // Pass relevant raw data for worker
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
        const data = this.processedData; // Use full processed data for exports to allow filtering within export_service
        const bfResults = bruteForceManager.getAllResults(); // Pass all BF results
        const criteria = t2CriteriaManager.getAppliedCriteria();
        const logic = t2CriteriaManager.getAppliedLogic();
        
        switch(exportType) {
            case 'stats-csv':
                const allCohortStatsForCSV = statisticsService.calculateAllPublicationStats(data, criteria, logic, bfResults);
                exportTab.exportStatistikCSV(allCohortStatsForCSV[cohort], cohort, criteria, logic);
                break;
            case 'bruteforce-txt':
                exportTab.exportBruteForceReport(bfResults[cohort]);
                break;
            case 'datatable-md':
                exportTab.exportTableMarkdown(dataProcessor.filterDataByCohort(this.currentCohortData, cohort), 'daten', cohort);
                break;
            case 'analysistable-md':
                 exportTab.exportTableMarkdown(dataProcessor.filterDataByCohort(this.currentCohortData, cohort), 'auswertung', cohort, criteria, logic);
                break;
            case 'filtered-data-csv':
                exportTab.exportFilteredDataCSV(dataProcessor.filterDataByCohort(this.currentCohortData, cohort), cohort);
                break;
            case 'comprehensive-report-html':
                 exportTab.exportComprehensiveReportHTML(data, bfResults, cohort, criteria, logic);
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
    getPresentationDataForExport() { return this.presentationDataForExport; } // Expose presentation data

}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
