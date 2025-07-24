import axios from "axios";
import { sendToS3 } from "./s3";

const API_URL = "https://node-api-my-fit.vercel.app";
// const API_URL = "http://localhost:3001";

export async function getAllPosts({ token }: { token: string }) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.get(`${API_URL}/posts`, {
      headers: {
        Authorization: token,
      },
    });

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

export async function getMyPosts({ token }: { token: string }) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.get(`${API_URL}/my-posts`, {
      headers: {
        Authorization: token,
      },
    });

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

export async function newPost({
  token,
  title,
  description,
  image,
  postStatus,
}: {
  token: string;
  title?: string | null;
  description?: string | null;
  image?: any | null;
  postStatus?: string | null;
}) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }
    let imageUrl;
    if (!!image) {
      imageUrl = await sendToS3(image, "post", token);
    }

    const body = {
      title: title ? title : null,
      description: description ? description : null,
      image: imageUrl ? imageUrl : null,
      type: postStatus ? +postStatus : 1,
    };

    // console.log(image ? image : "null");

    const response = await axios.post(`${API_URL}/post`, body, {
      headers: {
        Authorization: token,
      },
    });

    if (!!response.data) {
      return response.data;
    }
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

export async function updatePost({
  token,
  title,
  id,
  description,
  image,
  postStatus,
}: {
  token: string;
  id: number;
  title?: string | null;
  description?: string | null;
  image?: any;
  postStatus?: string | null;
}) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    let imageUrl;
    if (!!image) {
      imageUrl = await sendToS3(image, "post", token);
    }

    const body = {
      id: id,
      title: title ? title : null,
      description: description ? description : null,
      image: imageUrl ? imageUrl : null,
      type: postStatus ? +postStatus : 1,
    };

    const response = await axios.put(`${API_URL}/post`, body, {
      headers: {
        Authorization: token,
      },
    });

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

export async function deletePost({
  token,
  id,
}: {
  token: string;
  id: number;
  title?: string;
  description?: string;
  image?: any;
}) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const body = {
      id: id,
    };

    const response = await axios.put(`${API_URL}/delete-post`, body, {
      headers: {
        Authorization: token,
      },
    });

    return response;
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
