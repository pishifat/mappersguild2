<template>
    <div class="col-sm-3">
        <h5>{{ titleBase }}<span v-if="titleSuffix" class="text-secondary small ms-1">{{ titleSuffix }}</span></h5>
        <div v-if="!modeMentors || !modeMentors.length" class="text-secondary">
            No mentors...
        </div>
        <ol>
            <li v-for="user in modeMentors" :key="user.id + mode">
                <template v-if="loggedInUser.isMentorshipAdmin">
                    <user-link-list
                        :users="findCombinedMentors(user)"
                    />
                    <span
                        v-if="!involvedInAllPhases(user)"
                        v-bs-tooltip="'skips phases'"
                        class="text-secondary"
                    >*</span>
                    <a
                        href="#"
                        class="text-success ms-1 small"
                        @click.prevent="editingMentorId = user.id"
                    >
                        <i class="fas fa-plus" />
                    </a>
                    <span v-if="!findMentees(user.id).length">
                        <a
                            v-if="confirmDeleteMentor != user.id"
                            href="#"
                            class="text-danger ms-1 small"
                            @click.prevent="confirmDeleteMentor = user.id"
                        >
                            <i class="fas fa-minus" />
                        </a>
                        <a
                            v-else
                            class="text-danger"
                            href="#"
                            @click.prevent="removeParticipant($event, findExtraMentors(user.id).length ? findExtraMentors(user.id)[findExtraMentors(user.id).length - 1].id : user.id)"
                        >
                            confirm
                        </a>
                    </span>
                    <span v-if="showPhases" class="small">
                        <a
                            v-for="i in 3"
                            :key="i"
                            href="#"
                            :class="phaseEdit ? 'fake-button-disable' : ''"
                            @click.prevent="togglePhase(user, i, null)"
                        >
                            <span :class="isPhaseParticipant(user, i, user.id) ? '' : 'text-danger'" class="ms-1">P{{ i }}</span>
                        </a>
                    </span>
                </template>
                <template v-else>
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1 text-truncate" style="min-width: 0;">
                            <user-link-list
                                :users="findCombinedMentors(user)"
                            />
                            <span
                                v-if="!involvedInAllPhases(user)"
                                v-bs-tooltip="'skips phases'"
                                class="text-secondary"
                            >*</span>
                        </div>
                        <span v-if="!involvedInAllPhases(user)" class="phase-circles">
                            <i
                                v-for="i in 3"
                                :key="i"
                                :class="isPhaseParticipant(user, i, user.id) ? 'fas fa-circle' : 'far fa-circle'"
                                class="ms-1"
                            />
                        </span>
                    </div>
                </template>
                <div v-if="editingMentorId == user.id" class="input-group mt-1">
                    <input
                        v-model="extraMentorInput"
                        class="form-control form-control-sm ms-2 mb-1"
                        autocomplete="off"
                        placeholder="joint mentor username/osuId..."
                        @keyup.enter="addMentor($event, user.id)"
                    />
                    <div class="input-group-append">
                        <button
                            class="btn btn-primary"
                            href="#"
                            @click.prevent="addMentor($event, user.id)"
                        >
                            <i class="fas fa-plus fa-xs" />
                        </button>
                    </div>
                </div>
                <ul>
                    <li v-for="mentee in findMentees(user.id)" :key="mentee.id + mode" class="small">
                        <template v-if="loggedInUser.isMentorshipAdmin">
                            <user-link
                                :user="mentee"
                            />
                            <span
                                v-if="!involvedInAllPhases(mentee)"
                                v-bs-tooltip="'skips phases'"
                                class="text-secondary"
                            >*</span>
                            <a
                                v-if="confirmDeleteMentee != mentee.id"
                                href="#"
                                class="text-danger ms-1 small"
                                @click.prevent="confirmDeleteMentee = mentee.id"
                            >
                                <i class="fas fa-minus" />
                            </a>
                            <a
                                v-else
                                class="text-danger"
                                href="#"
                                @click.prevent="removeParticipant($event, mentee.id)"
                            >
                                confirm
                            </a>
                            <span v-if="showPhases" class="small">
                                <a
                                    v-for="i in 3"
                                    :key="i"
                                    href="#"
                                    :class="phaseEdit ? 'fake-button-disable' : ''"
                                    @click.prevent="togglePhase(mentee, i, user.id)"
                                >
                                    <span :class="isPhaseParticipant(mentee, i, user.id) ? '' : 'text-danger'" class="ms-1">P{{ i }}</span>
                                </a>
                            </span>
                        </template>
                        <template v-else>
                            <div class="d-flex align-items-center">
                                <div class="flex-grow-1 text-truncate" style="min-width: 0;">
                                    <user-link
                                        :user="mentee"
                                    />
                                    <span
                                        v-if="!involvedInAllPhases(mentee)"
                                        v-bs-tooltip="'skips phases'"
                                        class="text-secondary"
                                    >*</span>
                                </div>
                                <span v-if="!involvedInAllPhases(mentee)" class="phase-circles">
                                    <i
                                        v-for="i in 3"
                                        :key="i"
                                        :class="isPhaseParticipant(mentee, i, user.id) ? 'fas fa-circle' : 'far fa-circle'"
                                        class="ms-1"
                                    />
                                </span>
                            </div>
                        </template>
                    </li>
                </ul>
                <div v-if="editingMentorId == user.id" class="input-group">
                    <input
                        v-model="menteeInput"
                        class="form-control form-control-sm ms-2"
                        autocomplete="off"
                        placeholder="new mentee username/osuId..."
                        @keyup.enter="addMentee($event, user.id)"
                    />
                    <div class="input-group-append">
                        <button
                            class="btn btn-primary"
                            href="#"
                            @click.prevent="addMentee($event, user.id)"
                        >
                            <i class="fas fa-plus fa-xs" />
                        </button>
                    </div>
                </div>
            </li>
        </ol>
        <div v-if="loggedInUser.isMentorshipAdmin" class="input-group mb-3">
            <input
                v-model="mentorInput"
                class="form-control form-control-sm"
                autocomplete="off"
                placeholder="new mentor username/osuId..."
                @keyup.enter="addMentor($event, null)"
            />
            <div class="input-group-append">
                <button
                    class="btn btn-primary"
                    href="#"
                    @click.prevent="addMentor($event, null)"
                >
                    <i class="fas fa-plus fa-xs" />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapGetters } from 'vuex';
import mentorshipModule from '@store/mentorship';
import { User } from '@interfaces/user';
import UserLinkList from '@components/UserLinkList.vue';

export default defineComponent({
    name: 'ParticipantList',
    components: {
        UserLinkList,
    },
    props: {
        mode: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            mentorInput: null,
            menteeInput: null,
            extraMentorInput: null,
            editingMentorId: '',
            confirmDeleteMentor: '',
            confirmDeleteMentee: '',
            phaseEdit: false,
        };
    },
    computed: {
        ...mapState([
            'loggedInUser',
        ]),
        ...mapState('mentorship', [
            'showPhases',
        ]),
        ...mapGetters('mentorship', [
            'selectedCycle',
        ]),
        modeMentors(): User[] {
            const users = this.selectedCycle.participants.filter(p => {
                for (const mentorship of p.mentorships) {
                    if (mentorship.mode == this.mode && mentorship.group == 'mentor' && mentorship.cycle.toString() == this.selectedCycle.id) {
                        return true;
                    }
                }
            });

            return users.sort((a, b) => {
                if (a.username.toLowerCase() > b.username.toLowerCase()) return 1;
                if (b.username.toLowerCase() > a.username.toLowerCase()) return -1;

                return 0;
            });
        },
        modeMentees(): User[] {
            const users = this.selectedCycle.participants.filter(p => {
                for (const mentorship of p.mentorships) {
                    if (mentorship.mode == this.mode && mentorship.group == 'mentee' && mentorship.cycle.toString() == this.selectedCycle.id) {
                        return true;
                    }
                }
            });

            return users.sort((a, b) => {
                if (a.username.toLowerCase() > b.username.toLowerCase()) return 1;
                if (b.username.toLowerCase() > a.username.toLowerCase()) return -1;

                return 0;
            });
        },
        modeExtraMentors(): User[] {
            const users = this.selectedCycle.participants.filter(p => {
                for (const mentorship of p.mentorships) {
                    if (mentorship.mode == this.mode && mentorship.group == 'extraMentor' && mentorship.cycle.toString() == this.selectedCycle.id) {
                        return true;
                    }
                }
            });

            return users;
        },
        titleBase(): string {
            const baseMap: Record<string, string> = {
                osu: 'osu!',
                taiko: 'osu!taiko',
                catch: 'osu!catch',
                mania: 'osu!mania',
                osuModding: 'osu!',
                taikoModding: 'osu!taiko',
                catchModding: 'osu!catch',
                maniaModding: 'osu!mania',
            };

            return baseMap[this.mode] ?? this.mode;
        },
        titleSuffix(): string | null {
            if (['osu', 'taiko', 'catch', 'mania'].includes(this.mode)) return '(mapping)';
            if (['osuModding', 'taikoModding', 'catchModding', 'maniaModding'].includes(this.mode)) return '(modding)';

            return null;
        },
    },
    beforeCreate () {
        if (!this.$store.hasModule('mentorship')) {
            this.$store.registerModule('mentorship', mentorshipModule);
        }
    },
    methods: {
        findMentees(id): User[] {
            const mentees = this.modeMentees.filter(p => {
                for (const mentorship of p.mentorships) {
                    if (mentorship.group == 'mentee' && mentorship.mentor.toString() == id && mentorship.cycle.toString() == this.selectedCycle.id) {
                        return true;
                    }
                }
            });

            return mentees;
        },
        findExtraMentors(id): User[] {
            const extraMentors = this.modeExtraMentors.filter(p => {
                for (const mentorship of p.mentorships) {
                    if (mentorship.group == 'extraMentor' && mentorship.mentor.toString() == id && mentorship.cycle.toString() == this.selectedCycle.id) {
                        return true;
                    }
                }
            });

            return extraMentors;
        },
        findCombinedMentors(user): User[] {
            const extraMentors = this.findExtraMentors(user.id);

            if (extraMentors && extraMentors.length) {
                return [user].concat(extraMentors);
            }

            return [user];
        },
        isPhaseParticipant(user, phaseNum, mentorId): boolean {
            const cycle = user.mentorships.find(m => m.cycle.toString() == this.selectedCycle.id && m.mode == this.mode && (m.mentor ? m.mentor.toString() == mentorId : mentorId == user.id));

            if (cycle && cycle.phases.includes(phaseNum)) {
                return true;
            }

            return false;
        },
        involvedInAllPhases(user): boolean {
            const cycle = user.mentorships.find(m => m.cycle.toString() == this.selectedCycle.id && m.mode == this.mode);

            return cycle.phases.length == 3;
        },
        async addMentor(e, mainMentorId): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/addMentor`, { cycleId: this.selectedCycle.id, userInput: mainMentorId ? this.extraMentorInput : this.mentorInput, mode: this.mode, mainMentorId }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added "${mainMentorId ? this.extraMentorInput : this.mentorInput}"`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
                this.mentorInput = null;
                this.extraMentorInput = null;
            }
        },
        async addMentee(e, mentorId): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/addMentee`, { cycleId: this.selectedCycle.id, userInput: this.menteeInput, mode: this.mode, mentorId }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Added "${this.menteeInput}"`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
                this.menteeInput = null;
                this.editingMentorId = '';
            }
        },
        async removeParticipant(e, userId): Promise<void> {
            const cycle: any = await this.$http.executePost(`/mentorship/removeParticipant`, { cycleId: this.selectedCycle.id, userId, mode: this.mode }, e);

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Removed user`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
                this.confirmDeleteMentee = '';
                this.confirmDeleteMentor = '';
            }
        },
        async togglePhase(user, phaseNum, mentorId): Promise<void> {
            this.phaseEdit = true;
            const cycle: any = await this.$http.executePost(`/mentorship/togglePhase`, { cycleId: this.selectedCycle.id, userId: user.id, mode: this.mode, phaseNum, mentorId });

            if (!this.$http.isError(cycle)) {
                this.$store.dispatch('updateToastMessages', {
                    message: `Toggled phase ${phaseNum} for ${user.username}`,
                    type: 'info',
                });
                this.$store.commit('mentorship/updateCycle', cycle);
            }

            this.phaseEdit = false;
        },
    },
});
</script>

<style scoped>
.fake-button-disable {
    pointer-events: none;
    opacity: 0.6;
}
.phase-circles {
    font-size: 0.25em;
    color: var(--bs-secondary);
}
</style>