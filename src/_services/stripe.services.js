const User = require('./../models/User');


module.exports = {pay};


const stripe = require('stripe')("sk_test_51Gu7VHKS9hT6DeH4tOHmrgjikfxPckP6rDTKRjZfl0ZKwl09W2sjM8kNy1NDekl6N2FGrS00Ayv6AkMz6kIWQ4kc00mD06VjAZ")



async function pay(req, res, next) {

    function randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    let total = req.body.total * 0.10;
    let bookingDetails = req.body.customer

    if (!req.body.customerId) {
        let password = randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        let confirmPassword = password;

        let details = {
            firstname: bookingDetails.firstname,
            lastname: bookingDetails.lastname,
            email: bookingDetails.email,
            password,
            confirmPassword
        }

        let userCreated = await User.create(details).catch(next);

        req.body.customerId = await userCreated._id

    }

    const user = await User.findOne({ _id: req.body.customerId })
    if (!user) {
        res.status(500).send({ message: "Incomplete" })
    } else {
        if (!user.stripeCustomerId) {
            let charge = await stripe.customers.create({ email: user.email })
            .then(customer => {
                return User.findByIdAndUpdate({ _id: user._id }, { stripeCustomerId: customer.id }, { new: true })
            })
            .then(user => {
                return stripe.customers.retrieve(user.stripeCustomerId)
            })
            .then(customer => {
                return stripe.customers.createSource(customer.id, {
                    source: 'tok_visa'
                })
            })
            .then(source => {
                return stripe.charges.create({
                    amount: total * 100,
                    currency: 'usd',
                    customer: source.customer
                })
            })
            return charge
        } else {
            let charge = await stripe.charges.create({
                amount: total * 100,
                currency: 'usd',
                customer: user.stripeCustomerId
            })

            return charge

        }
    }
 
}