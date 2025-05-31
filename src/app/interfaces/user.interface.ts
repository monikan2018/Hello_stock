export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Optional because it's only used during registration/login
} 