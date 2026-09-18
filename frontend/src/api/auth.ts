import api from "./axios";
import type { AuthResponse, User } from "../types";

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>("/auth/login", { email, password });
    return data.data;
};

export const register = async (
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>("/auth/register", {
        name,
        email,
        password,
    });
    return data.data;
};

export const getMe = async (): Promise<User> => {
    const { data } = await api.get<{ success: boolean; user: User }>("/auth/me");
    return data.user;
};

export const createUserByAdmin = async (
    name: string,
    email: string,
    password: string
): Promise<User> => {
    const { data } = await api.post<{ success: boolean; data: User }>("/auth/create-user", {
        name,
        email,
        password,
    });
    return data.data;
};