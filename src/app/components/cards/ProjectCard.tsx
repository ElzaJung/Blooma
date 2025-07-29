"use client";

import { useState, useEffect } from "react";

type Project = {
  id: string;
  title: string;
  description: string;
  onEdit: () => void;
  onDelete: () => void;
  onAutoSave: (id: string, title: string, description: string) => void;
};

export default function ProjectCard({
  id,
  title,
  description,
  onEdit,
  onDelete,
  onAutoSave,
}: Project) {
  const [newTitle, setNewTitle] = useState(title);
  const [newDesc, setNewDesc] = useState(description);

  // Auto-save logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (newTitle !== title || newDesc !== description) {
        onAutoSave(id, newTitle, newDesc);
      }
    }, 1000); // save after 1 second of no typing

    return () => clearTimeout(timeout);
  }, [newTitle, newDesc]);
  return (
    <div className="bg-white rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] border p-4 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-3 ">
        <textarea
          className="text-2xl font-bold min-h-10"
          defaultValue={title}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <div className="flex space-x-2">
          <button
            className="w-5 h-5 rounded-full bg-[#68DB94] border border-black"
            aria-label="Open Tab"
            onClick={onEdit}
          />
          <button
            //onClick={onShowImageOnly}
            className="w-5 h-5 rounded-full bg-[#FEA439] border border-black"
            aria-label="Show Image Only"
          />
          <button
            className="w-5 h-5 rounded-full bg-[#FF7F70] border border-black"
            aria-label="Delete"
            onClick={onDelete}
          />
        </div>
      </div>

      {/* Content Area */}
      <textarea
        className="bg-[#D9D9D9] h-40 rounded-lg p-4 w-full text-lg font-semibold resize-none border border-black"
        placeholder="Enter project description"
        defaultValue={description}
        onChange={(e) => setNewDesc(e.target.value)}
      />
    </div>
  );
}
