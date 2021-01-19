"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const config_json_1 = __importDefault(require("./config.json"));
require("express-async-errors");
mongoose_1.default.plugin(schema => {
    schema.pre('findOneAndUpdate', function () {
        if (!('new' in this.options)) {
            this.setOptions({ new: true });
        }
    });
});
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
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: false });
app.use(morgan_1.default('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
mongoose_1.default.connect(config_json_1.default.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
});
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    require('./models/featuredSong');
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
app.use((req, res) => {
    res.render('index');
});
app.use((err, req, res, next) => {
    let customErrorMessage = '';
    if (err.name == 'DocumentNotFoundError')
        customErrorMessage = 'Error: Object not found';
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (req.accepts(['html', 'json']) === 'json') {
        res.json({ error: customErrorMessage || err.message || 'Something went wrong!' });
    }
    else {
        res.status(err.status || 500);
        res.render('error');
    }
    console.log(err);
});
const port = process.env.PORT || '3000';
app.set('port', port);
app.listen(port, () => {
    console.log('Listening on ' + port);
});
exports.default = app;
