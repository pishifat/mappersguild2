<template>
    <div class="col-sm-6 col-md-4 col-lg-4 col-xl-3 my-2" @click="selectUser()">
        <div
            class="card card-hover card-level-2 card-body"
            :class="'border-rank-' + user.rank"
            data-bs-toggle="modal"
            data-bs-target="#extendedInfo"
        >
            <img :src="'https://a.ppy.sh/' + user.osuId" class="card-avatar-img">

            <div class="mb-2">
                <a
                    :href="'https://osu.ppy.sh/users/' + user.osuId"
                    target="_blank"
                    @click.stop
                >
                    {{ user.username }}
                </a>
            </div>

            <div class="text-secondary">
                <div class="card-text small">
                    <b>Total points: {{ user.totalPoints }}</b>
                </div>
                <div class="card-text small">
                    Available points: {{ user.availablePoints }} <i class="fas fa-coins" />
                </div>
                <p v-if="filterMode == 'osu'" class="card-text small">
                    osu! points: {{ Math.round(user.osuPoints*10)/10 }}
                </p>
                <p v-else-if="filterMode == 'taiko'" class="card-text small">
                    osu!taiko points: {{ Math.round(user.taikoPoints*10)/10 }}
                </p>
                <p v-else-if="filterMode == 'catch'" class="card-text small">
                    osu!catch points: {{ Math.round(user.catchPoints*10)/10 }}
                </p>
                <p v-else-if="filterMode == 'mania'" class="card-text small">
                    osu!mania points: {{ Math.round(user.maniaPoints*10)/10 }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { User } from '../../../interfaces/user';

export default Vue.extend({
    name: 'UserCard',
    props: {
        user: {
            type: Object as () => User,
            required: true,
        },
    },
    computed: mapState(['filterMode']),
    methods: {
        selectUser(): void {
            this.$store.commit('users/setSelectedUserId', this.user.id);
        },
    },
});
</script>

<style scoped>
.card-avatar-img {
    position: absolute;
    top: calc(50% - 30px);
    left: -15px;
    max-width: 60px;
    max-height: 60px;
    object-fit: cover;
    border-radius: 100%;
    box-shadow: 0 1px 1rem rgb(10, 10, 25);
    background-color: rgb(10, 10, 25);
}

.card-body {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}

.card-header {
    padding: 0.5rem 1rem 0.5rem 3.5rem;
}
</style>
