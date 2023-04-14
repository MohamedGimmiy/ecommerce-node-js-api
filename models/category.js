const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },    
    icon: {
        type: String,
    },
    color: {
        type: String,
        required: true
    }
});
// converting _id to id to be front-end friendly
categorySchema.virtual('id').get(function (){
    return this._id.toHexString();
});
categorySchema.set('toJSON',{
    virtuals: true
})

module.exports = mongoose.model('Category',categorySchema)