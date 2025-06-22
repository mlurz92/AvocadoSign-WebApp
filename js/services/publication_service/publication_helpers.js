window.publicationHelpers = (() => {

    function formatPValueForPublication(pValue) {
        return getPValueText(pValue, true);
    }

    function formatValueForPublication(value, digits = 0, isPercent = false, noLeadingZero = false) {
        const num = parseFloat(value);
        if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
            return 'N/A';
        }

        const finalValue = isPercent ? num * 100 : num;
        let formattedString = finalValue.toFixed(digits);

        if (noLeadingZero && Math.abs(parseFloat(formattedString)) < 1 && (formattedString.startsWith('0.') || formattedString.startsWith('-0.'))) {
            return formattedString.replace('0.', '.');
        }
        
        return formattedString;
    }

    function formatMetricForPublication(metric, name, showValueOnly = false) {
        if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) {
            return 'N/A';
        }

        let isPercent, digits, noLeadingZero;
        const metricLower = name.toLowerCase();

        switch (metricLower) {
            case 'sens':
            case 'spec':
            case 'ppv':
            case 'npv':
            case 'acc':
                isPercent = true;
                digits = 1;
                noLeadingZero = false;
                break;
            case 'auc':
            case 'kappa':
            case 'icc':
            case 'f1':
            case 'youden':
            case 'or':
            case 'hr':
            case 'rr':
                isPercent = false;
                digits = 2;
                noLeadingZero = true;
                break;
            default:
                isPercent = false;
                digits = 2;
                noLeadingZero = false;
                break;
        }
        
        const valueStr = formatValueForPublication(metric.value, digits, isPercent, noLeadingZero);
        let valueWithUnit = isPercent ? `${valueStr}%` : valueStr;

        if (showValueOnly) {
            return valueWithUnit;
        }

        let detailsStr = '';
        if (isPercent && metric.n_success !== undefined && metric.n_trials !== undefined && metric.n_trials > 0) {
            detailsStr += ` (${metric.n_success} of ${metric.n_trials}`;
        }

        if (metric.ci && typeof metric.ci.lower === 'number' && typeof metric.ci.upper === 'number' && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper)) {
            const lowerStr = formatValueForPublication(metric.ci.lower, digits, isPercent, noLeadingZero);
            const upperStr = formatValueForPublication(metric.ci.upper, digits, isPercent, noLeadingZero);
            const ciStr = isPercent ? `${lowerStr}%, ${upperStr}%` : `${lowerStr}, ${upperStr}`;
            
            if (detailsStr) {
                detailsStr += `; 95% CI: ${ciStr})`;
            } else {
                detailsStr = ` (95% CI: ${ciStr})`;
            }
        } else if (detailsStr) {
            detailsStr += ')';
        }

        return `${valueWithUnit}${detailsStr}`;
    }

    function createPublicationTableHTML(config) {
        if (!config || !Array.isArray(config.headers) || !Array.isArray(config.rows)) {
            return '<p>Error: Invalid table configuration.</p>';
        }

        const { id, caption, headers, rows, notes } = config;
        const abbreviations = new Set();

        const processCellContent = (content) => {
            const contentStr = String(content ?? '');
            const found = contentStr.match(/[A-Z]{2,}/g);
            if (found) {
                found.forEach(abbr => {
                    if (abbr !== 'CI' && abbr !== 'SD' && abbr !== 'IQR') {
                        abbreviations.add(abbr);
                    }
                });
            }
            return contentStr;
        };

        let tableHtml = `<div class="table-responsive my-4" id="${id || generateUUID()}">`;
        tableHtml += `<table class="table table-sm table-bordered small">`;
        if (caption) {
            tableHtml += `<caption style="caption-side: top; text-align: left; font-weight: bold; color: black;">${caption}</caption>`;
        }
        tableHtml += `<thead><tr>${headers.map(h => `<th>${processCellContent(h)}</th>`).join('')}</tr></thead><tbody>`;

        rows.forEach(row => {
            tableHtml += `<tr>${row.map((cell, index) => {
                const cellData = processCellContent(cell);
                const isIndented = cellData.startsWith('   ');
                const tag = (index === 0 && !isIndented) ? 'th' : 'td';
                const style = isIndented ? 'style="padding-left: 2em;"' : (tag === 'th' ? 'style="text-align: left; font-weight: normal;"' : '');
                const scope = (tag === 'th') ? 'scope="row"' : '';
                return `<${tag} ${scope} ${style}>${cellData.trim()}</${tag}>`;
            }).join('')}</tr>`;
        });
        tableHtml += `</tbody>`;

        let footerContent = '';
        if (abbreviations.size > 0) {
            const abbrDefinitions = {
                'AS': 'Avocado Sign',
                'AUC': 'Area under the receiver operating characteristic curve',
                'BF': 'Brute-Force',
                'ESGAR': 'European Society of Gastrointestinal and Abdominal Radiology',
                'nCRT': 'neoadjuvant chemoradiotherapy',
                'T2w': 'T2-weighted'
            };
            const definedAbbrs = Array.from(abbreviations)
                .filter(abbr => abbrDefinitions[abbr])
                .map(abbr => `${abbr} = ${abbrDefinitions[abbr]}`)
                .join(', ');
            
            if (definedAbbrs) {
                footerContent += `<em>Note.—</em>${definedAbbrs}. `;
            }
        }
        if (notes) {
            footerContent += notes;
        }

        if (footerContent) {
            tableHtml += `<tfoot><tr><td colspan="${headers.length}" style="font-size: 9pt; text-align: left; border: none; padding-top: 0.5em;">${footerContent}</td></tr></tfoot>`;
        }

        tableHtml += `</table></div>`;
        return tableHtml;
    }

    function getReference(id) {
        if (!id) return '[REF_KEY_MISSING]';
        const refData = window.APP_CONFIG.REFERENCES_FOR_PUBLICATION[id];
        if (!refData) return `[REF_NOT_FOUND: ${id}]`;
        return `[${id}]`;
    }

    return Object.freeze({
        formatPValueForPublication,
        formatMetricForPublication,
        formatValueForPublication,
        createPublicationTableHTML,
        getReference
    });

})();