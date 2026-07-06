"use client";

import { useEffect, useState } from "react";
import type { ProductCourseMapping } from "@lms-mocks/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WebhookSimulateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productMappings: ProductCourseMapping[];
  onSimulate: (input: { buyerName: string; buyerEmail: string; productId: string }) => void;
}

export function WebhookSimulateDialog({
  open,
  onOpenChange,
  productMappings,
  onSimulate,
}: WebhookSimulateDialogProps) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [productId, setProductId] = useState("");

  useEffect(() => {
    if (!open) return;
    setBuyerName("");
    setBuyerEmail("");
    setProductId(productMappings[0]?.externalProductId ?? "");
  }, [open, productMappings]);

  function submit() {
    if (!buyerName.trim() || !buyerEmail.trim() || !productId) return;
    onSimulate({ buyerName, buyerEmail, productId });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simular compra aprovada</DialogTitle>
          <DialogDescription>
            Cria ou atualiza aluno, matricula nos cursos mapeados e gera senha provisória.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Nome do comprador</Label>
            <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Produto</Label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {productMappings.map((m) => (
                <option key={m.externalProductId} value={m.externalProductId}>
                  {m.externalProductName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!buyerName.trim() || !buyerEmail.trim() || !productId}>
            Simular webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
