import passport from 'passport';
import User from './../models/User'

import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

passport.use( new JwtStrategy(opts, function(jwt_payload, done){
    User.findOne( {_id: jwt_payload._id}, function(err, user) {
        if (err) {
            return done(err, false)
        }

        if (user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    })
}))