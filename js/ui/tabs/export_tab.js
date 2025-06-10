const exportTab = (() => {

    const createExportButton = (config) => {
        if (!config || !config.id) return '';
        const tooltipConfigKey = config.id.replace(/-/g, '');
        const tooltipConfig = UI_TEXTS.tooltips.exportTab[tooltipConfigKey];
        
        if (!tooltipConfig) {
            console.warn(`Missing tooltip config for export button: ${config.id}`);
            return '';
        }

        const description = tooltipConfig.description || 'No description available.';
        const type = tooltipConfig.type || 'UNKNOWN';
        const ext = tooltipConfig.ext || 'EXT';

        return `
            <div class="col-md-6 mb-3">
                <div class="d-flex align-items-center">
                    <button id="export-${config.id}" class="btn btn-primary btn-sm me-3" data-export-type="${config.id}">
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
        const descriptionTextTemplate = UI_TEXTS.tooltips.exportTab.description;
        const finalDescriptionText = descriptionTextTemplate.replace('[COHORT]', `<strong>${cohortDisplayName}</strong>`);

        const singleExports = [
            { id: 'stats-csv', label: 'Statistics', icon: 'fa-chart-pie' },
            { id: 'bruteforce-txt', label: 'Brute-Force', icon: 'fa-cogs' },
            { id: 'datatable-md', label: 'Data List', icon: 'fa-database' },
            { id: 'analysistable-md', label: 'Analysis Table', icon: 'fa-tasks' },
            { id: 'filtered-data-csv', label: 'Filtered Raw Data', icon: 'fa-filter' },
            { id: 'comprehensive-report-html', label: 'HTML Report', icon: 'fa-file-invoice' }
        ];

        const packageExports = [
            { id: 'all-zip', label: 'All Single Files', icon: 'fa-file-archive' },
            { id: 'csv-zip', label: 'CSV Package', icon: 'fa-file-csv' },
            { id: 'md-zip', label: 'Markdown Package', icon: 'fa-file-alt' },
            { id: 'png-zip', label: 'PNG Graphics', icon: 'fa-images' },
            { id: 'svg-zip', label: 'SVG Graphics', icon: 'fa-vector-square' }
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
