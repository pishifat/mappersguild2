import http from 'http';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStoreSession from 'connect-mongo';
import config from './config.json';
import hbs from 'hbs';
import manifest from './manifest.json';
import './helpers/hbs';
import 'express-async-errors';

// Return the 'new' updated object by default when doing findByIdAndUpdate
mongoose.plugin(schema => {
    schema.pre('findOneAndUpdate', function(this) {
        if (!('new' in this.options)) {
            this.setOptions({ new: true });
        }
    });
});

import indexRouter from './routes/index';
import beatmapsRouter from './routes/beatmaps/beatmaps';
import beatmapsHostRouter from './routes/beatmaps/beatmapsHost';
import tasksRouter from './routes/beatmaps/tasks';
import featuredArtistsRouter from './routes/beatmaps/featuredArtists';
import questsRouter from './routes/quests';
import notificationsRouter from './routes/notifications';
import usersRouter from './routes/users';
import faqRouter from './routes/faq';
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

const app = express();
const MongoStore = MongoStoreSession(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.localsAsTemplateData(app);
app.locals.manifest = manifest;

// settings/middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '10d', // 10d cuz css doesn't have a hash, yet
}));
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

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
    })
);

// routes
app.use('/', indexRouter);
app.use('/faq', faqRouter);
app.use('/beatmaps', beatmapsRouter);
app.use('/beatmaps', beatmapsHostRouter);
app.use('/beatmaps', tasksRouter);
app.use('/featuredArtists', featuredArtistsRouter);
app.use('/users', usersRouter);
app.use('/quests', questsRouter);
app.use('/logs', logsRouter);
app.use('/notifications', notificationsRouter);
app.use('/screening', screeningRouter);
app.use('/judging', judgingRouter);

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
    res.redirect('/');
});

// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    if (req.accepts(['html', 'json']) === 'json') {
        res.json({ error: err.message || 'Something went wrong!' });
    } else {
        res.status(err.status || 500);
        res.render('error');
    }
});

// server setup
const port = process.env.PORT || '3000';
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
server.on('error', (error) => {
    console.log(error);
});

export default app;
