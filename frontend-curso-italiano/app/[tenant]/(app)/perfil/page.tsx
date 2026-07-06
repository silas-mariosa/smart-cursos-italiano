"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Redireciona perfil legado para Minha conta */
export default function ProfileRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenant as string;

  useEffect(() => {
    router.replace(`/${tenantSlug}/minha-conta`);
  }, [router, tenantSlug]);

  return null;
}
