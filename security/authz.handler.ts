import * as restify from 'restify';
import { ForbiddenError } from 'restify-errors';

export const authorize: (...profiles: string[]) => restify.RequestHandler = (...profiles) => {
	return (req, resp, next) => {
		if ((<any>req).authenticated !== undefined && (<any>req).authenticated.hasAny(...profiles)) {
			req.log.debug('User %s is authorized with profiles %j on route %s. Required profiles: %j',
				(<any>req).authenticated._id,
				(<any>req).authenticated.profiles,
				req.path(),
				profiles);

			next();
		} else {
			if ((<any>req).authenticated) {
				req.log.debug('Permission denied for %s. Required profiles: %j. User profiles: %j', (<any>req).authenticated._id, profiles, (<any>req).authenticated.profiles);
			}

			next(new ForbiddenError('Permission denied'));
		}
	}
}
