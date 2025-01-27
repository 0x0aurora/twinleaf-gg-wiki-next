"use client"

import * as React from "react";
import Link from "next/link";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { usePathname } from 'next/navigation'
import Image from "next/image";
import { cn } from "~/lib/utils";


export interface SetsMenuProps
  extends React.ButtonHTMLAttributes<HTMLUListElement> {
}

const SetsMenu = React.forwardRef<HTMLUListElement, SetsMenuProps>(
  ({ className, ...props }, ref) => {
    const pathname = usePathname();
    const setsQuery = useSuspenseQuery({
        queryKey: ['https://api.pokemontcg.io/v2/sets/'],
        queryFn: async () => {
            const response = await fetch('https://api.pokemontcg.io/v2/sets/');
            if (!response.ok) {
              throw new Error('Network response was not ok')
            }
            return await response.json() as {
                data: {
                    id: string,
                    name: string,
                    images: {
                        symbol: string,
                        logo: string,
                    }
                }[]
            };
        },
    })
    return <ul className={cn("flex flex-col gap-3", className)} {...props} ref={ref}>
        {
            [...setsQuery.data?.data ?? []].reverse().map((set) => 
                <li className="w-full" key={set.id}>
                    <Button className="w-full justify-start" variant={pathname === `/${set.id}` ? "default" : "ghost"} asChild>
                        <Link href={`/${set.id}`}>
                            <Image className="w-8 h-8 object-contain" src={set.images.symbol} height={32} width={32} alt={set.name} />
                            <span className="text-ellipsis overflow-hidden">{set.name}</span>
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