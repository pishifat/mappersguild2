var express = require('express');
var parties = require('../models/party.js');
var quests = require('../models/quest.js');
var users = require('../models/user.js');
var logs = require('../models/log.js');
var api = require('../models/api.js');

var router = express.Router();

router.use(api.isLoggedIn);

const defaultPopulate = [
    { populate: 'members',  display: 'username osuId rank' },
    { populate: 'currentQuest',  display: 'name' },
    { populate: 'leader',  display: 'username osuId' },
];

/* GET parties page. */
router.get('/', async (req, res, next) => {
    res.render('parties', { title: 'Parties', script: '../javascripts/parties.js', isParties: true, loggedInAs: req.session.username });
  });

router.get("/parties", async (req, res, next) => {
    res.json(await parties.service.query({}, defaultPopulate, {}, true));
});

/* GET current user's quest or null. */
router.get('/currentParty', async (req, res) => {
    let user = await users.service.query({osuId: req.session.osuId});
    if(user){
        let userParty = await parties.service.query({_id: user.currentParty});
        
        if (userParty) {
            res.json({ party: userParty._id, user: req.session.osuId });
        } else{
            res.json({ party: undefined, user: req.session.osuId })
        }
    }else{
        res.json({});
    }
});

/* POST new party. */
router.post('/create', async (req, res) => {
    let duplicate = await parties.service.query({name: req.body.name});
    if(duplicate){
        return res.json({ error: 'Party name is already in use!' });
    }

    let user = await users.service.query({osuId: req.session.osuId});
    let isMember = await parties.service.query({ 'members': user });
    if(isMember){
        return res.json({ error: 'Leave your current party before creating a new one!'});
    }

    const party = await parties.service.create(req.body.name, user);
    if(party){
        await users.service.update(user._id, {currentParty: party._id});
        res.json(await parties.service.query({_id: party._id}, defaultPopulate));
    }

    logs.service.create(req.session.osuId, `created party "${party.name}"`, party._id, 'party' );
});

/* POST join party. */
router.post('/join', async (req, res) => {
    const [party, user] = await Promise.all([
        parties.service.query({_id: req.body.partyId}),
        users.service.query({osuId: req.session.osuId}),
    ]);
    const isMember = await parties.service.query({ 'members': user });

    if (party && !isMember && user && !party.lock && !party.currentQuest && party.members.length < 12) {
        await Promise.all([
            parties.service.update(req.body.partyId, { $push: { members: user } }),
            users.service.update(user._id, { currentParty: party._id })
        ]);
        res.json(await parties.service.query({_id: req.body.partyId}, defaultPopulate));
    } else {
        return res.json({ error: 'Party is locked! or something' });
    }

    logs.service.create(req.session.osuId, `joined party "${party.name}"`, party._id, 'party' );
});

/* POST leave party. */
router.post('/leave', async (req, res) => {
    const [user, party] = await Promise.all([
        users.service.query({osuId: req.session.osuId}),
        parties.service.query({_id: req.body.partyId})
    ]);
    
    const isLeader = await parties.service.query({leader: user._id});
    
    if (isLeader || !party || !user) {
        return res.json({ error: "Something went wrong!" });
    }

    if(party.currentQuest){
        const quest = await quests.service.query({_id: party.currentQuest});
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
        }else{
            let penalty = (user.penaltyPoints + quest.reward);
            await users.service.update(user._id, {penaltyPoints: penalty});
        }
    }
    await Promise.all([
        parties.service.update(party._id, {$pull: {members: user._id}}),
        users.service.update(user._id, {currentParty: undefined})
    ]);    
    
    res.json(await parties.service.query({ _id: party._id }, defaultPopulate));
    
    logs.service.create(req.session.osuId, `left party "${party.name}"`, party._id, 'party' );
});

/* POST delete party. */
router.post('/delete', async (req, res) => {
    const user = await users.service.query({osuId: req.session.osuId});
    const party = await parties.service.query({leader: user._id});

    if (party && user) {
        if (party.currentQuest) {
            await Promise.all([
                quests.service.update(party.currentQuest, {assignedParty: undefined}),
                quests.service.update(party.currentQuest, {status: "open"})
            ]);
        }
        await users.service.update(user._id, {currentParty: undefined});

        const success = await parties.service.remove(party._id);
        if (success.error) {
            return res.json({ error: "Something went wrong" });
        }else{
            res.json(success);
        }
    
        logs.service.create(req.session.osuId, `deleted party "${party.name}"`, party._id, 'party' );
    }
});

