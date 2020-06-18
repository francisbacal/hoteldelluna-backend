const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('./../models/User')


module.exports = {
    authenticate
}


async function authenticate({email, password}) {
    let user = await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.passwordHash)) {
        const token = jwt.sign({_id: user._id}, 'secret');
        const authenticatedUser = {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role
        }
        return {authenticatedUser, token};
    }

}