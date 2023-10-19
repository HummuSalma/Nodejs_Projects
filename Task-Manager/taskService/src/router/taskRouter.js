const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router
const {createTask,getAllTask,getTaskById,updateTaskById,deleteTaskById} = require('../controller/taskController')

router.post('/tasks', auth, createTask)

//Reading all Tasks
router.get('/tasks', auth, getAllTask)

//Reading Task By Id
router.get('/tasks/:id', auth, getTaskById)

//Update the task by Id
router.patch("/tasks/:id", auth, updateTaskById)

//Delete Task By id
router.delete("/tasks/:id", auth, deleteTaskById)

router.get('/sample',(req,res)=>{
    res.send("Testing!!")
})

module.exports = router