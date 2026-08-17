import { Star } from "lucide-react";

interface Props {
  value: number;
  size?: number;
}

export default function Stars({ value, size = 14 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(value)
              ? "fill-[#e3b169] text-[#e3b169]"
              : "text-line"
          }
        />
      ))}
    </div>
  );
}
