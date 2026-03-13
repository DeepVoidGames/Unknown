import { Leaf, Sword } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface CardStatsProps {
  income: number;
  power: number;
}

export function CardStats({ income, power }: CardStatsProps) {
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1">
        <Leaf className="w-2.5 h-2.5 text-green-500 fill-green-500/20" />
        <span className="text-xs font-bold text-primary">
          {formatNumber(income)}/s
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Sword className="w-2.5 h-2.5 text-red-500 fill-red-500/20" />
        <span className="text-[10px] font-bold text-red-500">
          {formatNumber(power)}
        </span>
      </div>
    </div>
  );
}
