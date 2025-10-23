/**
 * Converts a string to a number, returning a default value if the conversion fails.
 *
 * This function safely parses a numeric string into a number.  
 * If the string cannot be converted (e.g., it contains non-numeric characters),
 * the provided `default_value` is returned instead.
 *
 * @param str_nbr - The string to convert to a number.
 * @param default_value - The value to return if the conversion fails (default: 10).
 * @returns The parsed number, or `default_value` if invalid.
 *
 * @example
 * atoi("42");       // → 42
 * atoi("abc", 5);   // → 5
 * atoi("3.14");     // → 3.14
 */
export default function atoi(str_nbr: string, default_value: number = 10): number {
    return Number.isNaN(+str_nbr) ? default_value : +str_nbr;
}


/**
 * Converts a string to an integer (floored), returning 0 if the conversion fails.
 *
 * This function wraps {@link atoi}, ensuring that the result is always
 * an integer by applying `Math.floor`.  
 * If the input cannot be parsed into a number, it defaults to `0`.
 *
 * @param str_nbr - The string to convert to an integer.
 * @returns The floored integer value of the parsed number, or `0` if invalid.
 *
 * @example
 * atoii("12.8");  // → 12
 * atoii("abc");   // → 0
 */
export function atoii(str_nbr: string): number {
    return Math.floor(atoi(str_nbr, 0));
}
