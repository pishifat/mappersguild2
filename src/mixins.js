const mixin = {
    methods: {
		async executePost (path, data, e) {
            if (e) e.target.disabled = true;
            $("[data-toggle='tooltip']").tooltip('hide');

            try {
                const res = await axios.post(path, data);
                if (res.data.error) {
                    this.info = res.data.error;
                    this.inviteConfirm = null;
                } else {
                    if (e) e.target.disabled = false;
                    return res.data;
                }
            } catch (error) {
                this.info = 'Something went wrong';
            }
            
            if (e) e.target.disabled = false;
        },
    }
}

export default mixin;