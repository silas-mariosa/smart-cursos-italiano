import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/Screen";
import { API_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao entrar");
      await login(data.token);
      router.replace("/dashboard");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Falha no login",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Entrar">
      <TextInput
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        className="rounded-lg border border-gray-300 px-3 py-3"
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="rounded-lg border border-gray-300 px-3 py-3"
      />
      <Pressable
        onPress={handleLogin}
        disabled={loading}
        className="items-center rounded-xl bg-indigo-500 px-4 py-3 disabled:opacity-60"
      >
        <Text className="text-base font-semibold text-white">
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </Pressable>
    </Screen>
  );
}
