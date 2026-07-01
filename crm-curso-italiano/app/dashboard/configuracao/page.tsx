"use client";

import { useState } from "react";
import { useMockStore } from "@/lib/mock-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ConfigurationPage() {
  const { tenant, setTenant } = useMockStore();
  const [name, setName] = useState(tenant.name);
  const [primary, setPrimary] = useState(tenant.primaryColor);
  const [secondary, setSecondary] = useState(tenant.secondaryColor);
  const [heroTitle, setHeroTitle] = useState(tenant.heroTitle);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setTenant({
      ...tenant,
      name,
      primaryColor: primary,
      secondaryColor: secondary,
      heroTitle,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Identidade visual — {tenant.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da escola</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={tenant.slug} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary">Cor primária</Label>
              <div className="flex gap-2">
                <Input id="primary" type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-16 p-1" />
                <Input value={primary} onChange={(e) => setPrimary(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary">Cor secundária</Label>
              <div className="flex gap-2">
                <Input id="secondary" type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} className="w-16 p-1" />
                <Input value={secondary} onChange={(e) => setSecondary(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="hero">Título do hero (landing)</Label>
            <Textarea id="hero" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} rows={2} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave}>Salvar alterações</Button>
            {saved && <span className="text-sm text-emerald-600 self-center">Salvo!</span>}
            <a href="http://localhost:3000/studio-italiano" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Abrir landing ↗</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview ao vivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg p-4 flex items-center gap-3"
            style={{ backgroundColor: secondary }}
          >
            <div
              className="size-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: primary }}
            >
              SI
            </div>
            <div>
              <p className="font-semibold" style={{ color: primary }}>
                {name}
              </p>
              <p className="text-xs text-muted-foreground">Header preview</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
