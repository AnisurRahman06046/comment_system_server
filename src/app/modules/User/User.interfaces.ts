import { UserRole, UserStatus } from "./User.constants";

// Type definition for address
export type IAddress = {
    street: string;
    city: string;
    state: string;
    postCode: string;
    country: string;
  };
  
  // Type definition for contact information
  export type IContactInfo = {
    phoneNumber: string;
    emergencyContact: string;
  };
  
  // Type definition for password history
  export type IPasswordHistory = {
    oldPassword: string;  // The hashed old password
    changedAt: Date;      // Date when the password was changed
  };
  
  // Type definition for login history
  export type ILoginHistory = {
    ipAddress: string;    // IP address used during login
    loginAt: Date;        // Date and time of the login
  };
  

  
  // Type definition for user schema
  export type IUser = {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    role: UserRole[];              
    presentAddress?: IAddress;
    permanentAddress?: IAddress;
    contactInfo?: IContactInfo;
    status: UserStatus;            // Using enum for status
    passwordChangedCount?: number;  // The number of times the password has been changed
    passwordHistory?: IPasswordHistory[]; // Array to store old passwords and change dates
    loginCount?: number;            // The number of times the user has logged in
    loginHistory?: ILoginHistory[]; // Array to store IP addresses and login dates
  };
  