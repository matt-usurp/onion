import type { Grok } from '@matt-usurp/grok';

type KindForString<T extends string> = { readonly $kind: T; };
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
};

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

type ClassVariant<T> = {
  invoke: T;
};

export type LayerClass<
  CurrentInput,
  CurrentOutput extends OutputKind,
  NewInput,
  NewOutput extends OutputKind,
> = ClassVariant<LayerFunction<CurrentInput, CurrentOutput, NewInput, NewOutput>>;

export type LayerFunction<
  CurrentInput,
  CurrentOutput extends OutputKind,
  NewInput,
  NewOutput extends OutputKind,
> = (input: CurrentInput, next: LayerNextFunction<NewInput, NewOutput>) => CurrentOutput;

export type Layer<
  CurrentInput,
  CurrentOutput extends OutputKind,
  NewInput,
  NewOutput extends OutputKind,
> = (
  | LayerClass<CurrentInput, CurrentOutput, NewInput, NewOutput>
  | LayerFunction<CurrentInput, CurrentOutput, NewInput, NewOutput>
);

export type TerminusClass<
  GivenInput,
  GivenOutput extends OutputKind,
> = ClassVariant<BaseFunction<GivenInput, GivenOutput>>;

export type TerminusFunction<
  GivenInput,
  GivenOutput extends OutputKind,
> = BaseFunction<GivenInput, GivenOutput>;

export type Terminus<
  GivenInput,
  GivenOutput extends OutputKind,
> = (
  | TerminusClass<GivenInput, GivenOutput>
  | TerminusFunction<GivenInput, GivenOutput>
);

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

  protected constructor() { }

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
    const terminusInvokable = extractInvokableTerminus(terminus as any);

    const build: LayerBuilderFunction<InitialInput, InitialOutput> = (instrument) => {
      if (this.layers.length === 0) {
        if (instrument === undefined) {
          return terminusInvokable as LayerBuilderPassThrough;
        }

        return instrument(terminus, terminusInvokable);
      }

      if (instrument === undefined) {
        return this.layers.reduceRight<LayerBuilderPassThrough>((next, layer) => {
          return (input: any) => extractInvokableLayer(layer)(input, next);
        }, terminusInvokable);
      }

      return this.layers.reduceRight<LayerBuilderPassThrough>((next, layer) => {
        return instrument(layer, (input: any) => extractInvokableLayer(layer)(input, next));
      }, terminusInvokable);
    };

    return {
      layers: this.layers as any,

      build,
      invoke: build(),
    };
  }
}

export const extractInvokableLayer = <
  T extends Layer<A, B, C, D>,
  A = T extends Layer<infer I, any, any, any> ? I : never,
  B extends OutputKind = T extends Layer<any, infer I, any, any> ? I : never,
  C = T extends Layer<any, any, infer I, any> ? I : never,
  D extends OutputKind = T extends Layer<any, any, any, infer I> ? I : never,
>(value: T): LayerFunction<A, B, C, D> => {
  if ((value as LayerClass<A, B, C, D>).invoke !== undefined) {
    return (value as LayerClass<A, B, C, D>).invoke;
  }

  return value as LayerFunction<A, B, C, D>;
};

export const extractInvokableTerminus = <
  T extends Terminus<A, B>,
  A = T extends Terminus<infer I, any> ? I : never,
  B extends OutputKind = T extends Terminus<any, infer I> ? I : never,
>(value: T): TerminusFunction<A, B> => {
  if ((value as TerminusClass<A, B>).invoke !== undefined) {
    return (value as TerminusClass<A, B>).invoke;
  }

  return value as TerminusFunction<A, B>;
};

type LayerBuilderPassThrough = BaseFunction<any, any>;

type LayerInstrument = (thing: LayerKind | TerminusKind, next: BaseFunction<any, any>) => BaseFunction<any, any>;
type LayerBuilderFunction<I, O> = (instrument?: LayerInstrument) => BaseFunction<I, O>;
