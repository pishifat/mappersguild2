<template>
    <div class="col-sm-6 col-md-4 col-lg-4 col-xl-3 my-2" @click="selectUser()">
        <div
            class="card bg-dark"
            :class="'border-rank-' + user.rank"
            data-toggle="modal"
            data-target="#extendedInfo"
            :data-user="user.osuId"
        >
            <img :src="'https://a.ppy.sh/' + user.osuId" class="card-avatar-img">
            <div class="card-header">
                <a
                    :href="'https://osu.ppy.sh/users/' + user.osuId"
                    class="text-shadow"
                    target="_blank"
                    @click.stop
                    >{{ user.username }}</a
                >
            </div>
            <div class="card-body text-white-50">
                <p class="card-text text-shadow small">
                    Total points: {{ user.totalPoints }}
                </p>
                <p v-if="filterMode == 'osu'" class="card-text text-shadow small pl-2">
                    osu! points: {{ Math.round(user.osuPoints * 10) / 10 }}
                </p>
                <p v-else-if="filterMode == 'taiko'" class="card-text text-shadow small pl-2">
                    osu!taiko points: {{ Math.round(user.taikoPoints * 10) / 10 }}
                </p>
                <p v-else-if="filterMode == 'catch'" class="card-text text-shadow small pl-2">
                    osu!catch points: {{ Math.round(user.catchPoints * 10) / 10 }}
                </p>
                <p v-else-if="filterMode == 'mania'" class="card-text text-shadow small pl-2">
                    osu!mania points: {{ Math.round(user.maniaPoints * 10) / 10 }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'user-card',
    props: ['user', 'filterMode'],
    methods: {
        selectUser: function() {
            this.$emit('update:selectedUser', this.user);
        },
    },
};
</script>

<style>
.card-avatar-img {
    position: absolute;
    top: calc(50% - 30px);
    left: -15px;
    max-width: 60px;
    max-height: 60px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 1rem rgba(10, 10, 25);
    background-color: rgba(10, 10, 25);
}
.card-body {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}
.card-header {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}
</style>
