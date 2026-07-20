<div align="center">

<img src="./logo.svg" alt="xception logo" width="220" />

# xception

[![npm](https://img.shields.io/npm/dm/xception?style=flat-square)](https://www.npmjs.com/package/xception)
[![build](https://img.shields.io/github/actions/workflow/status/alvis/xception/main.yaml?branch=master&style=flat-square)](https://github.com/alvis/xception/actions/workflows/main.yaml)
[![dependencies](https://img.shields.io/librariesio/release/npm/xception?style=flat-square)](https://libraries.io/npm/xception)
[![license](https://img.shields.io/github/license/alvis/xception.svg?style=flat-square)](https://github.com/alvis/xception/blob/master/LICENSE)

**Handle exceptions smart** — context-preserving, chainable, serializable errors for TypeScript.

_Lightweight error handling with metadata embedding, namespace categorization, tag inheritance, and JSON round-tripping._

</div>

> 🎨 **Need beautiful error rendering?** Colorized stack traces, syntax-highlighted source code, and YAML metadata display are available in the companion package [**sher.log**](https://github.com/alvis/sher.log).

---

## ⚡ Quick Start

```bash
# npm
npm install xception
# pnpm
pnpm add xception
# yarn
yarn add xception
```

```ts
import { Xception } from 'xception';

throw new Xception('Payment failed', {
  severity: 'error',
  code: 'billing:payment_failed',
  namespace: 'billing',
  meta: { orderId: 'ORD-123', amount: 99.99 },
  tags: ['payment', 'retryable'],
});
```

### With Custom Error Classes

```ts
class DatabaseError extends Xception {
  constructor(query: string, cause: unknown) {
    super('Database query failed', {
      cause,
      severity: 'error',
      code: 'app:database_query_failed',
      namespace: 'app:database',
      meta: { query, retryable: true },
      tags: ['database', 'recoverable'],
    });
  }
}

try {
  // Your database operation
  throw new Error('Connection timeout');
} catch (error) {
  const dbError = new DatabaseError('SELECT * FROM users', error);
  console.log(JSON.stringify(dbError.toJSON(), null, 2));
}
// {
//   "severity": "error",
//   "code": "app:database_query_failed",
//   "namespace": "app:database",
//   "name": "DatabaseError",
//   "message": "Database query failed",
//   "stack": "DatabaseError: Database query failed\n    at ...",
//   "cause": { "message": "Connection timeout", "name": "Error", ... },
//   "meta": { "query": "SELECT * FROM users", "retryable": true },
//   "tags": ["database", "recoverable"]
// }
```

---

## ✨ Why Xception?

### 😩 The Problem

Standard JavaScript errors lose context as they propagate:

- **Context vanishes**: `throw new Error('Query failed')` — which query? what parameters? what user?
- **Chains break**: Wrapping errors with `new Error('...')` discards the original stack trace
- **No structure**: `JSON.stringify(new Error('fail'))` gives you `{}` — useless for logging pipelines
- **No categorization**: No standardized way to tag, namespace, or filter errors

### 💡 The Solution

Xception preserves everything:

- **🎯 Context preserved**: Attach `meta` with runtime state at the point of failure
- **🔗 Chains maintained**: `cause` property links errors into full causality chains (TC39 aligned)
- **📊 JSON-ready**: `toJSON()` and `fromJSON()` round-trip error graphs for structured logging and replay
- **🏷️ Categorized**: `namespace` and `tags` let you filter, route, and aggregate errors
- **🚦 Routable**: `severity` and `code` support machine-readable handling, alerting, and i18n
- **📦 Lightweight**: Minimal footprint with a single types-only dependency

---

## 🚀 Key Features

| Feature                | Xception | Standard Error | Why It Matters                               |
| ---------------------- | -------- | -------------- | -------------------------------------------- |
| **Context Embedding**  | ✅       | ❌             | Capture runtime state when errors occur      |
| **Error Chaining**     | ✅       | Partial        | Maintain full causality with upstream errors |
| **Metadata Support**   | ✅       | ❌             | Embed any context for debugging              |
| **Namespace & Tags**   | ✅       | ❌             | Categorize errors for filtering              |
| **Severity & Code**    | ✅       | ❌             | Route, classify, and translate errors        |
| **JSON Serialization** | ✅       | ❌             | Ready for structured logging and monitoring  |
| **Tag Inheritance**    | ✅       | ❌             | Tags propagate through cause chains          |
| **Circular-safe**      | ✅       | ❌             | Handles circular references in serialization |
| **TypeScript-first**   | ✅       | Partial        | Full type safety with generics               |

**Core Benefits:**

- **🔍 Debug faster**: Context-aware errors reduce investigation time — see exactly what went wrong and where
- **🎯 Find root causes**: Full error chains show the complete causality from origin to surface
- **🛡️ Production-ready**: Structured serialization for monitoring tools like Datadog, Sentry, and ELK
- **📊 Smart logging**: Tag and namespace-based filtering for different environments

---

## 📖 Usage Examples

### Basic Error Wrapping

```ts
import { Xception } from 'xception';

try {
  // Some operation that fails
  throw new Error('Network timeout');
} catch (cause) {
  throw new Xception('API request failed', {
    cause,
    severity: 'warning',
    code: 'api:network_timeout',
    namespace: 'api:client',
    meta: { endpoint: '/users', timeout: 5000 },
    tags: ['network', 'retryable'],
  });
}
```

### Custom Error Hierarchies

```ts
// Build a typed hierarchy for your domain
class AppError<
  Meta extends Record<string, unknown> = Record<string, unknown>,
> extends Xception<Meta> {}

class DatabaseError extends AppError<{
  query: string;
  retryable: boolean;
}> {
  constructor(query: string, cause: unknown) {
    super('Database query failed', {
      cause,
      severity: 'error',
      code: 'app:database_query_failed',
      namespace: 'app:database',
      meta: { query, retryable: true },
      tags: ['database', 'recoverable'],
    });
  }
}

class ValidationError extends AppError<{
  field: string;
  value: unknown;
  timestamp: number;
}> {
  constructor(field: string, value: unknown) {
    super(`Validation failed for field: ${field}`, {
      namespace: 'validation',
      severity: 'warning',
      code: 'validation:invalid_field',
      meta: { field, value, timestamp: Date.now() },
      tags: ['validation', 'user-error'],
    });
  }
}

// Narrow with instanceof
try {
  await queryDatabase(sql);
} catch (error) {
  if (error instanceof DatabaseError) {
    // Access typed metadata
    console.log(error.meta); // { query: '...', retryable: true }
    console.log(error.tags); // ['database', 'recoverable']
  }
}
```

### Factory-Generated Error Classes

Use `createXceptionClass()` when you want typed subclasses with class-level defaults and `instanceof` support across duplicated package installations:

```ts
import { Xception, createXceptionClass } from 'xception';

const NotFoundError = createXceptionClass<{ resource: string }>(
  'NotFoundError',
  {
    code: 'app:not_found',
    severity: 'warning',
  },
);

const UserNotFoundError = createXceptionClass<{ userId: string }>(
  'UserNotFoundError',
  {
    base: NotFoundError,
    code: 'app:user_not_found',
  },
);

const error = new UserNotFoundError('User not found', {
  meta: { userId: '42' },
});

console.log(error instanceof Xception); // true
console.log(error instanceof NotFoundError); // true
console.log(error instanceof UserNotFoundError); // true
console.log(error.severity); // 'warning'
console.log(error.code); // 'app:user_not_found'
```

### Tag Inheritance

Tags automatically propagate and deduplicate through cause chains:

```ts
const inner = new Xception('disk full', {
  tags: ['infrastructure', 'retryable'],
});

const outer = new Xception('Write failed', {
  cause: inner,
  tags: ['storage'],
});

console.log(outer.tags);
// ['infrastructure', 'retryable', 'storage'] — inherited + deduplicated
```

### Severity and Code

Severity defaults to `error`. It inherits through `Xception` cause chains unless you explicitly override it. Codes stay local to the error that declares them.

```ts
const inner = new Xception('Token expired', {
  severity: 'warning',
  code: 'auth:token_expired',
});

const outer = new Xception('Request rejected', {
  cause: inner,
  code: 'api:request_rejected',
});

console.log(outer.severity); // 'warning'
console.log(outer.code); // 'api:request_rejected'
```

### Error Conversion with `xception()`

Convert any thrown value into an Xception — preserving the original message, name, and stack:

```ts
import { xception } from 'xception';

try {
  JSON.parse('invalid json');
} catch (error) {
  throw xception(error, {
    namespace: 'parser:json',
    meta: { source: 'user-input' },
    tags: ['parsing', 'recoverable'],
  });
}
```

### Custom Factory Pattern

Use the `factory` option to produce your own Xception subclass from `xception()`:

```ts
class HttpError extends Xception {}

const originalError = new Error('Request failed');
const error = xception(originalError, {
  namespace: 'http',
  factory: (message, options) => new HttpError(message, options),
});

error instanceof HttpError; // true
```

### Structured Logging Integration

```ts
import { Xception } from 'xception';

function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const wrapped =
    error instanceof Xception
      ? error
      : new Xception(error.message, { cause: error, namespace: 'http' });

  // toJSON() gives you a complete, circular-safe JSON object
  logger.error(wrapped.toJSON());

  res.status(500).json({ error: wrapped.message });
}
```

### Rehydrating Serialized Errors

Reconstruct structured payloads from other services or log replays back into live `Xception` instances:

```ts
import { Xception, createXceptionClass } from 'xception';

const AuthError = createXceptionClass('AuthError', {
  namespace: 'auth',
});

const payload = new AuthError('Authentication failed').toJSON();
const revived = Xception.fromJSON(payload, {
  reviver: (json, defaults) =>
    json.name === 'AuthError'
      ? new AuthError(json.message as string, defaults)
      : undefined,
});

console.log(revived instanceof Xception); // true
console.log(revived instanceof AuthError); // true when revived by the reviver
console.log(revived.cause); // recursively reconstructed
```

---

## 🔧 API Reference

### Class: `Xception`

```ts
new Xception<Meta>(message: string, options?: XceptionOptions<Meta>)
```

```ts
interface XceptionOptions<
  Meta extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Upstream error to be embedded */
  cause?: unknown;
  /** Error namespace (e.g., 'app:database') */
  namespace?: string;
  /** Context data for debugging */
  meta?: Meta;
  /** Additional associations for filtering */
  tags?: string[];
  /** Severity for routing and alerting */
  severity?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  /** Machine-readable error code */
  code?: number | string;
}
```

#### Properties

| Property    | Type                            | Description                                                 |
| ----------- | ------------------------------- | ----------------------------------------------------------- |
| `cause`     | `unknown`                       | The upstream error                                          |
| `namespace` | `string \| undefined`           | Component identifier                                        |
| `meta`      | `Meta`                          | Embedded context data                                       |
| `tags`      | `string[]`                      | Associated tags (inherited + deduplicated from cause chain) |
| `severity`  | `Severity`                      | Alerting and routing level                                  |
| `code`      | `number \| string \| undefined` | Machine-readable error identifier                           |

#### Methods

| Method     | Returns      | Description                              |
| ---------- | ------------ | ---------------------------------------- |
| `toJSON()` | `JsonObject` | Serialize the entire error graph to JSON |

#### Static Methods

| Method                         | Returns    | Description                               |
| ------------------------------ | ---------- | ----------------------------------------- |
| `fromJSON(json, options?)`     | `Xception` | Rehydrate a serialized error graph to runtime instances |

```ts
interface FromJSONOptions {
  /** Custom factory for producing subclasses */
  reviver?: (
    json: JsonObject,
    defaults: XceptionOptions,
  ) => Xception | undefined;
  /** Max cause chain depth (default: 50) */
  maxDepth?: number;
}
```

`Xception.fromJSON()` expects a non-null object with a string `message`. Missing or invalid optional fields fall back to sensible defaults:

- `name` defaults to `'Xception'`
- `meta` defaults to `{}`
- `tags` defaults to `[]`
- `severity` defaults to `'error'`
- `code` defaults to `undefined`

Cause reconstruction rules:

- object `cause` values are recursively deserialized as `Xception`
- string `cause` values become `new Error(cause)`
- missing, `null`, or unsupported cause shapes are dropped
- recursive deserialization is truncated after `maxDepth` levels

When a `reviver` is provided, it is called cause-first for every object in the chain. Return a subclass instance to preserve domain-specific `instanceof` checks, or return `undefined` to fall back to the base `Xception` constructor.

`Xception.fromJSON()` throws `TypeError` when the root or a nested object does not contain a string `message`, or when a reviver returns a value that is not an `Xception`.

### Function: `createXceptionClass()`

Create a branded `Xception` subclass with cascading defaults and cross-package `instanceof` support:

```ts
function createXceptionClass<
  Meta extends Record<string, unknown> = Record<string, unknown>,
>(
  name: string,
  options?: CreateXceptionClassOptions<Meta>,
): XceptionConstructor<Meta> & {
  readonly brand: symbol;
};

type XceptionConstructor<
  Meta extends Record<string, unknown> = Record<string, unknown>,
> = new (
  message: string,
  options?: XceptionOptions<Meta>,
) => Xception<Meta>;

interface CreateXceptionClassOptions<
  Meta extends Record<string, unknown> = Record<string, unknown>,
> extends XceptionOptions<Meta> {
  base?: XceptionConstructor<any>;
}
```

Class-level `options` become defaults for each instance. Subclasses created with `base` inherit their parent defaults unless they override them, and per-instance options always win. `meta` is replaced rather than deep-merged so each class keeps a clear typed metadata contract.

### Function: `xception()`

Convert any value to an Xception instance, preserving the original error's message, name, and stack:

```ts
function xception<
  Meta extends Record<string, unknown> = Record<string, unknown>,
>(exception: unknown, options?: Options<Meta>): Xception<Meta>;

type Options<Meta extends Record<string, unknown>> = {
  namespace?: string;
  meta?: Meta;
  tags?: string[];
  severity?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  code?: number | string;
  /** Custom factory for producing Xception subclasses */
  factory?: (
    message: string,
    options: XceptionOptions<Meta>,
  ) => Xception<Meta>;
};
```

When the input is already an `Xception`, metadata is **merged** (new meta overrides existing keys), tags are **deduplicated**, severity is **inherited unless explicitly overridden**, and code is **not inherited**. Note that `xception()` unwraps an existing Xception — the new instance's `cause` points to the original's upstream cause, not the Xception itself.

### Function: `jsonify()`

Recursively convert any value to a JSON-serializable structure. Handles circular references automatically with `[circular reference as <path>]` labels:

```ts
function jsonify(value: unknown): JsonValue;
```

### Function: `isErrorLike()`

Type guard that checks if a value has the shape of an Error (has `message`, optional `name` and `stack`):

```ts
function isErrorLike(value: unknown): value is ErrorLike;

type ErrorLike =
  | Error
  | {
      message: string;
      name?: string;
      stack?: string;
      [key: string | symbol]: unknown;
    };
```

### Symbols

These symbols provide direct access to Xception's protected internals. They exist so that companion packages (like [sher.log](https://github.com/alvis/sher.log)) can read Xception properties without requiring subclassing:

| Symbol       | Description            |
| ------------ | ---------------------- |
| `$namespace` | Access error namespace |
| `$tags`      | Access error tags      |
| `$cause`     | Access error cause     |
| `$meta`      | Access error metadata  |
| `$severity`  | Access error severity  |
| `$code`      | Access error code      |

---

## 🌐 Compatibility & Size

| Requirement       | Value                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------- |
| **Node.js**       | ≥ 18.18                                                                                   |
| **TypeScript**    | 5.x+                                                                                      |
| **Module format** | ESM only                                                                                  |
| **Browsers**      | Modern browsers                                                                           |
| **Dependencies**  | [`type-fest`](https://github.com/sindresorhus/type-fest) (types only — zero runtime cost) |

The package is tree-shakeable. Import only what you use — unused exports are eliminated by bundlers.

---

## ⚔️ Alternatives

| Feature                | xception                                          | [verror](https://www.npmjs.com/package/verror) | [pretty-error](https://www.npmjs.com/package/pretty-error) | [ono](https://www.npmjs.com/package/ono) |
| ---------------------- | ------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **Error chaining**     | ✅                                                | ✅                                             | ❌                                                         | ✅                                       |
| **Context / meta**     | ✅                                                | ❌                                             | ❌                                                         | ❌                                       |
| **Namespace & tags**   | ✅                                                | ❌                                             | ❌                                                         | ❌                                       |
| **JSON serialization** | ✅                                                | ❌                                             | ❌                                                         | ❌                                       |
| **TypeScript-first**   | ✅                                                | ❌                                             | ❌                                                         | ✅                                       |
| **Rendering**          | Via [sher.log](https://github.com/alvis/sher.log) | ❌                                             | ✅                                                         | ❌                                       |
| **Active maintenance** | ✅                                                | ❌                                             | ❌                                                         | Limited                                  |

**When to choose what:**

- **xception** — When you need rich error context, chaining, and structured serialization for production logging
- **Standard Error + cause** — When you only need basic chaining (built-in since Node 16.9)
- **pretty-error** — When you only need prettier console output without structured data

---

## 🔌 Ecosystem

xception is designed as a focused core with companion packages for extended functionality. The rendering layer was intentionally separated to keep the core lightweight.

| Package                                           | Description                                                                            |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [**xception**](https://github.com/alvis/xception) | Context-aware error handling — metadata, chaining, serialization (this package)        |
| [**sher.log**](https://github.com/alvis/sher.log) | Beautiful error rendering — colorized stack traces, source code display, YAML metadata |

The exported symbols (`$namespace`, `$tags`, `$cause`, `$meta`, `$severity`, `$code`) exist specifically for companion packages to access Xception's protected internals without requiring subclassing.

---

## 🏗️ Advanced Features

### Error Chain Traversal

Walk the full cause chain programmatically:

```ts
let current: unknown = error;
while (current instanceof Xception) {
  console.log(current.namespace, current.message);
  current = current.cause;
}
```

### Circular Reference Safety

`jsonify()` and `toJSON()` handle circular references gracefully — no `JSON.stringify` crashes:

```ts
const meta: Record<string, unknown> = { key: 'value' };
meta.self = meta; // circular!

const error = new Xception('fail', { meta });
console.log(error.toJSON());
// meta.self → "[circular reference as .]"
```

### Tag Deduplication

When chaining errors, tags are automatically merged and deduplicated:

```ts
const inner = new Xception('root cause', { tags: ['infra', 'retryable'] });
const outer = new Xception('wrapper', {
  cause: inner,
  tags: ['retryable', 'critical'], // 'retryable' already exists on inner
});

console.log(outer.tags);
// ['infra', 'retryable', 'critical'] — no duplicates
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

1. **Fork & Clone**: `git clone https://github.com/alvis/xception.git`
2. **Install**: `pnpm install`
3. **Develop**: `pnpm test:watch` for development mode
4. **Test**: `pnpm test && pnpm lint`
5. **Submit**: Create a pull request

**Code Style:**

- [Conventional Commits](https://conventionalcommits.org/)
- ESLint + Prettier enforced
- 100% test coverage required

---

## 🛡️ Security

Found a vulnerability? Please email [alvis@hilbert.space](mailto:alvis@hilbert.space) with details.
We aim to respond within 48 hours and patch as quickly as possible.

---

## 🛠️ Troubleshooting

| Issue                                     | Solution                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **TypeScript errors**                     | Ensure TypeScript 5.x+ and `"moduleResolution": "bundler"` or `"node16"` in tsconfig                        |
| **Cannot import (CJS)**                   | xception v9 is ESM-only; use dynamic `import()` in CommonJS or migrate to ESM                               |
| **Tags not inherited**                    | Tag inheritance only works when `cause` is an `Xception` instance, not a plain `Error`                      |
| **`toJSON()` missing properties**         | Only metadata in `meta` is serialized; use `meta` for custom data, not ad-hoc error properties              |
| **Circular references in meta**           | `jsonify()` handles circular refs automatically with `[circular reference as <path>]`                       |
| **`xception()` changes error class name** | `xception()` preserves the original error's `name` and `stack` — this is intentional for debugging accuracy |

### ❓ FAQ

**Does xception replace the native Error `cause`?**
No. It aligns with the TC39 Error Cause proposal but adds namespace, meta, tags, and serialization on top.

**Can I use xception in the browser?**
Yes — it works in any modern JavaScript environment that supports ESM. Rendering via sher.log is Node.js focused.

**Is `type-fest` a runtime dependency?**
No. It provides TypeScript types only. There is zero runtime cost.

More help: [GitHub Issues](https://github.com/alvis/xception/issues) · [Discussions](https://github.com/alvis/xception/discussions)

---

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and migration guides.

---

## 📄 License

**MIT** © 2020-2026 [Alvis HT Tang](https://github.com/alvis)

Free for personal and commercial use. See [LICENSE](LICENSE) for details.

---

<div align="center">

**[⭐ Star on GitHub](https://github.com/alvis/xception)** · **[📦 View on npm](https://www.npmjs.com/package/xception)** · **[📖 Documentation](https://github.com/alvis/xception#readme)**

_Built for developers who refuse to lose context when things go wrong._

</div>
