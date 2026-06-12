import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "@/config/api";

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ["me"],
    enabled,
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Sem token");

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Falha ao buscar perfil");
      return res.json() as Promise<{
        user: { id: string; name: string; email: string };
      }>;
    },
  });
}
