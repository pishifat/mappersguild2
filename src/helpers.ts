import Modal from 'bootstrap/js/dist/modal';
import Tooltip from 'bootstrap/js/dist/tooltip';

function getModal (id: string): Modal | undefined {
    const el = document.getElementById(id);
    if (!el) return;

    let modal = Modal.getInstance(el);

    if (!modal) {
        modal = new Modal(el);
    }

    return modal;
}

export function hideModal (id: string) {
    const modal = getModal(id);

    if (modal) modal.hide();
}

export function showModal (id: string) {
    const modal = getModal(id);

    if (modal) modal.show();
}

export function enableTooltips () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));

    for (const el of tooltipTriggerList) {
        const toolTip = Tooltip.getInstance(el);
        if (!toolTip) new Tooltip(el);
    }
}

export function hideTooltip (el: Element) {
    const toolTip = Tooltip.getInstance(el);
    if (toolTip) toolTip.hide();
}
