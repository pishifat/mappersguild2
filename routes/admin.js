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
router.use(async (req, res, next) => {
    if (!req.session.osuId) {
        res.status(403).render('error', { message: 'unauthorized' });
    } else {
        const user = await users.service.query({ osuId: req.session.osuId });

        if (user && user.group === 'admin') {
            return next();
        }

        res.status(403).render('error', { message: 'unauthorized' });
    }
});

const defaultMapPopulate = [
    { populate: 'host',  display: '_id osuId username' },
    { populate: 'bns',  display: '_id osuId username' },
    { populate: 'modders',  display: '_id osuId username' },
    { populate: 'quest',  display: '_id name' },
    { populate: 'song',  display: 'artist title' },
    { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
];
const defaultMapSort = {status: -1};

const defaultPartyPopulate = [
    { populate: 'leader',  display: 'username osuId' },
    { populate: 'members',  display: 'username' }
];

const defaultUserPopulate = [
    { populate: 'currentParty',  display: 'name' },
    { populate: 'completedQuests',  display: 'name' },
];

const defaultArtistPopulate = [
        { populate: 'songs',  display: 'artist title' }
];

/* GET admin page */
router.get('/', async (req, res, next) => {
    if(req.session.osuId == 3178418 || req.session.osuId == 1052994){
        

        res.render('admins', { 
            title: 'Admin', 
            script: '../javascripts/admin.js', 
            loggedInAs: req.session.username });
    }
});

/* GET relevant info for page load */
router.get('/relevantInfo/', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {

        const [b, q, p, u, fa] = await Promise.all([
            beatmaps.service.query({}, defaultMapPopulate, defaultMapSort, true), 
            quests.service.query({}, {}, {name: 1}, true), 
            parties.service.query({}, defaultPartyPopulate, {name: 1}, true), 
            users.service.query({}, defaultUserPopulate, {username: 1}, true), 
            featuredArtists.service.query({}, defaultArtistPopulate, {artist: 1}, true), 
        ]);
    
        res.json({b: b, q: q, p: p, u: u, fa: fa});   
    }
});

//beatmap

/* POST update map status */
router.post('/updateMapStatus/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let b = await beatmaps.service.update(req.params.id, {status: req.body.status});
        if(req.body.status == "Done"){
            for (let i = 0; i < b.tasks.length; i++) {
                await tasks.service.update(b.tasks[i], {status: "Done"});
            }
        }
        b = await beatmaps.service.query({_id: req.params.id}, defaultMapPopulate);
        res.json(b);
        
        logs.service.create(req.session.osuId, `set status of "${b.song.artist} - ${b.song.title}" to "${req.body.status}"`, req.params.id, 'beatmap' );
    }
});

/* POST remove diff */
router.post('/removeDiff/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let t = await tasks.service.query({_id: req.body.taskId});
        let b = await beatmaps.service.update(req.params.id, { $pull: { tasks: req.body.taskId } });
        
        await tasks.service.remove(req.body.taskId);

        b = await beatmaps.service.query({ _id: req.params.id }, defaultMapPopulate);
        res.json(b);
        
        logs.service.create(req.session.osuId, `removed "${t.name}" from "${b.song.artist} - ${b.song.title}"`, req.body.id, 'beatmap' );
    }
});

/* POST remove modder */
router.post('/removeModder/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let u = await users.service.query({_id: req.body.userId});
        let b = await beatmaps.service.update(req.params.id, { $pull: { modders: req.body.userId } });

        b = await beatmaps.service.query({_id: req.params.id}, defaultMapPopulate);
        res.json(b);
        
        logs.service.create(req.session.osuId, `removed "${u.username}" from modders on "${b.song.artist} - ${b.song.title}"`, req.body.id, 'beatmap' );
    }
});


