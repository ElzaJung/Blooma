import React, { forwardRef } from "react";
import type { Attributes, Listeners } from "@dnd-kit/core";

type Props = {
  id: string;
  text: string;
  imageUrl: string | null;
  onEdit: () => void;
  onInsertImage: () => void;
  onTextChange: (newText: string) => void;
  onOpenTab: () => void;
  onShowImageOnly: () => void;
  onDelete: () => void;
  attributes?: Attributes;
  listeners?: Listeners | boolean;
  style?: React.CSSProperties;
};

const StoryboardCard = forwardRef<HTMLDivElement, Props>(
  (
    {
      text,
      imageUrl,
      onEdit,
      onInsertImage,
      onTextChange,
      onOpenTab,
      onShowImageOnly,
      onDelete,
      attributes,
      listeners,
      style,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        {...attributes}
        style={style}
        className="bg-white text-black rounded-xl shadow-[4px_4px_0_rgba(0,0,0,100)] p-4 flex flex-col gap-4 items-stretch relative w-[320px] border border-black"
      >
        {/* Drag handle */}
        <div
          {...listeners}
          className="absolute top-3 right-3 w-4 h-4 cursor-grab bg-gray-400 rounded-full"
          title="Drag"
        />
        {/* Top color buttons */}
        <div className="flex gap-1 absolute top-4 left-4">
          <button
            onClick={onOpenTab}
            className="w-5 h-5 rounded-full bg-[#68DB94] border border-black"
            aria-label="Open Tab"
          />
          <button
            onClick={onShowImageOnly}
            className="w-5 h-5 rounded-full bg-[#FEA439] border border-black"
            aria-label="Show Image Only"
          />
          <button
            onClick={onDelete}
            className="w-5 h-5 rounded-full bg-[#FF7F70] border border-black"
            aria-label="Delete"
          />
        </div>

        {/* Spacer to offset absolute buttons */}
        <div className="h-6" />

        {/* Top buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onInsertImage}
            className="flex-1 bg-[#D9D9D9] p-6 rounded-xl text-center font-semibold border border-black"
          >
            insert image
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 bg-[#D9D9D9] p-6 rounded-xl text-center font-semibold border border-black"
          >
            edit
          </button>
        </div>

        {/* Text area */}
        <textarea
          className="bg-[#D9D9D9] p-4 rounded-xl text-sm min-h-[120px] w-full resize-none font-semibold border border-black"
          placeholder="Enter text here"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
      </div>
    );
  }
);

StoryboardCard.displayName = "StoryboardCard";

export default StoryboardCard;
