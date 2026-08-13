/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('../../config.json');
const Mongoose = require('mongoose');

const { userRoles } = require('./momentum-starter-roles.json');

async function run() {
    await Mongoose.connect(config.connection);
    console.log('ok');

    const db = Mongoose.connection.db;

    for (const entry of userRoles) {
        await db.collection('users').updateOne(
            { osuId: entry.osuId },
            { $set: { momentumStarterRole: entry.role } }
        );
    }

    console.log(`set momentumStarterRole on ${userRoles.length} users`);

    process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });
