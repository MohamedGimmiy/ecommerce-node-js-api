const express = require('express')
const Router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const { default: mongoose } = require('mongoose');

// file upload
const multer = require('multer')
const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg'
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('Invalid Image type')

        if(isValid){
            uploadError = null;
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const extension = FILE_TYPE_MAP[file.mimetype]
      const filename = file.originalname.split(' ').join('-')
      cb(null,  `${filename}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })


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

Router.post(`/`, uploadOptions.single('image'), async(req, res)=>{
    if(!req.file){
        return res.status(400).send('No image in the request')
    }
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    try{
        let category = await Category.findById(req.body.category);
    }
    catch(e){
        return res.status(400).send('Invalid category');
    }
    console.log(`${basePath}${fileName}`)
    let product = new Product({
       name: req.body.name,
       description: req.body.description,
       richDescription: req.body.richDescription,
       image: `${basePath}${fileName}`, // "https://localhost:3000/public/uploads"
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

Router.put('/:id', uploadOptions.single('image'),async (req, res)=> {
    let product;
    try{
        product = await Product.findById(req.params.id);
    }
    catch(e){
        return res.status(400).send('Invalid product')
    }

    const file = req.file;
    let imagePath;
    if(file){
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;

    } else {
        imagePath = product.image
    }
    try{
        const Updatedproduct = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
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
        res.status(200).send(Updatedproduct);
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

// upload filenames
Router.put('/gallary-images/:id',  uploadOptions.array('images', 10), async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('error object is not found');
    }

    try{
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        if(files){
            files.map(file=> {
                console.log(file.filename)
                imagesPaths.push(`${basePath}${file.filename}`)
            })
        }
        const Updatedproduct = await Product.findByIdAndUpdate(req.params.id, {
            images: imagesPaths,
        }, {
            new: true
        });
        res.status(200).send(Updatedproduct);
    } catch(e) {
        res.status(404).json({success: false, message: 'error occured'});
    } 

})


module.exports = Router;