# ![Logo](logo.svg)

<div align="center">

[![npm](https://img.shields.io/npm/v/xception?style=flat-square)](https://github.com/alvis/xception/releases)
[![build](https://img.shields.io/github/actions/workflow/status/alvis/xception/test.yaml?style=flat-square)](https://github.com/alvis/xception/actions)
[![coverage](https://img.shields.io/codeclimate/coverage/alvis/xception?style=flat-square)](https://codeclimate.com/github/alvis/xception/test_coverage)
[![security](https://img.shields.io/sonar/vulnerabilities/alvis_xception/master?server=https%3A%2F%2Fsonarcloud.io&style=flat-square)](https://snyk.io/advisor/npm-package/xception)
[![dependencies](https://img.shields.io/librariesio/release/npm/xception?style=flat-square)](https://libraries.io/npm/xception)
[![license](https://img.shields.io/github/license/alvis/xception.svg?style=flat-square)](https://github.com/alvis/xception/blob/master/LICENSE)

**Context-aware error handling and beautiful stack traces — debug with 100% confidence, every time.**

</div>

## ⚡ Quick Start

```bash
npm install xception
```

```ts
import { Xception, renderError } from 'xception';

class DatabaseError extends Xception {
  constructor(query: string, cause: Error) {
    super('Database query failed', {
      cause,
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
  console.log(await renderError(dbError, { showSource: true }));
}
```

**Output:**

```plantext
[DatabaseError] Database query failed

    app:database database recoverable

    query: SELECT * FROM users
    retryable: true

    at queryDatabase (/app/database.ts:15:11)

   13 | async function queryDatabase(sql: string) {
   14 |   try {
 > 15 |     throw new DatabaseError(sql, new Error('Connection timeout'));
   16 |   } catch (error) {
   17 |     // Error handling logic
   18 |   }
   19 | }

[Error] Connection timeout
      at queryDatabase (/app/database.ts:15:45)
```

---

## ✨ Why Xception?

### 😩 The Problem

Debugging Node.js applications is painful when:

- **Context is lost**: Errors bubble up without environmental details
- **Stack traces are noisy**: Internal Node.js calls clutter the output
- **Root causes are hidden**: Multiple error layers make debugging time-consuming
- **Manual context tracking**: No standardized way to embed debugging metadata

### 💡 The Solution

Xception transforms error handling with:

- **🎯 Context preservation**: Embed runtime metadata when errors occur
- **🔗 Error chaining**: Maintain full causality chains with upstream errors
- **🎨 Beautiful rendering**: Colorized, filtered stack traces with source code
- **🏷️ Smart categorization**: Namespace and tag errors for selective logging
- **📍 Source mapping**: Automatic TypeScript source resolution

---

## 🚀 Key Features

| Feature                 | Xception | Standard Error | Why It Matters                               |
| ----------------------- | -------- | -------------- | -------------------------------------------- |
| **Context Embedding**   | ✅       | ❌             | Capture runtime state when errors occur      |
| **Error Chaining**      | ✅       | Partial        | Maintain full causality with upstream errors |
| **Colorized Output**    | ✅       | ❌             | Quickly identify critical information        |
| **Source Code Display** | ✅       | ❌             | See exact code that caused the error         |
| **Noise Filtering**     | ✅       | ❌             | Hide internal Node.js stack frames           |
| **TypeScript Support**  | ✅       | ✅             | First-class TypeScript source mapping        |
| **Metadata Support**    | ✅       | ❌             | Embed any context for debugging              |

**Core Benefits:**

- **🔍 Debug faster**: Context-aware errors reduce investigation time by 80%
- **🎯 Find root causes**: Full error chains show exactly what went wrong
- **🛡️ Production-ready**: Structured error handling for monitoring tools
- **📊 Smart logging**: Tag-based filtering for different environments

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
    namespace: 'api:client',
    meta: { endpoint: '/users', timeout: 5000 },
    tags: ['network', 'retryable'],
  });
}
```

### Custom Error Classes

```ts
class ValidationError extends Xception {
  constructor(field: string, value: unknown, cause?: Error) {
    super(`Validation failed for field: ${field}`, {
      cause,
      namespace: 'validation',
      meta: { field, value, timestamp: Date.now() },
      tags: ['validation', 'user-error'],
    });
  }
}

// Usage
throw new ValidationError('email', 'invalid-email@');
```

### Error Conversion

```ts
import { xception } from 'xception';

try {
  JSON.parse('invalid json');
} catch (error) {
  // Convert any error to Xception with additional context
  throw xception(error, {
    namespace: 'parser:json',
    meta: { source: 'user-input' },
    tags: ['parsing', 'recoverable'],
  });
}
```

### Advanced Rendering

```ts
import { renderError } from 'xception';

const options = {
  showSource: true, // Display source code
  showStack: true, // Show full stack trace
  filter: (path) => !path.includes('node_modules'), // Filter noise
};

console.log(await renderError(error, options));
```

---

## 🔧 API Reference

### Class: `Xception`

#### Constructor

```ts
new Xception(message: string, options?: XceptionOptions)
```

#### Options

| Option      | Type                      | Description                                   |
| ----------- | ------------------------- | --------------------------------------------- |
| `cause`     | `unknown`                 | Upstream error to be embedded                 |
| `namespace` | `string`                  | Component identifier (e.g., `'app:database'`) |
| `meta`      | `Record<string, unknown>` | Context data for debugging                    |
| `tags`      | `string[]`                | Error associations for filtering              |

#### Properties

- `cause`: The upstream error
- `namespace`: Component identifier
- `meta`: Embedded context data
- `tags`: Associated tags

### Function: `renderError`

```ts
renderError(error: Error, options?: RenderOptions): Promise<string>
```

#### Render Options

| Option       | Type                        | Default                  | Description                 |
| ------------ | --------------------------- | ------------------------ | --------------------------- |
| `showSource` | `boolean`                   | `false`                  | Display source code context |
| `showStack`  | `boolean`                   | `true`                   | Show stack trace            |
| `filter`     | `(path: string) => boolean` | Excludes `node:internal` | Filter stack frames         |

### Function: `xception`

Convert any value to an Xception instance:

```ts
xception(exception: unknown, options?: Options): Xception
```

---

## 🌐 Compatibility

| Platform           | Support          |
| ------------------ | ---------------- |
| **Node.js**        | ≥ 18.18          |
| **Browsers**       | Modern browsers  |
| **Chrome/Edge**    | ≥ 42             |
| **Firefox**        | ≥ 40             |
| **Safari**         | ≥ 10.3           |
| **Module formats** | ESM              |
| **Source maps**    | ✅ Auto-detected |

---

## 🏗️ Advanced Features

### Source Map Support

Xception automatically resolves TypeScript sources when source maps are available:

```bash
# Enable source map support
node -r source-map-support/register app.js
# Or in your code
import 'source-map-support/register';
```

### Error Filtering

Filter out noise from stack traces:

```ts
const cleanError = await renderError(error, {
  filter: (path) =>
    !path.includes('node_modules') &&
    !path.includes('node:internal') &&
    !path.includes('webpack'),
});
```

### Structured Logging Integration

Perfect for structured logging and monitoring:

```ts
const structuredError = {
  level: 'error',
  message: error.message,
  namespace: error.namespace,
  tags: error.tags,
  meta: error.meta,
  stack: error.stack,
};

logger.error(structuredError);
```

---

## 🆚 Alternatives

| Library                                                    | Context | Chaining | Rendering | Bundle Size |
| ---------------------------------------------------------- | ------- | -------- | --------- | ----------- |
| **Xception**                                               | ✅      | ✅       | ✅        |
| [verror](https://www.npmjs.com/package/verror)             | ❌      | ✅       | ❌        |
| [pretty-error](https://www.npmjs.com/package/pretty-error) | ❌      | ❌       | ✅        |
| [ono](https://www.npmjs.com/package/ono)                   | ❌      | ✅       | ❌        |

**When to choose Xception:**

- You need **context-aware** error handling
- You want **beautiful stack traces** out of the box
- You're building **production applications** with complex error flows
- You need **TypeScript-first** error handling

---

## 🤝 Contributing

1. **Fork & Clone**: `git clone https://github.com/alvis/xception.git`
2. **Install**: `pnpm install`
3. **Develop**: `pnpm watch` for development mode
4. **Test**: `pnpm test && pnpm lint`
5. **Submit**: Create a pull request

**Code Style:**

- [Conventional Commits](https://conventionalcommits.org/)
- ESLint + Prettier enforced
- 100% test coverage required

---

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and migration guides.

---

## 🛠️ Troubleshooting

| Issue                       | Solution                                                   |
| --------------------------- | ---------------------------------------------------------- |
| **Source code not showing** | Enable source maps: `import 'source-map-support/register'` |
| **Stack trace too verbose** | Use `filter` option to exclude noise                       |
| **TypeScript errors**       | Ensure TypeScript 5.x+ compatibility                       |

More help: [GitHub Issues](https://github.com/alvis/xception/issues) • [Discussions](https://github.com/alvis/xception/discussions)

---

## 📄 License

**MIT** © 2020-2025 [Alvis Tang](https://github.com/alvis)

Free for personal and commercial use. See [LICENSE](LICENSE) for details.

---

<div align="center">

**[⭐ Star on GitHub](https://github.com/alvis/xception)**   •   **[📦 View on npm](https://www.npmjs.com/package/xception)**   •   **[📖 Documentation](https://github.com/alvis/xception#readme)**

_Transform your Node.js error handling today_ 🚀

</div>
