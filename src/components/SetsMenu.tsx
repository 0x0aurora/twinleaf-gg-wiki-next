"use client"

import * as React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import { cn } from "~/lib/utils";


export interface SetsMenuProps
  extends React.ButtonHTMLAttributes<HTMLUListElement> {
    collapseTextForMobile?: boolean,
    sets: {
        id: string,
        name: string,
        images: {
            symbol: string,
        }
    }[]
}

const SetsMenu = React.forwardRef<HTMLUListElement, SetsMenuProps>(
  ({ className, collapseTextForMobile, sets, ...props }, ref) => {
    const pathname = usePathname();
    return <ul className={cn("flex flex-col gap-3", className)} {...props} ref={ref}>
        {
            sets.map((set) => 
                <li className="w-full" key={set.id}>
                    <Button className={cn("w-full justify-start", collapseTextForMobile && "md:gap-0")} variant={pathname === `/${set.id}` ? "default" : "ghost"} asChild>
                        <Link href={`/${set.id}`}>
                            <div className="min-w-8 min-h-8">
                                <Image className="w-full h-auto block" src={set.images.symbol} height={32} width={32} alt={set.name} />
                            </div>
                            <span className={cn("text-ellipsis overflow-hidden transition-all max-w-96", collapseTextForMobile && "max-w-0")}>{set.name}</span>
                        </Link>
                    </Button>
                </li>
            )
        }
    </ul>
  }
)

SetsMenu.displayName = "SetsMenu";

export default SetsMenu;