import type { Grok } from '@matt-usurp/grok';
import type { OnionInput } from './input';
import type { OnionOutput } from './output';
import type { OnionUtility as U } from './utility';

const InheritMarker = Symbol();
const InheritInput = Symbol();
const InheritOutput = Symbol();

/**
 * Take the given {@link CurrentInput} and pass through to the next function whilst providing any {@link NewInput} if defined.
 * With the given {@link NewOutput} and ensure its compatible or transformed into {@link CurrentOutput}.
 */
export type OnionLayer<
  CurrentInput extends OnionInput.InputKind,
  CurrentOutput extends OnionOutput.OutputKind,
  NewInput extends OnionInput.InputKind,
  NewOutput extends OnionOutput.OutputKind,
> = {
  readonly CurrentInput: CurrentInput;
  readonly CurrentOutput: CurrentOutput;
  readonly NewInput: NewInput;
  readonly NewOutput: NewOutput;
};

/**
 * Onion internals namespace for the layer component.
 */
export namespace OnionLayer {
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
  export type LayerEnforceNextOutputPassThrough = OnionOutput<'layer:passthtrough', {
    readonly [InheritMarker]: typeof InheritOutput;
  }>;

  export type GetLayerDefinitionCurrentInput<GivenLayerDefinition extends LayerKind, Fallback = never> = U.Cleanse.Fallback<GivenLayerDefinition['CurrentInput'], Fallback>;
  export type GetLayerDefinitionCurrentOutput<GivenLayerDefinition extends LayerKind, Fallback = never> = U.Cleanse.Fallback<GivenLayerDefinition['CurrentOutput'], Fallback>;
  export type GetLayerDefinitionNewInput<GivenLayerDefinition extends LayerKind, Fallback = never> = U.Cleanse.Fallback<GivenLayerDefinition['NewInput'], Fallback>;
  export type GetLayerDefinitionNewOutput<GivenLayerDefinition extends LayerKind, Fallback = never> = U.Cleanse.Fallback<GivenLayerDefinition['NewOutput'], Fallback>;

  export type ExtendingLayerDefinition<
    GivenLayerDefinition extends LayerKind,
    CurrentInput extends OnionInput.InputKind,
    CurrentOutput extends OnionOutput.OutputKind,
    NewInput extends OnionInput.InputKind,
    NewOutput extends OnionOutput.OutputKind,
  > = (
  /* eslint-disable @typescript-eslint/indent */
    OnionLayer<
      Grok.If.IsAny<CurrentInput, GetLayerDefinitionCurrentInput<GivenLayerDefinition, any>, CurrentInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
      Grok.If.IsAny<CurrentOutput, GetLayerDefinitionCurrentOutput<GivenLayerDefinition, any>, CurrentOutput>, // eslint-disable-line @typescript-eslint/no-explicit-any
      Grok.If.IsAny<NewInput, GetLayerDefinitionNewInput<GivenLayerDefinition, any>, NewInput>, // eslint-disable-line @typescript-eslint/no-explicit-any
      Grok.If.IsAny<NewOutput, GetLayerDefinitionNewOutput<GivenLayerDefinition, any>, NewOutput> // eslint-disable-line @typescript-eslint/no-explicit-any
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type WithLayerDefinitionExpectingCurrentInput<
    CurrentInput extends OnionInput.InputKind,
    GivenLayerDefinition extends LayerKind = LayerKind,
  > = ExtendingLayerDefinition<GivenLayerDefinition, CurrentInput, any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type WithLayerDefinitionProvidingNewInput<
    NewInput extends OnionInput.InputKind,
    GivenLayerDefinition extends LayerKind = LayerKind,
  > = ExtendingLayerDefinition<GivenLayerDefinition, any, any, NewInput, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type WithLayerDefinitionProvidingNewOutput<
    CurrentOutput extends OnionOutput.OutputKind,
    NewOutput extends OnionOutput.OutputKind,
    GivenLayerDefinition extends LayerKind = LayerKind,
  > = ExtendingLayerDefinition<GivenLayerDefinition, any, CurrentOutput, any, NewOutput>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type MakeLayerInput<GivenLayerDefinition extends LayerKind> = (
  /* eslint-disable @typescript-eslint/indent */
    U.Cleanse<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      GetLayerDefinitionCurrentInput<GivenLayerDefinition, any>,
      LayerEnforceNextInputPassThrough,
      GetLayerDefinitionCurrentInput<GivenLayerDefinition> & LayerEnforceNextInputPassThrough
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type MakeLayerOutput<GivenLayerDefinition extends LayerKind> = (
  /* eslint-disable @typescript-eslint/indent */
    Promise<
      U.Cleanse<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GetLayerDefinitionCurrentOutput<GivenLayerDefinition, any>,
        LayerEnforceNextOutputPassThrough,
        GetLayerDefinitionCurrentOutput<GivenLayerDefinition> | LayerEnforceNextOutputPassThrough
      >
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type MakeLayerNext<GivenLayerDefinition extends LayerKind> = (
  /* eslint-disable @typescript-eslint/indent */
    U.Syntax.FunctionImplementation<
      U.Cleanse<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GetLayerDefinitionNewInput<GivenLayerDefinition, any>,
        LayerEnforceNextInputPassThrough,
        GetLayerDefinitionNewInput<GivenLayerDefinition> & LayerEnforceNextInputPassThrough
      >,
      Promise<
        U.Cleanse<
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
  export type LayerClassImplementation<GivenLayerDefinition extends LayerKind> = (
  /* eslint-disable @typescript-eslint/indent */
    U.Syntax.ClassImplementation<
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
  export type LayerFunctionImplementation<GivenLayerDefinition extends LayerKind> = (
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

  export type LayerImplementation<GivenLayerDefinition extends LayerKind> = (
    | LayerClassImplementation<GivenLayerDefinition>
    | LayerFunctionImplementation<GivenLayerDefinition>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type LayerImplementationConstraint = LayerImplementation<any>;

  // Syntax sugar:
  export import Class = OnionLayer.LayerClassImplementation;
  export import Fn = OnionLayer.LayerFunctionImplementation;

  export import Input = OnionLayer.MakeLayerInput;
  export import Output = OnionLayer.MakeLayerOutput;
  export import Next = OnionLayer.MakeLayerNext;

  export namespace With {
    export import ExpectingInput = OnionLayer.WithLayerDefinitionExpectingCurrentInput;
    export import ProvidingInput = OnionLayer.WithLayerDefinitionProvidingNewInput;
    export import ProvidingResponse = OnionLayer.WithLayerDefinitionProvidingNewOutput;
  }

  export type LayerKind = OnionLayer<U.Anything, U.Anything, U.Anything, U.Anything>;
}
