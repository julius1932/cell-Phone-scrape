const express = require('express');
const app=express();
var mongoS = require("./cellPhoneSave")// including the code to get json from mongo
app.route('/phone')
  .get(function (req, res) {
    mongoS.getPhones((err, phones) => {
		if(err){
			throw err;
		}
		//var dat ={op:"88"};
		res.jsonp(phones);
	});
  });
 app.get('/phone/:_id', function(req, res) {
   mongoS.getPhoneById(req.params._id, function(err, phone) {
      if (err) throw err;
      res.jsonp(phone);
      });
   })
  app.post('/phone', function(req, res) {
   mongoS.addPhone(req.body, function(err, phone) {
      if (err) throw err;
      res.jsonp(phone);
   });
  })

app.put('/phone/:_id', function(req, res) {
   mongoS.updatePhone(req.params._id, req.body, {}, function(err, phone) {
      if (err) throw err;
      res.jsonp(phone);
   });
})
app.delete('/phone/:_id', function(req, res) {
   mongoS.removeCleanser(req.params._id, function(err, phone) {
      if (err) throw err;
      res.jsonp(phone);
   });
})

module.exports=app;