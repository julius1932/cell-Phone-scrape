const express = require('express');
const app=express();
var mongoS = require("./cellPhoneSave")// including the code to get json from mongo
app.get('/', (req, res) => {
	mongoS.getPhones((err, phones) => {
		if(err){
			throw err;
		}
		res.json(phones);
	});
});
module.exports=app;