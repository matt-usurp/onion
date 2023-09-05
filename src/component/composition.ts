import type { OnionInput } from './input';
import type { OnionLayer } from './layer';
import type { OnionOutput } from './output';
import type { OnionTerminus } from './terminus';
import type { OnionUtility as U } from './utility';

/**
 * Onion internals namespace for the composition component.
 */
export namespace OnionComposition {
  /**
   * A function that can be used to instrument the various levels of the composition.
   *
   * This works much like layers work individually, but instead this function is in control of invoking the chain.
   * Each layer is passed in order defined before being passed the terminus.
   */
  export type CompositionInstrumentFunction<GivenInput, GivenOutput> = (
    implementation: OnionLayer.LayerImplementationConstraint | OnionTerminus.TerminusImplementationConstraint,
    next: U.Syntax.FunctionImplementation<U.Anything, Promise<U.Anything>>,
  ) => U.Syntax.FunctionImplementation<GivenInput, Promise<GivenOutput>>;

  /**
   * A function that takes an optional {@link CompositionInstrumentFunction} and prepares an invokable chain.
   */
  export type CompositionBuilderFunction<GivenInput, GivenOutput> = (
    instrument?: CompositionInstrumentFunction<U.Anything, U.Anything>,
  ) => U.Syntax.FunctionImplementation<GivenInput, Promise<GivenOutput>>;

  /**
   * The composition that was created using the builder.
   *
   * Provided are:
   * - All the {@link OnionLayer.LayerImplementationConstraint Layers} that were used.
   * - A `build()` function that will create an invokable chain with an optional instrumentation function.
   * - A `invoke()` function that is prebuilt.
   */
  export type Composition<
    GivenInput extends OnionInput.InputKind,
    GivenOutput extends OnionOutput.OutputKind,
  > = {
    /**
     * All layers.
     */
    readonly layers: OnionLayer.LayerImplementationConstraint[];

    /**
     * A builder for the composition.
     */
    readonly build: CompositionBuilderFunction<GivenInput, GivenOutput>;

    /**
     * A pre-built composition.
     */
    readonly invoke: U.Syntax.FunctionImplementation<GivenInput, Promise<GivenOutput>>;
  };

  // Syntax sugar:
  export namespace Composition {
    export import Instrument = OnionComposition.CompositionInstrumentFunction;
  }
}

export const createOnionCompositionGlobalInvoke = (value: unknown): ((...args: unknown[]) => Promise<unknown>) => {
  if ((value as Record<'invoke', unknown>).invoke !== undefined) {
    return (value as Record<'invoke', unknown>).invoke as ((...args: unknown[]) => Promise<unknown>);
  }

  return value as ((...args: unknown[]) => Promise<unknown>);
};
