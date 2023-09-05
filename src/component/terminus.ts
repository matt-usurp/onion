import type { $$OnionComponentInput as I } from './input';
import type { $$OnionComponentOutput as O } from './output';
import type { $$OnionComponentUtility as U } from './utility';

/**
 * Onion internals namespace for the terminus component.
 */
namespace Onion {
  export type GetTerminusDefinitionInput<GivenTerminusDefinition extends TerminusDefinitionConstraint, Fallback = never> = U.Cleanse.Fallback<GivenTerminusDefinition['CurrentInput'], Fallback>;
  export type GetTerminusDefinitionOutput<GivenTerminusDefinition extends TerminusDefinitionConstraint, Fallback = never> = U.Cleanse.Fallback<GivenTerminusDefinition['CurrentOutput'], Fallback>;

  export type MakeTerminusInput<GivenTerminusDefinition extends TerminusDefinitionConstraint> = U.Cleanse.Fallback<GetTerminusDefinitionInput<GivenTerminusDefinition>, undefined>;
  export type MakeTerminusOutput<GivenTerminusDefinition extends TerminusDefinitionConstraint> = Promise<U.Cleanse.Fallback<GetTerminusDefinitionOutput<GivenTerminusDefinition>, O.OutputConstraint>>;

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

  /**
   * Take the {@link GivenInput} and provide a return of {@link GivenOutput}.
   */
  export type TerminusDefinition<
    CurrentInput extends I.InputConstraint,
    CurrentOutput extends O.OutputConstraint,
  > = {
    readonly CurrentInput: CurrentInput;
    readonly CurrentOutput: CurrentOutput;
  };

  // Syntax sugar:
  export namespace TerminusDefinition {
    export import Class = Onion.TerminusClassImplementation;
    export import Fn = Onion.TerminusFunctionImplementation;

    export import Input = Onion.MakeTerminusInput;
    export import Output = Onion.MakeTerminusOutput;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type TerminusDefinitionConstraint = TerminusDefinition<any, any>;
}

export { Onion as $$OnionComponentTerminus };