/* POST remove BN */
router.post('/removeNominator/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let u = await users.service.query({_id: req.body.userId});
        let b = await beatmaps.service.update(req.params.id, { $pull: { bns: req.body.userId } });

        b = await beatmaps.service.query({_id: req.params.id}, defaultMapPopulate);
        res.json(b);
        
        logs.service.create(req.session.osuId, `removed "${u.username}" from Nominators on "${b.song.artist} - ${b.song.title}"`, req.body.id, 'beatmap' );
    }
});

/* POST update map url */
router.post('/updateMapUrl/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let b = await beatmaps.service.update(req.params.id, {url: req.body.link});
        b = await beatmaps.service.query({_id: req.params.id}, defaultMapPopulate);
        res.json(b);
        
        logs.service.create(req.session.osuId, `updated link on "${b.song.artist} - ${b.song.title}"`, req.body.id, 'beatmap' );
    }
});

/* POST delete beatmap */
router.post('/deleteMap/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let b = await beatmaps.service.query({_id: req.params.id}, defaultMapPopulate);
        await beatmaps.service.remove(req.params.id);
        
        res.json(`deleted "${b.song.artist} - ${b.song.title}"`);
        
        logs.service.create(req.session.osuId, `deleted "${b.song.artist} - ${b.song.title}"`, req.params.id, 'beatmap' );
    }
});


//quest

/* POST new quest */
router.post('/createQuest', async (req, res) => {
    if(req.session.osuId == 3178418 || req.session.osuId == 1052994){
        var quest = await quests.service.create(req.body);
        if (quest) {
            logs.service.create(req.session.osuId, `created quest ${quest.name}`, quest._id, 'quest' );
            res.send(quest);
        }
    }
});



/* POST force drop quest */
router.post('/forceDropQuest/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let party = await parties.service.query({currentQuest: req.params.id});
        let quest = await quests.service.query({_id: req.params.id});
        if(quest.status == "wip"){
            if(quest.exclusive){
                await quests.service.update(req.params.id, {status: "hidden"});
            }else{
                await quests.service.update(req.params.id, {status: "open"});
            }
        }
        await parties.service.update(party._id, {currentQuest: undefined});

        for (let i = 0; i < party.members.length; i++) {
            let member = await users.service.query({_id: party.members[i]});
            await users.service.update(party.members[i]._id, {penaltyPoints: (member.penaltyPoints + quest.reward)});
        }

        let maps = await beatmaps.service.query({}, {}, {}, true);
        for (let i = 0; i < maps.length; i++) {
            if(maps[i].quest && maps[i].quest.toString() == quest._id.toString()){
                beatmaps.service.update(maps[i]._id, {quest: undefined});
            }
        }
        quest = await quests.service.query({_id: req.params.id});
        logs.service.create(req.session.osuId, `forced party "${party.name}" to drop quest "${quest.name}"`, req.params.id, 'quest' );
        
        res.json(quest);
    }
});

/* POST mark quest as complete */
router.post('/completeQuest/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let party = await parties.service.query({currentQuest: req.params.id});
        let quest = await quests.service.query({_id: req.params.id});
        if(quest.status == "wip"){
            await quests.service.update(quest._id, {status: "done"});
            await quests.service.update(quest._id, {completedMembers: party.members});
            await quests.service.update(quest._id, {completed: new Date()});
            await parties.service.update(party._id, {currentQuest: undefined});
            
            logs.service.create(req.session.osuId, `marked quest "${quest.name}" as complete`, req.params.id, 'quest' );
            quest = await quests.service.query({_id: req.params.id});
            res.json(quest);
        }
    }
});

/* POST hide open quest */
router.post('/hideQuest/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        await quests.service.update(req.params.id, {status: "hidden"});
        let quest = await quests.service.query({_id: req.params.id});
        res.json(quest);
        
        logs.service.create(req.session.osuId, `hid a quest`, req.params.id, 'quest' );
    }
});

