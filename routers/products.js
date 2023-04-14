const express = require('express')
const Router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const { default: mongoose } = require('mongoose');



Router.get(`/`, async (req, res)=>{
    let filter = {}
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList){
        res.status(500).json({success: false});
    }
    res.send(productList)
});

Router.get('/:id',async(req,res) => {
    try{
        let product = await Product.findById(req.params.id).populate('category');
        res.status(200).send(product)
    }
    catch(e){
        res.status(400).send('Invalid product id');
    }
});

Router.post(`/`, async(req, res)=>{

    try{
        let category = await Category.findById(req.body.category);
    }
    catch(e){
        return res.status(400).send('Invalid category');
    }
    let product = new Product({
       name: req.body.name,
       description: req.body.description,
       richDescription: req.body.richDescription,
       image: req.body.image,
       brand: req.body.brand,
       price: req.body.price,
       category: req.body.category,
       countInStock: req.body.countInStock,
       rating: req.body.rating,
       numReviews: req.body.numReviews,
       isFeatured: req.body.isFeatured
    })

    try{
        product = await product.save();
        res.send(product);
    } catch(e){
        return res.status(500).send('The product can not be created')
    }
});

Router.put('/:id',async (req, res)=> {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        }, {
            new: true
        });
        res.status(200).send(product);
    } catch(e) {
        res.status(404).json({success: false, message: 'error occured'});
    } 
});

Router.delete('/:id',(req,res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('error object is not found');
    }
    Product.findOneAndRemove(req.params.id).then(product=>{
        res.status(200).send({message: 'product deleted successfully',product})
    })
    .catch(e=>{
        res.status(400).send('Error occured')
    })
});

Router.get('/get/count',async(req,res)=>{

    let count = await Product.countDocuments({});
    if(!count){
        res.status(500).json({success: false})
    }
    res.send({count: count})

})

Router.get('/get/featured/:count',async(req,res)=>{

    const count = req.params.count ? req.params.count : 0
    try{
        let products = await Product.find({isFeatured:true}).limit(+count);
        res.send({products: products})
    }
    catch(e){
        res.status(500).json({success: false})
    }

})

module.exports = Router;