// ColorGradient.ts is a module for generating simple or multi-stop 'linear gradient' color arrays.


/* === types === */

export declare type rgb = [number, number, number];  // number belongs to [0, 256)
export declare type hex = string;                    // string encodes hex number between [0, ffffff]

/* === basic sets ===*/

export const RAINBOW   = ["#DF1015", "#EBD301", "#5EB034", "#059ACB", "#3571AF", "#7A4A95", "#CE3689"];
export const TABLEAU10 = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'];

/* === functions ===*/

/**
 * rgb to hexadecimal 'type' conversion.
 * @param rgb a [red, green, blue] triplet. Values belong to [0, 256).
 * @returns the hexadecimal representation of rgb.
 */
export function rgbToHex (rgb: rgb): hex {

    return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

/**
 * decimal to hexadecimal 'type' conversion.
 * @param n a number.
 * @returns the hexadecimal representation of n.
 */
export function toHex (n: number): hex {

    return Math.floor(n).toString(16);
}

/**
 * hexadecimal to rgb 'type' conversion.
 * @param hex a [0, ffffff] or [0, fff] string hexadecimal value.
 * @returns the rgb representation of hex.
 */
export function hexToRgb (hex: hex): rgb {
    // modified from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || result.length === 0) throw new Error('hexToRgb called with invalid hex string.');
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ];
}

/**
 * creates a gradient-like color array.
 * @param steps the number of colors that should be returned.
 * @param start the starting color. 
 * @param end the ending color.
 * @param inclusive should the ending color be included? default = true.
 * @returns an rgb[] of 'steps' equidistant colors from start to end.
 */
export function discreteGradient (steps: number, start: hex | rgb, end: hex | rgb, inclusive: boolean = true): rgb[] {

    if (typeof start === 'string') start = hexToRgb(start);
    if (typeof end === 'string') end = hexToRgb(end);
    
    const hues = []
    const direction = [
        start[0] - end[0] > 0 ? -1 : 1,
        start[1] - end[1] > 0 ? -1 : 1,
        start[2] - end[2] > 0 ? -1 : 1,
    ]
    const step = [
        Math.abs(start[0] - end[0]) / (inclusive ? steps - 1 : steps),
        Math.abs(start[1] - end[1]) / (inclusive ? steps - 1 : steps),
        Math.abs(start[2] - end[2]) / (inclusive ? steps - 1 : steps)
    ]
    for (let i = 0; i < (inclusive ? steps - 1 : steps); ++i) {
        const color: rgb = [
            start[0] + i * direction[0] * step[0],
            start[1] + i * direction[1] * step[1],
            start[2] + i * direction[2] * step[2],
        ]
        hues.push(color);
    }
    if (inclusive) hues.push(end);

    return hues;
}

/**
 * creates a multi-stop gradient-like color array.
 * @param steps the number of colors that should be returned. 
 * @param colors the set of colors (stops) to transition between. 
 * @returns an rgb[] of equidistant colors transitioning between each stop.
 */
export function multiColorDiscreteGradient (steps: number, colors: (hex | rgb)[]): rgb[] {

    const hues = [];
    const size = colors.length - 1;                     // ending color is treated separately (as to always be included).
    const generate = Math.floor((steps - 1) / size);    // amount of colors to generate between each color of 'colors': [i, i+1)
    const missing = (steps - 1) % size;                 // missing amount of colors to reach n total in output 
    const middle = Math.floor(size / 2);                // index for the expected center of hues.
    const expand_i = missing / 2;                       // distance from center where to start including the missing colors. 

    for (let i = 0; i < size; ++i) {
        let n = generate;
        if (middle - expand_i <= i && i < middle + expand_i) ++ n;
        hues.push(...discreteGradient(n, colors[i], colors[i + 1], false));
    }
    const last = colors[size];
    if (typeof last === 'string') hues.push(hexToRgb(last));
    else hues.push(last);

    return hues;
}

/**
 * creates a color palette DOM element.
 * @param colors the colors to display.
 * @param height the height of the palette. Default = 30.
 * @returns the palette element.
 */
export function paletteElement(colors: (hex | rgb)[], height: number = 30): HTMLElement {
    
    const palette = document.createElement('div');
    palette.style.display = "flex";
    palette.style.height = `${height}px`;
    
    for (const color of colors) {
        const div = document.createElement('div');
        div.style.flexGrow = "1";
        div.style.backgroundColor = typeof color === 'string' ? color : `rgb(${color})`;
        palette.appendChild(div);
    }
    return palette;
}

