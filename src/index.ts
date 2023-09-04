import type { Grok } from '@matt-usurp/grok';

// --
// -- Utilities
// --

const InheritMarker = Symbol();
const InheritInput = Symbol();
const InheritOutput = Symbol();

export type OnionCore = unknown;

export namespace OnionCore {
  export namespace Syntax {
    /**
     * A generic function with one {@link Input} and {@link Output}.
     */
    export type FunctionImplementation<Input, Output> = (input: Input) => Output;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type FunctionImplementationConstraint = FunctionImplementation<any, any>;

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

  export type CleaseFallback<Value, Fallback> = Cleanse<Value, Fallback, Value>;
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

export const isOutputType = <T extends OutputConstraint>(output: unknown, type: T['type']): output is T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (output as any).type === type;
};

// --
// -- Terminus
// --

export namespace OnionCore {
  export type GetTerminusDefinitionInput<GivenTerminusDefinition extends TerminusConstraint, Fallback = never> = CleaseFallback<GivenTerminusDefinition['CurrentInput'], Fallback>;
  export type GetTerminusDefinitionOutput<GivenTerminusDefinition extends TerminusConstraint, Fallback = never> = CleaseFallback<GivenTerminusDefinition['CurrentOutput'], Fallback>;

  export type MakeTerminusInput<GivenTerminusDefinition extends TerminusConstraint> = CleaseFallback<GetTerminusDefinitionInput<GivenTerminusDefinition>, undefined>;
  export type MakeTerminusOutput<GivenTerminusDefinition extends TerminusConstraint> = Promise<CleaseFallback<GetTerminusDefinitionOutput<GivenTerminusDefinition>, OutputConstraint>>;

