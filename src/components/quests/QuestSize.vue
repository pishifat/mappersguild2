<template>
    <small>
        <span
            data-toggle="tooltip"
            data-placement="top"
            :title="
                'Party Size: ' +
                    (
                        quest.minParty == quest.maxParty ? quest.minParty + ' users' :
                        quest.status == 'open' ? quest.minParty + '-' + quest.maxParty + ' users' :
                        quest.status == 'wip' ? quest.currentParty.members.length + ' users' :
                        quest.status == 'done' ? quest.completedMembers.length + ' users' : ''
                    )
            "
        >
            <span v-if="quest.status == 'open'">
                <i v-for="i in quest.minParty" :key="i" class="fas fa-user" /><i v-for="i in quest.maxParty - quest.minParty" :key="i+100" class="fas text-white-50 fa-user" />
            </span>

            <span v-else-if="quest.status == 'wip'">
                <i v-for="member in quest.currentParty.members" :key="member.id" class="fas fa-user" />
            </span>

            <span v-else-if="quest.status == 'done'">
                <i v-for="member in quest.completedMembers" :key="member.id" class="fas fa-user" />
            </span>
        </span>
    </small>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'QuestSize',
    props: {
        quest: {
            type: Object,
            required: true,
        },
    },
});
</script>
