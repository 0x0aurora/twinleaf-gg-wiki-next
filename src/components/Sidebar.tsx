"use client";

import SetsMenu from "~/components/SetsMenu";
import Logo from "~/components/Logo.svg";
import Image from "next/image";
import { ArrowUpIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "./ui/button";
import * as React from "react";
import { cn } from "~/lib/utils";
import { usePathname } from 'next/navigation'

export default function Sidebar() {
    const [expanded, setExpanded] = React.useState(false);
    const pathname = usePathname();
    React.useEffect(() => {
        setExpanded(false);
    }, [pathname]);
    return <div className={cn("fixed flex bottom-0 inset-x-0 top-[100%] max-h-screen md:static md:h-screen transition-all bg-background", expanded && "top-16")}>
        <div className="absolute bottom-[100%] inset-x-0 text-center mb-3">
            <Button onClick={() => setExpanded(!expanded)} className={cn("rounded-full transition-all rotate-0", expanded && "rotate-180")} size="icon">
                <ArrowUpIcon />
            </Button>
        </div>
        <div className={cn("w-full md:max-w-64 flex flex-col h-full border-r border-t relative transition-all")}>
            <div className="hidden md:inline absolute left-[100%] p-3">
                <Button variant="outline" onClick={() => setExpanded(!expanded)} className={cn("rounded-full transition-all rotate-0", expanded && "rotate-180")} size="icon">
                    <ArrowRightIcon />
                </Button>
            </div>
            <div className={cn("py-3 px-6 w-full shadow-md flex justify-center")}><Image className="h-8 w-8" alt="Twinleaf Logo" {...Logo} /></div>
            <SetsMenu className={cn("p-3 overflow-y-scroll flex-1 px-3")} collapseTextForMobile={!expanded} />
        </div>
    </div>;
}