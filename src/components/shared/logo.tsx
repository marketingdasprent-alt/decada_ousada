import Image from "next/image";
import Link from "next/link";

import { REGION_CONFIG, type Region } from "@/domain/region";
import { cn } from "@/lib/cn";

export function Logo({ region, variant = "light", className, priority }: { region: Region; variant?: "light" | "dark"; className?: string; priority?: boolean }) {
  const cfg = REGION_CONFIG[region];
  return (
    <Link href="/" className={cn("inline-block shrink-0", className)} aria-label={`DÉCADA OUSADA ${cfg.shortLabel}, página inicial`}>
      <Image
        src={variant === "dark" ? cfg.logo.dark : cfg.logo.light}
        alt={`DÉCADA OUSADA${region === "azores" ? " Açores" : ""}`}
        width={1019}
        height={478}
        priority={priority}
        className="h-full w-auto"
      />
    </Link>
  );
}
