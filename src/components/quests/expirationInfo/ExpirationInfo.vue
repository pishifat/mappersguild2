<template>
    <div
        :id="collapse ? 'details-' + quest.id : 'details-modal-' + quest.id"
        :class="collapse ? 'collapse' : 'show'"
    >
        <div class="card-body static-card">
            <div class="row">
                <div class="col-sm-12">
                    <expiration-date
                        :is-expired="quest.isExpired"
                        :expiration="new Date(quest.expiration)"
                    />
                    <reopen-quest
                        :quest-id="quest.id"
                        :status="quest.status"
                        :price="quest.price*0.5 + 25"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Quest } from '../../../../interfaces/quest';
import ExpirationDate from './ExpirationDate.vue';
import ReopenQuest from './ReopenQuest.vue';

export default Vue.extend({
    name: 'ExpirationInfo',
    components: {
        ExpirationDate,
        ReopenQuest,
    },
    props: {
        quest: {
            type: Object as () => Quest,
            required: true,
        },
        memberOfAnyParty: Boolean,
        collapse: Boolean,
    },
    methods: {
    },
});
</script>
