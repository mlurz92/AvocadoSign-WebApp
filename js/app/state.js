const state = (() => {
    let currentState = {};

    const defaultState = {
        currentCohort: APP_CONFIG.DEFAULT_SETTINGS.COHORT,
        dataTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATA_TABLE_SORT),
        analysisTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.ANALYSIS_TABLE_SORT),
        publicationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_SECTION,
        publicationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC,
        publicationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_LANG,
        statsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
        statsCohort1: APP_CONFIG.DEFAULT_SETTINGS.STATS_COHORT1,
        statsCohort2: APP_CONFIG.DEFAULT_SETTINGS.STATS_COHORT2,
        presentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
        presentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
        activeTabId: 'publication'
    };

    function init() {
        const loadedSection = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLICATION_SECTION);
        const isValidSection = PUBLICATION_CONFIG.sections.some(s => s.id === loadedSection);

        currentState = {
            currentCohort: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_COHORT) ?? defaultState.currentCohort,
            publicationSection: isValidSection ? loadedSection : defaultState.publicationSection,
            publicationBruteForceMetric: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLICATION_BRUTE_FORCE_METRIC) ?? defaultState.publicationBruteForceMetric,
            publicationLang: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLICATION_LANG) ?? defaultState.publicationLang,
            statsLayout: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) ?? defaultState.statsLayout,
            statsCohort1: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_COHORT1) ?? defaultState.statsCohort1,
            statsCohort2: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_COHORT2) ?? defaultState.statsCohort2,
            presentationView: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) ?? defaultState.presentationView,
            presentationStudyId: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) ?? defaultState.presentationStudyId,
            dataTableSort: cloneDeep(defaultState.dataTableSort),
            analysisTableSort: cloneDeep(defaultState.analysisTableSort),
            activeTabId: defaultState.activeTabId
        };
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
    function setCurrentCohort(newCohort) { return _setter('currentCohort', APP_CONFIG.STORAGE_KEYS.CURRENT_COHORT, newCohort); }

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
        const isValid = PUBLICATION_CONFIG.sections.some(s => s.id === newSectionId);
        return isValid ? _setter('publicationSection', APP_CONFIG.STORAGE_KEYS.PUBLICATION_SECTION, newSectionId) : false;
    }

    function getPublicationBruteForceMetric() { return currentState.publicationBruteForceMetric; }
    function setPublicationBruteForceMetric(newMetric) {
        const isValid = PUBLICATION_CONFIG.bruteForceMetricsForPublication.some(m => m.value === newMetric);
        return isValid ? _setter('publicationBruteForceMetric', APP_CONFIG.STORAGE_KEYS.PUBLICATION_BRUTE_FORCE_METRIC, newMetric) : false;
    }

    function getCurrentPublikationLang() { return currentState.publicationLang; }
    function setPublicationLang(newLang) {
        if (newLang === 'en' || newLang === 'de') {
            return _setter('publicationLang', APP_CONFIG.STORAGE_KEYS.PUBLICATION_LANG, newLang);
        }
        return false;
    }

    function getStatsLayout() { return currentState.statsLayout; }
    function setStatsLayout(newLayout) {
        if (newLayout === 'einzel' || newLayout === 'vergleich') {
            return _setter('statsLayout', APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, newLayout);
        }
        return false;
    }

    function getStatsCohort1() { return currentState.statsCohort1; }
    function setStatsCohort1(newCohort) { return _setter('statsCohort1', APP_CONFIG.STORAGE_KEYS.STATS_COHORT1, newCohort); }

    function getStatsCohort2() { return currentState.statsCohort2; }
    function setStatsCohort2(newCohort) { return _setter('statsCohort2', APP_CONFIG.STORAGE_KEYS.STATS_COHORT2, newCohort); }

    function getPresentationView() { return currentState.presentationView; }
    function setPresentationView(newView) {
        if (newView === 'as-pur' || newView === 'as-vs-t2') {
            if (currentState.presentationView !== newView) {
                if (newView === 'as-pur') {
                    _setter('presentationStudyId', APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, null);
                }
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
        return _setter('presentationStudyId', APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, newStudyId ?? null);
    }

    function getActiveTabId() { return currentState.activeTabId; }
    function setActiveTabId(newTabId) {
        if (typeof newTabId === 'string' && currentState.activeTabId !== newTabId) {
            currentState.activeTabId = newTabId;
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
