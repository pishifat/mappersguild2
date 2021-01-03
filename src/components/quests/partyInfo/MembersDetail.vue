<template>
    <div class="ms-3 mt-1">
        <b>
            Members:
            ({{ members.length }})
        </b>
        <ul class="mb-0">
            <li v-for="member in members" :key="member.id">
                <user-link :user="member" />
                <i
                    v-if="member.rank > 0"
                    class="fas fa-crown"
                    :class="'text-rank-' + member.rank"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    :title="`rank ${member.rank} user`"
                />
                <span v-if="status == 'open' && member.availablePoints < price" class="text-danger">
                    {{ `(${member.availablePoints} points available)` }}
                </span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { User } from '../../../../interfaces/user';

export default defineComponent({
    props: {
        members: {
            type: Array as () => User[],
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },
});
</script>
