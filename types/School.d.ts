export interface ISchool {
	_id: string;
	name: string;
	address?: string;
	phone?: string;
	email?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface ICreateSchool {
	name: string;
	address?: string;
	phone?: string;
	email?: string;
}

export interface IUpdateSchool {
	name?: string;
	address?: string;
	phone?: string;
	email?: string;
}

export {}

