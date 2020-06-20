import * as Restify from 'restify';

export abstract class Router {
	abstract applyRoutes(application: Restify.Server);
}
