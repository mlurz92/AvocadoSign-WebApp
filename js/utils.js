function getCohortDisplayName(cohortId) {
    const cohortConfig = Object.values(APP_CONFIG.COHORTS).find(c => c.id === cohortId);
    return cohortConfig ? cohortConfig.displayName : cohortId || 'Unknown';
}

function formatNumber(num, digits = 1, placeholder = '--', useStandardFormat = false) {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    if (useStandardFormat) {
        return number.toFixed(digits);
    }
    try {
        return number.toLocaleString('en-US', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    } catch (e) {
        return number.toFixed(digits);
    }
}

function formatPercent(num, digits = 1, placeholder = '--%') {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    return `${(number * 100).toFixed(digits)}%`;
}

function formatCI(value, ciLower, ciUpper, digits = 1, isPercent = false, placeholder = '--') {
    const formatFn = isPercent
        ? (val, dig) => formatNumber(val * 100, dig, placeholder, true)
        : (val, dig) => formatNumber(val, dig, placeholder, true);

    const formattedValue = formatFn(value, digits);

    if (formattedValue === placeholder && !(value === 0 && placeholder === '--')) {
        return placeholder;
    }

    const formattedLower = formatFn(ciLower, digits);
    const formattedUpper = formatFn(ciUpper, digits);

    if (formattedLower !== placeholder && formattedUpper !== placeholder) {
        const ciStr = `(95% CI: ${formattedLower}, ${formattedUpper})`;
        return `${formattedValue}${isPercent ? '%' : ''} ${ciStr}`;
    }
    return `${formattedValue}${isPercent ? '%' : ''}`;
}

function getCurrentDateString(format = 'YYYY-MM-DD') {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    if (format === 'YYYYMMDD') {
        return `${year}${month}${day}`;
    }
    return `${year}-${month}-${day}`;
}

function saveToLocalStorage(key, value) {
    if (typeof key !== 'string' || key.length === 0) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
    }
}

function loadFromLocalStorage(key) {
    if (typeof key !== 'string' || key.length === 0) return null;
    try {
        const item = localStorage.getItem(key);
        return (item !== null && item !== undefined) ? JSON.parse(item) : null;
    } catch (e) {
        try {
            localStorage.removeItem(key);
        } catch (removeError) {
        }
        return null;
    }
}

function debounce(func, wait) {
    let timeoutId = null;
    return function executedFunction(...args) {
        const later = () => {
            timeoutId = null;
            func.apply(this, args);
        };
        clearTimeout(timeoutId);
        timeoutId = setTimeout(later, wait);
    };
}

function isObject(item) {
    return (item !== null && typeof item === 'object' && !Array.isArray(item));
}

function cloneDeep(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
        if (typeof self !== 'undefined' && self.structuredClone) {
            return self.structuredClone(obj);
        }
        return JSON.parse(JSON.stringify(obj));
    } catch (e) {
        if (Array.isArray(obj)) {
            return obj.map(item => cloneDeep(item));
        }
        if (isObject(obj)) {
            const objCopy = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    objCopy[key] = cloneDeep(obj[key]);
                }
            }
            return objCopy;
        }
        return obj;
    }
}

function deepMerge(target, ...sources) {
    let output = cloneDeep(target);
    sources.forEach(source => {
        const sourceCopy = cloneDeep(source);
        if (isObject(output) && isObject(sourceCopy)) {
            Object.keys(sourceCopy).forEach(key => {
                if (isObject(sourceCopy[key]) && sourceCopy[key] !== null && isObject(output[key]) && output[key] !== null) {
                    output[key] = deepMerge(output[key], sourceCopy[key]);
                } else if (sourceCopy[key] !== undefined) {
                    output[key] = sourceCopy[key];
                }
            });
        }
    });
    return output;
}

function getObjectValueByPath(obj, path) {
    if (!obj || typeof path !== 'string') return undefined;
    try {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    } catch (e) {
        return undefined;
    }
}

function getSortFunction(key, direction = 'asc', subKey = null) {
    const dirModifier = direction === 'asc' ? 1 : -1;
    return (a, b) => {
        if (!a || !b) return 0;
        let valA, valB;
        try {
            if (key === 'status') {
                const getStatusValue = p => {
                    let statusProp = p[subKey];
                    return (statusProp === '+') ? 1 : (statusProp === '-') ? 0 : -1;
                };
                valA = getStatusValue(a);
                valB = getStatusValue(b);
            } else if (key.startsWith('count')) {
                const type = key.replace('count', '').replace('Nodes', '');
                const getCounts = (p, t) => {
                    const plusKey = `count${t}NodesPositive`;
                    const totalKey = `count${t}Nodes`;
                    return { plus: getObjectValueByPath(p, plusKey) ?? NaN, total: getObjectValueByPath(p, totalKey) ?? NaN };
                };
                const countsA = getCounts(a, type);
                const countsB = getCounts(b, type);
                valA = countsA.plus;
                valB = countsB.plus;
                if (valA === valB || (isNaN(valA) && isNaN(valB))) {
                    valA = countsA.total;
                    valB = countsB.total;
                }
            } else {
                valA = getObjectValueByPath(a, key);
                valB = getObjectValueByPath(b, key);
            }
            const isInvalidA = valA === null || valA === undefined || (typeof valA === 'number' && isNaN(valA));
            const isInvalidB = valB === null || valB === undefined || (typeof valB === 'number' && isNaN(valB));
            if (isInvalidA && isInvalidB) return 0;
            if (isInvalidA) return 1 * dirModifier;
            if (isInvalidB) return -1 * dirModifier;
            if (typeof valA === 'string' && typeof valB === 'string') {
                return valA.localeCompare(valB, 'en-US', { sensitivity: 'base', numeric: true }) * dirModifier;
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return (valA - valB) * dirModifier;
            }
            return String(valA).localeCompare(String(valB), 'en-US') * dirModifier;
        } catch (error) {
            return 0;
        }
    };
}

