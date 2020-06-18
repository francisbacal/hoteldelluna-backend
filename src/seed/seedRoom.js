const Room = require("../models/Room");
const mongoose = require("mongoose");

mongoose.connect(process.env.ATLAS, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    }

);


deleteRooms();

let data = [];

for (let i = 0; i <= 20; i++) {
    let room
    let guests = [2,3,4]
    let randGuest = guests[Math.floor(Math.random() * 3)]

    let roomNumber = 200;
    roomNumber += i;

    room = {
        name: roomNumber,
        roomType: '5edc710a8db3212cf4d3dd10',
        maxguests: randGuest
    }

    data.push(room)

}

for (let i = 0; i <= 10; i++) {
    let room = {}
    let guests = [3,4,5,6]
    let randGuest = guests[Math.floor(Math.random() * 4)]

    let roomNumber = 300;
    roomNumber += i;

    room = {
        name: roomNumber,
        roomType: '5edb8117ae57ca4730c782c2',
        maxguests: randGuest
    }

    data.push(room)
}

for (let i = 0; i <= 10; i++) {
    let room = {}
    let guests = [4,5,6,7,8]
    let randGuest = guests[Math.floor(Math.random() * 5)]
    
    let roomNumber = 400;
    roomNumber += i;

    room = {
        name: roomNumber,
        roomType: '5edb65db5860f822989b2a81',
        maxguests: randGuest
    }

    data.push(room);
}

// Room.create(data).then(rooms => console.log(rooms))
//     .catch(error => console.log(error))
console.log(data)
Room.create(data, (err, resp)=> {
    if (err) {
        console.log(err)
    } else {
        console.log(`Successfully created ${resp.length} rooms`)
    }
})



async function deleteRooms() {
    let rooms = await Room.deleteMany({})
        console.log(rooms)
}
