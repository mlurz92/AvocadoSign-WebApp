const exportTab = (() => {

    function generateFilename(typeKey, cohort, extension, options = {}) {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeCohort = getCohortDisplayName(cohort).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filenameType = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey] || typeKey || 'Export';

        if (options.chartName) filenameType = filenameType.replace('{ChartName}', options.chartName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        if (options.tableName) filenameType = filenameType.replace('{TableName}', options.tableName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        else if (typeKey === 'TABLE_PNG_EXPORT' && options.tableId) filenameType = filenameType.replace('{TableName}', options.tableId.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        
        if (options.studyId) filenameType = filenameType.replace('{StudyID}', String(options.studyId).replace(/[^a-z0-9_-]/gi, '_'));
        else filenameType = filenameType.replace('_{StudyID}', '').replace('{StudyID}', '');
        
        if (options.sectionName) filenameType = filenameType.replace('{SectionName}', String(options.sectionName).replace(/[^a-z0-9_-]/gi, '_').substring(0,20));
        else filenameType = filenameType.replace('_{SectionName}', '').replace('{SectionName}', '');
        
        return APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', filenameType)
            .replace('{KOLLEKTIV}', safeCohort)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension);
    }

    function downloadFile(content, filename, mimeType) {
        if (content === null || content === undefined) {
            uiManager.showToast(`Export failed: No data generated for ${filename}.`, 'warning');
            return false;
        }
        const blob = content instanceof Blob ? content : new Blob([String(content)], { type: mimeType });
        if (blob.size === 0) {
            uiManager.showToast(`Export failed: Empty file generated for ${filename}.`, 'warning');
            return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 150);
        return true;
    }
    
    function render(currentCohort) {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeCohort = getCohortDisplayName(currentCohort).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        const fileNameTemplate = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;

        const generateButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false) => {
            const config = UI_TEXTS.tooltips.exportTab[tooltipKey];
            if (!config) return '';
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type] || '';
            const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeCohort).replace('{DATE}', dateStr).replace('{EXT}', config.ext);
            const tooltipHtml = `data-tippy-content="${config.description}<br><small>File: ${filename}</small>"`;
            return `<button class="btn btn-outline-primary w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabled ? 'disabled' : ''}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${config.ext})</span></button>`;
        };

        const generateZipButtonHTML = (idSuffix, iconClass, text, tooltipKey, disabled = false) => {
            const config = UI_TEXTS.tooltips.exportTab[tooltipKey];
            if (!config) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type] || '';
            const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeCohort).replace('{DATE}', dateStr).replace('{EXT}', config.ext);
            const tooltipHtml = `data-tippy-content="${config.description}<br><small>File: ${filename}</small>"`;
            const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabled ? 'disabled' : ''}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${config.ext})</span></button>`;
        };

        const exportDesc = UI_TEXTS.tooltips.exportTab.description.replace('[COHORT]', `<strong>${getCohortDisplayName(currentCohort)}</strong>`);
        return `
            <div class="row export-options-container">
                <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${UI_TEXTS.tooltips.exportTab.singleExports}</div>
                        <div class="card-body">
                            <p class="small text-muted mb-3">${exportDesc}</p>
                            <h6 class="text-muted small text-uppercase mb-2">Reports & Statistics</h6>
                            ${generateButtonHTML('stats-csv', 'fas fa-file-csv', 'Statistics Results', 'statsCSV')}
                            ${generateButtonHTML('bruteforce-txt', 'fas fa-file-alt', 'Brute-Force Report', 'bruteForceTXT', true)}
                            ${generateButtonHTML('comprehensive-report-html', 'fas fa-file-invoice', 'Comprehensive Report', 'comprehensiveReportHTML')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">Tables & Raw Data</h6>
                             ${generateButtonHTML('datatable-md', 'fab fa-markdown', 'Data List', 'datenMD')}
                             ${generateButtonHTML('analysistable-md', 'fab fa-markdown', 'Analysis Table', 'auswertungMD')}
                             ${generateButtonHTML('filtered-data-csv', 'fas fa-database', 'Filtered Raw Data', 'filteredDataCSV')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">Charts & Tables (as Images)</h6>
                             ${generateButtonHTML('charts-png-zip', 'fas fa-images', 'Charts & Tables (PNG)', 'pngZIP')}
                             ${generateButtonHTML('charts-svg-zip', 'fas fa-file-code', 'Charts (SVG)', 'svgZIP')}
                        </div>
                    </div>
                </div>
                 <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${UI_TEXTS.tooltips.exportTab.exportPackages}</div>
                        <div class="card-body">
                             <p class="small text-muted mb-3">Bundles multiple thematically related export files into a single ZIP archive for the <strong>${getCohortDisplayName(currentCohort)}</strong> cohort.</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', 'Complete Package (All Files)', 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', 'CSVs Only', 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'Markdown Only', 'mdZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">Export Notes</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> <li class="mb-2"><i class="fas fa-info-circle fa-fw me-1 text-primary"></i>All exports are based on the currently selected cohort and the last **applied** T2 criteria.</li> <li class="mb-2"><i class="fas fa-table fa-fw me-1 text-primary"></i>**CSV:** For statistics software; separator: semicolon (;).</li> <li class="mb-2"><i class="fab fa-markdown fa-fw me-1 text-primary"></i>**MD:** For documentation.</li> <li class="mb-2"><i class="fas fa-file-alt fa-fw me-1 text-primary"></i>**TXT:** Brute-force report.</li> <li class="mb-2"><i class="fas fa-file-invoice fa-fw me-1 text-primary"></i>**HTML Report:** Comprehensive and printable.</li> <li class="mb-2"><i class="fas fa-images fa-fw me-1 text-primary"></i>**PNG:** Pixel-based (for charts/tables).</li> <li class="mb-2"><i class="fas fa-file-code fa-fw me-1 text-primary"></i>**SVG:** Vector-based (for charts), scalable.</li> <li class="mb-0"><i class="fas fa-exclamation-triangle fa-fw me-1 text-warning"></i>ZIP exports for charts/tables only capture elements currently visible/rendered in the Statistics or Analysis tabs. Single downloads are available directly on the elements.</li> </ul> </div> </div>
                </div>
            </div>
        `;
    }

    return {
        render,
        generateFilename,
        downloadFile
    };
})();
