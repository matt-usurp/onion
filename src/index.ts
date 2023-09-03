import type { Grok } from '@matt-usurp/grok';

// --
// -- Utilities
// --

const InheritMarker = Symbol();
const InheritInput = Symbol();
const InheritOutput = Symbol();

export namespace OnionCore {
  export namespace Syntax {
    /**
     * A generic function with one {@link Input} and {@link Output}.
     */
    export type FunctionImplementation<Input, Output> = (input: Input) => Output;

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
}

// --
// -- Input
// --

/**
 * A constraint type that can be used to accept types of input.
 *
 * Otherwise without an object as input you cannot make use of the {@link Layer} features.
 */
export type InputConstraint = Record<string, unknown>;

// --
// -- Output
// --

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
export type OutputConstraint<T extends string = string> = (
/* eslint-disable @typescript-eslint/indent */
  Output<
    T,
    any // eslint-disable-line @typescript-eslint/no-explicit-any
  >
/* eslint-enable @typescript-eslint/indent */
);

/**
 * Create instances of {@link Output} (generic type {@link T}).
 */
export const output = <T extends OutputConstraint>(type: T['type'], value: T['value']): T => ({ type, value } as T);

// --
// -- Terminus
// --

export namespace OnionCore {
  /**
   * A terminus implementation using the class style syntax.
   *
   * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
   */
  export type TerminusClassImplementation<
    GivenInput extends InputConstraint,
    GivenOutput extends OutputConstraint,
  > = (
  /* eslint-disable @typescript-eslint/indent */
    Syntax.ClassImplementation<
      Syntax.FunctionImplementation<
        GivenInput,
        Promise<GivenOutput>
      >
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  /**
   * A terminus implementation using the functional style syntax.
   *
   * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
   */
  export type TerminusFunctionImplementation<
    GivenInput extends InputConstraint,
    GivenOutput extends OutputConstraint,
  > = Syntax.FunctionImplementation<GivenInput, Promise<GivenOutput>>;

  export type MakeTerminusInput<T extends TerminusConstraint> = (
    T extends Terminus<infer I, any> // eslint-disable-line @typescript-eslint/no-explicit-any
      ? Cleanse<I, undefined, I>
      : undefined
  );

  export type MakeTerminusOutput<T extends TerminusConstraint> = Promise<(
    T extends Terminus<any, infer I> // eslint-disable-line @typescript-eslint/no-explicit-any
      ? Cleanse<I, OutputConstraint, I>
      : OutputConstraint
  )>;
}

/**
 * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
 */
export type Terminus<
  GivenInput extends InputConstraint,
  GivenOutput extends OutputConstraint,
> = (
  | OnionCore.TerminusClassImplementation<GivenInput, GivenOutput>
  | OnionCore.TerminusFunctionImplementation<GivenInput, GivenOutput>
);

// Syntax sugar:
export namespace Terminus {
  export import Class = OnionCore.TerminusClassImplementation;
  export import Fn = OnionCore.TerminusFunctionImplementation;

  export import Input = OnionCore.MakeTerminusInput;
  export import Output = OnionCore.MakeTerminusOutput;
}

/**
 * A constraint type that can be used to accept types of {@link Terminus}.
 */
export type TerminusConstraint = Terminus<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// --
// -- Layer
// --

export namespace OnionCore {
  /**
   * This requires that the given input to the {@link Layer} be passed through to the next function via spread.
   * The purpose of this is to ensure properties that you are not aware are passed down through the stack.
   */
  export type LayerEnforceNextInputPassThrough = {
    readonly [InheritMarker]: typeof InheritInput;
  };

  /**
   * This requires that output from the next function is passed through the {@link Layer} return statement.
   * The purpose of this is to ensure the responses from other layers are passed up through the stack.
   */
  export type LayerEnforceNextOutputPassThrough = Output<'layer:passthtrough', {
    readonly [InheritMarker]: typeof InheritOutput;
  }>;

