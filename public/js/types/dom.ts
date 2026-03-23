export type NullableElement<T extends Element = Element> = T | null;

export type NullableHTMLElement = NullableElement<HTMLElement>;
export type NullableInputElement = NullableElement<HTMLInputElement>;
export type NullableCanvasElement = NullableElement<HTMLCanvasElement>;
