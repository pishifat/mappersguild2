<template>

<div class='my-2' :class="quest.status != 'wip' ? 'col-lg-6' : 'col-lg-12'" @click="selectQuest()">
    <div class='card quest-card custom-bg-dark' :class="'border-status-' + quest.status" style='height: 100%' data-toggle='modal' data-target='#extendedInfo' :data-user="quest.id">
        <img :src="quest.art ? 'https://assets.ppy.sh/artists/' + quest.art + '/header.jpg' : '../images/no-art.png'" style='right:300px;'>
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
                    <p class='card-text text-shadow small text-shadow' style='margin-top:0.5rem'>Reward: {{quest.reward}} bonus points for each user <span v-if="quest.medal">+ a pack-exclusive medal"</span></p>
                    <p class='card-text text-shadow small'>Party: {{quest.minParty}}-{{quest.maxParty}} members, rank {{quest.minRank}}+</p>
                </span>
                <span v-if="quest.status == 'wip'">
                    <p class='card-text text-shadow small'>Current Party:</p> <p class='indent text-shadow small'>{{quest.assignedParty.name}}</p>
                    <p class='card-text text-shadow small'>Time remaining:</p> <p class='indent text-shadow small'>{{timeRemaining(quest.deadline)}}</p>
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
        }
    },
}
</script>