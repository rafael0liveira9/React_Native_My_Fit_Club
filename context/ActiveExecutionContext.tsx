import { getTrainingsByToken } from "@/service/training";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ActiveExecutionContextType {
  activeExecutionId: number | null;
  refreshActiveExecution: () => void;
  isLoading: boolean;
}

const ActiveExecutionContext = createContext<
  ActiveExecutionContextType | undefined
>(undefined);

export function ActiveExecutionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeExecutionId, setActiveExecutionId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const refreshActiveExecution = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        // Busca todos os treinos e filtra a execução ativa
        const myTrainings = await getTrainingsByToken({ token });

        if (myTrainings && Array.isArray(myTrainings)) {
          // Procura por um treino com execução iniciada mas não finalizada
          const activeExecution = myTrainings.find(
            (training: any) =>
              training?.training?.trainingExecution &&
              Array.isArray(training?.training?.trainingExecution) &&
              training?.training?.trainingExecution.length > 0 &&
              training?.training?.trainingExecution[0]?.startAt &&
              !training?.training?.trainingExecution[0]?.endAt
          );

          if (activeExecution?.training?.trainingExecution[0]?.id) {
            setActiveExecutionId(
              activeExecution.training.trainingExecution[0].id
            );
          } else {
            setActiveExecutionId(null);
          }
        } else {
          setActiveExecutionId(null);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar execução ativa:", error);
      setActiveExecutionId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshActiveExecution();

    // Atualizar a cada 30 segundos
    const interval = setInterval(refreshActiveExecution, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ActiveExecutionContext.Provider
      value={{ activeExecutionId, refreshActiveExecution, isLoading }}
    >
      {children}
    </ActiveExecutionContext.Provider>
  );
}

export function useActiveExecution() {
  const context = useContext(ActiveExecutionContext);
  if (!context) {
    throw new Error(
      "useActiveExecution must be used within ActiveExecutionProvider"
    );
  }
  return context;
}
