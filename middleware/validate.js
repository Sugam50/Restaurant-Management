const Joi = require('joi');

const validSchema = Joi.object({
    dishName : Joi.string(),
    availableQuantity : Joi.number(),
    pricePerItem : Joi.number(),
    dishType : Joi.string(),
    servesPeople : Joi.number(),
    amountPaid : Joi.number(),
    dishArray : Joi.array().items(
        Joi.object({
          dishName: Joi.string().required(),
          quantity: Joi.number().required()
        })
      )
    
})

const checkValid = (req,res,next) => {
    try {
        if (!validSchema.validate(req.body).error){
            next();
        } else {
            res.status(412).send(validSchema.validate(req.body).error.details[0].message)
        }
    } catch {
        res.status(401).json(
            {error : new Error('Invalid Request')}
        )
    }
}

module.exports = checkValid