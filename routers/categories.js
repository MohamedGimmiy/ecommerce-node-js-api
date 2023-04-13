const express = require('express')
const Router = express.Router();
const Category = require('../models/category')

Router.get(`/`,async (req, res)=>{
    const categoryList = await Category.find();
    if(!categoryList){
        res.status(500).json({success: false});
    }
    res.send(categoryList)
});

Router.post('/', async (req,res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    category = await category.save();
    if(!category){
        return res.status(404).send('the category can not be created');
    }

    res.send(category);
});

Router.delete('/:id', async(req,res)=>{
    category = await Category.findByIdAndRemove(req.params.id);

    if(category){
        return res.status(200).json({success: true, message: ' the category deleted successfully!'});
    } else {
        return res.status(404).json({success: false})
    }
});

module.exports = Router;