  /**
   * A layer implementation using the class style syntax.
   *
   * Take the given {@link CurrentInput} and pass through to the next function whilst providing any {@link NewInput} if defined.
   * With the given {@link NewOutput} and ensure its compatible or transformed into {@link CurrentOutput}.
   */
  export type LayerClassImplementation<
    CurrentInput extends InputConstraint,
    CurrentOutput extends OutputConstraint,
    NewInput extends InputConstraint,
    NewOutput extends OutputConstraint,
  > = Syntax.ClassImplementation<LayerFunctionImplementation<CurrentInput, CurrentOutput, NewInput, NewOutput>>;

  export type LayerClassImplementationConstraint = (
  /* eslint-disable @typescript-eslint/indent */
    LayerClassImplementation<
      any, // eslint-disable-line @typescript-eslint/no-explicit-any
      any, // eslint-disable-line @typescript-eslint/no-explicit-any
      any, // eslint-disable-line @typescript-eslint/no-explicit-any
      any // eslint-disable-line @typescript-eslint/no-explicit-any
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  /**
   * A layer implementation using the functional style syntax.
   *
   * Take the given {@link CurrentInput} and pass through to the next function whilst providing any {@link NewInput} if defined.
   * With the given {@link NewOutput} and ensure its compatible or transformed into {@link CurrentOutput}.
   */
  export type LayerFunctionImplementation<
    CurrentInput extends InputConstraint,
    CurrentOutput extends OutputConstraint,
    NewInput extends InputConstraint,
    NewOutput extends OutputConstraint,
  > = (
    input: CurrentInput & LayerEnforceNextInputPassThrough,
    next: Syntax.FunctionImplementation<NewInput & LayerEnforceNextInputPassThrough, Promise<NewOutput | LayerEnforceNextOutputPassThrough>>,
  ) => Promise<CurrentOutput | LayerEnforceNextOutputPassThrough>;

  export type LayerFunctionImplementationConstraint = (
  /* eslint-disable @typescript-eslint/indent */
    LayerFunctionImplementation<
      any, // eslint-disable-line @typescript-eslint/no-explicit-any
      any, // eslint-disable-line @typescript-eslint/no-explicit-any
      any, // eslint-disable-line @typescript-eslint/no-explicit-any
      any // eslint-disable-line @typescript-eslint/no-explicit-any
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type InferLayerCurrentInput<
    GivenLayer extends LayerConstraint,
    Fallback = never,
  > = (
    GivenLayer extends Layer<infer Inferred, any, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
      ? Cleanse<Inferred, Fallback, Inferred>
      : Fallback
  );

  export type InferLayerCurrentOutput<
    GivenLayer extends LayerConstraint,
    Fallback = never,
  > = (
    GivenLayer extends Layer<any, infer Inferred, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
      ? Cleanse<Inferred, Fallback, Inferred>
      : Fallback
  );

  export type InferLayerNewInput<
    GivenLayer extends LayerConstraint,
    Fallback = never,
  > = (
    GivenLayer extends Layer<any, any, infer Inferred, any> // eslint-disable-line @typescript-eslint/no-explicit-any
      ? Cleanse<Inferred, Fallback, Inferred>
      : Fallback
  );

  export type InferLayerNewOutput<
    GivenLayer extends LayerConstraint,
    Fallback = never,
  > = (
    GivenLayer extends Layer<any, any, any, infer Inferred> // eslint-disable-line @typescript-eslint/no-explicit-any
      ? Cleanse<Inferred, Fallback, Inferred>
      : Fallback
  );

  export type ExtendingLayer<
    GivenLayer extends LayerConstraint,
    CurrentInput extends InputConstraint,
    CurrentOutput extends OutputConstraint,
    NewInput extends InputConstraint,
    NewOutput extends OutputConstraint,
  > = (
  /* eslint-disable @typescript-eslint/indent */
    Grok.If<
      Grok.And<[
        Grok.Value.IsExtending<LayerClassImplementationConstraint, GivenLayer>,
        Grok.Value.IsExtending<LayerFunctionImplementationConstraint, GivenLayer>,
      ]>,
      Layer<
        Grok.If.IsAny<CurrentInput, InferLayerCurrentInput<GivenLayer, any>, CurrentInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
        Grok.If.IsAny<CurrentOutput, InferLayerCurrentOutput<GivenLayer, any>, CurrentOutput>, // eslint-disable-line @typescript-eslint/no-explicit-any
        Grok.If.IsAny<NewInput, InferLayerNewInput<GivenLayer, any>, NewInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
        Grok.If.IsAny<NewOutput, InferLayerNewOutput<GivenLayer, any>, NewOutput> // eslint-disable-line @typescript-eslint/no-explicit-any
      >,
      Grok.If<
        Grok.Value.IsExtending<GivenLayer, LayerClassImplementationConstraint>, // eslint-disable-line @typescript-eslint/no-explicit-any
        LayerClassImplementation<
          Grok.If.IsAny<CurrentInput, InferLayerCurrentInput<GivenLayer, any>, CurrentInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
          Grok.If.IsAny<CurrentOutput, InferLayerCurrentOutput<GivenLayer, any>, CurrentOutput>, // eslint-disable-line @typescript-eslint/no-explicit-any
          Grok.If.IsAny<NewInput, InferLayerNewInput<GivenLayer, any>, NewInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
          Grok.If.IsAny<NewOutput, InferLayerNewOutput<GivenLayer, any>, NewOutput> // eslint-disable-line @typescript-eslint/no-explicit-any
        >,
        LayerFunctionImplementation<
          Grok.If.IsAny<CurrentInput, InferLayerCurrentInput<GivenLayer, any>, CurrentInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
          Grok.If.IsAny<CurrentOutput, InferLayerCurrentOutput<GivenLayer, any>, CurrentOutput>, // eslint-disable-line @typescript-eslint/no-explicit-any
          Grok.If.IsAny<NewInput, InferLayerNewInput<GivenLayer, any>, NewInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
          Grok.If.IsAny<NewOutput, InferLayerNewOutput<GivenLayer, any>, NewOutput> // eslint-disable-line @typescript-eslint/no-explicit-any
        >
      >
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type WithLayerExpectingCurrentInput<
    CurrentInput extends InputConstraint,
    GivenLayer extends LayerConstraint = LayerConstraint,
  > = ExtendingLayer<GivenLayer, CurrentInput, any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type WithLayerProvidingNewInput<
    NewInput extends InputConstraint,
    GivenLayer extends LayerConstraint = LayerConstraint,
  > = ExtendingLayer<GivenLayer, any, any, NewInput, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type WithLayerProvidingNewOutput<
    CurrentOutput extends OutputConstraint,
    NewOutput extends OutputConstraint,
    GivenLayer extends LayerConstraint = LayerConstraint,
  > = ExtendingLayer<GivenLayer, any, CurrentOutput, any, NewOutput>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type MakeLayerInput<T extends LayerConstraint> = (
    T extends Layer<infer I, any, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
      ? (
      /* eslint-disable @typescript-eslint/indent */
        Cleanse<
          I,
          LayerEnforceNextInputPassThrough,
          I & LayerEnforceNextInputPassThrough
        >
      /* eslint-enable @typescript-eslint/indent */
      )
      : LayerEnforceNextInputPassThrough
  );

  export type MakeLayerOutput<T extends LayerConstraint> = Promise<(
    T extends Layer<any, infer I, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
      ? (
      /* eslint-disable @typescript-eslint/indent */
        Cleanse<
          I,
          LayerEnforceNextOutputPassThrough,
          I | LayerEnforceNextOutputPassThrough
        >
      /* eslint-enable @typescript-eslint/indent */
      )
      : LayerEnforceNextOutputPassThrough
  )>;

  export type MakeLayerNext<T extends LayerConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    Syntax.FunctionImplementation<
      (
        T extends Layer<any, any, infer I, any> // eslint-disable-line @typescript-eslint/no-explicit-any
          ? (
            Cleanse<
              I,
              LayerEnforceNextInputPassThrough,
              I & LayerEnforceNextInputPassThrough
            >
          )
          : LayerEnforceNextInputPassThrough
      ),
      Promise<(
        T extends Layer<any, any, any, infer I> // eslint-disable-line @typescript-eslint/no-explicit-any
          ? (
            Cleanse<
              I,
              LayerEnforceNextOutputPassThrough,
              I | LayerEnforceNextOutputPassThrough
            >
          )
          : LayerEnforceNextOutputPassThrough
      )>
    >
  /* eslint-enable @typescript-eslint/indent */
  );
}

/**
 * Take the given {@link CurrentInput} and pass through to the next function whilst providing any {@link NewInput} if defined.
 * With the given {@link NewOutput} and ensure its compatible or transformed into {@link CurrentOutput}.
 */
export type Layer<
  CurrentInput extends InputConstraint,
  CurrentOutput extends OutputConstraint,
  NewInput extends InputConstraint,
  NewOutput extends OutputConstraint,
> = (
  | OnionCore.LayerClassImplementation<CurrentInput, CurrentOutput, NewInput, NewOutput>
  | OnionCore.LayerFunctionImplementation<CurrentInput, CurrentOutput, NewInput, NewOutput>
);

// Syntax sugar:
export namespace Layer {
  export import Class = OnionCore.LayerClassImplementation;
  export import Fn = OnionCore.LayerFunctionImplementation;

  export import Input = OnionCore.MakeLayerInput;
  export import Output = OnionCore.MakeLayerOutput;
  export import Next = OnionCore.MakeLayerNext;

  export namespace With {
    export import ExpectingInput = OnionCore.WithLayerExpectingCurrentInput;
    export import ProvidingInput = OnionCore.WithLayerProvidingNewInput;
    export import ProvidingResponse = OnionCore.WithLayerProvidingNewOutput;
  }
}

/**
 * A constraint type that can be used to accept types of {@link Layer}.
 */
export type LayerConstraint = Layer<any, any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// --
// -- Composition
// --

export namespace OnionCore {
  export type CompositionInstrumentFunction = (
    thing: LayerConstraint | TerminusConstraint,
    next: OnionCore.Syntax.FunctionImplementation<any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => OnionCore.Syntax.FunctionImplementation<any, Promise<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type CompositionBuilderFunction<I, O> = (instrument?: CompositionInstrumentFunction) => OnionCore.Syntax.FunctionImplementation<I, Promise<O>>;
}

export type Composition<
  GivenInput extends InputConstraint,
  GivenOutput extends OutputConstraint,
> = {
  readonly layers: LayerConstraint[];
  readonly build: OnionCore.CompositionBuilderFunction<GivenInput, GivenOutput>;
  readonly invoke: OnionCore.Syntax.FunctionImplementation<GivenInput, Promise<GivenOutput>>;
};

// Syntax sugar:
export namespace Composition {
  export import Instrument = OnionCore.CompositionInstrumentFunction;
}

// --
// -- Composition Utility
// --

export const createInvokableTerminusFunction = <
  GivenTerminus extends Terminus<GivenInput, GivenOutput>,
  GivenInput extends InputConstraint = GivenTerminus extends Terminus<infer I, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
  GivenOutput extends OutputConstraint = GivenTerminus extends Terminus<any, infer I> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
>(value: GivenTerminus): OnionCore.TerminusFunctionImplementation<GivenInput, GivenOutput> => {
  if ((value as OnionCore.TerminusClassImplementation<GivenInput, GivenOutput>).invoke !== undefined) {
    return (value as OnionCore.TerminusClassImplementation<GivenInput, GivenOutput>).invoke;
  }

  return value as OnionCore.TerminusFunctionImplementation<GivenInput, GivenOutput>;
};

export const createInvokableLayerFunction = <
  GivenLayer extends Layer<CurrentInput, CurrentOutput, NewInput, NewOutput>,
  CurrentInput extends InputConstraint = GivenLayer extends Layer<infer I, any, any, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
  CurrentOutput extends OutputConstraint = GivenLayer extends Layer<any, infer I, any, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
  NewInput extends InputConstraint = GivenLayer extends Layer<any, any, infer I, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
  NewOutput extends OutputConstraint = GivenLayer extends Layer<any, any, any, infer I> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
>(value: GivenLayer): OnionCore.LayerFunctionImplementation<CurrentInput, CurrentOutput, NewInput, NewOutput> => {
  if ((value as OnionCore.LayerClassImplementation<CurrentInput, CurrentOutput, NewInput, NewOutput>).invoke !== undefined) {
    return (value as OnionCore.LayerClassImplementation<CurrentInput, CurrentOutput, NewInput, NewOutput>).invoke;
  }

  return value as OnionCore.LayerFunctionImplementation<CurrentInput, CurrentOutput, NewInput, NewOutput>;
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
  protected readonly layers: Layer<any, any, any, any>[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

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
   * Apply the given {@link GivenLayer} and its types.
   */
  public use<
    GivenLayer extends Layer<GivenInput, GivenOutput, any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    GivenInput extends CurrentInput,
    GivenOutput extends CurrentOutput | OnionCore.LayerEnforceNextOutputPassThrough,
  >(Layer: GivenLayer): (
  /* eslint-disable @typescript-eslint/indent */
    Composer<
      (
        GivenLayer extends Layer<any, any, infer I, any> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (
          OnionCore.Cleanse<
            I,
            CurrentInput,
            Grok.Merge<CurrentInput, I>
          >
        )
        : 'Error:CannotInferGivenLayer'
      ),
      (
        GivenLayer extends Layer<any, any, any, infer I> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (
          OnionCore.Cleanse<
            I,
            Exclude<CurrentOutput, OnionCore.LayerEnforceNextOutputPassThrough>,
            Grok.Union<CurrentOutput, Exclude<I, OnionCore.LayerEnforceNextOutputPassThrough>>
          >
        )
        : 'Error:CannotInferGivenLayer'
      ),
      InitialInput,
      InitialOutput
    >
  /* eslint-enable @typescript-eslint/indent */
  ) {
    this.layers.push(Layer);

    return this as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  /**
   * Terminate the composition with the {@link GivenTerminus}.
   */
  public end<
    GivenTerminus extends Terminus<GivenInput, GivenOutput>,
    GivenInput extends CurrentInput,
    GivenOutput extends CurrentOutput,
  >(terminus: GivenTerminus): Composition<InitialInput, InitialOutput> {
    const terminusInvokable = createInvokableTerminusFunction(terminus as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    type LayerBuilderPassThrough = OnionCore.Syntax.FunctionImplementation<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

    const build: OnionCore.CompositionBuilderFunction<InitialInput, InitialOutput> = (instrument) => {
      if (this.layers.length === 0) {
        if (instrument === undefined) {
          return terminusInvokable as LayerBuilderPassThrough;
        }

        return instrument(terminus, terminusInvokable);
      }

      if (instrument === undefined) {
        return this.layers.reduceRight<LayerBuilderPassThrough>((next, layer) => {
          return async (input) => createInvokableLayerFunction(layer)(input, next);
        }, terminusInvokable);
      }

      return this.layers.reduceRight<LayerBuilderPassThrough>((next, layer) => {
        return instrument(layer, async (input) => createInvokableLayerFunction(layer)(input, next));
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
