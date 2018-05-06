// express is the server that forms part of the nodejs program
var express = require('express');
var path = require("path");
var webcontentpath=__dirname+"/www";
var app = express();

	// adding functionality to allow cross-domain queries when PhoneGap is running a server
	app.use(function(req, res, next) {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
		res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		next();
	});
	
	console.log(webcontentpath);
	
	// adding functionality to log the requests
	app.use(function (req, res, next) {
		var filename = path.basename(req.url);
		var extension = path.extname(filename);
		console.log("The file " + filename + " was requested.");
		next();
	});
	
	var bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({
	  extended: true
	}));
	app.use(bodyParser.json());
	
	 var fs = require('fs');
	// read in the file and force it to be a string by adding “” at the beginning
	var configtext =
	""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
	// now convert the configruation file into the correct format -i.e. a name/value pair array
	var configarray = configtext.split(",");
	var config = {};
	for (var i = 0; i < configarray.length; i++) {
	    var split = configarray[i].split(':');
	    config[split[0].trim()] = split[1].trim();
	}
	                             
	var pg = require('pg');
	var pool = new pg.Pool(config);
	
	
	// add an http server to serve files to the Edge browser 
	// due to certificate issues it rejects the https files if they are not
	// directly called in a typed URL
	var http = require('http');
	var httpServer = http.createServer(app); 



	httpServer.listen(4443);

	//add question
	 app.post('/addquestion', function (req,res) {
		 console.dir(req.body);
		 
		  pool.connect(function(err,client,done) {
		         if(err){
		             console.log("not able to get connection "+ err);
		             res.status(400).send(err);
		  }
		         var str="st_geomfromtext('POINT(" + req.body.lat + " " + req.body.lng + ")')";
		         //把问题插入到questions表中
		         client.query("insert into questions(question,option1,option2,option3,option4,answer,geom)values('"+req.body.question+"','"+req.body.option1+"','"+req.body.option2+"','"+req.body.option3+"','"+req.body.option4+"',"+req.body.answer+","+str+")"
		  ,function(err,result) {
		             done();
		             if(err){
		                 console.log(err);
		                 res.status(400).send(err);
		             }
		             res.status(200).send("ok");
		         });
		  }); });
	 
	//update question
	 app.post('/updatequestion', function (req,res) {
		 console.dir(req.body);
		 
		  pool.connect(function(err,client,done) {
		         if(err){
		             console.log("not able to get connection "+ err);
		             res.status(400).send(err);
		  }
		         var str="st_geomfromtext('POINT(" + req.body.lat + " " + req.body.lng + ")')";
		         //把问题插入到questions表中
		         client.query("update questions set question='"+req.body.question+"',option1='"+req.body.option1+"',option2='"+req.body.option2+"',option3='"+req.body.option3+"',option4='"+req.body.option4+"',answer="+req.body.answer+",geom="+str+" where id="+req.body.id
		  ,function(err,result) {
		             done();
		             if(err){
		                 console.log(err);
		                 res.status(400).send(err);
		             }
		             res.status(200).send("ok");
		         });
		  }); });
	 //get all questions
	 app.get('/getallquestions', function (req,res) {
		  pool.connect(function(err,client,done) {
		         if(err){
		             console.log("not able to get connection "+ err);
		             res.status(400).send(err);
		  }
		         client.query('SELECT id,question,option1,option2,option3,option4,answer,st_x(geom) as lat,st_y(geom)as lng FROM questions'
		  ,function(err,result) {
		             done();
		             if(err){
		                 console.log(err);
		                 res.status(400).send(err);
		             }
		             res.status(200).send(result.rows);
		         });
		  }); });

	
	 
	 //delete question by id
	 app.post('/delquestion', function (req,res) {
		  pool.connect(function(err,client,done) {
		         if(err){
		             console.log("not able to get connection "+ err);
		             res.status(400).send(err);
		  }
		         client.query('delete FROM questions where id='+req.body.id
		  ,function(err,result) {
		             done();
		             if(err){
		                 console.log(err);
		                 res.status(400).send(err);
		             }
		             res.status(200).send("ok");
		         });
		  }); });
	
	
	 
	 //提交问题答案
	 app.post('/commitanswer', function (req,res) {
		  pool.connect(function(err,client,done) {
		         if(err){
		             console.log("not able to get connection "+ err);
		             res.status(400).send(err);
		  }
		       
		    //把用户的选中保存到useranswers表中
		   client.query("insert into useranswers(phoneid,question,answer,correct,createtime) select '"+req.body.phoneid+"',question,option"+req.body.answer+","+req.body.correct+",now() from questions where id="+req.body.questionid
		  ,function(err,result) {
		             done();
		             if(err){
		                 console.log(err);
		                 res.status(400).send(err);
		             }
		             res.status(200).send("ok");
		         });
		  }); });
	 
	 app.get('/',function (req,res) {
			res.send("hello world from the HTTP server");
		});
 

	// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
  app.get('/:name1', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
  console.log('request '+req.params.name1);

  // the res is the response that the server sends back to the browser - you will see this text in your browser window
  res.sendFile(webcontentpath + '/'+req.params.name1);
});


  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
  app.get('/:name1/:name2', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
  console.log('request '+req.params.name1+"/"+req.params.name2);

  // the res is the response that the server sends back to the browser - you will see this text in your browser window
  res.sendFile(webcontentpath + '/'+req.params.name1+'/'+req.params.name2);
});


	// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
	app.get('/:name1/:name2/:name3', function (req, res) {
		// run some server-side code
		// the console is the command line of your server - you will see the console.log values in the terminal window
		console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3); 
		// send the response
		res.sendFile(webcontentpath + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3);
	});
  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
  app.get('/:name1/:name2/:name3/:name4', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
 console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3+"/"+req.params.name4); 
  // send the response
  res.sendFile(webcontentpath + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3+"/"+req.params.name4);
});
  
 

