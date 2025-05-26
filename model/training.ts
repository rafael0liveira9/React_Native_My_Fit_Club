export interface Training {
  id?: number;
  name: string;
  description?: string;
  level?: number;
  url?: string;
  photo?: string;
  token?: string;
  trainingId?: number;
}
export interface Serie {
  serieId?: number;
  trainingId?: number;
  exercise?: number;
  interval?: number;
  repetitions?: number;
  token?: string;
  difficulty?: string[];
  addSet?: number;
  bisetExerciseId?: number | null | undefined;
  isometry?: number;
  amount?: number;
}
