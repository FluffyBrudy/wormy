export function randint(_min: number, _max: number) {
  const [maxNum, minNum] = [Math.max(_max, _min), Math.min(_max, _min)];
  return Math.floor(minNum + (maxNum - minNum + 1) * Math.random());
}

export function choice<T>(iterable: Array<T>) {
  const length = iterable.length;
  if (length < 1) throw new Error("sequence cannot be empty");
  const indexChoice = randint(0, length);
  return iterable[indexChoice];
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
