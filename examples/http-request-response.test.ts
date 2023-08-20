import { Composer, LayerClass, MakeLayerInput, MakeLayerNext, MakeLayerOutput, MakeTerminusInput, MakeTerminusOutput, Output, TerminusClass } from '../src/index';

type TestRequest = {
  readonly body: string;
};

type TestResponse = Output<'http', {
  readonly status: number;
  readonly body: string;
}>;

type TestRequestDecoded<T> = {
  readonly decoded: T;
};

type TestResponseDecoded<T> = Output<'http:decoded', {
  readonly status: number;
  readonly body: T;
}>;

type TestDecodeRequestLayer<T> = LayerClass<TestRequest, any, TestRequestDecoded<T>, any>;

class TestDecodeRequest<T> implements TestDecodeRequestLayer<T> {
  public invoke(input: MakeLayerInput<TestDecodeRequestLayer<T>>, next: MakeLayerNext<TestDecodeRequestLayer<T>>): MakeLayerOutput<TestDecodeRequestLayer<T>> {
    return next({
      ...input,

      decoded: JSON.parse(input.body) as T,
    });
  };
}

type TestDecodeResponseLayer<T> = LayerClass<any, TestResponse, any, TestResponseDecoded<T>>;

class TestDecodeResponse<T> implements TestDecodeResponseLayer<T> {
  public invoke(input: MakeLayerInput<TestDecodeResponseLayer<T>>, next: MakeLayerNext<TestDecodeResponseLayer<T>>): MakeLayerOutput<TestDecodeResponseLayer<T>> {
    const response = next(input);

    if (response.type === 'http:decoded') {
      return {
        type: 'http',
        value: {
          status: response.value.status,
          body: JSON.stringify(response.value.body),
        },
      }
    }

    return response;
  };
}

type TestRequestData = {
  readonly name: string;
  readonly age: number;
};

type TestResponseData = {
  readonly sentence: string;
};

type TestRequestHandlerTerminus = TerminusClass<TestRequestDecoded<TestRequestData>, TestResponseDecoded<TestResponseData>>;

class TestRequestHandler implements TestRequestHandlerTerminus {
  public invoke(input: MakeTerminusInput<TestRequestHandlerTerminus>): MakeTerminusOutput<TestRequestHandlerTerminus> {
    return {
      type: 'http:decoded',
      value: {
        status: 1,
        body: {
          sentence: `Hello ${input.decoded.name}, you are ${input.decoded.age} years old`,
        },
      },
    }
  };
}

describe('example, http-request-response', (): void => {
  it('with basic, request parser, response parser and request handler', (): void => {
    const composition = Composer.create<TestRequest, TestResponse>()
      .use(new TestDecodeRequest<TestRequestData>())
      .use(new TestDecodeResponse<TestResponseData>())
      .end(new TestRequestHandler());

    expect(
      composition.invoke({
        body: JSON.stringify({
          name: 'Jason',
          age: 28,
        })
      })
    ).toStrictEqual<TestResponse>({
      type: 'http',
      value: {
        status: 1,
        body: JSON.stringify({
          sentence: 'Hello Jason, you are 28 years old',
        }),
      },
    })
  });
});
