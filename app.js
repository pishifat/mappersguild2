const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('./config.json');
const hbs = require('hbs');

var indexRouter = require('./routes/index');
var faqRouter = require('./routes/faq');
var beatmapsRouter = require('./routes/beatmaps');
var rankedRouter = require('./routes/ranked');
var usersRouter = require('./routes/users');
var questsRouter = require('./routes/quests');
var questsArchiveRouter = require('./routes/questsarchive');
var partiesRouter = require('./routes/parties');
var logsRouter = require('./routes/logs');
var notificationsRouter = require('./routes/notifications');
var adminsRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

mongoose.connect(config.connection, {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected');
});
app.use(session({
  secret: config.session,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false
}));

app.use('/', indexRouter);
app.use('/faq', faqRouter);
app.use('/beatmaps', beatmapsRouter);
app.use('/ranked', rankedRouter);
app.use('/users', usersRouter);
app.use('/quests', questsRouter);
app.use('/questsarchive', questsArchiveRouter);
app.use('/parties', partiesRouter);
app.use('/logs', logsRouter);
app.use('/notifications', notificationsRouter);
app.use('/admin', adminsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  if (createError(404)) res.redirect('/');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//handlebar helper
hbs.registerHelper('shortDate', function(date) {
  return date.toString().slice(4,24);
});

module.exports = app;
