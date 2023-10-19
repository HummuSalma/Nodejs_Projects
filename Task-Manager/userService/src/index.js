const express = require('express')
require('./db/mongoose')
const userRouter = require('./router/userRouter')
const cookieParser = require('cookie-parser')

const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(cookieParser())
app.use(userRouter)


app.listen(port,()=>{
    console.log("UserService is running on port", port)
})

