/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('../../config.json');
const Mongoose = require('mongoose');

// 69b4f0530ff92c44ae66009d / 69b4f07b0ff92c44ae6600a2 / 69b4f0940ff92c44ae6600a6 / 69b4f0a80ff92c44ae6600aa / 69b4f0bb0ff92c44ae6600ae / some Classified manual inserts
const { springWinners: winners } = require('./momentum-starter-roles.json');

// skip 'insider' for reasons
const starterRoles = ['duplicator', 'overachiever', 'explorer', 'worshipper', 'trader', 'hunter', 'necromancer', 'provider'];

function randomStarterRole() {
    return starterRoles[Math.floor(Math.random() * starterRoles.length)];
}

async function run() {
    await Mongoose.connect(config.connection);
    console.log('ok');

    const db = Mongoose.connection.db;

    let updated = 0;
    let skipped = 0;

    for (const winner of winners) {
        const result = await db.collection('users').updateOne(
            { osuId: winner.osuId, momentumStarterRole: { $exists: false } },
            { $set: { momentumStarterRole: randomStarterRole() } }
        );

        if (result.modifiedCount) {
            updated++;
        } else {
            skipped++;
        }
    }

    console.log(`set momentumStarterRole on ${updated} users (${skipped} already had a role, skipped)`);

    process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });
