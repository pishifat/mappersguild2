/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('../config.json');
const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient(config.connection, { useNewUrlParser: true });

client.connect(async function (error, client) {
    if (error) console.log(error);
    console.log('pass');
    const db = client.db();
    const questCollection = db.collection('quests');
    const partyCollection = db.collection('parties');
    const userCollection = db.collection('users');
    const allQuests = await questCollection.find({}).toArray();
    console.log(allQuests.length);

    for (const quest of allQuests) {
        console.log(quest._id);

        if (quest.status == 'open') {
            const parties = await partyCollection.find({ _id: quest.currentParty }).toArray();

            for (const party of parties) {
                party.quest = quest._id;

                await partyCollection.replaceOne({
                    _id: party._id,
                }, party);
            }
        } else if (quest.status == 'wip') {
            const party = await partyCollection.findOne({ _id: quest.currentParty });
            party.quest = quest._id;

            await partyCollection.replaceOne({
                _id: party._id,
            }, party);
        } else if (quest.status == 'done') {
            const users = await userCollection.find({ _id: { $in: quest.completedMembers } }).toArray();
            const rankSum = users.reduce((acc, m) => acc + m.rank, 0);
            const rank = Math.round(rankSum / users.length);
            await partyCollection.insertOne({
                leader: quest.completedMembers[0],
                members: quest.completedMembers,
                lock: true,
                rank,
                modes: quest.modes,
                quest: quest._id,
            });
        }

        delete quest.parties;
        delete quest.currentParty;
        delete quest.completedMembers;

        await questCollection.replaceOne({
            _id: quest._id,
        }, quest);
    }

    process.exit();
});