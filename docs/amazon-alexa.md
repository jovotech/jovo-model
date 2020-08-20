# Jovo Model: Alexa

Learn how to turn the [Jovo Model](http://jovo.tech/marketplace/jovo-model) into an Alexa Interaction Model.

* [Introduction](#introduction)
* [Alexa-specific Elements in the Jovo Model](#alexa-specific-elements-in-the-jovo-model)
   * [Invocation](#invocation)
   * [Built-in Slot Types](#built-in-slot-types)
   * [Alexa-only Elements](#alexa-only-elements)
* [Using the Alexa Jovo Model with the Jovo CLI](#using-the-alexa-jovo-model-with-the-jovo-cli)
   * [ASK CLI](#ask-cli)
   * [Platforms Folder](#platforms-folder)
* [Using the Alexa Jovo Model npm Package](#using-the-alexa-jovo-model-npm-package)

## Introduction

Language models for Amazon Alexa Skills are called Alexa Interaction Models. You can either manage them via API (what the [Jovo CLI](https://www.jovo.tech/marketplace/jovo-cli) is doing during deployment) or in the Amazon Developer Portal, which offers a graphical user interface.

Alexa Interaction Models include:
* Invocation name
* Intents with samples (phrases in the Jovo Model) and slots (inputs)
* Slot types (input types)

Learn more about the structure in the [official Alexa documentation](https://developer.amazon.com/docs/alexa/custom-skills/create-the-interaction-model-for-your-skill.html). The Jovo Model can be translated into this structure by using the [`jovo build` command](https://www.jovo.tech/marketplace/jovo-cli/build) ([see below](#using-the-alexa-jovo-model-with-the-jovo-cli)) or the npm package ([see below](#using-the-alexa-jovo-model-npm-package)).


## Alexa-specific Elements in the Jovo Model

This section provides an overview how the Jovo Model ([see general structure in the main Jovo Model docs](http://jovo.tech/marketplace/jovo-model#model-structure)) can be extended with platform-specific content for Alexa.

### Invocation

You can define an Alexa-specific invocation name like this:

```javascript
"invocation": {
    "alexaSkill": "my test skill"
    // Other platforms
},
```

### Built-in Slot Types

> Find all built-in slot types in the official [Alexa Slot Type Reference](https://developer.amazon.com/docs/custom-skills/slot-type-reference.html).

If your intent uses an input ([see how they are added to the Jovo Model](http://jovo.tech/marketplace/jovo-model#intents)) that requires an Alexa built-in slot type, you can add it like this:

```javascript
"inputs": [
    {
        "name": "name",
        "type": {
            "alexa": "AMAZON.US_FIRST_NAME"
        }
    }
]
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

By using the [`jovo build` command](https://www.jovo.tech/marketplace/jovo-cli/build), you can turn your Jovo Model files in the `models` folder in your Jovo project into Alexa specific files. You can find the files inside the `platforms/alexaSkill` folder that is created by the Jovo CLI. It contains all the information of your Alexa Skill needed to deploy the skill to the Amazon Developer Portal. 

### ASK CLI

The Jovo CLI uses the ASK CLI for deployment and supports both ASK CLI `v2` and `v1`, each requiring a slightly different project structure. We recommend to upgrade your ASK CLI and migrate to the new ASK structure. [Read more about the migration here](https://developer.amazon.com/en-US/docs/alexa/smapi/ask-cli-v1-to-v2-migration-guide.html).

The [`jovo deploy` command](https://www.jovo.tech/marketplace/jovo-cli/deploy) then uses these files and uploads them to the Alexa platform where you can see changes in the Alexa Developer Console.


### Platforms Folder

Learn more about the contents of the `platforms/alexaSkill` folder.

#### interactionModels

This is where your generated Alexa Interaction Models live.

Additionally, there are also some other files and folders that are important for your Alexa project.


#### .ask

The `.ask` folder contains the basic deploy settings of your skill, such as your project's `skillId`, inside a single file, `ask-states.json` for v2 of the `ASK CLI`, `config` for v1. We recommend you to not make any changes to these files.

`ask-cli@v2`:
```js
// ask-states.json
{
	"askcliStatesVersion": "2020-03-31",
	"profiles": {
		"default": {
			"skillId": "[Your Skill ID]",
			"skillMetadata": {
				"lastDeployHash": ""
			},
			"code": {}
		}
	}
}
```

`ask-cli@v1`:
```javascript
// config
{
	"deploy_settings": {
		"default": {
			"skill_id": "[Your Skill ID]",
			"was_cloned": false
		}
	}
}
```



#### skill.json

`skill.json` contains the publication and configuration information of your Skill. This can be either updated manually or in the Amazon Developer Portal (and then imported with the [`jovo get`](../../../tools/cli/get.md '../cli/get') command). If you have v2 of the `ASK CLI` installed, the file's location is `alexaSkill/skill-package/`, else it's located inside `alexaSkill/`.

```javascript
{
	"skillManifest": {
		"publishingInformation": {
			"locales": {
				"en-US": {
					"summary": "Jovo Sample App",
					"examplePhrases": [
						"Alexa open my test app"
					],
					"name": "hello-world",
					"description": "Sample Full Description"
				}
			},
			"isAvailableWorldwide": true,
			"testingInstructions": "Sample Testing Instructions.",
			"category": "EDUCATION_AND_REFERENCE",
			"distributionCountries": []
		},
		"apis": {
			"custom": {}
		},
		"manifestVersion": "1.0"
	}
}
```

#### ask-resources.json

V2 of the `ASK CLI` requires an additional file, `ask-resources.json`. This file contains your project's configuration for use with the Skill Management API.

```js
{
	"askcliResourcesVersion": "2020-03-31",
	"profiles": {
		"default": {
			"skillMetadata": {
				"src": "./skill-package"
			}
		}
	}
}
```



## Using the Alexa Jovo Model npm Package

Install the package like this:

```sh
$ npm install jovo-model-alexa --save
```

You can learn more about all the Jovo Model features here: [Using the Jovo Model npm Packages](http://jovo.tech/marketplace/jovo-model#using-the-jovo-model-npm-packages).