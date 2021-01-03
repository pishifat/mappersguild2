import { ComponentOptions } from 'vue';

const mixin: ComponentOptions = {
    methods: {
        listUser(username: string, i: number, length: number): string {
            return username + (i < length - 1 ? ', ' : '');
        },
    },
};

export default mixin;
