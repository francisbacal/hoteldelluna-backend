const express = require('express');
const Joi = require('@hapi/joi');
const JoiObjId = require('joi-objectid');
const JoiDate = require('@hapi/joi-date');

const authorize = require('./../_middleware/authorize');

const Role = require('./../_helpers/role');
const bookingService = require('./../_services/booking.services');
const stripeService = require('./../_services/stripe.services');
const validateRequest = require('../_middleware/validateRequest');


const router = express.Router();
const JoiObjectId = JoiObjId(Joi);
const Joii = Joi.extend(JoiDate)

/* ========================
| ROUTES
--------------------------*/

router.post('/',addSchema, payStripe, add);
router.get('/', authorize([Role.Admin, Role.User]), getAll);
router.get('/:id', authorize([Role.Admin, Role.User]), getOne);
router.put('/:id', authorize([Role.Admin, Role.User]), updateSchema, removeRoomBooking, update);
// router.post('/stripe', payStripe)



module.exports = router;


/* ========================
| FUNCTIONS
--------------------------*/

function addSchema(req, res, next) {
    const customerSchema = Joi.object().keys({
        email: Joi.string().email().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required()
    })
    const schema = Joi.object().keys({
        customer: customerSchema,
        roomType: JoiObjectId().required(),
        guests: Joi.number().required(),
        bookingDate: {
            start: Joii.date().min('now').max(Joi.ref('end')).required(),
            end: Joii.date().min('now').required()
        }
    })

    validateRequest(req, next, schema);
}

async function add(req, res, next) {
    let booking = await bookingService.add(req)
        .catch(next)
    
    let bookingDetails = {booking: booking, payment: req.body.payment}
    

    res.json(bookingDetails);

}

function getAll(req, res, next) {
    bookingService.getAll(req)
        .then(bookings => {
            if (bookings.length) {
                res.json(bookings)
            } else {
                next('No matching booking found')
            }
        })
        .catch(next)
}

function getOne(req, res, next) {
    bookingService.getOne(req)
        .then(booking => {
            if (booking) {
                res.json(booking)
            } else {
                next('No matching booking found')
            }
        })
        .catch(next)
}

function updateSchema(req, res, next){

    const schema = Joi.object().keys({
        customer: Joi.object().keys({
            email: Joi.string().email().required(),
            firstname: Joi.string().required(),
            lastname: Joi.string().required()
        }),
        roomType: JoiObjectId().required(),
        guests: Joi.number().required(),
        bookingDate: {
            start: Joii.date().min('now').max(Joi.ref('end')).required(),
            end: Joii.date().min('now').required()
        },
        hasEnded: Joi.boolean()
    })

    validateRequest(req, next, schema)
}

function update(req, res, next) {
    bookingService.update(req, next)
        .then(booking => res.json(booking))
        .catch(next)
}
function removeRoomBooking(req, res, next) {
    bookingService.removeRoomBooking(req)
        .catch(next)
    
        next();
}

async function payStripe(req, res, next) {
    req.body.payment = await stripeService.pay(req, res, next).catch(next)
    next()
}