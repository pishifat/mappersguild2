import Vue from 'vue';
import Axios from 'axios';

export interface ResponseError {
    error: string;
}

export default Vue.extend({
    methods: {
        async executePost<T>(path: string, data: object = {}, e?): Promise<T | ResponseError> {
            if (e) e.target.disabled = true;

            ($(`[data-toggle='tooltip']`) as any).tooltip('hide');

            try {
                const res = await Axios.post(path, data);

                if (res.data.error) {
                    this.$store.dispatch('updateToastMessages', res.data.error);

                    return { error: res.data.error };
                } else {
                    return res.data;
                }
            } catch (error) {
                this.$store.dispatch('updateToastMessages', 'Something went wrong!');

                return { error: 'Something went wrong!' };
            } finally {
                if (e) e.target.disabled = false;
            }
        },
        isError<T>(error: T | ResponseError): error is ResponseError {
            return (error as ResponseError).error !== undefined;
        },
    },
});
