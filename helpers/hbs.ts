import hbs from 'hbs';

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

hbs.registerHelper('shortAction', (action) => {
    if (action.length > 120) {
        return action.toString().slice(0, 120) + '...';
    } else {
        return action;
    }
});

hbs.registerHelper('getValue', (obj, key) => {
    return obj[key];
});

hbs.registerHelper('ifStaticPage', function(this, isIndex, isFaq, isLogs, options) {
    if (isIndex || isFaq || isLogs) {
        return options.fn(this);
    }
});
