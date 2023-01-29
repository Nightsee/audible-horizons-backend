const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const multer = require('multer')
const uuidv4 = require('uuid')
const path = require('path')
const router = express.Router()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors = require('cors')


router.use(bodyParser.urlencoded({extended: false}))
router.use(cookieParser())
router.use(cors())


// multer set up :
const DIR = './src/Images/'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split('.')
        // the fileName is an array of the elements of the previous strings splited by '.'
        cb(null, req.params.id + '.' + fileName[1])
    }
});
var upload = multer({storage: storage})

// routes :
router.get('/logout', verifytoken, (req, res)=>{
    res.clearCookie('token')
    return res.json({logedout : true})
})
router.get('/getdata', verifytoken, (req, res) =>{
    User.findOne({_id: req.user}, (err, foundUser)=>{
        res.json({ 
            id: foundUser._id,
            email: foundUser.email,
            favorites: foundUser.favorites,
            fname: foundUser.fname,
            lname: foundUser.lname
         })
    })
})
router.get('/deleteaccount', verifytoken, (req, res)=>{
    User.findByIdAndRemove({_id: req.user}, (err, result)=>{
        if(err) return console.log(err)
        res.json({deleted: true })
    })
})
router.post('/addtofav', verifytokenpost, (req, res)=>{

    let newFav = {
        title: req.body.title,
        author: req.body.author_name,
        cover_i: req.body.cover_i,
        pages: req.body.pages
    }
    User.findOne({_id: req.user}, (err, foundUser)=>{
        let tmp = foundUser.favorites
        tmp.push(newFav)
        foundUser.favorites = tmp
        foundUser.save()
        res.sendStatus(200)
    })
})
router.post('/removefromfav', verifytokenpost, (req, res)=>{
    let idtoremove = req.body.cover_i
    User.findOne({_id: req.user}, (err, foundUser)=>{
        let tmp = []
        foundUser.favorites.forEach(element => {
            if(element.cover_i !== idtoremove){ tmp.push(element) }
        });
        foundUser.favorites = tmp
        foundUser.save()
        res.sendStatus(200)
    })
})
router.post('/editprofil', verifytokenpost, (req, res)=>{
    let newData = req.body.newData
    User.findOne({_id: req.user}, (err, foundUser)=>{
        for (let i = 0; i < newData.length; i++) {
            let key = newData[i]
            switch (key.field) {
                case 'fnameEdit':
                    foundUser.fname = key.newvalue
                    break;
                case 'lnameEdit':
                    foundUser.lname = key.newvalue
                    break;
                case 'emailEdit':
                    foundUser.email = key.newvalue
                    break;
                default:
                    break;
            }
        }
        foundUser.save()
        res.json({edited: true, userdata: foundUser})
    })
        
})
router.post('/uploadimage/:id', upload.single('profileImg'), (req, res)=>{
    res.json({uploadimg: true})
})

//  check if the token is correct :
function verifytoken(req, res, next){
    const token = req.query.token
    
    jwt.verify(token, 'RANDOM_TOKEN_SECRET', (err, user)=>{
        if(err) return res.send(err)
        req.user = user['foundUser']._id
        next()
    })
}
function verifytokenpost(req, res, next){
    const token = req.body.token
    
    jwt.verify(token, 'RANDOM_TOKEN_SECRET', (err, user)=>{
        if(err) return res.send(err)
        req.user = user['foundUser']._id
        next()
    })
}

module.exports = router