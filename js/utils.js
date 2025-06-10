function getCohortDisplayName(cohortId) {
    return APP_CONFIG.UI_TEXTS.cohortDisplayNames[cohortId] || cohortId || 'Unknown';
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
    const formatFn = isPercent ? (val, dig) => formatNumber(val * 100, dig, placeholder, true) : (val, dig) => formatNumber(val, dig, placeholder, true);
    const formattedValue = formatFn(value, digits);

    if (formattedValue === placeholder && !(value === 0 && placeholder === '--')) {
        return placeholder;
    }

    const formattedLower = formatFn(ciLower, digits);
    const formattedUpper = formatFn(ciUpper, digits);

    if (formattedLower !== placeholder && formattedUpper !== placeholder) {
        const ciStr = `(${formattedLower}–${formattedUpper})`;
        return `${formattedValue}${isPercent ? '' : ''} ${ciStr}`;
    }
    return `${formattedValue}${isPercent ? '' : ''}`;
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
        console.error(`Error saving to Local Storage (Key: ${key}):`, e);
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
             console.error(`Error removing corrupted item from Local Storage (Key: ${key}):`, removeError);
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
                const getStatusValue = p => (p[subKey || 'n'] === '+') ? 1 : (p[subKey || 'n'] === '-') ? 0 : -1;
                valA = getStatusValue(a);
                valB = getStatusValue(b);
            } else if (key.startsWith('anzahl_')) {
                const type = key.replace('anzahl_', '').replace('_lk', '');
                const getCounts = (p, t) => {
                    const plusKey = `anzahl_${t}_plus_lk`;
                    const totalKey = `anzahl_${t}_lk`;
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

function getStatisticalSignificanceText(pValue) {
    if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return '';
    const level = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
    return pValue < level ? 'statistically significant' : 'not statistically significant';
}

function getPValueText(pValue, lang = 'en', forPublication = false) {
    if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';
    const pLessThanThreshold = 0.001;
    if (pValue < pLessThanThreshold) {
        return forPublication ? 'P < .001' : 'p < 0.001';
    }
    const pFormatted = formatNumber(pValue, 3, 'N/A', true);
    const prefix = forPublication ? 'P' : 'p';
    return `${prefix} = ${pFormatted}`;
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
    let fillColor = 'none';
    const unknownIconSVG = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" stroke-dasharray="2 2" /><line x1="${sqPos}" y1="${sqPos}" x2="${sqPos+sq}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/><line x1="${sqPos+sq}" y1="${sqPos}" x2="${sqPos}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;

    switch (type) {
        case 'shape':
            if (value === 'rund') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${iconColor}" stroke-width="${sw}"/>`;
            else if (value === 'oval') svgContent = `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.65}" fill="${fillColor}" stroke="${iconColor}" stroke-width="${sw}"/>`;
            else svgContent = unknownIconSVG;
            break;
        case 'border':
            if (value === 'scharf') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${iconColor}" stroke-width="${sw * 1.2}"/>`;
            else if (value === 'irregulär') svgContent = `<path d="M ${c + r} ${c} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${r*0.8} ${r*1.2} 0 0 1 ${c-r*0.9} ${c-r*0.3} A ${r*1.1} ${r*0.7} 0 0 1 ${c+r} ${c} Z" fill="${fillColor}" stroke="${iconColor}" stroke-width="${sw * 1.2}"/>`;
            else svgContent = unknownIconSVG;
            break;
        case 'homogeneity':
            if (value === 'homogen') svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="${iconColor}" stroke="none" rx="1" ry="1"/>`;
            else if (value === 'heterogen') { const pSize = sq / 4; svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" rx="1" ry="1"/>`; for(let i=0;i<3;i++){for(let j=0;j<3;j++){if((i+j)%2===0){svgContent+=`<rect x="${sqPos+i*pSize+pSize/2}" y="${sqPos+j*pSize+pSize/2}" width="${pSize}" height="${pSize}" fill="${iconColor}" stroke="none" style="opacity:0.6;"/>`;}}} }
            else svgContent = unknownIconSVG;
            break;
        case 'signal':
            if (value === 'signalarm') fillColor = '#555555';
            else if (value === 'intermediär') fillColor = '#aaaaaa';
            else if (value === 'signalreich') fillColor = '#f0f0f0';
            else { svgContent = unknownIconSVG; break; }
            const strokeColor = (value === 'signalreich') ? '#333333' : 'rgba(0,0,0,0.1)';
            svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw * 0.75}"/>`;
            break;
        case 'ruler-horizontal':
            svgContent = `<path d="M${sw/2} ${c} H${s-sw/2} M${c} ${sw/2} V${s-sw/2}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;
            type = 'size';
            break;
        default: svgContent = unknownIconSVG;
    }
    return `<svg class="icon-t2 icon-${type}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: ${value || 'unknown'}">${svgContent}</svg>`;
}
