import type { MockedFunction, MockedObject } from 'vitest';
import type { OnionLayer as L } from './component/layer';
import type { OnionTerminus } from './component/terminus';
import type { OnionUtility as U } from './component/utility';
import type { ComposerConstraint, Composition, Layer, Output, Terminus } from './index';
import { Composer, isOutputType, output } from './index';
import * as t from './testing/typing';

export type TestBaseInput = {
  readonly id: string;
  readonly name: string;
  readonly random: number;
};

export type TestBaseOutput = Output<'o:test:status', {
  readonly status: number;
}>;

const createTerminusClassMock = <GivenTerminus extends OnionTerminus.TerminusDefinitionConstraint>(): MockedObject<Terminus.Class<GivenTerminus>> => {
  return {
    invoke: vi.fn(),
  } as unknown as MockedObject<Terminus.Class<GivenTerminus>>;
};

const createTerminusFunctionMock = <GivenTerminus extends OnionTerminus.TerminusDefinitionConstraint>(): MockedFunction<Terminus.Fn<GivenTerminus>> => {
  return vi.fn() as MockedFunction<Terminus.Fn<GivenTerminus>>;
};

const createLayerClassMock = <GivenLayer extends L.LayerKind>(): MockedObject<Layer.Class<GivenLayer>> => {
  return {
    invoke: vi.fn(),
  } as MockedObject<Layer.Class<GivenLayer>>;
};

const createLayerFunctionMock = <GivenLayer extends L.LayerKind>(): MockedFunction<Layer.Fn<GivenLayer>> => {
  return vi.fn() as MockedFunction<Layer.Fn<GivenLayer>>;
};

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

type InferCompositionCurrentInput<T extends Composition.CompositionKind> = (
  T extends Composition<infer I, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    ? U.Cleanse<I, never, I>
    : never
);

type InferCompositionCurrentOutput<T extends Composition.CompositionKind> = (
  T extends Composition<any, infer I> // eslint-disable-line @typescript-eslint/no-explicit-any
    ? U.Cleanse<I, never, I>
    : never
);

