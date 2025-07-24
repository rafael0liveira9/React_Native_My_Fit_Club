import axios from "axios";

const API_URL = "https://node-api-my-fit.vercel.app";

export async function getFaq() {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.get(`${API_URL}/faq`);

    return response.data;
  } catch (error: any) {
    return {
      status: error?.status,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Ocorreu um erro desconhecido.",
    };
  }
}
