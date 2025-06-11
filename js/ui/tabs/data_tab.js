const dataTab = (() => {

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Last Name' },
        { key: 'firstName', label: 'First Name' },
        { key: 'sex', label: 'Sex' },
        { key: 'age', label: 'Age' },
        { key: 'therapy', label: 'Therapy' },
        { key: 'status', label: 'N/AS/T2', subKeys: [{key: 'nStatus', label: 'N'}, {key: 'asStatus', label: 'AS'}, {key: 't2Status', label: 'T2'}] },
        { key: 'notes', label: 'Notes' },
        { key: 'details', label: '', width: '30px'}
    ];

    function createTableHeaderHTML(tableId, sortState) {
        let headerHTML = `<thead class="small sticky-top bg-light" id="${tableId}-header"><tr>`;
        columns.forEach(col => {
            let sortIconHTML = '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>';
            let thStyle = col.width ? `style="width: ${col.width};"` : '';
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
            
            let tooltipContent = `Sort by ${col.label}`;
            if (col.key === 'status') {
                tooltipContent = 'N: Histopathology | AS: Avocado Sign | T2: Applied T2 Criteria. Click a sub-header to sort.';
            } else if (col.key === 'therapy') {
                tooltipContent = 'Therapy received: Surgery alone or Neoadjuvant chemoradiotherapy (nRCT).';
            } else if (col.key === 'details') {
                tooltipContent = 'Toggle lymph node details';
            }

            const subHeaders = col.subKeys ? col.subKeys.map(sk => {
                const isActiveSubSort = activeSubKey === sk.key;
                const style = isActiveSubSort ? 'font-weight: bold; text-decoration: underline; color: var(--primary-color);' : '';
                return `<span class="sortable-sub-header" data-sub-key="${sk.key}" style="cursor: pointer; ${style}" data-tippy-content="Sort by Status ${sk.label}">${sk.label}</span>`;
            }).join(' / ') : '';
            
            const sortAttributes = `data-sort-key="${col.key}" ${col.subKeys || col.key === 'details' ? '' : 'style="cursor: pointer;"'}`;
            
            if (col.subKeys) {
                 headerHTML += `<th scope="col" ${sortAttributes} data-tippy-content="${tooltipContent}" ${thStyle}>${col.label} (${subHeaders}) ${isMainKeyActiveSort ? sortIconHTML : '<i class="fas fa-sort text-muted opacity-50 ms-1"></i>'}</th>`;
            } else {
                 headerHTML += `<th scope="col" ${sortAttributes} data-tippy-content="${tooltipContent}" ${thStyle}>${col.label} ${col.key === 'details' ? '' : sortIconHTML}</th>`;
            }
        });
        headerHTML += `</tr></thead>`;
        return headerHTML;
    }

    function createDataTableHTML(data, sortState) {
        if (!Array.isArray(data)) return '<p class="text-danger">Error: Invalid data for table.</p>';
        const tableId = 'data-table';
        let tableHTML = `<table class="table table-sm table-hover table-striped data-table" id="${tableId}">`;
        tableHTML += createTableHeaderHTML(tableId, sortState);
        tableHTML += `<tbody id="${tableId}-body">`;
        if (data.length === 0) {
            tableHTML += `<tr><td colspan="${columns.length}" class="text-center text-muted">No data found in the selected cohort.</td></tr>`;
        } else {
            data.forEach(patient => {
                tableHTML += tableRenderer.createDataTableRow(patient);
            });
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function render(data, sortState) {
        if (!data) throw new Error("Data for data tab not available.");
        const expandAllTooltip = 'Expand/Collapse All Detail Views';
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
            if (tableBody && data.length > 0) uiManager.attachRowCollapseListeners(tableBody.id);
            if (tableHeader) uiManager.updateSortIcons(tableHeader.id, sortState);
            uiManager.initializeTooltips(document.getElementById('data-pane'));
        }, 0);

        return finalHTML;
    }

    return {
        render
    };
})();
