var express = require('express');
var mongoose=require('mongoose');
var db=mongoose.connect('mongodb://localhost:27017/cellphones');
var Schema=mongoose.Schema;
var detailsSchema=new Schema({
    url: String,
    brand:String,
    model:String,
    price :String, 
});
//var userData=mongoose.model('phones',detailsSchema);
const phones = module.exports = mongoose.model('phones', detailsSchema);

module.exports.saveData = function (item) { // making saveData acessible by  outside world
       var data=new phones(item);
       var promise = data.save();
       return promise;
}
module.exports.closeConnection = function () { //closing connection
   mongoose.connection.close();
   //console.log("mongo db closed");
}


// Get phones
module.exports.getPhones = (callback, limit) => {
	phones.find(callback).limit(limit);
}

