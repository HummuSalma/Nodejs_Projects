const express = require('express')
const router = new express.Router
const PostMsg = require('../controller/service_2')

router.get('/sample',(req,res)=>{
    res.send("Message from service2")
})

router.post('/msg2', PostMsg)

module.exports = router