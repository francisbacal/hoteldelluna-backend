module.exports = validateRequest;

function validateRequest(req, next, schema) {
    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    };
    const { error, value } = schema.validate(req.body, options);
    if(error) {
        const err = `${error.details.map(err => err.message).join(', ')}`
        next(err);
    } else {
        for (let key in value) {
            req.body.key = value[key]
        }
        next()
    }
}