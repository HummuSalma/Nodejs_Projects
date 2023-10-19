const express = require('express')
const router = new express.Router
const auth = require('../middleware/auth')
const {registerUser,
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
    searchUser} = require('../controller/userController')

router.post('/users', registerUser)

//User Login
router.post('/users/login', loginUser)

//User Logout
router.post('/users/logout', auth, logoutUser)

//Logout All Tokens
router.post('/users/logoutAll', auth, logoutAllTokens)

//All Users
router.get('/users', getAllUsers)

//User Profile
router.get('/users/profile', auth, userProfile)

//find User by ID
router.get('/users/:id', getUserById)

//update user who has logged in
router.patch('/users/updateMe', auth, updateUser)

//Delete user who has logged in 
router.delete('/users/deleteMe', auth, deleteUser)

//Uploading the image
router.post('/users/upload/avatar', auth, upload.single('avatar'), uploadImage)

//Deleting the image
router.delete('/users/image/delete', auth, deleteImage)

//Getting the image for a specific user
router.get('/users/:id/avatar', getImageById)

//Getting the image of who has logged in
router.get('/image', auth, getImage)

//Getting the users according to the search option provided
router.get('/searchUser',searchUser)


module.exports = router

