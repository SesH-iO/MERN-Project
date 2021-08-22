class HttpError extends Error {
	constructor(message, errorCode) {
		super(message); // Add a "Message" property
		this.code = errorCode; // adds a "code" property
	}
}

module.exports = HttpError;
