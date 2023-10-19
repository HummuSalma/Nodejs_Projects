const amqp = require('amqplib')
const Task = require('../model/taskModel')

const consumer = async()=>{
    const connection = await amqp.connect('amqp://guest:guest@127.0.0.1:5672')
    const channel = await connection.createChannel()
    const exchange = 'user-events'
    await channel.assertExchange(exchange, 'direct',{durable :false})

    const queue = 'task_service_queue'
    await channel.assertQueue(queue, {exclusive : false})
    channel.bindQueue(queue, exchange, 'user-deleted')
    channel.consume(queue,async (msg)=>{
        const {userId} = JSON.parse(msg.content.toString())
        await deleteTasksByUserId(userId)
    })
}

const deleteTasksByUserId = async(userId)=>{
    try{
        await Task.deleteMany({owner : userId})
        console.log(`Task associated with the ${userId} deleted`)
    }catch(error){
        console.log('Error deleting tasks:', error)
    }
}

module.exports = consumer