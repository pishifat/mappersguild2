import Vue from 'vue';
import { Quest, QuestStatus } from '@interfaces/quest';
import { Party } from '@interfaces/party';
import { mapState } from 'vuex';

export default Vue.extend({
    props: {
        party: {
            type: Object as () => Party,
            default: null,
        },
        quest: {
            type: Object as () => Quest,
            default: null,
        },
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        isWip (): boolean {
            return this.quest?.status == QuestStatus.WIP;
        },
        isOpen (): boolean {
            return this.quest?.status == QuestStatus.Open;
        },
        isDone (): boolean {
            return this.quest?.status == QuestStatus.Done;
        },
        isLeader (): boolean {
            return this.party?.leader.id == this.loggedInUser.id;
        },
    },
});
