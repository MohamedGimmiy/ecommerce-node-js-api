const express = require('express');
const Router = express.Router()
const User = require('../models/user');
const bycrypt = require('bcryptjs')

Router.get('/',async(req,res)=>{

    try{
        let userList = await User.find();
        res.status(200).send(userList)
    } catch(e){
        res.status(400).send('error occured')
    }
});



Router.post('/', async (req,res)=>{

    try{
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bycrypt.hashSync(req.body.password ,10) ,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            appartment: req.body.appartment,
            street: req.body.street,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country
        })
        user = await user.save();
        res.send(user);
    }
    catch(e){
        return res.status(404).send('the category can not be created');
    }

});

module.exports = Router;