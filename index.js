require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const client = require('./config/redisconfig');
const app = express();
var bodyParser = require('body-parser')

const cors = require('cors')
const path = require('path');
const PORT = process.env.PORT || 3500;
const auth = require('./middleware/auth')
const dishController = require("./controllers/dishController");
const { errorHandler } = require('./controllers/errorHandler');

const connectDB = require('./config/dbConn');
const checkValid = require('./middleware/validate');


connectDB();
client.connect();

var jsonParser = bodyParser.json()
app.use(jsonParser)
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(cors());

app.get('/getDishes',[auth,urlencodedParser ], dishController.getAllDishes);
app.post('/addDish',[auth,urlencodedParser, checkValid ] , dishController.addDishes);
app.delete('/deleteDish',[auth,urlencodedParser, checkValid ] , dishController.deleteDish);
app.put('/updateDish',[auth,urlencodedParser, checkValid ] , dishController.updateDish);
app.post('/purchaseDish',[auth,urlencodedParser, checkValid ] , dishController.purchaseDish);

app.all('*', errorHandler);

client.on('error', err => console.log('Redis Client Error', err));

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})