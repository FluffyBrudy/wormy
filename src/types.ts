import { DIRECTIONS } from "./constants";

export type TCoor = [number, number];
export type TGrid = Array<Array<number>>;
export type TRadius = number;

export type TDirection = keyof typeof DIRECTIONS;

export type TAlignment = "center" | "end" | "left" | "start";
