"use client";

import SetsMenu from "~/components/SetsMenu";
import _LogoSmall from "~/components/LogoSmall.svg";
import Image, { type StaticImageData } from "next/image";
import { ArrowUpIcon, ArrowRightIcon, GithubIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import * as React from "react";
import { cn } from "~/lib/utils";
import { usePathname } from "next/navigation";
import _sets from "~/lib/api/data/sets/en.json";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";
import type { ISet } from "~/lib/api/types";

const sets = _sets as ISet[];
const LogoSmall = _LogoSmall as StaticImageData;

export default function Sidebar() {
  const [expanded, setExpanded] = React.useState(false);
  const pathname = usePathname();
  const setId = pathname.split("/").at(1);

  React.useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  const currentSet = sets.find((e) => e.id === setId);

  return (
    <div
      className={cn(
        `fixed flex bottom-0 top-[100%] left-0 right-0 max-h-screen md:static
        md:h-screen transition-all bg-background z-50 group`,
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
            `items-center justify-around flex h-20 w-full bg-background
            overflow-hidden transition-all border-t`,
            expanded && "h-0 border-t-0",
          )}
        >
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <GithubIcon />
            </Link>
          </Button>
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
          {/* fix improper hiding of themetoggle with overflow */}
          <div className={cn(expanded && "hidden")}>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div
        className={cn(
          `w-full md:max-w-64 flex flex-col h-full border-r border-t relative
          transition-all`,
        )}
      >
        <div className="hidden md:inline absolute left-[calc(100%-2rem)] p-2.5">
          <Button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              `rounded-full transition-all rotate-0 opacity-0
              group-hover:opacity-100`,
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
          <Link href="/">
            <Image
              className="h-8 w-8"
              alt="Twinleaf Logo"
              src={LogoSmall.src}
              width={LogoSmall.width}
              height={LogoSmall.height}
            />
          </Link>
        </div>
        <ScrollArea className="p-3 flex-1">
          <SetsMenu
            sets={[...sets].reverse()}
            collapseTextForDesktop={!expanded}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
