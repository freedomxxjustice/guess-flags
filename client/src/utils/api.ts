import { initData } from "@telegram-apps/sdk";
import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

const request = async (
  endpoint: string,
  method: string = "GET",
  data?: any
) => {
  const response = await axios.request({
    url: `${BASE_API_URL}/api/${endpoint}`,
    method: method,
    headers: {
      initData: `${initData.raw()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: data ? JSON.stringify(data) : undefined,
  });

  return response;
};

export default request;
