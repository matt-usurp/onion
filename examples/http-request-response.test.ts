import type { Layer, Output, Terminus } from '../src/index';
import { Composer, output } from '../src/index';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The initial request that would be given from the platform or server.
 * In this case, we receive just the body which is typed as a string.
 */
type TestInitialRequest = {
  readonly body: string;
};

/**
 * The expected (and initial) repsonse that the platform or server is expecting.
 * In this case, a status code with a body typed as a string.
 */
type TestInitialResponse = Output<'http', {
  readonly status: number;
  readonly body: string;
}>;

// --
// -- Request Decoder Layer
// --

/**
 * New request properties that will be supplied when the {@link TestDecodeRequest} layer is used.
 * We use the generic {@link T} to allow the usage to define the decoded state, making this layer generic.
 * Better approaches here would be to use a schema validator also, but this is an example.
 */
type TestRequestDecoded<T> = {
  readonly decoded: T;
};

/**
 * We make use of {@link LayerClass} to define an interface we can extend.
 * This is done to lessen the code duplication as we need this a few more times.
 */
type TestDecodeRequestLayer<T> = Layer.Class<TestInitialRequest, any, TestRequestDecoded<T>, any>;

/**
 * Our layer implementation.
 */
class TestDecodeRequest<T> implements TestDecodeRequestLayer<T> {
  /**
   * {@inheritdoc}
   */
  public async invoke(
    input: Layer.Input<TestDecodeRequestLayer<T>>,
    next: Layer.Next<TestDecodeRequestLayer<T>>,
  ): Layer.Output<TestDecodeRequestLayer<T>> {
    return next({
      ...input,

      decoded: JSON.parse(input.body) as T,
    });
  }
}

// --
// -- Better Response Layer
// --

/**
 * New "better" response, our {@link TestBetterResponse} will allow this to be provided by future calls in the stack.
 * Here we make use of the generic {@link T} to enforce a structured response which the layer will convert to JSON for us.
 */
type TestResponseBetter<T> = Output<'http:decoded', {
  readonly status: number;
  readonly body: T;
}>;

/**
 * Same as before, we define locally so we can reduce code duplication.
 */
type TestBetterResponseLayer<T> = Layer.Class<any, TestInitialResponse, any, TestResponseBetter<T>>;

/**
 * Our layer implementation.
 */
class TestBetterResponse<T> implements TestBetterResponseLayer<T> {
  /**
   * {@inheritdoc}
   */
  public async invoke(
    input: Layer.Input<TestBetterResponseLayer<T>>,
    next: Layer.Next<TestBetterResponseLayer<T>>,
  ): Layer.Output<TestBetterResponseLayer<T>> {
    const response = await next(input);

    if (response.type === 'http:decoded') {
      return output<TestInitialResponse>('http', {
        status: response.value.status,
        body: JSON.stringify(response.value.body),
      });
    }

    return response;
  }
}

// --
// -- Terminus
// --

/**
 * A type we will be using with the {@link TestRequestDecoded} we defined above.
 */
type TestRequestData = {
  readonly name: string;
  readonly age: number;
};

/**
 * A type we will be using with the {@link TestResponseBetter} we defined above.
 */
type TestResponseData = {
  readonly sentence: string;
};

/**
 * Same as previously, we define locally so we can reduce code duplication.
 */
type TestRequestHandlerTerminus = Terminus.Class<TestRequestDecoded<TestRequestData>, TestResponseBetter<TestResponseData>>;

/**
 * Our terminus implementation.
 */
class TestRequestHandler implements TestRequestHandlerTerminus {
  /**
   * {@inheritdoc}
   */
  public async invoke(input: Terminus.Input<TestRequestHandlerTerminus>): Terminus.Output<TestRequestHandlerTerminus> {
    return output<TestResponseBetter<TestResponseData>>('http:decoded', {
      status: 1,

      body: {
        sentence: `Hello ${input.decoded.name}, you are ${input.decoded.age} years old`,
      },
    });
  }
}

// --
// -- Tests
// --

describe('example, http-request-response', (): void => {
  it('with basic, request parser, response parser and request handler', async (): Promise<void> => {
    const composition = Composer.create<TestInitialRequest, TestInitialResponse>()
      .use(new TestDecodeRequest<TestRequestData>())
      .use(new TestBetterResponse<TestResponseData>())
      .end(new TestRequestHandler());

    expect(
      await composition.invoke({
        body: JSON.stringify({
          name: 'Jason',
          age: 28,
        }),
      }),
    ).toStrictEqual<TestInitialResponse>({
      type: 'http',
      value: {
        status: 1,
        body: JSON.stringify({
          sentence: 'Hello Jason, you are 28 years old',
        }),
      },
    });
  });
});
