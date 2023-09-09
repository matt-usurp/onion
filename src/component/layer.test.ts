import * as t from '../testing/typing';
import type { OnionLayer } from './layer';
import type { OnionOutput } from './output';

type TestBaseInput = {
  readonly id: string;
  readonly name: string;
  readonly random: number;
};

type TestBaseOutput = OnionOutput<'o:test:status', {
  readonly status: number;
}>;

type NewInputWithAuthentication = {
  readonly role: string;
  readonly authenticated: boolean;
};

type NewOutputWithAuthentication = OnionOutput<'o:test:authenticated', {
  readonly authenticated: boolean;
}>;

describe('type, OnionLayer', (): void => {
  describe('type, LayerFunctionImplementation', (): void => {
    it('with', (): void => {
      type Definition = OnionLayer<TestBaseInput, TestBaseOutput, NewInputWithAuthentication, NewOutputWithAuthentication>;
      type Expect = OnionLayer.LayerFunctionImplementation<Definition>;
      type ExpectNext = Parameters<Expect>[1];

      t.assert(t.isExtending<Parameters<Expect>[0], OnionLayer.LayerEnforceNextInputPassThrough>());
      //         ^?
      t.assert(t.isExtending<Parameters<Expect>[0], TestBaseInput>());
      //         ^?

      t.assert(t.isExtendingReverse<Awaited<ReturnType<Expect>>, OnionLayer.LayerEnforceNextOutputPassThrough>());
      //         ^?
      t.assert(t.isExtendingReverse<Awaited<ReturnType<Expect>>, TestBaseOutput>());
      //         ^?

      t.assert(t.isExtending<Parameters<ExpectNext>[0], OnionLayer.LayerEnforceNextInputPassThrough>());
      //         ^?
      t.assert(t.isExtending<Parameters<ExpectNext>[0], NewInputWithAuthentication>());
      //         ^?

      t.assert(t.isExtendingReverse<Awaited<ReturnType<ExpectNext>>, OnionLayer.LayerEnforceNextOutputPassThrough>());
      //         ^?
      t.assert(t.isExtendingReverse<Awaited<ReturnType<ExpectNext>>, NewOutputWithAuthentication>());
      //         ^?
    });
  });

  describe('type, GetLayerDefinitionCurrentInput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Definition = OnionLayer<any, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionCurrentInput<Definition>;
      //   ^?

      t.assert(t.isExactly<Expect, never>());
      //         ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionCurrentInput<Value, 1>;
      //   ^?

      t.assert(t.isExactly<Expect, 1>());
      //    ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<TestBaseInput, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionCurrentInput<Value>;
      //   ^?

      t.assert(t.isExactly<Expect, TestBaseInput>());
      //         ^?
    });
  });

  describe('type, GetLayerDefinitionCurrentOutput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionCurrentOutput<Value>;
      //   ^?

      t.assert(t.isExactly<Expect, never>());
      //         ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionCurrentOutput<Value, 1>;
      //   ^?

      t.assert(t.isExactly<Expect, 1>());
      //         ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, TestBaseOutput, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionCurrentOutput<Value>;
      //   ^?

      t.assert(t.isExactly<Expect, TestBaseOutput>());
      //         ^?
    });
  });

  describe('type, GetLayerDefinitionNewInput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionNewInput<Value>;
      //   ^?

      t.assert(t.isExactly<Expect, never>());
      //         ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionNewInput<Value, 1>;
      //   ^?

      t.assert(t.isExactly<Expect, 1>());
      //         ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, TestBaseInput, any>;
      type Expect = OnionLayer.GetLayerDefinitionNewInput<Value>;
      //   ^?

      t.assert(t.isExactly<Expect, TestBaseInput>());
      //    ^?
    });
  });

  describe('type, GetLayerDefinitionNewOutput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionNewOutput<Value>;
      //   ^?

      t.assert(t.isExactly<Expect, never>());
      //         ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, any, any>;
      type Expect = OnionLayer.GetLayerDefinitionNewOutput<Value, 1>;
      //   ^?

      t.assert(t.isExactly<Expect, 1>());
      //         ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Value = OnionLayer<any, any, any, TestBaseOutput>;
      type Expect = OnionLayer.GetLayerDefinitionNewOutput<Value>;
      //   ^?

      t.assert(t.isExactly<Expect, TestBaseOutput>());
      //         ^?
    });
  });

  describe('type, WithLayerExpectingCurrentInput', (): void => {
    it('with no layer, creates with current input', (): void => {
      type Value = OnionLayer.WithLayerDefinitionExpectingCurrentInput<{ id: string }>;

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentInput<Value>, { id: string }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentOutput<Value>, never>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewInput<Value>, never>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewOutput<Value>, never>());
      //         ^?
    });

    it('with layer, replaces current input only', (): void => {
      type Fixture = OnionLayer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = OnionLayer.WithLayerDefinitionExpectingCurrentInput<{ id: string }, Fixture>;

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentInput<Value>, { id: string }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewInput<Value>, { age: number }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewOutput<Value>, TestBaseOutput>());
      //         ^?
    });
  });

  describe('type, WithLayerProvidingNewInput', (): void => {
    it('with no layer, creates with new input', (): void => {
      type Value = OnionLayer.WithLayerDefinitionProvidingNewInput<{ id: string }>;

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentInput<Value>, never>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentOutput<Value>, never>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewInput<Value>, { id: string }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewOutput<Value>, never>());
      //         ^?
    });

    it('with layer, replaces new input only', (): void => {
      type Fixture = OnionLayer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = OnionLayer.WithLayerDefinitionProvidingNewInput<{ id: string }, Fixture>;

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentInput<Value>, { name: string }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewInput<Value>, { id: string }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewOutput<Value>, TestBaseOutput>());
      //         ^?
    });
  });

  describe('type, WithLayerProvidingNewOutput', (): void => {
    it('with no layer, creates with current output and new output', (): void => {
      type Value = OnionLayer.WithLayerDefinitionProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication>;

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentInput<Value>, never>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewInput<Value>, never>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewOutput<Value>, NewOutputWithAuthentication>());
      //         ^?
    });

    it('with layer, replaces current output and new output only', (): void => {
      type Fixture = OnionLayer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = OnionLayer.WithLayerDefinitionProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication, Fixture>;

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentInput<Value>, { name: string }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewInput<Value>, { age: number }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewOutput<Value>, NewOutputWithAuthentication>());
      //         ^?
    });

    it('without layer, composable with multiple builders', (): void => {
      type Previous = OnionLayer.WithLayerDefinitionProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication>;
      type Value = OnionLayer.WithLayerDefinitionProvidingNewInput<{ age: number }, Previous>;

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentInput<Value>, never>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewInput<Value>, { age: number }>());
      //         ^?

      t.assert(t.isExactly<OnionLayer.GetLayerDefinitionNewOutput<Value>, NewOutputWithAuthentication>());
      //         ^?
    });
  });
});
