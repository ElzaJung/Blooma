import { useStoryboardStore } from "@/store/storyboardStore";
import StoryboardCard from "../cards/StoryboardCard";

export default function StoryboardCanvas() {
  const { cards } = useStoryboardStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <StoryboardCard key={card.id} {...card} />
      ))}
    </div>
  );
}
