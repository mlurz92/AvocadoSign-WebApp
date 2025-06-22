window.dataTab = (() => {

    function createTableHeaderHTML(columns, sortState) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="data-table-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let thStyle = col.width ? `style="width: ${col.width};"` : '';
            if (col.textAlign) thStyle += ` text-align: ${col.textAlign};`;
            let isMainKeyActiveSort = false;
            let activeSubKey = null;

            if (sortState && sortState.key === col.key) {
                if (col.subKeys && col.subKeys.some(sk => sk.key === sortState.subKey)) {
                    isMainKeyActiveSort = true;
                    activeSubKey = sortState.subKey;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                } else if (!col.subKeys) {
                    isMainKeyActiveSort = true;
                    sortIconHTML = `<i class="fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1"></i>`;
                }
            }
            
            const baseTooltipContent = window.APP_CONFIG.UI_TEXTS.tooltips.dataTab[col.tooltipKey] || `Sort by ${col.label}`;
            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                const isActiveSubSort = activeSubKey === sk.key;
                const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="Sort by Status ${sk.label}">${sk.label}</span>`;
            }).join(' / ') : '';
            
            const mainTooltip = col.subKeys ? `${baseTooltipContent}` : `Sort by ${col.label}. ${baseTooltipContent}`;
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            
            if (col.subKeys) {
                 headerHTML += `<th scope="col" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${col.label} (${subHeaders}) ${isMainKeyActiveSort ? sortIconHTML : '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>'}</th>`;
            } else {
                 headerHTML += `<th scope="col" ${sortAttributes} data-tippy-content="${mainTooltip}" ${thStyle}>${col.label} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
            }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createDataTableHTML(data, sortState) {
        if (!Array.isArray(data)) return '<p class="text-danger">Error: Invalid data for table.</p>';
        const tableId = 'data-table';
        const columns = window.APP_CONFIG.TABLE_COLUMN_DEFINITIONS.DATA_TABLE_COLUMNS;
        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += createTableHeaderHTML(columns, sortState);
        tableHTML += `<tbody id="${tableId}-body">`;
        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">No data found in the selected cohort.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += window.tableRenderer.createDataTableRow(patient);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function render(data, sortState) {
        if (!data) throw new Error("Data for data tab not available.");
        const expandAllTooltip = window.APP_CONFIG.UI_TEXTS.tooltips.dataTab.expandAll || 'Expand All Details';
        const toggleButtonHTML = `
            <div class="d-flex justify-content-end mb-3" id="data-toggle-button-container">
                <button id="data-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${expandAllTooltip}">
                   Expand All Details <i class="fas fa-chevron-down ms-1"></i>
               </button>
            </div>`;
        const tableHTML = createDataTableHTML(data, sortState);
        const finalHTML = toggleButtonHTML + `<div class="table-responsive">${tableHTML}</div>`;
        
        setTimeout(() => {
            const tableBody = document.getElementById('data-table-body');
            const tableHeader = document.getElementById('data-table-header');
            if (tableBody && data.length > 0) window.uiManager.attachRowCollapseListeners(tableBody.id);
            if (tableHeader) window.uiManager.updateSortIcons(tableHeader.id, sortState);
        }, 0);

        return finalHTML;
    }

    return Object.freeze({
        render
    });
})();