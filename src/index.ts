import type { Grok } from '@matt-usurp/grok';
import type { OnionCoreComposition } from './component/composition';
import { OnionCoreInput } from './component/input';
import { OnionCoreLayer } from './component/layer';
import { OnionCoreOutput, isOutputType, output } from './component/output';
import { OnionCoreTerminus } from './component/terminus';
import type { OnionCoreUtility } from './component/utility';

export import InputConstraint = OnionCoreInput.InputConstraint;

export import Output = OnionCoreOutput.Output;
export import OutputConstraint = OnionCoreOutput.OutputConstraint;

export { isOutputType, output };

export import Terminus = OnionCoreTerminus.TerminusDefinition;
export import TerminusConstraint = OnionCoreTerminus.TerminusDefinitionConstraint;

export import Layer = OnionCoreLayer.Layer;
export import LayerConstraint = OnionCoreLayer.LayerConstraint;

export const createImplementationGlobalInvoke = (value: unknown): ((...args: unknown[]) => unknown) => {
  if ((value as Record<'invoke', unknown>).invoke !== undefined) {
    return (value as Record<'invoke', unknown>).invoke as ((...args: unknown[]) => unknown);
  }

  return value as ((...args: unknown[]) => unknown);
};

/**
 * Compose an onion function (the {@link Terminus}) with given {@link Layer Layers}.
 */
export class Composer<
  CurrentInput extends InputConstraint,
  CurrentOutput extends OutputConstraint,
  InitialInput extends InputConstraint,
  InitialOutput extends OutputConstraint,
> {
  protected readonly layers: OnionCoreLayer.LayerImplementationConstraint[] = [];

  /**
   * Create an instance of {@link Composer} with {@link InitialInput} and {@link InitialOutput}.
   */
  public static create<
    InitialInput extends InputConstraint,
    InitialOutput extends OutputConstraint,
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
    GivenLayerDefinition extends Layer<GivenInput, GivenOutput, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    GivenInput extends CurrentInput,
    GivenOutput extends CurrentOutput | OnionCoreLayer.LayerEnforceNextOutputPassThrough,
  >(layer: OnionCoreLayer.LayerImplementation<GivenLayerDefinition>): (
  /* eslint-disable @typescript-eslint/indent */
    Composer<
      (
        GivenLayerDefinition extends Layer<any, any, infer I, any> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (
          OnionCoreUtility.Cleanse<
            I,
            CurrentInput,
            Grok.Merge<CurrentInput, I>
          >
        )
        : 'Error:CannotInferGivenLayerDefinition'
      ),
      (
        GivenLayerDefinition extends Layer<any, any, any, infer I> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (
          OnionCoreUtility.Cleanse<
            I,
            Exclude<CurrentOutput, OnionCoreLayer.LayerEnforceNextOutputPassThrough>,
            Grok.Union<CurrentOutput, Exclude<I, OnionCoreLayer.LayerEnforceNextOutputPassThrough>>
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
    GivenTerminusDefinition extends Terminus<GivenInput, GivenOutput>,
    GivenInput extends CurrentInput,
    GivenOutput extends CurrentOutput,
  >(terminus: OnionCoreTerminus.TerminusImplementation<GivenTerminusDefinition>): OnionCoreComposition.Composition<InitialInput, InitialOutput> {
    const terminusInvokable = createImplementationGlobalInvoke(terminus);

    const build: OnionCoreComposition.CompositionBuilderFunction<InitialInput, InitialOutput> = (instrument) => {
      if (this.layers.length === 0) {
        if (instrument === undefined) {
          return terminusInvokable as OnionCoreUtility.Syntax.FunctionImplementationConstraint;
        }

        return instrument(terminus, terminusInvokable);
      }

      if (instrument === undefined) {
        return this.layers.reduceRight<OnionCoreUtility.Syntax.FunctionImplementationConstraint>((next, layer) => {
          return async (input) => createImplementationGlobalInvoke(layer)(input, next);
        }, terminusInvokable);
      }

      return this.layers.reduceRight<OnionCoreUtility.Syntax.FunctionImplementationConstraint>((next, layer) => {
        return instrument(layer, async (input) => createImplementationGlobalInvoke(layer)(input, next));
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
