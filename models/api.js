const https = require('https');
const querystring = require('querystring');
const config = require('../config.json');
const users = require('./user');
const axios = require('axios');
const logs = require('./log');

async function executeRequest(url, options, postData) {
    return await new Promise((resolve, reject) => {
        let httpReq = https.request(url, options, (res) => {
            let data = '';
    
            res.on('data', (chunk) => {
                data += chunk;
            });
    
            res.on('end', () => {
                let apiResponse;
    
                try {
                    apiResponse = JSON.parse(data);
                } catch (error) {
                    return reject({ error: error });
                }
                
                if (!apiResponse.error) {
                    return resolve(apiResponse);
                } else {
                    return reject({ error: apiResponse.error });
                }
            });
        });
    
        httpReq.on('error', function (error) {
            return reject({ error: error });
        });
        
        if (postData) {
            httpReq.write(postData);
        }
    
        httpReq.end();
    });
}

async function getToken(code) {
    const postData = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.redirect,
        client_id: config.id,
        client_secret: config.secret
    }); 

    const options = { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };

    try {
        return await executeRequest('https://osu.ppy.sh/oauth/token', options, postData);
    } catch (error) {
        return { error: error };
    }
}

async function refreshToken(refreshToken) {
    const postData = querystring.stringify({
        grant_type: 'refresh_token',
        client_id: config.id,
        client_secret: config.secret,
        refresh_token: refreshToken
    });

    const options = { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };

    try {
        return await executeRequest('https://osu.ppy.sh/oauth/token', options, postData);
    } catch (error) {
        return { error: error };
    }
}

async function getUserInfo(token) {
    const options = { 
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    };

    try {
        return await executeRequest('https://osu.ppy.sh/api/v2/me', options);
    } catch (error) {
        return { error: error };
    }
}

function webhookPost(message) {
    const url = `https://discordapp.com/api/webhooks/${config.webhook.id}/${config.webhook.token}`;
    axios.post(url, {
        embeds: message
    })
    .catch(error => {
        logs.service.create(null, error, null, 'error');
    });
}

async function beatmapsetInfo(setId) {
    const url = `https://osu.ppy.sh/api/get_beatmaps?k=${config.v1token}&s=${setId}`;
    
    try {
        const res = await axios.get(url);
        return res.data[0];
    } catch (error) {
        console.log(error);
    }
}

async function isBn(req, res, next) {
    if (req.session.osuId) {
        const res = await getUserInfo(req.session.accessToken);
        if (res.is_nat || res.is_bng) {
            return next();
        }        
    }
    
    res.status(403).render('error', { message: 'unauthorized' });
}

async function isLoggedIn(req, res, next) {
    if (req.session.mongoId) {
        const u = await users.service.query({ _id: req.session.mongoId });

        // Refresh if less than 10 hours left
        if (new Date() > new Date(req.session.expireDate - (10 * 3600 * 1000))) {
            const response = await refreshToken(req.session.refreshToken);
            if (!response || response.error) {
                req.session.destroy();
                res.redirect('/');
            }
            
            // *1000 because maxAge is miliseconds, oauth is seconds
            req.session.cookie.maxAge = response.expires_in * 2 * 1000;
            req.session.expireDate = Date.now() + (response.expires_in * 1000);
            req.session.accessToken = response.access_token;
            req.session.refreshToken = response.refresh_token;
        }

        res.locals.userRequest = u;
        next();
    } else {
        res.redirect('/');
    }
}

async function isAdmin(req, res, next) {
    if(res.locals.userRequest.group == 'admin'){
        next();
    }else{
        res.redirect('/');
    }
}

async function isSuperAdmin(req, res, next) {
    if(res.locals.userRequest.osuId == 3178418){
        next();
    }else{
        res.redirect('/');
    }
}

async function isUser(req, res, next) {
    if(res.locals.userRequest.group == 'admin' || res.locals.userRequest.group == 'user'){
        next();
    }else{
        res.redirect('/');
    }
}

async function isNotSpectator(req, res, next) {
    if(res.locals.userRequest.group != 'spectator'){
        next();
    }else{
        return res.json({ error: 'Spectators cannot perform this action!' });
    }
}

//this is temporary and bad
async function isJudge(req, res, next) {
    let judges = [3178418, 918297, 8972308, 4236057, 5226970, 6175280, 2202645, 1541323, 10974170, 2140676, 1314547, 5999631, 8953955, 3795679];
    if(judges.includes(res.locals.userRequest.osuId)){
        next();
    }else{
        res.redirect('/');
    }
}

module.exports = { isLoggedIn, getToken, getUserInfo, isBn, webhookPost, beatmapsetInfo, isAdmin, isSuperAdmin, isUser, isNotSpectator, isJudge };
