/**
 * Onion internals namespace for the input component.
 */
namespace Onion {
  /**
   * A constraint type that can be used to accept types of input.
   *
   * Otherwise without an object as input you cannot make use of the {@link Layer} features.
   */
  export type InputConstraint = Record<string, unknown>;
}

export { Onion as $$OnionComponentInput };
