/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('../../config.json');
const Mongoose = require('mongoose');

async function run() {
    await Mongoose.connect(config.connection);
    console.log('ok');

    const db = Mongoose.connection.db;

    const locusExists = (await db.listCollections({ name: 'locusinfos' }).toArray()).length > 0;
    const teamExists = (await db.listCollections({ name: 'teaminfos' }).toArray()).length > 0;

    if (locusExists) {
        if (teamExists) {
            await db.collection('teaminfos').drop();
            console.log('killed teaminfos');
        }

        await db.collection('locusinfos').rename('teaminfos');
        console.log('locusinfos -> teaminfos');
    } else {
        console.log('skipped rename');
    }

    const result = await db.collection('teaminfos').updateMany(
        { contest: { $exists: false } },
        { $set: { contest: 'locus2025' } }
    );
    console.log(`updated ${result.modifiedCount} - contest: "locus2025"`);

    process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });
