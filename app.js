require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const rooms = require('./src/routes/rooms');
const users = require('./src/routes/users')
const roomTypes = require('./src/routes/roomTypes')
const bookings = require('./src/routes/bookings')
const path = require('path');

const cors = require('cors')

const port = process.env.PORT || 5000;


/* ========================
| DATABASE CONNECTION 
--------------------------*/

/*DEVELOPMENT(LOCAL)*/

let URI;

if (process.env.NODE_ENV === 'development') {
    URI = 'mongodb://localhost:27017/hoteldelluna';
} else {
    URI = process.env.ATLAS
}

console.log('URI',URI)
mongoose.connect(URI, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }
);


/* ========================
| INITITALIZE THE APP 
--------------------------*/

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use((req,res,next)=>next());


/* ========================
| ROUTES 
--------------------------*/

app.get('/', (req, res, next)=> res.send('HOTEL DEL LUNA BACKEND SERVER'));
app.use('/users', users);
app.use('/rooms', rooms);
app.use('/types', roomTypes);
app.use('/bookings', bookings);

app.use('/public', express.static(path.join(__dirname, '../public')));




/* ========================
| ERROR HANDLING
--------------------------*/

let errors = {}
const formatError = (err) => {
    const allErrors = err.substring(err.indexOf(':')+1).trim();
    const errorsArray = allErrors.split(',').map(e => e.trim());

    errorsArray.forEach(error =>{
        const [key, value] = error.split(':').map(e => e.trim())
        errors[key] = value
    })
    return errors
}

app.use((err, req, res, next)=> 
    {
        console.log('ERROR', err.message)
        console.log('ERROR', err)
        if (typeof err === 'object') {
            res.status(400).send (
                {
                    error: formatError(err.message)
                }
            )
        } else {
            res.status(400).json({error: err})
        }
    }
)

/* ========================
| LISTEN TO PORT
--------------------------*/

app.listen(port, () => 
    {
        console.log(`App is running on port: ${port}`)
    }
)
