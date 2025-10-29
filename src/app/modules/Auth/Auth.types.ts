// Auth request types
export type ILoginRequest = {
  email: string;
  password: string;
};

// Auth response types
export type IRegisterResponse = {
  email: string;
  firstName: string;
  lastName: string;
  _id: string;
};

export type ILoginResponse = {
  token: string;
};
