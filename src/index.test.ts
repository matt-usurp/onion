import { MockedObject } from 'vitest';
import { Composer, ComposerKind, Kind, Layer, LayerKind, OutputKind, Terminus, TerminusKind } from './index';

export type TestBaseInput = {
  readonly id: string;
  readonly name: string;
  readonly random: number;
};

export type TestBaseOutput = Kind<'o:test:status', {
  readonly status: number;
}>;

const createOutput = <O extends OutputKind>(kind: O['$kind'], data: Omit<O, '$kind'>): O => {
  return {
    ...data,
    $kind: kind,
  } as O;
};

const createTerminusMock = <T extends TerminusKind>(): MockedObject<T> => {
  return {
    invoke: vi.fn(),
  } as unknown as MockedObject<T>;
};

const createLayerMock = <T extends LayerKind>(): MockedObject<T> => {
  return {
    invoke: vi.fn(),
  } as unknown as MockedObject<T>;
};

const assertInputType = <T, X extends T>() => { };
const assertOutputType = <T extends X, X>() => { };

type InferComposerCurrentInput<T extends ComposerKind> = T extends Composer<infer I, any, any, any> ? I : never;
type InferComposerCurrentOutput<T extends ComposerKind> = T extends Composer<any, infer I, any, any> ? I : never;

const TEST_BASE_INPUT: TestBaseInput = {
  id: 'test:id',
  name: 'test:name',
  random: 3,
};

const TEST_NEXT_PASSTHROUGH = (input: any, next: any) => next(input);

