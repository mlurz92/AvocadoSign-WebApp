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
            
            const initialTabId = state.getActiveTabId() || 'publication';
            const initialTabElement = document.getElementById(`${initialTabId}-tab`);
            
            this.processTabChange(initialTabId);

            if (initialTabElement && typeof bootstrap !== 'undefined' && bootstrap.Tab) {
                const tab = new bootstrap.Tab(initialTabElement);
                tab.show();
            }

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
        // Ensure all necessary modules are loaded and accessible
        const dependencies = { 
            state, t2CriteriaManager, studyT2CriteriaManager, dataProcessor, 
            statisticsService, bruteForceManager, 
            uiManager, uiComponents, tableRenderer, chartRenderer, 
            dataTab, analysisTab, statisticsTab, presentationTab, publicationTab, exportTab,
            eventManager, APP_CONFIG, // APP_CONFIG is global due to script loading, but good to check presence
            // Also implicitly depends on global patientDataRaw from data.js
        };
        for (const dep in dependencies) {
            if (typeof dependencies[dep] === 'undefined' || dependencies[dep] === null) {
                throw new Error(`Core module or dependency '${dep}' is not available. Check script loading order or definition.`);
            }
        }
        // Specific check for global data, as it's not a module in the same way
        if (typeof patientDataRaw === 'undefined' || patientDataRaw === null) {
            throw new Error("Global 'patientDataRaw' is not available. Check data.js loading.");
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
            this.filterAndPrepareData();
            this.renderCurrentTab();
            this.updateUI();
        }
    }

    renderCurrentTab() {
        const tabId = state.getActiveTabId();
        const cohort = state.getCurrentCohort();
        const criteria = t2CriteriaManager.getAppliedCriteria();
        const logic = t2CriteriaManager.getAppliedLogic();
        const bruteForceResults = bruteForceManager.getAllResults();
        
        // Calculate all publication stats only once per render cycle, if needed by any tab
        // This ensures consistency across different sections that might use the same stats.
        this.allPublicationStats = statisticsService.calculateAllPublicationStats(this.processedData, criteria, logic, bruteForceResults);

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
            
            // Get stats for current cohort and all subgroups from the pre-calculated allPublicationStats
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
                    const cohortForStudySet = studySet.applicableCohort || 'Gesamt';
                    const statsForStudyCohort = this.allPublicationStats[cohortForStudySet];
                    
                    performanceT2 = statsForStudyCohort?.performanceT2Literature?.[selectedStudyId];
                    comparisonCriteriaSet = studySet;
                    t2ShortName = studySet.displayShortName || studySet.name;
                    // Comparison stats for literature sets are also pre-calculated and stored in allPublicationStats
                    comparisonASvsT2 = statsForStudyCohort?.[`comparisonASvsT2_literature_${selectedStudyId}`];
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
                performanceT2: performanceT2, // This will be the performance of the selected studySet's T2 criteria
                comparison: comparisonASvsT2, // This will be the comparison data for AS vs the selected studySet's T2
                comparisonCriteriaSet: comparisonCriteriaSet, // The full study set object for display
                cohortForComparison: selectedStudyId ? (comparisonCriteriaSet?.applicableCohort || cohortForPresentation) : cohortForPresentation, // The actual cohort the comparison criteria was evaluated on
                patientCountForComparison: selectedStudyId ? (dataProcessor.filterDataByCohort(this.processedData, comparisonCriteriaSet?.applicableCohort || cohortForPresentation).length) : filteredDataForPresentation.length,
                t2ShortName: t2ShortName
            };
            this.presentationDataForExport = currentPresentationData;
        }

        switch (tabId) {
            case 'data': uiManager.renderTabContent(tabId, () => dataTab.render(this.currentCohortData, state.getDataTableSort())); break;
            case 'analysis': uiManager.renderTabContent(tabId, () => analysisTab.render(this.currentCohortData, t2CriteriaManager.getCurrentCriteria(), t2CriteriaManager.getCurrentLogic(), state.getAnalysisTableSort(), cohort, bruteForceManager.isWorkerAvailable(), this.allPublicationStats[cohort], bruteForceResults[cohort])); break;
            case 'statistics': uiManager.renderTabContent(tabId, () => statisticsTab.render(this.processedData, criteria, logic, state.getStatsLayout(), state.getStatsCohort1(), state.getStatsCohort2(), cohort)); break;
            case 'presentation': uiManager.renderTabContent(tabId, () => presentationTab.render(state.getPresentationView(), currentPresentationData, state.getPresentationStudyId(), cohort, this.processedData, criteria, logic)); break;
            case 'publication': uiManager.renderTabContent(tabId, () => publicationTab.render(publicationData, state.getPublicationSection())); break;
            case 'export': uiManager.renderTabContent(tabId, () => exportTab.render(cohort)); break;
        }
    }

    handleCohortChange(newCohort, source = "user") {
        if (state.setCurrentCohort(newCohort)) {
            this.refreshCurrentTab();
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
        // Prepare raw patient data specific to the worker's needs
        // The worker needs lymphknoten_t2 with original German keys and n status
        const dataForWorker = this.rawData.filter(p => cohortId === 'Gesamt' || p.therapie === cohortId).map(p => ({
            nr: p.nr, // Include nr for identification/debugging if needed in worker
            n: p.n, // Reference standard needed for metric calculation
            lymphknoten_t2: p.lymphknoten_t2 // Raw T2 nodes with original keys
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
            if (key === 'logic') return; // Logic is handled separately
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
        const data = this.processedData; // Use processedData (full dataset)
        const bfResults = bruteForceManager.getAllResults();
        const criteria = t2CriteriaManager.getAppliedCriteria();
        const logic = t2CriteriaManager.getAppliedLogic();
        const allCohortStats = this.allPublicationStats; // Use pre-calculated stats

        // Ensure data is filtered for the current cohort for cohort-specific exports
        const currentFilteredData = dataProcessor.filterDataByCohort(data, cohort);
        // Ensure data is evaluated with applied criteria for analysis table export
        const evaluatedCurrentFilteredData = t2CriteriaManager.evaluateDataset(currentFilteredData, criteria, logic);
        
        // Define common data for publication exports that need it
        const commonDataForPublication = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats.Gesamt?.descriptive?.patientCount || 0,
            nUpfrontSurgery: allCohortStats['direkt OP']?.descriptive?.patientCount || 0,
            nNRCT: allCohortStats.nRCT?.descriptive?.patientCount || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: state.getPublicationBruteForceMetric(),
            currentLanguage: state.getCurrentPublikationLang(),
            rawData: this.rawData
        };

        const exporter = {
            'stats-csv': () => exportService.exportStatistikCSV(allCohortStats[cohort], cohort, criteria, logic),
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

    refreshCurrentTab() {
        this.filterAndPrepareData();
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
