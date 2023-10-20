const express = require('express')
const router = new express.Router
const concatMsg = require('../controller/service_1')

router.get('/sample',(req,res)=>{
    res.send("Hello World")
})

router.post('/displayMsg',concatMsg)


module.exports=router