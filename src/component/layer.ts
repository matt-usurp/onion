import type { Grok } from '@matt-usurp/grok';
import type { OnionCoreInput } from './input';
import type { OnionCoreOutput } from './output';
import type { OnionCoreUtility } from './utility';

const InheritMarker = Symbol();
const InheritInput = Symbol();
const InheritOutput = Symbol();

export namespace OnionCoreLayer {
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
  export type LayerEnforceNextOutputPassThrough = OnionCoreOutput.Output<'layer:passthtrough', {
    readonly [InheritMarker]: typeof InheritOutput;
  }>;

  export type GetLayerDefinitionCurrentInput<GivenLayerDefinition extends LayerConstraint, Fallback = never> = OnionCoreUtility.Cleanse.Fallback<GivenLayerDefinition['CurrentInput'], Fallback>;
  export type GetLayerDefinitionCurrentOutput<GivenLayerDefinition extends LayerConstraint, Fallback = never> = OnionCoreUtility.Cleanse.Fallback<GivenLayerDefinition['CurrentOutput'], Fallback>;
  export type GetLayerDefinitionNewInput<GivenLayerDefinition extends LayerConstraint, Fallback = never> = OnionCoreUtility.Cleanse.Fallback<GivenLayerDefinition['NewInput'], Fallback>;
  export type GetLayerDefinitionNewOutput<GivenLayerDefinition extends LayerConstraint, Fallback = never> = OnionCoreUtility.Cleanse.Fallback<GivenLayerDefinition['NewOutput'], Fallback>;

  export type ExtendingLayerDefinition<
    GivenLayerDefinition extends LayerConstraint,
    CurrentInput extends OnionCoreInput.InputConstraint,
    CurrentOutput extends OnionCoreOutput.OutputConstraint,
    NewInput extends OnionCoreInput.InputConstraint,
    NewOutput extends OnionCoreOutput.OutputConstraint,
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
    CurrentInput extends OnionCoreInput.InputConstraint,
    GivenLayerDefinition extends LayerConstraint = LayerConstraint,
  > = ExtendingLayerDefinition<GivenLayerDefinition, CurrentInput, any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type WithLayerDefinitionProvidingNewInput<
    NewInput extends OnionCoreInput.InputConstraint,
    GivenLayerDefinition extends LayerConstraint = LayerConstraint,
  > = ExtendingLayerDefinition<GivenLayerDefinition, any, any, NewInput, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type WithLayerDefinitionProvidingNewOutput<
    CurrentOutput extends OnionCoreOutput.OutputConstraint,
    NewOutput extends OnionCoreOutput.OutputConstraint,
    GivenLayerDefinition extends LayerConstraint = LayerConstraint,
  > = ExtendingLayerDefinition<GivenLayerDefinition, any, CurrentOutput, any, NewOutput>; // eslint-disable-line @typescript-eslint/no-explicit-any

  export type MakeLayerInput<GivenLayerDefinition extends LayerConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    OnionCoreUtility.Cleanse<
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
      OnionCoreUtility.Cleanse<
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
    OnionCoreUtility.Syntax.FunctionImplementation<
      OnionCoreUtility.Cleanse<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GetLayerDefinitionNewInput<GivenLayerDefinition, any>,
        LayerEnforceNextInputPassThrough,
        GetLayerDefinitionNewInput<GivenLayerDefinition> & LayerEnforceNextInputPassThrough
      >,
      Promise<
        OnionCoreUtility.Cleanse<
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
    OnionCoreUtility.Syntax.ClassImplementation<
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

  /**
   * Take the given {@link CurrentInput} and pass through to the next function whilst providing any {@link NewInput} if defined.
   * With the given {@link NewOutput} and ensure its compatible or transformed into {@link CurrentOutput}.
   */
  export type Layer<
    CurrentInput extends OnionCoreInput.InputConstraint,
    CurrentOutput extends OnionCoreOutput.OutputConstraint,
    NewInput extends OnionCoreInput.InputConstraint,
    NewOutput extends OnionCoreOutput.OutputConstraint,
  > = {
    readonly CurrentInput: CurrentInput;
    readonly CurrentOutput: CurrentOutput;
    readonly NewInput: NewInput;
    readonly NewOutput: NewOutput;
  };

  // Syntax sugar:
  export namespace Layer {
    export import Class = OnionCoreLayer.LayerClassImplementation;
    export import Fn = OnionCoreLayer.LayerFunctionImplementation;

    export import Input = OnionCoreLayer.MakeLayerInput;
    export import Output = OnionCoreLayer.MakeLayerOutput;
    export import Next = OnionCoreLayer.MakeLayerNext;

    export namespace With {
      export import ExpectingInput = OnionCoreLayer.WithLayerDefinitionExpectingCurrentInput;
      export import ProvidingInput = OnionCoreLayer.WithLayerDefinitionProvidingNewInput;
      export import ProvidingResponse = OnionCoreLayer.WithLayerDefinitionProvidingNewOutput;
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
}

export { };
