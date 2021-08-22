"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const config_json_1 = __importDefault(require("../config.json"));
require("express-async-errors");
// Return the 'new' updated object by default when doing findByIdAndUpdate
mongoose_1.default.plugin(schema => {
    schema.pre('findOneAndUpdate', function () {
        if (!('new' in this.options)) {
            this.setOptions({ new: true });
        }
    });
});
const automation_1 = __importDefault(require("./helpers/automation"));
const index_1 = __importDefault(require("./routes/index"));
const beatmaps_1 = __importDefault(require("./routes/beatmaps/beatmaps"));
const beatmapsHost_1 = __importDefault(require("./routes/beatmaps/beatmapsHost"));
const tasks_1 = __importDefault(require("./routes/beatmaps/tasks"));
const featuredArtists_1 = __importDefault(require("./routes/beatmaps/featuredArtists"));
const quests_1 = __importDefault(require("./routes/quests"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const users_1 = __importDefault(require("./routes/users"));
const logs_1 = __importDefault(require("./routes/logs"));
const index_2 = __importDefault(require("./routes/admin/index"));
const users_2 = __importDefault(require("./routes/admin/users"));
const beatmaps_2 = __importDefault(require("./routes/admin/beatmaps"));
const featuredArtists_2 = __importDefault(require("./routes/admin/featuredArtists"));
const quests_2 = __importDefault(require("./routes/admin/quests"));
const artists_1 = __importDefault(require("./routes/artists"));
const screening_1 = __importDefault(require("./routes/screening"));
const contests_1 = __importDefault(require("./routes/admin/contests"));
const judging_1 = __importDefault(require("./routes/admin/judging"));
const judging_2 = __importDefault(require("./routes/judging"));
const contestResults_1 = __importDefault(require("./routes/contestResults"));
const showcase_1 = __importDefault(require("./routes/showcase"));
const parties_1 = __importDefault(require("./routes/parties"));
const invites_1 = __importDefault(require("./routes/invites"));
const app = express_1.default();
const MongoStore = connect_mongo_1.default(express_session_1.default);
// settings/middlewares
app.use(morgan_1.default('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
// db
mongoose_1.default.connect(config_json_1.default.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    require('./models/featuredSong'); // mongoose isn't detecting it for some reason otherwise
    require('./models/contest/submission');
    require('./models/contest/screening');
    console.log('connected');
});
app.use(express_session_1.default({
    secret: config_json_1.default.session,
    store: new MongoStore({ mongooseConnection: mongoose_1.default.connection }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax',
    },
}));
// routes
app.use('/', index_1.default);
app.use('/beatmaps', beatmaps_1.default);
app.use('/beatmaps', beatmapsHost_1.default);
app.use('/beatmaps', tasks_1.default);
app.use('/featuredArtists', featuredArtists_1.default);
app.use('/users', users_1.default);
app.use('/quests', quests_1.default);
app.use('/parties', parties_1.default);
app.use('/logs', logs_1.default);
app.use('/notifications', notifications_1.default);
app.use('/invites', invites_1.default);
app.use('/screening', screening_1.default);
app.use('/judging', judging_2.default);
app.use('/contestresults', contestResults_1.default);
app.use('/showcase', showcase_1.default);
app.use('/artists', artists_1.default);
app.use('/admin', index_2.default);
app.use('/admin/users', users_2.default);
app.use('/admin/beatmaps', beatmaps_2.default);
app.use('/admin/featuredArtists', featuredArtists_2.default);
app.use('/admin/quests', quests_2.default);
app.use('/admin/contests', contests_1.default);
app.use('/admin/judging', judging_1.default);
// catch 404
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not Found' });
});
// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    let customErrorMessage = '';
    if (err.name == 'DocumentNotFoundError')
        customErrorMessage = 'Error: Object not found';
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
    automation_1.default.setQualified.start();
    automation_1.default.setRanked.start();
    automation_1.default.publishQuests.start();
    automation_1.default.completeQuests.start();
    automation_1.default.rankUsers.start();
});
exports.default = app;
