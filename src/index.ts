import type { Grok } from '@matt-usurp/grok';
import { $$OnionComponentComposition as C, createOnionCompositionGlobalInvoke } from './component/composition';
import { $$OnionComponentInput as I } from './component/input';
import { $$OnionComponentLayer as L } from './component/layer';
import { $$OnionComponentOutput as O, isOutputType, output } from './component/output';
import { $$OnionComponentTerminus as T } from './component/terminus';
import type { $$OnionComponentUtility as U } from './component/utility';

export import InputConstraint = I.InputConstraint;

export import Output = O.Output;
export import OutputConstraint = O.OutputConstraint;

export { isOutputType, output };

export import Terminus = T.TerminusDefinition;
export import TerminusConstraint = T.TerminusDefinitionConstraint;

export import Layer = L.Layer;
export import LayerConstraint = L.LayerConstraint;

export import Composition = C.Composition;

/**
 * Compose an onion function (the {@link Terminus}) with given {@link Layer Layers}.
 */
export class Composer<
  CurrentInput extends InputConstraint,
  CurrentOutput extends OutputConstraint,
  InitialInput extends InputConstraint,
  InitialOutput extends OutputConstraint,
> {
  protected readonly layers: L.LayerImplementationConstraint[] = [];

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
    GivenOutput extends CurrentOutput | L.LayerEnforceNextOutputPassThrough,
  >(layer: L.LayerImplementation<GivenLayerDefinition>): (
  /* eslint-disable @typescript-eslint/indent */
    Composer<
      (
        GivenLayerDefinition extends Layer<any, any, infer I, any> // eslint-disable-line @typescript-eslint/no-explicit-any
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
        GivenLayerDefinition extends Layer<any, any, any, infer I> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (
          U.Cleanse<
            I,
            Exclude<CurrentOutput, L.LayerEnforceNextOutputPassThrough>,
            Grok.Union<CurrentOutput, Exclude<I, L.LayerEnforceNextOutputPassThrough>>
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
  >(terminus: T.TerminusImplementation<GivenTerminusDefinition>): C.Composition<InitialInput, InitialOutput> {
    const terminusInvokable = createOnionCompositionGlobalInvoke(terminus);

    const build: C.CompositionBuilderFunction<InitialInput, InitialOutput> = (instrument) => {
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
