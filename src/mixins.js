const mixin = {
    methods: {
        executePost: async function(path, data, e) {
			if (e) e.target.disabled = true;

			try {
				const res = await axios.post(path, data);
				
				if (res.data.error) {
                    this.info = res.data.error;
				} else {
					if (e) e.target.disabled = false;
					return res.data;
				}
			} catch (error) {
				console.log(error)
			}
			
			if (e) e.target.disabled = false;
        },
    }
}

export default mixin;