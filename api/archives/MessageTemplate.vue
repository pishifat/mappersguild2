<template>
    <div>
        <bot-chat-message
            :messages="messages"
            :message-type="'contest'"
            :mongo-id="contestId"
            :users="[{ osuId }]"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//import BotChatMessage from '../BotChatMessage.vue';

export default defineComponent({
    name: 'MessageTemplate',
    components: {
        //BotChatMessage,
    },
    props: {
        osuId: {
            type: Number,
            default: 0,
        },
        submissionId: {
            type: String,
            required: true,
        },
        contestName: {
            type: String,
            required: true,
        },
        contestId: {
            type: String,
            required: true,
        },
    },
    computed: {
        messages () {
            let messages: string[] = [];

            messages.push(`hello! thank you for participating in ${this.contestName}!`);
            messages.push(`screening/judging details for your submission can be found here: https://mappersguild.com/contests/results?submission=${this.submissionId}`);
            messages.push(`a news post including the full results will be published soon!`);

            return messages;
        },
    },
});
</script>
