const exportService = (() => {

    function generateFilename(typeKey, kollektiv, extension, options = {}) {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getCohortDisplayName(kollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey] || typeKey || 'Export';

        if (options.chartName) {
            filenameType = filenameType.replace('{ChartName}', options.chartName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        }
        if (options.tableName) {
            filenameType = filenameType.replace('{TableName}', options.tableName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        } else if (typeKey === 'TABLE_PNG_EXPORT' && options.tableId) {
             filenameType = filenameType.replace('{TableName}', options.tableId.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        }

        if (options.studyId && filenameType.includes('{StudyID}')) {
             const safeStudyId = String(options.studyId).replace(/[^a-z0-9_-]/gi, '_');
             filenameType = filenameType.replace('{StudyID}', safeStudyId);
        } else {
             filenameType = filenameType.replace('_{StudyID}', '').replace('{StudyID}', '');
        }

        if (options.sectionName && filenameType.includes('{SectionName}')) {
            const safeSectionName = String(options.sectionName).replace(/[^a-z0-9_-]/gi, '_').substring(0,20);
            filenameType = filenameType.replace('{SectionName}', safeSectionName);
        } else {
            filenameType = filenameType.replace('_{SectionName}', '').replace('{SectionName}', '');
        }

        const filename = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', filenameType)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension);
        return filename;
    }

    function downloadFile(content, filename, mimeType) {
        try {
            if (content === null || content === undefined) {
                 uiManager.showToast(`Export failed: No data generated for ${filename}.`, 'warning');
                 return false;
            }
            let blob;
            if (content instanceof Blob) {
                blob = content;
                if (blob.size === 0) {
                    uiManager.showToast(`Export failed: Empty file generated for ${filename}.`, 'warning');
                    return false;
                }
            } else {
                 const stringContent = String(content);
                 if (stringContent.length === 0) {
                    uiManager.showToast(`Export failed: Empty file generated for ${filename}.`, 'warning');
                    return false;
                 }
                 blob = new Blob([stringContent], { type: mimeType });
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                if (document.body.contains(a)) {
                    document.body.removeChild(a);
                }
                window.URL.revokeObjectURL(url);
            }, 150);
            return true;
        } catch (error) {
            console.error(`Download failed for ${filename}:`, error);
            uiManager.showToast(`Error downloading file '${filename}'.`, 'danger');
            return false;
        }
    }

    async function convertSvgToPngBlob(svgElement, targetWidth = 800) {
        return new Promise((resolve, reject) => {
            if (!svgElement || typeof svgElement.cloneNode !== 'function') {
                return reject(new Error("Invalid SVG element for PNG conversion."));
            }
            try {
                const svgClone = svgElement.cloneNode(true);
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svgClone.setAttribute('version', '1.1');
                svgClone.style.backgroundColor = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                const styles = getComputedStyle(svgElement);
                const viewBox = svgElement.viewBox?.baseVal;
                let sourceWidth = parseFloat(svgClone.getAttribute('width')) || parseFloat(styles.width) || svgElement.width?.baseVal?.value || viewBox?.width || targetWidth;
                let sourceHeight = parseFloat(svgClone.getAttribute('height')) || parseFloat(styles.height) || svgElement.height?.baseVal?.value || viewBox?.height || (targetWidth * 0.75);

                if (sourceWidth <= 0 || sourceHeight <= 0) { sourceWidth = viewBox?.width || targetWidth; sourceHeight = viewBox?.height || (targetWidth * 0.75); }
                if (sourceWidth <= 0 || sourceHeight <= 0) { return reject(new Error("SVG dimensions could not be determined.")); }

                const scaleFactor = targetWidth / sourceWidth;
                const targetHeight = sourceHeight * scaleFactor;

                svgClone.setAttribute('width', String(targetWidth));
                svgClone.setAttribute('height', String(targetHeight));

                const elementsToStyle = svgClone.querySelectorAll('*');
                elementsToStyle.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    const styleProps = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'opacity', 'stroke-dasharray'];
                    let styleString = el.getAttribute('style') || '';
                    styleProps.forEach(prop => {
                        if (computed[prop] && computed[prop] !== 'none' && computed[prop] !== '0px' && computed[prop] !== 'auto') {
                            styleString += `${prop}:${computed[prop]}; `;
                        }
                    });
                    if (styleString) el.setAttribute('style', styleString);
                });

                const svgXml = new XMLSerializer().serializeToString(svgClone);
                const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgXml)))}`;

                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { return reject(new Error("Canvas Context not available.")); }
                    ctx.fillStyle = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) { resolve(blob); }
                        else { reject(new Error("Canvas toBlob failed.")); }
                    }, 'image/png');
                };
                img.onerror = () => { reject(new Error("Error loading SVG image for PNG conversion.")); };
                img.src = svgDataUrl;
            } catch (error) {
                reject(new Error(`Error during SVG-to-PNG conversion: ${error.message}`));
            }
        });
    }

     async function convertSvgToSvgBlob(svgElement) {
         return new Promise((resolve, reject) => {
             if (!svgElement || typeof svgElement.cloneNode !== 'function') return reject(new Error("Invalid SVG element for SVG export."));
              try {
                 const svgClone = svgElement.cloneNode(true);
                 svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                 svgClone.setAttribute('version', '1.1');
                 const elementsToStyle = svgClone.querySelectorAll('*');
                 elementsToStyle.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    const styleProps = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'opacity', 'stroke-dasharray'];
                    let styleString = el.getAttribute('style') || '';
                    styleProps.forEach(prop => {
                        if (computed[prop] && computed[prop] !== 'none' && computed[prop] !== '0px' && computed[prop] !== 'auto') {
                            styleString += `${prop}:${computed[prop]}; `;
                        }
                    });
                    if (styleString) el.setAttribute('style', styleString);
                });

                 const svgXml = new XMLSerializer().serializeToString(svgClone);
                 const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
                 resolve(blob);
              } catch(error) {
                 reject(new Error(`Error during SVG-to-SVG Blob conversion: ${error.message}`));
              }
         });
     }

    function generateStatistikCSVString(stats, kollektiv, criteria, logic) {
        if (!stats || !stats.descriptive) return null;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
        const csvData = []; const na = 'N/A'; const fv = (v, d, p = false) => formatNumber(v, d, na, p); const fp = (v, d) => formatPercent(v, d, na);
        const fCI = (o, d, isP) => !o || typeof o !== 'object' || o.lower === null || o.upper === null || isNaN(o.lower) || isNaN(o.upper) ? [na, na] : [fv(o.lower, d, true), fv(o.upper, d, true)];
        const fPVal = (p) => (p !== null && !isNaN(p)) ? (p < 0.0001 ? '<0.0001' : fv(p, 4, true)) : na;

        try {
            csvData.push(['Parameter', 'Wert']); csvData.push(['Kollektiv', getCohortDisplayName(kollektiv)]); csvData.push(['Angewandte T2 Logik', logic]); csvData.push(['Angewandte T2 Kriterien', formatCriteriaFunc(criteria, logic)]); csvData.push(['Anzahl Patienten', stats.descriptive.patientCount]); csvData.push([]);
            csvData.push(['Metrik (Deskriptiv)', 'Wert (Median)', 'Mean', 'SD', 'Min', 'Max']); const d = stats.descriptive;
            csvData.push(['Alter (Jahre)', fv(d.age?.median, 1, true), fv(d.age?.mean, 1, true), fv(d.age?.sd, 1, true), fv(d.age?.min, 0, true), fv(d.age?.max, 0, true)]);
            csvData.push(['Geschlecht Männlich (n)', `${d.sex?.m ?? 0}`]);
            csvData.push(['Geschlecht Männlich (%)', `${fp(d.patientCount > 0 ? (d.sex?.m ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['Geschlecht Weiblich (n)', `${d.sex?.f ?? 0}`]);
            csvData.push(['Geschlecht Weiblich (%)', `${fp(d.patientCount > 0 ? (d.sex?.f ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['Therapie direkt OP (n)', `${d.therapy?.['direkt OP'] ?? 0}`]);
            csvData.push(['Therapie direkt OP (%)', `${fp(d.patientCount > 0 ? (d.therapy?.['direkt OP'] ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['Therapie nRCT (n)', `${d.therapy?.nRCT ?? 0}`]);
            csvData.push(['Therapie nRCT (%)', `${fp(d.patientCount > 0 ? (d.therapy?.nRCT ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['N Status (+)', `${d.nStatus?.plus ?? 0}`]);
            csvData.push(['N Status (+ / %)', `${fp(d.patientCount > 0 ? (d.nStatus?.plus ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['AS Status (+)', `${d.asStatus?.plus ?? 0}`]);
            csvData.push(['AS Status (+ / %)', `${fp(d.patientCount > 0 ? (d.asStatus?.plus ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['T2 Status (+)', `${d.t2Status?.plus ?? 0}`]);
            csvData.push(['T2 Status (+ / %)', `${fp(d.patientCount > 0 ? (d.t2Status?.plus ?? 0) / d.patientCount : NaN, 1)}`]);
            const fLKRow = (lk) => [fv(lk?.median, 1, true), fv(lk?.mean, 1, true), fv(lk?.sd, 1, true), fv(lk?.min, 0, true), fv(lk?.max, 0, true)];
            csvData.push(['LK N gesamt (Median)', ...fLKRow(d.lnCounts?.n?.total)]); csvData.push(['LK N+ (Median, nur N+ Pat.)', ...fLKRow(d.lnCounts?.n?.plus)]); csvData.push(['LK AS gesamt (Median)', ...fLKRow(d.lnCounts?.as?.total)]); csvData.push(['LK AS+ (Median, nur AS+ Pat.)', ...fLKRow(d.lnCounts?.as?.plus)]); csvData.push(['LK T2 gesamt (Median)', ...fLKRow(d.lnCounts?.t2?.total)]); csvData.push(['LK T2+ (Median, nur T2+ Pat.)', ...fLKRow(d.lnCounts?.t2?.plus)]); csvData.push([]);
            csvData.push(['Metrik (Diagnostik)', 'Methode', 'Wert', '95% CI Lower', '95% CI Upper', 'SE (Bootstrap)', 'CI Methode']); const addPerfRow = (metricKey, metricName, objAS, objT2) => { const isRate = !(metricKey === 'auc' || metricKey === 'f1'); const digits = metricKey === 'auc' ? 2 : (metricKey === 'f1' ? 3 : 1); const ciAS = fCI(objAS?.ci, digits, isRate); const ciT2 = fCI(objT2?.ci, digits, isRate); const valAS = fv(objAS?.value, digits, true); const valT2 = fv(objT2?.value, digits, true); csvData.push([metricName, 'AS', valAS, ciAS[0], ciAS[1], fv(objAS?.se, 4, true), objAS?.method || na]); csvData.push([metricName, 'T2', valT2, ciT2[0], ciT2[1], fv(objT2?.se, 4, true), objT2?.method || na]); }; const gAS = stats.performanceAS, gT2 = stats.performanceT2Applied; addPerfRow('sens', 'Sensitivität', gAS?.sens, gT2?.sens); addPerfRow('spec', 'Spezifität', gAS?.spec, gT2?.spec); addPerfRow('ppv', 'PPV', gAS?.ppv, gT2?.ppv); addPerfRow('npv', 'NPV', gAS?.npv, gT2?.npv); addPerfRow('acc', 'Accuracy', gAS?.acc, gT2?.acc); addPerfRow('balAcc', 'Balanced Accuracy', gAS?.balAcc, gT2?.balAcc); addPerfRow('f1', 'F1-Score', gAS?.f1, gT2?.f1); addPerfRow('auc', 'AUC', gAS?.auc, gT2?.auc); csvData.push([]);
            csvData.push(['Vergleichstest (AS vs. T2 angewandt)', 'Test Statistik', 'p-Wert', 'Methode']); const v = stats.comparisonASvsT2Applied; csvData.push(['Accuracy (McNemar)', fv(v?.mcnemar?.statistic, 3, true), fPVal(v?.mcnemar?.pValue), v?.mcnemar?.method || na]); csvData.push(['AUC (DeLong)', fv(v?.delong?.Z, 3, true), fPVal(v?.delong?.pValue), v?.delong?.method || na]); csvData.push([]);
            csvData.push(['Assoziation mit N-Status', 'Merkmal Key', 'Merkmal Name', 'OR', 'OR CI Lower', 'OR CI Upper', 'RD', 'RD CI Lower', 'RD CI Upper', 'Phi', 'Test Statistik', 'p-Wert', 'Test Methode']); const addAssocRow = (key, name, obj) => { if (!obj) return; const orCI = fCI(obj.or?.ci, 2, false); const rdCI = fCI(obj.rd?.ci, 3, false); csvData.push([ key, name, fv(obj.or?.value, 2, true), orCI[0], orCI[1], fv(obj.rd?.value, 3, true), rdCI[0], rdCI[1], fv(obj.phi?.value, 2, true), fv(obj.statistic ?? NaN, 2, true), fPVal(obj.pValue), obj.testName || na ]); }; const a = stats.associationsApplied; addAssocRow('as', 'AS Positiv', a?.as); if(a?.size_mwu) { csvData.push(['size_mwu', a.size_mwu.featureName || 'LK Größe MWU', na, na, na, na, na, na, na, fv(a.size_mwu.Z, 2, true), fPVal(a.size_mwu.pValue), a.size_mwu.testName || na ]); } ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(fKey => { if(a && a[fKey]) { addAssocRow(fKey, a[fKey].featureName || `T2 ${fKey}`, a[fKey]); } });
            return Papa.unparse(csvData, { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
        } catch (error) {
             console.error("Error in generateStatistikCSVString:", error);
             return null;
        }
    }

    function generateBruteForceTXTString(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) return "No Brute-Force results available.";
        try {
            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatting Error';
            const { results, metric, duration, totalTested, cohort, nTotal, nPlus, nMinus } = resultsData;
            const cohortName = getCohortDisplayName(cohort);
            const bestResult = results[0];
            let report = `Brute-Force Optimization Report\r\n==================================================\r\n`;
            report += `Date of Analysis: ${new Date().toLocaleString('en-US')}\r\n`;
            report += `Analyzed Cohort: ${cohortName}\r\n`;
            report += `   - Total Patients: ${formatNumber(nTotal, 0, 'N/A')}\r\n`;
            report += `   - N+ Patients: ${formatNumber(nPlus, 0, 'N/A')}\r\n`;
            report += `   - N- Patients: ${formatNumber(nMinus, 0, 'N/A')}\r\n`;
            report += `Optimized Target Metric: ${metric}\r\n`;
            report += `Total Duration: ${formatNumber((duration || 0) / 1000, 1, 'N/A', true)} seconds\r\n`;
            report += `Combinations Tested: ${formatNumber(totalTested, 0, 'N/A', true)}\r\n`;
            report += `==================================================\r\n\r\n`;
            report += `--- Best Result ---\r\n`;
            report += `Logic: ${bestResult.logic.toUpperCase()}\r\n`;
            report += `Criteria: ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}\r\n`;
            report += `Achieved ${metric}: ${formatNumber(bestResult.metricValue, 4, 'N/A', true)}\r\n\r\n`;
            report += `--- Top 10 Results (including identical values) ---\r\n`;
            report += `Rank | ${metric.padEnd(12)} | Logic | Criteria\r\n`;
            report += `-----|--------------|-------|------------------------------------------\r\n`;

            let rank = 1, displayedCount = 0, lastMetricValue = -Infinity; const precision = 8;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue;
                const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision));
                const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));
                let currentRank = rank;
                const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8;
                if (i > 0 && isNewRank) { rank = displayedCount + 1; currentRank = rank; }
                else if (i > 0) { currentRank = rank; }
                if (rank > 10 && isNewRank) break;
                report += `${String(currentRank).padEnd(4)} | ${formatNumber(result.metricValue, 4, 'N/A', true).padEnd(12)} | ${result.logic.toUpperCase().padEnd(5)} | ${formatCriteriaFunc(result.criteria, result.logic)}\r\n`;
                if (isNewRank || i === 0) { lastMetricValue = result.metricValue; }
                displayedCount++;
            }
            report += `==================================================\r\n`;
            return report;
        } catch (error) {
             console.error("Error in generateBruteForceTXTString:", error);
             return null;
        }
    }

    function generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria = null, logic = null, options = {}) {
        try {
            let headers = [], rows = [], title = ''; 
            const kollektivDisplayName = getCohortDisplayName(kollektiv); 
            const escMD = (text) => escapeHTML(String(text)); // Simplified; a real one would handle more MD chars.
            const na = '--'; 
            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A'; 
            const t2CriteriaLabelShort = options.t2CriteriaLabelShort || 'T2';

            if (tableType.startsWith('publication_')) {
                let sectionTitle = 'Publication Content';
                if(options.subSectionLabel) sectionTitle = options.subSectionLabel;
                else if (tableType === 'publication_abstract') sectionTitle = 'Abstract';
                else if (tableType === 'publication_introduction') sectionTitle = 'Introduction';
                else if (tableType === 'publication_discussion') sectionTitle = 'Discussion';
                else if (tableType === 'publication_references') sectionTitle = 'References';
                return `# ${sectionTitle}\n\n${dataOrStats}`;
            }
            
            if (tableType === 'daten') { title = 'Data List'; headers = ['ID', 'Last Name', 'First Name', 'Sex', 'Age', 'Therapy', 'N', 'AS', 'T2', 'Notes']; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\nError: Invalid data.`; rows = dataOrStats.map(p => [p.id, p.name || '', p.firstName || '', p.sex || '', p.age ?? '', getCohortDisplayName(p.therapy), p.nStatus ?? na, p.asStatus ?? na, p.t2Status ?? na, p.notes || ''].map(escMD)); }
            else if (tableType === 'auswertung') { title = 'Analysis Table'; headers = ['ID', 'Name', 'Therapy', 'N', 'AS', 'T2', 'N+/N total', 'AS+/AS total', 'T2+/T2 total']; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\nError: Invalid data.`; rows = dataOrStats.map(p => [p.id, p.name || '', getCohortDisplayName(p.therapy), p.nStatus ?? na, p.asStatus ?? na, p.t2Status ?? na, `${formatNumber(p.countPathologyNodesPositive, 0, '-')} / ${formatNumber(p.countPathologyNodes, 0, '-')}`, `${formatNumber(p.countASNodesPositive, 0, '-')} / ${formatNumber(p.countASNodes, 0, '-')}`, `${formatNumber(p.countT2NodesPositive, 0, '-')} / ${formatNumber(p.countT2Nodes, 0, '-')}`].map(escMD)); }
            else if (tableType === 'deskriptiv') { title = 'Descriptive Statistics'; const stats = dataOrStats; if (!stats || !stats.patientCount) return `# ${title} (Cohort: ${kollektivDisplayName})\n\nNo data available.`; const total = stats.patientCount; headers = ['Metric', 'Value']; const fLKRowMD = (lk) => `${formatNumber(lk?.median, 1, na)} (${formatNumber(lk?.min, 0, na)}-${formatNumber(lk?.max, 0, na)}) \\[Mean: ${formatNumber(lk?.mean, 1, na)} ± ${formatNumber(lk?.sd, 1, na)}\\]`; rows = [ ['Number of Patients', total], ['Median Age (Min-Max) \\[Mean ± SD\\]', `${formatNumber(stats.age?.median, 1, na)} (${formatNumber(stats.age?.min, 0, na)} - ${formatNumber(stats.age?.max, 0, na)}) \\[${formatNumber(stats.age?.mean, 1, na)} ± ${formatNumber(stats.age?.sd, 1, na)}\\]`], ['Sex (m/f) (n / %)', `${stats.sex?.m ?? 0} / ${stats.sex?.f ?? 0} (${formatPercent((stats.sex?.m ?? 0) / total, 1)} / ${formatPercent((stats.sex?.f ?? 0) / total, 1)})`], ['Therapy (Upfront Surgery / nRCT) (n / %)', `${stats.therapy?.['direkt OP'] ?? 0} / ${stats.therapy?.nRCT ?? 0} (${formatPercent((stats.therapy?.['direkt OP'] ?? 0) / total, 1)} / ${formatPercent((stats.therapy?.nRCT ?? 0) / total, 1)})`], ['N Status (+ / -) (n / %)', `${stats.nStatus?.plus ?? 0} / ${stats.nStatus?.minus ?? 0} (${formatPercent((stats.nStatus?.plus ?? 0) / total, 1)} / ${formatPercent((stats.nStatus?.minus ?? 0) / total, 1)})`], ['AS Status (+ / -) (n / %)', `${stats.asStatus?.plus ?? 0} / ${stats.asStatus?.minus ?? 0} (${formatPercent((stats.asStatus?.plus ?? 0) / total, 1)} / ${formatPercent((stats.asStatus?.minus ?? 0) / total, 1)})`], ['T2 Status (+ / -) (n / %)', `${stats.t2Status?.plus ?? 0} / ${stats.t2Status?.minus ?? 0} (${formatPercent((stats.t2Status?.plus ?? 0) / total, 1)} / ${formatPercent((stats.t2Status?.minus ?? 0) / total, 1)})`], ['Median LN N total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lnCounts?.n?.total)], ['Median LN N+ (Min-Max) \\[Mean ± SD\\] (only N+ Pat.)', fLKRowMD(stats.lnCounts?.n?.plus)], ['Median LN AS total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lnCounts?.as?.total)], ['Median LN AS+ (Min-Max) \\[Mean ± SD\\] (only AS+ Pat.)', fLKRowMD(stats.lnCounts?.as?.plus)], ['Median LN T2 total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lnCounts?.t2?.total)], ['Median LN T2+ (Min-Max) \\[Mean ± SD\\] (only T2+ Pat.)', fLKRowMD(stats.lnCounts?.t2?.plus)] ].map(r => r.map(escMD)); }
            else if (tableType === 'praes_as_perf') { title = `Diagnostic Performance (AS) for Cohorts`; const { statsGesamt, statsDirektOP, statsNRCT } = dataOrStats || {}; if (!statsGesamt && !statsDirektOP && !statsNRCT) return `# ${title}\n\nError: Invalid data.`; headers = ['Cohort', 'Sens. (95% CI)', 'Spec. (95% CI)', 'PPV (95% CI)', 'NPV (95% CI)', 'Acc. (95% CI)', 'AUC (95% CI)']; const fRow = (s, k) => { const d = getCohortDisplayName(k); if (!s || typeof s.matrix !== 'object') return [d + ' (N=?)', na, na, na, na, na, na].map(escMD); const n = s.matrix ? (s.matrix.tp + s.matrix.fp + s.matrix.fn + s.matrix.tn) : 0; const fCI_p = (m, ky) => { const dig = (ky === 'auc') ? 2 : ((ky === 'f1') ? 3 : 1); const isP = !(ky === 'f1' || ky === 'auc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, dig, isP, na); }; return [`${d} (N=${n})`, fCI_p(s.sens, 'sens'), fCI_p(s.spec, 'spec'), fCI_p(s.ppv, 'ppv'), fCI_p(s.npv, 'npv'), fCI_p(s.acc, 'acc'), fCI_p(s.auc, 'auc')].map(escMD); }; rows = [ fRow(statsGesamt, 'Gesamt'), fRow(statsDirektOP, 'direkt OP'), fRow(statsNRCT, 'nRCT') ]; }
            else if (tableType === 'praes_as_vs_t2_perf' || tableType === 'praes_as_vs_t2_comp') { const { performanceAS, performanceT2 } = dataOrStats || {}; title = `Comparison Diagnostic Performance (AS vs. ${escMD(t2CriteriaLabelShort)})`; if (!performanceAS || !performanceT2) return `# ${title} (Cohort: ${kollektivDisplayName})\n\nError: Invalid data for comparison.`; headers = ['Metric', 'AS (Value, 95% CI)', `${escMD(t2CriteriaLabelShort)} (Value, 95% CI)`]; const fRow = (mKey, nm, isP = true, d = 1) => { const mAS = performanceAS[mKey]; const mT2 = performanceT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? 3 : d; const vAS = formatCI(mAS?.value, mAS?.ci?.lower, mAS?.ci?.upper, dig, isP, na); const vT2 = formatCI(mT2?.value, mT2?.ci?.lower, mT2?.ci?.upper, dig, isP, na); return [nm, vAS, vT2]; }; rows = [ fRow('sens', 'Sensitivity'), fRow('spec', 'Specificity'), fRow('ppv', 'PPV'), fRow('npv', 'NPV'), fRow('acc', 'Accuracy'), fRow('balAcc', 'Balanced Accuracy'), fRow('f1', 'F1-Score', false, 3), fRow('auc', 'AUC', false, 2) ].map(r => r.map(escMD)); }
            else if (tableType === 'praes_as_vs_t2_tests') { const { comparison } = dataOrStats || {}; title = `Statistical Comparison (AS vs. ${escMD(t2CriteriaLabelShort)})`; if (!comparison) return `# ${title} (Cohort: ${kollektivDisplayName})\n\nError: Invalid data for comparison tests.`; headers = ['Test', 'Statistic Value', 'p-Value', 'Method']; const fP = (p) => getPValueText(p, 'en', true); rows = [ ['McNemar (Accuracy)', `${formatNumber(comparison?.mcnemar?.statistic, 3, na, true)} (df=${comparison?.mcnemar?.df || na})`, `${fP(comparison?.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(comparison?.mcnemar?.pValue)}`, `${comparison?.mcnemar?.method || na}`], ['DeLong (AUC)', `Z=${formatNumber(comparison?.delong?.Z, 3, na, true)}`, `${fP(comparison?.delong?.pValue)} ${getStatisticalSignificanceSymbol(comparison?.delong?.pValue)}`, `${comparison?.delong?.method || na}`] ].map(r => r.map(escMD)); }
            else { return `# Unknown table type for Markdown: ${tableType}`; }
            const headerLine = `| ${headers.join(' | ')} |`; const separatorLine = `|${headers.map(() => '---').join('|')}|`; const bodyLines = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
            let metaInfo = `# ${title}`; if (!['daten', 'auswertung', 'praes_as_perf'].includes(tableType)) metaInfo += ` (Cohort: ${kollektivDisplayName})`; metaInfo += '\n'; if(criteria && logic && ['auswertung', 'deskriptiv'].includes(tableType)) metaInfo += `\n_T2 Basis (applied): ${escMD(formatCriteriaFunc(criteria, logic))}_\n\n`; else if (options.t2CriteriaLabelFull && ['praes_as_vs_t2_perf', 'praes_as_vs_t2_tests', 'praes_as_vs_t2_comp'].includes(tableType)) metaInfo += `\n_T2 Basis (comparison): ${escMD(options.t2CriteriaLabelFull)}_\n\n`; else metaInfo += '\n';
            return `${metaInfo}${headerLine}\n${separatorLine}\n${bodyLines}`;
        } catch (error) {
            console.error(`Error in generateMarkdownTableString for type ${tableType}:`, error);
            return `# Error generating Markdown table for ${tableType}.`;
        }
   }

    function generateFilteredDataCSVString(data) {
       if (!Array.isArray(data) || data.length === 0) return null;
       try {
           const columns = ["id", "name", "firstName", "birthDate", "sex", "age", "therapy", "examDate", "nStatus", "countPathologyNodes", "countPathologyNodesPositive", "asStatus", "countASNodes", "countASNodesPositive", "t2Status", "countT2Nodes", "countT2NodesPositive", "notes"];
           const csvData = data.map(p => { const row = {}; columns.forEach(col => { row[col] = p[col] ?? ''; }); return row; });
           return Papa.unparse(csvData, { header: true, delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
       } catch (error) {
           console.error("Error in generateFilteredDataCSVString:", error);
           return null;
       }
   }

    function generateComprehensiveReportHTML(data, allBruteForceResults, kollektiv, criteria, logic) {
        try {
            const statsDataForAllKollektive = statisticsService.calculateAllPublicationStats(data, criteria, logic, allBruteForceResults);
            if (!data || !statsDataForAllKollektive || !criteria || !logic) return '<html><head><title>Error</title></head><body>Error: Necessary data for report missing.</body></html>';

            const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
            const config = APP_CONFIG.REPORT_SETTINGS; const kollektivName = getCohortDisplayName(kollektiv); const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium'}); const criteriaString = formatCriteriaFunc(criteria, logic); const appliedCriteriaDisplayName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME; let chartSVGs = {};
            const getChartSVG = (chartId) => { const el = document.getElementById(chartId)?.querySelector('svg'); if(!el) return `<p class="text-muted small">[Diagram ${chartId} not renderable/found]</p>`; try { const clone = el.cloneNode(true); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('version', '1.1'); clone.style.backgroundColor = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff'; const vb = clone.getAttribute('viewBox')?.split(' '); let w = clone.getAttribute('width'), h = clone.getAttribute('height'); if (vb && vb.length === 4 && parseFloat(vb[2]) > 0 && parseFloat(vb[3]) > 0) { clone.setAttribute('width', vb[2]); clone.setAttribute('height', vb[3]); } else if (!w || !h || parseFloat(w) <= 0 || parseFloat(h) <= 0) { clone.setAttribute('width', '400'); clone.setAttribute('height', '300'); } const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style"); styleEl.textContent = `svg { font-family: ${getComputedStyle(document.body).fontFamily || 'sans-serif'}; } .axis path, .axis line { fill: none; stroke: #6c757d; shape-rendering: crispEdges; stroke-width: 1px; } .axis text { font-size: 10px; fill: #212529; } .axis-label { font-size: 11px; fill: #212529; text-anchor: middle; } .grid .tick { stroke: #dee2e6; stroke-opacity: 0.6; } .grid path { stroke-width: 0; } .legend { font-size: 10px; fill: #212529; } .bar { opacity: 0.9; } .roc-curve { fill: none; stroke-width: 2px; } .reference-line { stroke: #adb5bd; stroke-width: 1px; stroke-dasharray: 4 2; } .auc-label { font-weight: bold; font-size: 11px; }`; clone.prepend(styleEl); return clone.outerHTML; } catch (e) { return `<p class="text-danger small">[Error embedding chart ${chartId}: ${e.message}]</p>`; } };
            const chartIdsToCapture = ['chart-dash-age', 'chart-dash-gender'];
            chartIdsToCapture.forEach(id => { if (document.getElementById(id)) chartSVGs[id] = getChartSVG(id); });
            const statsDataForCurrentKollektiv = statsDataForAllKollektive[kollektiv];

            let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${config.REPORT_TITLE} - ${kollektivName}</title>`; html += `<style> body { font-family: sans-serif; font-size: 10pt; line-height: 1.4; padding: 25px; max-width: 800px; margin: auto; color: #212529; background-color: #fff;} h1, h2, h3 { color: #333; margin-top: 1.2em; margin-bottom: 0.6em; padding-bottom: 0.2em; border-bottom: 1px solid #ccc; page-break-after: avoid; } h1 { font-size: 16pt; border-bottom-width: 2px; } h2 { font-size: 14pt; } h3 { font-size: 12pt; font-weight: bold; border-bottom: none; margin-bottom: 0.4em; } table { border-collapse: collapse; width: 100%; margin-bottom: 1em; font-size: 9pt; page-break-inside: avoid; } th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; word-wrap: break-word; } th { background-color: #f2f2f2; font-weight: bold; } .chart-container { text-align: center; margin: 1em 0; page-break-inside: avoid; background-color: #fff; padding: 10px; border: 1px solid #eee; max-width: 100%; overflow: hidden; } .chart-container svg { max-width: 100%; height: auto; display: block; margin: auto; } .meta-info { background-color: #f9f9f9; border: 1px solid #eee; padding: 10px 15px; margin-bottom: 1.5em; font-size: 9pt; } .meta-info ul { list-style: none; padding: 0; margin: 0; } .meta-info li { margin-bottom: 0.3em; } .small { font-size: 8pt; } .text-muted { color: #6c757d; } ul { padding-left: 20px; margin-top: 0.5em;} li { margin-bottom: 0.2em; } .report-footer { margin-top: 2em; padding-top: 1em; border-top: 1px solid #ccc; font-size: 8pt; color: #888; text-align: center; } .no-print { display: none; } @media print { body { padding: 10px; } .meta-info { background-color: #fff; border: none; padding: 0 0 1em 0;} } </style></head><body>`;
            html += `<h1>${config.REPORT_TITLE}</h1>`; if (config.INCLUDE_APP_VERSION) html += `<p class="text-muted small">Generated with: ${APP_CONFIG.APP_NAME} v${APP_CONFIG.APP_VERSION}</p>`; if (config.INCLUDE_GENERATION_TIMESTAMP) html += `<p class="text-muted small">Generated on: ${timestamp}</p>`;
            html += `<div class="meta-info"><h3>Analysis Configuration</h3><ul>`; if (config.INCLUDE_KOLLEKTIV_INFO) html += `<li><strong>Analyzed Cohort:</strong> ${kollektivName} (N=${statsDataForCurrentKollektiv?.descriptive?.patientCount || 0})</li>`; if (config.INCLUDE_T2_CRITERIA) html += `<li><strong>Applied T2-Criteria ('${appliedCriteriaDisplayName}'):</strong> Logic: ${logic}, Criteria: ${criteriaString}</li>`; html += `</ul></div>`;
            if (config.INCLUDE_DESCRIPTIVES_TABLE && statsDataForCurrentKollektiv?.descriptive) { html += `<h2>Descriptive Statistics</h2>`; html += `<table><thead><tr><th>Metric</th><th>Value (Median)</th><th>Mean</th><th>SD</th><th>Min</th><th>Max</th></tr></thead><tbody>`; const d = statsDataForCurrentKollektiv.descriptive; const na = '--'; const fv = (v, dig = 1, useStd = false) => formatNumber(v, dig, na, useStd); const fP = (v, dig = 1) => formatPercent(v, dig, na); const addRowHTML = (l, vl=na, m=na, s=na, mn=na, mx=na) => `<tr><td>${l}</td><td>${vl}</td><td>${m}</td><td>${s}</td><td>${mn}</td><td>${mx}</td></tr>`; html += addRowHTML('Age (Years)', fv(d.age?.median, 1), fv(d.age?.mean, 1), fv(d.age?.sd, 1), fv(d.age?.min, 0), fv(d.age?.max, 0)); html += addRowHTML('Sex Male (n / %)', `${d.sex?.m ?? 0} / ${fP(d.patientCount > 0 ? (d.sex?.m ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('Sex Female (n / %)', `${d.sex?.f ?? 0} / ${fP(d.patientCount > 0 ? (d.sex?.f ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('Therapy Upfront Surgery (n / %)', `${d.therapy?.['direkt OP'] ?? 0} / ${fP(d.patientCount > 0 ? (d.therapy?.['direkt OP'] ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('Therapy nRCT (n / %)', `${d.therapy?.nRCT ?? 0} / ${fP(d.patientCount > 0 ? (d.therapy?.nRCT ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('N Status (+ / %)', `${d.nStatus?.plus ?? 0} / ${fP(d.patientCount > 0 ? (d.nStatus?.plus ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('AS Status (+ / %)', `${d.asStatus?.plus ?? 0} / ${fP(d.patientCount > 0 ? (d.asStatus?.plus ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('T2 Status (+ / %)', `${d.t2Status?.plus ?? 0} / ${fP(d.patientCount > 0 ? (d.t2Status?.plus ?? 0) / d.patientCount : NaN, 1)}`); const fLK = (lk) => `${fv(lk?.median,1)} (${fv(lk?.min,0)}-${fv(lk?.max,0)})`; html += addRowHTML('LN N total (Median (Min-Max))', fLK(d.lnCounts?.n?.total), fv(d.lnCounts?.n?.total?.mean,1), fv(d.lnCounts?.n?.total?.sd,1),fv(d.lnCounts?.n?.total?.min,0), fv(d.lnCounts?.n?.total?.max,0)); html += addRowHTML('LN N+ (Median (Min-Max), only N+ Pat.)', fLK(d.lnCounts?.n?.plus), fv(d.lnCounts?.n?.plus?.mean,1), fv(d.lnCounts?.n?.plus?.sd,1),fv(d.lnCounts?.n?.plus?.min,0), fv(d.lnCounts?.n?.plus?.max,0)); html += addRowHTML('LN AS total (Median (Min-Max))', fLK(d.lnCounts?.as?.total), fv(d.lnCounts?.as?.total?.mean,1), fv(d.lnCounts?.as?.total?.sd,1),fv(d.lnCounts?.as?.total?.min,0), fv(d.lnCounts?.as?.total?.max,0)); html += addRowHTML('LN AS+ (Median (Min-Max), only AS+ Pat.)', fLK(d.lnCounts?.as?.plus), fv(d.lnCounts?.as?.plus?.mean,1), fv(d.lnCounts?.as?.plus?.sd,1),fv(d.lnCounts?.as?.plus?.min,0), fv(d.lnCounts?.as?.plus?.max,0)); html += addRowHTML('LN T2 total (Median (Min-Max))', fLK(d.lnCounts?.t2?.total), fv(d.lnCounts?.t2?.total?.mean,1), fv(d.lnCounts?.t2?.total?.sd,1),fv(d.lnCounts?.t2?.total?.min,0), fv(d.lnCounts?.t2?.total?.max,0)); html += addRowHTML('LN T2+ (Median (Min-Max), only T2+ Pat.)', fLK(d.lnCounts?.t2?.plus), fv(d.lnCounts?.t2?.plus?.mean,1), fv(d.lnCounts?.t2?.plus?.sd,1),fv(d.lnCounts?.t2?.plus?.min,0), fv(d.lnCounts?.t2?.plus?.max,0)); html += `</tbody></table>`; }
            if (config.INCLUDE_DESCRIPTIVES_CHARTS) { html += `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1em; justify-content: space-around;">`; if (chartSVGs['chart-dash-age']) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>Age Distribution</h3>${chartSVGs['chart-dash-age']}</div>`; if (chartSVGs['chart-dash-gender']) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>Sex Distribution</h3>${chartSVGs['chart-dash-gender']}</div>`; html += `</div>`; }
            const addPerfSectionHTML = (title, statsObj) => { if (!statsObj) return ''; let sHtml = `<h2>${title}</h2><table><thead><tr><th>Metric</th><th>Value (95% CI)</th><th>CI Method</th></tr></thead><tbody>`; const fCI_local = (m, d=1, p=true) => formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, '--'); const na = '--'; sHtml += `<tr><td>Sensitivity</td><td>${fCI_local(statsObj.sens)}</td><td>${statsObj.sens?.method || na}</td></tr>`; sHtml += `<tr><td>Specificity</td><td>${fCI_local(statsObj.spec)}</td><td>${statsObj.spec?.method || na}</td></tr>`; sHtml += `<tr><td>PPV</td><td>${fCI_local(statsObj.ppv)}</td><td>${statsObj.ppv?.method || na}</td></tr>`; sHtml += `<tr><td>NPV</td><td>${fCI_local(statsObj.npv)}</td><td>${statsObj.npv?.method || na}</td></tr>`; sHtml += `<tr><td>Accuracy</td><td>${fCI_local(statsObj.acc)}</td><td>${statsObj.acc?.method || na}</td></tr>`; sHtml += `<tr><td>Balanced Accuracy</td><td>${fCI_local(statsObj.balAcc)}</td><td>${statsObj.balAcc?.method || na}</td></tr>`; sHtml += `<tr><td>F1-Score</td><td>${fCI_local(statsObj.f1, 3, false)}</td><td>${statsObj.f1?.method || na}</td></tr>`; sHtml += `<tr><td>AUC</td><td>${fCI_local(statsObj.auc, 2, false)}</td><td>${statsObj.auc?.method || na}</td></tr>`; sHtml += `</tbody></table>`; return sHtml; };
            if (config.INCLUDE_AS_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.performanceAS) { html += addPerfSectionHTML('Diagnostic Performance: Avocado Sign (vs. N)', statsDataForCurrentKollektiv.performanceAS); }
            if (config.INCLUDE_T2_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.performanceT2Applied) { html += addPerfSectionHTML(`Diagnostic Performance: T2 ('${appliedCriteriaDisplayName}' vs. N)`, statsDataForCurrentKollektiv.performanceT2Applied); }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_TABLE && statsDataForCurrentKollektiv?.comparisonASvsT2Applied) { html += `<h2>Statistical Comparison: AS vs. T2 ('${appliedCriteriaDisplayName}')</h2><table><thead><tr><th>Test</th><th>Statistic</th><th>p-Value</th><th>Method</th></tr></thead><tbody>`; const v = statsDataForCurrentKollektiv.comparisonASvsT2Applied; const fP = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? '<0.001' : formatNumber(p, 3, '--', true)) : '--'; const na = '--'; html += `<tr><td>Accuracy (McNemar)</td><td>${formatNumber(v?.mcnemar?.statistic, 3, na, true)} (df=${v?.mcnemar?.df || na})</td><td>${fP(v?.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(v?.mcnemar?.pValue)}</td><td>${v?.mcnemar?.method || na}</td></tr>`; html += `<tr><td>AUC (DeLong)</td><td>Z=${formatNumber(v?.delong?.Z, 3, na, true)}</td><td>${fP(v?.delong?.pValue)} ${getStatisticalSignificanceSymbol(v?.delong?.pValue)}</td><td>${v?.delong?.method || na}</td></tr>`; html += `</tbody></table>`; }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_CHART) { const chartKey = Object.keys(chartSVGs).find(k => k.startsWith('pres-comp-chart') || k.startsWith('stat-comp-bar')); if(chartSVGs[chartKey]) { html += `<div class="chart-container"><h3>Comparison of Selected Metrics (AS vs T2 - '${appliedCriteriaDisplayName}')</h3>${chartSVGs[chartKey]}</div>`; } }
            if (config.INCLUDE_ASSOCIATIONS_TABLE && statsDataForCurrentKollektiv?.associationsApplied && Object.keys(statsDataForCurrentKollektiv.associationsApplied).length > 0) { html += `<h2>Association with N-Status</h2><table><thead><tr><th>Feature</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi</th><th>p-Value</th><th>Test</th></tr></thead><tbody>`; const a = statsDataForCurrentKollektiv.associationsApplied; const na = '--'; const fP = (p) => (p !== null && !isNaN(p)) ? (p < 0.001 ? '<0.001' : formatNumber(p, 3, na, true)) : na; const fRowAssoc = (nm, obj) => { if (!obj) return ''; const orS = formatCI(obj.or?.value, obj.or?.ci?.lower, obj.or?.ci?.upper, 2, false, na); const rdV = formatNumber(obj.rd?.value !== null && !isNaN(obj.rd?.value) ? obj.rd.value * 100 : NaN, 1, na, true); const rdL = formatNumber(obj.rd?.ci?.lower !== null && !isNaN(obj.rd?.ci?.lower) ? obj.rd.ci.lower * 100 : NaN, 1, na, true); const rdU = formatNumber(obj.rd?.ci?.upper !== null && !isNaN(obj.rd?.ci?.upper) ? obj.rd.ci.upper * 100 : NaN, 1, na, true); const rdS = rdV !== na ? `${rdV}% (${rdL}% - ${rdU}%)` : na; const phiS = formatNumber(obj.phi?.value, 2, na, true); const pS = fP(obj.pValue) + ' ' + getStatisticalSignificanceSymbol(obj.pValue); const tN = obj.testName || na; return `<tr><td>${nm}</td><td>${orS}</td><td>${rdS}</td><td>${phiS}</td><td>${pS}</td><td>${tN}</td></tr>`; }; html += fRowAssoc('AS Positive', a?.as); if (a?.size_mwu) html += `<tr><td>${a.size_mwu.featureName || 'LN Size (Median Comp.)'}</td><td>${na}</td><td>${na}</td><td>${na}</td><td>${fP(a.size_mwu.pValue)} ${getStatisticalSignificanceSymbol(a.size_mwu.pValue)}</td><td>${a.size_mwu.testName || na}</td></tr>`; ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(k => { if (a && a[k]) { const isActive = criteria[k]?.active === true; html += fRowAssoc(a[k].featureName + (isActive ? '' : ' (inactive)'), a[k]); } }); html += `</tbody></table>`; }
            const currentKollektivBfResult = allBruteForceResults ? allBruteForceResults[kollektiv] : null;
            if (config.INCLUDE_BRUTEFORCE_BEST_RESULT && currentKollektivBfResult?.results && currentKollektivBfResult.results.length > 0 && currentKollektivBfResult.bestResult) { html += `<h2>Best Brute-Force Result (for Cohort: ${kollektivName})</h2><div class="meta-info"><ul>`; const best = currentKollektivBfResult.bestResult; html += `<li><strong>Optimized Metric:</strong> ${currentKollektivBfResult.metric}</li><li><strong>Best Value:</strong> ${formatNumber(best.metricValue, 4, '--', true)}</li><li><strong>Logic:</strong> ${best.logic?.toUpperCase()}</li><li><strong>Criteria:</strong> ${formatCriteriaFunc(best.criteria, best.logic)}</li></ul><p class="small text-muted">Cohort N=${formatNumber(currentKollektivBfResult.nTotal, 0, 'N/A')} (N+: ${formatNumber(currentKollektivBfResult.nPlus, 0, 'N/A')}, N-: ${formatNumber(currentKollektivBfResult.nMinus, 0, 'N/A')})</p></div>`; }
            html += `<div class="report-footer">${config.REPORT_AUTHOR} - ${timestamp}</div></body></html>`; return html;
        } catch (error) {
             console.error("Error in generateComprehensiveReportHTML:", error);
             return '<html><head><title>Error</title></head><body>Error creating report.</body></html>';
        }
    }

    async function exportSingleChart(chartElementId, format, kollektiv, options = {}) {
         const svgElement = document.getElementById(chartElementId)?.querySelector('svg'); if (!svgElement) { uiManager.showToast(`Chart '${chartElementId}' not found for export.`, 'danger'); return; }
         const chartName = options.chartName || chartElementId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
         try {
             let blob = null, filenameKey, mimeType, ext;
             if (format === 'png') { uiManager.showToast(`Generating PNG for Chart ${chartName}...`, 'info', 1500); blob = await convertSvgToPngBlob(svgElement); filenameKey = 'CHART_SINGLE_PNG'; mimeType = 'image/png'; ext = 'png'; }
             else if (format === 'svg') { uiManager.showToast(`Generating SVG for Chart ${chartName}...`, 'info', 1500); blob = await convertSvgToSvgBlob(svgElement); filenameKey = 'CHART_SINGLE_SVG'; mimeType = 'image/svg+xml;charset=utf-8'; ext = 'svg'; }
             else { throw new Error(`Invalid export format: ${format}`); }
             if (blob) {
                const filename = generateFilename(filenameKey, kollektiv, ext, { chartName, ...options });
                if (downloadFile(blob, filename, mimeType)) uiManager.showToast(`Chart ${chartName} exported as ${format.toUpperCase()}.`, 'success');
             } else {
                 throw new Error("Blob generation failed.");
             }
         } catch (error) { console.error(`Error during chart export (${chartName}, ${format}):`, error); uiManager.showToast(`Error during chart export (${format.toUpperCase()}).`, 'danger'); }
    }

     async function exportTablePNG(tableElementId, kollektiv, typeKey, tableName = 'Tabelle') {
         uiManager.showToast(`Generating PNG for table ${tableName}...`, 'info', 1500);
         try {
             const tableElement = document.getElementById(tableElementId); const baseWidth = tableElement?.offsetWidth || 800;
             const blob = await convertTableToPngBlob(tableElementId, baseWidth);
             if (blob) {
                const filename = generateFilename(typeKey, kollektiv, 'png', {tableName: tableName, tableId: tableElementId});
                if(downloadFile(blob, filename, 'image/png')) uiManager.showToast(`Table '${tableName}' exported as PNG.`, 'success');
             } else {
                throw new Error("Table blob generation failed.");
             }
         } catch(error) { console.error(`Error during table PNG export for '${tableName}':`, error); uiManager.showToast(`Error during table PNG export for '${tableName}'.`, 'danger'); }
     }

    async function exportChartsZip(scopeSelector, zipTypeKey, kollektiv, format) {
         uiManager.showToast(`Starting ${format.toUpperCase()} export for visible charts & tables...`, 'info', 2000);
         if (!window.JSZip) { uiManager.showToast("JSZip library not loaded.", "danger"); return; }
         const zip = new JSZip(); const promises = []; let successCount = 0;
         const chartContainers = document.querySelectorAll(scopeSelector + ' [id^="chart-"][style*="height"] svg');
         const tableSelectors = [ scopeSelector + ' table[id^="table-"]', scopeSelector + ' table[id^="analysis-table"]', scopeSelector + ' table[id^="data-table"]', scopeSelector + ' table[id^="bruteforce-results-table"]', scopeSelector + ' table[id^="pres-as-vs-t2-comp-table"]' ];
         const tableContainers = (format === 'png' && APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT) ? document.querySelectorAll(tableSelectors.join(', ')) : [];

         if (chartContainers.length === 0 && tableContainers.length === 0) { uiManager.showToast('No charts or tables found in current view.', 'warning'); return; }

         chartContainers.forEach((svgElement, index) => {
             const chartId = svgElement.closest('[id^="chart-"]')?.id || `chart_${index + 1}`;
             const chartName = chartId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
             let filenameKey, conversionPromise, ext;
             if (format === 'png') { filenameKey = 'CHART_SINGLE_PNG'; ext = 'png'; conversionPromise = convertSvgToPngBlob(svgElement).catch(e => { console.error(`PNG conversion for ${chartName} failed:`, e); return null; }); }
             else if (format === 'svg') { filenameKey = 'CHART_SINGLE_SVG'; ext = 'svg'; conversionPromise = convertSvgToSvgBlob(svgElement).catch(e => { console.error(`SVG conversion for ${chartName} failed:`, e); return null; }); }
             else { return; }
             const filename = generateFilename(filenameKey, kollektiv, ext, { chartName });
             promises.push(conversionPromise.then(blob => (blob ? { blob, filename } : { error: new Error("Blob is null for chart"), filename })));
         });

         tableContainers.forEach((table, index) => {
              if (format !== 'png') return;
              const tableId = table.id || `exportable-table-${generateUUID()}`; table.id = tableId;
              let tableName = table.closest('.card')?.querySelector('.card-header')?.firstChild?.textContent?.trim() || table.caption?.textContent.trim() || table.id;
              tableName = tableName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
              const typeKey = 'TABLE_PNG_EXPORT';
              const filename = generateFilename(typeKey, kollektiv, 'png', {tableName: tableName, tableId});
              const baseWidth = table.offsetWidth || 800;
              promises.push(convertTableToPngBlob(tableId, baseWidth).catch(e => { console.error(`Table PNG conversion for ${tableName} failed:`, e); return null; }).then(blob => (blob ? { blob, filename } : { error: new Error("Table Blob is null"), filename })));
         });

         try {
             const results = await Promise.all(promises);
             results.forEach(result => { if (result && result.blob) { zip.file(result.filename, result.blob); successCount++; } else if (result && result.error) { console.error(`Error during conversion for ${result.filename}:`, result.error); } });
             if (successCount > 0) {
                 const zipFilename = generateFilename(zipTypeKey, kollektiv, 'zip'); const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                 if (downloadFile(content, zipFilename, "application/zip")) uiManager.showToast(`${successCount} object(s) successfully exported as ${format.toUpperCase()} (ZIP).`, 'success');
             } else { uiManager.showToast(`Export (${format.toUpperCase()}) failed: No objects could be converted.`, 'danger'); }
         } catch (error) { console.error(`Error creating ${format.toUpperCase()} ZIP:`, error); uiManager.showToast(`Error creating ${format.toUpperCase()} ZIP.`, 'danger'); }
     }

     async function exportCategoryZip(category, data, bfResults, kollektiv, criteria, logic) {
         uiManager.showToast(`Generating ${category.toUpperCase()} ZIP package...`, 'info', 2000);
          if (!window.JSZip) { uiManager.showToast("JSZip library not loaded.", "danger"); return; }
         const zip = new JSZip(); let filesAdded = 0; let statsDataForAllKollektive = null;
         const lang = state.getCurrentPublikationLang();

         const needsStats = ['all-zip', 'csv-zip', 'md-zip', 'html'].includes(category);
         if(needsStats && data && data.length > 0 && criteria && logic) {
             try {
                statsDataForAllKollektive = statisticsService.calculateAllPublicationStats(data, criteria, logic, bfResults);
             } catch(e) { uiManager.showToast(`Error during statistics calculation for ${category.toUpperCase()} ZIP.`, 'danger'); return; }
             if (!statsDataForAllKollektive || !statsDataForAllKollektive[kollektiv]) {
                 if (category === 'csv-zip' || category === 'html') return;
             }
         }
         const currentKollektivStats = statsDataForAllKollektive ? statsDataForAllKollektive[kollektiv] : null;
         const currentKollektivBfResult = bfResults ? bfResults[kollektiv] : null;

         const addFile = (filename, content) => { if (content !== null && content !== undefined && String(content).length > 0) { zip.file(filename, content); filesAdded++; return true; } return false; };
         try {
             if (['all-zip', 'csv-zip'].includes(category)) {
                 if (currentKollektivStats) addFile(generateFilename('STATS_CSV', kollektiv, 'csv'), generateStatistikCSVString(currentKollektivStats, kollektiv, criteria, logic));
                 if (data && data.length > 0) addFile(generateFilename('FILTERED_DATA_CSV', kollektiv, 'csv'), generateFilteredDataCSVString(dataProcessor.filterDataByCohort(data, kollektiv)));
             }
             if (['all-zip', 'md-zip'].includes(category)) {
                 if (currentKollektivStats?.descriptive) addFile(generateFilename('DESKRIPTIV_MD', kollektiv, 'md'), generateMarkdownTableString(currentKollektivStats.descriptive, 'deskriptiv', kollektiv));
                 if (data && data.length > 0) addFile(generateFilename('DATEN_MD', kollektiv, 'md'), generateMarkdownTableString(dataProcessor.filterDataByCohort(data, kollektiv), 'daten', kollektiv));
                 if (data && data.length > 0) addFile(generateFilename('AUSWERTUNG_MD', kollektiv, 'md'), generateMarkdownTableString(t2CriteriaManager.evaluateDataset(dataProcessor.filterDataByCohort(data, kollektiv), criteria, logic), 'auswertung', kollektiv, criteria, logic));

                 if (statsDataForAllKollektive && state) {
                     const commonDataForPub = { appName: APP_CONFIG.APP_NAME, appVersion: APP_CONFIG.APP_VERSION, bruteForceMetricForPublication: state.getPublicationBruteForceMetric() };
                     PUBLICATION_CONFIG.sections.forEach(mainSection => {
                         mainSection.subSections.forEach(subSection => {
                            const mdContent = publicationTab.getSectionContentForExport(subSection.id, lang, statsDataForAllKollektive, commonDataForPub);
                            const typeKey = `PUBLICATION_${mainSection.id.toUpperCase()}_MD`;
                            const sectionName = subSection.label.replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                            addFile(generateFilename(typeKey, kollektiv, 'md', {sectionName: sectionName}), generateMarkdownTableString(mdContent, `publication_${mainSection.id}`, kollektiv, null, null, {subSectionLabel: subSection.label}));
                         });
                     });
                 }
             }
             if (['all-zip'].includes(category) && currentKollektivBfResult) { addFile(generateFilename('BRUTEFORCE_TXT', kollektiv, 'txt'), generateBruteForceTXTString(currentKollektivBfResult)); }
             if (['all-zip', 'html'].includes(category) && data && data.length > 0 ) { addFile(generateFilename('COMPREHENSIVE_REPORT_HTML', kollektiv, 'html'), generateComprehensiveReportHTML(data, bfResults, kollektiv, criteria, logic)); }
             if (['png-zip'].includes(category)) { await exportChartsZip('#app-container', 'PNG_ZIP', kollektiv, 'png'); return; }
             if (['svg-zip'].includes(category)) { await exportChartsZip('#app-container', 'SVG_ZIP', kollektiv, 'svg'); return; }

            if (filesAdded > 0) {
                const zipFilename = generateFilename(`${category.toUpperCase()}_PAKET`, kollektiv, 'zip');
                const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                if (downloadFile(content, zipFilename, "application/zip")) uiManager.showToast(`${filesAdded} file(s) successfully exported in ${category.toUpperCase()} ZIP package.`, 'success');
            } else { uiManager.showToast(`No files found or generated for the ${category.toUpperCase()} ZIP package.`, 'warning'); }
         } catch (error) { console.error(`Error creating ${category.toUpperCase()} ZIP package:`, error); uiManager.showToast(`Error creating ${category.toUpperCase()} ZIP package.`, 'danger'); }
     }

     function exportPraesentationData(actionId, presentationData, kollektiv) {
            let content = null, filenameKey = null, extension = null, mimeType = null, options = {}, success = false; const na = '--';
            if (!presentationData) { uiManager.showToast("No data available for presentation export.", "warning"); return; }
            const { performanceAS, performanceT2, comparison, comparisonCriteriaSet, cohortForComparison, patientCountForComparison, t2ShortName } = presentationData || {};
            const isAsPurView = actionId.includes('-as-pur-');
            const isAsVsT2View = actionId.includes('-as-vs-t2-');
            options.studyId = comparisonCriteriaSet?.id || null;
            if (presentationData.t2ShortName) options.t2CriteriaLabelShort = presentationData.t2ShortName;
            if (comparisonCriteriaSet?.description) options.t2CriteriaLabelFull = studyT2CriteriaManager.formatCriteriaForDisplay(comparisonCriteriaSet.criteria, comparisonCriteriaSet.logic);

            try {
                if (isAsPurView && actionId === 'download-performance-as-pur-csv') {
                     const allStatsData = { statsGesamt: presentationData.statsGesamt, statsDirektOP: presentationData.statsDirektOP, statsNRCT: presentationData.statsNRCT }; const headers = ['Cohort', 'N', 'Sens', 'Sens CI Low', 'Sens CI High', 'Spec', 'Spec CI Low', 'Spec CI High', 'PPV', 'PPV CI Low', 'PPV CI High', 'NPV', 'NPV CI Low', 'NPV CI High', 'Acc', 'Acc CI Low', 'Acc CI High', 'BalAcc', 'BalAcc CI Low', 'BalAcc CI High', 'F1', 'F1 CI Low', 'F1 CI High', 'AUC', 'AUC CI Low', 'AUC CI High', 'CI Method']; const fVal = (v, d=1, useStd = false) => formatNumber(v, d, na, useStd);
                     const rows = Object.entries(allStatsData).map(([key, stats]) => { let k = key.replace('stats',''); let dN = (k === 'DirektOP') ? 'direkt OP' : (k === 'NRCT') ? 'nRCT' : k; if (!stats || typeof stats.matrix !== 'object') return [getCohortDisplayName(dN), 0, ...Array(21).fill(na), na]; const n = stats.matrix ? (stats.matrix.tp + stats.matrix.fp + stats.matrix.fn + stats.matrix.tn) : 0; const fRowData = (m, metric_k) => { const dig = (metric_k === 'auc') ? 2 : ((metric_k === 'f1') ? 3 : 1); return [fVal(m?.value, dig, true), fVal(m?.ci?.lower, dig, true), fVal(m?.ci?.upper, dig, true)]; }; return [ getCohortDisplayName(dN), n, ...fRowData(stats.sens, 'sens'), ...fRowData(stats.spec, 'spec'), ...fRowData(stats.ppv, 'ppv'), ...fRowData(stats.npv, 'npv'), ...fRowData(stats.acc, 'acc'), ...fRowData(stats.balAcc, 'balAcc'), ...fRowData(stats.f1, 'f1'), ...fRowData(stats.auc, 'auc'), stats.sens?.method || na ]; });
                     content = Papa.unparse([headers, ...rows], { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'PRAES_AS_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
                } else if (isAsPurView && actionId === 'download-performance-as-pur-md') { options.kollektiv = kollektiv; content = generateMarkdownTableString(presentationData, 'praes_as_perf', kollektiv, null, null, options); filenameKey = 'PRAES_AS_PERF_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-performance-as-vs-t2-csv') { if (!performanceAS || !performanceT2) { uiManager.showToast("Comparison data for CSV missing.", "warning"); return; } const headers = ['Metric', 'AS (Value)', 'AS (95% CI)', 'T2 (Value)', 'T2 (95% CI)', 'CI Method AS', 'CI Method T2']; const fRow = (mKey, nm, isP = true, d = 1) => { const mAS = performanceAS[mKey]; const mT2 = performanceT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? 2 : d; const ciAS = `(${formatNumber(mAS?.ci?.lower, dig, na, true)} - ${formatNumber(mAS?.ci?.upper, dig, na, true)})`; const ciT2 = `(${formatNumber(mT2?.ci?.lower, dig, na, true)} - ${formatNumber(mT2?.ci?.upper, dig, na, true)})`; const valAS = formatNumber(mAS?.value, dig, na, true); const valT2 = formatNumber(mT2?.value, dig, na, true); return [nm, valAS, ciAS, valT2, ciT2, mAS?.method || na, mT2?.method || na]; }; const rows = [ fRow('sens', 'Sensitivity'), fRow('spec', 'Specificity'), fRow('ppv', 'PPV'), fRow('npv', 'NPV'), fRow('acc', 'Accuracy'), fRow('balAcc', 'Balanced Accuracy'), fRow('f1', 'F1-Score', false, 3), fRow('auc', 'AUC', false, 2) ]; content = Papa.unparse([headers, ...rows], { delimiter: APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'PRAES_AS_VS_T2_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-comp-table-as-vs-t2-md') { content = generateMarkdownTableString(presentationData, 'praes_as_vs_t2_comp', kollektiv, null, null, options); filenameKey = 'PRAES_AS_VS_T2_COMP_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                } else if (isAsVsT2View && actionId === 'download-tests-as-vs-t2-md') { content = generateMarkdownTableString(presentationData, 'praes_as_vs_t2_tests', kollektiv, null, null, options); filenameKey = 'PRAES_AS_VS_T2_TESTS_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
                }
            } catch(error) {
                console.error(`Error during presentation export ${actionId}:`, error);
                uiManager.showToast(`Error during presentation export (${actionId}).`, "danger");
                return;
            }

            if(content !== null && filenameKey && extension && mimeType) { const filename = generateFilename(filenameKey, kollektiv, extension, options); if(downloadFile(content, filename, mimeType)) uiManager.showToast(`Presentation data (${extension}) exported: ${filename}`, 'success'); }
            else if(!actionId.includes('-chart-') && !actionId.startsWith('dl-') ) { uiManager.showToast("Export for this option is not available or data is missing/error during generation.", "warning"); }
      }

    return Object.freeze({
        exportStatistikCSV,
        exportBruteForceReport,
        exportTableMarkdown,
        exportFilteredDataCSV,
        exportComprehensiveReportHTML,
        exportSingleChart,
        exportTablePNG,
        exportChartsZip,
        exportCategoryZip,
        exportPraesentationData,
        generateFilename
    });

})();
