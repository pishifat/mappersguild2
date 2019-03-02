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
        content: message
    })
    .catch(error => {
        logs.service.create(null, error, null, 'error');
    });
}

async function isBn(req, res, next) {
    if (req.session.osuId) {
        const res = await getUserInfo(req.session.accessToken);
        if (res.is_qat || res.is_bng) {
            return next();
        }        
    }
    
    res.status(403).render('error', { message: 'unauthorized' });
}

async function isLoggedIn(req, res, next) {
    if (config.osuId) {
        req.session.username = config.username;
        req.session.osuId = config.osuId;
        req.session.mongoId = config.mongoId;
        req.session.accessToken = config.accessToken;
        req.session.refreshToken = config.refreshToken;
    }
    
    if (req.session.mongoId) {
        const u = await users.service.query({ _id: req.session.mongoId });
        
        // If hidden, shouldn't be able to do anything
        if (!u || u.group == 'hidden') {
            return res.redirect('/');
        }

        // Refresh if less than 30 sec left
        if (req.session.cookie.maxAge < 30000) {
            const response = await refreshToken();
            req.session.cookie.maxAge = response.expires_in * 1000;
            req.session.accessToken = response.access_token;
            req.session.refreshToken = response.refresh_token;
        }
        
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = { isLoggedIn, getToken, getUserInfo, isBn, webhookPost };
