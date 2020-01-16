const express = require('express');
const beatmaps = require('../models/beatmap.js');
const tasks = require('../models/task.js');
const quests = require('../models/quest.js');
const parties = require('../models/party.js');
const users = require('../models/user.js');
const logs = require('../models/log.js');
const featuredArtists = require('../models/featuredArtists.js');
const api = require('../models/api.js');

const router = express.Router();

router.use(api.isLoggedIn);
router.use(api.isAdmin);

//population
const beatmapPopulate = [
    { populate: 'host',  display: '_id osuId username' },
    { populate: 'bns',  display: '_id osuId username' },
    { populate: 'modders',  display: '_id osuId username' },
    { populate: 'quest',  display: '_id name' },
    { populate: 'song',  display: 'artist title' },
    { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
];

const questPopulate = [
    { innerPopulate: 'parties',  populate: { path: 'members leader' } },
    { innerPopulate: 'currentParty',  populate: { path: 'members leader' } },
    { populate: 'completedMembers',  display: 'username osuId rank' },
    { innerPopulate: 'associatedMaps',  populate: { path: 'song host tasks' } }
];

const artistPopulate = [
    { populate: 'songs',  display: 'artist title' }
];

/* GET admin page */
router.get('/', async (req, res, next) => {
    res.render('admin', { 
        title: 'Admin', 
        script: '../javascripts/admin.js', 
        loggedInAs: req.session.osuId,
        userTotalPoints: res.locals.userRequest.totalPoints,
    });
});

/* GET relevant info for page load */
router.get('/relevantInfo/', async (req, res) => {
    let allBeatmaps = await beatmaps.service.query({}, beatmapPopulate, {status: 1, mode: 1}, true);
    let actionBeatmaps = [];
    for (let i = 0; i < allBeatmaps.length; i++) {
        let bm = allBeatmaps[i];
        if ((bm.status == 'Done' || bm.status == 'Qualified') && bm.url) {
            if (bm.url.indexOf('osu.ppy.sh/beatmapsets/') == -1) {
                bm.status = `${bm.status} (invalid link)`;
                actionBeatmaps.push(bm);
            } else {
                let indexStart = bm.url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
                let indexEnd = bm.url.indexOf('#');
                let bmId;

                if (indexEnd !== -1) {
                    bmId = bm.url.slice(indexStart, indexEnd);
                } else {
                    bmId = bm.url.slice(indexStart);
                }
                
                const bmInfo = await api.beatmapsetInfo(bmId);
                let status = '';
                if (bmInfo) {
                    switch (bmInfo.approved) {
                        case '4':
                            status = 'Loved';
                            break;
                        case '3':
                            status = 'Qualified';
                            break;
                        case '2':
                            status = 'Approved';
                            break;
                        case '1':
                            status = 'Ranked';
                            break;
                        default:
                            status = 'Done';
                            break;
                    }
                }
                if(bm.status != status){
                    if(status == 'Qualified'){
                        await beatmaps.service.update(bm.id, {status: 'Qualified'});
                    }else{
                        bm.status = `${bm.status} (osu: ${status})`;
                        actionBeatmaps.push(bm);
                    }

                }
            }
        }
    }

    let allQuests = await quests.service.query({ status: 'wip' }, questPopulate, {}, true);
    let actionQuests = [];
    for (let i = 0; i < allQuests.length; i++) {
        const q = allQuests[i];
        let valid = true;
        if(!q.associatedMaps.length){
            valid = false;
        }else{
            q.associatedMaps.forEach(b => {
                if(b.status != 'Ranked'){
                    valid = false;
                }
            });
        }
        if(valid){
            q.status = 'wip: all Ranked';
            actionQuests.push(q);
        }
    }

    let allUsers = await users.service.query({}, {}, null, true);
    let actionUsers = [];
    for (let i = 0; i < allUsers.length; i++) {
        const u = allUsers[i];
        if(u.badge != u.rank){
            actionUsers.push(u);
        }
    }
    res.json({ actionBeatmaps, actionQuests, actionUsers });   
});

/* GET news info */
router.get('/loadNewsInfo/:date', async (req, res) => {
    let date = new Date(req.params.date);
    if(isNaN(Date.parse(date))){
        return res.json( { error: 'Invalid date' } );
    }
    let b = await beatmaps.service.query({ 
        updatedAt: { $gte: date }, 
        status: 'Ranked', 
        $or: [
            { quest: { $exists: false } }, 
            { quest: { $eq: null } } 
        ],},
        beatmapPopulate, 
        { mode: 1, createdAt: -1 }, 
        true
    );
    let q = await quests.service.query({ completed: { $gte: date } }, questPopulate, { name: 1 }, true);
    res.json({ beatmaps: b, quests: q });
});

/* GET beatmaps */
router.get('/loadBeatmaps/', async (req, res) => {
    let b = await beatmaps.service.query({}, beatmapPopulate, {packId: 1, status: 1, mode: 1, createdAt: -1}, true);
    res.json({b});
});

/* POST update map status */
router.post('/updateBeatmapStatus/:id', api.isSuperAdmin, async (req, res) => {
    let b = await beatmaps.service.update(req.params.id, {status: req.body.status});
    if(req.body.status == "Done"){
        for (let i = 0; i < b.tasks.length; i++) {
            await tasks.service.update(b.tasks[i], {status: "Done"});
        }
    }
    if(req.body.status == "Ranked"){
        let indexStart = b.url.indexOf('beatmapsets/') + 'beatmapsets/'.length;
        let indexEnd = b.url.indexOf('#');
        let bmId;

        if (indexEnd !== -1) {
            bmId = b.url.slice(indexStart, indexEnd);
        } else {
            bmId = b.url.slice(indexStart);
        }
        const bmInfo = await api.beatmapsetInfo(bmId);
        await beatmaps.service.update(b._id, {length: bmInfo.hit_length});
        b = await beatmaps.service.query({_id: req.params.id}, beatmapPopulate);

        let names = [];
        b.tasks.forEach(task => {
            task.mappers.forEach(mapper => {
                if(names.indexOf(mapper.username) == -1 && mapper.username != b.host.username){
                    names.push(mapper.username);
                }
            });
        });
        let nameString;
        if(!names.length){
            nameString = "No guest difficulties";
        }else if(names.length > 1){
            nameString = "Guest difficulties: ";
        }else if(names.length == 1){
            nameString = "Guest difficulty: ";
        }
        for (let i = 0; i < names.length; i++) {
            nameString += names[i];
            if(i != names.length - 1){
                nameString += ", "
            }
        }

        api.webhookPost([{
            author: {
                name: `Ranked: ${b.song.artist} - ${b.song.title}`,
                url: b.url,
                icon_url: 'https://a.ppy.sh/' + b.host.osuId,
            },
            thumbnail: {
                url: `https://assets.ppy.sh/beatmaps/${bmId}/covers/list.jpg`
            },
            color: '10221039',
            fields:[
                {
                    name: `Host: ${b.host.username}`,
                    value: nameString
                }
            ]
        }]);
    }
    b = await beatmaps.service.query({ _id: req.params.id }, beatmapPopulate);
    res.json(b);
});

/* POST delete task */
router.post('/deleteTask/:id', api.isSuperAdmin, async (req, res) => {
    await beatmaps.service.update(req.params.id, { $pull: { tasks: req.body.taskId } });
    await tasks.service.remove(req.body.taskId);
    let b = await beatmaps.service.query({ _id: req.params.id }, beatmapPopulate);
    res.json(b);
});

/* POST delete modder */
router.post('/deleteModder/:id', api.isSuperAdmin, async (req, res) => {
    await beatmaps.service.update(req.params.id, { $pull: { modders: req.body.modderId } });
    let b = await beatmaps.service.query({ _id: req.params.id }, beatmapPopulate);
    res.json(b);
});

/* POST update map url */
router.post('/updateUrl/:id', api.isSuperAdmin, async (req, res) => {
    await beatmaps.service.update(req.params.id, { url: req.body.url });
    let b = await beatmaps.service.query({ _id: req.params.id }, beatmapPopulate);
    res.json(b);
});

/* POST update sb quality */
router.post('/updateStoryboardQuality/:id', api.isAdmin, async (req, res) => {
    await tasks.service.update(req.body.taskId, { sbQuality: req.body.storyboardQuality });
    let b = await beatmaps.service.query({ _id: req.params.id }, beatmapPopulate);
    res.json(b);
});

/* POST update osu beatmap pack ID */
router.post('/updatePackId/:id', api.isAdmin, async (req, res) => {
    await beatmaps.service.update(req.params.id, { packId: req.body.packId });
    let b = await beatmaps.service.query({ _id: req.params.id }, beatmapPopulate);
    res.json(b);
});

/* GET quests */
router.get('/loadQuests/', async (req, res) => {
    let q = await quests.service.query({}, questPopulate, {status: -1, name: 1}, true);
    res.json({q});
});

/* POST add quest */
router.post('/addQuest/', api.isSuperAdmin, async (req, res) => {
    req.body.modes = ['osu', 'taiko', 'catch', 'mania'];
    var quest = await quests.service.create(req.body);
    if (quest) {
        logs.service.create(req.session.mongoId, `created quest "${quest.name}"`, quest._id, 'quest' );
        api.webhookPost([{
            author: {
                name: `New Quest: ${quest.name}`,
                url: `https://mappersguild.com/quests`
            },
            thumbnail: {
                url: `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`
            },
            color: '16734308',
            fields:[{
                name: "Objective",
                value: `${quest.descriptionMain}`
            },
            {
                name: "Party",
                value: `${quest.minParty == quest.maxParty ? quest.maxParty : quest.minParty + '-' + quest.maxParty} member${quest.maxParty == 1 ? '' : 's'}`
            },
            {
                name: "Bonus",
                value: `${quest.reward} points for each member`
            }]
        }]);
        res.send(quest);
    }
});

/* POST rename quest */
router.post('/renameQuest/:id', api.isSuperAdmin, async (req, res) => {
    let q = await quests.service.update(req.params.id, { name: req.body.name });
    q = await quests.service.query({_id: req.params.id}, questPopulate);
    res.json(q);
});

/* POST rename quest */
router.post('/updateDescription/:id', api.isSuperAdmin, async (req, res) => {
    let q = await quests.service.update(req.params.id, { descriptionMain: req.body.description });
    q = await quests.service.query({_id: req.params.id}, questPopulate);
    res.json(q);
});

/* POST drop quest */
router.post('/dropQuest/:id', api.isSuperAdmin, async (req, res) => {
    let q = await quests.service.query({_id: req.params.id}, questPopulate);
    let openQuest = await quests.service.query({ name: q.name, status: 'open' });
    if(openQuest){
        await quests.service.update(openQuest._id, {
            $push: { modes: q.modes }
        });
        await quests.service.remove(req.params.id);
    }else{
        await quests.service.update(req.params.id, {
            status: "open",
            currentParty: null,
        });
    }
    
    for (let i = 0; i < q.currentParty.members.length; i++) {
        let member = await users.service.query({_id: q.currentParty.members[i]});
        await users.service.update(member._id, {penaltyPoints: (member.penaltyPoints + q.reward)});
    }

    let maps = await beatmaps.service.query({}, {}, {}, true);
    for (let i = 0; i < maps.length; i++) {
        if(maps[i].quest && maps[i].quest.toString() == q._id.toString()){
            beatmaps.service.update(maps[i]._id, {quest: undefined});
        }
    }
    await parties.service.remove(q.currentParty.id);

    q = await quests.service.query({_id: req.params.id}, questPopulate);
    res.json(q);

    logs.service.create(req.session.mongoId, `forced party to drop quest "${q.name}"`, req.params.id, 'quest' );
});

/* POST complete quest */
router.post('/completeQuest/:id', api.isSuperAdmin, async (req, res) => {
    let quest = await quests.service.query({_id: req.params.id}, questPopulate);

    if(quest.status == "wip"){
        //webhook
        let memberList = "";
        for (let i = 0; i < quest.currentParty.members.length; i++) {
            memberList += quest.currentParty.members[i].username
            if(i != quest.currentParty.members.length - 1){
                memberList += ", ";
            }
        }
        api.webhookPost([{
            author: {
                name: `Party completed quest: "${quest.name}"`,
                url: `https://mappersguild.com/quests`,
                icon_url: `https://a.ppy.sh/${quest.currentParty.leader.osuId}`,
            },
            color: '3138274',
            thumbnail: {
                url: `https://assets.ppy.sh/artists/${quest.art}/cover.jpg`
            },
            fields: [{
                name: "Members",
                value: memberList
            }]
        }]);

        //quest changes
        await parties.service.remove(quest.currentParty.id);
        await quests.service.update(quest._id, {
            status: "done",
            currentParty: null,
            completedMembers: quest.currentParty.members,
            completed: new Date()
        });
        
        quest = await quests.service.query({_id: req.params.id}, questPopulate);
        res.json(quest);

        logs.service.create(req.session.mongoId, `marked quest "${quest.name}" as complete`, req.params.id, 'quest' );            
    }
});

/* POST duplicate quest */
router.post('/duplicateQuest/:id', api.isSuperAdmin, async (req, res) => {
    let q = await quests.service.query({_id: req.params.id});
    let body = {name: req.body.name,
                reward: q.reward,
                descriptionMain: q.descriptionMain,
                timeframe: q.timeframe,
                minParty: q.minParty,
                maxParty: q.maxParty,
                minRank: q.minRank,
                art: q.art,
                color: q.color,
                modes: ['osu', 'taiko', 'catch', 'mania']}
    let newQuest = await quests.service.create(body);
    res.json(newQuest);
});

/* POST reset quest deadline */
router.post('/resetQuestDeadline/:id', api.isSuperAdmin, async (req, res) => {
    let date = new Date();
    date.setDate(date.getDate() + 7);
    await quests.service.update(req.params.id, {deadline: date});
    let quest = await quests.service.query({_id: req.params.id});
    res.json(quest);
});

/* POST toggle quest mode */
router.post('/toggleQuestMode/:id', api.isSuperAdmin, async (req, res) => {
    let quest = await quests.service.query({ _id: req.params.id });
    if(quest.modes.includes(req.body.mode)){
        await quests.service.update(req.params.id, { $pull: { modes: req.body.mode } });
    }else{
        await quests.service.update(req.params.id, { $push: { modes: req.body.mode } });
    }
    quest = await quests.service.query({_id: req.params.id});
    res.json(quest);
});

/* POST delete quest */
router.post('/deleteQuest/:id', api.isSuperAdmin, async (req, res) => {
    let q = await quests.service.query({_id: req.params.id});
    if(q.status == "open"){
        await quests.service.remove(req.params.id);
        res.json(q);
        
        logs.service.create(req.session.mongoId, `deleted quest "${q.name}"`, req.params.id, 'quest' );
    }else{
        res.json({})
    }
});

/* GET users */
router.get('/loadUsers/', async (req, res) => {
    let u = await users.service.query({}, {}, {username: 1}, true);
    res.json({u});
});

/* POST update user penatly points */
router.post('/updatePenaltyPoints/:id', api.isSuperAdmin, async (req, res) => {
    await users.service.update(req.params.id, {penaltyPoints: req.body.penaltyPoints});
    let user = await users.service.query({_id: req.params.id});
    res.json(user);

    logs.service.create(req.session.mongoId, `edited penalty points of "${user.username}" to ${req.body.penaltyPoints}`, req.params.id, 'user' );
});

/* POST update user badge */
router.post('/updateBadge/:id', api.isSuperAdmin, async (req, res) => {
    await users.service.update(req.params.id, {badge: req.body.badge});
    let user = await users.service.query({_id: req.params.id});
    res.json(user);
});

/* POST update user points */
router.post('/updateUserPoints', api.isSuperAdmin, async (req, res) => {
    let u = await users.service.query({}, {}, null, true);

    const populate = [
        { populate: 'host',  display: '_id osuId username' },
        { populate: 'modders',  display: '_id osuId username' },
        { populate: 'quest',  display: '_id name status reward completed deadline' },
        { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
    ];
    let maps = await beatmaps.service.query({status: "Ranked"}, populate, null, true);
    
    u.forEach(user => {
        let pointsObject = {
            "Easy":{"num":5, "total":0}, 
            "Normal":{"num":6, "total":0}, 
            "Hard":{"num":7, "total":0}, 
            "Insane":{"num":8, "total":0}, 
            "Expert":{"num":8, "total":0}, 
            "Storyboard":{"num":10, "total":0}, 
            "Mod":{"num":1, "total":0}, 
            "Host":{"num":5, "total":0},
            "QuestReward":{"num":0, "total":0},
            "Rank":{"value":0},
            "osu":{"total":0},
            "taiko":{"total":0},
            "catch":{"total":0},
            "mania":{"total":0},
            "Quests":{"list":[]}};

        maps.forEach(map => {
            let questParticipation = false;
            let length;

            if(map.length <= 90){
                length = map.length
            }else if (map.length <= 150){
                length = ((map.length - 90)/2) + 90;
            }else if (map.length <= 210){
                length = ((map.length - 150)/3) + 120;
            }else if (map.length <= 270){
                length = ((map.length - 210)/4) + 140;
            }else{
                length = ((map.length - 270)/5) + 155;
            }
            
            let lengthNerf = 124.666; //130=3:00, 120=2:30, 124.666=median of all ranked mg maps (2:43)

            
            //task points
            map.tasks.forEach(task => {
                task.mappers.forEach(mapper => {
                    if(mapper._id.toString() == user._id.toString()){
                        if(task.name != "Storyboard"){
                            let questBonus = 0;
                            if(map.quest){
                                questBonus = 2;
                                questBonus *= (length/lengthNerf);
                                questParticipation = true;
                            }
                            let taskPoints = pointsObject[task.name]["num"];
                            taskPoints *= (length/lengthNerf);
                            pointsObject[task.name]["total"] += (taskPoints + questBonus) / task.mappers.length;
                            pointsObject[task.mode]["total"] += (taskPoints + questBonus) / task.mappers.length;
                        }else{
                            if(task.sbQuality){
                                if(task.sbQuality == 2){
                                    pointsObject[task.name]["total"] += 7.5 / task.mappers.length;
                                }else{
                                    pointsObject[task.name]["total"] += (task.sbQuality*task.sbQuality + 1) / task.mappers.length; //sb worth 2 or 10
                                }
                                
                            }
                            
                        }

                    }
                });
            });

            //mod points
            map.modders.forEach(modder => {
                if(modder.id == user.id){
                    pointsObject["Mod"]["total"] += pointsObject["Mod"]["num"];
                }
            });

            //host points
            let host = map.host.id == user.id;
            if(host){
                pointsObject["Host"]["total"] += pointsObject["Host"]["num"];
            }

            //quest reward points
            if(questParticipation){
                if(pointsObject["Quests"]["list"].indexOf(map.quest._id) < 0 && map.quest.status=="done"){
                    pointsObject["Quests"]["list"].push(map.quest._id);
                    if(map.quest.deadline - map.quest.completed > 0){
                        pointsObject["QuestReward"]["total"] += map.quest.reward;
                    }
                }
            }


        });
        //set rank
        let totalPoints = pointsObject["Easy"]["total"] + 
            pointsObject["Normal"]["total"] + 
            pointsObject["Hard"]["total"] + 
            pointsObject["Insane"]["total"] + 
            pointsObject["Expert"]["total"] + 
            pointsObject["Storyboard"]["total"] + 
            pointsObject["Mod"]["total"] + 
            pointsObject["Host"]["total"] + 
            pointsObject["QuestReward"]["total"] + 
            user.legacyPoints - user.penaltyPoints;
        if(totalPoints < 100){
            pointsObject["Rank"]["value"] = 0;
        }else if(totalPoints < 250){
            pointsObject["Rank"]["value"] = 1;
        }else if(totalPoints < 500){
            pointsObject["Rank"]["value"] = 2;
        }else{
            pointsObject["Rank"]["value"] = 3;
        }

        users.service.update(user._id, {
            easyPoints: pointsObject["Easy"]["total"],
            normalPoints: pointsObject["Normal"]["total"],
            hardPoints: pointsObject["Hard"]["total"],
            insanePoints: pointsObject["Insane"]["total"],
            expertPoints: pointsObject["Expert"]["total"],
            storyboardPoints: pointsObject["Storyboard"]["total"],
            modPoints: pointsObject["Mod"]["total"],
            hostPoints: pointsObject["Host"]["total"],
            questPoints: pointsObject["QuestReward"]["total"],
            rank: pointsObject["Rank"]["value"],
            osuPoints: pointsObject["osu"]["total"],
            taikoPoints: pointsObject["taiko"]["total"],
            catchPoints: pointsObject["catch"]["total"],
            maniaPoints: pointsObject["mania"]["total"],
            completedQuests: pointsObject["Quests"]["list"]
        });
    });
    res.json("user points updated");
});

/* GET featured artists */
router.get('/loadFeaturedArtists/', async (req, res) => {
    let fa = await featuredArtists.service.query({}, artistPopulate, {osuId: 1, label: 1}, true);
    res.json({fa});
});

/* POST update artist osuId */
router.post('/updateFeaturedArtistOsuId/:id', api.isSuperAdmin, async (req, res) => {
    let fa = await featuredArtists.service.update(req.params.id, {osuId: req.body.osuId});
    fa = await featuredArtists.service.query({_id: req.params.id}, artistPopulate)
    res.json(fa);
});

/* POST update artist name */
router.post('/updateFeaturedArtistName/:id', api.isSuperAdmin, async (req, res) => {
    let fa = await featuredArtists.service.update(req.params.id, {label: req.body.name});
    fa = await featuredArtists.service.query({_id: req.params.id}, artistPopulate)
    res.json(fa);
});

/* POST add song to artist */
router.post('/addSong/:id', api.isSuperAdmin, async (req, res) => {
    let song = await featuredArtists.service.createSong(req.body.artist.trim(), req.body.title.trim());
    let fa = await featuredArtists.service.update(req.params.id, { $push: { songs: song } })
    fa = await featuredArtists.service.query({_id: req.params.id}, artistPopulate);
    res.json(fa);
});

/* POST edit metadata */
router.post('/editSong/:id', api.isSuperAdmin, async (req, res) => {
    await featuredArtists.service.updateSong(req.body.songId, {artist: req.body.artist.trim(), title: req.body.title.trim()});
    let fa = await featuredArtists.service.query({_id: req.params.id}, artistPopulate);
    res.json(fa);
});

/* POST remove song from artist */
router.post('/deleteSong/:id', api.isSuperAdmin, async (req, res) => {
    await featuredArtists.service.update(req.params.id, { $pull: {songs: req.body.songId} });
    await featuredArtists.service.removeSong(req.body.songId);
    let fa = await featuredArtists.service.query({_id: req.params.id}, artistPopulate);
    res.json(fa);
});

/* GET errors */
router.get('/loadErrors/', async (req, res) => {
    let e = await logs.service.query(
        { category: 'error' }, 
        [{ populate: 'user', display: 'username' }], 
        { createdAt: -1 }, 
        true,
        100
    );
    res.json({e});
});


module.exports = router;
