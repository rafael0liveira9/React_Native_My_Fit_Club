import axios from "axios";

const API_URL = "https://node-api-my-fit.vercel.app";

export async function sendToS3(file: any, path: string, token: string) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const response = await axios.post(`${API_URL}/upload-image`, formData, {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data",
      },
    });

    // ✅ Retorna só a URL
    return response.data.url;
  } catch (error: any) {
    if (error.response) {
      console.log("response error", error.response.data);
      console.log("response status", error.response.status);
    } else if (error.request) {
      console.log("request error", error.request);
    } else {
      console.log("general error", error.message);
    }
    return {
      status: error?.response?.status || error?.status,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Ocorreu um erro desconhecido.",
    };
  }
}
