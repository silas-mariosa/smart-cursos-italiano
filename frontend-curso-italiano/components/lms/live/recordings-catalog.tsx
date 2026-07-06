"use client";

import { useMemo, useState } from "react";
import { Calendar, Clock, Film, Play, Search, Video } from "lucide-react";
import type { LiveRecording, LiveSession } from "@lms-mocks/practice-types";
import { formatLiveSessionDate } from "@/lib/live/student-live-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RecordingSource = "all" | "replay" | "library";

type CatalogItem =
  | { kind: "replay"; id: string; title: string; description: string; courseTitle: string; durationMinutes: number; date: string; videoUrl: string; sessionType?: LiveSession["sessionType"] }
  | { kind: "library"; id: string; title: string; description: string; courseTitle: string; durationMinutes: number; date: string; videoUrl: string };

interface RecordingsCatalogProps {
  replays: LiveSession[];
  library: LiveRecording[];
}

function normalizeText(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function RecordingsCatalog({ replays, library }: RecordingsCatalogProps) {
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<RecordingSource>("all");

  const items = useMemo<CatalogItem[]>(() => {
    const replayItems: CatalogItem[] = replays.map((s) => ({
      kind: "replay",
      id: s.id,
      title: s.title,
      description: s.description,
      courseTitle: s.courseTitle,
      durationMinutes: s.durationMinutes,
      date: s.scheduledAt,
      videoUrl: s.recordingUrl ?? "",
      sessionType: s.sessionType,
    }));
    const libraryItems: CatalogItem[] = library.map((r) => ({
      kind: "library",
      id: r.id,
      title: r.title,
      description: r.description,
      courseTitle: r.courseTitle ?? "Biblioteca geral",
      durationMinutes: r.durationMinutes,
      date: r.createdAt,
      videoUrl: r.videoUrl,
    }));
    return [...replayItems, ...libraryItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [replays, library]);

  const courseOptions = useMemo(() => {
    const courses = new Map<string, string>();
    for (const item of items) {
      courses.set(item.courseTitle, item.courseTitle);
    }
    return Array.from(courses.values()).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = normalizeText(query.trim());
    return items.filter((item) => {
      if (sourceFilter !== "all" && item.kind !== sourceFilter) return false;
      if (courseFilter !== "all" && item.courseTitle !== courseFilter) return false;
      if (!q) return true;
      const haystack = normalizeText(
        [item.title, item.description, item.courseTitle].join(" "),
      );
      return haystack.includes(q);
    });
  }, [items, query, courseFilter, sourceFilter]);

  const sourceCounts = useMemo(
    () => ({
      all: items.length,
      replay: items.filter((i) => i.kind === "replay").length,
      library: items.filter((i) => i.kind === "library").length,
    }),
    [items],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {items.length} gravações disponíveis
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou curso..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "all" as const, label: "Todas", count: sourceCounts.all },
              { value: "replay" as const, label: "Replays", count: sourceCounts.replay },
              { value: "library" as const, label: "Biblioteca", count: sourceCounts.library },
            ] as const
          ).map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={sourceFilter === opt.value ? "default" : "outline"}
              onClick={() => setSourceFilter(opt.value)}
            >
              {opt.label}
              <span className="ml-1.5 text-xs opacity-70">({opt.count})</span>
            </Button>
          ))}
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Todos os cursos</option>
          {courseOptions.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-2">
            <Film className="size-10 mx-auto text-muted-foreground/50" />
            <p className="font-medium">Nenhuma gravação encontrada</p>
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? "Ainda não há gravações publicadas para você."
                : "Tente ajustar os filtros ou a busca."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <Card key={`${item.kind}-${item.id}`} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
                {item.kind === "replay" ? (
                  <Video className="size-10 text-white/40" />
                ) : (
                  <Film className="size-10 text-white/40" />
                )}
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <Badge
                    className={
                      item.kind === "replay"
                        ? "border-0 bg-red-600/90 text-white"
                        : "border-0 bg-white/20 text-white backdrop-blur-sm"
                    }
                  >
                    {item.kind === "replay" ? "Replay" : "Biblioteca"}
                  </Badge>
                  {item.kind === "replay" && item.sessionType === "individual" && (
                    <Badge className="border-0 bg-white/20 text-white backdrop-blur-sm">
                      Individual
                    </Badge>
                  )}
                </div>
                <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  {item.durationMinutes} min
                </span>
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold leading-snug line-clamp-2">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{item.courseTitle}</p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {formatLiveSessionDate(item.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {item.durationMinutes} min
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(item.videoUrl, "_blank", "noopener,noreferrer")}
                >
                  <Play className="size-4 mr-2" />
                  Assistir gravação
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
