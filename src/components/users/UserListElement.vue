<template>
    <div
        class="card card-body card-level-2 p-1"
        :class="'left-border-rank-' + user.rank"
        data-bs-toggle="modal"
        data-bs-target="#extendedInfo"
        @click="selectUser()"
    >
        <div class="row">
            <div class="col-sm-4">
                <i
                    v-if="user.rank"
                    v-bs-tooltip="
                        `rank ${user.rank} user`
                    "
                    class="fas fa-crown mx-1 me-2"
                    :class="'text-rank-' + user.rank"
                />
                <img :src="'https://a.ppy.sh/' + user.osuId" class="list-avatar-img" />
                <user-link
                    class="ms-1"
                    :user="user"
                />
            </div>
            <div class="col-sm-4 text-secondary">
                <div class="card-text small">
                    Total points: <b>{{ user.totalPoints }}</b>
                </div>
            </div>
            <div class="col-sm-4 text-secondary">
                <div v-if="filterMode == 'any'" class="card-text small">
                    Available points: {{ user.availablePoints }} <i class="fas fa-coins" />
                </div>
                <div v-if="filterMode == 'osu'" class="card-text small">
                    osu! points: <b>{{ Math.round(user.osuPoints*10)/10 }}</b>
                </div>
                <div v-else-if="filterMode == 'taiko'" class="card-text small">
                    osu!taiko points: <b>{{ Math.round(user.taikoPoints*10)/10 }}</b>
                </div>
                <div v-else-if="filterMode == 'catch'" class="card-text small">
                    osu!catch points: <b>{{ Math.round(user.catchPoints*10)/10 }}</b>
                </div>
                <div v-else-if="filterMode == 'mania'" class="card-text small">
                    osu!mania points: <b>{{ Math.round(user.maniaPoints*10)/10 }}</b>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';
import { User } from '../../../interfaces/user';

export default defineComponent({
    name: 'UserListElement',
    props: {
        user: {
            type: Object as () => User,
            required: true,
        },
    },
    computed: mapState('users', ['filterMode']),
    methods: {
        selectUser(): void {
            this.$store.commit('users/setSelectedUserId', this.user.id);
        },
    },
});
</script>

<style scoped>
.list-avatar-img {
    max-width: 24px;
    max-height: 24px;
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