/* POST unhide quest */
router.post('/unhideQuest/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        await quests.service.update(req.params.id, {status: "open"});
        let quest = await quests.service.query({_id: req.params.id});
        res.json(quest);
        
        logs.service.create(req.session.osuId, `opened a quest`, req.params.id, 'quest' );
    }
});

/* POST delete quest */
router.post('/deleteQuest/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let q = await quests.service.query({_id: req.params.id});
        if(q.status == "open"){
            await quests.service.remove(req.params.id);
            res.json("deleted quest");
            
            logs.service.create(req.session.osuId, `deleted a quest`, req.params.id, 'quest' );
        }else{
            res.json({})
        }
    }
});


//party

/* POST update party ranks */
router.post('/updatePartyRanks', async (req, res) => {
    if(req.session.osuId == 3178418 || req.session.osuId == 1052994){
        const populate = [{ populate: 'members',  display: 'rank' }];
        let p = await parties.service.query({}, populate, {}, true);
        for (let i = 0; i < p.length; i++) {
            var rank = 0;
            p[i].members.forEach(user => {
                rank+= user.rank;
            });
            await parties.service.update(p[i]._id, {rank: Math.round(rank / p[i].members.length)});
            
        }

        logs.service.create(req.session.osuId, `updated party ranks`, null, 'party' );
        res.json("party ranks updated");
        
    }
});


/* POST rename party */
router.post('/renameParty/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let p = await parties.service.update(req.params.id, {name: req.body.name});
        p = await parties.service.query({_id: req.params.id}, defaultPartyPopulate)

        logs.service.create(req.session.osuId, `renamed party from "${p.name}" to "${req.body.name}"`, req.params.id, 'party' );
        res.json(p);
    }
});

/* POST remove member from party */
router.post('/removeMember/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let party = await parties.service.query({_id: req.params.id}, defaultPartyPopulate);
        let user = await users.service.query({_id: req.body.userId});
        if(user._id.toString() == party.leader._id.toString()){
            return res.json(party);
        }

        if(party.currentQuest){
            const quest = await quests.service.query({_id: party.currentQuest});
            const questMaps = await beatmaps.service.query({quest: party.currentQuest}, [{ innerPopulate: 'tasks', populate: { path: 'mappers' } }], {}, true);
            
            if(quest.minParty == party.members.length){
                await Promise.all([
                    quests.service.update(quest._id, {assignedParty: undefined}),
                    quests.service.update(quest._id, {status: "open"}),
                    parties.service.update(party._id, {currentQuest: undefined})
                ]);
                if(quest.exclusive){
                    await quests.service.update(quest._id, {status: "hidden"});
                }
                for (let i = 0; i < party.members.length; i++) {
                    let u = await users.service.query({_id: party.members[i]._id});
                    let penalty = (u.penaltyPoints + quest.reward);
                    await users.service.update(u._id, {penaltyPoints: penalty});
                }
                questMaps.forEach(map => {
                    beatmaps.service.update(map._id, {quest: undefined}); 
                });
            }else{
                let penalty = (user.penaltyPoints + quest.reward);
                await users.service.update(user._id, {penaltyPoints: penalty});
                questMaps.forEach(map => {
                    let invalid = false;
                    map.tasks.forEach(task => {
                        task.mappers.forEach(mapper => {
                            if(mapper.id == user.id){
                                invalid = true;
                            }
                        });
                    });
                    if(invalid){
                        beatmaps.service.update(map._id, {quest: undefined});
                    }
                });
            }
        }
        await Promise.all([
            parties.service.update(party._id, {$pull: {members: user._id}}),
            users.service.update(user._id, {currentParty: undefined})
        ]);

        party = await parties.service.query({_id: req.params.id}, defaultPartyPopulate);

        logs.service.create(req.session.osuId, `removed "${user.username}" from party "${party.name}"`, req.params.id, 'party' );
        res.json(party);
    }
});

