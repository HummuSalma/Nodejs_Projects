const amqp = require('amqplib')

const setUpConnection = async()=>{
    const connection = await amqp.connect(process.env.RABBITMQ_URL)
    return connection
}

const publisher = async(connection, userId)=>{
    const channel = await connection.createChannel()
    const exchange = 'user-events'
    await channel.assertExchange(exchange, 'direct',{durable :false})
    channel.publish(exchange, 'user-deleted', Buffer.from(JSON.stringify({userId})))
}


module.exports = {
    setUpConnection,
    publisher
}
