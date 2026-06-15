export type FinanceType = "income" | "expense";

export interface IFinance {
	_id?: string;
	user: string;
	type: FinanceType;
	balance: number;
	description?: string;
	date?: string | Date;
	createdAt?: string;
	updatedAt?: string;
}

export interface ICreateFinance {
	user?: string;
	type: FinanceType;
	balance: number;
	description?: string;
	date?: string | Date;
}

export type IUpdateFinance = Partial<ICreateFinance>;

export interface IFinanceQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	startDate?: string;
	endDate?: string;
}

export interface IMonthlyReport {
	year: number;
	month: number;
	income: number;
	expense: number;
	net: number;
	details: IFinance[];
}

export interface IFinanceListResponse {
	data: IFinance[];
	meta?: {
		total: number;
		totalPages: number;
		currentPage: number;
	};
	message?: string;
}

