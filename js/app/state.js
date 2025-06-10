const state = (() => {
    let currentState = {};

    const defaultState = {
        currentCohort: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        dataTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
        analysisTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
        publicationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_SECTION,
        publicationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC,
        publicationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_LANG,
        statsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
        statsCohort1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
        statsCohort2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
        presentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
        presentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
        activeTabId: 'publication' 
    };

    function init() {
        // Load state from localStorage, or use default if not found
        currentState = {
            currentCohort: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) ?? defaultState.currentCohort,
            publicationSection: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLICATION_SECTION) ?? defaultState.publicationSection,
            publicationBruteForceMetric: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLICATION_BRUTE_FORCE_METRIC) ?? defaultState.publicationBruteForceMetric,
            publicationLang: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLICATION_LANG) ?? defaultState.publicationLang,
            statsLayout: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) ?? defaultState.statsLayout,
            statsCohort1: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) ?? defaultState.statsCohort1,
            statsCohort2: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) ?? defaultState.statsCohort2,
            presentationView: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) ?? defaultState.presentationView,
            presentationStudyId: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) ?? defaultState.presentationStudyId,
            // Sorting state and active tab are typically not persisted across sessions or handled by UI state management
            dataTableSort: cloneDeep(defaultState.dataTableSort),
            analysisTableSort: cloneDeep(defaultState.analysisTableSort),
            activeTabId: defaultState.activeTabId // Default to 'publication' on load, can be changed by event listener
        };
    }

    function _setter(key, storageKey, newValue) {
        if (currentState[key] !== newValue) {
            currentState[key] = newValue;
            // Only save to localStorage if a storage key is provided
            if (storageKey) { 
                saveToLocalStorage(storageKey, newValue);
            }
            return true;
        }
        return false;
    }

    function getCurrentCohort() { return currentState.currentCohort; }
    function setCurrentCohort(newCohort) { return _setter('currentCohort', APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, newCohort); }

    function getDataTableSort() { return cloneDeep(currentState.dataTableSort); }
    function updateDataTableSort(key, subKey = null) {
        // If sorting by the same key/subKey, toggle direction
        if (currentState.dataTableSort.key === key && currentState.dataTableSort.subKey === subKey) {
            currentState.dataTableSort.direction = currentState.dataTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // Otherwise, set new key/subKey and default to ascending
            currentState.dataTableSort = { key, direction: 'asc', subKey };
        }
        // Sorting state is not persisted to localStorage per design, but changes should be applied
        return true;
    }

    function getAnalysisTableSort() { return cloneDeep(currentState.analysisTableSort); }
    function updateAnalysisTableSort(key, subKey = null) {
        // If sorting by the same key/subKey, toggle direction
        if (currentState.analysisTableSort.key === key && currentState.analysisTableSort.subKey === subKey) {
            currentState.analysisTableSort.direction = currentState.analysisTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // Otherwise, set new key/subKey and default to ascending
            currentState.analysisTableSort = { key, direction: 'asc', subKey };
        }
        // Sorting state is not persisted to localStorage per design, but changes should be applied
        return true;
    }

    function getPublicationSection() { return currentState.publicationSection; }
    function setPublicationSection(newSectionId) {
        // Validate newSectionId against defined publication sections
        const isValid = PUBLICATION_CONFIG.sections.some(s => s.id === newSectionId);
        return isValid ? _setter('publicationSection', APP_CONFIG.STORAGE_KEYS.PUBLICATION_SECTION, newSectionId) : false;
    }

    function getPublicationBruteForceMetric() { return currentState.publicationBruteForceMetric; }
    function setPublicationBruteForceMetric(newMetric) {
        // Validate newMetric against defined brute force metrics for publication
        const isValid = PUBLICATION_CONFIG.bruteForceMetricsForPublication.some(m => m.value === newMetric);
        return isValid ? _setter('publicationBruteForceMetric', APP_CONFIG.STORAGE_KEYS.PUBLICATION_BRUTE_FORCE_METRIC, newMetric) : false;
    }

    function getCurrentPublikationLang() { return currentState.publicationLang; }
    function setPublicationLang(newLang) {
        if (newLang === 'en' || newLang === 'de') { // Only allow English or German
            return _setter('publicationLang', APP_CONFIG.STORAGE_KEYS.PUBLICATION_LANG, newLang);
        }
        return false;
    }

    function getStatsLayout() { return currentState.statsLayout; }
    function setStatsLayout(newLayout) {
        if (newLayout === 'einzel' || newLayout === 'vergleich') { // Only allow 'einzel' or 'vergleich'
            return _setter('statsLayout', APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, newLayout);
        }
        return false;
    }

    function getStatsCohort1() { return currentState.statsCohort1; }
    function setStatsCohort1(newCohort) { return _setter('statsCohort1', APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, newCohort); }
    
    function getStatsCohort2() { return currentState.statsCohort2; }
    function setStatsCohort2(newCohort) { return _setter('statsCohort2', APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, newCohort); }

    function getPresentationView() { return currentState.presentationView; }
    function setPresentationView(newView) {
        if (newView === 'as-pur' || newView === 'as-vs-t2') {
            if (currentState.presentationView !== newView) {
                // If switching to AS Performance view, clear study ID
                if (newView === 'as-pur') {
                    _setter('presentationStudyId', APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, null);
                } 
                // If switching to AS vs. T2 Comparison view and no study ID is set, default to applied criteria
                else if (newView === 'as-vs-t2' && !currentState.presentationStudyId) {
                    _setter('presentationStudyId', APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);
                }
            }
            return _setter('presentationView', APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, newView);
        }
        return false;
    }

    function getPresentationStudyId() { return currentState.presentationStudyId; }
    function setPresentationStudyId(newStudyId) {
        // Allow null to explicitly clear selection
        return _setter('presentationStudyId', APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, newStudyId ?? null);
    }

    function getActiveTabId() { return currentState.activeTabId; }
    function setActiveTabId(newTabId) {
        if (typeof newTabId === 'string' && currentState.activeTabId !== newTabId) {
            currentState.activeTabId = newTabId;
            // Active tab ID is not persisted to localStorage, only used for current session UI state
            return true;
        }
        return false;
    }

    return Object.freeze({
        init,
        getCurrentCohort,
        setCurrentCohort,
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
        getPresentationView,
        setPresentationView,
        getPresentationStudyId,
        setPresentationStudyId,
        getActiveTabId,
        setActiveTabId
    });
})();
