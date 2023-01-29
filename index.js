const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authroute = require('./src/routes/authroute.js')

const app = express();

    mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/audiblehorizons", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

if (process.env.NODE_ENV !== 'production') require('dotenv').config()

// CORS Middleware
app.use(cors());

// express middleware handling the body parsing 
app.use(express.json());

// express middleware handling the form parsing
app.use(express.urlencoded({extended: false}));

app.use('/', authroute);

app.listen(process.env.PORT || 4000)