/* POST kick member. */
router.post('/kick', async (req, res) => {    
    const [leader, user] = await Promise.all([
        users.service.query({osuId: req.session.osuId}),
        users.service.query({_id: req.body.user})
    ]);
    console.log(user);
    
    
    if (!leader || !user || leader.error || user.error) {
        return res.json({error: "Something went wrong!"});
    }

    if (leader._id.toString() == user._id.toString()) {
        return res.json({error: "You cannot kick yourself!"});
    }

    const party = await parties.service.query({leader: leader._id});
    if (party && leader._id.toString() != party.leader.toString()) {
        return res.json({error: "You're not the leader of this party!"});
    }

    if (user && leader && party) {
        if(party.currentQuest){
            const quest = await quests.service.query({_id: party.currentQuest});
            if(quest.minParty == party.members.length){
                await Promise.all([
                    quests.service.update(quest._id, {assignedParty: undefined}),
                    quests.service.update(quest._id, {status: "open"}),
                    parties.service.update(party._id, {currentQuest: undefined}),
                ]);
            }
        }
        
        await Promise.all([
            parties.service.update(party._id, {$pull: {members: user._id}}),
            users.service.update(user._id, {currentParty: undefined})
        ]);
        
        res.json(await parties.service.query({ _id: party._id }, defaultPopulate));
        
        logs.service.create(req.session.osuId, `kicked "${user.username}" from party "${party.name}"`, party._id, 'party' );
    }
});

/* POST transfer party leadership. */
router.post('/transferLeader', async (req, res) => {
    const [leader, newLeader] = await Promise.all([
        users.service.query({osuId: req.session.osuId}),
        users.service.query({_id: req.body.user})
    ]);

    const party = await parties.service.query({leader: leader._id});

    if (leader._id.toString() == newLeader._id.toString()) {
        return res.json({error: "You can't transfer to yourself!"})
    }

    if (leader && party && newLeader) {
        await parties.service.update(party._id, {leader: newLeader._id});
        res.json(await parties.service.query({ _id: party._id }, defaultPopulate));
        logs.service.create(req.session.osuId, `transferred party leader to "${newLeader.username}" in party "${party.name}"`, party._id, 'party' );
    }
});

/* POST new name for party */
router.post('/rename', async (req, res) => {
    let duplicate = await parties.service.query({name: req.body.newName});
    if(duplicate){
        return res.json({error: "That name is already taken!"})
    }
    let user = await users.service.query({osuId: req.session.osuId});
    let party = await parties.service.query({leader: user._id});
    
    if(user && party){
        await parties.service.update(party._id, {name: req.body.newName});
        res.json(await parties.service.query({ _id: party._id }, defaultPopulate));
        logs.service.create(req.session.osuId, `renamed party from "${party.name}" to "${req.body.newName}"`, party._id, 'party' );
    } else {
        return res.json({error: "Something went wrong!"})
    }
});

/* POST switch party lock */
router.post('/switchLock', async (req, res) => {
    let user = await users.service.query({osuId: req.session.osuId});
    let party = await parties.service.query({leader: user._id});
    if (party) {
        await parties.service.update(party._id, {lock: !party.lock});
        res.json(await parties.service.query({ _id: party._id }, defaultPopulate));
        logs.service.create(req.session.osuId, `${party.lock ? "unlocked" : "locked"} admissions to party "${party.name}"`, party._id, 'party' );
    }
});

/* POST add banner */
router.post('/addBanner', async (req, res) => {
    let user = await users.service.query({osuId: req.session.osuId});
    let party = await parties.service.query({leader: user._id});
    if (party) {
        await parties.service.update(party._id, {art: req.body.banner});
        res.json(await parties.service.query({ _id: party._id }, defaultPopulate));        
        logs.service.create(req.session.osuId, `added banner on party "${party.name}"`, party._id, 'party' );
    }
});

/* GET parties with sorting. */
router.get("/:sort", async (req, res, next) => {
    const populate = [
        { populate: 'members',  display: 'username osuId rank' },
        { populate: 'currentQuest',  display: 'name' },
        { populate: 'leader',  display: 'username osuId' },
    ];
    const sortBy = req.params.sort;
    res.json(await parties.service.query({}, populate, sortBy, true));
  });

module.exports = router;
