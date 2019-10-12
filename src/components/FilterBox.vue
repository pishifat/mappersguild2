<template>
    <div>
        <div class="row mb-2">
            <div class="col">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    <input
                        class="form-control"
                        type="text"
                        maxlength="48"
                        :placeholder="filterQuest !== undefined ? 'song/username' : 'username' + '... (3+ characters)'"
                        autocomplete="off"
                        :value="filterValue"
                        @input="$emit('update:filterValue', $event.target.value)"
                    />
                    <div class="input-group-append">
                        <button
                            class="btn btn-outline-secondary"
                            type="button"
                            @click="$emit('self-filter')"
                        >
                            <i class="fas fa-user-circle"></i>
                        </button>
                    </div>
                    <div class="input-group-append">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </div>
        <div class="row small">
            <div class="col">
                <div class="row mt-3">
                    <div class="col-auto filter-title">
                        Mode
                    </div>
                    <div class="col">
                        <a href="#" class="mode sorted" @click.prevent="$emit('update:filterMode', ''); checkSorted();">Any</a>
                        <a href="#" class="mode unsorted" @click.prevent="$emit('update:filterMode', 'osu'); checkSorted();">osu!</a>
                        <a href="#" class="mode unsorted" @click.prevent="$emit('update:filterMode', 'taiko'); checkSorted();">osu!taiko</a>
                        <a href="#" class="mode unsorted" @click.prevent="$emit('update:filterMode', 'catch'); checkSorted();">osu!catch</a>
                        <a href="#" class="mode unsorted" @click.prevent="$emit('update:filterMode', 'mania'); checkSorted();">osu!mania</a>
                    </div>
                </div>
                <div class="row mt-3" v-if="filterStatus !== undefined">
                    <div class="col-auto filter-title">
                        Status
                    </div>
                    <div class="col">
                        <a href="#" class="status sorted" @click.prevent="$emit('update:filterStatus', ''); checkSorted();">Any</a>
                        <a href="#" class="status unsorted" @click.prevent="$emit('update:filterStatus', 'WIP'); checkSorted();">WIP</a>
                        <a href="#" class="status unsorted" @click.prevent="$emit('update:filterStatus', 'Done'); checkSorted();">Done</a>
                        <a href="#" class="status unsorted" @click.prevent="$emit('update:filterStatus', 'Qualified'); checkSorted();">Qualified</a>
                    </div>
                </div>
                <div class="row mt-3" v-if="filterQuest !== undefined">
                    <div class="col-auto filter-title">
                        Quest
                    </div>
                    <div class="col">
                        <a href="#" class="quest sorted" @click.prevent="$emit('update:filterQuest', ''); checkSorted();">Any</a>
                        <a href="#" class="quest unsorted" @click.prevent="$emit('update:filterQuest', 'none'); checkSorted();">None</a>
                        <a
                            href="#"
                            class="mx-1"
                            v-for="quest in allQuests"
                            :key="quest.id"
                            @click.prevent="$emit('update:filterQuest', quest.id); checkSorted();"
                        >
                            <img
                                :src="quest.art ? `https://assets.ppy.sh/artists/${quest.art}/cover.jpg` : `../images/no-art-icon.png`"
                                data-toggle="tooltip"
                                :title="quest.name"
                                class="quest rounded-circle unsorted-img"
                                style="height: 24px; width: 24px;"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['filter-value', 'filter-mode', 'filter-status', 'filter-quest', 'all-quests'],
    methods: {
        checkSorted: function () {
            const category = event.target.classList[0];
            if (event.target.className.includes('unsorted') || event.target.className.includes('unsorted-img')) {
                $(`.${category}.sorted`).addClass('unsorted').removeClass('sorted');
                $(`.${category}.sorted-img`).addClass('unsorted-img').removeClass('sorted-img');
            }
            if (event.target.className.includes('unsorted-img')) {
                event.target.className = event.target.className.slice(
                    0,
                    event.target.className.indexOf('unsorted-img')
                );
                event.target.className += ' sorted-img';
            } else if (event.target.className.includes('unsorted')) {
                event.target.className = event.target.className.slice(
                    0,
                    event.target.className.indexOf('unsorted')
                );
                event.target.className += ' sorted';
            }
        }
    }
};
</script>

<style>
.filter-title {
    width: 60px;
}
.sorted-img {
    border-color: var(--ranked);
    border-width: 2px;
    border-style: solid;
}
</style>
