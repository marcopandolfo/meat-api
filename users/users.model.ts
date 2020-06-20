const users = [
	{ id: '1', name: 'Peter Parker', email: 'peter@marvel.com' },
	{ id: '2', name: 'Bruce Wayne', email: 'bruce@marvel.com' },
];

export class User {
	static findAll(): Promise<any> {
		return Promise.resolve(users);
	}
	static findById(id: string): Promise<any> {
		return Promise.resolve(users.filter(u => u.id === id)[0]);
	}
}
