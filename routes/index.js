var fs=require('fs');
var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/getList',function(req,res){
	var content='';
	for(var key in req.body){
		content+=req.body[key]+'\n';
	}
	fs.writeFile('./public/download/list.txt',content,function(err){
		if(!err){
			res.send({error_code:0,download_url:'/download/list.txt'});
		}
		else{
			res.send({error_code:1,err:err});
		}
	});
});

module.exports = router;
