const express = require('express');
const {check} = require('express-validator');

const placesController = require('../controllers/places-controller');
const checkAuth = require('../middleware/check.auth');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/:pid', placesController.getPlacebyId);

router.get('/user/:uid', placesController.getPlacesbyUserId);

router.use(checkAuth);

router.post(
	'/',
	fileUpload.single('image'),
	[
		check('title').not().isEmpty(),
		check('description').isLength({min: 5}),
		check('address').not().isEmpty(),
	],
	placesController.creatPlace
);

router.patch(
	'/:pid',
	[check('title').not().isEmpty(), check('description').isLength({min: 5})],
	placesController.updatePlace
);

router.delete('/:pid', placesController.deletePlace);

module.exports = router;
