// tslint:disable-next-line:no-any
export function reduceToMap<T extends Record<string, any>>(
  key: string,
  arr: T[],
): Record<string, T> {
  // @ts-ignore
  return arr.reduce((returnMap: Record<string, T>, el: T) => {
    returnMap[el[key]] = el;
    return returnMap;
  }, {});
}
