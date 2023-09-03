import type { Grok } from '@matt-usurp/grok';
import type { MockedFunction, MockedObject } from 'vitest';
import type { ComposerConstraint, InputConstraint, Layer, LayerConstraint, OnionCore, Output, OutputConstraint, Terminus } from './index';
import { Composer, output } from './index';

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

const createTerminusClassMock = <
  GivenTerminus extends Terminus<GivenInput, GivenOutput>,
  GivenInput extends InputConstraint = GivenTerminus extends Terminus<infer I, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
  GivenOutput extends OutputConstraint = GivenTerminus extends Terminus<any, infer I> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
>(): MockedObject<Terminus.Class<GivenInput, GivenOutput>> => {
  return {
    invoke: vi.fn(),
  } as unknown as MockedObject<Terminus.Class<GivenInput, GivenOutput>>;
};

const createTerminusFunctionMock = <
  GivenTerminus extends Terminus<GivenInput, GivenOutput>,
  GivenInput extends InputConstraint = GivenTerminus extends Terminus<infer I, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
  GivenOutput extends OutputConstraint = GivenTerminus extends Terminus<any, infer I> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
>(): MockedFunction<Terminus.Fn<GivenInput, GivenOutput>> => {
  return vi.fn() as MockedFunction<Terminus.Fn<GivenInput, GivenOutput>>;
};

