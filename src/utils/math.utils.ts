import type { TCoor } from "../types";

export function isCoordinateEqual(coor1: TCoor, coor2:TCoor) {
	return (
		coor1[0] === coor2[0] &&
		coor1[1] === coor2[1]
	)
}