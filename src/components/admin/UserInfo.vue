<template>
    <div id="editUser" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark" v-if="user">
                <div class="modal-header text-dark" :class="'bg-rank-' + user.rank">
                    <h5 class="modal-title">
                        <a :href="'https://osu.ppy.sh/users/' + user.osuId" class="text-dark" target="_blank">
                            {{ user.username }}
                        </a>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="overflow: hidden">
                    <p>
                        <input
                            class="form-control-sm mx-2"
                            type="text"
                            autocomplete="off"
                            v-model="penaltyPoints"
                        />
                        <button class="btn btn-sm btn-outline-info" @click="updatePenaltyPoints($event)">
                            Save penalty points
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'user-info',
    props: ['user'],
    watch: {
        user: function() {
            this.penaltyPoints = this.user.penaltyPoints || 0;
        },
    },
    computed: {

    },
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
                console.log(error);
            }

            if (e) e.target.disabled = false;
        },
        updatePenaltyPoints: async function(e) {
            const u = await this.executePost('/admin/updatePenaltyPoints/' + this.user.id, {penaltyPoints: this.penaltyPoints}, e);
            if (u) {
                this.$emit('update-user', u);
            }
        },
    },
    data() {
        return {
            penaltyPoints: null,
        };
    },
};
</script>