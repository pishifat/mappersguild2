import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStoreSession from 'connect-mongo';
import config from '../config.json';
import 'express-async-errors';

// Return the 'new' updated object by default when doing findByIdAndUpdate
mongoose.plugin(schema => {
    schema.pre('findOneAndUpdate', function(this: any) {
        if (!('new' in this.options)) {
            this.setOptions({ new: true });
        }
    });
});

import automation from './helpers/automation';
import indexRouter from './routes/index';
import beatmapsRouter from './routes/beatmaps/beatmaps';
import beatmapsHostRouter from './routes/beatmaps/beatmapsHost';
import tasksRouter from './routes/beatmaps/tasks';
import featuredArtistsRouter from './routes/beatmaps/featuredArtists';
import questsRouter from './routes/quests';
import usersRouter from './routes/users';
import logsRouter from './routes/logs';
import adminRouter from './routes/admin/index';
import adminUsersRouter from './routes/admin/users';
import adminContestsRouter from './routes/admin/contests';
import adminBeatmapsRouter from './routes/admin/beatmaps';
import adminFeaturedArtistsRouter from './routes/admin/featuredArtists';
import adminQuestsRouter from './routes/admin/quests';
import adminMissionsRouter from './routes/admin/missions';
import adminMerchRouter from './routes/admin/merch';
import artistsRouter from './routes/artists';
import screeningRouter from './routes/contests/screening';
import contestsListingRouter from './routes/contests/listing';
import judgingRouter from './routes/contests/judging';
import resultsRouter from './routes/contests/results';
import mbcRouter from './routes/contests/mbc';
import showcaseRouter from './routes/showcase';
import partiesRouter from './routes/parties';
import mentorshipRouter from './routes/mentorship';
import missionsRouter from './routes/missions';
import locusRouter from './routes/locus/locus';
import merchRouter from './routes/merch';
import worldCupRouter from './routes/worldCup';
import interOpRouter from './routes/interOp';

const app = express();
const MongoStore = MongoStoreSession(session);

// settings/middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// db
mongoose.connect(config.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    require('./models/featuredSong'); // mongoose isn't detecting it for some reason otherwise
    require('./models/contest/submission');
    require('./models/contest/screening');
    console.log('connected');
});

app.use(
    session({
        secret: config.session,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: 'lax',
        },
    })
);

// routes
app.use('/', indexRouter);
app.use('/beatmaps', beatmapsRouter);
app.use('/beatmaps', beatmapsHostRouter);
app.use('/beatmaps', tasksRouter);
app.use('/featuredArtists', featuredArtistsRouter);
app.use('/users', usersRouter);
app.use('/quests', questsRouter);
app.use('/parties', partiesRouter);
app.use('/logs', logsRouter);
app.use('/showcase', showcaseRouter);
app.use('/mentorship', mentorshipRouter);
app.use('/missions', missionsRouter);
app.use('/locus', locusRouter);
app.use('/merch', merchRouter);
app.use('/worldCup', worldCupRouter);

app.use('/contests/listing', contestsListingRouter);
app.use('/contests/results', resultsRouter);
app.use('/contests/screening', screeningRouter);
app.use('/contests/judging', judgingRouter);
app.use('/contests/mbc', mbcRouter);

app.use('/artists', artistsRouter);
app.use('/admin', adminRouter);
app.use('/admin/users', adminUsersRouter);
app.use('/admin/contests', adminContestsRouter);
app.use('/admin/beatmaps', adminBeatmapsRouter);
app.use('/admin/featuredArtists', adminFeaturedArtistsRouter);
app.use('/admin/quests', adminQuestsRouter);
app.use('/admin/missions', adminMissionsRouter);
app.use('/admin/merch', adminMerchRouter);
app.use('/interOp', interOpRouter);

// catch 404
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not Found' });
});

// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    let customErrorMessage = '';
    if (err.name == 'DocumentNotFoundError') customErrorMessage = 'Error: Object not found';

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.json({ error: customErrorMessage || err.message || 'Something went wrong!' });

    console.log(err);
});

// server setup
const port = process.env.PORT || '3000';
app.set('port', port);
app.listen(port, () => {
    console.log('Listening on ' + port);
    automation.sendActionNotifications.start();
    automation.setQualified.start();
    automation.setRanked.start();
    automation.publishQuests.start();
    automation.completeQuests.start();
    automation.rankUsers.start();
    automation.updatePoints.start();
    // automation.processDailyArtists.start();
    automation.validateRankedBeatmaps.start();
    automation.dropOverdueQuests.start();
    automation.processMissions.start();
    automation.updateFavoritesAndPlayCount.start();
});

export default app;
