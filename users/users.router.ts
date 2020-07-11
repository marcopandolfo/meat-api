import { ModelRouter } from '../common/model-router';
import * as restify from 'restify'
import { User } from './users.model';

class UsersRouter extends ModelRouter<User> {

	constructor() {
		super(User);
		this.on('beforeRender', document => {
			document.password = undefined;
		});
	}

	findByEmail = (req, resp, next) => {
		if (req.query.email) {
			User.findByEmail(req.query.email)
				.then(user => user ? [user] : [])
				.then(this.renderAll(resp, next))
				.catch(next);
		} else {
			next();
		}
	}

	applyRoutes(application: restify.Server) {
		application.get(`${this.basePath}`, restify.plugins.conditionalHandler([{ version: '2.0.0', handler: [this.findByEmail, this.findAll] }, { version: '1.0.0', handler: this.findAll }]));
		application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
		application.post(`${this.basePath}`, this.save);
		application.put(`${this.basePath}/:id`, [this.validateId, this.replace]);
		application.patch(`${this.basePath}/:id`, [this.validateId, this.update]);
		application.del(`${this.basePath}/:id`, [this.validateId, this.delete]);
	}
}

export const usersRouter = new UsersRouter();
