const Task = require('../model/taskModel')

const createTask = async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
}

//Reading all Tasks
const getAllTask = async (req, res) => {
    try {
        //Searching
        const match = {}
        if (req.query.description) {
            match.description = { $regex: new RegExp(req.query.description, 'i') }
        }
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }
        //Sorting
        const sort = {}
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }
        //Pagination
        const limit = parseInt(req.query.limit) || 10
        const skip = parseInt(req.query.skip) || 0
        const task = await Task.find({ owner: req.id, ...match }).limit(limit).skip(skip).sort(sort)
        // const task = await Task.find({
        //     owner: req.user._id,
        //     description: match.description, // Include the properties from match
        //     completed: match.completed // Include the properties from match
        //   }).limit(limit).skip(skip).sort(sort);
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
}

//Reading Task By Id
const getTaskById = async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.id })
        if (!task) {
            return res.status(404).send({ error: "Task not found" })
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }

}

//Update the task by Id
const updateTaskById = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedFields = ['description', 'completed']
    const isValidField = updates.every((update) => allowedFields.includes(update))
    if (!isValidField) {
        return res.status(400).send({ error: "Invalid Field" })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.id })
        console.log("owner:" + req.id)
        console.log("_id:" + req.params._id)
        if (!task) {
            return res.status(404).send({ error: "Task Not Found" })
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
}

//Delete Task By id
const deleteTaskById = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.id })
        if (!task) {
            return res.status(404).send({ error: "Task Not Found To Be Deleted" })
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
}

module.exports = {
    createTask,
    getAllTask,
    getTaskById,
    updateTaskById,
    deleteTaskById
}