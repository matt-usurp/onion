import type { $$OnionComponentInput as I } from './input';
import type { $$OnionComponentLayer as L } from './layer';
import type { $$OnionComponentOutput as O } from './output';
import type { $$OnionComponentTerminus as T } from './terminus';
import type { $$OnionComponentUtility as U } from './utility';

/**
 * Onion internals namespace for the composition component.
 */
namespace Onion {
  export type CompositionInstrumentFunction = (
    thing: L.LayerImplementationConstraint | T.TerminusImplementationConstraint,
    next: U.Syntax.FunctionImplementation<any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => U.Syntax.FunctionImplementation<any, Promise<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type CompositionBuilderFunction<I, O> = (instrument?: CompositionInstrumentFunction) => U.Syntax.FunctionImplementation<I, Promise<O>>;

  export type Composition<
    GivenInput extends I.InputConstraint,
    GivenOutput extends O.OutputConstraint,
  > = {
    readonly layers: L.LayerImplementationConstraint[];
    readonly build: Onion.CompositionBuilderFunction<GivenInput, GivenOutput>;
    readonly invoke: U.Syntax.FunctionImplementation<GivenInput, Promise<GivenOutput>>;
  };

  // Syntax sugar:
  export namespace Composition {
    export import Instrument = Onion.CompositionInstrumentFunction;
  }
}

export { Onion as $$OnionComponentComposition };

export const createOnionCompositionGlobalInvoke = (value: unknown): ((...args: unknown[]) => unknown) => {
  if ((value as Record<'invoke', unknown>).invoke !== undefined) {
    return (value as Record<'invoke', unknown>).invoke as ((...args: unknown[]) => unknown);
  }

  return value as ((...args: unknown[]) => unknown);
};