describe(Composer.name, (): void => {
  describe('with terminus only, does nothing to composition', (): void => {
    it('using class style', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      t.assert(t.isExtending<InferComposerCurrentInput<typeof composer1>, TestBaseInput>());
      //         ^?
      t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer1>, TestBaseOutput>());
      //         ^?

      // --
      // -- Terminus

      const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer1.end(terminus);

      t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
      //         ^?
      t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
      //         ^?

      // --
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

      expect(result).toStrictEqual<TestBaseOutput>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });

    it('using function style', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      t.assert(t.isExtending<InferComposerCurrentInput<typeof composer1>, TestBaseInput>());
      //         ^?
      t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer1>, TestBaseOutput>());
      //         ^?

      // --
      // -- Terminus

      const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.mockResolvedValueOnce(
        output('o:test:status', {
          status: 123,
        }),
      );

      const composition = composer1.end(terminus);

      t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
      //         ^?
      t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
      //         ^?

      // --
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

      expect(result).toStrictEqual<TestBaseOutput>(
        output('o:test:status', {
          status: 123,
        }),
      );
    });
  });

  describe('with layers', (): void => {
    describe('with no mutations, does nothing to composition', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<any, any, any, any>>();

        layer1.invoke.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<any, any, any, any>>();

        layer1.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });

    describe('with expected current input, exactly matching, does nothing to composition', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<TestBaseInput, any, any, any>>();

        layer1.invoke.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<TestBaseInput, any, any, any>>();

        layer1.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });

    describe('with expected current input, partial matching, does nothing to composition', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type LayerCurrentSubsetInput = {
          readonly id: string;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<LayerCurrentSubsetInput, any, any, any>>();

        layer1.invoke.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type LayerCurrentSubsetInput = {
          readonly id: string;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<LayerCurrentSubsetInput, any, any, any>>();

        layer1.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });

    describe('with providing new input, merges with current input', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewInputWithAuthentication = {
          readonly authenticated: boolean;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

        layer1.invoke.mockImplementationOnce(async (input, next) => {
          return next({
            ...input,

            authenticated: false,
          });
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, NewInputWithAuthentication>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput & NewInputWithAuthentication]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
          authenticated: false,
        });

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewInputWithAuthentication = {
          readonly authenticated: boolean;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

        layer1.mockImplementationOnce(async (input, next) => {
          return next({
            ...input,

            authenticated: false,
          });
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, NewInputWithAuthentication>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(terminus).toBeCalledTimes(1);
        expect(terminus).toBeCalledWith<[TestBaseInput & NewInputWithAuthentication]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
          authenticated: false,
        });

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });

    describe('with providing new input, terminus expects new input', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewInputWithAuthentication = {
          readonly authenticated: boolean;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

        layer1.invoke.mockImplementationOnce(async (input, next) => {
          return next({
            ...input,

            authenticated: false,
          });
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, NewInputWithAuthentication>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<NewInputWithAuthentication, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput & NewInputWithAuthentication]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
          authenticated: false,
        });

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewInputWithAuthentication = {
          readonly authenticated: boolean;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

        layer1.mockImplementationOnce(async (input, next) => {
          return next({
            ...input,

            authenticated: false,
          });
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, NewInputWithAuthentication>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<NewInputWithAuthentication, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(terminus).toBeCalledTimes(1);
        expect(terminus).toBeCalledWith<[TestBaseInput & NewInputWithAuthentication]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
          authenticated: false,
        });

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });

    describe('with providing new input, second layer expects new input', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewInputWithAuthentication = {
          readonly authenticated: boolean;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

        layer1.invoke.mockImplementationOnce(async (input, next) => {
          return next({
            ...input,

            authenticated: false,
          });
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, NewInputWithAuthentication>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Layer

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer2 = createLayerClassMock<Layer<NewInputWithAuthentication, any, any, any>>();

        layer2.invoke.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer3 = composer2.use(layer2);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer3>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer3>, NewInputWithAuthentication>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer3>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer3.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(2);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(layer2.invoke).toBeCalledTimes(1);
        expect(layer2.invoke).toBeCalledWith<[TestBaseInput & NewInputWithAuthentication, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
            authenticated: false,
          },
          expect.any(Function),
        );

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput & NewInputWithAuthentication]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
          authenticated: false,
        });

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewInputWithAuthentication = {
          readonly authenticated: boolean;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

        layer1.mockImplementationOnce(async (input, next) => {
          return next({
            ...input,

            authenticated: false,
          });
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, NewInputWithAuthentication>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?

        // --
        // -- Layer

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer2 = createLayerFunctionMock<Layer<NewInputWithAuthentication, any, any, any>>();

        layer2.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer3 = composer2.use(layer2);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer3>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer3>, NewInputWithAuthentication>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer3>, TestBaseOutput>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer3.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(2);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(layer2).toBeCalledTimes(1);
        expect(layer2).toBeCalledWith<[TestBaseInput & NewInputWithAuthentication, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
            authenticated: false,
          },
          expect.any(Function),
        );

        expect(terminus).toBeCalledTimes(1);
        expect(terminus).toBeCalledWith<[TestBaseInput & NewInputWithAuthentication]>({
          id: 'test:id',
          name: 'test:name',
          random: 3,
          authenticated: false,
        });

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });

    describe('with providing new output, unions with current output', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<any, TestBaseOutput, any, NewOutputWithAuthentication>>();

        // @tdoo
        // @ts-expect-error Unknown right now
        layer1.invoke.mockImplementationOnce(async (input, next) => {
          const result = await next(input);

          if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
            return output('o:test:status', {
              status: 100,
            });
          }

          return result;
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, NewOutputWithAuthentication>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:authenticated', {
            authenticated: false,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 100,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<any, TestBaseOutput, any, NewOutputWithAuthentication>>();

        // @tdoo
        // @ts-expect-error Unknown right now
        layer1.mockImplementationOnce(async (input, next) => {
          const result = await next(input);

          if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
            return output('o:test:status', {
              status: 100,
            });
          }

          return result;
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, NewOutputWithAuthentication>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

        terminus.mockResolvedValueOnce(
          output('o:test:authenticated', {
            authenticated: false,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 100,
          }),
        );
      });
    });

    describe('with providing new output, terminus expects new output', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<any, TestBaseOutput, any, NewOutputWithAuthentication>>();

        // @tdoo
        // @ts-expect-error Unknown right now
        layer1.invoke.mockImplementationOnce(async (input, next) => {
          const result = await next(input);

          if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
            return output('o:test:status', {
              status: 100,
            });
          }

          return result;
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, NewOutputWithAuthentication>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:authenticated', {
            authenticated: false,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 100,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<any, TestBaseOutput, any, NewOutputWithAuthentication>>();

        // @tdoo
        // @ts-expect-error Unknown right now
        layer1.mockImplementationOnce(async (input, next) => {
          const result = await next(input);

          if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
            return output('o:test:status', {
              status: 100,
            });
          }

          return result;
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, NewOutputWithAuthentication>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

        terminus.mockResolvedValueOnce(
          output('o:test:authenticated', {
            authenticated: false,
          }),
        );

        const composition = composer2.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 100,
          }),
        );
      });
    });

    describe('with proving new output, second layer expecting new output', (): void => {
      it('using class style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerClassMock<Layer<any, TestBaseOutput, any, NewOutputWithAuthentication>>();

        // @tdoo
        // @ts-expect-error Unknown right now
        layer1.invoke.mockImplementationOnce(async (input, next) => {
          const result = await next(input);

          if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
            return output('o:test:status', {
              status: 100,
            });
          }

          return result;
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, NewOutputWithAuthentication>());
        //         ^?

        // --
        // -- Layer

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer2 = createLayerClassMock<Layer<any, NewOutputWithAuthentication, any, any>>();

        layer2.invoke.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer3 = composer2.use(layer2);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer3>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer3>, TestBaseOutput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer3>, NewOutputWithAuthentication>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer3.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(2);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(layer2.invoke).toBeCalledTimes(1);
        expect(layer2.invoke).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });

      it('using function style', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // --
        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer1 = createLayerFunctionMock<Layer<any, TestBaseOutput, any, NewOutputWithAuthentication>>();

        // @tdoo
        // @ts-expect-error Unknown right now
        layer1.mockImplementationOnce(async (input, next) => {
          const result = await next(input);

          if (isOutputType<NewOutputWithAuthentication>(result, 'o:test:authenticated')) {
            return output('o:test:status', {
              status: 100,
            });
          }

          return result;
        });

        const composer2 = composer1.use(layer1);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer2>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, TestBaseOutput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer2>, NewOutputWithAuthentication>());
        //         ^?

        // --
        // -- Layer

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer2 = createLayerFunctionMock<Layer<any, NewOutputWithAuthentication, any, any>>();

        layer2.mockImplementationOnce(async (input, next) => {
          return next(input);
        });

        const composer3 = composer2.use(layer2);
        //    ^?

        t.assert(t.isExtending<InferComposerCurrentInput<typeof composer3>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer3>, TestBaseOutput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferComposerCurrentOutput<typeof composer3>, NewOutputWithAuthentication>());
        //         ^?

        // --
        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          }),
        );

        const composition = composer3.end(terminus);

        t.assert(t.isExtending<InferCompositionCurrentInput<typeof composition>, TestBaseInput>());
        //         ^?
        t.assert(t.isExtendingReverse<InferCompositionCurrentOutput<typeof composition>, TestBaseOutput>());
        //         ^?

        // --
        // -- Result

        expect(composition.layers.length).toStrictEqual(2);

        const result = await composition.invoke({
          id: 'test:id',
          name: 'test:name',
          random: 3,
        });

        expect(layer1).toBeCalledTimes(1);
        expect(layer1).toBeCalledWith<[TestBaseInput, unknown]>(
          {
            id: 'test:id',
            name: 'test:name',
            random: 3,
          },
          expect.any(Function),
        );

        expect(layer2).toBeCalledTimes(1);
        expect(layer2).toBeCalledWith<[TestBaseInput, unknown]>(
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

        expect(result).toStrictEqual<TestBaseOutput>(
          output('o:test:status', {
            status: 123,
          }),
        );
      });
    });
  });

  describe('with error cases', (): void => {
    it('with terminus, expected current input, current input not matching, raises build errors', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // --
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

      composer1.end(
        // @ts-expect-error missing expected property "authenticated"
        terminus,
      );
    });

    it('with terminus, expected current output, current output not matching, raises build errors', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // --
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

      composer1.end(
        // @ts-expect-error expected response is not in current output union
        terminus,
      );
    });

    it('with layer, expected current input, current input not matching, raises build errors', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // --
      // -- Layer

      type NewOutputWithAuthentication = {
        readonly authenticated: boolean;
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layer1 = createLayerClassMock<Layer<NewOutputWithAuthentication, any, any, any>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      composer1.use(
        // @ts-expect-error missing expected property "authenticated"
        layer1,
      );
    });

    it('with layer, expected current output, current output not matching, raises build errors', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // --
      // -- Layer

      type NewOutputWithAuthentication = Output<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layer1 = createLayerClassMock<Layer<any, NewOutputWithAuthentication, any, any>>();

      layer1.invoke.mockImplementationOnce(async (input, next) => {
        return next(input);
      });

      composer1.use(
        // @ts-expect-error response is not in current output union
        layer1,
      );
    });
  });
});
