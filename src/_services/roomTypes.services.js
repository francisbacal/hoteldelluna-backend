const RoomType = require('./../models/RoomType')

module.exports = {
    add,
    getAll,
    getOne,
    update,
    _delete
}

async function add(req) {
    const type = await RoomType.create(req.body);
    return type;
}

async function getAll() {
    const types = await RoomType.find();
    return types.map(type => {return type})
}

async function getOne(id) {
    const type = await RoomType.findById(id)
    return type
}

async function update(req) {
    const type = await RoomType.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {new: true}
    )

    return type
}

async function _delete(req) {
    const type = await RoomType.findByIdAndRemove(req.params.id)
    return type
}