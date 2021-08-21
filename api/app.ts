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
import notificationsRouter from './routes/notifications';
import usersRouter from './routes/users';
import logsRouter from './routes/logs';
import adminRouter from './routes/admin/index';
import adminUsersRouter from './routes/admin/users';
import adminBeatmapsRouter from './routes/admin/beatmaps';
import adminFeaturedArtistsRouter from './routes/admin/featuredArtists';
import adminQuestsRouter from './routes/admin/quests';
import artistsRouter from './routes/artists';
import screeningRouter from './routes/screening';
import adminContestsRouter from './routes/admin/contests';
import adminJudgingRouter from './routes/admin/judging';
import judgingRouter from './routes/judging';
import contestResultsRouter from './routes/contestResults';
import showcaseRouter from './routes/showcase';
import partiesRouter from './routes/parties';
import invitesRouter from './routes/invites';

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
app.use('/notifications', notificationsRouter);
app.use('/invites', invitesRouter);
app.use('/screening', screeningRouter);
app.use('/judging', judgingRouter);
app.use('/contestresults', contestResultsRouter);
app.use('/showcase', showcaseRouter);

app.use('/artists', artistsRouter);
app.use('/admin', adminRouter);
app.use('/admin/users', adminUsersRouter);
app.use('/admin/beatmaps', adminBeatmapsRouter);
app.use('/admin/featuredArtists', adminFeaturedArtistsRouter);
app.use('/admin/quests', adminQuestsRouter);
app.use('/admin/contests', adminContestsRouter);
app.use('/admin/judging', adminJudgingRouter);

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
    automation.setQualified.start();
    automation.setRanked.start();
    automation.publishQuests.start();
    automation.completeQuests.start();
    automation.rankUsers.start();
});

export default app;
