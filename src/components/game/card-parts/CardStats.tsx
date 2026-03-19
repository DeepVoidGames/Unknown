import { Leaf, Sword, Brain } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface CardStatsProps {
  income: number;
  power: number;
  iq?: number;
}

export function CardStats({ income, power, iq }: CardStatsProps) {
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
      {iq !== undefined && (
        <div className="flex items-center gap-1 mb-0.5">
          <Brain className="w-2 h-2 text-purple-400 fill-purple-400/20" />
          <span className="text-[9px] font-bold text-purple-400">{iq}</span>
        </div>
      )}
    </div>
  );
}
