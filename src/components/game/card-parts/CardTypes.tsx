import { TYPE_ICONS } from "@/config/rarityConfig";

interface CardTypesProps {
  types: string[];
}

export function CardTypes({ types }: CardTypesProps) {
  return (
    <div className="flex items-center -space-x-1">
      {types.map((tId) => {
        const Icon = TYPE_ICONS[tId];
        if (!Icon) return null;
        return (
          <Icon key={tId} className="w-3 h-3 text-muted-foreground" />
        );
      })}
    </div>
  );
}
