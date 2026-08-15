<template>
    <div
        class="card card-body card-level-2 p-2 opacity-50 pe-none"
        :class="'left-border-rank-' + rank"
    >
        <div class="row">
            <div class="col-sm-4">
                <i
                    v-if="rank"
                    class="fas fa-crown mx-1 me-2"
                    :class="'text-rank-' + rank"
                />
                <span class="ms-1">...</span>
            </div>
            <div class="col-sm-4 text-secondary">
                <div class="card-text small">
                    Total points: <b>...</b>
                </div>
            </div>
            <div class="col-sm-4 text-secondary">
                <div class="card-text small">
                    Available points: ... <i class="fas fa-coins" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'UserListPlaceholder',
    props: {
        rank: {
            type: Number,
            required: true,
        },
    },
});
</script>
