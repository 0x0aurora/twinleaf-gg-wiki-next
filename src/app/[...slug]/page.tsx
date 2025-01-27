
"use client";

import * as React from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export default function Home({ params }: { params: Promise<{ slug: [string, string | undefined] }> }) {
  const { slug } = React.use(params);
  const [setId, cardId] = slug;

  // const scrollRef = React.useRef<HTMLElement>(null);

  const cardsQuery = useInfiniteQuery({
    queryKey: [`https://api.pokemontcg.io/v2/cards/?set_id=${setId}`],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`https://api.pokemontcg.io/v2/cards/?set_id=${setId}&page=${pageParam}`);
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return await response.json() as {
          data: {
              id: string,
              name: string,
              images: {
                small: string,
                large: string,
              }
          }[],
          page: number
          pageSize: number,
          count: number,
          totalCount: number,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page * lastPage.pageSize >= lastPage.totalCount ? null : lastPage.page + 1,
  });

  return (
    <main className="max-h-screen overflow-y-scroll w-full p-3">
      <div className="grid grid-cols-[repeat(2,minmax(0px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
        {
          cardsQuery.data?.pages.flatMap((e) => e.data).map((e, i) =>
            <Link href={`/${setId}/${e.id}`} key={i}>
              <Image loading="lazy" className="w-full h-auto" src={e.images.small} alt={e.name} height={250} width={180} />
            </Link>
          )
        }
      </div>
    </main>
  );
}
