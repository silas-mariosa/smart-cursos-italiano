"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerfilPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void api.getMe().then(({ user: me }) => {
      setUser(me);
      setName(me.name);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { user: updated } = await api.updateProfile(name);
    setUser(updated);
    setMessage("Perfil atualizado");
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Meu perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">E-mail</p>
            <p>{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Nome</p>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Função</p>
            <p>{user?.role}</p>
          </div>
          {message && <p className="text-sm text-green-700">{message}</p>}
          <Button type="submit">Salvar</Button>
        </form>
      </CardContent>
    </Card>
  );
}
