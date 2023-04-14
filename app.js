const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const app = express()
require('dotenv/config')
const  productsRouter = require('./routers/products')
const  categoriesRouter = require('./routers/categories')
const  usersRouter = require('./routers/users')
const cors = require('cors')
const api = process.env.API_URL


app.use(cors())
app.options('*',cors())
// Middleware
app.use(express.json())
app.use(morgan('tiny'))

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

app.listen(3000, ()=> {
    console.log(api)
    console.log(`server is running on 3000 port`);
});

