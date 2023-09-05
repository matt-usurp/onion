import type { OnionCoreInput } from './input';
import type { OnionCoreOutput } from './output';
import type { OnionCoreUtility } from './utility';

export namespace OnionCoreTerminus {
  export type GetTerminusDefinitionInput<GivenTerminusDefinition extends TerminusDefinitionConstraint, Fallback = never> = OnionCoreUtility.Cleanse.Fallback<GivenTerminusDefinition['CurrentInput'], Fallback>;
  export type GetTerminusDefinitionOutput<GivenTerminusDefinition extends TerminusDefinitionConstraint, Fallback = never> = OnionCoreUtility.Cleanse.Fallback<GivenTerminusDefinition['CurrentOutput'], Fallback>;

  export type MakeTerminusInput<GivenTerminusDefinition extends TerminusDefinitionConstraint> = OnionCoreUtility.Cleanse.Fallback<GetTerminusDefinitionInput<GivenTerminusDefinition>, undefined>;
  export type MakeTerminusOutput<GivenTerminusDefinition extends TerminusDefinitionConstraint> = Promise<OnionCoreUtility.Cleanse.Fallback<GetTerminusDefinitionOutput<GivenTerminusDefinition>, OnionCoreOutput.OutputConstraint>>;

  /**
   * A terminus implementation using the class style syntax.
   *
   * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
   */
  export type TerminusClassImplementation<GivenTerminusDefinition extends TerminusDefinitionConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    OnionCoreUtility.Syntax.ClassImplementation<
      OnionCoreUtility.Syntax.FunctionImplementation<
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
  export type TerminusFunctionImplementation<GivenTerminusDefinition extends TerminusDefinitionConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    OnionCoreUtility.Syntax.FunctionImplementation<
      MakeTerminusInput<GivenTerminusDefinition>,
      MakeTerminusOutput<GivenTerminusDefinition>
    >
  /* eslint-enable @typescript-eslint/indent */
  );

  export type TerminusImplementation<GivenTerminusDefinition extends TerminusDefinitionConstraint> = (
    | TerminusClassImplementation<GivenTerminusDefinition>
    | TerminusFunctionImplementation<GivenTerminusDefinition>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type TerminusImplementationConstraint = TerminusImplementation<any>;

  /**
   * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
   */
  export type TerminusDefinition<
    CurrentInput extends OnionCoreInput.InputConstraint,
    CurrentOutput extends OnionCoreOutput.OutputConstraint,
  > = {
    readonly CurrentInput: CurrentInput;
    readonly CurrentOutput: CurrentOutput;
  };

  // Syntax sugar:
  export namespace TerminusDefinition {
    export import Class = OnionCoreTerminus.TerminusClassImplementation;
    export import Fn = OnionCoreTerminus.TerminusFunctionImplementation;

    export import Input = OnionCoreTerminus.MakeTerminusInput;
    export import Output = OnionCoreTerminus.MakeTerminusOutput;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type TerminusDefinitionConstraint = TerminusDefinition<any, any>;
}
