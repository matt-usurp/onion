import type { OnionCoreInput } from './input';
import type { OnionCoreLayer } from './layer';
import type { OnionCoreOutput } from './output';
import type { OnionCoreTerminus } from './terminus';
import type { OnionCoreUtility } from './utility';

export namespace OnionCoreComposition {
  export type CompositionInstrumentFunction = (
    thing: OnionCoreLayer.LayerImplementationConstraint | OnionCoreTerminus.TerminusImplementationConstraint,
    next: OnionCoreUtility.Syntax.FunctionImplementation<any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => OnionCoreUtility.Syntax.FunctionImplementation<any, Promise<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type CompositionBuilderFunction<I, O> = (instrument?: CompositionInstrumentFunction) => OnionCoreUtility.Syntax.FunctionImplementation<I, Promise<O>>;

  export type Composition<
    GivenInput extends OnionCoreInput.InputConstraint,
    GivenOutput extends OnionCoreOutput.OutputConstraint,
  > = {
    readonly layers: OnionCoreLayer.LayerImplementationConstraint[];
    readonly build: OnionCoreComposition.CompositionBuilderFunction<GivenInput, GivenOutput>;
    readonly invoke: OnionCoreUtility.Syntax.FunctionImplementation<GivenInput, Promise<GivenOutput>>;
  };

  // Syntax sugar:
  export namespace Composition {
    export import Instrument = OnionCoreComposition.CompositionInstrumentFunction;
  }
}