  /**
   * A terminus implementation using the class style syntax.
   *
   * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
   */
  export type TerminusClassImplementation<GivenTerminusDefinition extends TerminusConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    Syntax.ClassImplementation<
      Syntax.FunctionImplementation<
        MakeTerminusInput<GivenTerminusDefinition>,
        MakeTerminusOutput<GivenTerminusDefinition>
      >
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  /**
   * A terminus implementation using the functional style syntax.
   *
   * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
   */
  export type TerminusFunctionImplementation<GivenTerminusDefinition extends TerminusConstraint> = (
   /* eslint-disable @typescript-eslint/indent */
    Syntax.FunctionImplementation<
      MakeTerminusInput<GivenTerminusDefinition>,
      MakeTerminusOutput<GivenTerminusDefinition>
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type TerminusImplementation<GivenTerminusDefinition extends TerminusConstraint> = (
    | TerminusClassImplementation<GivenTerminusDefinition>
    | TerminusFunctionImplementation<GivenTerminusDefinition>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type TerminusImplementationConstraint = TerminusImplementation<any>;
}

/**
 * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
 */
export type Terminus<
  CurrentInput extends InputConstraint,
  CurrentOutput extends OutputConstraint,
> = {
  readonly CurrentInput: CurrentInput;
  readonly CurrentOutput: CurrentOutput;
};

// Syntax sugar:
export namespace Terminus {
  export import Class = OnionCore.TerminusClassImplementation;
  export import Fn = OnionCore.TerminusFunctionImplementation;

  export import Input = OnionCore.MakeTerminusInput;
  export import Output = OnionCore.MakeTerminusOutput;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TerminusConstraint = Terminus<any, any>;

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

  export type GetLayerDefinitionCurrentInput<GivenLayerDefinition extends LayerConstraint, Fallback = never> = CleaseFallback<GivenLayerDefinition['CurrentInput'], Fallback>;
  export type GetLayerDefinitionCurrentOutput<GivenLayerDefinition extends LayerConstraint, Fallback = never> = CleaseFallback<GivenLayerDefinition['CurrentOutput'], Fallback>;
  export type GetLayerDefinitionNewInput<GivenLayerDefinition extends LayerConstraint, Fallback = never> = CleaseFallback<GivenLayerDefinition['NewInput'], Fallback>;
  export type GetLayerDefinitionNewOutput<GivenLayerDefinition extends LayerConstraint, Fallback = never> = CleaseFallback<GivenLayerDefinition['NewOutput'], Fallback>;

  export type ExtendingLayerDefinition<
    GivenLayerDefinition extends LayerConstraint,
    CurrentInput extends InputConstraint,
    CurrentOutput extends OutputConstraint,
    NewInput extends InputConstraint,
    NewOutput extends OutputConstraint,
  > = (
  /* eslint-disable @typescript-eslint/indent */
    Layer<
      Grok.If.IsAny<CurrentInput, GetLayerDefinitionCurrentInput<GivenLayerDefinition, any>, CurrentInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
      Grok.If.IsAny<CurrentOutput, GetLayerDefinitionCurrentOutput<GivenLayerDefinition, any>, CurrentOutput>, // eslint-disable-line @typescript-eslint/no-explicit-any
      Grok.If.IsAny<NewInput, GetLayerDefinitionNewInput<GivenLayerDefinition, any>, NewInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
      Grok.If.IsAny<NewOutput, GetLayerDefinitionNewOutput<GivenLayerDefinition, any>, NewOutput> // eslint-disable-line @typescript-eslint/no-explicit-any
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type WithLayerDefinitionExpectingCurrentInput<
    CurrentInput extends InputConstraint,
    GivenLayerDefinition extends LayerConstraint = LayerConstraint,
  > = ExtendingLayerDefinition<GivenLayerDefinition, CurrentInput, any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type WithLayerDefinitionProvidingNewInput<
    NewInput extends InputConstraint,
    GivenLayerDefinition extends LayerConstraint = LayerConstraint,
  > = ExtendingLayerDefinition<GivenLayerDefinition, any, any, NewInput, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type WithLayerDefinitionProvidingNewOutput<
    CurrentOutput extends OutputConstraint,
    NewOutput extends OutputConstraint,
    GivenLayerDefinition extends LayerConstraint = LayerConstraint,
  > = ExtendingLayerDefinition<GivenLayerDefinition, any, CurrentOutput, any, NewOutput>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type MakeLayerInput<GivenLayerDefinition extends LayerConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    Cleanse<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      GetLayerDefinitionCurrentInput<GivenLayerDefinition, any>,
      LayerEnforceNextInputPassThrough,
      GetLayerDefinitionCurrentInput<GivenLayerDefinition> & LayerEnforceNextInputPassThrough
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type MakeLayerOutput<GivenLayerDefinition extends LayerConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    Promise<
      Cleanse<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GetLayerDefinitionCurrentOutput<GivenLayerDefinition, any>,
        LayerEnforceNextOutputPassThrough,
        GetLayerDefinitionCurrentOutput<GivenLayerDefinition> | LayerEnforceNextOutputPassThrough
      >
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type MakeLayerNext<GivenLayerDefinition extends LayerConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    Syntax.FunctionImplementation<
      Cleanse<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GetLayerDefinitionNewInput<GivenLayerDefinition, any>,
        LayerEnforceNextInputPassThrough,
        GetLayerDefinitionNewInput<GivenLayerDefinition> & LayerEnforceNextInputPassThrough
      >,
      Promise<
        Cleanse<
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          GetLayerDefinitionNewOutput<GivenLayerDefinition, any>,
          LayerEnforceNextOutputPassThrough,
          GetLayerDefinitionNewOutput<GivenLayerDefinition> | LayerEnforceNextOutputPassThrough
        >
      >
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  /**
   * A layer implementation using the class style syntax.
   *
   * Take the given {@link CurrentInput} and pass through to the next function whilst providing any {@link NewInput} if defined.
   * With the given {@link NewOutput} and ensure its compatible or transformed into {@link CurrentOutput}.
   */
  export type LayerClassImplementation<GivenLayerDefinition extends LayerConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    Syntax.ClassImplementation<
      LayerFunctionImplementation<GivenLayerDefinition>
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type LayerClassImplementationConstraint = (
  /* eslint-disable @typescript-eslint/indent */
    LayerClassImplementation<
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
  export type LayerFunctionImplementation<GivenLayerDefinition extends LayerConstraint> = (
    input: MakeLayerInput<GivenLayerDefinition>,
    next: MakeLayerNext<GivenLayerDefinition>,
  ) => MakeLayerOutput<GivenLayerDefinition>;

  export type LayerFunctionImplementationConstraint = (
  /* eslint-disable @typescript-eslint/indent */
    LayerFunctionImplementation<
      any // eslint-disable-line @typescript-eslint/no-explicit-any
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type LayerImplementation<GivenLayerDefinition extends LayerConstraint> = (
    | LayerClassImplementation<GivenLayerDefinition>
    | LayerFunctionImplementation<GivenLayerDefinition>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type LayerImplementationConstraint = LayerImplementation<any>;
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
> = {
  readonly CurrentInput: CurrentInput;
  readonly CurrentOutput: CurrentOutput;
  readonly NewInput: NewInput;
  readonly NewOutput: NewOutput;
};

// Syntax sugar:
export namespace Layer {
  export import Class = OnionCore.LayerClassImplementation;
  export import Fn = OnionCore.LayerFunctionImplementation;

  export import Input = OnionCore.MakeLayerInput;
  export import Output = OnionCore.MakeLayerOutput;
  export import Next = OnionCore.MakeLayerNext;

  export namespace With {
    export import ExpectingInput = OnionCore.WithLayerDefinitionExpectingCurrentInput;
    export import ProvidingInput = OnionCore.WithLayerDefinitionProvidingNewInput;
    export import ProvidingResponse = OnionCore.WithLayerDefinitionProvidingNewOutput;
  }
}

export type LayerConstraint = (
/* eslint-disable @typescript-eslint/indent */
  Layer<
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    any // eslint-disable-line @typescript-eslint/no-explicit-any
  >
/* eslint-enable @typescript-eslint/indent */
);

// --
// -- Composition
// --

export namespace OnionCore {
  export type CompositionInstrumentFunction = (
    thing: LayerImplementationConstraint | TerminusImplementationConstraint,
    next: OnionCore.Syntax.FunctionImplementation<any, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => OnionCore.Syntax.FunctionImplementation<any, Promise<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type CompositionBuilderFunction<I, O> = (instrument?: CompositionInstrumentFunction) => OnionCore.Syntax.FunctionImplementation<I, Promise<O>>;
}

export type Composition<
  GivenInput extends InputConstraint,
  GivenOutput extends OutputConstraint,
> = {
  readonly layers: OnionCore.LayerImplementationConstraint[];
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
  protected readonly layers: OnionCore.LayerImplementationConstraint[] = [];

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
    GivenOutput extends CurrentOutput | OnionCore.LayerEnforceNextOutputPassThrough,
  >(layer: OnionCore.LayerImplementation<GivenLayerDefinition>): (
  /* eslint-disable @typescript-eslint/indent */
    Composer<
      (
        GivenLayerDefinition extends Layer<any, any, infer I, any> // eslint-disable-line @typescript-eslint/no-explicit-any
        ? (
          OnionCore.Cleanse<
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
          OnionCore.Cleanse<
            I,
            Exclude<CurrentOutput, OnionCore.LayerEnforceNextOutputPassThrough>,
            Grok.Union<CurrentOutput, Exclude<I, OnionCore.LayerEnforceNextOutputPassThrough>>
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
  >(terminus: OnionCore.TerminusImplementation<GivenTerminusDefinition>): Composition<InitialInput, InitialOutput> {
    const terminusInvokable = createImplementationGlobalInvoke(terminus);

    const build: OnionCore.CompositionBuilderFunction<InitialInput, InitialOutput> = (instrument) => {
      if (this.layers.length === 0) {
        if (instrument === undefined) {
          return terminusInvokable as OnionCore.Syntax.FunctionImplementationConstraint;
        }

        return instrument(terminus, terminusInvokable);
      }

      if (instrument === undefined) {
        return this.layers.reduceRight<OnionCore.Syntax.FunctionImplementationConstraint>((next, layer) => {
          return async (input) => createImplementationGlobalInvoke(layer)(input, next);
        }, terminusInvokable);
      }

      return this.layers.reduceRight<OnionCore.Syntax.FunctionImplementationConstraint>((next, layer) => {
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
