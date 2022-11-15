const express = require('express');
const app = express()
const cors = require('cors')

const cookieParser = require('cookie-parser')
const bodyparser = require('body-parser')
const fileUpload = require('express-fileupload')


const errorMiddleware = require('./middlewares/errors')

app.use(express.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(fileUpload())
app.use(cors())

// // Setting up cloudinary config
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

// Import all routes
const products = require('./routes/productRoute')
const auth = require('./routes/authRoute')
const order = require('./routes/orderRoute')

app.use('/api/v1', products)
app.use('/api/v1', auth)
app.use('/api/v1', order)

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app