import type { Grok } from '@matt-usurp/grok';
import type { MockedFunction, MockedObject } from 'vitest';
import type { OnionLayer as L } from './component/layer';
import type { OnionUtility as U } from './component/utility';
import type { ComposerConstraint, Layer, LayerConstraint, Output, Terminus, TerminusConstraint } from './index';
import { Composer, isOutputType, output } from './index';

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type TestBaseInput = {
  readonly id: string;
  readonly name: string;
  readonly random: number;
};

export type TestBaseOutput = Output<'o:test:status', {
  readonly status: number;
}>;

const createTerminusClassMock = <GivenTerminus extends TerminusConstraint>(): MockedObject<Terminus.Class<GivenTerminus>> => {
  return {
    invoke: vi.fn(),
  } as unknown as MockedObject<Terminus.Class<GivenTerminus>>;
};

const createTerminusFunctionMock = <GivenTerminus extends TerminusConstraint>(): MockedFunction<Terminus.Fn<GivenTerminus>> => {
  return vi.fn() as MockedFunction<Terminus.Fn<GivenTerminus>>;
};

const createLayerClassMock = <GivenLayer extends LayerConstraint>(): MockedObject<Layer.Class<GivenLayer>> => {
  return {
    invoke: vi.fn(),
  } as MockedObject<Layer.Class<GivenLayer>>;
};

