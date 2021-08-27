# Jovo Model

![Jovo Model: NLU abstraction for Alexa, Dialogflow, Google Actions, Rasa NLU, Microsoft LUIS, and more](./img/jovo-model.png)

The Jovo Model is a language model abstraction layer that works across NLU providers. It allows you to maintain a language model in a single source of truth and then translate it into different platform schemas like Amazon Alexa, Google Assistant, Dialogflow, Rasa NLU, Microsoft LUIS, and more.

- [Introduction](#introduction)
- [Supported Platforms](#supported-platforms)
- [Model Structure](#model-structure)
- [Using the Jovo Model with the Jovo CLI](#using-the-jovo-model-with-the-jovo-cli)
  - [Models Folder](#models-folder)
  - [Build Folder](#build-folder)
- [Using the Jovo Model npm Packages](#using-the-jovo-model-npm-packages)
  - [Model Conversions](#model-conversions)
  - [Updating the Model](#updating-the-model)
- [Contributing](#contributing)


## Introduction

The Jovo Framework works with many different [platforms](https://www.jovo.tech/marketplace/tag/platforms) and [natural language understanding (NLU) providers](https://www.jovo.tech/marketplace/tag/nlu) that turn spoken or written language into structured meaning. Each of these services have their own schema that needs to be used to train their models. If you want to use more than one provider, designing maintaining the different language models can become a tedious task.

The Jovo Model enables you to store language model information in a single JSON file. For Jovo projects, you can find the language model files in the `/models` folder:

![Models Folder in a Jovo Project](./img/folder-structure-models.png "Models Folder in a Jovo Project" )

The Jovo Model is mainly used by the [Jovo CLI](https://www.jovo.tech/marketplace/jovo-cli)'s [`build` command](https://www.jovo.tech/marketplace/jovo-cli/build) which turns the files into platform specific models like Alexa Interaction Models and Dialogflow agents. These resulting models can then be deployed to the respective platforms and trained there. Learn more here: [Using the Jovo Model with the Jovo CLI](#using-the-jovo-model-with-the-jovo-cli).

We chose to open source this repository to provide more flexibility to Jovo users and tool providers. You can directly access the Jovo Model features from your code and make transformations yourself. Learn more here: [Using the Jovo Model npm Packages](#using-the-jovo-model-npm-packages).


## Supported Platforms

The Jovo Model supports the following NLU providers):

* [Amazon Alexa](./packages/jovo-model-alexa)
* [Amazon Lex](./packages/jovo-model-lex)
* [Google Dialogflow](./packages/jovo-modeldialogflow)
* [Google Assistant Conversational Actions](./packages/jovo-model-googleassistant)
* [Microsoft LUIS](./packages/jovo-model-luis)
* [Rasa NLU](./packages/jovo-model-rasa)
* [NLP.js](./packages/jovo-model-nlpjs)
* [Snips NLU](./packages/jovo-model-snips)

## Model Structure

[Learn more about the model schema here](./docs/model-schema.md).

## Using the Jovo Model with the Jovo CLI

In regular Jovo projects, the Jovo Model is translated into different NLU formats and then deployed by using the [Jovo CLI](https://www.jovo.tech/marketplace/jovo-cli).

The workflow consists of three elements:

* [`models` folder](#models-folder) that stores the Jovo Model files
* [`build` folder](#build-folder) that consists all generated files
* [`jovo.project.js` file](#project-configuration) that contains all project configuration


### Models Folder

The `models` folder contains all the language models. Each locale (like `en-US`, `de-DE`) has its own JSON file.


### Build Folder

The `build` folder includes all the information you need to deploy the project to the respective developer platforms like Amazon Alexa and Google Assistant.

At the beginning of a new project, the folder doesn't exist until you either import an existing platform project with [`jovo get`](https://www.jovo.tech/marketplace/jovo-cli/get), or create the files from the Jovo Model with [`jovo build`](https://www.jovo.tech/marketplace/jovo-cli/build).

We recommend to use the `jovo.project.js` file ([see the project configuration documentation here](https://github.com/jovotech/jovo-framework/blob/v4dev/docs/project-config.md)) as the single source of truth and add the `build` folder to the `.gitignore` to avoid conflicts (like Alexa Skill IDs) if you're working on a project with a team.


## Using the Jovo Model npm Packages

You can download the package like this:

```sh
$ npm install @jovotech/model
```


### Model Conversions

By using this package in your code, you can convert the data from one platform schema to another.

* [Jovo Model to Platform Schema](#jovo-model-to-platform-schema)
* [Platform Schema to Jovo Model](#platform-schema-to-jovo-model)
* [Platform Schema A to Platform Schema B](#platform-schema-a-to-platform-schema-b)

#### Jovo Model to Platform Schema

To turn a Jovo Model into a platform model like Alexa, you can do the following:

```javascript
import { NativeFileInformation } from '@jovotech/model';
import { JovoModelAlexa } from '@jovotech/model-alexa';

const jovoModelInstance = new JovoModelAlexa();
const jovoModelData = '...';
const locale = 'en-US';
jovoModelInstance.importJovoModel(jovoModelData, locale);
const alexaModelFiles = jovoModelInstance.exportNative();
```

#### Platform Schema to Jovo Model

If you want to turn a platform model like Alexa into the Jovo Model format, do this:

```javascript
import { NativeFileInformation } from '@jovotech/model';
import { JovoModelAlexa } from '@jovotech/model-alexa';

const jovoModelInstance = new JovoModelAlexa();
const alexaModelFiles: NativeFileInformation = [
    {
        path: [
            'fileName.json',
        ],
        content: '...',
    }
];
const locale = 'en-US';
jovoModelInstance.importNative(alexaModelFiles, locale);
const jovoModelData = jovoModelInstance.exportJovoModel();
```

#### Platform Schema A to Platform Schema B

You can also use the package to turn one platform schema into another, e.g. Alexa into Dialogflow:

```javascript
import { NativeFileInformation } from '@jovotech/model';
import { JovoModelAlexa } from '@jovotech/model-alexa';
import { JovoModelDialogflow } from '@jovotech/model-dialogflow';

const locale = 'en-US';

// Convert Alexa Model -> Jovo Model
const jovoModelInstanceAlexa = new JovoModelAlexa();
const alexaModelFiles: NativeFileInformation = [
    {
        path: [
            'fileName.json',
        ],
        content: '...',
    }
];
jovoModelInstanceAlexa.importNative(alexaModelFiles, locale);
const jovoModelData = jovoModelInstanceAlexa.exportJovoModel();

// Convert Jovo Model -> Dialogflow Model
const jovoModelInstanceDialogflow = new JovoModelDialogflow();
jovoModelInstance.importJovoModel(jovoModelData, locale);
const dialogflowModelFiles = jovoModelInstance.exportNative();
```

### Updating the Model

The Jovo Model also allows to extract, manipulate, and delete data.

```javascript
import { NativeFileInformation } from '@jovotech/model';
import { JovoModelDialogflow } from '@jovotech/model-dialogflow';

// Load the data into the Jovo-Model
const jovoModelInstance = new JovoModelDialogflow();
const alexaModelFiles: NativeFileInformation = [
    {
        path: [
            'fileName.json',
        ],
        content: '...',
    }
];
const locale = 'en-US';
jovoModelInstance.importNative(alexaModelFiles, locale);

const intent = jovoModelInstance.getIntentByName('MyNameIntent');
const phrases = jovoModelInstance.getPhrases(intent);
jovoModelInstance.removeIntent(intent);

// Export updated model

// As Jovo Model
const jovoModelData = jovoModelInstanceAlexa.exportJovoModel();

// As Dialogflow Model
const dialogflowModelFiles = jovoModelInstance.exportNative();
```


## Contributing

Feel free to add more NLU providers via pull requests. Each platform implements the following methods of the `@jovotech/model` core package:

```javascript
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
