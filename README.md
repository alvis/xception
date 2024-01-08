# ![Logo](logo.svg)

<div align="center">

_Trace error with 100% confidence, quick and precise!_

•   [API](#api)   •   [About](#about)   •

</div>

#### Highlights

**One light-weighted utility**, xception enables you to create context-aware custom errors and render stack to locate the root of an issue swiftly.

_/ Error Tracing /_

- **Error Wrapping**: repack an error with a customizable error class and its context
- **Metadata Support**: embed the context into the error for better tracing
- **Namespace and Tag Support**: associate an error with tags for selective logging

_/ Stack Rendering /_

- **Flexible Filtering**: render a call stack without the noise from node's internal etc
- **Colorized Output**: debug in console with highlight on important information
- **Source Embedding**: display the logic where the error happened

## Motivation

Debugging is painful, especially when the problem of an error is rooted multiple levels below the surface.
Conventionally, one would check the call stack and look for the source of error.
But anyone with even little debugging experience knows that it's time-consuming and
often head-scratching when the context of the process environment (i.e. parameters) on each function call is unknown.

Currently, there is **no easy way to capture the full context only when an error happens**.
Logging everything is too noisy and difficult to handle,
and even fully powered error monitoring tools like [sentry](https://sentry.io) can't provide you with a full picture of what's going on.
When an error happens, it may be passed to somewhere else, and too often, the context is lost.

The design of Xception is to capture the full environmental context when an error happens.
You can simply rely on the `try {...} catch {...}` mechanism and repack the error with your custom error class together with the context.
Then you can capture the full trace of the error from the top level,
and either print it out on the console or send it to your error monitoring tool for a painless analysis.

---

## API

### Class: Xception extends Error

#### Constructor

▸ **new Xception(message: string, options?: XceptionOptions): Xception**

Create a custom error with a message and additional information to be embedded to the error.

| Parameter            | Type     | Description                                                                                          |
| -------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `message`            | string   | an error message for the error class                                                                 |
| `options.cause?`     | unknown  | an upstream error to be embedded to the new repacked error _(default: **`undefined`**)_              |
| `options.namespace?` | string   | an identifier of the component where the error occur _(default: **`undefined`**)_                    |
| `options.meta?`      | Object   | any context data you would like to embed to the error _(default: **`{}`**)_                          |
| `options.tags?`      | string[] | some associations of the error (e.g. user error) for selective logging purpose _(default: **`[]`**)_ |

#### Properties

| Name         | Type     | Description                                                |
| ------------ | -------- | ---------------------------------------------------------- |
| `cause?`     | unknown  | the upstream error specified during the error construction |
| `namespace?` | string   | the identifier of the component where the error occur      |
| `meta`       | Object   | the context where the error occur                          |
| `tags`       | string[] | a list of associations of the error                        |

#### _/ Example /_

```ts
import Xception from 'xception'; // import as the default or
// import { Xception } from 'xception'; // import as a component

class YourError extends Xception {
  constructor(cause: Error) {
    super('your error message', {
      cause,
      namespace: 'your_org:service_name:operation_name',
      tags: ['user_error', 'retryable'],
      meta: {
        id: 'some association with another component',
      },
    });
  }
}
```

#### Method: render

A shorthand for `renderError(this, options)` to generate a highly readable representation of the error with all of its upstream errors and contexts.

▸ **render(options?: RenderOptions): string**

See [`renderError`](#method-rendererror) for the details of the options.

---

### Method: renderError

Generate a highly readable representation of an error with all of its upstream errors and contexts.

▸ **renderError(error: Error, options?: RenderOptions): string**

| Parameter             | Type                      | Description                                                                                                                                           |
| --------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error`               | Error                     | the error of which the stack will be rendered                                                                                                         |
| `options.showSource?` | boolean                   | true to instructs the renderer to show the error source if available _(default: **`false`**)_                                                         |
| `options.showStack?`  | boolean                   | true to instructs the renderer to show the stack _(default: **`true`**)_                                                                              |
| `options.filter?`     | (path: string) => boolean | a function to determiner where a stack should be displayed according to its path _(default: **`(path: string) => !path.includes('node:internal')`)**_ |

**Note**: For a typescript project, if you want to show the original typescript source instead of the transpiled javascript, register the code with [`import 'source-map-support/register'`](https://www.npmjs.com/package/source-map-support), or run the equivalent `node -r source-map-support/register <code path>`.

#### _/ Example /_

```ts
import { log } from 'console';
import { renderStack } from 'xception';

function erroneous() {
  try {
    throw new Error('error from the upstream');
  } catch (cause) {
    throw new YourError('your error message', { cause });
  }
}

try {
  erroneous();
} catch (error) {
  log(
    renderError(error, {
      showSource: true,
      filter(path: string): boolean {
        return (
          !path.includes('node_modules') && !path.includes('node:internal')
        );
      },
    }),
  );
}
```

```plain
[YourError] your error message

    your_org:service_name:operation_name user_error retryable

    id: some association with another component

    at erroneous (/Users/Alvis/Repositories/xception/source/example.ts:23:11)

   19 | function erroneous() {
   20 |   try {
   21 |     throw new Error('error from the upstream');
   22 |   } catch (cause) {
 > 23 |     throw new YourError(cause);
   24 |   }
   25 | }
   26 |
   27 | try {

[Error] error from the upstream
    at erroneous (/Users/Alvis/Repositories/xception/source/example.ts:21:11)

   17 | import { renderStack } from './';
   18 |
   19 | function erroneous() {
   20 |   try {
 > 21 |     throw new Error('error from the upstream');
   22 |   } catch (cause) {
   23 |     throw new YourError(cause);
   24 |   }
   25 | }

    at Object.<anonymous> (/Users/Alvis/Repositories/xception/source/example.ts:28:3)
```

---

### Method: xception

Convert an error to an Xception instance with metadata merged, preserving the original error message and stack.

▸ **xception(exception: unknown, options?: Options): Xception**

| Parameter           | Type                                                      | Description                                                                                            |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `exception`         | unknown                                                   | a string, error, Xception, or object with a message property to be converted into an Xception instance |
| `options.meta`      | `Record<string, unknown>`                                 | metadata to be embedded in the error                                                                   |
| `options.namespace` | `string`                                                  | an identifier of the component where the error occurred                                                |
| `options.tags`      | `string[]`                                                | tags for associating the error with specific contexts or categories                                    |
| `options.factory`   | `(message: string, options: XceptionOptions) => Xception` | a custom factory function for creating `Xception` instances                                            |

#### _/ Example /_

```ts
import { xception } from 'xception';

try {
  throw new Error('original error message');
} catch (e) {
  // convert to Xception with additional metadata
  const customError = xception(error, {
    meta: { key: 'value' },
    namespace: 'namespace',
    tags: ['critical'],
    factory: (message, options) => new CustomXception(message, options),
  });

  throw customError;
}
```

This method allows for the transformation of existing errors into `Xception` instances, facilitating a unified approach to error handling and logging within applications.

---

## Know Issues & Limitations

- This package is designed to provide server-side debugging functionality only. It has not been tested on any web browsers.
- Running this package with node < 12 is known to have problems such as wrong line number reported. Upgrade to a higher version to avoid the issue if it is possible.

Got an idea for workarounds for these issues? [Let the community know.](https://github.com/xception/xception/issues/new)

## About

### Related Projects

- [baseerr](https://github.com/tjmehta/baseerr): merge another error with additional properties.
- [callsite-record](https://github.com/inikulin/callsite-record): create a fancy log entries for errors and function call sites.
- [callsites](https://github.com/sindresorhus/callsites): get callsites from the V8 stack trace API.
- [explain-error](https://github.com/dominictarr/explain-error): wrap an error with additional explanation.
- [error-wrapper](https://github.com/spudly/error-wrapper): merges the stack of another error to its own.
- [trace](https://github.com/AndreasMadsen/trace): create super long stack traces.
- [clarify](https://github.com/AndreasMadsen/clarify): remove node related stack trace noise.
- [pretty-error](https://github.com/AriaMinaei/pretty-error): make the call stacks clear.
- [ono](https://github.com/bigstickcarpet/ono): allow different types of error to be thrown.
- [ololog](https://github.com/xpl/ololog): another logger with a similar motivation but only support console.log as its sole transport.

### License

Copyright © 2020, [Alvis Tang](https://github.com/alvis). Released under the [MIT License](LICENSE).

[![npm](https://img.shields.io/npm/v/xception?style=flat-square)](https://github.com/alvis/xception/releases)
[![build](https://img.shields.io/github/actions/workflow/status/alvis/xception/test.yaml?style=flat-square)](https://github.com/alvis/xception/actions)
[![maintainability](https://img.shields.io/codeclimate/maintainability/alvis/xception?style=flat-square)](https://codeclimate.com/github/alvis/xception/maintainability)
[![coverage](https://img.shields.io/codeclimate/coverage/alvis/xception?style=flat-square)](https://codeclimate.com/github/alvis/xception/test_coverage)
[![security](https://img.shields.io/sonar/vulnerabilities/alvis_xception/master?server=https%3A%2F%2Fsonarcloud.io&style=flat-square)](https://snyk.io/advisor/npm-package/xception)
[![dependencies](https://img.shields.io/librariesio/release/npm/xception?style=flat-square)](https://libraries.io/npm/xception)
[![license](https://img.shields.io/github/license/alvis/xception.svg?style=flat-square)](https://github.com/alvis/xception/blob/master/LICENSE)
