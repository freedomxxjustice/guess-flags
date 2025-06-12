const DEFAULT_URL = "https://c3de53e5b21c9ef4d87cbfe0bc75720c.serveo.net";

import { retrieveLaunchParams } from "@telegram-apps/sdk";
const { initDataRaw } = retrieveLaunchParams();

async function request(endpoint: string, method: string = "get", data?: any) {
  const options: RequestInit = {
    method: method,
    headers: {
      Authorization: `tma ${initDataRaw}`,
      ContentType: "application/json",
      Accept: "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(`${DEFAULT_URL}/api/${endpoint}`, options);
  const jsonData = await response.json();

  if (response.ok) return jsonData;
}

export default request;
