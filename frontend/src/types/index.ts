export type UserRole = "admin" | "team";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse extends User {
    token: string;
}

export interface ApiError {
    message: string;
    success?: boolean;
}