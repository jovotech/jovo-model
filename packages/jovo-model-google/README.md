# Jovo Model: Google Assistant

Learn how to turn the Jovo Model into a Conversational Actions model for Google Assistant.

- [Introduction](#introduction)
- [Google Assistant-specific Elements in the Jovo Model](#google-assistant-specific-elements-in-the-jovo-model)
  - [Invocation](#invocation)
  - [Built-in Types](#built-in-types)
  - [Google Assistant-only Elements](#google-assistant-only-elements)
- [Using the Google Assistant Jovo Model with the Jovo CLI](#using-the-google-assistant-jovo-model-with-the-jovo-cli)
- [Using the Google Assistant Jovo Model npm Package](#using-the-google-assistant-jovo-model-npm-package)

## Introduction

Google Assistant Conversational Actions are a new way to build Google Actions that don't require [Dialogflow](./dialogflow.md) as NLU service. You can either manage the language models via API (what the [Jovo CLI](https://www.jovo.tech/marketplace/jovo-cli) is doing during deployment) or in the Actions Builder console, which offers a graphical user interface.

Learn more about the structure in the [official Conversational Actions documentation](https://developers.google.com/assistant/conversational/build/conversation?tool=sdk). The Jovo Model can be translated into this structure by using the [`jovo build` command](https://www.jovo.tech/marketplace/jovo-cli/build) ([see below](#using-the-google-assistant-jovo-model-with-the-jovo-cli)) or the npm package ([see below](#using-the-google-assistant-jovo-model-npm-package)).

## Google Assistant-specific Elements in the Jovo Model

This section provides an overview of how the Jovo Model [see general structure in the main Jovo Model docs](https://www.jovo.tech/marketplace/jovo-model#model-structure) can be extended with platform-specific content for Google Assistant.

### Invocation

You can define a Google Assistant-specific invocation name like this:

```js
"invocation": {
  "googleAssistant": "my test action"
  // Other platforms
},
```

### Built-in Types

> Find all built-in types in the official [Conversational Action System Types Reference](https://developers.google.com/assistant/conversational/types#system_types).

If your intent uses an entity ([see how they are added to the Jovo Model](http://jovo.tech/marketplace/jovo-model#intents)) that requires a Google Assistant system type, you can add it like this:

```js
"entities": [
  {
    "name": "number",
    "type": {
      "googleAssistant": "actions.type.Number"
    }
  }
]
```

### Google Assistant-only Elements

Some elements (intents, types) might be required only by the Google Assistant portion of your Jovo project. For this you can add a `googleAssistant` object to your Jovo Model.

```js
"googleAssistant": {
  "custom": {
    "global": {
      "actions.intent.MAIN": {
        "handler": {
          "webhookHandler": "Jovo"
        }
      }
    },
    "intents": {
      "TestIntent": {
        "trainingPhrases": [
          "Hello World"
        ]
      }
    }
  }
}
```

This object follows the structure of the Google Assistant Model .yaml files in JSON format.

## Using the Google Assistant Jovo Model with the Jovo CLI

By using the [`jovo build` command](https://www.jovo.tech/marketplace/jovo-cli/build), you can turn your Jovo Model files in the `models` folder in your Jovo project into Conversational Action specific files.

[Learn more in the Google Assistant platform documentation](https://github.com/jovotech/jovo-framework/tree/v4dev/platforms/platform-googleassistant).


## Using the Google Assistant Jovo Model npm Package

Install the package like this:

```sh
$ npm install @jovotech/model-googleassistant
```

You can learn more about all the Jovo Model features here: [Using the Jovo Model npm Packages](http://jovo.tech/marketplace/jovo-model#using-the-jovo-model-npm-packages).
