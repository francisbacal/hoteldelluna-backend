const mongoose = require('mongoose');
const Schema = mongoose.Schema;



/* ========================
| DEFINE SCHEMA
--------------------------*/


const RoomSchema = new Schema(
    {
        name:
        {
            type: Number,
            unique: true,
            required: [true, 'Room number is required']
        },
        roomType:
        {
            type: Schema.Types.ObjectId,
            ref: 'RoomType',
            required: [true, 'Room Type is required']
        },
        maxguests: 
        {
            type: Number,
            required: [true, "Max guests required"]
        },
        bookings:[
            {
                bookingId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Booking'
                },
                guests: 
                {
                    type: Number, 
                    min: [1, "Number of guests should not be less than 1"],
                    max: [8, "Number of guests can not exceed 8"]
                },
                start: {type: Date},
                end: {type: Date}
            }
        ],
        status:
        {
            type: String,
            default: 'Available'
        }
    }
)

const Room = mongoose.model('Room', RoomSchema);

RoomSchema.path('name').validate(async function(v){
    let room = await Room.findOne({name: this.number})
    
    if (room) {
        this.invalidate('name', 'Room already exists.')
    }
})

RoomSchema.set('toJSON', {
    versionKey: false
})

/* ========================
| EXPORT MODEL
--------------------------*/


module.exports = Room;