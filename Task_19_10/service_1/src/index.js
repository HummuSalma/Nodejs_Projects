const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const router = require('./router/service_1')


app.use(express.json())
app.use(router)



app.listen(port,()=>{
    console.log("Service-1 is running on port", port)
})