function getStatisticalSignificanceSymbol(pValue) {
    if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return '';
    const significanceLevels = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_SYMBOLS;
    for (const level of significanceLevels) {
        if (pValue < level.threshold) {
            return level.symbol;
        }
    }
    return 'ns';
}

function getPValueText(pValue, forPublication = false) {
    if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';

    const pLessThanThreshold = 0.001;
    const pDot01Threshold = 0.01;
    const pDot05Threshold = 0.05;
    const pGreater099Threshold = 0.99;

    let formattedP;

    if (forPublication) {
        const prefix = 'P';
        if (pValue < pLessThanThreshold) {
            formattedP = `${prefix} < .001`;
        } else if (pValue >= pLessThanThreshold && pValue < pDot01Threshold) {
            formattedP = `${prefix} = ${formatNumber(pValue, 3, 'N/A', true)}`;
        } else if (pValue >= pDot01Threshold && pValue < pDot05Threshold) {
             formattedP = `${prefix} = ${formatNumber(pValue, 3, 'N/A', true)}`;
        } else if (pValue >= pDot05Threshold && pValue <= pGreater099Threshold) {
            formattedP = `${prefix} = ${formatNumber(pValue, 2, 'N/A', true)}`;
        } else if (pValue > pGreater099Threshold) {
            formattedP = `${prefix} > .99`;
        } else {
            formattedP = `${prefix} = ${formatNumber(pValue, 2, 'N/A', true)}`;
        }
    } else {
        const prefix = 'p';
        if (pValue < 0.001) {
            formattedP = `${prefix} < 0.001`;
        } else {
            formattedP = `${prefix} = ${formatNumber(pValue, 3, 'N/A', true)}`;
        }
    }
    return formattedP;
}

function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    let d = new Date().getTime();
    let d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function clampNumber(num, min, max) {
    const number = parseFloat(num);
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    if (isNaN(number) || isNaN(minVal) || isNaN(maxVal)) return NaN;
    return Math.min(Math.max(number, minVal), maxVal);
}

function getTooltip(key, replacements = {}) {
    const definitions = APP_CONFIG.UI_TEXTS.tooltips.tooltipDefinitions;
    const interpretations = APP_CONFIG.UI_TEXTS.tooltips.tooltipInterpretations;
    let template = definitions[key] || interpretations[key] || ``;

    for (const placeholder in replacements) {
        if (Object.prototype.hasOwnProperty.call(replacements, placeholder)) {
            const regex = new RegExp(`\\[${placeholder.toUpperCase()}\\]`, 'g');
            template = template.replace(regex, replacements[placeholder]);
        }
    }
    return template;
}

function getAUCInterpretation(aucValue) {
    const value = parseFloat(aucValue);
    const texts = APP_CONFIG.UI_TEXTS.statMetrics.associationStrengthTexts;
    if (isNaN(value) || value < 0 || value > 1) return getTooltip('auc', { VALUE: formatNumber(aucValue, 2), STRENGTH: texts.undetermined });
    
    let strength = 'not informative';
    if (value >= 0.9) strength = 'excellent';
    else if (value >= 0.8) strength = 'good';
    else if (value >= 0.7) strength = 'moderate';
    else if (value > 0.5) strength = 'weak';
    
    return getTooltip('auc', { VALUE: formatNumber(aucValue, 2), STRENGTH: strength });
}

function getPhiInterpretation(phiData, featureName = '') {
    const value = parseFloat(phiData?.value);
    const texts = APP_CONFIG.UI_TEXTS.statMetrics.associationStrengthTexts;
    let strength = texts.undetermined;

    if (!isNaN(value)) {
        const absPhi = Math.abs(value);
        if (absPhi >= 0.5) strength = texts.strong;
        else if (absPhi >= 0.3) strength = texts.moderate;
        else if (absPhi >= 0.1) strength = texts.weak;
        else strength = texts.very_weak;
    }
    
    return getTooltip('phi', {
        VALUE: formatNumber(value, 2),
        STRENGTH: strength,
        FEATURE_NAME: escapeHTML(featureName)
    });
}

