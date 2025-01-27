"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { type ISet } from "~/lib/api/types";

export interface SetsMenuProps
  extends React.ButtonHTMLAttributes<HTMLUListElement> {
  collapseTextForDesktop?: boolean;
  sets: ISet[];
}

const SetsMenu = React.forwardRef<HTMLUListElement, SetsMenuProps>(
  ({ className, collapseTextForDesktop, sets, ...props }, ref) => {
    const pathname = usePathname();
    return (
      <ul className={cn("flex flex-col gap-3", className)} {...props} ref={ref}>
        {sets.map((set) => (
          <li className="w-full" key={set.id}>
            <Button
              className={cn(
                "w-full justify-start",
                collapseTextForDesktop && "md:gap-0",
              )}
              variant={pathname === `/${set.id}` ? "default" : "ghost"}
              asChild
            >
              <Link href={`/${set.id}`}>
                <div className="w-8 h-8">
                  <Image
                    className="w-full h-auto block"
                    src={set.images.symbol}
                    height={32}
                    width={32}
                    alt={set.name}
                    loading="lazy"
                  />
                </div>
                <span
                  className={cn(
                    "text-ellipsis overflow-hidden transition-all max-w-96",
                    collapseTextForDesktop && "md:max-w-0",
                  )}
                >
                  {set.name}
                </span>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    );
  },
);

SetsMenu.displayName = "SetsMenu";

export default SetsMenu;
