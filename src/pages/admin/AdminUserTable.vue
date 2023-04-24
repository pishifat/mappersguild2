<template>
    <div>
        <a
            :href="`#${group}`"
            data-bs-toggle="collapse"
            class="ms-1"
            @click.prevent
        >
            <h5>
                {{ group }}
                <i class="fas fa-angle-down" />
            </h5>
        </a>
        <div v-if="!groupedUsers.length">
            (still loading)
        </div>
        <data-table
            :id="group"
            v-slot="{ obj: user }"
            class="collapse"
            :data="groupedUsers"
            :headers="['USERNAME', 'RANK', 'QUEUED BADGE', 'BADGE']"
            :custom-data-target="'#editUser'"
            @update:selected-id="selectedUserId = $event"
        >
            <td>
                <user-link :user="user" />
            </td>
            <td>
                <i
                    v-if="user.rank"
                    v-bs-tooltip="`rank ${user.rank} user`"
                    class="fas fa-crown"
                    :class="'text-rank-' + user.rank"
                />
            </td>
            <td :class="{ 'bg-open': user.rank != user.queuedBadge }">
                <i
                    v-if="user.queuedBadge"
                    v-bs-tooltip="`rank ${user.queuedBadge} user`"
                    class="fas fa-crown"
                    :class="'text-rank-' + user.queuedBadge"
                />
            </td>
            <td :class="{ 'bg-open': user.rank != user.badge }">
                <i
                    v-if="user.badge"
                    v-bs-tooltip="`rank ${user.badge} user`"
                    class="fas fa-crown"
                    :class="'text-rank-' + user.badge"
                />
            </td>
        </data-table>

        <user-info
            :user="selectedUser"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserInfo from '../../components/admin/UserInfo.vue';
import DataTable from '../../components/admin/DataTable.vue';
import { User, UserGroup } from '../../../interfaces/user';
import { mapState } from 'vuex';

export default defineComponent({
    components: {
        DataTable,
        UserInfo,
    },
    props: {
        groupedUsers: {
            type: Array,
            default: () => [],
        },
        group: {
            type: String,
            required: true,
        },
    },
    data () {
        return {
            selectedUserId: '',
        };
    },
    computed: {
        ...mapState({
            users: (state: any) => state.usersAdmin.users,
        }),
        selectedUser(): undefined | User {
            return this.users.find(u => u.id === this.selectedUserId);
        },
        spectators(): User[] {
            return this.users.filter(u => u.group == UserGroup.Spectator);
        },
    },
});
</script>
