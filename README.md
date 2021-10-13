<p align="center">
  <img src=".github/aws-lambda-code-signing.png" alt="AWS Lambda Code Signing" width="50%>
</p>
<h1 style="font-size: 56px; margin: 0; padding: 0;" align="center">
  aws-lambda-code-signing-action
</h1>
<p align="center">
  <img src="https://badgen.net/badge/TypeScript/strict%20%F0%9F%92%AA/blue" alt="Strict TypeScript">
  <a href="http://commitizen.github.io/cz-cli/" alt="commitizen cli">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly">
  </a>
  <a href="https://snyk.io/test/github/clowdhaus/aws-lambda-code-signing-action">
    <img src="https://snyk.io/test/github/clowdhaus/aws-lambda-code-signing-action/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/clowdhaus/aws-lambda-code-signing-action">
  </a>
</p>
<p align="center">
  <a href="https://github.com/clowdhaus/aws-lambda-code-signing-action/actions?query=workflow%3Aintegration">
    <img src="https://github.com/clowdhaus/aws-lambda-code-signing-action/workflows/integration/badge.svg" alt="integration test">
  </a>
</p>

GitHub action which uses AWS Code Signer to sign 🔒 AWS Lambda artifacts 📦 from your pipeline.

## Usage

See the [AWS documenation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-codesigning.html) for all details related to code signing AWS Lambda artifacts.

```yml
- uses: clowdhaus/aws-lambda-code-signing-action/@main
  with:
    # TODO
```

## Getting Started

The following instructions will help you get setup for development and testing purposes.

### Prerequisites

#### [yarn](https://github.com/yarnpkg/yarn)

`yarn` is used to handle dependencies and executing scripts on the codebase.

See [here](https://yarnpkg.com/en/docs/install#debian-stable) for instructions on installing yarn on your local machine.

Once you have installed `yarn`, you can install the project dependencies by running the following command from within the project root directory:

```bash
  $ yarn
```

## Contributing

Please read [CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md) for details on our code of conduct and the process for submitting pull requests.

## Changelog

Please see the [CHANGELOG.md](CHANGELOG.md) for details on individual releases.
