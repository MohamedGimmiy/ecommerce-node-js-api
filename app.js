const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv/config')
const cors = require('cors')
const app = express()


const  productsRouter = require('./routers/products')
const  categoriesRouter = require('./routers/categories')
const  usersRouter = require('./routers/users')
const  ordersRouter = require('./routers/orders')
const authJwt = require('./helpers/JWT')
const errorHandler = require('./helpers/error-handler')
const api = process.env.API_URL


app.use(cors())
app.options('*',cors())
// Middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)
// make path as static path to show images
app.use('/public/uploads',express.static(__dirname + '/public/uploads'))
// Routers

mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch(err => {
    console.log(err)
})

app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/users`,usersRouter)
app.use(`${api}/orders`,ordersRouter)

app.listen(3000, ()=> {
    console.log(api)
    console.log(`server is running on 3000 port`);
});