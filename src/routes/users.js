const express = require('express');

const User = require('../models/User');
const userService = require('./../_services/user.services')


const router = express.Router()


/* ========================
| ROUTES
--------------------------*/

router.post('/register', (req,res,next)=> {
    User.create(req.body).then(user => res.send(user)).catch(next)
});

router.post('/login', authenticate);

module.exports = router;

/* ========================
| FUNCTIONS
--------------------------*/

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).send({error: 'Login failed. Check Credentials'}))
        .catch(next)
}