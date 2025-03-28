"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import implementedCards from "~/lib/card-data/implemented-cards.json" with { type: "json" };
import buggedCards from "~/lib/card-data/bugged-cards.json" with { type: "json" };
import cardBackPlaceholder from "~/lib/card-back-placeholder";
import { Input } from "~/components/ui/input";
import type { ISet, ICard } from "~/lib/api/types";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function SetPage({
  set: currentSet,
  card,
  cards,
}: {
  set: ISet;
  card?: ICard;
  cards: ICard[];
}) {
  const trpcUtils = api.useUtils();
  const { toast } = useToast();
  const [currentCard, setCurrentCard] = React.useState(card);
  const [searchTerm, setSearchTerm] = React.useState("");
  const canonicalSetLinkRef = React.useRef<HTMLAnchorElement>(null);

  const [requestedCardRows] = api.request.getAll.useSuspenseQuery();
  const requestedCardIds = React.useMemo(
    () => new Set(requestedCardRows?.map((e) => e.cardId)),
    [requestedCardRows],
  );
  const createRequestMutation = api.request.create.useMutation({
    onMutate: (row) => {
      trpcUtils.request.getAll.setData(undefined, () => [
        row,
        ...(requestedCardRows ?? []),
      ]);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: error.message,
      });
    },
  });
  const onRequest = async (cardId: string) => {
    await createRequestMutation.mutateAsync({
      cardId,
    });
  };

  return (
    <ScrollArea className="flex-1 md:max-h-screen w-full">
      <main className="p-3 space-y-6">
        <div className="prose dark:prose-invert">
          <h1>{currentSet?.name}</h1>
          <p>
            {[
              currentSet?.series,
              `Released on ${currentSet?.releaseDate}`,
              `Standard: ${currentSet?.legalities.standard ? "✅" : "❌"}`,
              `Expanded: ${currentSet?.legalities.expanded ? "✅" : "❌"}`,
              `Unlimited: ${currentSet?.legalities.unlimited ? "✅" : "❌"}`,
            ].join(" • ")}
          </p>
        </div>
        <Input
          className=""
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          placeholder=" Search for a card..."
        />
        <div
          className="grid grid-cols-[repeat(2,minmax(0px,1fr))]
            md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3"
        >
          {cards
            .filter((e) => e.name.toLowerCase().includes(searchTerm))
            ?.map((card, i) => (
              <Link
                className="relative"
                onClick={(e) => {
                  e.preventDefault();
                  // shallow route
                  window.history.pushState(null, "", e.currentTarget.href);
                  setCurrentCard(card);
                }}
                href={`/${currentSet.id}/${card.id}`}
                key={i}
              >
                <Image
                  loading="lazy"
                  className={cn(
                    "w-full h-auto",
                    !implementedCards.implementedCardIds.includes(card.id) &&
                      "grayscale",
                  )}
                  style={{
                    filter: buggedCards.buggedCardIds.includes(card.id)
                      ? "sepia(1) saturate(3) brightness(0.7) hue-rotate(300deg)"
                      : undefined,
                  }}
                  placeholder={cardBackPlaceholder}
                  src={card.images.small}
                  alt={card.name}
                  height={250}
                  width={180}
                />
                <div
                  className={cn(
                    `absolute inset-0 md:backdrop-blur-sm md:opacity-0
                    hover:opacity-100 transition-all rounded-xl flex
                    items-center justify-center`,
                    implementedCards.implementedCardIds.includes(card.id) &&
                      "hidden",
                  )}
                >
                  <Button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      await onRequest(card.id);
                    }}
                    style={{
                      animationIterationCount: 1,
                    }}
                    className={cn(
                      requestedCardIds.has(card.id) && "animate-thumbs-up",
                    )}
                    disabled={requestedCardIds.has(card.id)}
                  >
                    {!requestedCardIds.has(card.id)
                      ? "Request"
                      : "Requested 👍"}
                  </Button>
                </div>
              </Link>
            ))}
        </div>
        <Link
          ref={canonicalSetLinkRef}
          className="hidden"
          href={`/${currentSet.id}`}
        />
        <Dialog
          open={currentCard != null}
          onOpenChange={() => {
            // shallow route
            window.history.pushState(
              null,
              "",
              canonicalSetLinkRef.current!.href,
            );
            setCurrentCard(undefined);
          }}
        >
          {currentCard != null ? (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentCard.name}</DialogTitle>
              </DialogHeader>
              <Image
                className="w-full h-auto"
                placeholder={cardBackPlaceholder}
                src={currentCard.images.large}
                alt={currentCard.name}
                height={942}
                width={674}
              />
              <DialogFooter>
                <Button
                  onClick={async () => {
                    await onRequest(currentCard.id);
                  }}
                  style={{
                    animationIterationCount: 1,
                  }}
                  className={cn(
                    requestedCardIds.has(currentCard.id) && "animate-thumbs-up",
                    implementedCards.implementedCardIds.includes(
                      currentCard.id,
                    ) && "hidden",
                  )}
                  disabled={requestedCardIds.has(currentCard.id)}
                >
                  {!requestedCardIds.has(currentCard.id)
                    ? "Request"
                    : "Requested 👍"}
                </Button>
              </DialogFooter>
            </DialogContent>
          ) : (
            <DialogContent>
              <DialogTitle>Error loading card!</DialogTitle>
            </DialogContent>
          )}
        </Dialog>
      </main>
    </ScrollArea>
  );
}
