// Type definition for user schema (with password)
export type IUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// Type definition for user response (without password)
export type IUserResponse = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};
  