var express = require('express');
var quests = require('../models/quest.js');
var logs = require('../models/log.js');
var parties = require('../models/party.js');
var beatmaps = require('../models/beatmap.js');
var users = require('../models/user.js');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'assignedParty',  display: 'name' },
    { populate: 'completedMembers',  display: 'username' },
    { innerPopulate: 'associatedMaps',  populate: { path: 'song host' } }
];

/* GET quests page. */
router.get('/', async (req, res, next) => {
    res.render('quests', { title: 'Quests', script: '../javascripts/quests.js', isQuests: true, loggedInAs: req.session.username });
});

router.get("/quests", async (req, res, next) => {
    res.json(
        {openQuests: await quests.service.query({status: "open"}, defaultPopulate, {}, true), 
        wipQuests: await quests.service.query({status: "wip"}, defaultPopulate, {}, true)}, 
    );
});

/* GET quest for extended view. */
router.get("/quest/:id", async (req, res, next) => {
    res.json(await quests.service.query({_id: req.params.id}, defaultPopulate));
  });

/* GET current user's quest or null. */
router.get('/currentQuest', async (req, res) => {
    let user = await users.service.query({osuId: req.session.osuId});
    let securedUserParty = await parties.service.query({leader: user._id});
    if (securedUserParty) {
        res.json({ quest: securedUserParty.currentQuest, rank: securedUserParty.rank, members: securedUserParty.members, name: securedUserParty.name});
    } else{
        res.json({ quest: "undefined", rank: 0 , members: []})
    }
});

/* POST accepts quest. */
router.post('/acceptQuest/:id', async (req, res) => {
    let user = await users.service.query({osuId: req.session.osuId});
    let party = await parties.service.query({leader: user._id});
    if (party) {
        
        let quest = await quests.service.query({_id: req.params.id});
        if(party.members.length >= quest.minParty 
        && party.members.length <= quest.maxParty 
        && party.currentQuest == undefined
        && party.rank >= quest.minRank){
            await quests.service.update(quest._id, {accepted: new Date().getTime()});
            await quests.service.update(quest._id, {deadline: new Date().getTime() + quest.timeframe});
            await quests.service.update(quest._id, {status: "wip"});
            await parties.service.update(party._id, {currentQuest: quest._id});
            
            res.json(await quests.service.query({_id: quest._id}, defaultPopulate));

            logs.service.create(req.session.osuId, `party "${party.name}" accepted quest "${quest.name}"`, quest._id, 'quest' );
        }
    }
});

/* POST drops party's quest. */
router.post('/dropQuest/:id', async (req, res) => {
    let user = await users.service.query({osuId: req.session.osuId});
    let party = await parties.service.query({leader: user._id});
    if (party) {
        let quest = await quests.service.query({_id: req.params.id});
        if(quest.exclusive){
            await quests.service.update(req.params.id, {status: "hidden"});
        }else{
            await quests.service.update(req.params.id, {status: "open"});
        }
        await parties.service.update(party._id, {currentQuest: undefined});

        const populate = [{ populate: 'assignedParty',  display: 'name' },];
        res.json(await quests.service.query({_id: req.params.id}, populate));

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

        logs.service.create(req.session.osuId, `party "${party.name}" dropped quest "${quest.name}"`, quest._id, 'quest' );
        
    }
});

module.exports = router;
