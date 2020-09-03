const db = require('monk')(process.env.MONGODB_URL, { authSource: 'admin' });
const express = require('express');

const router = express.Router();

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