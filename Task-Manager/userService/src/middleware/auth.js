const jwt = require('jsonwebtoken')
const User = require('../model/userModel')

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if(!token){
            throw new Error("Token Not Found")
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id : decoded._id})
        if (!user) {
            throw new Error("Unauthorized User")
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: e.message })
    }

}

module.exports = auth