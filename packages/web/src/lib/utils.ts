import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parse = <T>(str?: string) => {
  try {
    return JSON.parse(str!) as T;
  } catch {
    return str as T;
  }
};

export const stringify = (v: unknown) => JSON.stringify(v);

export const formatEnum = (e: bigint) => {
  const ret = formatUnits(e, 0);
  const num = Number(ret);
  return num.toString() === ret ? num : ret;
};

export const isPlainObject = (obj: unknown): obj is object =>
  Object.prototype.toString.call(obj) === "[object Object]";

export const formatObjFromSolidity = <T = any>(obj: any): T => {
  if (Array.isArray(obj)) {
    return obj.map((v) => formatObjFromSolidity(v)) as T;
  }
  if (typeof obj === "bigint") {
    return formatEnum(obj) as T;
  }
  if (isPlainObject(obj)) {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: formatObjFromSolidity(value),
      }),
      {} as T
    );
  }
  return obj;
};

export function isPromise(obj: unknown): obj is Promise<unknown> {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof (obj as Promise<unknown>).then === "function"
  );
}
