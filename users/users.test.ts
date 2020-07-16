import 'jest';
import * as request from 'supertest';

const address: string = (<any>global).address;
const auth: string = (<any>global).auth;

test('get /users', () => {
	return request(address)
		.get('/users')
		.set('Authorization', auth)
		.then(response => {
			expect(response.status).toBe(200);
			expect(response.body.items).toBeInstanceOf(Array);
		}).catch(fail);
});

test('post /users', () => {
	return request(address)
		.post('/users')
		.set('Authorization', auth)
		.send({
			name: 'usuario1',
			email: 'usuario12@email.com',
			password: '123456',
			cpf: '435.543.030-89'
		})
		.then(response => {
			expect(response.status).toBe(200);
			expect(response.body._id).toBeDefined();
			expect(response.body.name).toBe('usuario1');
			expect(response.body.cpf).toBe('435.543.030-89');
			expect(response.body.password).toBeUndefined();
		}).catch(fail);
});

test('get /users/aaaaa - not found', () => {
	return request(address)
		.get('/users/aaaaa')
		.set('Authorization', auth)
		.then(response => {
			expect(response.status).toBe(404);
		}).catch(fail);
});

test('patch /users/:id', () => {
	return request(address)
		.post('/users')
		.set('Authorization', auth)
		.send({
			name: 'usuario2',
			email: 'usuario2@email.com',
			password: '123456',
		})
		.then(response => request(address)
			.patch(`/users/${response.body._id}`)
			.send({
				name: 'usuario2 - patch'
			}))
		.then(response => {
			expect(response.status).toBe(200);
			expect(response.body._id).toBeDefined();
			expect(response.body.name).toBe('usuario2 - patch');
			expect(response.body.email).toBe('usuario2@email.com');
			expect(response.body.password).toBeUndefined();
		})
		.catch(fail);
});
