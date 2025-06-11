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
        if (typeof Worker === 'undefined') {
            console.error("BruteForceManager: Web Workers are not supported in this browser.");
            if (onError) onError({ message: 'Web Workers are not supported in this browser.' });
            return false;
        }
        try {
            if (worker) {
                worker.terminate();
            }
            worker = new Worker(APP_CONFIG.PATHS.BRUTE_FORCE_WORKER);
            worker.onmessage = handleWorkerMessage;
            worker.onerror = handleWorkerError;
            return true;
        } catch (e) {
            console.error("BruteForceManager: Worker initialization failed.", e);
            worker = null;
            if (onError) onError({ message: `Worker initialization failed: ${e.message}` });
            return false;
        }
    }

    function handleWorkerMessage(event) {
        if (!event || !event.data || !event.data.type) {
            console.warn("BruteForceManager: Received an invalid message from the worker.", event);
            return;
        }
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
            default:
                 console.warn(`BruteForceManager: Received unknown message type '${type}' from worker.`);
                 break;
        }
    }

    function handleWorkerError(error) {
        const erroredCohort = currentCohortRunning;
        isRunning = false;
        currentCohortRunning = null;
        
        const errorMessage = `Worker error in ${error.filename} at line ${error.lineno}: ${error.message}`;
        console.error("BruteForceManager: " + errorMessage, error);

        if (onError) {
            onError({
                message: errorMessage,
                cohort: erroredCohort
            });
        }
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
            const message = "An optimization is already running.";
            if (onError) onError({ message: message, cohort });
            console.warn(`BruteForceManager: ${message}`);
            return false;
        }
        if (!worker) {
            if (!initializeWorker()) {
                const message = "Worker not available and could not be re-initialized.";
                if (onError) onError({ message: message, cohort });
                console.error(`BruteForceManager: ${message}`);
                return false;
            }
        }
        if (!data || data.length === 0) {
             const message = "No data provided for optimization.";
             if (onError) onError({ message: message, cohort });
             console.error(`BruteForceManager: ${message}`);
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
        if (!isRunning || !worker) {
            return false;
        }
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
        }
        isRunning = false;
        currentCohortRunning = null;
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
