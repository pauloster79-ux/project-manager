"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";
import { Project } from "./types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}/risks`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            {project.description || "No description"}
          </p>
          <div className="text-xs text-muted-foreground">
            Updated {new Date(project.updated_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
