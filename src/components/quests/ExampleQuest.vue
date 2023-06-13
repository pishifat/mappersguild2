<template>
    <div>
    <quest-card
        v-if="quest"
        :key="quest.id"
        :quest="quest"
        style="pointer-events: none;"
    />
    <div v-if="quest" class="text-secondary small">
        <ul>
            <li><b>Quest name:</b> {{ quest.name }}</li>
            <li><b>Quest objective:</b> {{ quest.descriptionMain }}</li>
            <li>
                <b>Quest size:</b> <quest-size
                    :quest="quest"
                />
                (Quest requires a party of at least {{ quest.minParty }} users and may have up to {{ quest.maxParty }} users)
            </li>
            <li>
                <b>Quest price:</b> <quest-price
                    :quest="quest"
                />
                (Quest requires {{ quest.price }} points from each party member to participate)
            </li>
            <li>
                <b>Quest deadline:</b> <quest-time
                    :timeframe="quest.timeframe"
                />
                (Quest must be completed in {{ Math.round(quest.timeframe / (1000*60*60*24)) }} days to earn maximum points)
            </li>
            <li>
                <b>Quest modes:</b> <quest-modes
                    :status="quest.status"
                    :modes="quest.modes"
                />
                (Quest is available for these modes)
            </li>
        </ul>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import QuestCard from '@components/quests/QuestCard.vue';
import QuestSize from '@components/quests/QuestSize.vue';
import QuestPrice from '@components/quests/QuestPrice.vue';
import QuestTime from '@components/quests/QuestTime.vue';
import QuestModes from '@components/quests/QuestModes.vue';
import { Quest } from '@interfaces/quest';

export default defineComponent({
    name: 'ExampleQuest',
    components: {
        QuestCard,
        QuestSize,
        QuestPrice,
        QuestTime,
        QuestModes,
    },
    props: {
        quest: {
            type: Object as () => Quest,
            required: true,
        },
    },
});
</script>
