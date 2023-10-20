const amqp = require('amqplib')

const consumer = async()=>{
    const connection = await amqp.connect('amqp://guest:guest@127.0.0.1:5672')
    const channel = await connection.createChannel()
    const exchange = 'sample'
    await channel.assertExchange(exchange, 'direct',{durable :false})

    const queue = 'user_message_queue'
    await channel.assertQueue(queue, {exclusive : false})
    channel.bindQueue(queue, exchange, 'user_message')
    return new Promise((resolve)=>{
        channel.consume(queue,async (res)=>{
            const {msg} = JSON.parse(res.content.toString())
            console.log("received msg :" , msg)
            channel.ack(res)
            console.log("Message acknowledged")
            resolve(msg)
        })
    })
        
}



module.exports = consumer