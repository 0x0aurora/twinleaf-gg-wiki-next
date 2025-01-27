"use client";

import * as React from "react";

import {
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Loader } from "lucide-react";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import implementedCards from "~/lib/card-data/implemented-cards.json" with { type: "json" };
import buggedCards from "~/lib/card-data/bugged-cards.json" with { type: "json" };
import cardBackPlaceholder from "~/lib/cardBackPlaceholder";
import { Input } from "~/components/ui/input";
import { type ICard } from "~/lib/api/types";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function Home({
  params,
}: {
  params: Promise<{ slug: [string, string | undefined] }>;
}) {
  const trpcUtils = api.useUtils();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { slug } = React.use(params);
  const [setId, _cardId] = slug;
  const [cardId, setCardId] = React.useState(_cardId);
  const [searchTerm, setSearchTerm] = React.useState("");
  const canonicalSetLinkRef = React.useRef<HTMLAnchorElement>(null);

  const cardsQuery = useSuspenseInfiniteQuery({
    queryKey: [`https://api.pokemontcg.io/v2/cards/?q=set.id:${setId}`],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards/?q=set.id:${setId}&page=${pageParam}`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return (await response.json()) as {
        data: ICard[];
        page: number;
        pageSize: number;
        count: number;
        totalCount: number;
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize >= lastPage.totalCount
        ? null
        : lastPage.page + 1,
  });
  const allCards = cardsQuery.data?.pages.flatMap((e) => e.data);
  const currentSet = allCards[0]?.set;

  const observer = React.useRef<IntersectionObserver | undefined>(undefined);
  const lastPostElementRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (cardsQuery.isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          void cardsQuery.fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [cardsQuery],
  );

  const cardQuery = useQuery({
    queryKey: [`https://api.pokemontcg.io/v2/cards/${cardId}`],
    enabled: cardId != null,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards/${cardId}`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return (await response.json()) as {
        data: ICard;
      };
    },
  });

  const [requestedCardRows] = api.request.getAll.useSuspenseQuery();
  const requestedCardIds = React.useMemo(
    () => new Set(requestedCardRows.map((e) => e.cardId)),
    [requestedCardRows],
  );
  const createRequestMutation = api.request.create.useMutation({
    onMutate: (row) => {
      trpcUtils.request.getAll.setData(undefined, () => [
        row,
        ...requestedCardRows,
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
          {allCards
            .filter((e) => e.name.toLowerCase().includes(searchTerm))
            ?.map((card, i) => (
              <Link
                className="relative"
                onClick={(e) => {
                  e.preventDefault();
                  // shallow route
                  window.history.pushState(null, "", e.currentTarget.href);
                  // preload
                  queryClient.setQueryData(
                    [`https://api.pokemontcg.io/v2/cards/${card.id}`],
                    { data: card },
                  );
                  setCardId(card.id);
                }}
                href={`/${setId}/${card.id}`}
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
          <Card
            className={cn(
              "flex justify-center items-center aspect-[18/25]",
              !cardsQuery.hasNextPage && "hidden",
            )}
            ref={lastPostElementRef}
          >
            {cardsQuery.isFetchingNextPage ? (
              <Loader className="text-primary animate-spin" />
            ) : (
              <Button onClick={() => cardsQuery.fetchNextPage()}>
                Load more...
              </Button>
            )}
          </Card>
        </div>
        <Link ref={canonicalSetLinkRef} className="hidden" href={`/${setId}`} />
        <Dialog
          open={cardId != null}
          onOpenChange={() => {
            // shallow route
            window.history.pushState(
              null,
              "",
              canonicalSetLinkRef.current!.href,
            );
            setCardId(undefined);
          }}
        >
          {cardQuery.status === "success" ? (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{cardQuery.data.data.name}</DialogTitle>
              </DialogHeader>
              <Image
                className="w-full h-auto"
                src={cardQuery.data.data.images.large}
                placeholder={cardBackPlaceholder}
                alt={cardQuery.data.data.name}
                height={942}
                width={674}
              />
              <DialogFooter>
                <Button
                  onClick={async () => {
                    await onRequest(cardQuery.data.data.id);
                  }}
                  style={{
                    animationIterationCount: 1,
                  }}
                  className={cn(
                    requestedCardIds.has(cardQuery.data.data.id) &&
                      "animate-thumbs-up",
                    implementedCards.implementedCardIds.includes(
                      cardQuery.data.data.id,
                    ) && "hidden",
                  )}
                  disabled={requestedCardIds.has(cardQuery.data.data.id)}
                >
                  {!requestedCardIds.has(cardQuery.data.data.id)
                    ? "Request"
                    : "Requested 👍"}
                </Button>
              </DialogFooter>
            </DialogContent>
          ) : cardQuery.status === "pending" ? (
            <DialogContent>
              <DialogTitle>Loading card...</DialogTitle>
              <div className="flex items-center justify-center">
                <Loader className="animate-spin text-primary" />
              </div>
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
