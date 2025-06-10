function getCohortDisplayName(cohortId) {
    return APP_CONFIG.UI_TEXTS.cohortDisplayNames[cohortId] || cohortId || 'Unknown';
}

function formatNumber(num, digits = 1, placeholder = '--', useStandardFormat = false) {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    // For publication or strict standard format, always use toFixed
    if (useStandardFormat) {
        return number.toFixed(digits);
    }
    // For UI display, try toLocaleString for better readability with thousands separators
    try {
        return number.toLocaleString('en-US', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    } catch (e) {
        // Fallback for environments where toLocaleString might fail or not be desired
        return number.toFixed(digits);
    }
}

function formatPercent(num, digits = 1, placeholder = '--%') {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    // Multiply by 100 and then fix to specified digits
    return `${(number * 100).toFixed(digits)}%`;
}

function formatCI(value, ciLower, ciUpper, digits = 1, isPercent = false, placeholder = '--') {
    // Determine the formatting function based on whether it's a percentage
    const formatFn = isPercent
        ? (val, dig) => formatNumber(val * 100, dig, placeholder, true) // Format percentages as numbers, then add % later
        : (val, dig) => formatNumber(val, dig, placeholder, true);    // Format as regular numbers

    const formattedValue = formatFn(value, digits);

    // If the main value is a placeholder, return it immediately, unless it's a valid zero formatted as placeholder
    if (formattedValue === placeholder && !(value === 0 && placeholder === '--')) {
        return placeholder;
    }

    const formattedLower = formatFn(ciLower, digits);
    const formattedUpper = formatFn(ciUpper, digits);

    // Construct the CI string
    if (formattedLower !== placeholder && formattedUpper !== placeholder) {
        const ciStr = `(95% CI: ${formattedLower}, ${formattedUpper})`;
        // Append '%' only if it's a percentage and not already handled by formatFn for ranges
        return `${formattedValue}${isPercent ? '%' : ''} ${ciStr}`;
    }
    // If CI values are not valid, return only the formatted value
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
                    let statusProp = p[subKey === 'nStatus' ? 'n' : (subKey === 'asStatus' ? 'as' : 't2Status')];
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
    return 'ns'; // Not statistically significant
}

function getPValueText(pValue, forPublication = false) {
    if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';

    const pLessThanThreshold = 0.001; // For P < .001
    const pDot01Threshold = 0.01;     // For two digits if P < .01, e.g. .005
    const pDot05Threshold = 0.05;     // For three digits if P is near .05, e.g. .046
    const pGreater099Threshold = 0.99; // For P > .99

    let formattedP;

    if (forPublication) {
        const prefix = 'P'; // Use 'P' (capitalized) for publication style
        if (pValue < pLessThanThreshold) {
            formattedP = `${prefix} < .001`;
        } else if (pValue >= pLessThanThreshold && pValue < pDot01Threshold) {
            // For values like 0.005, use 3 digits
            formattedP = `${prefix} = ${formatNumber(pValue, 3, 'N/A', true)}`;
        } else if (pValue >= pDot01Threshold && pValue < pDot05Threshold) {
             // For values like 0.046, use 3 digits
             formattedP = `${prefix} = ${formatNumber(pValue, 3, 'N/A', true)}`;
        } else if (pValue >= pDot05Threshold && pValue <= pGreater099Threshold) {
            // For values like 0.52 or 0.06, use 2 digits
            formattedP = `${prefix} = ${formatNumber(pValue, 2, 'N/A', true)}`;
        } else if (pValue > pGreater099Threshold) {
            formattedP = `${prefix} > .99`;
        } else {
            formattedP = `${prefix} = ${formatNumber(pValue, 2, 'N/A', true)}`; // Fallback, e.g., if somehow not covered
        }
    } else {
        const prefix = 'p'; // Use 'p' (lowercase) for UI display
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

function getAUCInterpretation(aucValue) {
    const value = parseFloat(aucValue);
    if (isNaN(value) || value < 0 || value > 1) return APP_CONFIG.UI_TEXTS.statMetrics.associationStrengthTexts.undetermined;
    if (value >= 0.9) return 'excellent';
    if (value >= 0.8) return 'good';
    if (value >= 0.7) return 'moderate';
    if (value > 0.5) return 'weak';
    return 'not informative';
}

function getPhiInterpretation(phiValue) {
    const value = parseFloat(phiValue);
    if (isNaN(value)) return APP_CONFIG.UI_TEXTS.statMetrics.associationStrengthTexts.undetermined;
    const absPhi = Math.abs(value);
    const texts = APP_CONFIG.UI_TEXTS.statMetrics.associationStrengthTexts;
    if (absPhi >= 0.5) return texts.strong;
    if (absPhi >= 0.3) return texts.moderate;
    if (absPhi >= 0.1) return texts.weak;
    return texts.very_weak;
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
        const svgFactory = APP_CONFIG.T2_ICON_SVGS[`${key.toUpperCase()}_${String(val).toUpperCase().replace(/[^A-Z0-9]/g, '')}`];
        if (svgFactory) {
            return svgFactory(s, sw, iconColor, c, r, sq, sqPos);
        }
        return APP_CONFIG.T2_ICON_SVGS.UNKNOWN(s, sw, iconColor, c, r, sq, sqPos);
    };

    switch (type) {
        case 'size':
        case 'ruler-horizontal':
            svgContent = getSvgContentFromConfig('size', 'default');
            break;
        case 'shape':
        case 'form':
            svgContent = getSvgContentFromConfig('form', value);
            break;
        case 'border':
        case 'kontur':
            svgContent = getSvgContentFromConfig('kontur', value);
            break;
        case 'homogeneity':
        case 'homogenitaet':
            svgContent = getSvgContentFromConfig('homogenitaet', value);
            break;
        case 'signal':
            svgContent = getSvgContentFromConfig('signal', value);
            break;
        default:
            svgContent = APP_CONFIG.T2_ICON_SVGS.UNKNOWN(s, sw, iconColor, c, r, sq, sqPos);
    }
    return `<svg class="icon-t2 icon-${type}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: ${value || 'unknown'}">${svgContent}</svg>`;
}
