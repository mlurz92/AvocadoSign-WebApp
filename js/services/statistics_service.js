window.statisticsService = (() => {

    function getMedian(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return NaN;
        const sortedArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x)).sort((a, b) => a - b);
        if (sortedArr.length === 0) return NaN;
        const midIndex = Math.floor(sortedArr.length / 2);
        return sortedArr.length % 2 !== 0 ? sortedArr[midIndex] : (sortedArr[midIndex - 1] + sortedArr[midIndex]) / 2;
    }

    function getMean(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return NaN;
        const numericArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        if (numericArr.length === 0) return NaN;
        const sum = numericArr.reduce((acc, val) => acc + val, 0);
        return sum / numericArr.length;
    }

    function getStdDev(arr) {
        if (!Array.isArray(arr) || arr.length < 2) return NaN;
        const numericArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        if (numericArr.length < 2) return NaN;
        const mean = getMean(numericArr);
        if (isNaN(mean)) return NaN;
        const variance = numericArr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (numericArr.length - 1);
        return Math.sqrt(variance);
    }

    function getQuartiles(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return { q1: NaN, q3: NaN };
        const sortedArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x)).sort((a, b) => a - b);
        if (sortedArr.length === 0) return { q1: NaN, q3: NaN };
        const q1Index = (sortedArr.length + 1) / 4;
        const q3Index = (sortedArr.length + 1) * 3 / 4;
        const getQuartileValue = (index) => {
            const base = Math.floor(index) - 1;
            const frac = index - Math.floor(index);
            if (sortedArr[base + 1] !== undefined) {
                return sortedArr[base] + frac * (sortedArr[base + 1] - sortedArr[base]);
            }
            return sortedArr[base];
        };
        return {
            q1: getQuartileValue(q1Index),
            q3: getQuartileValue(q3Index)
        };
    }

    function erf(x) {
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const sign = (x >= 0) ? 1 : -1;
        const absX = Math.abs(x);
        const t = 1.0 / (1.0 + p * absX);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
        const result = sign * y;
        return isFinite(result) ? result : (sign > 0 ? 1.0 : -1.0);
    }

    function normalCDF(x, mean = 0, stdDev = 1) {
        if (isNaN(x) || isNaN(mean) || isNaN(stdDev) || stdDev <= 0) return NaN;
        const z = (x - mean) / (stdDev * Math.sqrt(2));
        return 0.5 * (1 + erf(z));
    }

    function inverseNormalCDF(p, mean = 0, stdDev = 1) {
        if (isNaN(p) || p <= 0 || p >= 1) return NaN;
        const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
        const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01, 1.0];
        const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
        const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00, 1.0];
        let q, x;
        if (p < 0.02425) {
            q = Math.sqrt(-2 * Math.log(p));
            x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + d[4]);
        } else if (p <= 0.97575) {
            q = p - 0.5;
            const r = q * q;
            x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]);
        } else {
            q = Math.sqrt(-2 * Math.log(1 - p));
            x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + d[4]);
        }
        return mean + stdDev * x;
    }

    const LOG_GAMMA_CACHE = {};
    function logGamma(x) {
        if (LOG_GAMMA_CACHE[x]) return LOG_GAMMA_CACHE[x];
        if (x <= 0) return NaN;
        const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
        let y = x, tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
        const result = -tmp + Math.log(2.5066282746310005 * ser / x);
        if (Object.keys(LOG_GAMMA_CACHE).length < 1000) LOG_GAMMA_CACHE[x] = result;
        return result;
    }

    function logFactorial(n) {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        return logGamma(n + 1);
    }

    function regularizedGammaIncomplete(a, x) {
        if (a <= 0 || x < 0) return NaN;
        if (x === 0) return 0.0;
        const logGammaA = logGamma(a);
        const maxIter = 200, epsilon = 1e-15;
        if (x < a + 1.0) {
            let sum = 1.0 / a, term = sum;
            for (let k = 1; k <= maxIter; k++) {
                term *= x / (a + k); sum += term;
                if (Math.abs(term) < Math.abs(sum) * epsilon) break;
            }
            return Math.exp(a * Math.log(x) - x - logGammaA) * sum;
        } else {
            let b = x + 1.0 - a, c = 1.0 / epsilon, d = 1.0 / b, h = d, an;
            for (let k = 1; k <= maxIter; k++) {
                an = -k * (k - a); b += 2.0; d = an * d + b;
                if (Math.abs(d) < epsilon) d = epsilon;
                c = b + an / c; if (Math.abs(c) < epsilon) c = epsilon;
                d = 1.0 / d; h *= d * c;
                if (Math.abs(d * c - 1.0) < epsilon) break;
            }
            return 1.0 - (Math.exp(a * Math.log(x) - x - logGammaA) * h);
        }
    }

    function chiSquareCDF(x, df) {
        if (x < 0 || df <= 0) return NaN;
        return regularizedGammaIncomplete(df / 2.0, x / 2.0);
    }

    function calculateWilsonScoreCI(successes, trials, alpha = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        if (trials <= 0) return defaultReturn;
        const p_hat = successes / trials, n = trials;
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        if (!isFinite(z)) return defaultReturn;
        const z2 = z * z;
        const center = p_hat + z2 / (2 * n);
        const term = z * Math.sqrt((p_hat * (1 - p_hat) / n) + (z2 / (4 * n * n)));
        const denominator = 1 + z2 / n;
        return {
            lower: Math.max(0.0, (center - term) / denominator),
            upper: Math.min(1.0, (center + term) / denominator),
            method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION
        };
    }

    function calculateORCI(a, b, c, d, alpha = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Woolf Logit (Adjusted)' };
        if (a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;
        const or_raw = (b === 0 || c === 0) ? NaN : (a * d) / (b * c);

        const a_adj = a + 0.5, b_adj = b + 0.5, c_adj = c + 0.5, d_adj = d + 0.5;
        const or_adj = (a_adj * d_adj) / (b_adj * c_adj);

        if (or_adj <= 0 || !isFinite(or_adj)) {
             return { ...defaultReturn, value: or_raw };
        }
        const logOR = Math.log(or_adj);
        const seLogOR = Math.sqrt(1 / a_adj + 1 / b_adj + 1 / c_adj + 1 / d_adj);
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        if (!isFinite(z) || isNaN(seLogOR) || seLogOR <= 0) {
            return { ...defaultReturn, value: or_raw };
        }
        return { value: or_raw, ci: { lower: Math.exp(logOR - z * seLogOR), upper: Math.exp(logOR + z * seLogOR) }, method: 'Woolf Logit (Haldane-Anscombe correction)' };
    }

    function calculateRDCI(a, b, c, d, alpha = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Wald' };
        if (a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;
        const n1 = a + b, n2 = c + d;
        if (n1 === 0 || n2 === 0) return defaultReturn;
        const p1 = a / n1, p2 = c / n2;
        const rd = p1 - p2;
        const seRD = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        if (!isFinite(z) || isNaN(seRD) || seRD <= 0) return { ...defaultReturn, value: rd };
        return { value: rd, ci: { lower: Math.max(-1.0, rd - z * seRD), upper: Math.min(1.0, rd + z * seRD) }, method: 'Wald' };
    }

    function bootstrapCI(data, statisticFn, nBoot = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        if (!Array.isArray(data) || data.length < 2) return defaultReturn;
        const n = data.length;
        const bootStats = [];
        for (let i = 0; i < nBoot; i++) {
            const bootSample = Array.from({length: n}, () => data[Math.floor(Math.random() * n)]);
            try {
                const stat = statisticFn(bootSample);
                if (isFinite(stat)) bootStats.push(stat);
            } catch (e) { }
        }
        if (bootStats.length < 2) return defaultReturn;
        bootStats.sort((a, b) => a - b);
        const lowerIndex = Math.floor(bootStats.length * (alpha / 2.0));
        const upperIndex = Math.ceil(bootStats.length * (1 - alpha / 2.0)) - 1;

        const finalLowerIndex = Math.max(0, Math.min(lowerIndex, bootStats.length - 1));
        const finalUpperIndex = Math.max(0, Math.min(upperIndex, bootStats.length - 1));

        return { lower: bootStats[finalLowerIndex], upper: bootStats[finalUpperIndex], method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: getStdDev(bootStats) };
    }

    function calculateMcNemarTest(b, c) {
        if (isNaN(b) || isNaN(c) || b < 0 || c < 0) return { pValue: NaN, statistic: NaN, df: 1, method: "McNemar's Test (Invalid Input)" };
        const n = b + c;
        if (n === 0) return { pValue: 1.0, statistic: 0, df: 1, method: "McNemar's Test (No Discordance)" };
        const useCorrection = n < 25;
        const statistic = Math.pow(Math.abs(b - c) - (useCorrection ? 1 : 0), 2) / n;
        const pValue = 1.0 - chiSquareCDF(statistic, 1);
        return { pValue, statistic, df: 1, method: `McNemar's Test${useCorrection ? ' (Yates-corrected)' : ''}` };
    }

    function logProbHypergeometric(k, N, K, n) {
        if (k < 0 || n < 0 || K < 0 || N < 0 || k > n || k > K || (n - k) > (N - K) || n > N) return -Infinity;
        return logFactorial(K) - logFactorial(k) - logFactorial(K - k)
             + logFactorial(N - K) - logFactorial(n - k) - logFactorial(N - K - (n - k))
             - (logFactorial(N) - logFactorial(n) - logFactorial(N - n));
    }

    function calculateFisherExactTest(a, b, c, d) {
        if (a < 0 || b < 0 || c < 0 || d < 0) return { pValue: NaN, method: "Fisher's Exact Test (Invalid Input)" };
        const N = a + b + c + d;
        if (N === 0) return { pValue: 1.0, method: "Fisher's Exact Test (No Data)" };

        const pObservedLog = logProbHypergeometric(a, N, a + c, a + b);
        if (!isFinite(pObservedLog)) return { pValue: NaN, method: "Fisher's Exact Test (Numerical Error)" };

        let pValue = 0.0;
        const minVal = Math.max(0, (a + b) + (a + c) - N);
        const maxVal = Math.min(a + b, a + c);

        for (let i = minVal; i <= maxVal; i++) {
            const current_a = i;
            const current_b = (a + b) - current_a;
            const current_c = (a + c) - current_a;
            const current_d = (b + d) - current_c;

            if (current_a >= 0 && current_b >= 0 && current_c >= 0 && current_d >= 0) {
                const pCurrentLog = logProbHypergeometric(current_a, N, a + c, a + b);
                if (isFinite(pCurrentLog) && pCurrentLog <= pObservedLog + 1e-9) {
                    pValue += Math.exp(pCurrentLog);
                }
            }
        }
        return { pValue: Math.min(1.0, pValue), method: "Fisher's Exact Test" };
    }

    function rankData(arr) {
        const sorted = arr.map((value, index) => ({ value: parseFloat(value), originalIndex: index }))
            .filter(item => !isNaN(item.value) && isFinite(item.value)).sort((a, b) => a.value - b.value);
        const ranks = new Array(arr.length).fill(NaN);
        if (sorted.length === 0) return ranks;
        for (let i = 0; i < sorted.length; ) {
            let j = i;
            while (j < sorted.length - 1 && sorted[j].value === sorted[j + 1].value) j++;
            const avgRank = (i + j + 2) / 2.0;
            for (let k = i; k <= j; k++) ranks[sorted[k].originalIndex] = avgRank;
            i = j + 1;
        }
        return ranks;
    }

    function calculateMannWhitneyUTest(sample1, sample2) {
        const defaultReturn = { pValue: NaN, U: NaN, Z: NaN, testName: "Mann-Whitney U (Invalid Input)" };
        const s1 = sample1.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        const s2 = sample2.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        const n1 = s1.length, n2 = s2.length;
        if (n1 === 0 || n2 === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No data in one/both samples)" };

        const combined = [...s1, ...s2];
        const ranks = rankData(combined);

        const R1 = ranks.slice(0, n1).filter(r => !isNaN(r)).reduce((sum, r) => sum + r, 0);

        const U1 = n1 * n2 + (n1 * (n1 + 1)) / 2.0 - R1;
        const U2 = n1 * n2 - U1;
        const U = Math.min(U1, U2);

        const meanU = (n1 * n2) / 2.0;
        const N = n1 + n2;

        const tieCounts = {};
        ranks.filter(r => !isNaN(r)).forEach(r => { tieCounts[r] = (tieCounts[r] || 0) + 1; });
        const tieCorrection = Object.values(tieCounts).reduce((sum, t) => sum + (t * t * t - t), 0);

        const varU = (n1 * n2 / (12 * N * (N - 1))) * ((N * N * N - N) - tieCorrection);

        if (varU <= 0) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (Zero Variance)" };

        const z = (U - meanU - 0.5) / Math.sqrt(varU);

        const pValue = 2.0 * normalCDF(-Math.abs(z));
        return { pValue, U, Z: z, testName: "Mann-Whitney U (Normal Approx. with Tie Correction)" };
    }

    function calculateDeLongTest(data, key1, key2, referenceKey) {
        const defaultReturn = { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Invalid Input)" };
        if (!data || data.length === 0 || !key1 || !key2 || !referenceKey) return defaultReturn;

        const validData = data.filter(p => p?.[referenceKey] === '+' || p?.[referenceKey] === '-');
        const positives = validData.filter(p => p?.[referenceKey] === '+');
        const negatives = validData.filter(p => p?.[referenceKey] === '-');

        if (positives.length === 0 || negatives.length === 0) {
            return { ...defaultReturn, method: "DeLong Test (No positive or negative reference cases)" };
        }

        const getScores = (patient, testKey) => (patient?.[testKey] === '+') ? 1 : (patient?.[testKey] === '-') ? 0 : NaN;

        const getAUCComponents = (testKey) => {
            let structuralPairs = 0;
            const V10 = new Array(positives.length).fill(0);
            const V01 = new Array(negatives.length).fill(0);

            for (let i = 0; i < positives.length; i++) {
                const score_pos = getScores(positives[i], testKey);
                if (isNaN(score_pos)) continue;

                for (let j = 0; j < negatives.length; j++) {
                    const score_neg = getScores(negatives[j], testKey);
                    if (isNaN(score_neg)) continue;

                    let score = 0;
                    if (score_pos > score_neg) {
                        score = 1.0;
                    } else if (score_pos === score_neg) {
                        score = 0.5;
                    } else {
                        score = 0.0;
                    }
                    structuralPairs += score;
                    V10[i] += score;
                    V01[j] += score;
                }
            }

            const n_pos = positives.length;
            const n_neg = negatives.length;

            const auc = (n_pos * n_neg > 0) ? structuralPairs / (n_pos * n_neg) : NaN;

            V10.forEach((val, i) => V10[i] = (n_neg > 0) ? val / n_neg : NaN);
            V01.forEach((val, j) => V01[j] = (n_pos > 0) ? val / n_pos : NaN);

            return { auc, V10, V01 };
        };

        try {
            const c1 = getAUCComponents(key1);
            const c2 = getAUCComponents(key2);

            if (isNaN(c1.auc) || isNaN(c2.auc)) {
                return { ...defaultReturn, method: "DeLong Test (AUC calculation failed due to insufficient scores)" };
            }

            const calculateVariance = (V_arr, mean) => {
                const filteredV_arr = V_arr.filter(v => isFinite(v));
                if (filteredV_arr.length < 2) return NaN;
                return filteredV_arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (filteredV_arr.length - 1);
            };

            const calculateCovariance = (V_X_orig, V_Y_orig, meanX, meanY) => {
                const V_X = V_X_orig.filter(v => isFinite(v));
                const V_Y = V_Y_orig.filter(v => isFinite(v));

                if (V_X.length !== V_Y.length || V_X.length < 2) return NaN;

                let sum = 0;
                for (let i = 0; i < V_X.length; i++) {
                    sum += (V_X[i] - meanX) * (V_Y[i] - meanY);
                }
                return sum / (V_X.length - 1);
            };

            const S10_1 = calculateVariance(c1.V10, c1.auc);
            const S01_1 = calculateVariance(c1.V01, c1.auc);
            const S10_2 = calculateVariance(c2.V10, c2.auc);
            const S01_2 = calculateVariance(c2.V01, c2.auc);

            const Cov10 = calculateCovariance(c1.V10, c2.V10, c1.auc, c2.auc);
            const Cov01 = calculateCovariance(c1.V01, c2.V01, c1.auc, c2.auc);

            if ([S10_1, S01_1, S10_2, S01_2, Cov10, Cov01].some(isNaN)) {
                 return { ...defaultReturn, method: "DeLong Test (Variance/Covariance calculation failed due to insufficient data or scores)" };
            }

            const varDiff = (S10_1 + S10_2 - 2 * Cov10) / positives.length + (S01_1 + S01_2 - 2 * Cov01) / negatives.length;

            if (isNaN(varDiff) || varDiff <= 1e-12) {
                return { pValue: 1.0, Z: 0, diffAUC: c1.auc - c2.auc, method: "DeLong Test (Zero Variance or numerical issue)" };
            }

            const z = (c1.auc - c2.auc) / Math.sqrt(varDiff);
            const pValue = 2.0 * normalCDF(-Math.abs(z));
            return { pValue, Z: z, diffAUC: c1.auc - c2.auc, method: "DeLong Test" };
        } catch (error) {
            return { ...defaultReturn, method: `DeLong Test (Execution Error: ${error.message})` };
        }
    }

    function calculateZTestForAUCComparison(auc1, se1, n1, auc2, se2, n2) {
        const defaultReturn = { pValue: NaN, Z: NaN, method: "Z-Test (AUC - Independent Samples, Invalid Input)" };
        if (auc1 === null || auc2 === null || se1 === null || se1 === undefined || se2 === null || se2 === undefined || isNaN(auc1) || isNaN(auc2) || isNaN(se1) || isNaN(se2) || n1 < 2 || n2 < 2) return defaultReturn;
        const varDiff = se1 * se1 + se2 * se2;
        if (isNaN(varDiff) || varDiff <= 1e-12) return { pValue: 1.0, Z: 0, method: "Z-Test (AUC - Independent Samples, Zero Variance)" };
        const z = (auc1 - auc2) / Math.sqrt(varDiff);
        const pValue = 2.0 * (1.0 - normalCDF(Math.abs(z)));
        return { pValue, Z: z, method: "Z-Test (AUC - Independent Samples)" };
    }

    function calculateConfusionMatrix(data, predictionKey, referenceKey) {
        let tp = 0, fp = 0, fn = 0, tn = 0;
        if (!Array.isArray(data)) return { tp, fp, fn, tn };
        data.forEach(p => {
            if (p && (p[predictionKey] === '+' || p[predictionKey] === '-') && (p[referenceKey] === '+' || p[referenceKey] === '-')) {
                const predicted = p[predictionKey] === '+';
                const actual = p[referenceKey] === '+';
                if (predicted && actual) tp++;
                else if (predicted && !actual) fp++;
                else if (!predicted && actual) fn++;
                else if (!predicted && !actual) tn++;
            }
        });
        return { tp, fp, fn, tn };
    }

    function calculatePhi(a, b, c, d) {
        if (a < 0 || b < 0 || c < 0 || d < 0) return NaN;
        const denominator = Math.sqrt((a + b) * (c + d) * (a + c) * (b + d));
        return denominator === 0 ? NaN : (a * d - b * c) / denominator;
    }

    function calculateDiagnosticPerformance(data, predictionKey, referenceKey) {
        if (!Array.isArray(data) || data.length === 0) return null;
        const matrix = calculateConfusionMatrix(data, predictionKey, referenceKey);
        const { tp, fp, fn, tn } = matrix;
        const total = tp + fp + fn + tn;
        const nullMetric = { value: NaN, ci: null, method: null, se: NaN };
        if (total === 0) return { matrix, sens: nullMetric, spec: nullMetric, ppv: nullMetric, npv: nullMetric, acc: nullMetric, auc: nullMetric, f1: nullMetric, youden: nullMetric };

        const sens_val = (tp + fn) > 0 ? tp / (tp + fn) : NaN;
        const spec_val = (fp + tn) > 0 ? tn / (fp + tn) : NaN;
        const ppv_val = (tp + fp) > 0 ? tp / (tp + fp) : NaN;
        const npv_val = (fn + tn) > 0 ? tn / (fn + tn) : NaN;
        const acc_val = (tp + tn) / total;
        const auc_val = (!isNaN(sens_val) && !isNaN(spec_val)) ? (sens_val + spec_val) / 2.0 : NaN;
        const f1_val = (!isNaN(ppv_val) && !isNaN(sens_val) && (ppv_val + sens_val) > 0) ? 2 * (ppv_val * sens_val) / (ppv_val + sens_val) : NaN;
        const youden_val = (!isNaN(sens_val) && !isNaN(spec_val)) ? (sens_val + spec_val - 1) : NaN;

        const bootstrapFactory = (pKey, rKey, metric) => (sample) => {
            const m = calculateConfusionMatrix(sample, pKey, rKey);
            const s = (m.tp + m.fn) > 0 ? m.tp / (m.tp + m.fn) : NaN;
            const sp = (m.fp + m.tn) > 0 ? m.tn / (m.fp + m.tn) : NaN;
            const p = (m.tp + m.fp) > 0 ? m.tp / (m.tp + m.fp) : NaN;

            switch (metric) {
                case 'f1':
                    return (isNaN(p) || isNaN(s) || (p + s) <= 0) ? NaN : 2 * (p * s) / (p + s);
                case 'auc':
                    return (isNaN(s) || isNaN(sp)) ? NaN : (s + sp) / 2.0;
                case 'youden':
                    return (isNaN(s) || isNaN(sp)) ? NaN : (s + sp - 1);
                default:
                    return NaN;
            }
        };

        return {
            matrix,
            sens: { value: sens_val, ci: calculateWilsonScoreCI(tp, tp + fn), n_success: tp, n_trials: tp + fn, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            spec: { value: spec_val, ci: calculateWilsonScoreCI(tn, fp + tn), n_success: tn, n_trials: fp + tn, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            ppv: { value: ppv_val, ci: calculateWilsonScoreCI(tp, tp + fp), n_success: tp, n_trials: tp + fp, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            npv: { value: npv_val, ci: calculateWilsonScoreCI(tn, fn + tn), n_success: tn, n_trials: fn + tn, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            acc: { value: acc_val, ci: calculateWilsonScoreCI(tp + tn, total), n_success: tp + tn, n_trials: total, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            auc: { value: auc_val, ...bootstrapCI(data, bootstrapFactory(predictionKey, referenceKey, 'auc')), matrix_components: {tp, fp, fn, tn, total} },
            f1: { value: f1_val, ...bootstrapCI(data, bootstrapFactory(predictionKey, referenceKey, 'f1')), matrix_components: {tp, fp, fn, tn, total} },
            youden: { value: youden_val, ...bootstrapCI(data, bootstrapFactory(predictionKey, referenceKey, 'youden')), matrix_components: {tp, fp, fn, tn, total} }
        };
    }

    function compareDiagnosticMethods(data, key1, key2, referenceKey) {
        const nullReturn = { mcnemar: null, delong: null };
        if (!data || data.length === 0) return nullReturn;
        let b = 0, c = 0;
        data.forEach(p => {
            const pred1 = p[key1];
            const pred2 = p[key2];
            if ((pred1 === '+' || pred1 === '-') && (pred2 === '+' || pred2 === '-')) {
                if (pred1 === '+' && pred2 === '-') b++;
                if (pred1 === '-' && pred2 === '+') c++;
            }
        });
        return { mcnemar: calculateMcNemarTest(b, c), delong: calculateDeLongTest(data, key1, key2, referenceKey) };
    }

    function calculateDescriptiveStats(data) {
        const n = data?.length ?? 0;
        const nullMetric = { median: NaN, q1: NaN, q3: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN, n: 0 };
        if (n === 0) return { patientCount: 0, age: nullMetric, sex: { m: 0, f: 0, unknown: 0 }, therapy: { surgeryAlone: 0, neoadjuvantTherapy: 0, unknown: 0 }, nStatus: { plus: 0, minus: 0, unknown: 0 }, asStatus: { plus: 0, minus: 0, unknown: 0 }, t2Status: { plus: 0, minus: 0, unknown: 0 }, lnCounts: null, ageData: [] };

        const ageData = data.map(p => p?.age).filter(a => a !== null && !isNaN(a) && isFinite(a)).sort((a,b) => a-b);
        const ageQuartiles = getQuartiles(ageData);

        const getStats = (arr) => arr.length === 0 ? nullMetric : { median: getMedian(arr), min: arr[0], max: arr[arr.length-1], mean: getMean(arr), sd: getStdDev(arr), n: arr.length, ...getQuartiles(arr) };

        const getCounts = (key) => {
            return data.map(p => {
                if (p && p[key] !== undefined && p[key] !== null && typeof p[key] === 'number') {
                    return p[key];
                }
                return NaN;
            }).filter(c => !isNaN(c) && isFinite(c) && c >= 0).sort((a,b) => a-b);
        };

        const nStatusCounts = data.reduce((acc,p) => {
            if(p.nStatus === '+') acc.plus++;
            else if(p.nStatus === '-') acc.minus++;
            else acc.unknown++;
            return acc;
        }, { plus: 0, minus: 0, unknown: 0 });

        const asStatusCounts = data.reduce((acc,p) => {
            if(p.asStatus === '+') acc.plus++;
            else if(p.asStatus === '-') acc.minus++;
            else acc.unknown++;
            return acc;
        }, { plus: 0, minus: 0, unknown: 0 });

        const t2StatusCounts = data.reduce((acc,p) => {
            if(p.t2Status === '+') acc.plus++;
            else if(p.t2Status === '-') acc.minus++;
            else acc.unknown++;
            return acc;
        }, { plus: 0, minus: 0, unknown: 0 });

        const lnCountsNplusData = data.filter(p => p.nStatus === '+').flatMap(p => {
            if (p.countPathologyNodesPositive !== undefined && p.countPathologyNodesPositive !== null) return p.countPathologyNodesPositive;
            return [];
        }).filter(c => !isNaN(c) && isFinite(c) && c >= 0).sort((a,b) => a-b);

        const lnCountsASplusData = data.filter(p => p.asStatus === '+').flatMap(p => {
            if (p.countASNodesPositive !== undefined && p.countASNodesPositive !== null) return p.countASNodesPositive;
            return [];
        }).filter(c => !isNaN(c) && isFinite(c) && c >= 0).sort((a,b) => a-b);

        const lnCountsT2plusData = data.filter(p => p.t2Status === '+').flatMap(p => {
            if (p.countT2NodesPositive !== undefined && p.countT2NodesPositive !== null) return p.countT2NodesPositive;
            return [];
        }).filter(c => !isNaN(c) && isFinite(c) && c >= 0).sort((a,b) => a-b);

        return {
            patientCount: n,
            age: ageData.length > 0 ? { median: getMedian(ageData), min: ageData[0], max: ageData[ageData.length - 1], mean: getMean(ageData), sd: getStdDev(ageData), q1: ageQuartiles.q1, q3: ageQuartiles.q3, n: ageData.length } : nullMetric,
            sex: data.reduce((acc, p) => { acc[p.sex || 'unknown'] = (acc[p.sex || 'unknown'] || 0) + 1; return acc; }, { m: 0, f: 0, unknown: 0 }),
            therapy: data.reduce((acc, p) => { acc[p.therapy || 'unknown'] = (acc[p.therapy || 'unknown'] || 0) + 1; return acc; }, { surgeryAlone: 0, neoadjuvantTherapy: 0, unknown: 0 }),
            nStatus: nStatusCounts,
            asStatus: asStatusCounts,
            t2Status: t2StatusCounts,
            lnCounts: {
                n: { total: getStats(getCounts('countPathologyNodes')), plus: getStats(lnCountsNplusData) },
                as: { total: getStats(getCounts('countASNodes')), plus: getStats(lnCountsASplusData) },
                t2: { total: getStats(getCounts('countT2Nodes')), plus: getStats(lnCountsT2plusData) }
            },
            ageData: ageData
        };
    }

    function calculateDemographicComparison(data1, data2) {
        const res = {};
        const age1 = data1.map(p => p.age).filter(a => a !== null && !isNaN(a));
        const age2 = data2.map(p => p.age).filter(a => a !== null && !isNaN(a));
        if (age1.length > 1 && age2.length > 1) {
            const mean1 = getMean(age1);
            const mean2 = getMean(age2);
            const sd1 = getStdDev(age1);
            const sd2 = getStdDev(age2);
            const n1 = age1.length;
            const n2 = age2.length;
            const se_diff = Math.sqrt((sd1 * sd1 / n1) + (sd2 * sd2 / n2));
            if (se_diff > 0) {
                const t = (mean1 - mean2) / se_diff;
                const df_welch = Math.pow(se_diff, 4) / (Math.pow(sd1*sd1/n1, 2)/(n1-1) + Math.pow(sd2*sd2/n2, 2)/(n2-1));
                res.age = { pValue: 2 * (1 - normalCDF(Math.abs(t))), test: "Welch's t-test", statistic: t, df: df_welch };
            } else {
                res.age = { pValue: 1.0, test: "Welch's t-test (Zero Variance)", statistic: 0, df: n1+n2-2 };
            }
        } else {
            res.age = { pValue: NaN, test: "Welch's t-test (Insufficient Data)", statistic: NaN, df: NaN };
        }
        
        const sex1_m = data1.filter(p => p.sex === 'm').length;
        const sex1_f = data1.filter(p => p.sex === 'f').length;
        const sex2_m = data2.filter(p => p.sex === 'm').length;
        const sex2_f = data2.filter(p => p.sex === 'f').length;
        res.sex = calculateFisherExactTest(sex1_m, sex1_f, sex2_m, sex2_f);

        const n1_p = data1.filter(p => p.nStatus === '+').length;
        const n1_n = data1.filter(p => p.nStatus === '-').length;
        const n2_p = data2.filter(p => p.nStatus === '+').length;
        const n2_n = data2.filter(p => p.nStatus === '-').length;
        res.nStatus = calculateFisherExactTest(n1_p, n1_n, n2_p, n2_n);
        return res;
    }
    
    function calculateAllPublicationStats(data, appliedT2Criteria, appliedT2Logic, allBruteForceResults) {
        if (!data || !Array.isArray(data)) return null;
        const results = {};
        const cohorts = Object.values(window.APP_CONFIG.COHORTS).map(c => c.id);
        const allLiteratureSets = window.studyT2CriteriaManager.getAllStudyCriteriaSets();

        cohorts.forEach(cohortId => {
            const cohortData = window.dataProcessor.filterDataByCohort(data, cohortId);
            const evaluatedDataApplied = window.t2CriteriaManager.evaluateDataset(cloneDeep(cohortData), appliedT2Criteria, appliedT2Logic);
            
            results[cohortId] = {
                descriptive: calculateDescriptiveStats(evaluatedDataApplied),
                performanceAS: calculateDiagnosticPerformance(evaluatedDataApplied, 'asStatus', 'nStatus'),
                performanceT2Applied: calculateDiagnosticPerformance(evaluatedDataApplied, 't2Status', 'nStatus'),
                comparisonASvsT2Applied: compareDiagnosticMethods(evaluatedDataApplied, 'asStatus', 't2Status', 'nStatus'),
                associationsApplied: calculateAssociations(evaluatedDataApplied, appliedT2Criteria),
                performanceT2Literature: {},
                comparisonASvsT2Literature: {},
                performanceT2Bruteforce: {},
                comparisonASvsT2Bruteforce: {},
                bruteforceDefinitions: {},
                addedValueAnalysis: {}
            };
        });

        allLiteratureSets.forEach(studySet => {
            const cohortForSet = studySet.applicableCohort || window.APP_CONFIG.COHORTS.OVERALL.id;
            const dataForSet = window.dataProcessor.filterDataByCohort(data, cohortForSet);
            if (dataForSet.length > 0) {
                const evaluatedDataStudy = window.studyT2CriteriaManager.evaluateDatasetWithStudyCriteria(cloneDeep(dataForSet), studySet);
                results[cohortForSet].performanceT2Literature[studySet.id] = calculateDiagnosticPerformance(evaluatedDataStudy, 't2Status', 'nStatus');
                results[cohortForSet].comparisonASvsT2Literature[studySet.id] = compareDiagnosticMethods(evaluatedDataStudy, 'asStatus', 't2Status', 'nStatus');
                results[cohortForSet].addedValueAnalysis[studySet.id] = calculateAddedValue(evaluatedDataStudy);
            }
        });
        
        cohorts.forEach(cohortId => {
            const cohortBfResults = allBruteForceResults?.[cohortId];
            if (cohortBfResults) {
                const cohortData = window.dataProcessor.filterDataByCohort(data, cohortId);
                Object.keys(cohortBfResults).forEach(metricName => {
                    const bfResult = cohortBfResults[metricName];
                    if (bfResult && bfResult.bestResult?.criteria) {
                        const evaluatedDataBF = window.t2CriteriaManager.evaluateDataset(cloneDeep(cohortData), bfResult.bestResult.criteria, bfResult.bestResult.logic);
                        results[cohortId].performanceT2Bruteforce[metricName] = calculateDiagnosticPerformance(evaluatedDataBF, 't2Status', 'nStatus');
                        results[cohortId].comparisonASvsT2Bruteforce[metricName] = compareDiagnosticMethods(evaluatedDataBF, 'asStatus', 't2Status', 'nStatus');
                        results[cohortId].bruteforceDefinitions[metricName] = { 
                            criteria: bfResult.bestResult.criteria, 
                            logic: bfResult.bestResult.logic, 
                            metricValue: bfResult.bestResult.metricValue, 
                            metricName: bfResult.metric 
                        };
                    }
                });
            }
        });

        if (results.Overall) {
            results.Overall.interobserverKappa = window.APP_CONFIG.STATISTICAL_CONSTANTS.INTEROBSERVER_KAPPA.value;
            results.Overall.interobserverKappaCI = window.APP_CONFIG.STATISTICAL_CONSTANTS.INTEROBSERVER_KAPPA.ci;
        }

        const dataSurgery = window.dataProcessor.filterDataByCohort(data, window.APP_CONFIG.COHORTS.SURGERY_ALONE.id);
        const dataNeoadjuvant = window.dataProcessor.filterDataByCohort(data, window.APP_CONFIG.COHORTS.NEOADJUVANT.id);
        if (dataSurgery.length > 0 && dataNeoadjuvant.length > 0) {
            results.interCohortDemographicComparison = calculateDemographicComparison(dataSurgery, dataNeoadjuvant);
        }

        const statsSurgery = results[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id];
        const statsNeoadjuvant = results[window.APP_CONFIG.COHORTS.NEOADJUVANT.id];
        if (statsSurgery && statsSurgery.descriptive.patientCount > 0 && statsNeoadjuvant && statsNeoadjuvant.descriptive.patientCount > 0) {
            results.interCohortComparison = {
                as: calculateZTestForAUCComparison(
                    statsSurgery.performanceAS.auc.value, statsSurgery.performanceAS.auc.se, statsSurgery.descriptive.patientCount,
                    statsNeoadjuvant.performanceAS.auc.value, statsNeoadjuvant.performanceAS.auc.se, statsNeoadjuvant.descriptive.patientCount
                ),
                t2Applied: calculateZTestForAUCComparison(
                    statsSurgery.performanceT2Applied.auc.value, statsSurgery.performanceT2Applied.auc.se, statsSurgery.descriptive.patientCount,
                    statsNeoadjuvant.performanceT2Applied.auc.value, statsNeoadjuvant.performanceT2Applied.auc.se, statsNeoadjuvant.descriptive.patientCount
                )
            };
        }

        return results;
    }

    function calculateAssociations(data, t2Criteria) {
        if (!Array.isArray(data) || data.length === 0 || !t2Criteria) return {};
        const results = {};
        const referenceKey = 'nStatus';

        const matrixAS = calculateConfusionMatrix(data, 'asStatus', referenceKey);
        if ((matrixAS.tp + matrixAS.fp + matrixAS.fn + matrixAS.tn) > 0) {
            const fisherAS = calculateFisherExactTest(matrixAS.tp, matrixAS.fp, matrixAS.fn, matrixAS.tn);
            results.as = {
                matrix: matrixAS, testName: fisherAS.method, pValue: fisherAS.pValue,
                or: calculateORCI(matrixAS.tp, matrixAS.fp, matrixAS.fn, matrixAS.tn),
                rd: calculateRDCI(matrixAS.tp, matrixAS.fp, matrixAS.fn, matrixAS.tn),
                phi: { value: calculatePhi(matrixAS.tp, matrixAS.fp, matrixAS.fn, matrixAS.tn) },
                featureName: 'AS Positive'
            };
        }

        const sizesNplus = data.filter(p => p.nStatus === '+').flatMap(p => (p.t2Nodes || []).map(lk => lk.size).filter(s => s !== null && !isNaN(s) && isFinite(s)));
        const sizesNminus = data.filter(p => p.nStatus === '-').flatMap(p => (p.t2Nodes || []).map(lk => lk.size).filter(s => s !== null && !isNaN(s) && isFinite(s)));
        if (sizesNplus.length > 0 && sizesNminus.length > 0) {
            const mwuResult = calculateMannWhitneyUTest(sizesNplus, sizesNminus);
            results.size_mwu = { pValue: mwuResult.pValue, Z: mwuResult.Z, testName: mwuResult.testName, featureName: 'LN Size (Median Comp.)' };
        }

        ['size', 'shape', 'border', 'homogeneity', 'signal'].forEach(key => {
            const criterion = t2Criteria[key];
            if (!criterion) return;

            let a = 0, b = 0, c = 0, d = 0;

            data.forEach(p => {
                if (!p.nStatus || !Array.isArray(p.t2Nodes)) return;
                const actualPositive = p.nStatus === '+';

                const hasFeature = p.t2Nodes.some(lk => {
                    if (!lk) return false;
                    switch (key) {
                        case 'size':
                            return typeof lk.size === 'number' && !isNaN(lk.size) && lk.size >= criterion.threshold;
                        case 'shape':
                            return lk.shape === criterion.value;
                        case 'border':
                            return lk.border === criterion.value;
                        case 'homogeneity':
                            return lk.homogeneity === criterion.value;
                        case 'signal':
                            return lk.signal !== null && lk.signal === criterion.value;
                        default: return false;
                    }
                });

                if (hasFeature && actualPositive) a++;
                else if (hasFeature && !actualPositive) b++;
                else if (!hasFeature && actualPositive) c++;
                else if (!hasFeature && !actualPositive) d++;
            });

            if ((a + b + c + d) > 0) {
                const fisher = calculateFisherExactTest(a, b, c, d);
                results[key] = {
                    matrix: { tp: a, fp: b, fn: c, tn: d }, testName: fisher.method, pValue: fisher.pValue,
                    or: calculateORCI(a, b, c, d), rd: calculateRDCI(a, b, c, d), phi: { value: calculatePhi(a, b, c, d) },
                    featureName: `T2 ${key}=${key === 'size' ? '>=' + formatNumber(criterion.threshold, 1, '', true) : criterion.value}`
                };
            }
        });
        return results;
    }
    
    function calculateAddedValue(data) {
        if (!Array.isArray(data) || data.length === 0) return null;

        const t2FalsePositives = data.filter(p => p.t2Status === '+' && p.nStatus === '-');
        const t2FalseNegatives = data.filter(p => p.t2Status === '-' && p.nStatus === '+');

        const asInT2FalsePositives = calculateDiagnosticPerformance(t2FalsePositives, 'asStatus', 'nStatus');
        const asInT2FalseNegatives = calculateDiagnosticPerformance(t2FalseNegatives, 'asStatus', 'nStatus');

        return {
            t2FalsePositives: {
                count: t2FalsePositives.length,
                performanceAS: asInT2FalsePositives
            },
            t2FalseNegatives: {
                count: t2FalseNegatives.length,
                performanceAS: asInT2FalseNegatives
            }
        };
    }

    return Object.freeze({
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateAssociations,
        calculateDescriptiveStats,
        calculateAllPublicationStats,
        calculateMcNemarTest,
        calculateDeLongTest,
        calculateWilsonScoreCI,
        calculateZTestForAUCComparison,
        calculateAddedValue
    });

})();