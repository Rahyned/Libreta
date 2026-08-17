import { Star, StarHalf } from "lucide-react";

interface Props {
  value: number;
  size?: number;
}

export default function Stars({ value, size = 14 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const full = value >= i;
        const half = !full && value >= i - 0.5;
        return full ? (
          <Star
            key={i}
            size={size}
            className="fill-[#e3b169] text-[#e3b169]"
          />
        ) : half ? (
          <StarHalf
            key={i}
            size={size}
            className="fill-[#e3b169] text-[#e3b169]"
          />
        ) : (
          <Star key={i} size={size} className="text-line" />
        );
      })}
    </div>
  );
}
