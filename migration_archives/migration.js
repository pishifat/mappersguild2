/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('../config.json');
const Mongoose = require('mongoose');

Mongoose.connect(config.connection, { useNewUrlParser: true }, async function (error, db) {
    if (error) console.log(error);
    console.log('pass');

    await db.collection('judgings').rename('screenings');
    const screeningDb = db.collection('screenings');
    console.log(await screeningDb.updateMany({}, {
        $rename: {
            judge: 'screener',
        },
    }));

    const contestsDb = db.collection('contests');
    console.log(await contestsDb.updateMany({}, {
        $rename: {
            judges: 'screeners',
            judgingStart: 'screeningStart',
        },
    }));

    const usersDb = db.collection('users');
    console.log(await usersDb.updateMany({}, {
        $rename: {
            contestJudgePoints: 'contestScreenerPoints',
        },
    }));

    process.exit();
});