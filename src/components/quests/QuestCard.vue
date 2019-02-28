<template>

<div class='my-2' :class="quest.status != 'wip' ? 'col-lg-6' : 'col-lg-12'" @click="selectQuest()">
    <div class='card quest-card custom-bg-dark border-outline' style='height: 100%' data-toggle='modal' data-target='#extendedInfo' :data-user="quest.id">
        <div
            class="quest-card-status"
            :class="quest.status == 'wip' ? 'quest-card-status-wip' : quest.status == 'done' ? 'quest-card-status-done' : 'quest-card-status-open'"
        ></div>
        <img :src="quest.art ? 'https://assets.ppy.sh/artists/' + quest.art + '/header.jpg' : '../images/no-art.png'" 
        :style='quest.status == "open" ? "right:300px;" : quest.status == "wip" ? "right: 366px; max-height:166px;" : "right: 250px; max-height:166px;"'>
        <div class='card-img-overlay' style='padding: 0 0 0 0'>
            <div class='card-header text-shadow'>
                <span :class="quest.status != 'wip' ? 'big' : ''">{{quest.name}}</span>
                <span v-if="quest.status == 'open' && !partyQuest && partyRank >= quest.minRank && partySize <= quest.maxParty && partySize >= quest.minParty">
                    <button class="btn btn-mg btn-sm float-right accept" @click.stop="acceptQuest($event)">Accept</button>
                </span>
                <span v-if="quest.status == 'wip' && partyQuest == quest.id">
                    <button class="btn btn-mg-used btn-sm float-right drop" @click.stop="dropQuest($event)">Drop</button>
                </span>
            </div>
            <div class='card-body overwrite-card-spacing'>
                <span v-if="quest.status == 'open'">
                    <p class='card-text text-shadow small'>Objective: <p class='indent text-shadow small'>{{quest.descriptionMain}}</p>
                    <p class='card-text text-shadow small text-shadow' style='margin-top:0.5rem'>Reward: {{quest.reward}} bonus points for each user <span v-if="quest.medal">+ a pack-exclusive medal</span></p>
                    <p class='card-text text-shadow small'>Party: {{quest.minParty}}-{{quest.maxParty}} members, rank {{quest.minRank}}+</p>
                </span>
                <span v-if="quest.status == 'wip'">
                    <p class='card-text text-shadow small'>Current Party:</p> <p class='indent text-shadow small'>{{quest.assignedParty.name}}</p>
                    <p class='card-text text-shadow small'>Time remaining:</p> <p class='indent text-shadow small'>{{timeRemaining(quest.deadline)}}</p>
                </span>
                <span v-if="quest.status == 'done'">
                    <p class='card-text text-shadow small'>Objective: <p class='indent text-shadow small'>{{quest.descriptionMain}}</p>
                    <p class='card-text text-shadow small'>Completed on {{quest.completed.slice(0,10)}} by:
                        <template v-for="(member, i) in cutCompletedMembers(quest.completedMembers)"><a :key="i" :href="'https://osu.ppy.sh/users/' + member.osuId" target="_blank">{{ member.username + (i < quest.completedMembers.length - 1 ? ', ' : '') }}</a></template>
                        <span v-if="quest.completedMembers.length > 9">and a few more...</span>
                    </p>
                </span>
            </div>
        </div>
    </div>
</div>

</template>

<script>
export default {
    name: 'quest-card',
    props: ['quest', 'partyQuest', 'partyRank', 'partySize'],
    methods: {
        selectQuest: function () {
            this.$emit('update:selectedQuest', this.quest);
        },
        acceptQuest: function (e) {
            this.$emit('accept-quest', {id: this.quest.id, e: e});
        },
        dropQuest: function (e) {
            this.$emit('drop-quest', {id: this.quest.id, e: e});
        }, 
        timeRemaining: function(deadline){
            let now = new Date().getTime();
            let distance = new Date(deadline).getTime() - now;
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            return days + "d " + hours + "h " + minutes + "m ";
        },
        cutCompletedMembers: function(members){
            if(members.length > 9){
                return members.slice(0, 9)
            }else{
                return members;
            }
        }
    },
}
</script>

<style>
    
    .quest-card{
        overflow:hidden;
    }

    .quest-card img{
        min-width:1000px;
        max-height:200px;
        position:relative;
        filter: blur(4px);
        opacity:0.5;
    }

    .quest-card-status {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 0px;
        height: 0px;
        border-bottom: 24px solid transparent;
        z-index: 10000;
    }

    .quest-card-status-open {
    border-right: 24px solid var(--open);
    }

    .quest-card-status-wip {
        border-right: 24px solid var(--wip);
    }

    .quest-card-status-done {
        border-right: 24px solid var(--done);
    }
</style>
