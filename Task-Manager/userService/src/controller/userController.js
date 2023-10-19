const User = require('../model/userModel')
const multer = require('multer')
const sharp = require('sharp')
const { sendEmail, sendCancellationEmail } = require('../email/account')
const cache = require('node-cache')
const myCache = new cache()
const { Readable, Writable, Transform } = require('stream')
const {setUpConnection, publisher} = require('../rabbitMq/producer')

const registerUser = async (req, res) =>   {
    const user = new User(req.body)
    try {
        await user.save()
        sendEmail(user.email, user.name)
        await user.generateToken();
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
}

//User Login
const loginUser = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken();
        res.cookie('token', token, { httpOnly: true })
        res.send({ user, token })
    } catch (e) {
        return res.status(400).send({ error: e.message })
    }
}

//User Logout
const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token')
        res.send({ message: "User Logged Out Successfully!!" })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
}

//Logout All Tokens
const logoutAllTokens = async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({ message: "User Logged Out Successfully from all tokens!!" })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
}

//All Users
const getAllUsers = async (req, res) => {
    try {
        const cachedData = myCache.get('users')
        if (cachedData) {
            res.send(cachedData)
        }
        const user = await User.find({})
        myCache.set('users', user, 3600)
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
}

//User Profile
const userProfile = async (req, res) => {
    try {
        const cachedData = myCache.get('user')
        if (cachedData) {
            res.send(cachedData)
        } else {
            const user = req.user
            myCache.set('user', user, 3600)
            res.send(user)
        }
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
}


//find User by ID
const getUserById = async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send({ error: "User Not Found" })
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
}

//update user who has logged in
const updateUser = async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedFields = ['name', 'password', 'email', 'age']
    const isValidField = updates.every((update) => {
        return allowedFields.includes(update)
    })
    if (!isValidField) {
        return res.status(400).send({ error: "Invalid Field" })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send({ data: req.user, message: 'User updated Successfully' })
    } catch (e) {
        res.status(400).send(e)
    }
}

//Delete user who has logged in 
const deleteUser = async (req, res) => {
    try {
        const userId = req.user._id
        //RabbitMq Logic
        const connection = await setUpConnection()
        await publisher(connection, userId)
        await User.deleteOne({ _id: userId })
        sendCancellationEmail(req.user.email, req.user.name)
        res.send({ data: req.user, message: 'User Deleted Successfully!' })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
}

//Upload User Image
const upload = multer({
    limits: {
        fileSize: 1000000 //1mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload a image with jpg, jpeg and png format"))
        }
        cb(undefined, true)
    }
})

//Uploading the image
const uploadImage = async (req, res) => {
    try {
        //readableStream -> Reads tha data from the request
        const readableStream = Readable.from(req.file.buffer)

        //TranformStream -> Transforms the chunk of data into png() format
        const transformstream = new Transform({
            //callback function
            transform(chunk, encoding, callback) {
                sharp(chunk).toBuffer((error, data) => {
                    if (error) {
                        console.log(err)
                    }
                    this.push(data)
                    callback()
                })
            }
        })

        //WritableStream -> Writes the data into the avatar fields of User Model
        const writableStream = new Writable({
            write(chunk, encoding, callback) {
                req.user.avatar = chunk
                callback()
            }
        })

        //Piping the Streams
        readableStream.pipe(transformstream).pipe(writableStream)

        await new Promise((resolve, reject) => {
            //writable.on is used to react to events .
            //Events -> finish, error
            writableStream.on('finish', resolve)
            writableStream.on('error', reject)
        })

        await req.user.save()
        res.send("User Image Uploaded successfully!")
    } catch (e) {
        res.status(500).send({ error: e.messsage })
    }

    //Normal Execution
    // try {
    //     const buffer = await sharp(req.file.buffer).png().toBuffer()
    //     req.user.avatar = buffer
    //     await req.user.save()
    //     res.send({ message: 'Image uploaded successfully!!' })
    // } catch (e) {
    //     res.status(500).send({ error: error.message })
    // }
}

//Deleting the image
const deleteImage = async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send({ data: req.user, message: 'User Image Deleted Successfully!' })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }

}

//Getting the image for a specific user
const getImageById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            throw new Error('User Not Found')
        }
        if (!user.avatar) {
            throw new Error('User Avatar not found')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
}

//Getting the image of who has logged in
const getImage = async (req, res) => {
    try {
        const avatar = req.user.avatar
        if (!avatar) {
            throw new Error("User avatar not found")
        }
        res.set('Content-Type', 'image/png')
        res.send(avatar)
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
}

//Search User 
const searchUser = async(req,res)=>{
    try{
        const match = {}
        if(req.query.name){
            match.name = {$regex : new RegExp(req.query.name,'i')}
        }
        if(req.query.age){
            match.age = req.query.age
        }
        const user = await User.find({...match})
        res.send(user)
    }catch(error){
        res.status(500).send({error : e.message})
    }
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    logoutAllTokens,
    getAllUsers,
    userProfile,
    getUserById,
    updateUser,
    deleteUser,
    upload,
    uploadImage,
    deleteImage,
    getImageById,
    getImage,
    searchUser
}

