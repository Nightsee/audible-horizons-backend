const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

//routers: -------------------------------
const userRoutes = require('./apiRoutes.js')
// const adminRoutes = require('./adminRoutes')

//models: ---------------------------------
const User = require('../models/userModel')
// const admin = require('../models/adminModel')
//-----------------------------------------

router.use(bodyParser.urlencoded({extended: false}))
router.use(cookieParser())

//normal users routes----------------
router.get('/', (req,res)=>{
    res.json({message: "this is server"})
})
router.get('/verifybeforelogin', verifybeforeloginpage)
router.post('/login', (req,res)=>{
    const userAuth = {
        email: req.body.email,
        password: req.body.password
    }
    User.findOne({email: userAuth.email}, (err, foundUser)=>{
        if(foundUser !== null){
            bcrypt.compare(userAuth.password, foundUser.password).then(Valid => {
                if(!Valid){
                   return res.json({loginOk: false, prob: "INCORRECT_PASSWORD"})
                }
                const user = {foundUser}
                const token =  jwt.sign(user, 'RANDOM_TOKEN_SECRET' )  
                res.cookie("token", token, {
                         httpOnly: true
                    })      
                return res.json({loginOk: true, userid: foundUser._id, token: token})
            }).catch(err =>{console.log(err)})
        }else if(foundUser === null){
            res.json({loginOk: false,prob: "USER_NOT_FOUND"})
        }
    })
})
router.post('/register', verifyunique,(req, res)=>{
    const reqdata = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password
    }
    bcrypt.hash(reqdata.password, 10).then(hash =>{
                const user = new User({
                        fname: reqdata.fname,
                        lname: reqdata.lname,
                        email: reqdata.email,
                        password: hash,
                        favorites: []
                    })
                 user.save()
                 res.json({registerOk: true, alertMessage: "account created"})  
    }) 
})

//API routes------------------------
router.use('/api', userRoutes)
//ADMIN routes---------------------
// router.use('/admin', adminRoutes)

// VERIFY IF THE USER IS ALREADY LOGGED IN
function verifybeforeloginpage(req, res, next){
        jwt.verify(req.query.token, 'RANDOM_TOKEN_SECRET', (err, user)=>{
            if(err) return res.json({success: false})
            req.user = user['foundUser']._id
            User.findById(req.user, (err, foundUser)=>{
                if(err) res.json({success: false})
                res.json({success: true})
            })
        }) 
}
function verifyunique(req, res,next){
    let reqdata = {
        email: req.body.email
    }
    User.find({email: reqdata.email}, (err, foundUser)=>{
        if(err) res.json({err: err})
        if(foundUser.length === 0){
            next()
        }else{
            res.json({emailexist:true, registerOk: false, prob: "Email already exist"})
        }
    })
}

module.exports = router