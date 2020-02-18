"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hbs_1 = __importDefault(require("hbs"));
hbs_1.default.registerHelper('shortDate', (date) => {
    return date.toString().slice(4, 24);
});
hbs_1.default.registerHelper('shortAction', (action) => {
    if (action.length > 120) {
        return action.toString().slice(0, 120) + '...';
    }
    else {
        return action;
    }
});
hbs_1.default.registerHelper('shortAction', (action) => {
    if (action.length > 120) {
        return action.toString().slice(0, 120) + '...';
    }
    else {
        return action;
    }
});
hbs_1.default.registerHelper('getValue', (obj, key) => {
    return obj[key];
});
hbs_1.default.registerHelper('ifStaticPage', function (isIndex, isFaq, isLogs, options) {
    if (isIndex || isFaq || isLogs) {
        return options.fn(this);
    }
});
