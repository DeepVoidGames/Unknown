interface CardRarityOverlayProps {
  types: string[];
}

export function CardRarityOverlay({ types }: CardRarityOverlayProps) {
  const isHolo = types.includes("HOLO");
  const isGold = types.includes("GOLD");

  return (
    <>
      {isHolo && (
        <div className="absolute inset-0 animate-holo opacity-30 mix-blend-overlay z-10 pointer-events-none rounded-xl" />
      )}
      {isGold && (
        <div className="absolute inset-0 bg-yellow-500/10 mix-blend-color-dodge z-10 pointer-events-none" />
      )}
    </>
  );
}
