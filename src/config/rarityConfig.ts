import {
  Sparkles,
  Zap,
  Star,
  Circle,
  Coins,
  Trophy,
  RefreshCw,
  Sword,
  LucideIcon,
} from "lucide-react";

export type RarityOrType =
  | "COMMON"
  | "NORMAL"
  | "RARE"
  | "HOLO"
  | "FULL_ART"
  | "SILVER"
  | "GOLD"
  | "REVERT"
  | "SWORD";

export const TYPE_ICONS: Record<string, LucideIcon> = {
  COMMON: Circle,
  NORMAL: Circle,
  RARE: Star,
  HOLO: Sparkles,
  FULL_ART: Zap,
  SILVER: Coins,
  GOLD: Trophy,
  REVERT: RefreshCw,
  SWORD: Sword,
};

export const RARITY_STYLES: Record<string, { border: string; bg: string }> = {
  COMMON: { border: "border-border", bg: "bg-card" },
  NORMAL: { border: "border-border", bg: "bg-card" },
  RARE: { border: "border-blue-400/60 animate-rare-pulse", bg: "bg-card" },
  HOLO: { border: "border-rarity-holo", bg: "bg-card" },
  FULL_ART: { border: "border-rarity-fullart", bg: "bg-card" },
  SILVER: { border: "border-slate-300", bg: "bg-slate-900/40" },
  GOLD: { border: "border-yellow-500", bg: "bg-yellow-900/20" },
  REVERT: { border: "border-red-500", bg: "bg-black" },
};

export function getPrimaryType(types: string[]): string {
  if (types.includes("REVERT")) return "REVERT";
  if (types.includes("GOLD")) return "GOLD";
  if (types.includes("SILVER")) return "SILVER";
  if (types.includes("FULL_ART")) return "FULL_ART";
  if (types.includes("HOLO")) return "HOLO";
  if (types.includes("RARE")) return "RARE";
  if (types.includes("NORMAL")) return "NORMAL";
  return "COMMON";
}
