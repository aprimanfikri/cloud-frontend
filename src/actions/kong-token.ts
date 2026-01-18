"use server";

import axios from "axios";
import axiosRetry from "axios-retry";

interface TokenBody {
  clientId: string;
  clientSecret: string;
  grantType: string;
}

export async function fetchKongToken() {
  const tokenUrl = process.env.KONG_TOKEN_URL;
  const clientId = process.env.KONG_CLIENT_ID;
  const clientSecret = process.env.KONG_CLIENT_SECRET;

  if (!tokenUrl || !clientId || !clientSecret) {
    throw new Error("Missing environment variables for Kong token fetch");
  }

  const body: TokenBody = {
    clientId,
    clientSecret,
    grantType: "client_credentials",
  };

  const client = axios.create();

  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response ? error.response.status >= 500 : false)
      );
    },
  });

  try {
    const response = await client.post(tokenUrl, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching Kong token:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Kong token fetch failed: ${error.response?.status} ${error.response?.statusText} - ${JSON.stringify(
          error.response?.data,
        )}`,
      );
    }
    throw error;
  }
}
