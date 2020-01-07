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

import indexRouter from './routes-ts/index';
import beatmapsRouter from './routes-ts/beatmaps/beatmaps';
import tasksRouter from './routes-ts/beatmaps/tasks';
import notificationsRouter from './routes-ts/notifications';

const app = express();
const MongoStore = MongoStoreSession(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

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

mongoose.connect(config.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    require('./models-ts/featuredSong'); // mongoose isn't detecting it for some reason otherwise
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

app.use('/', indexRouter);
// app.use('/faq', faqRouter);
app.use('/beatmaps', beatmapsRouter);
app.use('/beatmaps', tasksRouter);
// app.use('/users', usersRouter);
// app.use('/logs', logsRouter);
app.use('/notifications', notificationsRouter);
// app.use('/admin', adminRouter);
// app.use('/artists', artistsRouter);
// app.use('/quests', questsRouter);

// catch 404 and forward to error handler
app.use(function(req, res) {
    res.redirect('/');
});

// error handler
app.use(function(err, req, res, next) {
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

//handlebar helper
hbs.registerHelper('shortDate', function(date) {
    return date.toString().slice(4, 24);
});

hbs.registerHelper('shortAction', function(action) {
    if (action.length > 120) {
        return action.toString().slice(0, 120) + '...';
    } else {
        return action;
    }
});

const port = process.env.PORT || '3000';
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
server.on('error', (error) => {
    console.log(error);
});

export default app;
