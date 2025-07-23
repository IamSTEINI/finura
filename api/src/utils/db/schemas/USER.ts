export interface User {
  id: number;
  userId: string;
  firstname: string;
  lastname: string;
  username: string;
  profilePicture: string;
  email?: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  roles?: string[];
}