const uiManager = (() => {

    let tippyInstances = [];
    let collapseEventListenersAttached = new Set();
    let quickGuideModalInstance = null;

    function escapeHTML(text) {
        if (typeof text !== 'string') return text === null ? '' : String(text);
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, match => map[match]);
    }

    function showToast(message, type = 'info', duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        if (!message) return;
        if (typeof bootstrap === 'undefined' || !bootstrap.Toast) return;

        const toastId = `toast-${generateUUID()}`;
        let bgClass = 'bg-secondary', iconClass = 'fa-info-circle', textClass = 'text-white';
        switch (type) {
            case 'success': bgClass = 'bg-success'; iconClass = 'fa-check-circle'; break;
            case 'warning': bgClass = 'bg-warning'; iconClass = 'fa-exclamation-triangle'; textClass = 'text-dark'; break;
            case 'danger': bgClass = 'bg-danger'; iconClass = 'fa-exclamation-circle'; break;
            case 'info':
            default: bgClass = 'bg-info'; iconClass = 'fa-info-circle'; textClass = 'text-dark'; break;
        }

        const toastElement = document.createElement('div');
        toastElement.id = toastId;
        toastElement.className = `toast align-items-center ${textClass} ${bgClass} border-0 fade`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${iconClass} fa-fw me-2"></i> ${escapeHTML(message)}</div><button type="button" class="btn-close me-2 m-auto ${textClass === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
        toastContainer.appendChild(toastElement);

        try {
            const toastInstance = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
            toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove(), { once: true });
            toastInstance.show();
        } catch (e) {
            toastElement.remove();
        }
    }

    function initializeTooltips(scope = document.body) {
        if (!window.tippy || typeof scope?.querySelectorAll !== 'function') return;
        const elementsInScope = Array.from(scope.matches('[data-tippy-content]') ? [scope] : scope.querySelectorAll('[data-tippy-content]'));
        const newInstances = tippy(elementsInScope, {
            allowHTML: true, theme: 'glass', placement: 'top', animation: 'fade',
            interactive: false, appendTo: () => document.body, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
            maxWidth: 400, duration: [150, 150], zIndex: 3050,
            onCreate(instance) { if (!instance.props.content || String(instance.props.content).trim() === '') { instance.disable(); } },
            onShow(instance) { const content = instance.reference.getAttribute('data-tippy-content'); return !!content && String(content).trim() !== ''; }
        });
        if (Array.isArray(newInstances)) tippyInstances = tippyInstances.concat(newInstances);
        else if (newInstances) tippyInstances.push(newInstances);
    }

    function updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = text ?? '';
    }

    function updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = html ?? '';
    }

    function toggleElementClass(elementId, className, add) {
        const element = document.getElementById(elementId);
        if (element && className) element.classList.toggle(className, add);
    }

    function setElementDisabled(elementId, isDisabled) {
        const element = document.getElementById(elementId);
        if (element) element.disabled = !!isDisabled;
    }
    
    function highlightElement(elementId, highlightClass = 'element-flash-highlight', duration = 1500) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(highlightClass);
            void element.offsetWidth;
            element.classList.add(highlightClass);
            setTimeout(() => element.classList.remove(highlightClass), duration);
        }
    }

    function attachRowCollapseListeners(tableBodyId) {
        if (!tableBodyId || collapseEventListenersAttached.has(tableBodyId)) return;
        const tableBodyElement = document.getElementById(tableBodyId);
        if (!tableBodyElement) return;
        const handleCollapseEvent = (event) => {
            const triggerRow = event.target.closest('tr.sub-row')?.previousElementSibling;
            if (!triggerRow) return;
            const icon = triggerRow.querySelector('.row-toggle-icon');
            if (icon) {
                const isShowing = event.type.startsWith('show');
                icon.classList.toggle('fa-chevron-up', isShowing);
                icon.classList.toggle('fa-chevron-down', !isShowing);
            }
        };
        tableBodyElement.addEventListener('show.bs.collapse', handleCollapseEvent);
        tableBodyElement.addEventListener('hide.bs.collapse', handleCollapseEvent);
        collapseEventListenersAttached.add(tableBodyId);
    }

    function renderTabContent(tabId, renderFunction) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) return;
        updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');
        try {
            const contentHTML = renderFunction();
            updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">No content generated.</p>');
            initializeTooltips(container);
        } catch (error) {
            const errorMessage = `<div class="alert alert-danger m-3">Error loading tab: ${error.message}</div>`;
            updateElementHTML(containerId, errorMessage);
            showToast(`Error loading tab '${tabId}'.`, 'danger');
        }
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

    function showQuickGuide() {
        let modalElement = document.getElementById('quick-guide-modal');
        if (!modalElement) {
            const modalHTML = `
                <div class="modal fade" id="quick-guide-modal" tabindex="-1" aria-labelledby="quickGuideModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content modal-glass">
                      <div class="modal-header">
                        <h5 class="modal-title" id="quickGuideModalLabel">${UI_TEXTS.tooltips.quickGuideButton.title || "Quick Guide & Notes"}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">${UI_TEXTS.tooltips.quickGuideButton.content || "<p>Loading guide...</p>"}</div>
                      <div class="modal-footer"><button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button></div>
                    </div>
                  </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modalElement = document.getElementById('quick-guide-modal');
            quickGuideModalInstance = new bootstrap.Modal(modalElement);
        }
        if (quickGuideModalInstance) quickGuideModalInstance.show();
    }

    return Object.freeze({
        escapeHTML,
        showToast,
        initializeTooltips,
        updateElementText,
        updateElementHTML,
        toggleElementClass,
        setElementDisabled,
        highlightElement,
        attachRowCollapseListeners,
        renderTabContent,
        getT2IconSVG,
        showQuickGuide
    });
})();
