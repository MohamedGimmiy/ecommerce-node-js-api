const express = require('express');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Router = express.Router()


Router.get('/',async (req,res)=>{

    try{
        let orderList = await Order.find({}).populate('user','name').sort({'dateOrdered': -1});
        res.status(200).send(orderList);
    } catch(e){
        res.status(400).send('error occured');
    }
});

Router.get('/:id',async (req,res)=>{

    try{
        let order = await Order.findById(req.params.id).populate('user','name')
        .populate({path: 'orderItems',populate: {
            path: 'product',
            populate: 'category'
        }});
        res.status(200).send(order);
    } catch(e){
        res.status(400).send('error occured');
    }
});
Router.post('/', async (req,res)=>{

    const orderItemIds = Promise.all(req.body.orderItems.map(async orderitem => {
        let newOrderItem = new OrderItem({
            quantity: orderitem.quantity,
            product: orderitem.product
        })
        newOrderItem = await newOrderItem.save()
        return newOrderItem._id;
    }))

    
    
    const orderItemsIdsResolved = await orderItemIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemId=>{
        let orderItem = await OrderItem.findById(orderItemId).populate('product','price');
        let totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))
    
    const totalPrice = totalPrices.reduce((a,b)=> a+b,0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    })

    order = await order.save();
    if(!order){
        return res.status(404).send('the category can not be created');
    }

    res.send(order);
});

Router.put('/:id',async (req, res)=> {

    try{
        let order = await Order.findByIdAndUpdate(req.params.id, {
            status: req.body.status
        }, {
            new: true
        });
        res.status(200).send(order);
    }
    catch(e){
        res.status(404).json({success: false, message: 'error occured'});
    }
});

Router.delete('/:id', async(req,res)=>{
    
    try{
        await Order.findByIdAndRemove(req.params.id).then(order=>[
            order.orderItems.map(async orderitem=> {
                await OrderItem.findOneAndRemove(orderitem);
            })
        ]);
        return res.status(200).json({success: true, message: ' the order deleted successfully!'});
    } catch(e) {
        return res.status(404).json({success: false})
    }
});

Router.get('/get/totalsales',async (req,res)=>{
    const totalSales = await Order.aggregate([
        {$group: {_id: null, totalsalse: {$sum: '$totalPrice'}}}
    ])

    if(!totalSales){
        return res.status(400).send('The order sales can not be generated')
    }
    res.send({totalsales: totalSales})
})

Router.get('/get/count',async(req,res)=>{

    let count = await Order.countDocuments({});
    if(!count){
        res.status(500).json({success: false})
    }
    res.send({count: count})

})

Router.get('/get/userOrder/:userid',async (req,res)=>{

    try{
        let userorderList = await Order.find({user: req.params.userid})
        .populate({path: 'orderItems',populate: {
            path: 'product',
            populate: 'category'
        }}).sort({'dateOrdered':-1})
        res.status(200).send(userorderList);
    } catch(e){
        res.status(400).send('error occured');
    }
});
module.exports = Router;