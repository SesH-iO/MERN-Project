const fs = require('fs');
const {v4: uuidv4} = require('uuid');
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

// * -----------------------------------------------------
const getPlacebyId = async (req, res, next) => {
	const placeId = req.params.pid; // {pid: p1}

	let place;
	try {
		// * findById() does not return a promise!! and still then() catch(), async/await will be available becaouse of mongoose.
		// * by adding .exec() you will get a real promise!.
		place = await Place.findById(placeId);
	} catch (err) {
		// * get request failed from database
		const error = new HttpError('Something went wrong!! Could not find a place', 500);

		return next(error);
	}

	if (!place) {
		// next(error); // * For Async func only
		return next(new HttpError('Could not find a place for the provied id', 404));
	}

	// => {place} = {place: place}
	// * basically we are telling the db to add an id property without the underscore when we pass toObject()
	res.json({place: place.toObject({getters: true})});
};

const getPlacesbyUserId = async (req, res, next) => {
	const userId = req.params.uid;

	// let places;
	let userWithPlaces;

	try {
		// * findById() does not return a promise!! and still then() catch(), async/await will be available becaouse of mongoose specific feature.
		// * by adding .exec() you will get a real promise!.
		userWithPlaces = await User.findById(userId).populate('places');
	} catch (err) {
		// * get request failed from database
		const error = new HttpError('Something went wrong!!, Fetching place by Id Failed', 500);
		return next(error);
	}

	if (!userWithPlaces) {
		const error = new HttpError('Could not find a places for the provied User id', 404);
		next(error); // * For Async func only
	}

	// * Since find( ) returns an array,  we can't use toObject() instead we use the standard map() and then convert it to object by using toObject()
	res.json({userWithPlaces: userWithPlaces.places.map((place) => place.toObject({getters: true}))}); // => {place} = {place: place}
};
// * -----------------------------------------------------

// * -----------------------------------------------------
const creatPlace = async (req, res, next) => {
	const errors = validationResult(req); // * will return you Errors object
	if (!errors.isEmpty()) {
		next(new HttpError('Invalid inputs passed, please check your data', 422));
	}

	const {title, description, address} = req.body;

	let coordinates;
	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error); // * quit the execution by giving the return statment
	}

	const createdPlace = new Place({
		title,
		description,
		address,
		location: coordinates,
		image: req.file.path,
		creator: req.userData.userId,
	});

	let user;

	try {
		user = await User.findById(req.userData.userId);
	} catch (err) {
		const error = new HttpError('Creating place failed, Please try again', 500);
		return next(error);
	}

	if (!user) {
		const error = new HttpError('Could not find user for Provided id', 404);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdPlace.save({session: sess});
		user.places.push(createdPlace);
		await user.save({session: sess});
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError('Creating place failed, please try again.', 500);
		return next(error);
	}

	// try {

	// 	// await createdPlace.save(); // * save method will handle all the methods you need to store in the database
	// } catch (err) {
	// 	const error = new HttpError('Creating place failed, Please try again', 500);
	// 	return next(error);
	// }

	res.status(201).json({place: createdPlace});
};
// * -----------------------------------------------------

// * -----------------------------------------------------
const updatePlace = async (req, res, next) => {
	const errors = validationResult(req); // * will return you Errors object
	if (!errors.isEmpty()) {
		return next(new HttpError('Invalid ipnuts passed, please check your data', 422));
	}

	const {title, description} = req.body;
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError('Somthing went wrong!! Place Update Failed', 500);
		return next(error);
	}

	if (place.creator.toString() !== req.userData.userId) {
		const error = new HttpError('Place Update Failed, Your not allowed to edit this Place', 401);
		return next(error);
	}

	place.title = title;
	place.description = description;

	try {
		await place.save();
	} catch (err) {
		const error = new HttpError('Somthing went wrong!! Place Update Failed', 500);
		return next(error);
	}

	res.status(200).json({place: place.toObject({getters: true})});
};
// * -----------------------------------------------------

// * -----------------------------------------------------
const deletePlace = async (req, res, next) => {
	const placeId = req.params.pid;

	let place;
	try {
		// * popluated refers to a document stored in a another collection and to wrk with data in that existing document of that other collection
		// * for this we need relation between these two documents, relations are established in user.js file
		// * only if this connection is existing, then we are allowed to use populate
		place = await Place.findById(placeId).populate('creator');
	} catch (err) {
		const error = new HttpError('Somthing went wrong!! deleting Place Failed', 500);
		return next(error);
	}

	if (!place) {
		const error = new HttpError('deleting Place Failed, could not find a place with this ID', 404);
		return next(error);
	}

	if (place.creator.id !== req.userData.userId) {
		const error = new HttpError('Your not allowed to Delete this Place', 401);
		return next(error);
	}

	const imagePath = place.image;

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await place.remove({session: sess});
		place.creator.places.pull(place);
		await place.creator.save({session: sess});
		await sess.commitTransaction();
		// await place.remove();
	} catch (err) {
		const error = new HttpError('Something went wrong!! deleting Place Failed', 500);
		return next(error);
	}

	fs.unlink(imagePath, (err) => {
		console.log(err);
	});

	res.status(200).json({message: 'Deleted Palce.'});
};
// * -----------------------------------------------------

exports.getPlacebyId = getPlacebyId;
exports.getPlacesbyUserId = getPlacesbyUserId;
exports.creatPlace = creatPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
