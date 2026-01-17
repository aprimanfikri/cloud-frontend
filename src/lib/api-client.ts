import axios from "axios";
import axiosRetry from "axios-retry";
import { fetchKongToken } from "../actions/kong-token";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response ? error.response.status >= 500 : false)
    );
  },
});

interface TokenData {
  accessToken?: string;
}

let tokenPromise: Promise<TokenData> | null = null;

apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (!tokenPromise) {
        tokenPromise = fetchKongToken().catch((err) => {
          tokenPromise = null;
          throw err;
        });
      }

      const tokenData = await tokenPromise;
      if (tokenData?.accessToken) {
        config.headers.Authorization = `Bearer ${tokenData.accessToken}`;
      }
    } catch (error) {
      console.error("Failed to inject auth token:", error);
      return Promise.reject(error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
