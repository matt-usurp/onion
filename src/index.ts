import type { Grok } from '@matt-usurp/grok';

const InheritMarker = Symbol();
const InheritInput = Symbol();
const InheritOutput = Symbol();

/**
 * A typed output that can be used to transport data within the {@link Composer} instances.
 *
 * This is used as returns from {@link Layer} and {@link Terminus} instances.
 * Its purpose is to allow a variety of outputs that can be identified and convered down stream.
 */
export type Output<T extends string, V> = {
  /**
   * The output type identifier.
   */
  readonly type: T;

  /**
   * The output data.
   */
  readonly value: V;
};

/**
 * A constraint type that can be used to accept types of {@link Output}.
 */
export type OutputConstraint<T extends string = string> = Output<T, any>;

/**
 * Create instances of {@link Output} (generic type {@link T}).
 */
export const output = <T extends OutputConstraint>(type: T['type'], value: T['value']): T => ({ type, value } as T);

export type BaseFunction<Input, Output> = (input: Input) => Output;

export type ComposerComposition<
  GivenInput,
  GivenOutput extends OutputConstraint,
> = {
  readonly layers: Layer<GivenInput, GivenOutput, any, any>[];

  build: LayerBuilderFunction<GivenInput, GivenOutput>;
  invoke: BaseFunction<GivenInput, GivenOutput>;
};

export type LayerEnforceNextInputPassThrough = {
  readonly [InheritMarker]: typeof InheritInput;
};

export type LayerEnforceNextOutputPassThrough = Output<'layer:passthtrough', {
  readonly [InheritMarker]: typeof InheritOutput;
}>;

export type LayerNextFunction<NewInput, Output> = (input: NewInput) => Output;

type ClassVariant<T> = {
  invoke: T;
};

export type LayerClass<
  CurrentInput,
  CurrentOutput extends OutputConstraint,
  NewInput,
  NewOutput extends OutputConstraint,
> = ClassVariant<LayerFunction<CurrentInput, CurrentOutput, NewInput, NewOutput>>;

export type LayerFunction<
  CurrentInput,
  CurrentOutput extends OutputConstraint,
  NewInput,
  NewOutput extends OutputConstraint,
> = (input: CurrentInput & LayerEnforceNextInputPassThrough, next: LayerNextFunction<NewInput & LayerEnforceNextInputPassThrough, NewOutput | LayerEnforceNextOutputPassThrough>) => CurrentOutput | LayerEnforceNextOutputPassThrough;

export type Layer<
  CurrentInput,
  CurrentOutput extends OutputConstraint,
  NewInput,
  NewOutput extends OutputConstraint,
> = (
  | LayerClass<CurrentInput, CurrentOutput, NewInput, NewOutput>
  | LayerFunction<CurrentInput, CurrentOutput, NewInput, NewOutput>
);

export type TerminusClass<
  GivenInput,
  GivenOutput extends OutputConstraint,
> = ClassVariant<BaseFunction<GivenInput, GivenOutput>>;

export type TerminusFunction<
  GivenInput,
  GivenOutput extends OutputConstraint,
> = BaseFunction<GivenInput, GivenOutput>;

export type Terminus<
  GivenInput,
  GivenOutput extends OutputConstraint,
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

export type MakeLayerInput<T extends LayerKind> = (
  T extends Layer<infer I, any, any, any>
    ? (
      Grok.If<
        Grok.Value.IsAny<I>,
        LayerEnforceNextInputPassThrough,
        I & LayerEnforceNextInputPassThrough
      >
    )
    : LayerEnforceNextInputPassThrough
);

export type MakeLayerOutput<T extends LayerKind> = (
  T extends Layer<any, infer I, any, any>
    ? (
      Grok.If<
        Grok.Value.IsAny<I>,
        LayerEnforceNextOutputPassThrough,
        I | LayerEnforceNextOutputPassThrough
      >
    )
    : LayerEnforceNextOutputPassThrough
);

export type MakeLayerNext<T extends LayerKind> = (
  LayerNextFunction<
    (
      T extends Layer<any, any, infer I, any>
        ? (
          Grok.If<
            Grok.Value.IsAny<I>,
            LayerEnforceNextInputPassThrough,
            I & LayerEnforceNextInputPassThrough
          >
        )
        : LayerEnforceNextInputPassThrough
    ),
    (
      T extends Layer<any, any, any, infer I>
        ? (
          Grok.If<
            Grok.Value.IsAny<I>,
            LayerEnforceNextOutputPassThrough,
            I | LayerEnforceNextOutputPassThrough
          >
        )
        : LayerEnforceNextOutputPassThrough
    )
  >
);

export type MakeTerminusInput<T extends TerminusKind> = (
  T extends Terminus<infer I, any>
    ? (
      Grok.If<
        Grok.Value.IsAny<I>,
        undefined,
        I
      >
    )
    : undefined
);

export type MakeTerminusOutput<T extends TerminusKind> = (
  T extends Terminus<any, infer I>
    ? (
      Grok.If<
        Grok.Value.IsAny<I>,
        OutputConstraint,
        I
      >
    )
    : OutputConstraint
);

export type ComposerKind = Composer<any, any, any, any>;

export class Composer<
  CurrentInput,
  CurrentOutput extends OutputConstraint,
  InitialInput,
  InitialOutput extends OutputConstraint,
> {
  protected readonly layers: Layer<any, any, any, any>[] = [];

  public static create<InitialInput, InitialOutput extends OutputConstraint>(): Composer<InitialInput, InitialOutput, InitialInput, InitialOutput> {
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
    GivenOutput extends CurrentOutput | LayerEnforceNextOutputPassThrough,
  >(Layer: GivenLayer): (
      Composer<
        (
          GivenLayer extends Layer<any, any, infer I, any>
          ? (
            Grok.If<
              Grok.Value.IsAny<I>,
              CurrentInput,
              Grok.Merge<CurrentInput, I>
            >
          )
          : 'Error:CannotInferGivenLayer'
        ),
        (
          GivenLayer extends Layer<any, any, any, infer I>
          ? (
            Grok.If<
              Grok.Value.IsAny<I>,
              Exclude<CurrentOutput, LayerEnforceNextOutputPassThrough>,
              Grok.Union<CurrentOutput, Exclude<I, LayerEnforceNextOutputPassThrough>>
            >
          )
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
  B extends OutputConstraint = T extends Layer<any, infer I, any, any> ? I : never,
  C = T extends Layer<any, any, infer I, any> ? I : never,
  D extends OutputConstraint = T extends Layer<any, any, any, infer I> ? I : never,
>(value: T): LayerFunction<A, B, C, D> => {
  if ((value as LayerClass<A, B, C, D>).invoke !== undefined) {
    return (value as LayerClass<A, B, C, D>).invoke;
  }

  return value as LayerFunction<A, B, C, D>;
};

export const extractInvokableTerminus = <
  T extends Terminus<A, B>,
  A = T extends Terminus<infer I, any> ? I : never,
  B extends OutputConstraint = T extends Terminus<any, infer I> ? I : never,
>(value: T): TerminusFunction<A, B> => {
  if ((value as TerminusClass<A, B>).invoke !== undefined) {
    return (value as TerminusClass<A, B>).invoke;
  }

  return value as TerminusFunction<A, B>;
};

type LayerBuilderPassThrough = BaseFunction<any, any>;

type LayerInstrument = (thing: LayerKind | TerminusKind, next: BaseFunction<any, any>) => BaseFunction<any, any>;
type LayerBuilderFunction<I, O> = (instrument?: LayerInstrument) => BaseFunction<I, O>;
