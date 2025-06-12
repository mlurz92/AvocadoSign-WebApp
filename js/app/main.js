class App {
    constructor() {
        this.rawData = typeof patientDataRaw !== 'undefined' ? patientDataRaw : [];
        this.processedData = [];
        this.currentCohortData = [];
        this.allPublicationStats = null;
        this.presentationDataForExport = null;
    }

    init() {
        try {
            this.checkDependencies();
            
            state.init();
            t2CriteriaManager.init();
            this.initializeBruteForceManager();
            eventManager.init(this);

            this.processedData = dataProcessor.processAllData(this.rawData);
            if (this.processedData.length === 0) {
                uiManager.showToast("Warning: No valid patient data loaded.", "warning");
            }
            
            this.refreshCurrentTab(true);
            
            if (!loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START)) {
                uiManager.showQuickGuide();
                saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, true);
            }
            
            uiManager.initializeTooltips(document.body);
            uiManager.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            uiManager.showToast('Application initialized.', 'success', 2500);

        } catch (error) {
            console.error("Fatal error during app initialization:", error);
            uiManager.updateElementHTML('app-container', `<div class="alert alert-danger m-5"><strong>Initialization Error:</strong> ${error.message}.<br>Please check the browser console for more details.</div>`);
        }
    }

    checkDependencies() {
        const dependencies = { 
            state, t2CriteriaManager, studyT2CriteriaManager, dataProcessor, 
            statisticsService, bruteForceManager, 
            uiManager, uiComponents, tableRenderer, chartRenderer, 
            dataTab, analysisTab, statisticsTab, presentationTab, publicationTab, exportTab,
            eventManager, APP_CONFIG,
        };
        for (const dep in dependencies) {
            if (typeof dependencies[dep] === 'undefined' || dependencies[dep] === null) {
                throw new Error(`Core module or dependency '${dep}' is not available. Check script loading order or definition.`);
            }
        }
        if (typeof patientDataRaw === 'undefined' || patientDataRaw === null) {
            throw new Error("Global 'patientDataRaw' is not available. Please ensure 'data/data.js' is loaded correctly.");
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
                    if (state.getActiveTabId() === 'publication' || state.getActiveTabId() === 'statistics' || state.getActiveTabId() === 'presentation') {
                        this.refreshCurrentTab();
                    }
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
            console.error("Data preparation error:", error);
        }
    }

    updateUI() {
        const currentCohort = state.getCurrentCohort();
        const headerStats = dataProcessor.calculateHeaderStats(this.currentCohortData, currentCohort);
        uiManager.updateHeaderStatsUI(headerStats);
        uiManager.updateCohortButtonsUI(currentCohort);
        
        const activeTabId = state.getActiveTabId();
        if (activeTabId === 'statistics') {
            uiManager.updateStatisticsSelectorsUI(state.getStatsLayout(), state.getStatsCohort1(), state.getStatsCohort2());
        } else if (activeTabId === 'presentation') {
            uiManager.updatePresentationViewUI(state.getPresentationView(), state.getPresentationStudyId());
        } else if (activeTabId === 'publication') {
            uiManager.updatePublicationUI(state.getPublicationSection(), state.getPublicationBruteForceMetric());
        }
        
        const bfResults = bruteForceManager.getAllResults();
        uiManager.updateExportButtonStates(activeTabId, !!bfResults && Object.keys(bfResults).length > 0, this.currentCohortData.length > 0);
    }

    processTabChange(tabId) {
        if (state.setActiveTabId(tabId)) {
            this.refreshCurrentTab();
        }
    }

    renderCurrentTab() {
        const tabId = state.getActiveTabId();
        const cohort = state.getCurrentCohort();
        const criteria = t2CriteriaManager.getAppliedCriteria();
        const logic = t2CriteriaManager.getAppliedLogic();
        const bruteForceResults = bruteForceManager.getAllResults();

        this.allPublicationStats = statisticsService.calculateAllPublicationStats(this.processedData, criteria, logic, bruteForceResults);
        
        const publicationData = {
            allCohortStats: this.allPublicationStats,
            bruteForceResults: bruteForceResults,
            currentLanguage: state.getCurrentPublikationLang()
        };

        switch (tabId) {
            case 'data':
                uiManager.renderTabContent(tabId, () => dataTab.render(this.currentCohortData, state.getDataTableSort()));
                break;
            case 'analysis':
                uiManager.renderTabContent(tabId, () => analysisTab.render(this.currentCohortData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getAppliedLogic(), state.getAnalysisTableSort(), cohort, bruteForceManager.isWorkerAvailable(), this.allPublicationStats[cohort], bruteForceResults[cohort]));
                break;
            case 'statistics':
                uiManager.renderTabContent(tabId, () => statisticsTab.render(this.processedData, this.allPublicationStats, criteria, logic, state.getStatsLayout(), state.getStatsCohort1(), state.getStatsCohort2(), cohort));
                break;
            case 'presentation':
                let currentPresentationData = this.preparePresentationData(this.allPublicationStats);
                this.presentationDataForExport = currentPresentationData;
                uiManager.renderTabContent(tabId, () => presentationTab.render(state.getPresentationView(), currentPresentationData, state.getPresentationStudyId(), cohort, this.processedData, criteria, logic));
                break;
            case 'publication':
                uiManager.renderTabContent(tabId, () => publicationTab.render(publicationData, state.getPublicationSection()));
                break;
            case 'export':
                uiManager.renderTabContent(tabId, () => exportTab.render(cohort));
                break;
        }
    }

    preparePresentationData(allStats) {
        const currentPresentationView = state.getPresentationView();
        const selectedStudyId = state.getPresentationStudyId();
        const cohortForPresentation = state.getCurrentCohort();
        
        const statsCurrentCohort = allStats[cohortForPresentation];
        const statsOverall = allStats[APP_CONFIG.COHORTS.OVERALL.id];
        const statsSurgeryAlone = allStats[APP_CONFIG.COHORTS.SURGERY_ALONE.id];
        const statsNeoadjuvantTherapy = allStats[APP_CONFIG.COHORTS.NEOADJUVANT.id];
    
        let performanceT2 = null;
        let comparisonCriteriaSet = null;
        let t2ShortName = null;
        let comparisonASvsT2 = null;
        let cohortForComparison = cohortForPresentation;
        let patientCountForComparison = this.currentCohortData.length;
    
        if (currentPresentationView === 'as-vs-t2' && selectedStudyId) {
            if (selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                performanceT2 = statsCurrentCohort?.performanceT2Applied;
                const criteria = t2CriteriaManager.getAppliedCriteria();
                const logic = t2CriteriaManager.getAppliedLogic();
                comparisonCriteriaSet = {
                    id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                    name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                    displayShortName: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                    criteria: criteria,
                    logic: logic,
                    studyInfo: {
                        reference: 'User-defined criteria',
                        patientCohort: `Current: ${getCohortDisplayName(cohortForPresentation)} (N=${patientCountForComparison})`,
                        keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(criteria, logic, false)
                    }
                };
                t2ShortName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                comparisonASvsT2 = statsCurrentCohort?.comparisonASvsT2Applied;
            } else {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
                if (studySet) {
                    cohortForComparison = studySet.applicableCohort || APP_CONFIG.COHORTS.OVERALL.id;
                    const statsForStudyCohort = allStats[cohortForComparison];
                    patientCountForComparison = dataProcessor.filterDataByCohort(this.processedData, cohortForComparison).length;

                    performanceT2 = statsForStudyCohort?.performanceT2Literature?.[selectedStudyId];
                    comparisonCriteriaSet = studySet;
                    t2ShortName = studySet.displayShortName || studySet.name;
                    comparisonASvsT2 = statsForStudyCohort?.[`comparisonASvsT2_literature_${selectedStudyId}`];
                }
            }
        }
    
        return {
            view: currentPresentationView,
            cohort: cohortForPresentation,
            patientCount: this.currentCohortData.length,
            statsCurrentCohort: statsCurrentCohort,
            statsGesamt: statsOverall,
            statsSurgeryAlone: statsSurgeryAlone,
            statsNeoadjuvantTherapy: statsNeoadjuvantTherapy,
            performanceAS: allStats[cohortForComparison]?.performanceAS, // Use the comparison cohort's AS performance for a fair comparison
            performanceT2: performanceT2,
            comparison: comparisonASvsT2,
            comparisonCriteriaSet: comparisonCriteriaSet,
            cohortForComparison: cohortForComparison,
            patientCountForComparison: patientCountForComparison,
            t2ShortName: t2ShortName
        };
    }

    handleCohortChange(newCohort, source = "user") {
        if (state.setCurrentCohort(newCohort)) {
            this.refreshCurrentTab();
            if (source === "user") {
                uiManager.showToast(`Cohort '${getCohortDisplayName(newCohort)}' selected.`, 'info');
            } else if (source === "auto_presentation") {
                uiManager.showToast(`Global cohort automatically set to '${getCohortDisplayName(newCohort)}' to match the study selection in the Presentation tab.`, 'info', 4000);
                uiManager.highlightElement(`btn-cohort-${newCohort}`);
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
        const metric = document.getElementById('brute-force-metric')?.value || 'Balanced Accuracy';
        const cohortId = state.getCurrentCohort();
        const dataForWorker = dataProcessor.filterDataByCohort(this.processedData, cohortId).map(p => ({
            id: p.id,
            nStatus: p.nStatus,
            t2Nodes: p.t2Nodes
        }));
        
        if (dataForWorker.length > 0) {
            bruteForceManager.startAnalysis(dataForWorker, metric, cohortId);
        } else {
            uiManager.showToast("No data for optimization in this cohort. Please select another cohort.", "warning");
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
        const data = this.processedData;
        const bfResults = bruteForceManager.getAllResults();
        const criteria = t2CriteriaManager.getAppliedCriteria();
        const logic = t2CriteriaManager.getAppliedLogic();
        
        const currentFilteredData = dataProcessor.filterDataByCohort(data, cohort);
        const evaluatedCurrentFilteredData = t2CriteriaManager.evaluateDataset(currentFilteredData, criteria, logic);

        const exporter = {
            'stats-csv': () => exportService.exportStatistikCSV(this.allPublicationStats[cohort], cohort, criteria, logic),
            'bruteforce-txt': () => exportService.exportBruteForceReport(bfResults[cohort]),
            'datatable-md': () => exportService.exportTableMarkdown(currentFilteredData, 'daten', cohort),
            'analysistable-md': () => exportService.exportTableMarkdown(evaluatedCurrentFilteredData, 'auswertung', cohort, criteria, logic),
            'filtered-data-csv': () => exportService.exportFilteredDataCSV(currentFilteredData, cohort),
            'comprehensive-report-html': () => exportService.exportComprehensiveReportHTML(data, bfResults, cohort, criteria, logic)
        };

        if (exporter[exportType]) {
            exporter[exportType]();
        } else {
            uiManager.showToast(`Export type '${exportType}' not recognized or implemented.`, 'warning');
        }
    }

    refreshCurrentTab(isInitialLoad = false) {
        this.filterAndPrepareData();
        // On initial load, the active tab is already set, so we render it.
        // On subsequent refreshes, we re-render the currently active tab.
        this.renderCurrentTab();
        this.updateUI();
    }
    
    getRawData() { return this.rawData; }
    getProcessedData() { return this.processedData; }
    getPresentationDataForExport() { return this.presentationDataForExport; }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
