"use client"

import { useState } from "react"
import { useProjectsStore } from "@/hooks/useProjectsStore"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Upload } from "lucide-react"

export default function HomePage() {
  const { projects, addProject, deleteProject, refresh } = useProjectsStore()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "" })

  function handleCreateProject() {
    if (formData.name.trim()) {
      const meta = addProject({ name: formData.name, description: formData.description, status: "active" })
      setFormData({ name: "", description: "" })
      setIsOpen(false)
      refresh()
      try {
        import("@/lib/firebaseClient").then(async (m) => {
          const getIdToken = m.getIdToken as () => Promise<string | null>;
          const token = await getIdToken();
          if (!token) return;
          const projectKey = `cipherstudio:project:${meta.id}`;
          const raw = localStorage.getItem(projectKey);
          if (!raw) return;
          const payload = JSON.parse(raw);
          fetch("/api/upstash/push", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ files: payload.files, projectId: meta.id, owner: meta.id }),
          }).catch(() => {});
        });
      } catch (e) {}
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refresh()}>
                <Upload className="w-4 h-4 mr-2" />
                Load
              </Button>
              <div>
                <Button size="sm" onClick={() => setIsOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
                {isOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
                    <div className="relative bg-card rounded-lg p-6 w-full max-w-lg">
                      <h3 className="text-lg font-semibold mb-2">Create New Project</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start a new project by entering a name and description.</p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Project Name</label>
                          <Input
                            placeholder="My Awesome Project"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                          <Input
                            placeholder="What is this project about?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                          <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateProject}>Create Project</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <div>
              <Button onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
              {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
                  <div className="relative bg-card rounded-lg p-6 w-full max-w-lg">
                    <h3 className="text-lg font-semibold mb-2">Create New Project</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start a new project by entering a name and description.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Project Name</label>
                        <Input
                          placeholder="My Awesome Project"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                        <Input
                          placeholder="What is this project about?"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-3 justify-end pt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateProject}>Create Project</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
