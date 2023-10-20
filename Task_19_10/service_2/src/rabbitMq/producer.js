const amqp = require('amqplib')

const producer = async(msg)=>{
    const connection = await amqp.connect('amqp://guest:guest@127.0.0.1:5672')
    const channel = await connection.createChannel()
    const exchange = 'sample'
    await channel.assertExchange(exchange, 'direct', {durable : false})
    channel.publish(exchange, 'user_message', Buffer.from(JSON.stringify({msg})))
}




module.exports = producer


