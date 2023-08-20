import type { Grok } from '@matt-usurp/grok';

type KindForString<T extends string> = { readonly $kind: T };
export type Kind<T extends string, D> = D & KindForString<T>;
export type KindConstraint = KindForString<string>;

export type OutputKind = KindConstraint;

export type BaseFunction<Input, Output> = (input: Input) => Output;

export type ComposerComposition<
  GivenInput,
  GivenOutput extends OutputKind,
> = {
  readonly layers: Layer<GivenInput, GivenOutput, any, any>[];

  build: LayerBuilderFunction<GivenInput, GivenOutput>;
  invoke: BaseFunction<GivenInput, GivenOutput>;
}

export type Definition<
  InputInbound,
  InputOutbound extends OutputKind,
  OutputInbound,
  OutputOutbound extends OutputKind,
> = {
  readonly InputInbound: InputInbound;
  readonly InputOutbound: InputOutbound;
  readonly OutputInbound: OutputInbound;
  readonly OutputOutbound: OutputOutbound;
};

export type LayerEnforceNextPassThrough = Kind<'next:passthtrough', {
  $passthrough: symbol;
}>;

export type LayerNextFunction<NewInput, Output> = (input: NewInput) => Output;

export type Layer<
  CurrentInput,
  CurrentOutput extends OutputKind,
  NewInput,
  NewOutput extends OutputKind,
> = {
  invoke(input: CurrentInput, next: LayerNextFunction<NewInput, NewOutput>): CurrentOutput;
};


export type Terminus<
  GivenInput,
  GivenOutput extends OutputKind,
> = {
  invoke: BaseFunction<GivenInput, GivenOutput>;
};

export type LayerKind = Layer<any, any, any, any>;
export type TerminusKind = Terminus<any, any>;

type ResolveCurrentInput<Current, Value> = (
  Grok.If<
    Grok.Value.IsAny<Value>,
    Current,
    Grok.Merge<Current, Value>
  >
);

type ResolveCurrentOutput<Current, Value> = (
  Grok.If<
    Grok.Value.IsAny<Value>,
    Current,
    Grok.Union<Current, Value>
  >
);

export type ComposerWithLayer<
  CurrentInput,
  CurrentOutput extends OutputKind,
  InitialInput,
  InitialOutput extends OutputKind,
  GivenLayer extends LayerKind,
> = (
  Composer<
    (
      GivenLayer extends Layer<any, any, infer I, any>
        ? ResolveCurrentInput<CurrentInput, I>
        : 'Error:CannotInferGivenLayer'
    ),
    (
      GivenLayer extends Layer<any, any, any, infer I>
        ? ResolveCurrentOutput<CurrentOutput, I>
        : 'Error:CannotInferGivenLayer'
    ),
    InitialInput,
    InitialOutput
  >
);

export type ComposerKind = Composer<any, any, any, any>;

export class Composer<
  CurrentInput,
  CurrentOutput extends OutputKind,
  InitialInput,
  InitialOutput extends OutputKind,
> {
  protected readonly layers: Layer<any, any, any, any>[] = [];

  public static create<InitialInput, InitialOutput extends OutputKind>(): Composer<InitialInput, InitialOutput, InitialInput, InitialOutput> {
    return new this();
  }

  protected constructor () {}

  public use<
    GivenLayer extends Layer<
      /* CurrentInput */ GivenInput,
      /* CurrentOutput */ GivenOutput,
      /* NewInput */ any,
      /* NewOutput */ any // CurrentOutput | LayerEnforceNextPassThrough
    >,
    GivenInput extends CurrentInput,
    GivenOutput extends CurrentOutput,
  >(Layer: GivenLayer): (
    Composer<
      (
        GivenLayer extends Layer<any, any, infer I, any>
          ? ResolveCurrentInput<CurrentInput, I>
          : 'Error:CannotInferGivenLayer'
      ),
      (
        GivenLayer extends Layer<any, any, any, infer I>
          ? ResolveCurrentOutput<CurrentOutput, I>
          : 'Error:CannotInferGivenLayer'
      ),
      InitialInput,
      InitialOutput
    >
  ) {
    this.layers.push(Layer);

    return this as any;
  }

  public end<
    T extends Terminus<GivenInput, GivenOutput>,
    GivenInput extends CurrentInput,
    GivenOutput extends CurrentOutput,
  >(terminus: T): ComposerComposition<InitialInput, InitialOutput> {
    const build: LayerBuilderFunction<InitialInput, InitialOutput> = (instrument) => {
      if (this.layers.length === 0) {
        if (instrument === undefined) {
          return terminus.invoke as LayerBuilderPassThrough;
        }

        return instrument(terminus, terminus.invoke);
      }

      if (instrument === undefined) {
        return this.layers.reduceRight<LayerBuilderPassThrough>((next, layer) => {
          return (input: any) => layer.invoke(input, next);
        }, terminus.invoke);
      }

      return this.layers.reduceRight<LayerBuilderPassThrough>((next, layer) => {
        return instrument(layer, (input: any) => layer.invoke(input, next));
      }, terminus.invoke);
    };

    return {
      layers: this.layers as any,

      build,
      invoke: (input) => build()(input),
    };
  }
}

type LayerBuilderPassThrough = BaseFunction<any, any>;

type LayerInstrument = (thing: LayerKind | TerminusKind, next: BaseFunction<any, any>) => BaseFunction<any, any>;
type LayerBuilderFunction<I, O> = (instrument?: LayerInstrument) => BaseFunction<I, O>;
