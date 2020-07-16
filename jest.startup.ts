import * as jestCli from 'jest-cli';
import { Server } from './server/server';
import { enviroment } from './common/enviroment';
import { usersRouter } from './users/users.router';
import { User } from './users/users.model';
import { reviewsRouter } from './reviews/reviews.router';
import { Review } from './reviews/reviews.model';

let server: Server;

const beforeAllTests = () => {
	enviroment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db';
	enviroment.server.port = 3001;
	server = new Server();

	return server.bootstrap([
		usersRouter,
		reviewsRouter,
	])
		.then(() => User.remove({}).exec())
		.then(() => Review.remove({}).exec());
};


const afterAllTests = () => {
	return server.shutdown();
};


beforeAllTests()
	.then(() => jestCli.run())
	.then(() => {
		let admin = new User();
		admin.name = 'admin';
		admin.email = 'admin@email.com';
		admin.password = '123456';
		admin.profiles = ['admin', 'user'];
		return admin.save();
	})
	.then(() => afterAllTests())
	.catch(console.error);
