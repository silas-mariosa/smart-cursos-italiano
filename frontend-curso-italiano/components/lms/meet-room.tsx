"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  PhoneOff,
  Users,
  Monitor,
  Hand,
  Settings,
  MoreVertical,
} from "lucide-react";
import type { LiveSession } from "@lms-mocks/practice-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MeetRoom({
  session,
  tenantSlug,
  studentName,
  studentAvatar,
}: {
  session: LiveSession;
  tenantSlug: string;
  studentName: string;
  studentAvatar: string;
}) {
  const [muted, setMuted] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  const teacher = session.participants.find((p) => p.role === "teacher");
  const students = session.participants.filter((p) => p.role === "student");
  const allParticipants = session.participants;

  return (
    <div className="fixed inset-0 z-50 bg-[#202124] text-white flex flex-col">
      {/* Top bar — estilo Google Meet */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#202124] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium truncate">{session.title}</span>
          <Badge variant="secondary" className="bg-red-600/90 text-white border-0 text-xs shrink-0">
            AO VIVO
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <span className="hidden sm:inline">{session.meetCode}</span>
          <span className="flex items-center gap-1">
            <Users className="size-4" />
            {allParticipants.length + 1}
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden min-h-0">
        {/* Main video area */}
        <div className="flex-1 flex flex-col p-3 gap-3 min-w-0 min-h-0">
          {/* Professor em destaque */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-[#3c4043] min-h-[140px] sm:min-h-[200px]">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#3c4043] to-[#2d2f31]">
              <Avatar className="size-24">
                <AvatarFallback className="text-2xl bg-primary">{teacher?.avatar ?? "MR"}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="bg-black/60 rounded px-2 py-1 text-sm">{session.instructorName}</span>
              {teacher?.isSpeaking && (
                <span className="size-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
            {!teacher?.isMuted && (
              <div className="absolute top-3 right-3">
                <Mic className="size-4 text-green-400" />
              </div>
            )}
          </div>

          {/* Grid de participantes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto shrink-0">
            {/* Você */}
            <div className="relative rounded-lg overflow-hidden bg-[#3c4043] flex items-center justify-center">
              {cameraOn ? (
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary">{studentAvatar}</AvatarFallback>
                </Avatar>
              ) : (
                <VideoOff className="size-6 text-white/40" />
              )}
              <span className="absolute bottom-1 left-1 text-xs bg-black/60 rounded px-1.5">{studentName} (você)</span>
              {handRaised && (
                <Hand className="absolute top-1 right-1 size-4 text-yellow-400" />
              )}
            </div>
            {students.map((p) => (
              <div key={p.id} className="relative rounded-lg overflow-hidden bg-[#3c4043] flex items-center justify-center">
                {p.isCameraOn ? (
                  <Avatar className="size-10">
                    <AvatarFallback className="text-sm">{p.avatar}</AvatarFallback>
                  </Avatar>
                ) : (
                  <VideoOff className="size-5 text-white/40" />
                )}
                <span className="absolute bottom-1 left-1 text-xs bg-black/60 rounded px-1.5 truncate max-w-full">
                  {p.name.split(" ")[0]}
                </span>
                {p.isMuted && (
                  <MicOff className="absolute top-1 right-1 size-3 text-white/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat lateral — metade inferior no mobile, lateral no desktop */}
        {chatOpen && (
          <aside className="h-[45%] md:h-auto md:w-80 border-t md:border-t-0 md:border-l border-white/10 flex flex-col bg-[#2d2e30] shrink-0 min-h-0">
            <div className="p-3 border-b border-white/10 font-medium text-sm">Chat da aula</div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto text-sm">
              <div>
                <span className="text-primary font-medium">{session.instructorName}</span>
                <p className="text-white/80 mt-0.5">Benvenuti! Oggi pratichiamo al ristorante. 🍝</p>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Lucas</span>
                <p className="text-white/80 mt-0.5">Buongiorno professore!</p>
              </div>
            </div>
            <div className="p-3 border-t border-white/10">
              <input
                className="w-full bg-[#3c4043] rounded-full px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
                placeholder="Enviar mensagem..."
              />
            </div>
          </aside>
        )}
      </div>

      {/* Toolbar inferior — Google Meet */}
      <footer className="relative px-2 sm:px-4 py-3 bg-[#202124] border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 shrink-0">
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
          <Button
            size="icon"
            variant="ghost"
            className={cn("rounded-full size-10 sm:size-11", muted ? "bg-[#ea4335] hover:bg-[#ea4335]/90 text-white" : "bg-[#3c4043] hover:bg-[#4a4d51] text-white")}
            onClick={() => setMuted(!muted)}
          >
            {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn("rounded-full size-10 sm:size-11", !cameraOn ? "bg-[#ea4335] hover:bg-[#ea4335]/90 text-white" : "bg-[#3c4043] hover:bg-[#4a4d51] text-white")}
            onClick={() => setCameraOn(!cameraOn)}
          >
            {cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full size-10 sm:size-11 bg-[#3c4043] hover:bg-[#4a4d51] text-white hidden sm:flex">
            <Monitor className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn("rounded-full size-10 sm:size-11", handRaised ? "bg-yellow-600 text-white" : "bg-[#3c4043] hover:bg-[#4a4d51] text-white")}
            onClick={() => setHandRaised(!handRaised)}
          >
            <Hand className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn("rounded-full size-10 sm:size-11", chatOpen ? "bg-primary text-white" : "bg-[#3c4043] hover:bg-[#4a4d51] text-white")}
            onClick={() => setChatOpen(!chatOpen)}
          >
            <MessageSquare className="size-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full size-10 sm:size-11 bg-[#3c4043] hover:bg-[#4a4d51] text-white hidden sm:flex">
            <Settings className="size-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full size-10 sm:size-11 bg-[#3c4043] hover:bg-[#4a4d51] text-white hidden sm:flex">
            <MoreVertical className="size-5" />
          </Button>
        </div>
        <Link href={`/${tenantSlug}/ao-vivo/${session.id}`} className="w-full sm:w-auto sm:absolute sm:right-4">
          <Button className="w-full sm:w-auto rounded-full bg-[#ea4335] hover:bg-[#ea4335]/90 text-white px-6">
            <PhoneOff className="size-4 mr-2" />
            Sair
          </Button>
        </Link>
      </footer>
    </div>
  );
}
