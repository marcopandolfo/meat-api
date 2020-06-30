import * as mongoose from 'mongoose';
import { validateCPF } from '../common/validator';
import { Next } from 'restify';
import * as bcrypt from 'bcrypt';
import { enviroment } from '../common/enviroment';

export interface User extends mongoose.Document {
	name: string,
	email: string,
	password: string,
}

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxlength: 80,
		minlength: 3,
	},
	email: {
		type: String,
		unique: true,
		match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		required: true,
	},
	password: {
		type: String,
		select: false,
		required: true,
	},
	gender: {
		type: String,
		required: false,
		enum: ['Male', 'Female'],
	},
	cpf: {
		type: String,
		required: false,
		validate: {
			validator: validateCPF,
			message: '{PATH} Invalid CPF ({VALUE})'
		}
	},
});

const hashPassword = (obj, next) => {
	bcrypt.hash(obj.password, enviroment.security.saltRounds).then(hash => {
		obj.password = hash;
		next();
	}).catch(next);
};

const saveMiddleware = function (next: Next) {
	const user: User = <User>this;

	if (!user.isModified('password')) {
		next();
	} else {
		hashPassword(user, next);
	}
};

const updateMiddleware = function (next: Next) {
	if (!this.getUpdate().password) {
		next();
	} else {
		hashPassword(this.getUpdate(), next);
	}
};

userSchema.pre('save', saveMiddleware);
userSchema.pre('findOneAndUpdate', updateMiddleware);
userSchema.pre('update', updateMiddleware);

export const User = mongoose.model<User>('User', userSchema);
