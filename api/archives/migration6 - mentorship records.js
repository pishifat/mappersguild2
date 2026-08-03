/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('../../config.json');
const Mongoose = require('mongoose');

async function run() {
    await Mongoose.connect(config.connection);
    console.log('ok');

    const db = Mongoose.connection.db;
    const users = await db.collection('users').find({ 'mentorships.0': { $exists: true } }).toArray();

    console.log(`found ${users.length} users with embedded mentorships`);

    const records = [];

    for (const user of users) {
        for (const mentorship of user.mentorships) {
            records.push({
                user: user._id,
                cycle: mentorship.cycle,
                mode: mentorship.mode,
                group: mentorship.group,
                mentor: mentorship.mentor,
                phases: mentorship.phases,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    if (records.length) {
        const result = await db.collection('mentorshiprecords').insertMany(records);
        console.log(`inserted ${result.insertedCount} mentorship records`);
    } else {
        console.log('nothing to insert');
    }

    const unsetResult = await db.collection('users').updateMany(
        { mentorships: { $exists: true } },
        { $unset: { mentorships: '' } }
    );
    console.log(`unset embedded mentorships on ${unsetResult.modifiedCount} users`);

    const publicResult = await db.collection('mentorshipcycles').updateMany(
        {},
        { $set: { isPublic: true } }
    );
    console.log(`set isPublic on ${publicResult.modifiedCount} cycles`);

    process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });
