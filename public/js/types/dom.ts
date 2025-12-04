/**
 * DOM-специфичные типы для клиентской части
 * Этот файл не включается в серверную сборку
 */

/**
 * Элемент DOM с возможным null
 */
export type NullableElement<T extends Element = Element> = T | null;

/**
 * HTML элементы для типизации querySelector
 */
export type NullableHTMLElement = NullableElement<HTMLElement>;
export type NullableInputElement = NullableElement<HTMLInputElement>;
export type NullableCanvasElement = NullableElement<HTMLCanvasElement>;
