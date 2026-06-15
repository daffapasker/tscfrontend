export interface ILogin {
  username: string;
  password: string;
}

export interface ILoginCoach {
  name: string;
  password: string;
}

export interface IUser {
  _id?: string;
  username?: string;
  role?: string;
  email?: string;
}

export interface AuthResponse {
  message?: string;
  data?: IUser;
}
