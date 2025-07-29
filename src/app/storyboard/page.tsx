"use client";

import React, { useEffect, useState } from "react";
import ProjectCard from "../components/cards/ProjectCard";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function ProjectPage() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

  // Load projects from Supabase
  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) console.error("Error loading projects", error);
      else setProjects(data as Project[]);
    }
    loadProjects();
  }, []);

  // Create new project
  const createNewProject = async () => {
    const { data: project, error } = await supabase
      .from("projects")
      .insert([
        {
          title: "Untitled Project",
          description: "Start writing your ideas here...",
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Failed to create project:", error.message);
      alert("Error creating project: " + error.message);
      return;
    }

    // Auto-create 6 cards linked to this new project
    const defaultCards = Array.from({ length: 6 }).map((_, i) => ({
      project_id: project.id,
      text: "",
      image_url: null,
      sort_order: i + 1,
    }));

    const { error: cardError } = await supabase
      .from("cards")
      .insert(defaultCards);

    if (cardError) {
      console.error("Failed to create default cards:", cardError.message);
      alert("Project created, but failed to create cards.");
    }

    // Add project to local state
    setProjects((prevProjects) => [...prevProjects, project]);
  };

  function goToProject(id: string) {
    router.push(`/storyboard/${id}`);
  }

  async function deleteProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      alert("Failed to delete project: " + error.message);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  const updateProject = async (
    id: string,
    title: string,
    description: string
  ) => {
    const { error } = await supabase
      .from("projects")
      .update({ title, description })
      .eq("id", id);

    if (error) {
      console.error("Auto-save failed:", error.message);
    }
  };

  type Project = {
    id: string;
    title: string;
    description: string;
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="text-black p-16 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Project</h1>
          <button
            onClick={createNewProject}
            className="border rounded px-4 py-2 hover:bg-gray-100"
          >
            New Project
          </button>
        </div>

        <input
          type="search"
          placeholder="Search projects here"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 rounded border px-4 py-1 max-w-3xl bg-[#D9D9D9] focus:outline-none focus:ring-2 focus:ring-gray-200"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProjects.map(({ id, title, description }) => (
            <ProjectCard
              key={id}
              id={id}
              title={title}
              description={description}
              onEdit={() => goToProject(id)}
              onDelete={() => deleteProject(id)}
              onAutoSave={updateProject}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
