const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, '-password'); // * wont send back the password!
	} catch (err) {
		const error = new HttpError('Fetching users failed, please try again later.', 500);
		return next(error);
	}
	res.json({users: users.map((user) => user.toObject({getters: true}))});
};

const signupUsers = async (req, res, next) => {
	const errors = validationResult(req); // * will return you Errors object
	if (!errors.isEmpty()) {
		return next(new HttpError('Invalid inputs passed, please check your data', 422));
	}

	const {name, email, password} = req.body;

	let existingUser;

	try {
		existingUser = await User.findOne({email: email});
	} catch (err) {
		const error = new HttpError('Signup failed, Please try again', 500);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError('User Already Exists, please loging instead', 422);
		return next(error);
	}

	let hashedPassword;

	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError('Could not Create user, Please try again', 500);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		image: req.file.path,
		password: hashedPassword,
		places: [],
	});

	try {
		await createdUser.save(); // * save method will handle all the methods you need to store in the database
	} catch (err) {
		const error = new HttpError('Creating user failed, Please try again', 500);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign({userId: createdUser.id, email: createdUser.email}, process.env.JWT_KEY, {
			expiresIn: '1h',
		});
	} catch (err) {
		return next(new HttpError('Signup failed, Please try again', 500));
	}

	res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});
};

const loginUsers = async (req, res, next) => {
	const {email, password} = req.body;

	let existingUser;

	try {
		existingUser = await User.findOne({email: email});
	} catch (err) {
		const error = new HttpError('Logging in failed, please try again later.', 500);
		return next(error);
	}

	if (!existingUser) {
		const error = new HttpError('Invalid credentials, could not log you in.', 403);
		return next(error);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (err) {
		return next(new HttpError('Invalid Credentials, Please Try again', 500));
	}

	if (!isValidPassword) {
		const error = new HttpError('Invalid credentials, could not log you in.', 403);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{userId: existingUser.id, email: existingUser.email},
			process.env.JWT_KEY, // * always make sure you use the same key, for login/signup
			{expiresIn: '1h'}
		);
	} catch (err) {
		return next(new HttpError('Loggin in failed, Please try again', 500));
	}

	res.json({
		message: 'Logged in!',
		userId: existingUser.id,
		email: existingUser.email,
		token: token,
	});
};

exports.getUsers = getUsers;
exports.signupUsers = signupUsers;
exports.loginUsers = loginUsers;
