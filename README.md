# Jovo Model

💬 A language model abstraction layer that works across NLU providers

> Learn more about the Jovo Model format here: [jovo.tech/docs/model](https://www.jovo.tech/docs/model)


## Installation

```sh
$ npm install jovo-model
```

## Platforms

The Jovo Model supports the following NLU providers (see the [`packages` folder](https://github.com/jovotech/jovo-model/tree/master/packages))
* Amazon Alexa (built-in NLU)
* Dialogflow
* Rasa NLU
* Microsoft LUIS
* Amazon Lex

Each platform implements the following methods of the `jovo-model` core package:

```js
/**
 * Converts native model files to JovoModel
 *
 * @param {NativeFileInformation[]} inputFiles The files in the native format
 * @param {string} locale The locale of the files
 * @returns {JovoModelData}
 * @memberof JovoModel
 */
static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
    // ...
}

/**
 * Converts JovoModel to native model files
 *
 * @param {JovoModel} model The JovoModel to convert
 * @param {string} locale The locale of the JovoModel
 * @returns {NativeFileInformation[]}
 * @memberof JovoModel
 */
static fromJovoModel(model: JovoModelData, locale: string): NativeFileInformation[] {
    // ...
}
```
