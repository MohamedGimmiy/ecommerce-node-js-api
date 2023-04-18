const express = require('express');
const Router = express.Router()
const User = require('../models/user');
const bycrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')


Router.get('/',async(req,res)=>{

    try{
        let userList = await User.find().select('-passwordHash');
        res.status(200).send(userList)
    } catch(e){
        res.status(400).send('error occured')
    }
});

Router.get('/:id', async(req, res) => {
    
    try{
        let user = await User.findById(req.params.id).select('-passwordHash');
        res.status(200).send(user);
    } catch(e){

        res.status(404).json({success: false, message: 'error occured'});
    }
})

Router.get('/get/count',async(req,res)=>{

    let count = await User.countDocuments({});
    if(!count){
        res.status(500).json({success: false})
    }
    res.send({count: count})

})



Router.post('/register', async (req,res)=>{

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
        return res.status(404).send('the user can not be created');
    }

});

Router.post('/login',async(req,res)=> {

    try{
        let user = await User.findOne({email: req.body.email});

        if(user && bycrypt.compareSync(req.body.password, user.passwordHash)){
            const secret = process.env.secret
            let token = JWT.sign({
                userId: user.id,
                isAdmin: user.isAdmin
            }, secret,{expiresIn: '1w'})
            return res.status(200).send({user: user.email, token: token});
        } else {
            return res.status(400).send('email or password is wrong found');

        }
    } catch(e){
        return res.status(400).send('user not found');
    }
});



Router.delete('/:id',(req,res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('error object is not found');
    }
    User.findOneAndRemove(req.params.id).then(user=>{
        res.status(200).send({message: 'User deleted successfully',user})
    })
    .catch(e=>{
        res.status(400).send('Error occured')
    })
});



module.exports = Router;