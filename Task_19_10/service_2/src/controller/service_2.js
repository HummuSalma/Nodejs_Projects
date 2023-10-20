const producer = require('../rabbitMq/producer')

const PostMsg = async (req,res)=>{
    try{
        if(!req.body){
            throw new Error("Req.body Not Found")
        }
        const msg = req.body.message
        await producer(msg)
        res.send(msg)
    }catch(e){
        res.status(500).send({error : e.message})
    }
}

module.exports = PostMsg