const createLayerFunctionMock = <GivenLayer extends LayerConstraint>(): MockedFunction<Layer.Fn<GivenLayer>> => {
  return vi.fn() as MockedFunction<Layer.Fn<GivenLayer>>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assertInputType = <T, X extends T>() => expect(true);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assertOutputType = <T extends X, X>() => expect(true);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ensure = (assertion: true) => undefined;

/**
 * Check that {@link A} and {@link B} are the exact same
 */
const typeIsExactly = <A, B>(): Grok.Value.IsExactly<A, B> => undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Check that {@link A} extends {@link B}.
 */
const typeIsExtending = <A, B>(): Grok.Value.IsExtending<A, B> => undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Check that {@link B} extends {@link A}.
 */
const typeIsExtendingReverse = <A, B>(): Grok.Value.IsExtending<B, A> => undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any

type InferComposerCurrentInput<T extends ComposerConstraint> = (
  T extends Composer<infer I, any, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    ? U.Cleanse<I, never, I>
    : never
);

type InferComposerCurrentOutput<T extends ComposerConstraint> = (
  T extends Composer<any, infer I, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    ? U.Cleanse<I, never, I>
    : never
);

describe('type, OnionCore', (): void => {
  type NewInputWithAuthentication = {
    readonly role: string;
    readonly authenticated: boolean;
  };

  type NewOutputWithAuthentication = Output<'o:test:authenticated', {
    readonly authenticated: boolean;
  }>;

  describe('type, LayerFunctionImplementation', (): void => {
    it('with', (): void => {
      type Definition = Layer<TestBaseInput, TestBaseOutput, NewInputWithAuthentication, NewOutputWithAuthentication>;
      type Expect = L.LayerFunctionImplementation<Definition>;
      type ExpectNext = Parameters<Expect>[1];

      ensure(typeIsExtending<Parameters<Expect>[0], L.LayerEnforceNextInputPassThrough>());
      //     ^?
      ensure(typeIsExtending<Parameters<Expect>[0], TestBaseInput>());
      //     ^?

      ensure(typeIsExtendingReverse<Awaited<ReturnType<Expect>>, L.LayerEnforceNextOutputPassThrough>());
      //     ^?
      ensure(typeIsExtendingReverse<Awaited<ReturnType<Expect>>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExtending<Parameters<ExpectNext>[0], L.LayerEnforceNextInputPassThrough>());
      //     ^?
      ensure(typeIsExtending<Parameters<ExpectNext>[0], NewInputWithAuthentication>());
      //     ^?

      ensure(typeIsExtendingReverse<Awaited<ReturnType<ExpectNext>>, L.LayerEnforceNextOutputPassThrough>());
      //     ^?
      ensure(typeIsExtendingReverse<Awaited<ReturnType<ExpectNext>>, NewOutputWithAuthentication>());
      //     ^?
    });
  });

  describe('type, GetLayerDefinitionCurrentInput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      type Definition = Layer<any, any, any, any>;
      type Expect = L.GetLayerDefinitionCurrentInput<Definition>;
      //   ^?

      ensure(typeIsExactly<Expect, never>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = L.GetLayerDefinitionCurrentInput<Value, 1>;
      //   ^?

      ensure(typeIsExactly<Expect, 1>());
      //    ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<TestBaseInput, any, any, any>;
      type Expect = L.GetLayerDefinitionCurrentInput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, TestBaseInput>());
      //     ^?
    });
  });

  describe('type, GetLayerDefinitionCurrentOutput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = L.GetLayerDefinitionCurrentOutput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, never>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = L.GetLayerDefinitionCurrentOutput<Value, 1>;
      //   ^?

      ensure(typeIsExactly<Expect, 1>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, TestBaseOutput, any, any>;
      type Expect = L.GetLayerDefinitionCurrentOutput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, TestBaseOutput>());
      //     ^?
    });
  });

  describe('type, GetLayerDefinitionNewInput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = L.GetLayerDefinitionNewInput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, never>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = L.GetLayerDefinitionNewInput<Value, 1>;
      //   ^?

      ensure(typeIsExactly<Expect, 1>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, TestBaseInput, any>;
      type Expect = L.GetLayerDefinitionNewInput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, TestBaseInput>());
      //    ^?
    });
  });

  describe('type, GetLayerDefinitionNewOutput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = L.GetLayerDefinitionNewOutput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, never>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = L.GetLayerDefinitionNewOutput<Value, 1>;
      //   ^?

      ensure(typeIsExactly<Expect, 1>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, TestBaseOutput>;
      type Expect = L.GetLayerDefinitionNewOutput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, TestBaseOutput>());
      //     ^?
    });
  });

  describe('type, WithLayerExpectingCurrentInput', (): void => {
    it('with no layer, creates with current input', (): void => {
      type Value = L.WithLayerDefinitionExpectingCurrentInput<{ id: string }>;

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentInput<Value>, { id: string }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentOutput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewOutput<Value>, never>());
      //     ^?
    });

    it('with layer, replaces current input only', (): void => {
      type Fixture = Layer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = L.WithLayerDefinitionExpectingCurrentInput<{ id: string }, Fixture>;

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentInput<Value>, { id: string }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewInput<Value>, { age: number }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewOutput<Value>, TestBaseOutput>());
      //     ^?
    });
  });

  describe('type, WithLayerProvidingNewInput', (): void => {
    it('with no layer, creates with new input', (): void => {
      type Value = L.WithLayerDefinitionProvidingNewInput<{ id: string }>;

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentOutput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewInput<Value>, { id: string }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewOutput<Value>, never>());
      //     ^?
    });

    it('with layer, replaces new input only', (): void => {
      type Fixture = Layer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = L.WithLayerDefinitionProvidingNewInput<{ id: string }, Fixture>;

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentInput<Value>, { name: string }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewInput<Value>, { id: string }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewOutput<Value>, TestBaseOutput>());
      //     ^?
    });
  });

  describe('type, WithLayerProvidingNewOutput', (): void => {
    it('with no layer, creates with current output and new output', (): void => {
      type Value = L.WithLayerDefinitionProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication>;

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewOutput<Value>, NewOutputWithAuthentication>());
      //     ^?
    });

    it('with layer, replaces current output and new output only', (): void => {
      type Fixture = Layer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = L.WithLayerDefinitionProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication, Fixture>;

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentInput<Value>, { name: string }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewInput<Value>, { age: number }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewOutput<Value>, NewOutputWithAuthentication>());
      //     ^?
    });

    it('without layer, composable with multiple builders', (): void => {
      type Previous = L.WithLayerDefinitionProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication>;
      type Value = L.WithLayerDefinitionProvidingNewInput<{ age: number }, Previous>;

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewInput<Value>, { age: number }>());
      //     ^?

      ensure(typeIsExactly<L.GetLayerDefinitionNewOutput<Value>, NewOutputWithAuthentication>());
      //     ^?
    });
  });
});

