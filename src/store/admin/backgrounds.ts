import { Module } from 'vuex';
import { MainState } from '@store/main';
import { Background } from '@interfaces/background';

interface BackgroundsAdminState {
    backgrounds: Background[];
}

const store: Module<BackgroundsAdminState, MainState> = {
    state: {
        backgrounds: [],
    },
    mutations: {
        setBackgrounds (state, backgrounds: Background[]): void {
            state.backgrounds = backgrounds;
        },
        updateBackground (state, background: Background): void {
            const i = state.backgrounds.findIndex(b => b.id === background.id);
            if (i !== -1) state.backgrounds[i] = background;
        },
        removeBackground (state, backgroundId: string): void {
            const i = state.backgrounds.findIndex(b => b.id === backgroundId);
            if (i !== -1) state.backgrounds.splice(i, 1);
        },
    },
};

export default store;
