/* eslint-disable import/prefer-default-export */
interface IParams {
  minMilliseconds?: number;
  maxMilliseconds?: number;
}

export function sleepRandomTime({
  minMilliseconds,
  maxMilliseconds
}: IParams): Promise<void> {
  const min = !minMilliseconds ? 2 : minMilliseconds;
  const max = !maxMilliseconds ? 4 : maxMilliseconds;
  const ms = Math.random() * (max - min) + min;
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
