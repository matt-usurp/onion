import type { Grok } from '@matt-usurp/grok';
import type { OnionComposition } from './component/composition';
import { createOnionCompositionGlobalInvoke } from './component/composition';
import type { OnionInput } from './component/input';
import type { OnionLayer } from './component/layer';
import type { OnionOutput } from './component/output';
import { isOutputType, output } from './component/output';
import type { OnionTerminus } from './component/terminus';
import type { OnionUtility as U } from './component/utility';

export { isOutputType, output };
export type { OnionComposition as Composition, OnionInput as Input, OnionLayer as Layer, OnionOutput as Output, OnionTerminus as Terminus };

/**
 * Compose an onion function (the {@link Terminus}) with given {@link Layer Layers}.
 */
export class Composer<
  CurrentInput extends OnionInput.InputKind,
  CurrentOutput extends OnionOutput.OutputKind,
  InitialInput extends OnionInput.InputKind,
  InitialOutput extends OnionOutput.OutputKind,
> {
  protected readonly layers: OnionLayer.LayerImplementationConstraint[] = [];

  /**
   * Create an instance of {@link Composer} with {@link InitialInput} and {@link InitialOutput}.
   */
  public static create<
    InitialInput extends OnionInput.InputKind,
    InitialOutput extends OnionOutput.OutputKind,
  >(): Composer<InitialInput, InitialOutput, InitialInput, InitialOutput> {
    return new this();
  }

  /**
   * Protected constructor to enforce usage of {@link create()}.
   */
  protected constructor() { }

  /**
   * Apply the given {@link GivenLayerDefinition} and its types.
   */
  public use<
    GivenLayerDefinition extends OnionLayer<GivenInput, GivenOutput, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    GivenInput extends CurrentInput,
    GivenOutput extends CurrentOutput | OnionLayer.LayerEnforceNextOutputPassThrough,
  >(layer: OnionLayer.LayerImplementation<GivenLayerDefinition>): (
  /* eslint-disable @typescript-eslint/indent */
    Composer<
      (
        GivenLayerDefinition extends OnionLayer<any, any, infer I, any> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (
          U.Cleanse<
            I,
            CurrentInput,
            Grok.Merge<CurrentInput, I>
          >
        )
        : 'Error:CannotInferGivenLayerDefinition'
      ),
      (
        GivenLayerDefinition extends OnionLayer<any, any, any, infer I> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (
          U.Cleanse<
            I,
            Exclude<CurrentOutput, OnionLayer.LayerEnforceNextOutputPassThrough>,
            Grok.Union<CurrentOutput, Exclude<I, OnionLayer.LayerEnforceNextOutputPassThrough>>
          >
        )
        : 'Error:CannotInferGivenLayerDefinition'
      ),
      InitialInput,
      InitialOutput
    >
  /* eslint-enable @typescript-eslint/indent */
  ) {
    this.layers.push(layer);

    return this as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  /**
   * Terminate the composition with the {@link GivenTerminusDefinition}.
   */
  public end<
    GivenTerminusDefinition extends OnionTerminus<GivenInput, GivenOutput>,
    GivenInput extends CurrentInput,
    GivenOutput extends CurrentOutput,
  >(terminus: OnionTerminus.TerminusImplementation<GivenTerminusDefinition>): OnionComposition<InitialInput, InitialOutput> {
    const terminusInvokable = createOnionCompositionGlobalInvoke(terminus);

    const build: OnionComposition.CompositionBuilderFunction<InitialInput, InitialOutput> = (instrument) => {
      if (this.layers.length === 0) {
        if (instrument === undefined) {
          return terminusInvokable as U.Syntax.FunctionImplementationKind;
        }

        return instrument(terminus, terminusInvokable);
      }

      if (instrument === undefined) {
        return this.layers.reduceRight<U.Syntax.FunctionImplementationKind>((next, layer) => {
          return async (input) => createOnionCompositionGlobalInvoke(layer)(input, next);
        }, terminusInvokable);
      }

      return this.layers.reduceRight<U.Syntax.FunctionImplementationKind>((next, layer) => {
        return instrument(layer, async (input) => createOnionCompositionGlobalInvoke(layer)(input, next));
      }, terminusInvokable);
    };

    return {
      layers: this.layers,
      build,
      invoke: build(),
    };
  }
}

/**
 * A constraint type that can be used to accept types of {@link Composer}.
 */
export type ComposerConstraint = Composer<any, any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
