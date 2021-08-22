const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(express.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images'))); // * returns a file

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

	next();
});

app.use('/api/places', placesRoutes); // * Only if => /api/places is visted

app.use('/api/users', usersRoutes); // * Only if => /api/users is visted

app.use((req, res, next) => {
	const error = new HttpError('Could not find this Route.', 404);
	throw error;
});

// * A special function will only be executed on requests that have an error thrown
app.use((error, req, res, next) => {
	if (req.file) {
		fs.unlink(req.file.path, (err) => console.log(err));
	}
	if (res.headerSent) {
		return next(error);
	}

	res.status(error.code || 500);
	res.json({message: error.message || 'An unknown error occured!!'});
});

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.f2m49.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
	)
	.then(() => app.listen(5000 || process.env.PORT))
	.catch((err) => console.log(err));
