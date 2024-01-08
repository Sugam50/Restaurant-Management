const Dishes = require('../model/Dish')
const client = require('../config/redisconfig')

let valid = '';
let DishName = '';

const checkPurshaseValid = async (req, res) => {
    let amountrequired = 0;
    for (const food of req.body.dishArray) {
        const result = await Dishes.findOne({dishName: food.dishName}).exec();
        // const result = await Dishes.findOne({dishName: {'$regex': food.dishName,$options:'i'}}).exec();
        if(result!==null) {
            amountrequired= parseInt(amountrequired) + (parseInt(result.pricePerItem)*parseInt(food.quantity))
            if(result.availableQuantity < food.quantity) {
                valid = "1";
                DishName = food.dishName;
                break;
            }
            else if (amountrequired >req.body.amountPaid) {
                valid = "2";
                break;
            } else {
                valid = "0";
            }
        } else {
            DishName = food.dishName;
            valid=`invalid`;
            break;
        }
    }
}
const getAllDishes = async (req, res) => {
    const dishes = await Dishes.find();
    if(!dishes[0]) return res.json({"message":"No Data Found"})
    res.json(dishes)
}
const addDishes = async (req, res) => {
    if(req?.body?.dishName && req?.body?.servesPeople && req?.body?.pricePerItem && req?.body?.dishType && req?.body?.availableQuantity) {
        const check = await Dishes.find({dishName:{'$regex': req.body.dishName,$options:'i'}}) 
        if(check[0]){
            try {
                res.status(412).json({"Message":"Dish Already exits"})
            } catch (err) {
                console.error(err)
            }
        } else {
            try {
                const result = await Dishes.create({
                    dishName: req.body.dishName,
                    servesPeople: req.body.servesPeople,
                    dishType: req.body.dishType,
                    availableQuantity: req.body.availableQuantity,
                    pricePerItem:req.body.pricePerItem
                })
                res.status(201).json(result)
            } catch (err) {
                console.error(err)
            }
        }
    } else {
        res.status(400).json({'message':'All Fields required'})
    }
}
const deleteDish = async (req, res) => {
    if(req?.body?.dishName) {
        const check = await Dishes.find({dishName:req.body.dishName}) 
        if(check[0]){
            try {
                const result = await Dishes.findOneAndDelete({dishName:req.body.dishName})
                res.status(200).json({"Message":"Dish Deleted successfully"})
            } catch (err) {
                console.error(err)
            }
        } else {
            res.status(412).json({"message":"Dish does not exists"})
        }
    } else {
        res.status(400).json({'message':'Dish Name required'})
    }
}
const updateDish = async (req, res) => {
    if(req?.body?.dishName && req?.body?.pricePerItem && req?.body?.availableQuantity) {
        const check = await Dishes.find({dishName:req.body.dishName}) 
        if(check[0]){
            let quant = parseInt(check[0].availableQuantity) + parseInt(req?.body?.availableQuantity)
            try {
                const result = await Dishes.findOneAndUpdate({dishName:req.body.dishName}, {availableQuantity: quant, pricePerItem:req.body.pricePerItem})
                res.status(200).json({"Message":"Dish Updated Successfully"})
            } catch (err) {
                console.error(err)
            }
        } else {
            res.status(412).json({"message":"Dish does not exists"})
        }
    } else {
        res.status(400).json({'message':'DishName, Quantity and Price are required'})
    }
}
const purchaseDish = async (req, res) => {
    const amountRecieved = req.body.amountPaid;
    let amountrequired = 0;
    let amountCollected = await client.get('amountCollected');
    if(!parseInt(amountCollected)){
        amountCollected=0;
    }
    let completed = 0;
    let quant = 0;
    if(req?.body?.dishArray && req.body.amountPaid) {
        await checkPurshaseValid(req,res);
        if(valid==='invalid') {
            res.status(412).json({"Message":`${DishName} not exists`})
        } else {
            for (const food of req.body.dishArray) {
                const result = await Dishes.findOne({dishName: food.dishName}).exec()
                // const result = await Dishes.findOne({dishName: {'$regex': food.dishName,$options:'i'}}).exec()
                amountrequired= parseInt(amountrequired) + (parseInt(result.pricePerItem)*parseInt(food.quantity))
                if(valid === '1') {
                    completed=0;
                    try {
                        res.status(412).json({"Message":`${DishName} not available`})
                        break;
                    } catch (err) {
                        console.error(err)
                    }
                } else if (valid === '2') {
                    completed=0;
                    try{
                        res.status(412).json({"Message":`Amount Paid is less than total bill`})
                        break;
                    } catch (err) {
                        console.error(err)
                    }
                } else {
                        quant =  parseInt(result.availableQuantity) - parseInt(food.quantity);
                        await Dishes.findOneAndUpdate({dishName:food.dishName}, {availableQuantity: quant, pricePerItem:req.body.pricePerItem})
                        completed =1;
                    }
            } 
            if (completed && valid === '0') {
                amountCollected = parseInt(amountCollected) + parseInt(amountrequired)
                await client.set('amountCollected',parseInt(amountCollected))
                res.status(200).json({"Message":`Change to be returned ${parseInt(amountRecieved) - parseInt(amountrequired)}`})
            }
        }
    } else {
        try{
            res.status(412).json({"Message": 'Atleast 1 dish and amount paid required'})
        } catch (err) {
            console.error(err)
        }
    }
}
                        
module.exports = {
    getAllDishes,
    addDishes,
    deleteDish,
    updateDish,
    purchaseDish
}