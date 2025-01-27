
"use client";

import * as React from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";

export default function Home({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  // const scrollRef = React.useRef<HTMLElement>(null);

  const cardsQuery = useInfiniteQuery({
    queryKey: [`https://api.pokemontcg.io/v2/cards/?set_id=${slug}`],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`https://api.pokemontcg.io/v2/cards/?set_id=${slug}&page=${pageParam}`);
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

  // React.useEffect(() => {
  //   const cb = (evt: Event) => {
  //     console.log(scrollRef.current?.scrollTop);
  //   };
  //   scrollRef.current?.addEventListener("scroll", cb);
  //   return () => scrollRef.current?.removeEventListener("scroll", cb);
  // }, []);

  
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  return (
    <main className="max-h-screen overflow-y-scroll w-full p-3">
      <div className="grid grid-cols-[repeat(2,minmax(0px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
        {
          cardsQuery.data?.pages.flatMap((e) => e.data).map((e, i) =>
            <div className="" key={i}>
              <Image loading="lazy" className="w-full h-auto" src={e.images.small} alt={e.name} height={250} width={180} />
            </div>
          )
        }
      </div>
    </main>
  );
}
