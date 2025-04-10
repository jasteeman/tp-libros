import axios from "axios";
import { IUser } from "../interfaces/IUser";
import { handleRequestError, logout } from "../auth/AuthService";

const { VITE_AUTH_BASE_URL,VITE_TOKEN } = import.meta.env; 

const BASE_URL = `${VITE_AUTH_BASE_URL}/usuarios`;

const instance = axios.create({
  baseURL: BASE_URL,
});

export const getToken = (): any => {
  const token = localStorage.getItem(VITE_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : null;
};

let isLoggingOut = false;
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !isLoggingOut) {
      isLoggingOut = true;
      logout();
    }
    return Promise.reject(error);
  }
);

export const getUsers = async (queryString?: string): Promise<{ rows: IUser[]; count: number } | null> => {
  try {
    const response = await instance.get<{ rows: IUser[]; count: number }>(`?${queryString ? queryString : ''}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};

export const searchUsers = async (search: string): Promise<IUser[] | null> => {
  if (search.length < 3) return null;
  try {
    const response = await instance.get<IUser[]>(`/search?q=${search}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};

// Crear un nuevo usuario
export const createUser = async (user: Omit<IUser, 'id'>): Promise<IUser | null> => {
  try {
    const response = await instance.post<IUser>(`/`, user, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};

// Obtiene un usuario por su ID
export const getUser = async (id: number): Promise<IUser | null> => {
  try {
    const response = await instance.get<IUser>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};

// Actualiza la información de un usuario
export const updateUser = async (id: number, user: Omit<IUser, 'id'>): Promise<IUser | null> => {
  try {
    const response = await instance.patch<IUser>(`/${id}`, user, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};
 
export const deleteUser = async (id: number): Promise<number | null> => {
  try {
    const response = await instance.delete<number>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};