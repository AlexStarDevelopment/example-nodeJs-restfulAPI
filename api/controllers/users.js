const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user');

exports.signup_users = (req, res, next) => {
    User.find({email: req.body.email}).exec().then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: 'email exists'
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email ,
                        password: hash
                    })
                    user.save().then(response => {
                        console.log(response)
                        res.status(200).json({
                            message: 'User Created'
                        })
                    }).catch(err => {
                        res.status(500).json({
                            error: err
                        })
                    })
                }
            })
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })   
}

exports.login_users = (req, res, next) => {
    User.find({email: req.body.email}).exec().then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Auth failed'
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, response) => {
            if (err) {
                return res.status(401).json({
                    message: 'Auth failed'
                }) 
            }
            if (response) {
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                }, process.env.JWT_KEY, {
                    expiresIn: "1h"
                })
                return res.status(200).json({
                    message: 'Auth Successful',
                    token: token
                })
            } 
            res.status(401).json({
                message: 'Auth failed'
            }) 
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
}

exports.delete_users = (req, res, next) => {
    User.deleteOne({_id: req.params.userId}).exec().then(result => {
        res.status(200).json({
            message: 'User Deleted'
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
}