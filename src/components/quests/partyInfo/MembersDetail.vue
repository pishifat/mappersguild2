<template>
    <div>
        <p class="small text-shadow min-spacing ml-3">
            Members:
        </p>
        <ul class="min-spacing ml-4">
            <li v-for="member in members" :key="member.id" class="text-shadow small">
                <a :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">
                    {{ member.username }}
                </a>
                <i
                    v-if="member.rank > 0"
                    class="fas fa-crown"
                    :class="member.rank == 1 ? 'text-rank-1' : member.rank == 2 ? 'text-rank-2' : 'text-rank-3'"
                    data-toggle="tooltip"
                    data-placement="top"
                    :title="member.rank == 1 ? 'rank 1 user' : member.rank == 2 ? 'rank 2 user' : 'rank 3 user'"
                />
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { User } from '../../../../interfaces/user';

export default Vue.extend({
    props: {
        members: {
            type: Array as () => User[],
            required: true,
        },
    },
});
</script>
