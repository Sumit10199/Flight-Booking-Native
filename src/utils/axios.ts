import axios, { AxiosError, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Localhost won't work in React Native emulator/phone
// Replace with your machine IP if running locally, e.g.:
// const BASE_URL = "http://192.168.1.10:3001";
const BASE_URL = "https://a3adbf150383.ngrok-free.app";

interface IFaceGlobalResponseType<T> {
  status: number;
  errors?: string[];
  data: T;
}

export type GlobalResponseType<
  T extends {
    status: boolean;
  }
> = IFaceGlobalResponseType<T>;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ✅ Add request interceptor for token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = token;
      }
    } catch (err) {
      console.warn("Error reading token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Add response interceptor for 401 handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized, logging out...");
      await AsyncStorage.removeItem("token");
      // You can also trigger a logout action or navigate to login screen
      // Example (if using React Navigation):
      // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// ---------------------
// Helper API Functions
// ---------------------

export const fetchData = async ({
  url,
  abortSignal,
}: {
  url: string;
  abortSignal?: AbortSignal;
}) => {
  console.log('url', url);

  const response = await axiosInstance.get(url, { signal: abortSignal });
  return {
    status: response.status,
    data: response.data,
  };
};

interface IFacePostData<T> {
  url: string;
  body: T;
  abortSignal?: AbortSignal;
}

export const postData = async <T>({
  url,
  body,
  abortSignal,
}: IFacePostData<T>) => {
  console.log('url', url);

  const response = await axiosInstance.post(url, body, { signal: abortSignal });
  return {
    status: response.status,
    data: response.data,
  };
};
