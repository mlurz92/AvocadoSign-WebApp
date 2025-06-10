const bruteForceManager = (() => {
    let worker = null;
    let isRunning = false;
    let currentCohortRunning = null;
    let allCohortResults = {};

    let onProgress = null;
    let onResult = null;
    let onError = null;
    let onCancelled = null;
    let onStarted = null;

    function initializeWorker() {
        if (!window.Worker) {
            console.error("BruteForceManager: Web Workers are not supported.");
            if (onError) onError({ message: 'Web Workers are not supported.' });
            return false;
        }
        try {
            if (worker) worker.terminate();
            worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
            worker.onmessage = handleWorkerMessage;
            worker.onerror = handleWorkerError;
            return true;
        } catch (e) {
            worker = null;
            if (onError) onError({ message: `Worker initialization failed: ${e.message}` });
            return false;
        }
    }

    function handleWorkerMessage(event) {
        if (!event || !event.data) return;
        const { type, payload } = event.data;

        switch (type) {
            case 'started':
                isRunning = true;
                currentCohortRunning = payload?.cohort || currentCohortRunning;
                if (onStarted) onStarted(payload);
                break;
            case 'progress':
                if (isRunning && onProgress) onProgress(payload);
                break;
            case 'result':
                isRunning = false;
                const resultCohort = payload?.cohort || currentCohortRunning;
                if (resultCohort && payload?.bestResult) {
                    allCohortResults[resultCohort] = cloneDeep(payload);
                }
                currentCohortRunning = null;
                if (onResult) onResult(payload);
                break;
            case 'cancelled':
                isRunning = false;
                currentCohortRunning = null;
                if (onCancelled) onCancelled(payload);
                break;
            case 'error':
                isRunning = false;
                if (onError) onError(payload);
                currentCohortRunning = null;
                break;
        }
    }

    function handleWorkerError(error) {
        isRunning = false;
        const erroredCohort = currentCohortRunning;
        currentCohortRunning = null;
        if (onError) onError({ message: error.message || 'Unknown worker error', cohort: erroredCohort });
        worker = null;
    }

    function init(callbacks = {}) {
        onProgress = callbacks.onProgress || null;
        onResult = callbacks.onResult || null;
        onError = callbacks.onError || null;
        onCancelled = callbacks.onCancelled || null;
        onStarted = callbacks.onStarted || null;
        allCohortResults = {};
        return initializeWorker();
    }

    function startAnalysis(data, metric, cohort) {
        if (isRunning) {
            if (onError) onError({ message: "An optimization is already running.", cohort });
            return false;
        }
        if (!worker) {
            if (!initializeWorker()) {
                if (onError) onError({ message: "Worker not available and could not be initialized.", cohort });
                return false;
            }
        }
        if (!data || data.length === 0) {
             if (onError) onError({ message: "No data provided for optimization.", cohort });
            return false;
        }

        currentCohortRunning = cohort;
        isRunning = true;

        worker.postMessage({
            action: 'start',
            payload: {
                data: data,
                metric: metric,
                cohort: cohort,
                t2SizeRange: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE
            }
        });
        return true;
    }

    function cancelAnalysis() {
        if (!isRunning || !worker) return false;
        worker.postMessage({ action: 'cancel' });
        return true;
    }

    function getResultsForCohort(cohortId) {
        return allCohortResults[cohortId] ? cloneDeep(allCohortResults[cohortId]) : null;
    }

    function getAllResults() {
        return cloneDeep(allCohortResults);
    }

    function isWorkerAvailable() {
        return !!worker;
    }

    function terminateWorker() {
        if (worker) {
            worker.terminate();
            worker = null;
            isRunning = false;
            currentCohortRunning = null;
        }
    }

    return Object.freeze({
        init,
        startAnalysis,
        cancelAnalysis,
        getResultsForCohort,
        getAllResults,
        isRunning: () => isRunning,
        isWorkerAvailable,
        terminateWorker
    });
})();
