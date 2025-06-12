const exportTab = (() => {

    const createExportButton = (config) => {
        if (!config || !config.id) return '';
        const tooltipConfigKey = config.tooltipKey || config.id.replace(/-/g, '');
        const tooltipConfig = APP_CONFIG.UI_TEXTS.tooltips.exportTab[tooltipConfigKey];
        
        if (!tooltipConfig) {
            return '';
        }

        const description = tooltipConfig.description || 'No description available.';
        const type = tooltipConfig.type || 'UNKNOWN';
        const ext = tooltipConfig.ext || 'EXT';

        return `
            <div class="col-md-6 mb-3">
                <div class="d-flex align-items-center">
                    <button id="export-${config.id}" class="btn btn-primary btn-sm me-3" data-export-type="${config.id}" data-tippy-key="exportTab.${tooltipConfigKey}">
                        <i class="fas ${config.icon} fa-fw me-2"></i>${config.label}
                    </button>
                    <div>
                        <p class="mb-0 fw-bold">${type} (.${ext})</p>
                        <p class="mb-0 small text-muted">${description}</p>
                    </div>
                </div>
            </div>`;
    };

    function render(currentCohort) {
        const cohortDisplayName = getCohortDisplayName(currentCohort);
        const descriptionTextTemplate = APP_CONFIG.UI_TEXTS.tooltips.exportTab.description;
        const finalDescriptionText = descriptionTextTemplate.replace('[COHORT]', `<strong>${cohortDisplayName}</strong>`);

        const singleExports = [
            { id: 'stats-csv', label: 'Statistics', icon: 'fa-chart-pie', tooltipKey: 'statscsv' },
            { id: 'bruteforce-txt', label: 'Brute-Force Report', icon: 'fa-cogs', tooltipKey: 'bruteforcetxt' },
            { id: 'datatable-md', label: 'Data List', icon: 'fa-database', tooltipKey: 'datamd' },
            { id: 'analysistable-md', label: 'Analysis Table', icon: 'fa-tasks', tooltipKey: 'analysismd' },
            { id: 'filtered-data-csv', label: 'Filtered Raw Data', icon: 'fa-filter', tooltipKey: 'filtereddatacsv' },
            { id: 'comprehensive-report-html', label: 'Comprehensive HTML Report', icon: 'fa-file-invoice', tooltipKey: 'comprehensivereport_html' }
        ];

        const packageExports = [
            { id: 'all-zip', label: 'All Files Package', icon: 'fa-file-archive', tooltipKey: 'allzip' },
            { id: 'csv-zip', label: 'CSV Files Package', icon: 'fa-file-csv', tooltipKey: 'csvzip' },
            { id: 'md-zip', label: 'Markdown Files Package', icon: 'fa-file-alt', tooltipKey: 'mdzip' },
            { id: 'png-zip', label: 'PNG Graphics Package', icon: 'fa-images', tooltipKey: 'pngzip' },
            { id: 'svg-zip', label: 'SVG Graphics Package', icon: 'fa-vector-square', tooltipKey: 'svgzip' }
        ];

        const singleExportsHTML = singleExports.map(createExportButton).join('');
        const packageExportsHTML = packageExports.map(createExportButton).join('');

        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="alert alert-info small" role="alert">
                            <i class="fas fa-info-circle me-2"></i>
                            ${finalDescriptionText}
                        </div>
                    </div>
                </div>

                <h3 class="mt-4 mb-3">Single Exports</h3>
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            ${singleExportsHTML}
                        </div>
                    </div>
                </div>

                <h3 class="mt-5 mb-3">Export Packages (.zip)</h3>
                <div class="card">
                    <div class="card-body">
                         <div class="row">
                            ${packageExportsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    return {
        render
    };

})();