describe(Composer.name, (): void => {
  describe('using class style', (): void => {
    it('with terminus', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer1>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer1>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer1.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(0);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    it('with layer, pass through, makes no changes', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerMock<Layer<any, any, any, any>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    it('with layer, expecting exact current input, makes no changes', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      const layer1 = createLayerMock<Layer<TestBaseInput, any, any, any>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    it('with layer, expecting subset of the current input, makes no changes', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type layerCurrentSubsetInput = {
        readonly id: string;
      };

      const layer1 = createLayerMock<Layer<layerCurrentSubsetInput, any, any, any>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    it('with layer, providing new input, merges with current input', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer2.end(terminus);


      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    it('with layer, proving new response, unions with current response', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Kind<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    it('with layer, providing new input, terminus expecting new input, merges with current input and allows terminus', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<NewInputWithAuthentication, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    it('with layer, proving new response, terminus expects new response, unions with current response and allows terminus', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Kind<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:authenticated', {
          authenticated: false,
        })
      );

      const composition = composer2.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(1);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:authenticated', {
          authenticated: false,
        })
      );
    });

    it('with layers, first providing new input, second expecting new input, merges with current input and allows second layer', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewInputWithAuthentication = {
        readonly authenticated: boolean;
      };

      const layer1 = createLayerMock<Layer<any, any, NewInputWithAuthentication, any>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer2>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer2>>();

      // -- Layer

      const layer2 = createLayerMock<Layer<NewInputWithAuthentication, any, any, any>>();

      layer2.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer3 = composer2.use(layer2);
      //    ^?

      assertInputType<TestBaseInput, InferComposerCurrentInput<typeof composer3>>();
      assertInputType<NewInputWithAuthentication, InferComposerCurrentInput<typeof composer3>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer3.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(2);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(layer2.invoke).toBeCalledTimes(1);
      expect(layer2.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    it('with layers, first providing new response, second expecting new response, unions with current response and allows second layer', (): void => {
      const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

      // -- Layer

      type NewOutputWithAuthentication = Kind<'o:test:authenticated', {
        readonly authenticated: boolean;
      }>;

      const layer1 = createLayerMock<Layer<any, any, any, NewOutputWithAuthentication>>();

      layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer2 = composer1.use(layer1);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer2>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer2>>();

      // -- Layer

      const layer2 = createLayerMock<Layer<any, NewOutputWithAuthentication, any, any>>();

      layer2.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

      const composer3 = composer2.use(layer2);
      //    ^?

      assertOutputType<TestBaseOutput, InferComposerCurrentOutput<typeof composer3>>();
      assertOutputType<NewOutputWithAuthentication, InferComposerCurrentOutput<typeof composer3>>();

      // -- Terminus

      const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

      terminus.invoke.mockReturnValueOnce(
        createOutput('o:test:status', {
          status: 123,
        })
      );

      const composition = composer3.end(terminus);

      // -- Result

      expect(composition.layers.length).toStrictEqual(2);

      const result = composition.invoke(TEST_BASE_INPUT);

      expect(layer1.invoke).toBeCalledTimes(1);
      expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(layer2.invoke).toBeCalledTimes(1);
      expect(layer2.invoke).toBeCalledWith<[TestBaseInput, Function]>(
        TEST_BASE_INPUT,
        expect.any(Function),
      );

      expect(terminus.invoke).toBeCalledTimes(1);
      expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

      expect(result).toStrictEqual<OutputKind>(
        createOutput('o:test:status', {
          status: 123,
        })
      );
    });

    describe('for type only error cases', (): void => {
      it('with terminus, expected input does not exist, raises build errors', (): void => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Terminus

        type ExpectInput = {
          readonly authenticated: boolean;
        };

        const terminus = createTerminusMock<Terminus<ExpectInput, TestBaseOutput>>();

        terminus.invoke.mockReturnValueOnce(
          createOutput('o:test:status', {
            status: 123,
          })
        );

        const composition = composer1.end(
          // @ts-expect-error missing expected property "authenticated"
          terminus
        );

        // -- Result

        expect(composition.layers.length).toStrictEqual(0);

        const result = composition.invoke(TEST_BASE_INPUT);

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

        expect(result).toStrictEqual<OutputKind>(
          createOutput('o:test:status', {
            status: 123,
          })
        );
      });

      it('with terminus, expected output does not exist, raises build errors', (): void => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Terminus

        type NewOutputWithAuthentication = Kind<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        const terminus = createTerminusMock<Terminus<TestBaseInput, NewOutputWithAuthentication>>();

        terminus.invoke.mockReturnValueOnce(
          createOutput('o:test:authenticated', {
            authenticated: false,
          })
        );

        const composition = composer1.end(
          // @ts-expect-error expected response is not in current output union
          terminus
        );

        // -- Result

        expect(composition.layers.length).toStrictEqual(0);

        const result = composition.invoke(TEST_BASE_INPUT);

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

        expect(result).toStrictEqual<OutputKind>(
          createOutput('o:test:authenticated', {
            authenticated: false,
          })
        );
      });

      it('with layer, expected input does not exist, raises build errors', (): void => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = {
          readonly authenticated: boolean;
        };

        const layer1 = createLayerMock<Layer<NewOutputWithAuthentication, any, any, any>>();

        layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

        const composer2 = composer1.use(
          // @ts-expect-error missing expected property "authenticated"
          layer1
        );

        // -- Terminus

        const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockReturnValueOnce(
          createOutput('o:test:status', {
            status: 123,
          })
        );

        const composition = composer2.end(terminus);

        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = composition.invoke(TEST_BASE_INPUT);

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
          TEST_BASE_INPUT,
          expect.any(Function),
        );

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

        expect(result).toStrictEqual<OutputKind>(
          createOutput('o:test:status', {
            status: 123,
          })
        );
      });

      it('with layer, expected output does not exist, raises build errors', (): void => {
        const composer1 = Composer.create<TestBaseInput, TestBaseOutput>();

        // -- Layer

        type NewOutputWithAuthentication = Kind<'o:test:authenticated', {
          readonly authenticated: boolean;
        }>;

        const layer1 = createLayerMock<Layer<any, NewOutputWithAuthentication, any, any>>();

        layer1.invoke.mockImplementationOnce(TEST_NEXT_PASSTHROUGH);

        const composer2 = composer1.use(
          // @ts-expect-error response is not in current output union
          layer1
        );

        // -- Terminus

        const terminus = createTerminusMock<Terminus<TestBaseInput, TestBaseOutput>>();

        terminus.invoke.mockReturnValueOnce(
          createOutput('o:test:status', {
            status: 123,
          })
        );

        const composition = composer2.end(terminus);

        // -- Result

        expect(composition.layers.length).toStrictEqual(1);

        const result = composition.invoke(TEST_BASE_INPUT);

        expect(layer1.invoke).toBeCalledTimes(1);
        expect(layer1.invoke).toBeCalledWith<[TestBaseInput, Function]>(
          TEST_BASE_INPUT,
          expect.any(Function),
        );

        expect(terminus.invoke).toBeCalledTimes(1);
        expect(terminus.invoke).toBeCalledWith<[TestBaseInput]>(TEST_BASE_INPUT);

        expect(result).toStrictEqual<OutputKind>(
          createOutput('o:test:status', {
            status: 123,
          })
        );
      });
    });
  });
});
