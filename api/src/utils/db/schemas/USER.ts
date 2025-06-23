export interface User {
  id: number;
  userId: string;
  username: string;
  profilePicture: string;
  email?: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  roles?: string[];
}