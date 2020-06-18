const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomTypeSchema = new Schema(
    {
        name: 
        {
            type: String, 
            required: [true, 'Name field is required'], 
            unique: true
        },
        price: 
        {
            type: Number, 
            min: [1, 'Invalid Price'], 
            required: [true, 'Price is required']
        },
        description: 
        {
            type: String, 
            required: [true, 'Description is required.']
        },
        images: 
        [
            {
                name:
                {
                    type: String, 
                    minLength: [8, 'Invalid image path'], 
                    required: [true, 'Image is required']
                }
            }
        ]
    }
);

let RoomType = mongoose.model('RoomType', RoomTypeSchema);

RoomTypeSchema.path('name').validate(async function(v){
   let roomType = await RoomType.findOne({name: this.name})

   if (roomType) {
       this.invalidate('name', 'Room type already exists!.')
   }
})

RoomTypeSchema.set('toJSON', {
    versionKey: false
})


module.exports = RoomType