const express = require('express')
const Router = express.Router();
const Category = require('../models/category')

Router.get(`/`,async (req, res)=>{
    const categoryList = await Category.find();
    if(!categoryList){
        res.status(500).json({success: false});
    }
    res.status(200).send(categoryList)
});

Router.get('/:id', async(req, res) => {
    
    try{
        let category = await Category.findById(req.params.id);
        res.status(200).send(category);
    } catch(e){

        res.status(404).json({success: false, message: 'error occured'});
    }
})

Router.put('/:id',async (req, res)=> {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }, {
        new: true
    });
    if(category){
        res.status(200).send(category);
    } else {
        res.status(404).json({success: false, message: 'error occured'});
    } 
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
    
    try{
        let category = await Category.findByIdAndRemove(req.params.id);
        return res.status(200).json({success: true, message: ' the category deleted successfully!'});
    } catch(e) {
        return res.status(404).json({success: false})
    }
});

module.exports = Router;