/* POST transfer leader of party */
router.post('/transferLeader/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let p = await parties.service.update(req.params.id, {leader: req.body.userId});
        p = await parties.service.query({_id: req.params.id}, defaultPartyPopulate)

        logs.service.create(req.session.osuId, `transferred leader of "${p.name}" to "${p.leader.username}"`, req.params.id, 'party' );
        res.json(p);
    }
});

/* POST edit party banner */
router.post('/editBanner/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let p = await parties.service.update(req.params.id, {art: req.body.banner});
        p = await parties.service.query({_id: req.params.id}, defaultPartyPopulate)

        logs.service.create(req.session.osuId, `edited banner of party "${p.name}"`, req.params.id, 'party' );
        res.json(p);
    }
});

/* POST delete party */
router.post('/deleteParty/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let party = await parties.service.query({_id: req.params.id});
        if(party.currentQuest){
            await quests.service.update(party.currentQuest, {assignedParty: undefined});
            await quests.service.update(party.currentQuest, {status: "open"});
        }

        party.members.forEach(member => {
            users.service.update(member._id, {currentParty: undefined});
        });
        
        await parties.service.remove(req.params.id);
        logs.service.create(req.session.osuId, `deleted party "${party.name}"`, req.params.id, 'party' );
        res.json("Party deleted");
    }
});




//user

/* POST update user group */
router.post('/updateUserGroup/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let user = await users.service.query({_id: req.params.id});
        let success = await users.service.update(req.params.id, {group: req.body.group});
        if(success){
            logs.service.create(req.session.osuId, `user group of "${user.username}" set to "${req.body.group}"`, req.params.id, 'user' );
            user = await users.service.query({_id: req.params.id}, defaultUserPopulate)
            res.json(user);
        } 
    }
});

/* POST update user penatly points */
router.post('/updatePenaltyPoints/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let user = await users.service.query({_id: req.params.id});
        let success = await users.service.update(req.params.id, {penaltyPoints: req.body.points});
        if(success){
            logs.service.create(req.session.osuId, `edited penalty points of "${user.username}" to ${req.body.points}`, req.params.id, 'user' );
            user = await users.service.query({_id: req.params.id}, defaultUserPopulate)
            res.json(user);
        } 
    }
});

