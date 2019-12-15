const mixin = {
    methods: {
		async executePost (path, data, e) {
            if (e) e.target.disabled = true;
            $("[data-toggle='tooltip']").tooltip('hide');

            try {
                const res = await axios.post(path, data);
                if (res.data.error) {
                    return { error: res.data.error };
                } else {
                    return res.data;
                }
            } catch (error) {
                return { error: 'Something went wrong!' };
            } finally {
                if (e) e.target.disabled = false;
            }
        },
    }
}

export default mixin;
