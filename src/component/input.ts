export namespace OnionCoreInput {
  /**
   * A constraint type that can be used to accept types of input.
   *
   * Otherwise without an object as input you cannot make use of the {@link Layer} features.
   */
  export type InputConstraint = Record<string, unknown>;
}
