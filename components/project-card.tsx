"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ProjectCard({ project, onDelete }: any) {
  const router = useRouter();
  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold text-foreground">{project.name}</div>
          <div className="text-sm text-muted-foreground">{project.description}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              router.push(`/studio?project=${encodeURIComponent(project.id)}`);
            }}
          >
            Open
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(project.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
