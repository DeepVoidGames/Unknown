interface CardStatusBadgeProps {
  status: string;
}

export function CardStatusBadge({ status }: CardStatusBadgeProps) {
  const statusStyles = {
    Alive: "bg-green-500/20 text-green-400 border border-green-500/40",
    Dead: "bg-red-500/20 text-red-400 border border-red-500/40",
    unknown: "bg-gray-500/20 text-gray-400 border border-gray-500/40",
  }[status] || "bg-gray-500/20 text-gray-400 border border-gray-500/40";

  return (
    <span
      className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${statusStyles}`}
    >
      {status}
    </span>
  );
}
