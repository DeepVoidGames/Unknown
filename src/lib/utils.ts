import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to a human-readable string with suffixes (K, M, B, T).
 * E.g., 1000 -> 1K, 1500 -> 1.5K, 1000000 -> 1M
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num === 0) return "0";
  if (Math.abs(num) < 1000) return num.toFixed(decimals).replace(/\.0$/, "");

  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup.slice().reverse().find(function(item) {
    return Math.abs(num) >= item.value;
  });
  
  return item 
    ? (num / item.value).toFixed(decimals).replace(rx, "$1") + item.symbol 
    : num.toFixed(decimals);
}

/**
 * Returns the CSS filter string for a card based on its types.
 */
export function getCardImageFilter(types: string[]): string {
  const isRevert = types.includes("REVERT");
  const isGold = types.includes("GOLD");
  const isSilver = types.includes("SILVER");

  if (isRevert) return "invert(1) hue-rotate(180deg)";
  if (isGold) return "sepia(1) saturate(5) brightness(0.8) hue-rotate(-15deg)";
  if (isSilver) return "grayscale(1) brightness(1.2) contrast(1.1)";
  
  return "";
}

/**
 * Specifically for Mega Seeds and game currencies
 */
export function formatCurrency(num: number): string {
  if (num < 1000) return Math.floor(num).toString();
  return formatNumber(num, 2);
}