/* POST update user points */
router.post('/updateUserPoints', async (req, res) => {
    if(req.session.osuId == 3178418 || req.session.osuId == 1052994){
        
        let u = await users.service.query({}, {}, null, true);

        const populate = [
            { populate: 'host',  display: '_id osuId username' },
            { populate: 'quest',  display: '_id name status reward completed deadline' },
            { innerPopulate: 'tasks',  populate: { path: 'mappers' } },
        ];
        let maps = await beatmaps.service.query({}, populate, null, true);

        u.forEach(user => {
            let pointsObject = {
                "Easy":{"num":5, "total":0}, 
                "Normal":{"num":6, "total":0}, 
                "Hard":{"num":7, "total":0}, 
                "Insane":{"num":8, "total":0}, 
                "Expert":{"num":8, "total":0}, 
                "Storyboard":{"num":10, "total":0}, 
                "Background":{"num":1, "total":0}, 
                "Skin":{"num":1, "total":0}, 
                "Mod":{"num":2.5, "total":0}, 
                "Host":{"num":5, "total":0},
                "QuestReward":{"num":0, "total":0},
                "Rank":{"value":0},
                "Quests":{"list":[]}};
    
            maps.forEach(map=>{
                let questParticipation = false;
    
                if(map.status == "Ranked"){ 
    
                   //task points
                    map.tasks.forEach(task => {
                        task.mappers.forEach(mapper => {
                            if(mapper._id.toString() == user._id.toString()){
                                let questBonus = 0;
                                if(map.quest){
                                    questBonus = 2;
                                    questParticipation = true;
                                }
                                pointsObject[task.name]["total"] += (pointsObject[task.name]["num"] + questBonus) / task.mappers.length;
                            }
                        });
                    });
    
                    //mod points
                    map.modders.forEach(modder => {
                        if(modder._id.toString() == user._id.toString()){
                        pointsObject["Mod"]["total"] += pointsObject["Mod"]["num"];
                        }
                    });
    
                    //host points
                    let host = map.host._id.toString() == user._id.toString();
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
                pointsObject["QuestReward"]["total"] - user.penaltyPoints;
            if(totalPoints < 100){
                pointsObject["Rank"]["value"] = 0;
            }else if(totalPoints < 250){
                pointsObject["Rank"]["value"] = 1;
            }else if(totalPoints < 500){
                pointsObject["Rank"]["value"] = 2;
            }else{
                pointsObject["Rank"]["value"] = 3;
            } 
            
            users.service.update(user._id, {easyPoints: pointsObject["Easy"]["total"]});
            users.service.update(user._id, {normalPoints: pointsObject["Normal"]["total"]});
            users.service.update(user._id, {hardPoints: pointsObject["Hard"]["total"]});
            users.service.update(user._id, {insanePoints: pointsObject["Insane"]["total"]});
            users.service.update(user._id, {expertPoints: pointsObject["Expert"]["total"]});
            users.service.update(user._id, {skinPoints: pointsObject["Skin"]["total"]});
            users.service.update(user._id, {modPoints: pointsObject["Mod"]["total"]});
            users.service.update(user._id, {hostPoints: pointsObject["Host"]["total"]});
            users.service.update(user._id, {questPoints: pointsObject["QuestReward"]["total"]});
            users.service.update(user._id, {rank: pointsObject["Rank"]["value"]});
            users.service.update(user._id, {completedQuests: pointsObject["Quests"]["list"]});
        });
        res.json("user points updated")
    }
});

//featured artists

/* POST add artist to db */
router.post('/addArtist/:label', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let fa = await featuredArtists.service.createArtist(req.params.label, req.body.osuId);

        res.json(`${fa.label} added`);

        logs.service.create(req.session.osuId, `added "${fa.label}" to the Featured Artist database`, fa._id, 'artist' );
    }
});

/* POST rename artist */
router.post('/renameLabel/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let fa = await featuredArtists.service.update(req.params.id, {label: req.body.name});
        fa = await featuredArtists.service.query({_id: req.params.id}, defaultArtistPopulate)

        res.json(fa);
        logs.service.create(req.session.osuId, `renamed a featured artist`, fa._id, 'artist' );
    }
});

/* POST add song to artist */
router.post('/addSong/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        let song = await featuredArtists.service.createSong(req.body.artist, req.body.title);
        let fa = await featuredArtists.service.update(req.params.id, { $push: { songs: song } })
        fa = await featuredArtists.service.query({_id: req.params.id}, defaultArtistPopulate);

        res.json(fa);
        logs.service.create(req.session.osuId, `added "${req.body.artist} - ${req.body.title}" to the Featured Artist songs database`, fa._id, 'artist' );
    }
});

/* POST remove song from artist */
router.post('/removeSong/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        await featuredArtists.service.update(req.params.id, { $pull: {songs: req.body.songId} });
        await featuredArtists.service.removeSong(req.body.songId);
        let fa = await featuredArtists.service.query({_id: req.params.id}, defaultArtistPopulate);
        res.json(fa);

        logs.service.create(req.session.osuId, `removed a song from the Featured Artist database`, fa._id, 'artist' );
    }
});

/* POST edit metadata */
router.post('/updateMetadata/:id', async (req, res) => {
    if (req.session.osuId == 3178418 || req.session.osuId == 1052994) {
        await featuredArtists.service.updateSong(req.body.songId, {artist: req.body.artist});
        await featuredArtists.service.updateSong(req.body.songId, {title: req.body.title});
       
        let fa = await featuredArtists.service.query({_id: req.params.id}, defaultArtistPopulate);
        res.json(fa);

        logs.service.create(req.session.osuId, `edited a song's metadata`, fa._id, 'artist' );
    }
});

module.exports = router;