const createLayerClassMock = <GivenLayer extends LayerConstraint>(): (
/* eslint-disable @typescript-eslint/indent */
  MockedObject<
    Layer.Class<
      GivenLayer extends Layer<infer I, any, any, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
      GivenLayer extends Layer<any, infer I, any, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
      GivenLayer extends Layer<any, any, infer I, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
      GivenLayer extends Layer<any, any, any, infer I> ? I : never // eslint-disable-line @typescript-eslint/no-explicit-any
    >
  >
/* eslint-enable @typescript-eslint/indent */
) => {
  return {
    invoke: vi.fn(),
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const createLayerFunctionMock = <GivenLayer extends LayerConstraint>(): (
/* eslint-disable @typescript-eslint/indent */
  MockedFunction<
    Layer.Fn<
      GivenLayer extends Layer<infer I, any, any, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
      GivenLayer extends Layer<any, infer I, any, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
      GivenLayer extends Layer<any, any, infer I, any> ? I : never, // eslint-disable-line @typescript-eslint/no-explicit-any
      GivenLayer extends Layer<any, any, any, infer I> ? I : never // eslint-disable-line @typescript-eslint/no-explicit-any
    >
  >
/* eslint-enable @typescript-eslint/indent */
) => {
  return vi.fn() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
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

type WithoutPromise<T> = T extends Promise<infer Inferred> ? Inferred : T;

type InferComposerCurrentInput<T extends ComposerConstraint> = (
  T extends Composer<infer I, any, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    ? OnionCore.Cleanse<I, never, I>
    : never
);

type InferComposerCurrentOutput<T extends ComposerConstraint> = (
  T extends Composer<any, infer I, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    ? OnionCore.Cleanse<I, never, I>
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
      type Expect = OnionCore.LayerFunctionImplementation<TestBaseInput, TestBaseOutput, NewInputWithAuthentication, NewOutputWithAuthentication>;
      type ExpectNext = Parameters<Expect>[1];

      ensure(typeIsExtending<Parameters<Expect>[0], OnionCore.LayerEnforceNextInputPassThrough>());
      //     ^?
      ensure(typeIsExtending<Parameters<Expect>[0], TestBaseInput>());
      //     ^?

      ensure(typeIsExtendingReverse<WithoutPromise<ReturnType<Expect>>, OnionCore.LayerEnforceNextOutputPassThrough>());
      //     ^?
      ensure(typeIsExtendingReverse<WithoutPromise<ReturnType<Expect>>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExtending<Parameters<ExpectNext>[0], OnionCore.LayerEnforceNextInputPassThrough>());
      //     ^?
      ensure(typeIsExtending<Parameters<ExpectNext>[0], NewInputWithAuthentication>());
      //     ^?

      ensure(typeIsExtendingReverse<WithoutPromise<ReturnType<ExpectNext>>, OnionCore.LayerEnforceNextOutputPassThrough>());
      //     ^?
      ensure(typeIsExtendingReverse<WithoutPromise<ReturnType<ExpectNext>>, NewOutputWithAuthentication>());
      //     ^?
    });
  });

  describe('type, InferLayerCurrentInput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = OnionCore.InferLayerCurrentInput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, never>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = OnionCore.InferLayerCurrentInput<Value, 1>;
      //   ^?

      ensure(typeIsExactly<Expect, 1>());
      //    ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<TestBaseInput, any, any, any>;
      type Expect = OnionCore.InferLayerCurrentInput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, TestBaseInput>());
      //     ^?
    });
  });

  describe('type, InferLayerCurrentOutput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = OnionCore.InferLayerCurrentOutput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, never>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = OnionCore.InferLayerCurrentOutput<Value, 1>;
      //   ^?

      ensure(typeIsExactly<Expect, 1>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, TestBaseOutput, any, any>;
      type Expect = OnionCore.InferLayerCurrentOutput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, TestBaseOutput>());
      //     ^?
    });
  });

  describe('type, InferLayerNewInput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = OnionCore.InferLayerNewInput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, never>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = OnionCore.InferLayerNewInput<Value, 1>;
      //   ^?

      ensure(typeIsExactly<Expect, 1>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, TestBaseInput, any>;
      type Expect = OnionCore.InferLayerNewInput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, TestBaseInput>());
      //    ^?
    });
  });

  describe('type, InferLayerNewOutput', (): void => {
    it('with layer, infers input, with any, fallback never', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = OnionCore.InferLayerNewOutput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, never>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, any>;
      type Expect = OnionCore.InferLayerNewOutput<Value, 1>;
      //   ^?

      ensure(typeIsExactly<Expect, 1>());
      //     ^?
    });

    it('with layer, infers input, with any, fallback defined', (): void => {
      type Value = Layer<any, any, any, TestBaseOutput>;
      type Expect = OnionCore.InferLayerNewOutput<Value>;
      //   ^?

      ensure(typeIsExactly<Expect, TestBaseOutput>());
      //     ^?
    });
  });

  describe('type, WithLayerExpectingCurrentInput', (): void => {
    it('with no layer, creates with current input', (): void => {
      type Value = OnionCore.WithLayerExpectingCurrentInput<{ id: string }>;

      ensure(typeIsExactly<OnionCore.InferLayerCurrentInput<Value>, { id: string }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerCurrentOutput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewOutput<Value>, never>());
      //     ^?
    });

    it('with layer, replaces current input only', (): void => {
      type Fixture = Layer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = OnionCore.WithLayerExpectingCurrentInput<{ id: string }, Fixture>;

      ensure(typeIsExactly<OnionCore.InferLayerCurrentInput<Value>, { id: string }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewInput<Value>, { age: number }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewOutput<Value>, TestBaseOutput>());
      //     ^?
    });
  });

  describe('type, WithLayerProvidingNewInput', (): void => {
    it('with no layer, creates with new input', (): void => {
      type Value = OnionCore.WithLayerProvidingNewInput<{ id: string }>;

      ensure(typeIsExactly<OnionCore.InferLayerCurrentInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerCurrentOutput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewInput<Value>, { id: string }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewOutput<Value>, never>());
      //     ^?
    });

    it('with layer, replaces new input only', (): void => {
      type Fixture = Layer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = OnionCore.WithLayerProvidingNewInput<{ id: string }, Fixture>;

      ensure(typeIsExactly<OnionCore.InferLayerCurrentInput<Value>, { name: string }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewInput<Value>, { id: string }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewOutput<Value>, TestBaseOutput>());
      //     ^?
    });
  });

  describe('type, WithLayerProvidingNewOutput', (): void => {
    it('with no layer, creates with current output and new output', (): void => {
      type Value = OnionCore.WithLayerProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication>;

      ensure(typeIsExactly<OnionCore.InferLayerCurrentInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewOutput<Value>, NewOutputWithAuthentication>());
      //     ^?
    });

    it('with layer, replaces current output and new output only', (): void => {
      type Fixture = Layer<{ name: string }, TestBaseOutput, { age: number }, TestBaseOutput>;
      type Value = OnionCore.WithLayerProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication, Fixture>;

      ensure(typeIsExactly<OnionCore.InferLayerCurrentInput<Value>, { name: string }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewInput<Value>, { age: number }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewOutput<Value>, NewOutputWithAuthentication>());
      //     ^?
    });

    it('without layer, composable with multiple builders', (): void => {
      type Previous = OnionCore.WithLayerProvidingNewOutput<TestBaseOutput, NewOutputWithAuthentication>;
      type Value = OnionCore.WithLayerProvidingNewInput<{ age: number }, Previous>;

      ensure(typeIsExactly<OnionCore.InferLayerCurrentInput<Value>, never>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerCurrentOutput<Value>, TestBaseOutput>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewInput<Value>, { age: number }>());
      //     ^?

      ensure(typeIsExactly<OnionCore.InferLayerNewOutput<Value>, NewOutputWithAuthentication>());
      //     ^?
    });
  });

  describe('type, ExtendingLayer', (): void => {
    it('with abstract syntax, changes current input, returns abstract syntax', (): void => {
      type Previous = Layer<TestBaseInput, TestBaseOutput, TestBaseInput, TestBaseOutput>;
      type Value = OnionCore.ExtendingLayer<Previous, NewInputWithAuthentication, any, any, any>;

      ensure(typeIsExtending<Value, LayerConstraint>());
      //     ^?

      ensure(typeIsExtendingReverse<Value, OnionCore.LayerFunctionImplementationConstraint>());
      //     ^?

      ensure(typeIsExtendingReverse<Value, OnionCore.LayerClassImplementationConstraint>());
      //     ^?
    });

    it('with function syntax, changes current input, returns function syntax', (): void => {
      type Previous = Layer.Fn<TestBaseInput, TestBaseOutput, TestBaseInput, TestBaseOutput>;
      type Value = OnionCore.ExtendingLayer<Previous, NewInputWithAuthentication, any, any, any>;

      ensure(typeIsExtending<Value, LayerConstraint>());
      //     ^?

      ensure(typeIsExtending<Value, OnionCore.LayerFunctionImplementationConstraint>());
      //     ^?
    });

    it('with class syntax, changes current input, returns class syntax', (): void => {
      type Previous = Layer.Class<TestBaseInput, TestBaseOutput, TestBaseInput, TestBaseOutput>;
      type Value = OnionCore.ExtendingLayer<Previous, NewInputWithAuthentication, any, any, any>;

      ensure(typeIsExtending<Value, LayerConstraint>());
      //     ^?

      ensure(typeIsExtending<Value, OnionCore.LayerClassImplementationConstraint>());
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

      expect(result).toStrictEqual<OutputConstraint>(
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

      expect(result).toStrictEqual<OutputConstraint>(
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

      expect(result).toStrictEqual<OutputConstraint>(
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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

        expect(result).toStrictEqual<OutputConstraint>(
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

        expect(result).toStrictEqual<OutputConstraint>(
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

        expect(result).toStrictEqual<OutputConstraint>(
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

        expect(result).toStrictEqual<OutputConstraint>(
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

      expect(result).toStrictEqual<OutputConstraint>(
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

      expect(result).toStrictEqual<OutputConstraint>(
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

      expect(result).toStrictEqual<OutputConstraint>(
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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
        return next(input);
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

      expect(result).toStrictEqual<OutputConstraint>(
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

        expect(result).toStrictEqual<OutputConstraint>(
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

        expect(result).toStrictEqual<OutputConstraint>(
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

        expect(result).toStrictEqual<OutputConstraint>(
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

        expect(result).toStrictEqual<OutputConstraint>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });
  });
});
