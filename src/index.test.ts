import { MockedFunction, MockedObject } from 'vitest';
import { Composer, ComposerKind, Layer, LayerClass, LayerFunction, Output, OutputConstraint, Terminus, TerminusClass, TerminusFunction, output } from './index';

export type TestBaseInput = {
  readonly id: string;
  readonly name: string;
  readonly random: number;
};

export type TestBaseOutput = Output<'o:test:status', {
  readonly status: number;
}>;

const createTerminusClassMock = <
  T extends Terminus<A, B>,
  A = T extends Terminus<infer I, any> ? I : never,
  B extends OutputConstraint = T extends Terminus<any, infer I> ? I : never,
>(): MockedObject<TerminusClass<A, B>> => {
  return {
    invoke: vi.fn(),
  } as unknown as MockedObject<TerminusClass<A, B>>;
};

const createTerminusFunctionMock = <
  T extends Terminus<A, B>,
  A = T extends Terminus<infer I, any> ? I : never,
  B extends OutputConstraint = T extends Terminus<any, infer I> ? I : never,
>(): MockedFunction<TerminusFunction<A, B>> => {
  return vi.fn() as MockedFunction<TerminusFunction<A, B>>;
};

const createLayerClassMock = <
  T extends Layer<A, B, C, D>,
  A = T extends Layer<infer I, any, any, any> ? I : never,
  B extends OutputConstraint = T extends Layer<any, infer I, any, any> ? I : never,
  C = T extends Layer<any, any, infer I, any> ? I : never,
  D extends OutputConstraint = T extends Layer<any, any, any, infer I> ? I : never,
>(): MockedObject<LayerClass<A, B, C, D>> => {
  return {
    invoke: vi.fn(),
  } as unknown as MockedObject<LayerClass<A, B, C, D>>;
};

const createLayerFunctionMock = <
  T extends Layer<A, B, C, D>,
  A = T extends Layer<infer I, any, any, any> ? I : never,
  B extends OutputConstraint = T extends Layer<any, infer I, any, any> ? I : never,
  C = T extends Layer<any, any, infer I, any> ? I : never,
  D extends OutputConstraint = T extends Layer<any, any, any, infer I> ? I : never,
>(): MockedFunction<LayerFunction<A, B, C, D>> => {
  return vi.fn() as MockedFunction<LayerFunction<A, B, C, D>>;
};

const assertInputType = <T, X extends T>() => { };
const assertOutputType = <T extends X, X>() => { };

