export type Legality = "Legal" | "Banned";

export interface ILegality {
  expanded?: Legality;
  standard?: Legality;
  unlimited?: Legality;
}

export interface ISetImage {
  symbol: string;
  logo: string;
}

export interface ICardImage {
  small: string;
  large: string;
}

export interface ISet {
  id: string;
  images: ISetImage;
  legalities: ILegality;
  name: string;
  printedTotal: number;
  ptcgoCode: string;
  releaseDate: string;
  series: string;
  total: number;
  updatedAt: string;
}

export interface ICard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  // set: ISet;
  number: string;
  artist?: string;
  rarity: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: ILegality;
  // regulationMark?: string;
  images: ICardImage;
}
