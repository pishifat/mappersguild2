<template>
    <div class="dropdown nav-avatar-menu">
        <a
            id="userInfo"
            class="dropdown-toggle"
            href="#"
            data-bs-toggle="dropdown"
        >
            <img :src="`https://a.ppy.sh/${loggedInUser.osuId}`" class="rounded-circle nav-avatar ms-2" />
        </a>
        <div class="dropdown-menu dropdown-menu-end">
            <router-link :to="`/users?id=${loggedInUser.id}`" class="dropdown-item">
                View full points breakdown
            </router-link>
            <hr class="my-2" />
            <span class="dropdown-item disabled">Total points: <span class="float-end">{{ Math.round(loggedInUser.pointsInfo.total * 10) / 10 }}</span></span>
            <span class="dropdown-item disabled">Available points: <span class="float-end">{{ Math.round(loggedInUser.pointsInfo.available * 10) / 10 }} <i class="fas fa-coins" /></span></span>
            <hr class="my-2" />
            <span class="dropdown-item small disabled">Mapping points: <span class="float-end">{{ Math.round(loggedInUser.pointsInfo.mapping * 10) / 10 }}</span></span>
            <span class="dropdown-item small disabled">Modding points: <span class="float-end">{{ Math.round(loggedInUser.pointsInfo.modding * 10) / 10 }}</span></span>
            <span class="dropdown-item small disabled">Other points: <span class="float-end">{{ Math.round(loggedInUser.pointsInfo.other * 10) / 10 }}</span></span>
            <div class="dropdown-divider" />
            <div class="dropdown-divider" />
            <form action="/api/logout" method="GET">
                <button class="btn btn-sm btn-outline-danger float-end me-2" type="submit">
                    Log Out
                </button>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';

export default defineComponent({
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
    },
});
</script>