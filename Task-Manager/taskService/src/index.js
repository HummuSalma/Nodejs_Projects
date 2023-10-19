const express = require('express')
require('./db/mongoose')
const taskRouter = require('./router/taskRouter')
const cookieParser = require('cookie-parser')
const consumer = require('./rabbitMq/listener')
const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cookieParser())
app.use(taskRouter)

consumer().then(()=>{
    console.log("consumer started")
}).catch((e)=>{
    console.log("Error occured:", e)
})

app.listen(port,()=>{
    console.log("TaskService is running on the port", port)
})