describe(Composer.name, (): void => {
  describe('using class style', (): void => {
    it('with terminus', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer1>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer1>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer1.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(0);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, pass through, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerClassMock<Layer<any, any, any, any>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, expecting exact current input, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerClassMock<Layer<TestBaseInput, any, any, any>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, expecting subset of the current input, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type LayerCurrentSubsetInput = {
        readonly id: string;
      };

      const layer1 = createLayerClassMock<Layer<LayerCurrentSubsetInput, any, any, any>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, providing new input, merges with current input', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        return next({
          ...input,

          authenticated: false,
        });
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);


      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, proving new response, unions with current response', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Output<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerClassMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        const result = await next(input);

        if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
          throw new Error();
        }

        return result;
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, providing new input, terminus expecting new input, merges with current input and allows terminus', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        return next({
          ...input,

          authenticated: false,
        });
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<NewInputWithAuthentication, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, proving new response, terminus expects new response, unions with current response and allows terminus', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Output<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerClassMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        const result = await next(input);

        if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
          throw new Error();
        }

        return result;
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:authenticated', {
          authenticated: false,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:authenticated', {
          authenticated: false,
        }),
      );
    });

    it('with layers, first providing new input, second expecting new input, merges with current input and allows second layer', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        return next({
          ...input,

          authenticated: false,
        });
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Layer

      const layer2 = createLayerClassMock<Layer<NewInputWithAuthentication, any, any, any>>();

      layer2.invoke.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer3 = composer2.use(layer2);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer3>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer3>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer3.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(2);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(layer2.invoke).toBeCalledTimes(1);
      expect(layer2.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layers, first providing new response, second expecting new response, unions with current response and allows second layer', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Output<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerClassMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        const result = await next(input);

        if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
          throw new Error();
        }

        return result;
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Layer

      const layer2 = createLayerClassMock<Layer<any, NewOutputWithAuthentication, any, any>>();

      layer2.invoke.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer3 = composer2.use(layer2);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer3>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer3>>();

      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer3.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(2);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(layer2.invoke).toBeCalledTimes(1);
      expect(layer2.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    describe('for type only error cases', (): void => {
      it('with terminus, expected input does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Terminus

        type ExpectInput = {
          readonly authenticated: boolean;
        };

        const terminus = createTerminusClassMock<Terminus<ExpectInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer1.end(
          // @ts-expect-error missing expected property "authenticated"
          terminus,
        );

        // -- Result

        expect(composition.layers.length).toStrictEqual(0);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(result).toStrictEqual<Output.OutputKind>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('with terminus, expected output does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Terminus

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:authenticated', {
            authenticated: false,
          }),
        );

        const composition = composer1.end(
          // @ts-expect-error expected response is not in current output union
          terminus,
        );

        // -- Result

        expect(composition.layers.length).toStrictEqual(0);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(result).toStrictEqual<Output.OutputKind>(
          output('o:test:authenticated', {
            authenticated: false,
          }),
        );
      });

      it('with layer, expected input does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = {
          readonly authenticated: boolean;
        };

        const layer1 = createLayerClassMock<Layer<NewOutputWithAuthentication, any, any, any>>();

        layer1.invoke.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(
          // @ts-expect-error missing expected property "authenticated"
          layer1,
        );

        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(result).toStrictEqual<Output.OutputKind>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('with layer, expected output does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        const layer1 = createLayerClassMock<Layer<any, NewOutputWithAuthentication, any, any>>();

        layer1.invoke.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(
          // @ts-expect-error response is not in current output union
          layer1,
        );

        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(result).toStrictEqual<Output.OutputKind>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });
  });

  describe('using function style', (): void => {
    it('with terminus', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer1>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer1>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer1.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(0);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, pass through, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerFunctionMock<Layer<any, any, any, any>>();

      layer1.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, expecting exact current input, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerFunctionMock<Layer<TestBaseInput, any, any, any>>();

      layer1.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, expecting subset of the current input, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type LayerCurrentSubsetInput = {
        readonly id: string;
      };

      const layer1 = createLayerFunctionMock<Layer<LayerCurrentSubsetInput, any, any, any>>();

      layer1.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, providing new input, merges with current input', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.mockImplementationOnce(async (input, next) => {
        return next({
          ...input,

          authenticated: false,
        });
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);


      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, proving new response, unions with current response', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Output<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerFunctionMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.mockImplementationOnce(async (input, next) => {
        const result = await next(input);

        if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
          throw new Error();
        }

        return result;
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, providing new input, terminus expecting new input, merges with current input and allows terminus', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.mockImplementationOnce(async (input, next) => {
        return next({
          ...input,

          authenticated: false,
        });
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<NewInputWithAuthentication, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layer, proving new response, terminus expects new response, unions with current response and allows terminus', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Output<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerFunctionMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.mockImplementationOnce(async (input, next) => {
        const result = await next(input);

        if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
          throw new Error();
        }

        return result;
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

      terminus.mockResolvedValueOnce(
        output('o:test:authenticated', {
          authenticated: false,
        }),
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:authenticated', {
          authenticated: false,
        }),
      );
    });

    it('with layers, first providing new input, second expecting new input, merges with current input and allows second layer', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.mockImplementationOnce(async (input, next) => {
        return next({
          ...input,

          authenticated: false,
        });
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Layer

      const layer2 = createLayerFunctionMock<Layer<NewInputWithAuthentication, any, any, any>>();

      layer2.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer3 = composer2.use(layer2);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer3>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer3>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer3.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(2);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(layer2).toBeCalledTimes(1);
      expect(layer2).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('with layers, first providing new response, second expecting new response, unions with current response and allows second layer', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Output<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerFunctionMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.mockImplementationOnce(async (input, next) => {
        const result = await next(input);

        if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
          throw new Error();
        }

        return result;
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Layer

      const layer2 = createLayerFunctionMock<Layer<any, NewOutputWithAuthentication, any, any>>();

      layer2.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      const composer3 = composer2.use(layer2);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer3>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer3>>();

      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer3.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(2);

      const result = await composition.invoke({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(layer1).toBeCalledTimes(1);
      expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(layer2).toBeCalledTimes(1);
      expect(layer2).toBeCalledWith<[TestBaseInput, Function]>(
        {
          id: 'test:id',
          name: 'test:name',
          random: 3,
        },
        expect.any(Function),
      );

      expect(terminus).toBeCalledTimes(1);
      expect(terminus).toBeCalledWith<[TestBaseInput]>({
        id: 'test:id',
        name: 'test:name',
        random: 3,
      });

      expect(result).toStrictEqual<Output.OutputKind>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    describe('for type only error cases', (): void => {
      it('with terminus, expected input does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Terminus

        type ExpectInput = {
          readonly authenticated: boolean;
        };

        const terminus = createTerminusFunctionMock<Terminus<ExpectInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer1.end(
          // @ts-expect-error missing expected property "authenticated"
          terminus,
        );

        // -- Result

        expect(composition.layers.length).toStrictEqual(0);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(terminus).toBeCalledTimes(1);
        expect(terminus).toBeCalledWith<[TestBaseInput]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(result).toStrictEqual<Output.OutputKind>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('with terminus, expected output does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Terminus

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

        terminus.mockResolvedValueOnce(
          output('o:test:authenticated', {
            authenticated: false,
          }),
        );

        const composition = composer1.end(
          // @ts-expect-error expected response is not in current output union
          terminus,
        );

        // -- Result

        expect(composition.layers.length).toStrictEqual(0);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(terminus).toBeCalledTimes(1);
        expect(terminus).toBeCalledWith<[TestBaseInput]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(result).toStrictEqual<Output.OutputKind>(
          output('o:test:authenticated', {
            authenticated: false,
          }),
        );
      });

      it('with layer, expected input does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = {
          readonly authenticated: boolean;
        };

        const layer1 = createLayerFunctionMock<Layer<NewOutputWithAuthentication, any, any, any>>();

        layer1.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(
          // @ts-expect-error missing expected property "authenticated"
          layer1,
        );

        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(terminus).toBeCalledTimes(1);
        expect(terminus).toBeCalledWith<[TestBaseInput]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(result).toStrictEqual<Output.OutputKind>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('with layer, expected output does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        const layer1 = createLayerFunctionMock<Layer<any, NewOutputWithAuthentication, any, any>>();

        layer1.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(
          // @ts-expect-error response is not in current output union
          layer1,
        );

        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, Function]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(terminus).toBeCalledTimes(1);
        expect(terminus).toBeCalledWith<[TestBaseInput]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(result).toStrictEqual<Output.OutputKind>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });
  });
});
