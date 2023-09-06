import type { Grok } from '@matt-usurp/grok';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assert = (assertion: true) => undefined;

/**
 * Check that {@link A} and {@link B} are the exact same
 */
export const isExactly = <A, B>(): Grok.Value.IsExactly<A, B> => undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Check that {@link A} extends {@link B}.
 */
export const isExtending = <A, B>(): Grok.Value.IsExtending<A, B> => undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Check that {@link B} extends {@link A}.
 */
export const isExtendingReverse = <A, B>(): Grok.Value.IsExtending<B, A> => undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any
