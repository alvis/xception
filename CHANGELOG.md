# Changelog

All notable changes to this project will be documented in this file.
# 9.0.0 (2026-07-20)


### ♻️ Chores

* update logo and documentation (2894683)
* drop node 18 & 20 support (8519003)
* update pnpm & presetter (5cb42e1)


### ⚙️ Continuous Integrations

* remove depreciated code climate (0af3a22)
* consolidate CI pipeline (4f1a22f)


### ✨ Features

* add severity and code support (49268da)
* add cross-realm xception instance detection (8518cf9)
* add typed metadata (87ef9f5)
* add branded xception subclass factory (81f19bc)
* add Xception.fromJSON deserialization (d8d1d5c)


### 🐞 Bug Fixes

* update dependencies (f777385)


### 💎 Styles

* standardize jsdoc format (78a127e)


### 📚 Documentation

* update README.md documentation (964c95a)


### 📦 Code Refactoring

* extract rendering into companion package sher.log (e1097ff)
# 8.0.1 (2025-08-06)


### ♻️ Chores

* update @types/node (361fb6e)
* remove unused code (b6da176)
* upgrade presetter to v8 (981335e)


### ⚙️ Continuous Integrations

* add node 24 to test matrix (eff5390)


### 📚 Documentation

* update vulnerabilities badge (0bab172)


### 📦 Code Refactoring

* remove outdated highlight-es dependency (2382285)
# 8.0.0 (2025-06-24)


### ♻️ Chores

* update pnpm to v10.7 (bb857c8)
* update presetter to v7 (642b027)
* update symbols use subpath import (bc9bdfe)


### ⚙️ Continuous Integrations

* add node 22 & 23 to the test matrix (6009a4f)


### ✨ Features

* support inline source map (057294f)
* add a render shortcut to Xception (4a862b3)
* use platform-specific content handlers (7d9e845)


### 💎 Styles

* resolve linting issue (4686834)
* replace match() with exec() for consistency (1dd06ff)


### 📚 Documentation

* update README (f12d583)


### 📦 Code Refactoring

* rename variables for clarity (4253b13)
* simplify regexes in stack.ts (1ac8fd6)
* enhance isErrorLike's readability (0c76cb3)


### 🚨 Tests

* enforce BDD conventions on test files (a6ed55c)
# 7.0.0 (2024-11-30)


### ♻️ Chores

* update pnpm to v9.14 (c36d1ea)


### 🐞 Bug Fixes

* opt for default export in package.json (e4bc4c6)
* make render function standalone (188f13b)


### 📦 Code Refactoring

* replace yamlify-object with yaml (e7cfbd5)
# 6.0.0 (2024-07-31)


### ♻️ Chores

* add missing types export (f77be97)
* make the package published as ESM only (8b2035e)
* update dependencies to latest versions (46a1888)
* update presetter to v5 with vitest (9d3b246)


### ⚙️ Continuous Integrations

* refactor workflows and test node v21 (3430eb3)
* use pnpm in favor of npm (5411a7e)


### ✨ Features

* support browser environment (02274d3)


### 🐞 Bug Fixes

* parse a stack without entry (e0987aa)
* render source with path starting with file:// (c693241)


### 🚨 Tests

* fix false positive result due to ansi color (608757a)
# 5.0.0 (2024-05-17)


### refector

* rename prototype to base (34ae52b)


### ✨ Features

* always return an error with xception (1704ffe)


### 🐞 Bug Fixes

* stringify exception as much as possible (2f034a2)
* merge tags uniquely (f9f0b61)
* attach original cause in xception (13055bc)
# 4.1.0 (2024-01-13)


### ⚙️ Continuous Integrations

* update github actions (1659d55)
* release with provenance statements (a7b5c04)


### ✨ Features

* introduce a factory option in xception (9f9d002)


### 📚 Documentation

* update security badge (b72cd3f)
# 4.0.0 (2023-10-21)


### ✨ Features

* provide a helper for detecting error-like object (b66213a)
* provide a helper to prepare a printable object (2f6ef46)
* provide symbols to be used for accessing private properties (70f5661)
* improve renderer for various kind of error (c4486c8)
* add a showStack option to renderError (41d47c2)
* add a render shorthand to Xception (32e518b)


### 🐞 Bug Fixes

* correct the typing for yamlify-object (af97ff4)
* remove potential unnecessary trailing spaces (32bdc5e)


### 📚 Documentation

* update README for the latest changes (b62e933)


### 📦 Code Refactoring

* convert renderAssociations to functional (58b2b38)


### 🚨 Tests

* correct typos (7542862)


### 🛠 Builds

* make scripts accept individual paths for tests (6ee653b)
* update presetter to v4.4 (7743abf)
# 3.0.0 (2023-09-20)


### 💎 Styles

* move public methods to the top of files (08d4476)
* reword test descriptions to the convention (4964a4a)


### 📦 Code Refactoring

* rename renderStack to renderError (f742ddb)
# 2.0.0 (2023-09-20)


### ♻️ Chores

* upgrade presetter to v4 (18e6328)


### ⚙️ Continuous Integrations

* update Github Actions workflow files (e789d26)


### ✨ Features

* add a helper to transform any error to an xception error (10dcc29)


### 📦 Code Refactoring

* rearrange the code to reduce cognitive complexity (6c9cad7)


### 🛠 Builds

* publish as a dual commonjs/esm package (d3caeff)
# 1.0.0 (2021-01-01)


### init

* layout the foundation for the project (c84313c)


### ✨ Features

* provide a stack analyser (78d7aab)
* provide an extendable custom error class (647efe6)
* provide a stack renderer (141aa0f)
* display source among stack (ab3a7d3)
* add metadata support (8147763)
* add namespace support (5857138)
* add tag support (f93e942)
* filter stack by path (0aa7af6)


### 📚 Documentation

* give an overview of xception (275c305)
