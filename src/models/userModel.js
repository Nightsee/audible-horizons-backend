const mongoose = require('mongoose')

const bookSchema = mongoose.Schema({
    title: {type: String},
    author: {type: String},
    cover_i: {type: Number},
    pages: {type: Number}
})

const userSchema = mongoose.Schema({
    profileImg: {type: String},
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    favorites: [bookSchema]
})


module.exports = mongoose.model('user', userSchema)