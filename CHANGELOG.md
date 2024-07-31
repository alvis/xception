# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# 6.0.0 (2024-07-31)


### ✨ Features

* support browser environment ([02274d3](https://github.com/alvis/xception/commit/02274d323b6c45c31ee4d4f1df7d15b86e188a90))


### 🐛 Bug Fixes

* parse a stack without entry ([e0987aa](https://github.com/alvis/xception/commit/e0987aa172941c61b877f41096429c2dd7ee7443))
* render source with path starting with file:// ([c693241](https://github.com/alvis/xception/commit/c69324132e76e82057e21df7af0864fc83755fe2))


### 🚨 Tests

* fix false positive result due to ansi color ([608757a](https://github.com/alvis/xception/commit/608757a21b2e7b3fced9e677777879b0521092c3))


### ⚙️ Continuous Integrations

* refactor workflows and test node v21 ([3430eb3](https://github.com/alvis/xception/commit/3430eb31d86d14ef6968276ed99b6c712f705c7c))
* use pnpm in favor of npm ([5411a7e](https://github.com/alvis/xception/commit/5411a7ea52c210e08889610f06348c2f2e69af72))


### ♻️ Chores

* add missing types export ([f77be97](https://github.com/alvis/xception/commit/f77be9714977561673238bbddd8cf50d6cbb98d5))
* make the package published as ESM only ([8b2035e](https://github.com/alvis/xception/commit/8b2035eac9e6f4ef7654f57645950e2171a48d97))
* update dependencies to latest versions ([46a1888](https://github.com/alvis/xception/commit/46a18884c7338325bf03a2a24122065634ba0b7a))
* update presetter to v5 with vitest ([9d3b246](https://github.com/alvis/xception/commit/9d3b246e202dbb81d3e0d4630686b6fcbd7eb21f))



# 5.0.0 (2024-05-17)


### ✨ Features

* always return an error with xception ([1704ffe](https://github.com/alvis/xception/commit/1704ffecdf7669d885346d14787f510131e107fd))


### 🐛 Bug Fixes

* attach original cause in xception ([13055bc](https://github.com/alvis/xception/commit/13055bc748cc54037ab1ccf707ed663a56f233de))
* merge tags uniquely ([f9f0b61](https://github.com/alvis/xception/commit/f9f0b61559a61d59748a2a494369c5389a0d8495))
* stringify exception as much as possible ([2f034a2](https://github.com/alvis/xception/commit/2f034a2b12e5c4535df5f518c66abc62f8e6ce93))


### ♻️ Chores

* **release:** 5.0.0 ([b21610f](https://github.com/alvis/xception/commit/b21610f99b5ddea50eea7c7142aab8f4a1637a16))


### Breaking changes

* xception will no longer throw an error with non-error exception



# 4.1.0 (2024-01-13)


### ✨ Features

* introduce a factory option in xception ([9f9d002](https://github.com/alvis/xception/commit/9f9d0029a5b556015b13131b59c259531268bdfd))


### 📚 Documentation

* update security badge ([b72cd3f](https://github.com/alvis/xception/commit/b72cd3f26d5bccca4f1a339f1d41856eb6a38f5f))


### ⚙️ Continuous Integrations

* release with provenance statements ([a7b5c04](https://github.com/alvis/xception/commit/a7b5c049d62f3fc488fda674690cfa4e79b7602e))
* update github actions ([1659d55](https://github.com/alvis/xception/commit/1659d557c59204ee5fc8ca7f06bac957e73f1183))


### ♻️ Chores

* **release:** 4.1.0 ([f6de8ef](https://github.com/alvis/xception/commit/f6de8efa8a3f13b486b13913aef4820e33d17fb3))



# 4.0.0 (2023-10-21)


### ✨ Features

* add a render shorthand to Xception ([32e518b](https://github.com/alvis/xception/commit/32e518b3dcdf748a416d5b184e9b6f858151e3c5))
* add a showStack option to renderError ([41d47c2](https://github.com/alvis/xception/commit/41d47c2d2d352c9788c72414ecec0105b8f541a1))
* improve renderer for various kind of error ([c4486c8](https://github.com/alvis/xception/commit/c4486c8c8f68d3cbfdd85527f9340035ee12887b))
* provide a helper for detecting error-like object ([b66213a](https://github.com/alvis/xception/commit/b66213a72f731bf4a56318583ec31ed47488c8f8))
* provide a helper to prepare a printable object ([2f6ef46](https://github.com/alvis/xception/commit/2f6ef46d67c456d4e7e0bd2f255fb66dfd535202))
* provide symbols to be used for accessing private properties ([70f5661](https://github.com/alvis/xception/commit/70f5661f7718e0a55a5ac3320ffb057be74ef6c5))


### 🐛 Bug Fixes

* correct the typing for yamlify-object ([af97ff4](https://github.com/alvis/xception/commit/af97ff49e48a5cb0ea5fa715105528353b9dbcb4))
* remove potential unnecessary trailing spaces ([32bdc5e](https://github.com/alvis/xception/commit/32bdc5e8896ed5d3c5a246f130d886948fa229c0))


### 🛠 Builds

* make scripts accept individual paths for tests ([6ee653b](https://github.com/alvis/xception/commit/6ee653bc9c25d71f30e00f7ae86791b96b67926a))
* update presetter to v4.4 ([7743abf](https://github.com/alvis/xception/commit/7743abff7a7db617f1b9016a3d5b70b1812e0119))


### 📦 Code Refactoring

* convert renderAssociations to functional ([58b2b38](https://github.com/alvis/xception/commit/58b2b38982736b9f8e02d1c4189d399e92d2bed3))


### 🚨 Tests

* correct typos ([7542862](https://github.com/alvis/xception/commit/7542862a1c24459348b8b14d35c277d43d9f61b0))


### ♻️ Chores

* **release:** 4.0.0 ([97d640b](https://github.com/alvis/xception/commit/97d640b31e3881ddf7205964986a31106ca6437b))



# 3.0.0 (2023-09-20)


### 📦 Code Refactoring

* rename renderStack to renderError ([f742ddb](https://github.com/alvis/xception/commit/f742ddb554beea680a0c3684c075dc5915dbb0e9))


### ♻️ Chores

* **release:** 3.0.0 ([4510a5f](https://github.com/alvis/xception/commit/4510a5f49a962570b731dd09adb1203f936c5050))


### 💎 Styles

* move public methods to the top of files ([08d4476](https://github.com/alvis/xception/commit/08d447645ada44d226da4df0923895f21c937571))
* reword test descriptions to the convention ([4964a4a](https://github.com/alvis/xception/commit/4964a4aff95c8aafd80d3b371685a3b215e58590))


### Breaking changes

* renderStack is now renderError



# 2.0.0 (2023-09-20)


### ✨ Features

* add a helper to transform any error to an xception error ([10dcc29](https://github.com/alvis/xception/commit/10dcc2907d9afed71838dccc347cdb1690b833c9))


### 🛠 Builds

* publish as a dual commonjs/esm package ([d3caeff](https://github.com/alvis/xception/commit/d3caeffbccb3f855398b7cfaa78997ae7023aa0f))


### 📦 Code Refactoring

* rearrange the code to reduce cognitive complexity ([6c9cad7](https://github.com/alvis/xception/commit/6c9cad73d58119e203311715813171e702ede884))


### ⚙️ Continuous Integrations

* update Github Actions workflow files ([e789d26](https://github.com/alvis/xception/commit/e789d266e1ea036bbe74d1962cea405bdf9f40b0))


### ♻️ Chores

* **release:** 2.0.0 ([ece5641](https://github.com/alvis/xception/commit/ece5641774cf8d9cd0b3727978a2835d6dbeb71c))
* upgrade presetter to v4 ([18e6328](https://github.com/alvis/xception/commit/18e6328e8db3bb7bba6607bbc4201a81f51eb8d8))


### Breaking changes

* Support on node 12 & 14 are dropped



# 1.0.0 (2021-01-01)


### ✨ Features

* add metadata support ([8147763](https://github.com/alvis/xception/commit/81477638c290717b1834ad9219bf94c395146121))
* add namespace support ([5857138](https://github.com/alvis/xception/commit/5857138ad3cbe8c88709c8584f969aa7d196fe29))
* add tag support ([f93e942](https://github.com/alvis/xception/commit/f93e942aee301702614b79e6ef070329229aa093))
* display source among stack ([ab3a7d3](https://github.com/alvis/xception/commit/ab3a7d397d75eab7273c655ae3f41997deac63c0))
* filter stack by path ([0aa7af6](https://github.com/alvis/xception/commit/0aa7af61d09ac3d101c3ed8e83830a7265430528))
* provide a stack analyser ([78d7aab](https://github.com/alvis/xception/commit/78d7aabe85a6ee83bfb041c234c2557e5a6444d3))
* provide a stack renderer ([141aa0f](https://github.com/alvis/xception/commit/141aa0f6da3e61f4960647bad48fa5e09a5255cd))
* provide an extendable custom error class ([647efe6](https://github.com/alvis/xception/commit/647efe62aa4648fd2f321ea5c1cbab246d79eef2))


### 📚 Documentation

* give an overview of xception ([275c305](https://github.com/alvis/xception/commit/275c3051e272f9e555f58b6941d5313ae1de84d4))


### ♻️ Chores

* **release:** 1.0.0 ([5123609](https://github.com/alvis/xception/commit/5123609aaa19360c876e30762981e4a678a8e84a))



# [5.0.0](https://github.com/alvis/xception/compare/v4.1.0...v5.0.0) (2024-05-17)


### ✨ Features

* always return an error with xception ([1704ffe](https://github.com/alvis/xception/commit/1704ffecdf7669d885346d14787f510131e107fd))


### 🐛 Bug Fixes

* attach original cause in xception ([13055bc](https://github.com/alvis/xception/commit/13055bc748cc54037ab1ccf707ed663a56f233de))
* merge tags uniquely ([f9f0b61](https://github.com/alvis/xception/commit/f9f0b61559a61d59748a2a494369c5389a0d8495))
* stringify exception as much as possible ([2f034a2](https://github.com/alvis/xception/commit/2f034a2b12e5c4535df5f518c66abc62f8e6ce93))


### Breaking changes

* xception will no longer throw an error with non-error exception



# [4.1.0](https://github.com/alvis/xception/compare/v4.0.0...v4.1.0) (2024-01-13)


### ✨ Features

* introduce a factory option in xception ([9f9d002](https://github.com/alvis/xception/commit/9f9d0029a5b556015b13131b59c259531268bdfd))


### 📚 Documentation

* update security badge ([b72cd3f](https://github.com/alvis/xception/commit/b72cd3f26d5bccca4f1a339f1d41856eb6a38f5f))


### ⚙️ Continuous Integrations

* release with provenance statements ([a7b5c04](https://github.com/alvis/xception/commit/a7b5c049d62f3fc488fda674690cfa4e79b7602e))
* update github actions ([1659d55](https://github.com/alvis/xception/commit/1659d557c59204ee5fc8ca7f06bac957e73f1183))



# [4.0.0](https://github.com/alvis/xception/compare/v3.0.0...v4.0.0) (2023-10-21)


### ✨ Features

* add a render shorthand to Xception ([32e518b](https://github.com/alvis/xception/commit/32e518b3dcdf748a416d5b184e9b6f858151e3c5))
* add a showStack option to renderError ([41d47c2](https://github.com/alvis/xception/commit/41d47c2d2d352c9788c72414ecec0105b8f541a1))
* improve renderer for various kind of error ([c4486c8](https://github.com/alvis/xception/commit/c4486c8c8f68d3cbfdd85527f9340035ee12887b))
* provide a helper for detecting error-like object ([b66213a](https://github.com/alvis/xception/commit/b66213a72f731bf4a56318583ec31ed47488c8f8))
* provide a helper to prepare a printable object ([2f6ef46](https://github.com/alvis/xception/commit/2f6ef46d67c456d4e7e0bd2f255fb66dfd535202))
* provide symbols to be used for accessing private properties ([70f5661](https://github.com/alvis/xception/commit/70f5661f7718e0a55a5ac3320ffb057be74ef6c5))


### 🐛 Bug Fixes

* correct the typing for yamlify-object ([af97ff4](https://github.com/alvis/xception/commit/af97ff49e48a5cb0ea5fa715105528353b9dbcb4))
* remove potential unnecessary trailing spaces ([32bdc5e](https://github.com/alvis/xception/commit/32bdc5e8896ed5d3c5a246f130d886948fa229c0))


### 🛠 Builds

* make scripts accept individual paths for tests ([6ee653b](https://github.com/alvis/xception/commit/6ee653bc9c25d71f30e00f7ae86791b96b67926a))
* update presetter to v4.4 ([7743abf](https://github.com/alvis/xception/commit/7743abff7a7db617f1b9016a3d5b70b1812e0119))


### 📦 Code Refactoring

* convert renderAssociations to functional ([58b2b38](https://github.com/alvis/xception/commit/58b2b38982736b9f8e02d1c4189d399e92d2bed3))


### 🚨 Tests

* correct typos ([7542862](https://github.com/alvis/xception/commit/7542862a1c24459348b8b14d35c277d43d9f61b0))



# [3.0.0](https://github.com/alvis/xception/compare/v2.0.0...v3.0.0) (2023-09-20)


### 📦 Code Refactoring

* rename renderStack to renderError ([f742ddb](https://github.com/alvis/xception/commit/f742ddb554beea680a0c3684c075dc5915dbb0e9))


### 💎 Styles

* move public methods to the top of files ([08d4476](https://github.com/alvis/xception/commit/08d447645ada44d226da4df0923895f21c937571))
* reword test descriptions to the convention ([4964a4a](https://github.com/alvis/xception/commit/4964a4aff95c8aafd80d3b371685a3b215e58590))


### Breaking changes

* renderStack is now renderError



# [2.0.0](https://github.com/alvis/xception/compare/v1.0.0...v2.0.0) (2023-09-20)


### ✨ Features

* add a helper to transform any error to an xception error ([10dcc29](https://github.com/alvis/xception/commit/10dcc2907d9afed71838dccc347cdb1690b833c9))


### 🛠 Builds

* publish as a dual commonjs/esm package ([d3caeff](https://github.com/alvis/xception/commit/d3caeffbccb3f855398b7cfaa78997ae7023aa0f))


### 📦 Code Refactoring

* rearrange the code to reduce cognitive complexity ([6c9cad7](https://github.com/alvis/xception/commit/6c9cad73d58119e203311715813171e702ede884))


### ⚙️ Continuous Integrations

* update Github Actions workflow files ([e789d26](https://github.com/alvis/xception/commit/e789d266e1ea036bbe74d1962cea405bdf9f40b0))


### ♻️ Chores

* upgrade presetter to v4 ([18e6328](https://github.com/alvis/xception/commit/18e6328e8db3bb7bba6607bbc4201a81f51eb8d8))


### Breaking changes

* Support on node 12 & 14 are dropped



# 1.0.0 (2021-01-08)


### ✨ Features

* add metadata support ([8147763](https://github.com/alvis/xception/commit/81477638c290717b1834ad9219bf94c395146121))
* add namespace support ([5857138](https://github.com/alvis/xception/commit/5857138ad3cbe8c88709c8584f969aa7d196fe29))
* add tag support ([f93e942](https://github.com/alvis/xception/commit/f93e942aee301702614b79e6ef070329229aa093))
* display source among stack ([ab3a7d3](https://github.com/alvis/xception/commit/ab3a7d397d75eab7273c655ae3f41997deac63c0))
* filter stack by path ([0aa7af6](https://github.com/alvis/xception/commit/0aa7af61d09ac3d101c3ed8e83830a7265430528))
* provide a stack analyser ([78d7aab](https://github.com/alvis/xception/commit/78d7aabe85a6ee83bfb041c234c2557e5a6444d3))
* provide a stack renderer ([141aa0f](https://github.com/alvis/xception/commit/141aa0f6da3e61f4960647bad48fa5e09a5255cd))
* provide an extendable custom error class ([647efe6](https://github.com/alvis/xception/commit/647efe62aa4648fd2f321ea5c1cbab246d79eef2))


### 📚 Documentation

* give an overview of xception ([275c305](https://github.com/alvis/xception/commit/275c3051e272f9e555f58b6941d5313ae1de84d4))
