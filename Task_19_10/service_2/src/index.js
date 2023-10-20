const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const router = require('./router/service_2')

app.use(express.json())
app.use(router)

app.listen(port,()=>{
    console.log("Service-2 is running on port", port)
})