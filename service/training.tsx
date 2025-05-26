import { Serie, Training } from "@/model/training";
import axios from "axios";

const API_URL = "https://node-api-my-fit.vercel.app";
// const API_URL = "http://localhost:3001";

export async function getTrainingById({
  token,
  id,
}: {
  token: string;
  id: string;
}) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.get(`${API_URL}/training/${id}`, {
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

export async function getTrainingsByToken({ token }: { token: string }) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.get(`${API_URL}/trainings`, {
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

export async function CreateTraining({
  name,
  description,
  level,
  url,
  photo,
  token,
}: Training) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.post(
      `${API_URL}/training`,
      {
        name: name,
        description: description,
        level: level,
        url: url,
        photo: photo,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

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

export async function EditTraining({
  id,
  name,
  description,
  level,
  url,
  photo,
  token,
}: Training) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }
    const response = await axios.put(
      `${API_URL}/training`,
      {
        id,
        name,
        description,
        level,
        url,
        photo,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.log("response", error);
    return {
      status: error?.status,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Ocorreu um erro desconhecido.",
    };
  }
}

export async function updatePhoto(
  id: string,
  file: any,
  path: string,
  token: string
) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    formData.append("id", id);

    const response = await axios.put(`${API_URL}/photo-training`, formData, {
      headers: {
        Authorization: token,
        "content-type": "multipart/form-data",
      },
    });

    return response.data;
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

export async function getGroups({ token }: { token: string }) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.get(`${API_URL}/groups`, {
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

export async function getExercises({
  token,
  isFull,
}: {
  token: string;
  isFull?: boolean;
}) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.get(`${API_URL}/exercises`, {
      headers: {
        Authorization: token,
      },
    });

    if (!isFull) {
      return response.data.map((e: any) => ({
        value: e.id,
        label: e.name,
        groupMuscleId: e.groupMuscleId,
      }));
    } else {
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

export async function getExercisesByGroup({
  token,
  group,
}: {
  token: string;
  group: string;
}) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    const response = await axios.get(`${API_URL}/exercises/${group}`, {
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

// export async function CreateStep({
//   name,
//   description,
//   trainingId,
//   token,
// }: Training) {
//   try {
//     if (!API_URL) {
//       throw new Error("API URL não encontrada no extra do app.json.");
//     }

//     const response = await axios.post(
//       `${API_URL}/step`,

//       {
//         name: name,
//         description: description,
//         trainingId: trainingId,
//       },
//       {
//         headers: {
//           Authorization: token,
//         },
//       }
//     );

//     return response.data;
//   } catch (error: any) {
//     return {
//       status: error?.status,
//       message:
//         error?.response?.data?.message ||
//         error.message ||
//         "Ocorreu um erro desconhecido.",
//     };
//   }
// }

export async function CreateSerie({
  trainingId,
  serieId,
  exercise,
  difficulty,
  interval,
  addSet,
  bisetExerciseId,
  amount,
  repetitions,
  isometry,
  token,
}: Serie) {
  try {
    if (!API_URL) {
      throw new Error("API URL não encontrada no extra do app.json.");
    }

    let response;

    if (serieId) {
      console.log("1");
      response = await axios.put(
        `${API_URL}/serie`,

        {
          id: serieId,
          exercise: exercise,
          difficulty: difficulty,
          interval: interval,
          addSet: addSet,
          amount: amount,
          isometry: amount,
          repetitions: repetitions,
          bisetExerciseId: bisetExerciseId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
    } else {
      console.log("2");
      response = await axios.post(
        `${API_URL}/serie`,

        {
          trainingId: trainingId,
          exercise: exercise,
          difficulty: difficulty,
          interval: interval,
          addSet: addSet,
          amount: amount,
          isometry: amount,
          repetitions: repetitions,
          bisetExerciseId: bisetExerciseId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
    }
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return {
      status: error?.status,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Ocorreu um erro desconhecido.",
    };
  }
}
