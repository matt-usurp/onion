import type { Grok } from '@matt-usurp/grok';

/**
 * Onion internals namespace for the utilities.
 */
namespace Onion {
  export namespace Syntax {
    /**
     * A generic function with one {@link Input} and {@link Output}.
     */
    export type FunctionImplementation<Input, Output> = (input: Input) => Output;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type FunctionImplementationConstraint = FunctionImplementation<any, any>;

    /**
     * A generic class with an invoke method of type {@link Fn}.
     */
    export type ClassImplementation<Fn> = { invoke: Fn };
  }

  /**
   * Determine if the {@link Value} can be used.
   */
  export type Cleanse<Value, Falsey, Truthy> = (
  /* eslint-disable @typescript-eslint/indent */
    Grok.If<
      Grok.Value.IsAny<Value>,
      Falsey,
      Truthy
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export namespace Cleanse {
    export type Fallback<Value, Fallback> = Cleanse<Value, Fallback, Value>;
  }
}

export { Onion as $$OnionComponentUtility };
