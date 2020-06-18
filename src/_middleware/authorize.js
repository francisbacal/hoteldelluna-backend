const passport = require('passport')
require ('./../lib/passport-setup')

module.exports = authorize;

function authorize(roles = []) {    
    
            
    if (typeof roles === 'string') {
        roles = [roles]
    }

    return (
        async (req, res, next) => {
            await passport.authenticate('jwt', {session:false}, async(err, user) => {
                if (err) {
                    return next(err)
                }

                if(!user || (roles.length && !roles.includes(user.role))) {
                    return res.status(401).json({error: 'Unauthorized'})
                }
                
                req.user = user
                next();
    
            })(req, res, next)
            
        }
    )
}