function getORInterpretation(orData, featureName = '') {
    const orValue = parseFloat(orData?.value);
    if (isNaN(orValue) || !orData.ci || orData.ci.lower === null || orData.ci.upper === null) return 'Odds Ratio: Not available';

    const isSignificant = !(orData.ci.lower < 1 && orData.ci.upper > 1);
    const templateKey = isSignificant ? 'or_sig' : 'or_ns';
    
    const factorText = orValue > 1 ? 'increased' : 'decreased';
    const absValForStrength = orValue > 1 ? orValue : 1 / orValue;
    let strength = 'weak';
    if (absValForStrength >= 3.0) strength = 'strong';
    else if (absValForStrength >= 1.5) strength = 'moderate';

    return getTooltip(templateKey, {
        FACTOR_TEXT: factorText,
        VALUE: formatNumber(orValue, 2),
        CI_LOWER: formatNumber(orData.ci.lower, 2),
        CI_UPPER: formatNumber(orData.ci.upper, 2),
        STRENGTH: strength,
        FEATURE_NAME: escapeHTML(featureName)
    });
}

function getRDInterpretation(rdData, featureName = '') {
    const rdValue = parseFloat(rdData?.value);
    if (isNaN(rdValue) || !rdData.ci || rdData.ci.lower === null || rdData.ci.upper === null) return 'Risk Difference: Not available';

    const isSignificant = !(rdData.ci.lower < 0 && rdData.ci.upper > 0);
    const templateKey = isSignificant ? 'rd_sig' : 'rd_ns';
    const directionText = rdValue > 0 ? 'increase' : 'decrease';

    return getTooltip(templateKey, {
        DIRECTION_TEXT: directionText,
        VALUE: formatNumber(Math.abs(rdValue * 100), 1),
        CI_LOWER: formatNumber(rdData.ci.lower * 100, 1),
        CI_UPPER: formatNumber(rdData.ci.upper * 100, 1),
        FEATURE_NAME: escapeHTML(featureName)
    });
}

function getTestInterpretation(testData, testKey) {
    if (!testData || isNaN(testData.pValue)) return `Interpretation for ${testKey}: Not available`;

    const pValue = testData.pValue;
    const isSignificant = pValue < APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
    
    return getTooltip(testKey, {
        P_VALUE_TEXT: getPValueText(pValue, false),
        SIGNIFICANCE_TEXT: isSignificant ? 'statistically significant' : 'not statistically significant',
        IS_IS_NOT: isSignificant ? 'is' : 'is not'
    });
}

function getAssociationInterpretation(pValData, featureName = '') {
    if (!pValData || isNaN(pValData.pValue)) return 'Association Interpretation: Not available';

    const pValue = pValData.pValue;
    const isSignificant = pValue < APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
    let strength = 'no significant';
    
    if (isSignificant) {
        if (pValue < 0.001) strength = 'a very strong';
        else if (pValue < 0.01) strength = 'a strong';
        else strength = 'a moderate';
    }

    return getTooltip('fisher', {
        P_VALUE_TEXT: getPValueText(pValue, false),
        SIGNIFICANCE_TEXT: isSignificant ? 'statistically significant' : 'not statistically significant',
        STRENGTH: strength,
        FEATURE_NAME: escapeHTML(featureName)
    });
}

function escapeHTML(text) {
    if (typeof text !== 'string') return text === null ? '' : String(text);
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, match => map[match]);
}

function getT2IconSVG(type, value) {
    const s = APP_CONFIG.UI_SETTINGS.ICON_SIZE;
    const sw = APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH;
    const iconColor = APP_CONFIG.UI_SETTINGS.ICON_COLOR;
    const c = s / 2;
    const r = (s - sw) / 2;
    const sq = s - sw * 1.5;
    const sqPos = (s - sq) / 2;
    let svgContent = '';

    const getSvgContentFromConfig = (key, val) => {
        const normalizedVal = String(val).toLowerCase();
        const configKey = `${key.toUpperCase()}_${normalizedVal.toUpperCase()}`;
        const svgFactory = APP_CONFIG.T2_ICON_SVGS[configKey];
        if (svgFactory) {
            return svgFactory(s, sw, iconColor, c, r, sq, sqPos);
        }
        return APP_CONFIG.T2_ICON_SVGS.UNKNOWN(s, sw, iconColor, c, r, sq, sqPos);
    };

    switch (type) {
        case 'size':
            svgContent = getSvgContentFromConfig('size', 'default');
            break;
        case 'shape':
            svgContent = getSvgContentFromConfig('shape', value);
            break;
        case 'border':
            svgContent = getSvgContentFromConfig('border', value);
            break;
        case 'homogeneity':
            svgContent = getSvgContentFromConfig('homogeneity', value);
            break;
        case 'signal':
            svgContent = getSvgContentFromConfig('signal', value);
            break;
        default:
            svgContent = APP_CONFIG.T2_ICON_SVGS.UNKNOWN(s, sw, iconColor, c, r, sq, sqPos);
    }
    return `<svg class="icon-t2 icon-${type}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: ${value || 'unknown'}">${svgContent}</svg>`;
}
