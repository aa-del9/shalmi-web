/**
 * Zod schema helper utilities
 */

import { z } from "zod";

/**
 * Create a schema that transforms empty strings to undefined
 */
export const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) => {
  return z.preprocess((val) => {
    if (typeof val === "string" && val.trim() === "") {
      return undefined;
    }
    return val;
  }, schema);
};

/**
 * Create a required string schema (non-empty)
 */
export const requiredString = (message: string = "This field is required") => {
  return z.string().min(1, message);
};

/**
 * Create an optional string schema that treats empty strings as undefined
 */
export const optionalString = () => {
  return emptyStringToUndefined(z.string().optional());
};

/**
 * Create a schema for numeric strings (parses to number)
 */
export const numericString = () => {
  return z.string().transform((val) => {
    const num = Number(val);
    if (isNaN(num)) throw new Error("Invalid number");
    return num;
  });
};

/**
 * Create a schema for comma-separated values
 */
export const commaSeparated = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z
    .string()
    .transform((val) => val.split(",").map((s) => s.trim()))
    .pipe(z.array(itemSchema));
};
