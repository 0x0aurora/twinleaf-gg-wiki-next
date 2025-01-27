import type { Prisma } from "@prisma/client";
import type { ICard, ISet } from "~/lib/api/types";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import _sets from "~/lib/api/data/sets/en.json";

const sets = _sets as ISet[];

export const requestRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let result: Prisma.RequestGetPayload<object>;
      const setId = input.cardId.split("-", 2)[0]!;
      const set = sets.find((e) => e.id === setId);
      if (set == null) {
        throw new Error(`Set ${setId} does not exist!`);
      }
      let cards: ICard[];
      try {
        cards = await import(`~/lib/api/data/cards/en/${setId}.json`, {
          with: { type: "json" },
        }).then((e: { default: ICard[] }) => e.default);
      } catch (_e) {
        throw new Error(`Set ${setId} does not exist!`);
      }
      const card = cards.find((e) => e.id === input.cardId);
      if (card == null) {
        throw new Error(`Card ${input.cardId} does not exist!`);
      }
      try {
        result = await ctx.db.request.create({
          data: {
            cardId: input.cardId,
            ipAddress: ctx.headers.get("x-real-ip")!,
          },
        });
      } catch (_e) {
        throw new Error("You've already requested this card!");
      }
      const publicMessage = {
        content: `Card Implementation Request: ${card.name} (${card.id})`,
        embeds: [
          {
            title: card.name,
            description: `Set: ${set.name}`,
            image: {
              url: card.images.large,
            },
          },
        ],
      };
      // Private log message
      const logMessage = {
        content: `Log: Card Request\nCard: ${card.name} (${card.id})\nIP: ${result.ipAddress}\nTimestamp: ${result.createdAt.toISOString()}`,
      };

      console.log(publicMessage);
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const ipAddress = ctx.headers.get("x-real-ip");
    if (ipAddress == null) {
      throw new Error("Could not determine IP address!");
    }
    try {
      return await ctx.db.request.findMany({
        where: {
          ipAddress,
        },
        select: {
          cardId: true,
        },
      });
    } catch (_e) {
      throw new Error("Could not get card requests!");
    }
  }),
});
