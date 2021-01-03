<template>
    <div class="row">
        <div class="col-md-12">
            <div class="row">
                <div class="col-md-3 col-lg-2 mb-3">
                    <div class="card card-body align-items-center justify-content-center">
                        <p class="text-center">
                            Quick access
                        </p>
                        <ol class="mb-0">
                            <li><a href="#general">General</a></li>
                            <li><a href="#mapping">Mapping</a></li>
                            <li><a href="#quest">Quest</a></li>
                            <li><a href="#rewards">Rewards</a></li>
                        </ol>
                    </div>
                </div>
                <div id="general" class="col-md-9 col-lg-10 mb-3">
                    <div class="card card-body">
                        <h4>General</h4>
                        <h5>Where does the Mappers' Guild communicate?</h5>
                        <p class="text-secondary">
                            We have a channel in the <a href="https://discordapp.com/invite/ppy">osu! development
                                Discord server</a>
                        </p>

                        <h5>Who are spectators? What can spectators do?</h5>
                        <div class="text-secondary">
                            Spectators are any users who don't have at least 3 ranked maps. They can view the website, but cannot interact with the guild (add beatmaps,
                            run quests, etc.).
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-3">
                <div id="mapping" class="col-md-12 mx-auto">
                    <div class="card card-body">
                        <h4>Mapping</h4>
                        <h5>What songs are available to map?</h5>
                        <p class="text-secondary">
                            Anything you can find on osu!'s
                            <a href="https://osu.ppy.sh/beatmaps/artists">Featured Artist listing</a>.
                        </p>

                        <h5>How do I gain early access to featured artist songs?</h5>
                        <p class="text-secondary">
                            Unpublished songs/artists will occasionally be available to map through rank-restricted
                            quests, meaning you'll need to have a certain amount of experience creating maps through the
                            Mappers' Guild before you can access them. Tier 1 members may be asked privately to make beatmaps for new
                            featured artist songs as well.
                        </p>

                        <h5>How do I create a new map?</h5>
                        <p class="text-secondary">
                            The <button class="btn btn-outline-info btn-sm">
                                Add beatmap <i class="fas fa-plus fa-xs" />
                            </button> button near the top
                            of the <a href="/beatmaps">beatmaps page</a> will open a new map creation form. Select an artist, one of their
                            songs, and any difficulties you want to map/lock.
                            <button class="btn btn-outline-success btn-sm">
                                Save
                            </button> will generate a new map card in the
                            listing.
                        </p>

                        <h5>How do I add a new difficulty?</h5>
                        <p class="text-secondary">
                            Clicking a map card opens its info page. Below the difficulty table is a dropdown menu:
                        </p>
                        <div class="input-group input-group-sm mb-3 ms-4" style="width: 200px">
                            <button class="btn btn-outline-info">
                                <i class="fas fa-plus" />
                            </button>
                            <select id="diffSelection" class="form-control form-control-sm">
                                <option value="Easy">
                                    Easy
                                </option>
                                <option value="Normal">
                                    Normal
                                </option>
                                <option value="Hard">
                                    Hard
                                </option>
                                <option value="Insane">
                                    Insane
                                </option>
                                <option value="Expert">
                                    Expert
                                </option>
                                <option value="Storyboard">
                                    Storyboard
                                </option>
                            </select>
                        </div>
                        <p class="text-secondary">
                            Any selected difficulty can be added from the plus button. Keep in mind that if you're
                            trying to create a guest difficulty, a mapset's host may have certain difficulties locked!
                        </p>

                        <h5>How do I get another user to create a difficulty for my mapset?</h5>
                        <p class="text-secondary">
                            Any user can add a difficulty themselves, so long as the mapset host hasn't disabled it.
                            A mapset host can also invite a user to create a difficulty filling the box
                            <input
                                class="form-control form-control-sm d-inline w-auto"
                                type="text"
                                placeholder="request to... (if needed)"
                                maxlength="18"
                            >
                            while adding a new difficulty. Invites bypass task locks.
                        </p>

                        <h5>How do I collaborate on a difficulty?</h5>
                        <p class="text-secondary">
                            You'll find a <a href="#" class="text-done" onclick="event.preventDefault()"><i class="fas fa-plus" /></a>
                            button beside your name on any of your difficulties.
                            Clicking that opens an input field where you can add any mapper you want to collaborate with. This
                            will send the mapper an invite, and if they accept, they'll be added to the task's mapper list!
                        </p>
                        <p>
                            Collaborators can be removed with the
                            <a href="#" class="text-danger" onclick="event.preventDefault()">
                                <i class="fas fa-minus" />
                            </a>
                            button.
                        </p>

                        <h5>What do the difficulty icons mean?</h5>
                        <img class="rounded mb-2" src="/images/faq/diffcolors.png" style="max-width: 100px; heigth: auto">
                        <p class="text-secondary">
                            Letters indicate the type of difficulty. E stands for Easy, N for Normal, etc.
                        </p>
                        <p class="text-secondary">
                            Colors indicate status. Using the above image as reference...
                        </p>
                        <ul>
                            <li class="text-secondary">
                                <span class="text-wip">E</span>: work-in-progress
                            </li>
                            <li class="text-secondary">
                                <span class="text-done">N</span>: complete
                            </li>
                            <li class="text-secondary">
                                <span class="text-open">H</span>: available for guest difficulties
                            </li>
                            <li class="text-secondary">
                                <span class="text-blocked">I</span>: locked, disallowing signups for the difficulty
                            </li>
                            <li class="text-secondary">
                                X: too many difficulties of one level to fit on a map's card, count visible on hover
                            </li>
                        </ul>

                        <h5>How do I set a map's status?</h5>
                        <ul>
                            <li class="text-secondary">
                                <a href="#" class="text-danger" onclick="event.preventDefault()"><i class="fas fa-minus" /></a>
                                deletes a difficulty
                            </li>
                            <li class="text-secondary">
                                <a href="#" class="text-done" onclick="event.preventDefault()"><i class="fas fa-check" /></a>
                                marks a difficulty as complete, disabling any collaboration edits
                            </li>
                            <li class="text-secondary">
                                <a href="#" class="text-wip" onclick="event.preventDefault()"><i
                                    class="fas fa-ellipsis-h"
                                /></a> marks a difficulty as work-in-progress
                            </li>
                        </ul>
                        <p class="text-secondary">
                            To change the status of a full mapset, its host can use the
                            <button class="btn btn-sm btn-outline-success">
                                Done
                            </button> and
                            <button class="btn btn-sm btn-outline-warning">
                                WIP
                            </button> buttons.
                            A mapset marked as "Work-in-progress (WIP)" allows other users to create difficulties. A mapset
                            marked as "Done" does not allow any modification and will be automatically marked as
                            "Qualified" if the map's link is correct.
                        </p>

                        <h5>How do I make my map's card use my map's background?</h5>
                        <p class="text-secondary">
                            Click the <a href="#" class="text-done" onclick="event.preventDefault()"><i
                                class="fas fa-edit"
                            /></a> button and input your map's osu! web link. Only links to the
                            new site (such as /beatmapsets/123456 rather than /s/123456) will generate card images, but any
                            links are acceptable.
                        </p>

                        <h5>When do I mark myself as a modder?</h5>
                        <p class="text-secondary">
                            <i>After</i> you've modded a mapset. Before a mapset is marked as Ranked, someone else
                            will ensure you actually modded. If a map is ranked before you have a chance to mark yourself as a modder, you
                            won't be able to add yourself to the modders list.
                        </p>

                        <h5>When do I mark myself as a potential Beatmap Nominator?</h5>
                        <p class="text-secondary">
                            Any time. If you're a BN and you're interested in nominating a mapset, adding yourself
                            to this list will let the mapper know who to contact when the mapset is ready! Marking yourself as a
                            BN does not reward any points -- modding does, however!
                        </p>

                        <h5>What do I do if I don't want anyone to claim a difficulty on my mapset?</h5>
                        <p class="text-secondary">
                            The "lock" feature disables difficulty claims for any difficulty you mark. Guest
                            difficulty invites can bypass locks.
                        </p>

                        <h5>How and why do I link a mapset to a quest?</h5>
                        <p class="text-secondary">
                            If you're currently running a quest, clicking the <a
                                href="#"
                                class="text-done"
                                onclick="event.preventDefault()"
                            ><i class="fas fa-edit" /></a> button in the "Quest"
                            field will show a dropdown menu for your active quests. When a mapset is linked to a quest,
                            only people running the quest are able to claim difficulties.
                        </p>

                        <h5>Are mapsets for different game modes allowed?</h5>
                        <p class="text-secondary">
                            Yes.
                        </p>

                        <h5>Are hybrid game mode mapsets allowed?</h5>
                        <p class="text-secondary">
                            Yes.
                        </p>

                        <h5>Can I cut songs?</h5>
                        <p class="text-secondary">
                            Yes.
                        </p>

                        <h5>Why do I need to use a licensed image as my map's background?</h5>
                        <div class="text-secondary">
                            The Mappers' Guild exists to create licensed content for osu!, so licensed backgrounds
                            are required as well.
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-3">
                <div id="quest" class="col-md-12 mx-auto">
                    <div class="card card-body">
                        <h4>Quest</h4>

                        <h5>Why is there a time limit on quests?</h5>
                        <p class="text-secondary">
                            Things don't get done without one. The Mappers' Guild so far has been able to produce
                            packs consistently because it has deadlines, and quests continue that system. If you're not a fan of
                            deadlines, you can still participate in the Mappers' Guild without running quests or purchase extensions
                            to quests with Mappers' Guild points!
                        </p>

                        <h5>Why can't I accept a quest?</h5>
                        <p class="text-secondary">
                            You must be a party's leader and your party must meet the quest's requirements. Usually,
                            this involves a member of your party having too few Mappers' Guild points available.
                        </p>

                        <h5>What happens when I accept a quest?</h5>
                        <p class="text-secondary">
                            You and your party are tasked with completing it by the date labeled in the quest listing.
                            Each member of the party will spend the amount of points specified on the quest to accept it. If a member does not
                            have enough points, the quest cannot be accepted.
                        </p>

                        <h5>What happens when I don't finish a quest by the deadline?</h5>
                        <p class="text-secondary">
                            Quests reward bonus points, and if you're late, you'll recieve less bonus points.
                            Completing a quest...
                        </p>
                        <ul class="text-secondary">
                            <li>before the deadline will reward all members 5 points and ~+2 points per difficulty for each difficulty's creator</li>
                            <li>0-30 days after the deadline will result in ~+1.5 points per difficulty</li>
                            <li>30-60 days after the deadline will result in ~+1 point per difficulty</li>
                            <li>more than 60 days after the deadline will result in ~+0.5 points per difficulty</li>
                        </ul>
                        <p class="text-secondary">
                            If you barely miss a deadline for reasons out of your control (such as the qualification phase), some leniency may be given.
                            If a quest is dragged on forever, it will be marked as dropped.
                        </p>

                        <h5>How can I extend a quest deadline?</h5>
                        <p class="text-secondary">
                            The party leader can extend the quest at the cost of 10 spendable points per user. This will
                            extend the deadline by 30 days each time.
                        </p>

                        <h5>What happens when I drop a quest?</h5>
                        <p class="text-secondary">
                            The quest is re-opened. You will not gain any quest bonus points and you will have
                            already lost points when accepting the quest. There was previously a penalty for dropping quests, but that
                            has since been removed.
                        </p>

                        <h5>Why can't I join a party while it's running a quest?</h5>
                        <p class="text-secondary">
                            When a quest begins, only the quest's party leader can invite members to the party.
                        </p>

                        <h5>Why can't people outside my party participate in quest-related maps?</h5>
                        <p class="text-secondary">
                            A quest is designed to be handled by the subgroup of a specified size that signs up for
                            it.
                        </p>

                        <h5>What are quests with a "?" as their icon?</h5>
                        <p class="text-secondary">
                            These are special quests potentially involving unannounced featured artists or are not specific
                            to any featured artists (but usually the first one). They may be rank-limited to ensure the quest will be
                            completed and its artist will not be leaked. Instructions about how to handle these quests will be explained
                            privately to their undertaking parties.
                        </p>

                        <h5>What happens if I leak anything about a special quest?</h5>
                        <p class="text-secondary">
                            Your party will be removed from the Mappers' Guild and if any members re-join, they will
                            not be allowed to handle info-sensitive quests.
                        </p>

                        <h5>What do I do when I complete a quest?</h5>
                        <p class="text-secondary">
                            If all mapsets linked to a quest are Ranked, it will be reviewed and marked as completed. If
                            you complete your quest and it isn't marked as completed within a few days, talk to pishifat.
                        </p>

                        <h5>What is an expired quest?</h5>
                        <p class="text-secondary">
                            If a quest is open after more than 3 months, it will move to the expired quests section.
                            Expired quests can be re-opened by spending Mappers' Guild points.
                        </p>

                        <h5>How do I re-open an expired quest?</h5>
                        <p class="text-secondary">
                            Mappers' Guild points can be spent to re-open expired quests from the expired
                            quests section.
                        </p>

                        <h5>Can a quest be handled by mappers from multiple game modes?</h5>
                        <p class="text-secondary">
                            Yes, as long as the mappers are in the same party.
                        </p>

                        <h5>How are party ranks chosen?</h5>
                        <p class="text-secondary">
                            A party's rank is an average of its members' user ranks, rounded up to the nearest whole
                            number. This means a rank 0 and a rank 1 user in the same party would form a rank 1 party (0.5
                            rounded up)
                        </p>

                        <h5>How do I stop other mappers from joining my party?</h5>
                        <p class="text-secondary">
                            A party's leader can lock new member admissions.
                        </p>

                        <h5>How do I get other people to join my party?</h5>
                        <p class="text-secondary">
                            Users can join any open party on their own. A party's leader can also invite other users
                            to join the party after clicking on a party's card.
                        </p>

                        <h5>What happened to quests with medals?</h5>
                        <p class="text-secondary">
                            Quests will be rewarded medals on a case-by-case basis. If you want to have your quest's
                            maps featured in an achievement/medal, ensure that it has low difficulties (Normal or lower) and
                            has at least 6 mapsets total!
                        </p>

                        <h5>How do I create a quest?</h5>
                        <p class="text-secondary">
                            Mappers' Guild members who are tier 2 or higher (250+ total points) have access to a
                            quest submission form on the quest listing. They can input their own specifications for a quest, which will later
                            be reviewed by pishifat. If the quest is reasonable, pishifat will publish it to the quest listing. If rejected,
                            your spent points will be returned and you may re-submit the quest based on feedback from pishifat.
                        </p>

                        <h5>What are "MBC" quests?</h5>
                        <p class="text-secondary">
                            MBC stands for "Monthly Beatmapping Contest" and its quests involve ranking maps from
                            the contest. "Finalists" mentioned in the descriptions of these quests refer to submissions that reached
                            the community voting stage of the contest.
                        </p>
                    </div>
                </div>
            </div>

            <div class="row mb-3">
                <div id="rewards" class="col-md-12 mx-auto">
                    <div class="card card-body">
                        <h4>Rewards</h4>
                        <h5>How do I earn points and badges?</h5>
                        <p class="text-secondary">
                            See the points breakdown on the <a href="/">home page</a>.
                        </p>

                        <h5>What determines my rank: available points or total points?</h5>
                        <p class="text-secondary">
                            Total points. Spending points will not lower your total points.
                        </p>

                        <h5>Does song length affect points earned?</h5>
                        <p class="text-secondary">
                            Yes. Maps 2.75 minutes long reward points at the base values listed on the home page.
                            Maps below that length reward less and maps above that length reward more, with diminishing returns
                            as a map gets continuously longer.
                        </p>

                        <h5>When are points rewarded?</h5>
                        <p class="text-secondary">
                            Mapping-related points are rewarded upon a mapset reaching Ranked status. Quest-related
                            points are rewarded upon a quest being marked as complete.
                        </p>

                        <h5>When are rewards given?</h5>
                        <p class="text-secondary">
                            Badges are published every 2-3 months. Medals are published at no set interval.
                        </p>

                        <h5>Can I earn points for X?</h5>
                        <p class="text-secondary">
                            If you don't see it mentioned anywhere, no. For extra clarity, here's some examples of
                            things that do not reward points:
                        </p>
                        <ul class="text-secondary">
                            <li>Anything unrelated to osu!'s featured artists</li>
                            <li>Mapsets you've ranked before joining the Mappers' Guild</li>
                            <li>Guest difficulties for mapsets uninvolved with the Mappers' Guild</li>
                            <li>Mapsets with participation from users uninvolved in the Mappers' Guild</li>
                            <li>Skinning and background creation (these gave small points rewards in the past)</li>
                            <li>Hitsounding (this is part of a host's bonus points)</li>
                            <li>Mapset with non-osu!-licensed background/storyboard content</li>
                        </ul>

                        <h5>What happens if someone abuses the points system?</h5>
                        <div class="text-secondary">
                            Any intentionally harmful actions will result in temporary or permanent removal from the
                            Mappers' Guild depending on severity. For example, if a user marks themselves as having created
                            difficulties when in reality they haven't, they'll be removed.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({

});
</script>
