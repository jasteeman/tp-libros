import axios from "axios";
import { handleRequestError, logout } from "../auth/AuthService";
import { Libro } from "../interfaces/ILibro";

const { VITE_AUTH_BASE_URL,VITE_TOKEN } = import.meta.env; 

const BASE_URL = `${VITE_AUTH_BASE_URL}/libros`;

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

export const createLibro = async (libro: Omit<Libro, 'id'>): Promise<Libro | null> => {
  try {
    const response = await instance.post<Libro>('/', libro, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};
export const getLibros = async ( params:string | undefined
): Promise<{ rows: Libro[]; count: number } | null> => {
  try { 
    const response = await instance.get<{ rows: Libro[]; count: number }>(`?${params?.toString()}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};

export const getLibro = async (id: number): Promise<Libro | null> => {
  try {
    const response = await instance.get<Libro>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};

export const updateLibro = async (id: number, libro: Omit<Libro, 'id'>): Promise<Libro | null> => {
  try {
    const response = await instance.patch<Libro>(`/${id}`, libro, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};

export const deleteLibro = async (id: number): Promise<number | null> => {
  try {
    const response = await instance.delete<number>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};

export const exportLibrosExcel = async (): Promise<Blob | null> => {
  try {
    const response = await instance.get('/export/excel', {
      headers: getToken(),
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};