"use client";

import { useState, useEffect, useRef } from "react";
import StoryboardCard from "@/app/components/cards/StoryboardCard";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import type { DragEndEvent } from "@dnd-kit/core";

type StoryCard = {
  id: string;
  text: string;
  image_url: string | null;
};

export default function Page() {
  const [ratioChosen, setRatioChosen] = useState<"16:9" | "9:16" | null>(null);
  const [cards, setCards] = useState<StoryCard[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [sidebarText, setSidebarText] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  const params = useParams();
  const projectId = params.id;

  const saveTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  //maybe we dont need this
  const handleChooseRatio = async (ratio: "16:9" | "9:16") => {
    setRatioChosen(ratio);

    if (!projectId) {
      console.error("No projectId found");
      return;
    }

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching cards:", error.message);
      return;
    }

    if (data) {
      setCards(data);
    }
  };

  useEffect(() => {
    if (!projectId) return;

    async function fetchCards() {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        console.error("Error fetching cards:", error.message);
      } else if (data) {
        setCards(data);
      }
    }
    fetchCards();
  }, [projectId]);

  const handleInsertImage = async (id: string) => {
    const url = prompt("Enter image URL:");
    if (url) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, image_url: url } : card
        )
      );

      // Save to Supabase
      const { error } = await supabase
        .from("cards")
        .update({ image_url: url })
        .eq("id", id);

      if (error) console.error("Error saving image:", error.message);
    }
  };

  const handleEdit = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setSidebarText(card.text || "");
      setEditingCardId(cardId);
    }
  };

  const handleGenerate = () => {
    alert(`AI generation with: "${sidebarText}"`);
  };

  const closeSidebar = () => setEditingCardId(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setCards((prev) => {
        const oldIndex = prev.findIndex((card) => card.id === active.id);
        const newIndex = prev.findIndex((card) => card.id === over?.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const addCard = async () => {
    if (!projectId) {
      alert("Project ID not available");
      return;
    }

    const newCard = {
      project_id: projectId,
      text: "Text",
      image_url: null,
      sort_order: cards.length + 1,
    };

    const { data, error } = await supabase
      .from("cards")
      .insert([newCard])
      .select()
      .single();

    if (error) {
      console.error("Error creating card:", error.message);
      return;
    }

    setCards((prev) => [...prev, data]);
  };

  const SortableCard = ({ card }: { card: StoryCard }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: card.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <StoryboardCard
        key={card.id}
        ref={setNodeRef}
        id={card.id}
        text={card.text}
        imageUrl={card.image_url}
        onEdit={() => handleEdit(card.id)}
        onInsertImage={() => handleInsertImage(card.id)}
        onOpenTab={() => console.log(`Open tab for card ${card.id}`)}
        onShowImageOnly={() =>
          console.log(`Show image only for card ${card.id}`)
        }
        onDelete={() => console.log(`Delete card ${card.id}`)}
        onTextChange={(newText) => handleTextChange(card.id, newText)}
        attributes={attributes}
        listeners={listeners}
        style={style}
      />
    );
  };

  if (!ratioChosen) {
    return (
      <div className="min-h-screen bg-[#FCF2E7] flex items-center justify-center text-black">
        <div className="bg-white p-6 rounded-lg shadow space-y-4 text-center">
          <h2 className="text-lg font-semibold">Choose Card Ratio</h2>
          <div className="flex gap-3 justify-center">
            {["16:9", "9:16"].map((r) => (
              <button
                key={r}
                onClick={() => handleChooseRatio(r as "16:9" | "9:16")}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleTextChange = (id: string, newText: string) => {
    // Update local state immediately so UI updates
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, text: newText } : card))
    );

    // Clear existing timeout for this card if any
    if (saveTimeouts.current[id]) {
      clearTimeout(saveTimeouts.current[id]);
    }

    // Set new timeout to save after 1 second of inactivity
    saveTimeouts.current[id] = setTimeout(async () => {
      const { error } = await supabase
        .from("cards")
        .update({ text: newText })
        .eq("id", id);

      if (error) console.error("Failed to auto-save text:", error.message);
      // Clean up timer after save
      delete saveTimeouts.current[id];
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FCF2E7] flex relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingCardId && (
        <div className="fixed text-black top-0 right-0 w-[320px] h-full bg-white border-l shadow-lg p-6 z-50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={closeSidebar}
                className="text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>
            </div>
            <div className="bg-[#D9D9D9] h-60 rounded-lg mb-4 flex items-center justify-center text-sm text-gray-600 border border-black">
              image
            </div>
            <textarea
              rows={4}
              className="w-full p-2 border border-black rounded-lg  text-sm bg-[#D9D9D9] focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Enter description to generate image"
              value={sidebarText}
              onChange={(e) => setSidebarText(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            className="bg-black text-white mt-6 px-4 py-2 rounded hover:bg-gray-800"
          >
            Generate
          </button>
        </div>
      )}

      <button
        onClick={addCard}
        className="fixed bottom-6 right-6 w-16 h-16 bg-orange-500 hover:bg-orange-600 text-black text-4xl rounded-full shadow-lg flex items-center justify-center z-50"
      >
        +
      </button>
    </div>
  );
}
