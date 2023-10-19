const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate :function(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {  //es6 shorthand property
            if (value < 0) {
                throw new Error("Age should be a positive number")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: [6, 'Password should have atleast 6 characters'],
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password is invalid')
            }
        }
    },
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//Hiding the data
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

//token generation
userSchema.methods.generateToken = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id.toString(), sub: user.name }, process.env.JWT_SECRET)
    return token
}

//User Logging in logic
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("Unable to login")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error("Unable to login")
    }
    return user
}


//Hashing the password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//Deleting the tasks related to a specific user, When the user is deleted
userSchema.pre('deleteOne', async function (next) {
    const deletedUser = await this.model.findOne(this.getFilter());
    // await Task.deleteMany({ owner: deletedUser._id })
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User