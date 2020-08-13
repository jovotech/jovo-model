# Jovo Model

💬 A language model abstraction layer that works across NLU providers

![Jovo Model for Alexa, Dialogflow, Rasa NLU, Microsoft LUIS](./img/jovo-model.png)

> Learn more about the Jovo Model format here: [jovo.tech/docs/model](https://www.jovo.tech/docs/model)


## Installation

```sh
$ npm install jovo-model
```

## Platforms

The Jovo Model supports the following NLU providers (see the [`packages` folder](https://github.com/jovotech/jovo-model/tree/master/packages))
* Amazon Alexa (built-in NLU)
* Amazon Lex
* Dialogflow
* Microsoft LUIS
* Rasa NLU
* NLP.js

Each platform implements the following methods of the `jovo-model` core package:

```TypeScript
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


## Usage

### Convert between different Models

With the help of the Jovo Model it is easily possible to convert the data from
one Language-Model to another.


#### Jovo Model -> 3rd Party Platform like Alexa

```TypeScript
import { NativeFileInformation } from 'jovo-model';
import { JovoModelAlexa } from 'jovo-model-alexa';

const jovoModelInstance = new JovoModelAlexa();
const jovoModelData = '...';
const locale = 'en-US';
jovoModelInstance.importJovoModel(jovoModelData, locale);
const alexaModelFiles = jovoModelInstance.exportNative();
```

#### 3rd Party Platform like Alexa -> Jovo Model

```TypeScript
import { NativeFileInformation } from 'jovo-model';
import { JovoModelAlexa } from 'jovo-model-alexa';

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

#### 3rd Party Platform Alexa -> 3rd Party Platform DialogFlow


```TypeScript
import { NativeFileInformation } from 'jovo-model';
import { JovoModelAlexa } from 'jovo-model-alexa';
import { JovoModelDialogflow } from 'jovo-model-dialogflow';

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

### Update Model

The Jovo Model also allows to easily extract, manipulate and delete data.

For a full list of methods check: [JovoModel.ts](jovo-model/src/JovoModel.ts)

```TypeScript
import { NativeFileInformation } from 'jovo-model';
import { JovoModelDialogflow } from 'jovo-model-dialogflow';

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
