<template>
    <div>
        <table v-if="data.length" class="table table-sm table-dark table-hover">
            <thead>
                <th v-for="header in headers" :key="header">
                    {{ header }}
                </th>
                <th>EDIT</th>
            </thead>
            <tbody>
                <tr v-for="obj in data" :key="obj.id" class="text-white-50">
                    <slot :obj="obj" />
                    <td>
                        <a
                            href="#"
                            data-toggle="modal"
                            data-target="#edit"
                            @click.prevent="$emit('update:selected-id', obj.id)"
                        >
                            edit
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>

        <span v-else-if="!isLoading" class="text-white-50">None...</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'DataTable',
    props: {
        data: {
            type: Array,
            required: true,
        },
        headers: {
            type: Array,
            required: true,
        },
        isLoading: Boolean,
    },
});
</script>