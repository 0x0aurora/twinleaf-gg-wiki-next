import * as React from "react";

import type { ISet, ICard } from "~/lib/api/types";
import _sets from "~/lib/api/data/sets/en.json";
import SetPage from "~/components/SetPage";
import { api, HydrateClient } from "~/trpc/server";

const sets = _sets as ISet[];

export const dynamic = "auto";

export default async function Set({
  params,
}: {
  params: Promise<{ slug: [string, string | undefined] }>;
}) {
  const [setId, cardId] = (await params).slug;
  const set = sets.find((e) => e.id === setId);
  if (set == null) {
    throw new Error(`No set found for set id ${setId}!`);
  }
  const cards = await import(`~/lib/api/data/cards/en/${setId}.json`, {
    with: { type: "json" },
  }).then((e: { default: ICard[] }) => e.default);
  const card = cards.find((e) => e.id === cardId);
  void api.request.getAll.prefetch();
  return (
    <HydrateClient>
      <SetPage set={set} card={card} cards={cards} />
    </HydrateClient>
  );
}
