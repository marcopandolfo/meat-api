import * as restify from 'restify';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as corsMiddleware from 'restify-cors-middleware';
import { enviroment } from '../common/enviroment';
import { Router } from '../common/router';
import { mergePatchBodyParser } from './merge-patch.parser';
import { handleError } from './error.handler';
import { tokenParser } from '../security/token.parser';
import { logger } from '../common/logger';

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

				const options: restify.ServerOptions = {
					name: 'meat-api',
					version: '1.0.0',
					log: logger,
				};

				if (enviroment.security.enableHTTPS) {
					options.certificate = fs.readFileSync(enviroment.security.certificate);
					options.key = fs.readFileSync(enviroment.security.key);
				}

				this.application = restify.createServer(options);

				const corsOptions: corsMiddleware.Options = {
					preflightMaxAge: 10,
					origins: ['http://localhost:4200'],
					allowHeaders: ['authorization'],
					exposeHeaders: ['x-custom-header']
				};

				const cors: corsMiddleware.CorsMiddleware = corsMiddleware(corsOptions);

				this.application.pre(cors.preflight);
				this.application.pre(restify.plugins.requestLogger({
					log: logger,
				}));

				for (const router of routers) {
					router.applyRoutes(this.application);
				}

				this.application.use(cors.actual);
				this.application.use(restify.plugins.queryParser());
				this.application.use(restify.plugins.bodyParser());
				this.application.use(mergePatchBodyParser);
				this.application.use(tokenParser);

				//routes
				this.application.listen(enviroment.server.port, () => {
					resolve(this.application);
				});

				this.application.on('restifyError', handleError);
				this.application.on('after', restify.plugins.auditLogger({
					log: logger,
					event: 'after',
					server: this.application,
				}));

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
