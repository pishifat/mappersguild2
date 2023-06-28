<template>
    <div>
        <table v-if="data.length" class="table table-sm">
            <thead>
                <tr>
                    <th v-for="header in headers" :key="header">
                        {{ header }}
                    </th>
                    <th>EDIT</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="obj in data" :key="obj.id" class="text-secondary">
                    <slot :obj="obj" />
                    <td>
                        <a
                            href="#"
                            data-bs-toggle="modal"
                            :data-bs-target="customDataTarget || '#edit'"
                            @click.prevent="$emit('update:selectedId', obj.id)"
                        >
                            edit
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>

        <span v-else-if="!isLoading" class="text-secondary">None...</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'DataTable',
    props: {
        data: {
            type: Array as PropType<{ id: any }[]>,
            required: true,
        },
        headers: {
            type: Array,
            required: true,
        },
        isLoading: Boolean,
        customDataTarget: {
            type: String,
            default: null,
        },
    },
    emits: [
        'update:selectedId',
    ],
});
</script>
