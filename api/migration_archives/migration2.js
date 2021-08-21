/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('../config.json');
const Mongoose = require('mongoose');

Mongoose.connect(config.connection, { useNewUrlParser: true }, async function (error, db) {
    if (error) console.log(error);
    console.log('pass');

    const artists = db.collection('featuredartists');
    console.log(await artists.updateMany({}, {
        $rename: {
            contractPaid: 'contractFinalized',
        },
    }));

    const allArtists = await artists.find({}).toArray();
    console.log(allArtists.length);

    for (const artist of allArtists) {
        console.log(artist.label);

        if (artist.isDenied) artist.isRejected = true;

        delete artist.contractSigned;
        delete artist.bioWritten;
        delete artist.isInvited;
        delete artist.isPriority;
        delete artist.assignedUser;
        delete artist.isStalled;
        delete artist.isDenied;

        await artists.replaceOne({
            _id: artist._id,
        }, artist);
    }

    process.exit();
});