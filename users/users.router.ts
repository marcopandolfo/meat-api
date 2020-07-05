import { ModelRouter } from '../common/model-router';
import * as restify from 'restify'
import { User } from './users.model';
import { NotFoundError } from 'restify-errors';

class UsersRouter extends ModelRouter<User> {

	constructor() {
		super(User);
		this.on('beforeRender', document => {
			document.password = undefined;
		});
	}

	applyRoutes(application: restify.Server) {
		application.get('/users', this.findAll);
		application.get('/users/:id', this.findById);
		application.post('/users', this.save);
		application.put('/users/:id', this.replace);
		application.patch('/users/:id', this.update);
		application.del('/users/:id', this.delete);
	}
}

export const usersRouter = new UsersRouter();
