// app/routes.js
module.exports = function(app, passport) {

	var mysql = require('mysql');
	var dbconfig = require('../config/database');
	var con = mysql.createPool(dbconfig.connection);
	con.query('USE time');


	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {


		res.render('index.ejs'); // load the index.ejs file
	});
	// =====================================
	// TASKS  ========
	// =====================================
	app.post('/tasks',isLoggedIn, function(req, res) {
		console.log(req.body.project);
		var project= req.body.project;
		project=project.split(" ");
		var pid=project[0];
		var pname=project[1];
		console.log("Project id :"+pid)
		getTasks(con,pid, function(err,result){
			if(err){
				console.log(err);
			}
			else{
				console.log(result);
				res.render("task.ejs",{task: result, user : req.user,project:pname});
			}
		})

		 // load the index.ejs file
	});


	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/land', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/land', isLoggedIn, function(req, res) {

		getProjects(con,function(err,result){
			if(err){
				console.log(err);
			}
			else{
				console.log(result);
				res.render('land.ejs', {
					 // get the user out of session and pass to template
					 proj : result,
					 user : req.user
				});
			}
		})

	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

//Function get projects

function getProjects(con,callback){
	con.query('Select * from hcdd1prj ORDER BY Proj_id',function(err,res){
		if(err){
			callback(err,null);
		}
		else{
			callback(null,res);

		}
	})
}

// Function get TASKS

function getTasks(con,pid,callback){
	con.query('Select * from hcdd1task where project =?',[pid],function(err,res){
		if(err){
			callback(err,null);
		}else{
			callback(null,res);

		}
	})
}
