/**
 * Onion internals namespace for the output component.
 */
namespace Onion {
  /**
   * A typed output that can be used to transport data within the {@link Composer} instances.
   *
   * This is used as returns from {@link Layer} and {@link Terminus} instances.
   * Its purpose is to allow a variety of outputs that can be identified and convered down stream.
   */
  export type Output<T extends string, V> = {
    /**
     * The output type identifier.
     */
    readonly type: T;

    /**
     * The output data.
     */
    readonly value: V;
  };

  /**
   * A constraint type that can be used to accept types of {@link Output}.
   */
  export type OutputConstraint<T extends string = string> = (
  /* eslint-disable @typescript-eslint/indent */
    Output<
      T,
      any // eslint-disable-line @typescript-eslint/no-explicit-any
    >
  /* eslint-enable @typescript-eslint/indent */
  );
}

export { Onion as $$OnionComponentOutput };

/**
 * Create instances of {@link Output} (generic type {@link T}).
 */
export const output = <T extends Onion.OutputConstraint>(type: T['type'], value: T['value']): T => ({ type, value } as T);

export const isOutputType = <T extends Onion.OutputConstraint>(output: unknown, type: T['type']): output is T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (output as any).type === type;
};
