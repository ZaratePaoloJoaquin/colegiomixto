/* Defino las rutas, pero primero defino un modulo para exportar
esto será una funcionm, en la cual voy a recibir la configuracion de 
express y el passport, luego comienzo a configurar las rutas  */

module.exports = (app, passport) => {

	//Que me muestre el login cuando recibo una peticion GET a la ruta inicial 
	app.get('/', (req, res) => {
		res.render('login.ejs', {
			mensaje: req.flash('loginMessage')
		});
	});

	app.post('/', passport.authenticate('local-login', {
		successRedirect: '/students',
		failureRedirect: '/',
		failureFlash: true
	}));

	app.get('/signup', (req, res) => {
		res.render('signup', {
			mensaje: req.flash('signupMessage')
		});
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash: true 
	}));

	app.get('/profile', isLoggedIn, async (req, res) => {
		try {
			const students = await Student.find();
			res.render('profile', {
				user: req.user,
				students: students
			});
		} catch (error) {
			console.error('Error fetching students:', error);
			res.render('profile', {
				user: req.user,
				students: []
			});
		}
	});

	app.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/');
	});
};

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}
