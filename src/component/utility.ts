import type { Grok } from '@matt-usurp/grok';

/**
 * Onion internals namespace for the utilities.
 */
export namespace OnionUtility {
  export type Anything = any; // eslint-disable-line @typescript-eslint/no-explicit-any

  export namespace Syntax {
    /**
     * A generic function with one {@link Input} and {@link Output}.
     */
    export type FunctionImplementation<Input, Output> = (input: Input) => Output;

    export type FunctionImplementationKind = FunctionImplementation<Anything, Anything>;

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
