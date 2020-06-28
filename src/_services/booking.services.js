const Booking = require('./../models/Booking');
const RoomType = require('./../models/RoomType');
const Room = require('./../models/Room');
const moment = require('moment')

module.exports = {
    add,
    getAll,
    getOne,
    update,
    removeRoomBooking
}

async function add(req) {
    let total = await getTotal(req);
    req.body.total = total;
    
    const booking = await Booking.create(req.body)
    await bookRoom(booking)
    return booking
}

async function getAll(req) {

    if (req.user.role === 'Admin') {       
        const bookings = await Booking.find().populate({path: 'roomType', model: 'RoomType'}).exec()
        return bookings
    } else {
        const bookings = await Booking.find({"customer.email": req.user.email})
        return bookings
    }
}

async function getOne(req) {
    if (req.user.role === 'Admin') {
        const booking = await Booking.findOne({_id: req.params.id})
        return booking;
    } else {
        const booking = await Booking.findOne({
            '_id': req.params.id, 
            'customer.email': req.user.email
        })
        return booking;
    }
}

async function updateStatus(req, next) {
    let data = {};
    data.hasEnded = req.body.hasEnded;
    data.isCancelled = req.body.isCancelled;

    if (req.user.role === 'Admin') {
        let booking = await Booking.findByIdAndUpdate(req.params.id, data, {new: true})
        return booking
    }
}

async function update(req, next) {
    let total = await getTotal(req)
    req.body.total = total

    // if (req.user.role === 'Admin') {
        let booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {new: true})
        await bookRoom(booking, next)
        return booking
    // }

}

async function getTotal(req) {
    let startDate = moment(req.body.bookingDate.start);
    let endDate = moment(req.body.bookingDate.end);

    let timeDifference = Math.abs(endDate.valueOf() - startDate.valueOf());
    let nights = Math.ceil(timeDifference/ (1000*3600*24))

    let roomPrice = await RoomType.findById(req.body.roomType)
        .then(res => {
            return res.price
        })
    
    let total = roomPrice * nights * 0.10;

    return total
}
async function removeRoomBooking(req) {
    const {id} = req.params
    let ObjectId = require('mongoose').Types.ObjectId
    const room = await Room.findOneAndUpdate(
        {"bookings.bookingId": new ObjectId(id)},
        { $pull: {bookings: { bookingId: new ObjectId(id) } } },
        {new: true}
    )
}

async function bookRoom(booking, next) {
    const {_id, bookingDate, roomType, guests} = booking
    let ObjectId = require('mongoose').Types.ObjectId
    //find a room without booking first
    let room =  await Room.findOne({ 
        roomType: new ObjectId(roomType), 
        status: 'Available',
        maxguests: {$gte: parseInt(guests)},
        $or: 
        [
            {bookings: {$exists: false}},
            {bookings: {$size: 0}},
            {bookings: null}
        ]
    })

    

    //find a room that doesn't clash with booked dates
    if (room === null || !room.length || !room) {
        room =  await Room.findOne({
            roomType: roomType, 
            status: 'Available',
            maxguests: {$gte: parseInt(guests)},
            $nor: 
            [
                {  
                    $and: 
                    [
                        
                        {"bookings.start": { $lte: bookingDate.start }}, 
                        {"bookings.end": { $gt: bookingDate.start }}
                        
                    ]
    
                },
                {
                    
                    "bookings.start": { $lt: bookingDate.end, $gte: bookingDate.start }
                    
                }
            ]
        })
    }
    await Room.findByIdAndUpdate(
        room._id, 
        {
            $addToSet: {
                bookings: {
                    bookingId: _id,
                    start: bookingDate.start,
                    end: bookingDate.end
                }
            }
        }
    ).catch(next)

}   