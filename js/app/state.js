window.state = (() => {
    let currentState = {};
    let defaultState = {};
    let analysisContext = null;

    function init() {
        defaultState = {
            currentCohort: window.APP_CONFIG.DEFAULT_SETTINGS.COHORT,
            dataTableSort: cloneDeep(window.APP_CONFIG.DEFAULT_SETTINGS.DATA_TABLE_SORT),
            analysisTableSort: cloneDeep(window.APP_CONFIG.DEFAULT_SETTINGS.ANALYSIS_TABLE_SORT),
            publicationSection: window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_SECTION,
            publicationBruteForceMetric: window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC,
            publicationLang: window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_LANG,
            statsLayout: window.APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
            statsCohort1: window.APP_CONFIG.DEFAULT_SETTINGS.STATS_COHORT1,
            statsCohort2: window.APP_CONFIG.DEFAULT_SETTINGS.STATS_COHORT2,
            comparisonView: window.APP_CONFIG.DEFAULT_SETTINGS.COMPARISON_VIEW,
            comparisonStudyId: window.APP_CONFIG.DEFAULT_SETTINGS.COMPARISON_STUDY_ID,
            activeTabId: 'publication'
        };

        const loadedSection = loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_SECTION);
        const isValidSection = window.PUBLICATION_CONFIG.sections.some(s => s.id === loadedSection || s.subSections.some(sub => sub.id === loadedSection));

        currentState = {
            currentCohort: loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.CURRENT_COHORT) ?? defaultState.currentCohort,
            publicationSection: isValidSection ? loadedSection : defaultState.publicationSection,
            publicationBruteForceMetric: loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_BRUTE_FORCE_METRIC) ?? defaultState.publicationBruteForceMetric,
            publicationLang: loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_LANG) ?? defaultState.publicationLang,
            statsLayout: loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) ?? defaultState.statsLayout,
            statsCohort1: loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.STATS_COHORT1) ?? defaultState.statsCohort1,
            statsCohort2: loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.STATS_COHORT2) ?? defaultState.statsCohort2,
            comparisonView: loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.COMPARISON_VIEW) ?? defaultState.comparisonView,
            comparisonStudyId: loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.COMPARISON_STUDY_ID) ?? defaultState.comparisonStudyId,
            dataTableSort: cloneDeep(defaultState.dataTableSort),
            analysisTableSort: cloneDeep(defaultState.analysisTableSort),
            activeTabId: defaultState.activeTabId
        };
        analysisContext = null;
    }

    function _setter(key, storageKey, newValue) {
        if (currentState[key] !== newValue) {
            currentState[key] = newValue;
            if (storageKey) {
                saveToLocalStorage(storageKey, newValue);
            }
            return true;
        }
        return false;
    }

    function getCurrentCohort() { return currentState.currentCohort; }
    function setCurrentCohort(newCohort) { return _setter('currentCohort', window.APP_CONFIG.STORAGE_KEYS.CURRENT_COHORT, newCohort); }

    function getActiveCohortId() {
        return analysisContext?.cohortId ?? currentState.currentCohort;
    }

    function getAnalysisContext() {
        return analysisContext ? cloneDeep(analysisContext) : null;
    }

    function setAnalysisContext(context) {
        analysisContext = context ? cloneDeep(context) : null;
    }

    function clearAnalysisContext() {
        analysisContext = null;
    }

    function getDataTableSort() { return cloneDeep(currentState.dataTableSort); }
    function updateDataTableSort(key, subKey = null) {
        if (currentState.dataTableSort.key === key && currentState.dataTableSort.subKey === subKey) {
            currentState.dataTableSort.direction = currentState.dataTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentState.dataTableSort = { key, direction: 'asc', subKey };
        }
        return true;
    }

    function getAnalysisTableSort() { return cloneDeep(currentState.analysisTableSort); }
    function updateAnalysisTableSort(key, subKey = null) {
        if (currentState.analysisTableSort.key === key && currentState.analysisTableSort.subKey === subKey) {
            currentState.analysisTableSort.direction = currentState.analysisTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentState.analysisTableSort = { key, direction: 'asc', subKey };
        }
        return true;
    }

    function getPublicationSection() { return currentState.publicationSection; }
    function setPublicationSection(newSectionId) {
        const isValid = window.PUBLICATION_CONFIG.sections.some(s => s.id === newSectionId || s.subSections.some(sub => sub.id === newSectionId));
        return isValid ? _setter('publicationSection', window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_SECTION, newSectionId) : false;
    }

    function getPublicationBruteForceMetric() { return currentState.publicationBruteForceMetric; }
    function setPublicationBruteForceMetric(newMetric) {
        const isValid = window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.some(m => m.value === newMetric);
        return isValid ? _setter('publicationBruteForceMetric', window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_BRUTE_FORCE_METRIC, newMetric) : false;
    }

    function getCurrentPublikationLang() { return currentState.publicationLang; }
    function setPublicationLang(newLang) {
        if (newLang === 'en' || newLang === 'de') {
            return _setter('publicationLang', window.APP_CONFIG.STORAGE_KEYS.PUBLICATION_LANG, newLang);
        }
        return false;
    }

    function getStatsLayout() { return currentState.statsLayout; }
    function setStatsLayout(newLayout) {
        if (newLayout === 'einzel' || newLayout === 'vergleich') {
            return _setter('statsLayout', window.APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, newLayout);
        }
        return false;
    }

    function getStatsCohort1() { return currentState.statsCohort1; }
    function setStatsCohort1(newCohort) { return _setter('statsCohort1', window.APP_CONFIG.STORAGE_KEYS.STATS_COHORT1, newCohort); }

    function getStatsCohort2() { return currentState.statsCohort2; }
    function setStatsCohort2(newCohort) { return _setter('statsCohort2', window.APP_CONFIG.STORAGE_KEYS.STATS_COHORT2, newCohort); }

    function getComparisonView() { return currentState.comparisonView; }
    function setComparisonView(newView) {
        if (newView !== 'as-pur' && newView !== 'as-vs-t2') {
            return false;
        }
        
        const viewChanged = _setter('comparisonView', window.APP_CONFIG.STORAGE_KEYS.COMPARISON_VIEW, newView);
        let studyIdChanged = false;

        if (newView === 'as-pur') {
            studyIdChanged = _setter('comparisonStudyId', window.APP_CONFIG.STORAGE_KEYS.COMPARISON_STUDY_ID, null);
            clearAnalysisContext();
        } else if (newView === 'as-vs-t2') {
            if (currentState.comparisonStudyId === null) {
                const defaultStudyId = window.APP_CONFIG.DEFAULT_SETTINGS.COMPARISON_STUDY_ID;
                studyIdChanged = _setter('comparisonStudyId', window.APP_CONFIG.STORAGE_KEYS.COMPARISON_STUDY_ID, defaultStudyId);
                const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(defaultStudyId);
                if (studySet?.applicableCohort) {
                    setAnalysisContext({ cohortId: studySet.applicableCohort, criteriaName: studySet.name });
                }
            } else {
                const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(currentState.comparisonStudyId);
                 if (studySet?.applicableCohort) {
                    setAnalysisContext({ cohortId: studySet.applicableCohort, criteriaName: studySet.name });
                }
            }
        }
        
        return viewChanged || studyIdChanged;
    }

    function getComparisonStudyId() { return currentState.comparisonStudyId; }
    function setComparisonStudyId(newStudyId) {
        const studyIdChanged = _setter('comparisonStudyId', window.APP_CONFIG.STORAGE_KEYS.COMPARISON_STUDY_ID, newStudyId ?? null);
        if (studyIdChanged) {
            if (newStudyId && newStudyId !== window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(newStudyId);
                if (studySet?.applicableCohort) {
                    setAnalysisContext({ cohortId: studySet.applicableCohort, criteriaName: studySet.name });
                } else {
                    clearAnalysisContext();
                }
            } else {
                clearAnalysisContext();
            }
        }
        return studyIdChanged;
    }

    function getActiveTabId() { return currentState.activeTabId; }
    function setActiveTabId(newTabId) {
        if (typeof newTabId === 'string' && currentState.activeTabId !== newTabId) {
            currentState.activeTabId = newTabId;
            if (newTabId !== 'comparison') {
                clearAnalysisContext();
            }
            return true;
        }
        return false;
    }

    return Object.freeze({
        init,
        getCurrentCohort,
        setCurrentCohort,
        getActiveCohortId,
        getAnalysisContext,
        setAnalysisContext,
        clearAnalysisContext,
        getDataTableSort,
        updateDataTableSort,
        getAnalysisTableSort,
        updateAnalysisTableSort,
        getPublicationSection,
        setPublicationSection,
        getPublicationBruteForceMetric,
        setPublicationBruteForceMetric,
        getCurrentPublikationLang,
        setPublicationLang,
        getStatsLayout,
        setStatsLayout,
        getStatsCohort1,
        setStatsCohort1,
        getStatsCohort2,
        setStatsCohort2,
        getComparisonView,
        setComparisonView,
        getComparisonStudyId,
        setComparisonStudyId,
        getActiveTabId,
        setActiveTabId
    });
})();