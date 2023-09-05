export namespace OnionInput {
  /**
   * A constraint type that can be used to accept types of input.
   *
   * Otherwise without an object as input you cannot make use of the {@link Layer} features.
   */
  export type InputKind = Record<string, unknown>;
}
