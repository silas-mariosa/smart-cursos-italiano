"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Clock, Mic, MicOff, Video, VideoOff, Users, ArrowRight } from "lucide-react";
import { useLiveSession } from "@/lib/hooks/useLiveSessions";
import { useDemoStudent } from "@/lib/context/DemoStudentContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function LiveLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenant as string;
  const sessionId = params.sessionId as string;
  const { persona } = useDemoStudent();

  const session = useLiveSession(sessionId);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!session) return;
    const tick = () => {
      const diff = new Date(session.scheduledAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("A aula começou!");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Sessão não encontrada</p>
      </div>
    );
  }

  const isReady = session.status === "waiting" || session.status === "live";

  return (
    <div className="min-h-[calc(100vh-2.5rem)] bg-[#f0f4f8] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Preview câmera — estilo Google Meet lobby */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#3c4043] flex items-center justify-center shadow-xl">
              {camOn ? (
                <Avatar className="size-24">
                  <AvatarFallback className="text-3xl bg-primary text-white">
                    {persona?.avatar ?? "?"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <VideoOff className="size-16 text-white/30" />
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button
                  size="icon"
                  className={`rounded-full size-12 ${micOn ? "bg-[#3c4043]" : "bg-[#ea4335]"}`}
                  onClick={() => setMicOn(!micOn)}
                >
                  {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
                </Button>
                <Button
                  size="icon"
                  className={`rounded-full size-12 ${camOn ? "bg-[#3c4043]" : "bg-[#ea4335]"}`}
                  onClick={() => setCamOn(!camOn)}
                >
                  {camOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Verifique câmera e microfone antes de entrar
            </p>
          </div>

          {/* Convocação */}
          <div className="space-y-6">
            <div>
              {(session.status === "waiting" || session.status === "live") && (
                <Badge className="bg-red-600 text-white border-0 mb-3 animate-pulse">
                  Você foi convocado!
                </Badge>
              )}
              <h1 className="text-2xl font-bold">{session.title}</h1>
              <p className="text-muted-foreground mt-2">{session.description}</p>
            </div>

            <Card>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{session.instructorAvatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{session.instructorName}</p>
                    <p className="text-xs text-muted-foreground">Professor · anfitrião</p>
                  </div>
                </div>
                <p className="text-sm">
                  <strong>Tópico:</strong> {session.topic}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {countdown === "A aula começou!" ? (
                      <span className="text-red-600 font-medium">{countdown}</span>
                    ) : (
                      <>Começa em {countdown}</>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {session.participants.length} na sala
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quem já está aguardando */}
            <div>
              <p className="text-sm font-medium mb-2">Aguardando na sala</p>
              <div className="flex -space-x-2">
                {session.participants.slice(0, 5).map((p) => (
                  <Avatar key={p.id} className="border-2 border-background size-9">
                    <AvatarFallback className="text-xs">{p.avatar}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>

            {isReady ? (
              <Button
                size="lg"
                className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-lg h-12"
                onClick={() => router.push(`/${tenantSlug}/ao-vivo/${sessionId}/sala`)}
              >
                Entrar na aula ao vivo
                <ArrowRight className="size-5 ml-2" />
              </Button>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Aula ainda não disponível
              </Button>
            )}

            <Link
              href={`/${tenantSlug}/ao-vivo`}
              className="block text-center text-sm text-muted-foreground hover:text-primary"
            >
              ← Voltar para aulas ao vivo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
