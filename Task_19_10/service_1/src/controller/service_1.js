const consumer = require('../rabbitMq/consumer')

const concatMsg = async(req,res)=>{
    try{
        if(!req.body){
            throw new Error("Req.body Not Found")
        }
        const msg1 = req.body.message
        const msg2 = await consumer()
        const concatMessage = msg1 + msg2
        res.send(concatMessage)
    }catch(e){
        res.status(500).send({error : e.message})
    }
}

module.exports = concatMsg