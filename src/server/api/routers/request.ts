import type { Prisma } from "@prisma/client";

import { z } from "zod";
import { type ICard } from "~/lib/api/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const requestRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let result: Prisma.RequestGetPayload<object>;
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
      const cardResponse = await fetch(
        `https://api.pokemontcg.io/v2/cards/${result.cardId}`,
      );
      if (!cardResponse.ok) {
        throw new Error("Could not get card details from API!");
      }
      const card = (await cardResponse.json()) as { data: ICard };
      const publicMessage = {
        content: `Card Implementation Request: ${card.data.name} (${card.data.id})`,
        embeds: [
          {
            title: card.data.name,
            description: `Set: ${card.data.set.name}`,
            image: {
              url: card.data.images.large,
            },
          },
        ],
      };
      // Private log message
      const logMessage = {
        content: `Log: Card Request\nCard: ${card.data.name} (${card.data.id})\nIP: ${result.ipAddress}\nTimestamp: ${result.createdAt.toISOString()}`,
      };

      console.log(publicMessage);
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const ipAddress = ctx.headers.get("x-real-ip");
    if (ipAddress == null) {
      throw new Error("Could not determine IP address!")
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
