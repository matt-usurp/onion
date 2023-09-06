import type { OnionInput } from './input';
import type { OnionOutput } from './output';
import type { OnionUtility as U } from './utility';

/**
 * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
 */
export type OnionTerminus<
  CurrentInput extends OnionInput.InputKind,
  CurrentOutput extends OnionOutput.OutputKind,
> = {
  readonly CurrentInput: CurrentInput;
  readonly CurrentOutput: CurrentOutput;
};

/**
 * Onion internals namespace for the terminus component.
 */
export namespace OnionTerminus {
  export type GetTerminusDefinitionInput<GivenTerminusDefinition extends TerminusDefinitionConstraint, Fallback = never> = U.Cleanse.Fallback<GivenTerminusDefinition['CurrentInput'], Fallback>;
  export type GetTerminusDefinitionOutput<GivenTerminusDefinition extends TerminusDefinitionConstraint, Fallback = never> = U.Cleanse.Fallback<GivenTerminusDefinition['CurrentOutput'], Fallback>;

  export type MakeTerminusInput<GivenTerminusDefinition extends TerminusDefinitionConstraint> = U.Cleanse.Fallback<GetTerminusDefinitionInput<GivenTerminusDefinition>, undefined>;
  export type MakeTerminusOutput<GivenTerminusDefinition extends TerminusDefinitionConstraint> = Promise<U.Cleanse.Fallback<GetTerminusDefinitionOutput<GivenTerminusDefinition>, OnionOutput.OutputKind>>;

  /**
   * A terminus implementation using the class style syntax.
   *
   * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
   */
  export type TerminusClassImplementation<GivenTerminusDefinition extends TerminusDefinitionConstraint> = (
  /* eslint-disable @typescript-eslint/indent */
    U.Syntax.ClassImplementation<
      U.Syntax.FunctionImplementation<
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
    U.Syntax.FunctionImplementation<
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

  // Syntax sugar:
  export import Class = OnionTerminus.TerminusClassImplementation;
  export import Fn = OnionTerminus.TerminusFunctionImplementation;

  export import Input = OnionTerminus.MakeTerminusInput;
  export import Output = OnionTerminus.MakeTerminusOutput;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type TerminusDefinitionConstraint = OnionTerminus<any, any>;
}
