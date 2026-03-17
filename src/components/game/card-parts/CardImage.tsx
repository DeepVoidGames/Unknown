import { getCardImageFilter } from "@/lib/utils";
import { Character } from "@/types/game";

interface CardImageProps {
  character: Character;
  types: string[];
  isFullArt: boolean;
}

export function CardImage({ character, types, isFullArt }: CardImageProps) {
  const imageFilter = getCardImageFilter(types);
  let imgSrc = `https://rickandmortyapi.com/api/character/avatar/${character.avatarId}.jpeg`;

  if (character.customImage) {
    imgSrc = character.customImage;
  }

  if (isFullArt) {
    return (
      <img
        src={imgSrc}
        alt={character.name}
        className="w-full h-full object-cover transition-all duration-500"
        style={{ filter: imageFilter }}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-full bg-muted/50">
      <img
        src={imgSrc}
        alt={character.name}
        className="w-24 h-24 rounded-full object-cover border-2 border-border group-hover:scale-110 transition-all duration-500"
        style={{ filter: imageFilter }}
      />
    </div>
  );
}
