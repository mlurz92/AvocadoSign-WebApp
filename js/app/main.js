class App {
    constructor() {
        this.rawData = typeof window.patientDataRaw !== 'undefined' ? window.patientDataRaw : [];
        this.processedData = [];
        this.currentCohortData = [];
        this.allPublicationStats = null;
        this.bruteForceModal = null;
        this.libraryStatus = {};
        this.preRenderedPublicationHTML = null;
    }

    async init() {
        try {
            this.libraryStatus = await this.checkDependencies();
            
            Object.entries(this.libraryStatus).forEach(([lib, status]) => {
                if (!status && ['JSZip', 'htmlToDocx', 'html2canvas'].includes(lib)) {
                     window.uiManager.showToast(`Warning: Library '${lib}' failed to load. Some features may be unavailable.`, 'warning', 5000);
                }
            });

            window.state.init();
            window.t2CriteriaManager.init();
            this.initializeBruteForceManager();
            window.eventManager.init(this);

            this.processedData = window.dataProcessor.processAllData(this.rawData);
            if (this.processedData.length === 0) {
                window.uiManager.showToast("Warning: No valid patient data loaded.", "warning");
            }

            const modalElement = document.getElementById('brute-force-modal');
            if (modalElement) {
                this.bruteForceModal = new bootstrap.Modal(modalElement);
            }
            
            this.filterAndPrepareData();
            this.recalculateAllStats();
            this._preRenderPublicationTab();
            this.updateUI();
            this.renderCurrentTab();
            
            if (!loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.FIRST_APP_START)) {
                window.uiManager.showQuickGuide();
                saveToLocalStorage(window.APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, true);
            }
            
            window.uiManager.initializeTooltips(document.body);
            window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
            window.uiManager.showToast('Application initialized.', 'success', 2500);

        } catch (error) {
            const appContainer = document.getElementById('app-container');
            if(appContainer) {
                 window.uiManager.updateElementHTML('app-container', `<div class="alert alert-danger m-5"><strong>Initialization Error:</strong> ${error.message}.<br>Please check the browser console for more details.</div>`);
            } else {
                 document.body.innerHTML = `<div class="alert alert-danger m-5"><strong>Fatal Initialization Error:</strong> ${error.message}. App container not found.</div>`;
            }
        }
    }

    checkDependencies() {
        return new Promise((resolve) => {
            const internalModules = { 
                state: window.state, t2CriteriaManager: window.t2CriteriaManager, studyT2CriteriaManager: window.studyT2CriteriaManager, 
                dataProcessor: window.dataProcessor, statisticsService: window.statisticsService, bruteForceManager: window.bruteForceManager, 
                publicationHelpers: window.publicationHelpers, titlePageGenerator: window.titlePageGenerator, 
                abstractGenerator: window.abstractGenerator, introductionGenerator: window.introductionGenerator, methodsGenerator: window.methodsGenerator, 
                resultsGenerator: window.resultsGenerator, discussionGenerator: window.discussionGenerator, referencesGenerator: window.referencesGenerator, 
                stardGenerator: window.stardGenerator, publicationService: window.publicationService, uiManager: window.uiManager, 
                uiComponents: window.uiComponents, tableRenderer: window.tableRenderer, chartRenderer: window.chartRenderer, 
                flowchartRenderer: window.flowchartRenderer, dataTab: window.dataTab, analysisTab: window.analysisTab, 
                statisticsTab: window.statisticsTab, comparisonTab: window.comparisonTab, publicationTab: window.publicationTab, 
                eventManager: window.eventManager, APP_CONFIG: window.APP_CONFIG, 
                PUBLICATION_CONFIG: window.PUBLICATION_CONFIG
            };
            for (const dep in internalModules) {
                if (typeof internalModules[dep] === 'undefined' || internalModules[dep] === null) {
                    throw new Error(`Core module or dependency '${dep}' is not available.`);
                }
            }
            if (typeof window.patientDataRaw === 'undefined' || window.patientDataRaw === null) {
                throw new Error("Global 'patientDataRaw' is not available.");
            }

            const librariesToWaitFor = {
                d3: () => !!window.d3,
                tippy: () => !!window.tippy
            };

            const pollInterval = 100;
            const timeout = 5000;
            let elapsedTime = 0;

            const intervalId = setInterval(() => {
                const allLoaded = Object.values(librariesToWaitFor).every(checkFn => checkFn());

                if (allLoaded) {
                    clearInterval(intervalId);
                    const finalStatus = {};
                    Object.keys(librariesToWaitFor).forEach(lib => finalStatus[lib] = true);
                    resolve(finalStatus);
                } else {
                    elapsedTime += pollInterval;
                    if (elapsedTime >= timeout) {
                        clearInterval(intervalId);
                        const finalStatus = {};
                        Object.keys(librariesToWaitFor).forEach(lib => finalStatus[lib] = librariesToWaitFor[lib]());
                        resolve(finalStatus);
                    }
                }
            }, pollInterval);
        });
    }

    initializeBruteForceManager() {
        const bfCallbacks = {
            onStarted: (payload) => window.uiManager.updateBruteForceUI('started', payload, true, window.state.getCurrentCohort()),
            onProgress: (payload) => window.uiManager.updateBruteForceUI('progress', payload, true, window.state.getCurrentCohort()),
            onResult: (payload) => {
                const bfResults = window.bruteForceManager.getAllResults();
                const cohortBfResults = bfResults[payload.cohort] || {};
                window.uiManager.updateBruteForceUI('result', cohortBfResults[payload.metric], true, payload.cohort);
                if (payload?.results?.length > 0) {
                    this.showBruteForceDetails(payload.metric, payload.cohort);
                    window.uiManager.showToast('Optimization finished.', 'success');
                    this.recalculateAllStats();
                    this._preRenderPublicationTab();
                    this.refreshCurrentTab();
                } else {
                    window.uiManager.showToast('Optimization finished with no valid results.', 'warning');
                }
                this.updateUI();
            },
            onCancelled: (payload) => {
                window.uiManager.updateBruteForceUI('cancelled', {}, window.bruteForceManager.isWorkerAvailable(), payload.cohort);
                window.uiManager.showToast('Optimization cancelled.', 'warning');
                this.updateUI();
            },
            onError: (payload) => {
                window.uiManager.showToast(`Optimization Error: ${payload?.message || 'Unknown'}`, 'danger');
                window.uiManager.updateBruteForceUI('error', payload, window.bruteForceManager.isWorkerAvailable(), payload.cohort);
                this.updateUI();
            }
        };
        window.bruteForceManager.init(bfCallbacks);
    }
    
    filterAndPrepareData() {
        try {
            const activeCohortId = window.state.getActiveCohortId();
            const filteredByCohort = window.dataProcessor.filterDataByCohort(this.processedData, activeCohortId);
            const appliedCriteria = window.t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = window.t2CriteriaManager.getAppliedLogic();
            const evaluatedData = window.t2CriteriaManager.evaluateDataset(filteredByCohort, appliedCriteria, appliedLogic);

            const activeTabId = window.state.getActiveTabId();
            const sortState = activeTabId === 'data' ? window.state.getDataTableSort() : window.state.getAnalysisTableSort();
            if(sortState && sortState.key) {
                 evaluatedData.sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
            }
            this.currentCohortData = evaluatedData;
        } catch (error) {
            this.currentCohortData = [];
            window.uiManager.showToast("Error during data preparation.", "danger");
        }
    }
    
    recalculateAllStats() {
        const criteria = window.t2CriteriaManager.getAppliedCriteria();
        const logic = window.t2CriteriaManager.getAppliedLogic();
        const bruteForceResults = window.bruteForceManager.getAllResults();
        this.allPublicationStats = window.statisticsService.calculateAllPublicationStats(this.processedData, criteria, logic, bruteForceResults);
    }

    _preRenderPublicationTab() {
        if (!this.allPublicationStats) {
            this.preRenderedPublicationHTML = '<div class="alert alert-warning">Statistics not available. Cannot generate publication content.</div>';
            return;
        }
        const commonData = {
            appName: window.APP_CONFIG.APP_NAME,
            appVersion: window.APP_CONFIG.APP_VERSION,
            nOverall: this.allPublicationStats?.[window.APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.patientCount || 0,
            nPositive: this.allPublicationStats?.[window.APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: this.allPublicationStats?.[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: this.allPublicationStats?.[window.APP_CONFIG.COHORTS.NEOADJUVANT.id]?.descriptive?.patientCount || 0,
            references: window.APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: window.state.getPublicationBruteForceMetric(),
            currentLanguage: window.state.getCurrentPublikationLang(),
            rawData: this.rawData
        };
        this.preRenderedPublicationHTML = window.publicationService.generateFullPublicationHTML(this.allPublicationStats, commonData);
    }
    
    _prepareComparisonData() {
        const globalCohort = window.state.getCurrentCohort(); 
        const selectedStudyId = window.state.getComparisonStudyId();
        
        const statsOverall = this.allPublicationStats[window.APP_CONFIG.COHORTS.OVERALL.id];
        const statsSurgeryAlone = this.allPublicationStats[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id];
        const statsNeoadjuvantTherapy = this.allPublicationStats[window.APP_CONFIG.COHORTS.NEOADJUVANT.id];
        
        let performanceAS, performanceT2, comparisonASvsT2, comparisonCriteriaSet, t2ShortName;
        let cohortForComparison = globalCohort;
        let patientCountForComparison = this.currentCohortData.length;

        if (selectedStudyId === window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            const statsForGlobalCohort = this.allPublicationStats[globalCohort];
            performanceAS = statsForGlobalCohort?.performanceAS;
            performanceT2 = statsForGlobalCohort?.performanceT2Applied;
            comparisonASvsT2 = statsForGlobalCohort?.comparisonASvsT2Applied;
            const appliedCriteria = window.t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = window.t2CriteriaManager.getAppliedLogic();
            comparisonCriteriaSet = {
                id: window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID, name: window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                displayShortName: window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, criteria: appliedCriteria, logic: appliedLogic,
                studyInfo: {
                    reference: 'User-defined criteria', patientCohort: `Current: ${getCohortDisplayName(globalCohort)} (N=${patientCountForComparison})`,
                    keyCriteriaSummary: window.studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false)
                }
            };
            t2ShortName = window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
        } else if (selectedStudyId) {
            const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
            if (studySet) {
                cohortForComparison = studySet.applicableCohort || window.APP_CONFIG.COHORTS.OVERALL.id;
                const statsForStudyCohort = this.allPublicationStats[cohortForComparison];
                patientCountForComparison = statsForStudyCohort?.descriptive?.patientCount || 0;
                
                performanceAS = statsForStudyCohort?.performanceAS;
                performanceT2 = statsForStudyCohort?.performanceT2Literature?.[selectedStudyId];
                comparisonASvsT2 = statsForStudyCohort?.comparisonASvsT2Literature?.[selectedStudyId];
                comparisonCriteriaSet = studySet;
                t2ShortName = studySet.displayShortName || studySet.name;
            }
        }

        return {
            globalCohort, patientCount: this.currentCohortData.length,
            statsGesamt: statsOverall, statsSurgeryAlone, statsNeoadjuvantTherapy,
            statsCurrentCohort: this.allPublicationStats[globalCohort],
            performanceAS, performanceT2, comparison: comparisonASvsT2,
            comparisonCriteriaSet, cohortForComparison, patientCountForComparison, t2ShortName
        };
    }

    updateUI() {
        const currentCohort = window.state.getCurrentCohort();
        const activeTabId = window.state.getActiveTabId();
        const analysisContext = window.state.getAnalysisContext();
        
        const isLocked = !!analysisContext || (activeTabId === 'statistics' && window.state.getStatsLayout() === 'vergleich');
        window.uiManager.updateCohortButtonsUI(currentCohort, isLocked);
        
        if (activeTabId === 'comparison') {
            window.uiManager.updateComparisonViewUI(window.state.getComparisonView(), window.state.getComparisonStudyId());
        } else if (activeTabId === 'publication') {
            window.uiManager.updatePublicationUI(window.state.getPublicationSection(), window.state.getPublicationBruteForceMetric());
        }
    }

    processTabChange(tabId) {
        if (window.state.setActiveTabId(tabId)) {
            this.refreshCurrentTab();
        }
    }

    renderCurrentTab() {
        const tabId = window.state.getActiveTabId();
        const globalCohort = window.state.getCurrentCohort();
        const activeCohort = window.state.getActiveCohortId();
        const criteria = window.t2CriteriaManager.getAppliedCriteria();
        const logic = window.t2CriteriaManager.getAppliedLogic();
        const allBruteForceResults = window.bruteForceManager.getAllResults();
        
        const publicationData = {
            preRenderedHTML: this.getPreRenderedPublicationHTML(),
            allCohortStats: this.allPublicationStats,
            bruteForceMetricForPublication: window.state.getPublicationBruteForceMetric()
        };

        let currentComparisonData = null;
        if (tabId === 'comparison') {
            currentComparisonData = this._prepareComparisonData();
        }

        switch (tabId) {
            case 'data': window.uiManager.renderTabContent('data', () => window.dataTab.render(this.currentCohortData, window.state.getDataTableSort())); break;
            case 'analysis': window.uiManager.renderTabContent('analysis', () => window.analysisTab.render(this.currentCohortData, window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic(), window.state.getAnalysisTableSort(), activeCohort, window.bruteForceManager.isWorkerAvailable(), this.allPublicationStats[activeCohort], allBruteForceResults)); break;
            case 'statistics': window.uiManager.renderTabContent('statistics', () => window.statisticsTab.render(this.processedData, criteria, logic, window.state.getStatsLayout(), window.state.getStatsCohort1(), window.state.getStatsCohort2(), globalCohort)); break;
            case 'comparison': window.uiManager.renderTabContent('comparison', () => window.comparisonTab.render(window.state.getComparisonView(), currentComparisonData, window.state.getComparisonStudyId(), globalCohort, this.processedData, criteria, logic)); break;
            case 'publication': window.uiManager.renderTabContent('publication', () => window.publicationTab.render(publicationData, window.state.getPublicationSection())); break;
        }
    }

    handleCohortChange(newCohort, source = "user") {
        if (window.state.setCurrentCohort(newCohort)) {
            window.state.clearAnalysisContext();
            this.refreshCurrentTab();
            if (source === "user") {
                window.uiManager.showToast(`Cohort '${getCohortDisplayName(newCohort)}' selected.`, 'info');
            } else if (source === "auto_comparison") {
                window.uiManager.showToast(`Global cohort automatically set to '${getCohortDisplayName(newCohort)}' to match the study selection.`, 'info', 4000);
                window.uiManager.highlightElement(`btn-cohort-${newCohort}`);
            }
        }
    }
    
    handleSortRequest(context, key, subKey) {
        if (context === 'data') window.state.updateDataTableSort(key, subKey);
        else if (context === 'analysis') window.state.updateAnalysisTableSort(key, subKey);
        this.refreshCurrentTab();
    }
    
    applyAndRefreshAll() {
        window.t2CriteriaManager.applyCriteria();
        this.recalculateAllStats();
        this._preRenderPublicationTab();
        this.refreshCurrentTab();
        window.uiManager.markCriteriaSavedIndicator(false);
        window.uiManager.showToast('T2 criteria applied & saved.', 'success');
    }

    startBruteForceAnalysis() {
        const metric = document.getElementById('brute-force-metric')?.value || 'Balanced Accuracy';
        const cohortId = window.state.getActiveCohortId();
        const dataForWorker = window.dataProcessor.filterDataByCohort(this.processedData, cohortId).map(p => ({
            id: p.id, nStatus: p.nStatus, t2Nodes: p.t2Nodes
        }));
        
        if (dataForWorker.length > 0) {
            window.bruteForceManager.startAnalysis(dataForWorker, metric, cohortId);
        } else {
            window.uiManager.showToast("No data for optimization in this cohort.", "warning");
        }
    }

    applyBestBruteForceCriteria(metric, cohortId = null) {
        const targetCohort = cohortId || window.state.getActiveCohortId();
        const bfResult = window.bruteForceManager.getResultsForCohortAndMetric(targetCohort, metric);
        
        if (!bfResult?.bestResult?.criteria) {
            window.uiManager.showToast(`No valid brute-force result for metric '${metric}' in cohort '${getCohortDisplayName(targetCohort)}' to apply.`, 'warning');
            return;
        }

        if (cohortId && window.state.getCurrentCohort() !== cohortId) {
            this.handleCohortChange(cohortId, "user");
            window.uiManager.showToast(`Cohort automatically switched to '${getCohortDisplayName(cohortId)}' to apply criteria.`, 'info');
        }

        const best = bfResult.bestResult;
        Object.keys(best.criteria).forEach(key => {
            if (key === 'logic') return;
            const criterion = best.criteria[key];
            window.t2CriteriaManager.toggleCriterionActive(key, criterion.active);
            if (criterion.active) {
                if (key === 'size') window.t2CriteriaManager.updateCriterionThreshold(criterion.threshold);
                else window.t2CriteriaManager.updateCriterionValue(key, criterion.value);
            }
        });
        window.t2CriteriaManager.updateLogic(best.logic);
        this.applyAndRefreshAll();
        window.uiManager.showToast(`Best brute-force criteria for '${metric}' applied & saved.`, 'success');
    }

    showBruteForceDetails(metric, cohortId = null) {
        const targetCohortId = cohortId || window.state.getActiveCohortId();
        const resultData = window.bruteForceManager.getResultsForCohortAndMetric(targetCohortId, metric);
        window.uiManager.updateElementHTML('brute-force-modal-body', window.uiComponents.createBruteForceModalContent(resultData));
        if (this.bruteForceModal) {
            this.bruteForceModal.show();
        }
    }

    handlePublicationSectionChange(sectionId) {
        if (window.state.setPublicationSection(sectionId)) {
            this.refreshCurrentTab();
        }
    }

    refreshCurrentTab() {
        this.filterAndPrepareData();
        if (window.state.getActiveTabId() !== 'publication') {
            this.recalculateAllStats();
            this._preRenderPublicationTab();
        }
        this.renderCurrentTab();
        this.updateUI();
    }
    
    getRawData() { return this.rawData; }
    getProcessedData() { return this.processedData; }
    getPreRenderedPublicationHTML() { return this.preRenderedPublicationHTML; }
}