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
import judgingRouter from './routes/judging';
import adminContestsRouter from './routes/admin/contests';

const app = express();
const MongoStore = MongoStoreSession(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// settings/middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
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
    require('./models/contest/judging');
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
app.use('/judging', judgingRouter);

app.use('/artists', artistsRouter);
app.use('/admin', adminRouter);
app.use('/admin/users', adminUsersRouter);
app.use('/admin/beatmaps', adminBeatmapsRouter);
app.use('/admin', adminFeaturedArtistsRouter);
app.use('/admin/quests', adminQuestsRouter);
app.use('/admin/contests', adminContestsRouter);

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

    // logs.service.create(req.session.mongoId || null, `${req.session.osuId} - ${err}`, null, 'error');

    if (req.accepts(['html', 'json']) === 'json') {
        res.json({ error: err.message || 'Something went wrong!' });
    } else {
        res.status(err.status || 500);
        res.render('error');
    }
});

// handlebar helper
hbs.registerHelper('shortDate', (date) => {
    return date.toString().slice(4, 24);
});

hbs.registerHelper('shortAction', (action) => {
    if (action.length > 120) {
        return action.toString().slice(0, 120) + '...';
    } else {
        return action;
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
