const express = require ('express');
const Joi = require ('@hapi/joi');
const JoiObjId = require ('joi-objectid');
const JoiDate = require ('@hapi/joi-date');
const moment = require ('moment');

const authorize = require ('./../_middleware/authorize');
const validateRequest = require ('./../_middleware/validateRequest');

const Role = require ('../_helpers/role');
const roomService = require ('../_services/room.services');


const router = express.Router();
const JoiObjectId = JoiObjId(Joi);
const Joii = Joi.extend(JoiDate)


/* ========================
| ROUTES
--------------------------*/

router.post('/', authorize(Role.Admin), addSchema, add);
router.get('/', authorize([Role.Admin, Role.Manager, Role.Reception]), getAll);
router.get('/:id', authorize([Role.Admin, Role.Manager, Role.Reception]), getOne);
router.put('/:id', authorize([Role.Admin, Role.Manager, Role.Reception]), updateSchema, update);
router.delete('/:id', authorize(Role.Admin), _delete);
router.delete('/:id/:bookingId', authorize([Role.Admin, Role.Manager, Role.Reception]), removeBooking);
router.get('/:start/:end/:guests', findRooms);



module.exports = router;


/* ========================
| FUNCTIONS
--------------------------*/

//add rooms

function addSchema(req,res,next) {
    const schema = Joi.object({
        name: Joi.number().required(),
        roomType: Joi.string().required(),
        maxguests: Joi.number().required()
    });

    validateRequest(req, next, schema)
}

function add(req, res, next) {
    roomService.add(req)
        .then(room => res.json(room))
        .catch(next)
}

function getAll(req,res,next) {
    roomService.getAll()
        .then(rooms => res.json(rooms))
        .catch(next)
}

function getOne (req,res,next) {
    roomService.getOne(req)
        .then(room => {
            if (room) {
                res.json(room)
            } else {
                next(`Room type not found`)
            }
        })
        .catch(next)
}

function updateSchema(req, res, next) {
    const bookingSchema = Joi.object().keys({
        bookingId: JoiObjectId().optional(),
        start: Joii.date().min('now').max(Joi.ref('end')).optional(),
        end: Joii.date().min('now').optional(),
        guests: Joi.number().optional()
    })
    
    const schema = Joi.object().keys({
        name: Joi.number().required(),
        roomType: JoiObjectId().required(),
        status: Joi.string().required(),
        bookings: Joi.array().items(bookingSchema),
        maxguests: Joi.number().required()
    });

    validateRequest(req, next, schema)
}

function update(req, res, next) {
    roomService.update(req)
        .then(room => {
            if (room) {
                res.json(room)
            } else {
                next(`Room not found`)
            }
        })
        .catch(next)
}

function _delete(req, res, next) {
    roomService._delete(req)
        .then(room => {
            if (room) {
                res.json(room)
            } else {
                next(`Room type not found`)
            }
        })
        .catch(next)
}

function findRooms(req, res, next) {
    let bookingDate = moment(req.params.start, "MM-DD-YYYY").set({hour:14,minute:0,second:0,millisecond:0})
    
    if (moment().isAfter(bookingDate)) {
        return next('Sorry you can not checkin after 2pm today')
    } else {
        req.params.start = bookingDate
        roomService.findRooms(req)
        .then(rooms => {
            if (!rooms) {
                next('No Available rooms')
            } else {
                res.json(rooms)
            }
        })
        .catch(next)
    }
}

function removeBooking(req, res, next) {
    roomService.removeBooking(req)
        .then(room => res.json(room))
        .catch(next)
}