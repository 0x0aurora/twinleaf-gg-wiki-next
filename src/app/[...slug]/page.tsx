"use client";

import * as React from "react";

import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Loader } from "lucide-react";

export default function Home({
  params,
}: {
  params: Promise<{ slug: [string, string | undefined] }>;
}) {
  const canonicalSetLinkRef = React.useRef<HTMLAnchorElement>(null);
  const { slug } = React.use(params);
  let [setId, _cardId] = slug;
  const [cardId, setCardId] = React.useState(_cardId);
  const queryClient = useQueryClient();

  // const scrollRef = React.useRef<HTMLElement>(null);

  const cardsQuery = useInfiniteQuery({
    queryKey: [`https://api.pokemontcg.io/v2/cards/?q=set.id:${setId}`],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards/?q=set.id:${setId}&page=${pageParam}`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return (await response.json()) as {
        data: {
          id: string;
          name: string;
          images: {
            small: string;
            large: string;
          };
        }[];
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

  const cardQuery = useQuery({
    queryKey: [`https://api.pokemontcg.io/v2/cards/${cardId}`],
    enabled: cardId != null,
    queryFn: async () => {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards/${cardId}`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return (await response.json()) as {
        data: {
          id: string;
          name: string;
          images: {
            small: string;
            large: string;
          };
        };
      };
    },
  });

  return (
    <main className="max-h-screen overflow-y-scroll w-full p-3">
      <div
        className="grid grid-cols-[repeat(2,minmax(0px,1fr))]
          md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3"
      >
        {allCards?.map((e, i) => (
          <Link
            onClick={(evt) => {
              evt.preventDefault();
              // shallow route
              window.history.pushState(null, "", evt.currentTarget.href);
              // preload
              queryClient.setQueryData([`https://api.pokemontcg.io/v2/cards/${e.id}`], { data: e });
              setCardId(e.id);
            }}
            href={`/${setId}/${e.id}`}
            key={i}
          >
            <Image
              loading="lazy"
              className="w-full h-auto"
              src={e.images.small}
              alt={e.name}
              height={250}
              width={180}
            />
          </Link>
        ))}
        <Card
          className={cn(
            "flex justify-center items-center",
            !cardsQuery.hasNextPage && "hidden",
          )}
        >
          <Button onClick={() => cardsQuery.fetchNextPage()}>
            Load more...
          </Button>
        </Card>
      </div>
      <Link ref={canonicalSetLinkRef} className="hidden" href={`/${setId}`} />
      <Dialog
        open={cardId != null}
        onOpenChange={() => {
          // shallow route
          window.history.pushState(null, "", canonicalSetLinkRef.current?.href);
          setCardId(undefined);
        }}
      >
        {cardQuery.status === "success" ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{cardQuery.data.data.name}</DialogTitle>
              <Image
                src={cardQuery.data.data.images.large}
                alt={cardQuery.data.data.name}
                height={250}
                width={180}
              />
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        ) : cardQuery.status === "pending" ? (
          <DialogContent className="flex items-center justify-center">
            <DialogTitle>Loading card...</DialogTitle>
            <Loader className="animate-spin text-primary" />
          </DialogContent>
        ) : (
          <></>
        )}
      </Dialog>
    </main>
  );
}
