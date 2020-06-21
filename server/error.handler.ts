import * as restify from 'restify';

export const handleError = (req: restify.Request, resp: restify.Response, err, done) => {

	err.toJson = () => {
		return {
			message: err.message,
		}
	};

	switch (err.name) {
		case 'MongoError':
			if (err.code === 11000) {
				err.statusCode = 400;
			}
			break;

		case 'ValidationError':
			err.statusCode = 400;
			break;
	}

	done();
};
