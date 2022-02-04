// ColorGradient.ts is a module for generating simple or multi-stop 'linear gradient' color arrays.

export declare type rgb = [number, number, number];  // number belongs to [0, 256)
export declare type hex = string;                    // string encodes hex number between [0, ffffff]

export declare const RAINBOW: hex[];
export declare const TABLEAU10: hex[];

/**
 * rgb to hexadecimal 'type' conversion.
 * @param rgb a [red, green, blue] triplet. Values belong to [0, 256).
 * @returns the hexadecimal representation of rgb.
 */
export declare function rgbToHex (rgb: rgb): hex;

/**
 * decimal to hexadecimal 'type' conversion.
 * @param n a number.
 * @returns the hexadecimal representation of n.
 */
export declare function toHex (n: number): hex;

/**
 * hexadecimal to rgb 'type' conversion.
 * @param hex a [0, ffffff] or [0, fff] string hexadecimal value.
 * @returns the rgb representation of hex.
 */
export declare function hexToRgb (hex: hex): rgb;

/**
 * creates a gradient-like color array.
 * @param steps the number of colors that should be returned.
 * @param start the starting color. 
 * @param end the ending color.
 * @param inclusive should the ending color be included? default = true.
 * @returns an rgb[] of 'steps' equidistant colors from start to end.
 */
export declare function discreteGradient (steps: number, start: hex | rgb, end: hex | rgb, inclusive?: boolean): rgb[];

/**
 * creates a multi-stop gradient-like color array.
 * @param steps the number of colors that should be returned. 
 * @param colors the set of colors (stops) to transition between. 
 * @returns an rgb[] of equidistant colors transitioning between each stop.
 */
export declare function multiColorDiscreteGradient (steps: number, colors: (hex | rgb)[]): rgb[];

/**
 * creates a color palette DOM element.
 * @param colors the colors to display.
 * @param height the height of the palette. Default = 30.
 * @returns the palette element.
 */
export declare function paletteElement(colors: (hex | rgb)[], height?: number): HTMLElement;
