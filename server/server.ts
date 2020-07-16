import * as restify from 'restify';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import { enviroment } from '../common/enviroment';
import { Router } from '../common/router';
import { mergePatchBodyParser } from './merge-patch.parser';
import { handleError } from './error.handler';
import { tokenParser } from '../security/token.parser';
import { fstat } from 'fs';

export class Server {

	application: restify.Server;

	initializeDb() {
		return mongoose.connect(enviroment.db.url, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		});
	}

	initRoutes(routers: Router[] = []): Promise<any> {
		return new Promise((resolve, reject) => {
			try {

				this.application = restify.createServer({
					name: 'meat-api',
					version: '1.0.0',
					certificate: fs.readFileSync('./security/keys/cert.pem'),
					key: fs.readFileSync('./security/keys/key.pem')
				});

				for (const router of routers) {
					router.applyRoutes(this.application);
				}

				this.application.use(restify.plugins.queryParser());
				this.application.use(restify.plugins.bodyParser());
				this.application.use(mergePatchBodyParser);
				this.application.use(tokenParser);

				//routes
				this.application.listen(enviroment.server.port, () => {
					resolve(this.application);
				});

				this.application.on('restifyError', handleError);

			} catch (error) {
				reject(error);
			}
		});
	}

	bootstrap(routers: Router[] = []): Promise<Server> {
		return this.initializeDb().then(() =>
			this.initRoutes(routers).then(() => this))
	}

	shutdown() {
		return mongoose.disconnect().then(() => this.application.close());
	}
}
