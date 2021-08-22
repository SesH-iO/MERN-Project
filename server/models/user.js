const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true, minlength: 6},
	image: {type: String, required: true}, // url only
	places: [{type: mongoose.Types.ObjectId, required: true, ref: 'Place'}],
});

// * to make sure not to have duplicate emails in database
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
