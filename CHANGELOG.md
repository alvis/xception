# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
