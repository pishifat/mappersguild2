<template>
    <div :id="'copyText' + distinct" class="copy-text small text-white-50 text-monospace" @click="copy">
        <slot />
    </div>
</template>

<script>

export default {
    name: 'CopyPaste',
    props: {
        distinct: {
            type: String,
            default: '',
        },
    },
    methods: {
        copy () {
            const el = document.querySelector(`#copyText${this.distinct}`);
            el.classList.add('animate-flicker');
            this.$store.dispatch('updateToastMessages', {
                message: 'Copied',
                type: 'info',
            });
            setTimeout(() => {
                el.classList.remove('animate-flicker');
            }, 500);
            const html = el.innerHTML.replace(/<br>/gi, '\r\n');
            const fakeEl = document.createElement('div');
            fakeEl.innerHTML = html;
            navigator.clipboard.writeText(fakeEl.textContent.trim());
        },
    },
};
</script>

<style>

@keyframes flickerAnimation {
    0% { background-color: rgba(56, 199, 192, 0.233); }
}

@-moz-keyframes flickerAnimation {
    0% { background-color: rgba(56, 199, 192, 0.233); }
}

@-webkit-keyframes flickerAnimation {
    0% { background-color: rgba(56, 199, 192, 0.233); }
}

.animate-flicker {
    -webkit-animation: flickerAnimation .5s;
    -moz-animation: flickerAnimation .5s;
    animation: flickerAnimation .5s;
}

.copy-text {
    cursor: pointer;
    background-color: darkslategray;
    margin: 0.75rem 0.75rem 0.75rem 0.75rem;
    padding: 0.75rem 0.75rem 0.75rem 0.75rem;
    box-shadow: 1px 1px 2px 1px black;
}

</style>
