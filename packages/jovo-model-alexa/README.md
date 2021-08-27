# Jovo Model: Alexa

Learn how to turn the [Jovo Model](http://jovo.tech/marketplace/jovo-model) into an Alexa Interaction Model.

- [Introduction](#introduction)
- [Alexa-specific Elements in the Jovo Model](#alexa-specific-elements-in-the-jovo-model)
  - [Invocation](#invocation)
  - [Built-in Slot Types](#built-in-slot-types)
  - [Alexa-only Elements](#alexa-only-elements)
- [Using the Alexa Jovo Model with the Jovo CLI](#using-the-alexa-jovo-model-with-the-jovo-cli)
- [Using the Alexa Jovo Model npm Package](#using-the-alexa-jovo-model-npm-package)

## Introduction

Language models for Amazon Alexa Skills are called Alexa Interaction Models. You can either manage them via API (what the [Jovo CLI](https://www.jovo.tech/marketplace/jovo-cli) is doing during deployment) or in the Amazon Developer Portal, which offers a graphical user interface.

Alexa Interaction Models include:
* Invocation name
* Intents with samples (phrases in the Jovo Model) and slots (entities)
* Slot types (entity types)

Learn more about the structure in the [official Alexa documentation](https://developer.amazon.com/docs/alexa/custom-skills/create-the-interaction-model-for-your-skill.html). The Jovo Model can be translated into this structure by using the [`jovo build` command](https://www.jovo.tech/marketplace/jovo-cli/build) ([see below](#using-the-alexa-jovo-model-with-the-jovo-cli)) or the npm package ([see below](#using-the-alexa-jovo-model-npm-package)).


## Alexa-specific Elements in the Jovo Model

This section provides an overview how the Jovo Model ([see general structure in the main Jovo Model docs](http://jovo.tech/marketplace/jovo-model#model-structure)) can be extended with platform-specific content for Alexa.

### Invocation

You can define an Alexa-specific invocation name like this:

```javascript
"invocation": {
    "alexa": "my test skill"
    // ...
},
```

### Built-in Slot Types

> Find all built-in slot types in the official [Alexa Slot Type Reference](https://developer.amazon.com/docs/custom-skills/slot-type-reference.html).

If your intent uses an input ([see how they are added to the Jovo Model](http://jovo.tech/marketplace/jovo-model#intents)) that requires an Alexa built-in slot type, you can add it like this:

```javascript
"entities": {
  "name": {
    "type": {
        "alexa": "AMAZON.US_FIRST_NAME"
        // ...
    }
  }
}
```


### Alexa-only Elements

Some elements (intents, slot types) might be required only by the Alexa portion of your Jovo project. For this you can add an `alexa` object to your Jovo Model.

```javascript
"alexa": {
    "interactionModel": {
        "languageModel": {
            "intents": [
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                }
            ]
        }
    }
},
```

This object follows the structure of the Alexa Interaction Model JSON, notice the difference of `samples` instead of `phrases`, for example.



## Using the Alexa Jovo Model with the Jovo CLI

By using the [`jovo build` command](https://www.jovo.tech/marketplace/jovo-cli/build), you can turn your Jovo Model files in the `models` folder in your Jovo project into Alexa specific files. You can find the files inside the `build` folder that is created by the Jovo CLI. It contains all the information of your Alexa Skill needed to deploy the skill to the Amazon Developer Portal. 

## Using the Alexa Jovo Model npm Package

Install the package like this:

```sh
$ npm install @jovotech/model-alexa
```

You can learn more about all the Jovo Model features here: [Using the Jovo Model npm Packages](http://jovo.tech/marketplace/jovo-model#using-the-jovo-model-npm-packages).