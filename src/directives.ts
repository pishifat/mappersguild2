import Tooltip from 'bootstrap/js/dist/tooltip';
import { Directive } from 'vue';

export const tooltip: Directive = {
    mounted (el: Element, binding) {
        new Tooltip(el, {
            title: binding.value || '',
            placement: (binding.arg as any) || 'top',
            trigger: 'hover',
            animation: false, // https://github.com/twbs/bootstrap/issues/32372
        });
    },
};
