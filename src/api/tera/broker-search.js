const express = require('express');
const db = require('monk')(process.env.MONGODB_URL, { authSource: 'admin' });

const router = express.Router();

/* db migration
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

(async() => {
    db.promise().query('SELECT * FROM broker_auth')
    .then((rows) => {
        let coll = await mongo.get('broker-auth');
        for (let i = 0; i < rows[0].length; i++) {
            await coll.findOne({accountId: rows[0][i].accountId})
            .then(res => {
                if (res == null) {
                    coll.insert([{
                        accountId: rows[0][i].accountId,
                        notes: rows[0][i].notes
                    }])
                    .then(doc => console.log(doc));
                }
            })
        }
    });
})()

(async() => {
    db.promise().query('SELECT * FROM broker_unauth').then(rows => {
        let coll = await mongo.get('broker-unauth');
        for (let i = 0; i < rows[0].length; i++) {
            await coll.findOne({accountId: rows[0][i].accountId})
            .then(res => {
                if (res == null) {
                    coll.insert({
                        accountId: rows[0][i].accountId,
                        characters: rows[0][i].notes.split(',').map(x => x.trim()),
                        timestamp: new Date(rows[0][i].timestamp).getTime()
                    })
                    .then(doc => console.log(doc));
                }
            })
        }
    })
})()
*/

const authenticate = async (id) => {
    return await db.get("broker-auth").findOne({ accountId: parseInt(id) });
}

router.get('/auth/:accountId', async (req, res) => {
    res.status(await authenticate(req.params.accountId) != null ? 200 : 401);
    return res.json({})
})

router.post('/auth/:accountId', async (req, res) => {
    let coll = await db.get('broker-unauth');
    await authenticate(req.params.accountId).then(async (user) => {
        if (user == null) {
            await coll.findOne({ accountId: parseInt(req.params.accountId) }).then(user => {
                if (user != null) {
                    coll.update({
                        accountId: user.accountId
                    },
                    {
                        $set: {
                            characters: req.body.characters,
                            timestamp: Date.now()
                        }
                    })
                } else {
                    coll.insert({
                        accountId: parseInt(req.params.accountId),
                        characters: req.body.characters,
                        timestamp: Date.now()
                    });
                }
            })
            res.status(401);
        }
    });
    return res.json({})
})

module.exports = router;