const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dishSchema = new Schema({
    dishName:{
        type: String,
        required: true
    },
    availableQuantity:{
        type: Number,
        required: true
    },
    pricePerItem:{
        type: Number,
        required: true
    },
    dishType:{
        type: String,
        required: true
    },
    servesPeople:{
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("Dish", dishSchema);