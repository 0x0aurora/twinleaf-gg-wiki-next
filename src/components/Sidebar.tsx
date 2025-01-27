"use client";

import SetsMenu from "~/components/SetsMenu";
import Logo from "~/components/Logo.svg";
import Image from "next/image";
import { ArrowUpIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "./ui/button";
import * as React from "react";
import { cn } from "~/lib/utils";
import { usePathname } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [expanded, setExpanded] = React.useState(false);
  const pathname = usePathname();
  const setId = pathname.split("/").at(1);

  React.useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  const setsQuery = useSuspenseQuery({
    queryKey: ["https://api.pokemontcg.io/v2/sets/"],
    queryFn: async () => {
      const response = await fetch("https://api.pokemontcg.io/v2/sets/");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return (await response.json()) as {
        data: {
          id: string;
          name: string;
          images: {
            symbol: string;
            logo: string;
          };
        }[];
      };
    },
  });

  const currentSet = setsQuery.data.data.find((e) => e.id === setId);

  return (
    <div
      className={cn(
        `fixed flex bottom-0 top-[100%] inset-x-0 max-h-screen md:static
        md:h-screen transition-all bg-background`,
        expanded && "top-16",
      )}
    >
      <div className="absolute bottom-[100%] inset-x-0 text-center">
        <Button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "rounded-full transition-all rotate-0 mb-3",
            expanded && "rotate-180",
          )}
          size="icon"
        >
          <ArrowUpIcon />
        </Button>
        <div
          className={cn(
            `items-center justify-center flex h-20 w-full bg-background
            overflow-hidden transition-all border-t`,
            expanded && "h-0 border-t-0",
          )}
        >
          <Button
            onClick={() => setExpanded(!expanded)}
            variant={currentSet == null ? "outline" : "default"}
          >
            {currentSet == null ? (
              "Select a set..."
            ) : (
              <>
                <div className="min-w-8 min-h-8">
                  <Image
                    className="w-full h-auto block"
                    src={currentSet.images.symbol}
                    height={32}
                    width={32}
                    alt={currentSet.name}
                  />
                </div>
                <span>{currentSet.name}</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <div
        className={cn(
          `w-full md:max-w-64 flex flex-col h-full border-r border-t relative
          transition-all`,
        )}
      >
        <div className="hidden md:inline absolute left-[100%] p-3">
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "rounded-full transition-all rotate-0",
              expanded && "rotate-180",
            )}
            size="icon"
          >
            <ArrowRightIcon />
          </Button>
        </div>
        <div
          className={cn(
            "py-3 px-6 w-full shadow-md justify-center hidden md:flex",
          )}
        >
          <Image className="h-8 w-8" alt="Twinleaf Logo" {...Logo} />
        </div>
        <SetsMenu
          sets={[...(setsQuery.data?.data ?? [])].reverse()}
          className={cn("p-3 overflow-y-scroll flex-1 px-3")}
          collapseTextForMobile={!expanded}
        />
      </div>
    </div>
  );
}
