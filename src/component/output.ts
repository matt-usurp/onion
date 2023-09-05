import type { OnionUtility as U } from './utility';

/**
 * A typed output that can be used to transport data within the {@link Composer} instances.
 *
 * This is used as returns from {@link Layer} and {@link Terminus} instances.
 * Its purpose is to allow a variety of outputs that can be identified and convered down stream.
 */
export type OnionOutput<T extends string, V> = {
  /**
   * The output type identifier.
   */
  readonly type: T;

  /**
   * The output data.
   */
  readonly value: V;
};

export namespace OnionOutput {
  /**
   * A constraint type that can be used to accept types of {@link OnionOutput}.
   */
  export type OutputKind<T extends string = string> = OnionOutput<T, U.Anything>;
}

/**
 * Create instances of {@link OnionOutput} (generic type {@link T}).
 */
export const output = <T extends OnionOutput.OutputKind>(type: T['type'], value: T['value']): T => ({ type, value } as T);

export const isOutputType = <T extends OnionOutput.OutputKind>(output: unknown, type: T['type']): output is T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (output as any).type === type;
};