type InferComposerCurrentInput<T extends ComposerKind> = T extends Composer<infer I, any, any, any> ? I : never;
type InferComposerCurrentOutput<T extends ComposerKind> = T extends Composer<any, infer I, any, any> ? I : never;

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
        })
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
        })
      );
    });

    it('with layer, pass through, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerClassMock<Layer<any, any, any, any>>();

      layer1.invoke.mockImplementationOnce((input, next) => {
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
        })
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
        })
      );
    });

    it('with layer, expecting exact current input, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerClassMock<Layer<TestBaseInput, any, any, any>>();

      layer1.invoke.mockImplementationOnce((input, next) => {
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
        })
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
        })
      );
    });

    it('with layer, expecting subset of the current input, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type layerCurrentSubsetInput = {
        readonly id: string;
      };

      const layer1 = createLayerClassMock<Layer<layerCurrentSubsetInput, any, any, any>>();

      layer1.invoke.mockImplementationOnce((input, next) => {
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
        })
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
        })
      );
    });

    it('with layer, providing new input, merges with current input', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce((input, next) => {
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
        })
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
        })
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
        })
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
        })
      );
    });

    it('with layer, providing new input, terminus expecting new input, merges with current input and allows terminus', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce((input, next) => {
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
        })
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
        })
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
        })
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
        })
      );
    });

    it('with layers, first providing new input, second expecting new input, merges with current input and allows second layer', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerClassMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce((input, next) => {
        return next(input);
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Layer

      const layer2 = createLayerClassMock<Layer<NewInputWithAuthentication, any, any, any>>();

      layer2.invoke.mockImplementationOnce((input, next) => {
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
        })
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
        })
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

      layer2.invoke.mockImplementationOnce((input, next) => {
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
        })
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
        })
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
          })
        );

        const composition = composer1.end(
          // @ts-expect-error missing expected property "authenticated"
          terminus
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
          })
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
          })
        );

        const composition = composer1.end(
          // @ts-expect-error expected response is not in current output union
          terminus
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
          })
        );
      });

      it('with layer, expected input does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = {
          readonly authenticated: boolean;
        };

        const layer1 = createLayerClassMock<Layer<NewOutputWithAuthentication, any, any, any>>();

        layer1.invoke.mockImplementationOnce((input, next) => {
        return next(input);
      });

        const composer2 = composer1.use(
          // @ts-expect-error missing expected property "authenticated"
          layer1
        );

        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          })
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
          })
        );
      });

      it('with layer, expected output does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        const layer1 = createLayerClassMock<Layer<any, NewOutputWithAuthentication, any, any>>();

        layer1.invoke.mockImplementationOnce((input, next) => {
        return next(input);
      });

        const composer2 = composer1.use(
          // @ts-expect-error response is not in current output union
          layer1
        );

        // -- Terminus

        const terminus = createTerminusClassMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          })
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
          })
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
        })
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
        })
      );
    });

    it('with layer, pass through, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerFunctionMock<Layer<any, any, any, any>>();

      layer1.mockImplementationOnce((input, next) => {
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
        })
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
        })
      );
    });

    it('with layer, expecting exact current input, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerFunctionMock<Layer<TestBaseInput, any, any, any>>();

      layer1.mockImplementationOnce((input, next) => {
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
        })
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
        })
      );
    });

    it('with layer, expecting subset of the current input, makes no changes', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type layerCurrentSubsetInput = {
        readonly id: string;
      };

      const layer1 = createLayerFunctionMock<Layer<layerCurrentSubsetInput, any, any, any>>();

      layer1.mockImplementationOnce((input, next) => {
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
        })
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
        })
      );
    });

    it('with layer, providing new input, merges with current input', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.mockImplementationOnce((input, next) => {
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
        })
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
        })
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
        })
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
        })
      );
    });

    it('with layer, providing new input, terminus expecting new input, merges with current input and allows terminus', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.mockImplementationOnce((input, next) => {
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
        })
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
        })
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
        })
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
        })
      );
    });

    it('with layers, first providing new input, second expecting new input, merges with current input and allows second layer', async (): Promise<void> => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerFunctionMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.mockImplementationOnce((input, next) => {
        return next(input);
      });

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Layer

      const layer2 = createLayerFunctionMock<Layer<NewInputWithAuthentication, any, any, any>>();

      layer2.mockImplementationOnce((input, next) => {
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
        })
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
        })
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

      layer2.mockImplementationOnce((input, next) => {
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
        })
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
        })
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
          })
        );

        const composition = composer1.end(
          // @ts-expect-error missing expected property "authenticated"
          terminus
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
          })
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
          })
        );

        const composition = composer1.end(
          // @ts-expect-error expected response is not in current output union
          terminus
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
          })
        );
      });

      it('with layer, expected input does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = {
          readonly authenticated: boolean;
        };

        const layer1 = createLayerFunctionMock<Layer<NewOutputWithAuthentication, any, any, any>>();

        layer1.mockImplementationOnce((input, next) => {
        return next(input);
      });

        const composer2 = composer1.use(
          // @ts-expect-error missing expected property "authenticated"
          layer1
        );

        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          })
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
          })
        );
      });

      it('with layer, expected output does not exist, raises build errors', async (): Promise<void> => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = Output<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        const layer1 = createLayerFunctionMock<Layer<any, NewOutputWithAuthentication, any, any>>();

        layer1.mockImplementationOnce((input, next) => {
        return next(input);
      });

        const composer2 = composer1.use(
          // @ts-expect-error response is not in current output union
          layer1
        );

        // -- Terminus

        const terminus = createTerminusFunctionMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.mockResolvedValueOnce(
          output('o:test:status', {
            status: 123,
          })
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
          })
        );
      });
    });
  });
});
