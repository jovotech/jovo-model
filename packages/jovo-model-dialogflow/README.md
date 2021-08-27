# Jovo Model: Dialogflow

Learn how to turn the Jovo Model into a Dialogflow agent.

- [Introduction](#introduction)
- [Dialogflow-specific Elements in the Jovo Model](#dialogflow-specific-elements-in-the-jovo-model)
	- [Intents](#intents)
	- [Inputs and Input Types](#inputs-and-input-types)
	- [System Entities](#system-entities)
	- [Dialogflow-only Elements](#dialogflow-only-elements)
- [Using the Dialogflow Jovo Model npm Package](#using-the-dialogflow-jovo-model-npm-package)

## Introduction

Language models for Dialogflow are called Dialogflow agents. You can either manage them via API (what the [Jovo CLI](https://www.jovo.tech/marketplace/jovo-cli) is doing during deployment) or in the Dialogflow console, which offers a graphical user interface.

Dialogflow agents include:
* Intents with training phrases (phrases in the Jovo Model) and entities (inputs)
* Entity types (input types)
* And more, like events, actions, fulfillment

Learn more about the structure in the [official Dialogflow documentation](https://cloud.google.com/dialogflow/docs/agents-overview). The Jovo Model can be translated into this structure by using the [`jovo build` command](https://www.jovo.tech/marketplace/jovo-cli/build) ([see below](#using-the-dialogflow-jovo-model-with-the-jovo-cli)) or the npm package ([see below](#using-the-dialogflow-jovo-model-npm-package)).


## Dialogflow-specific Elements in the Jovo Model

This section provides an overview how the Jovo Model ([see general structure in the main Jovo Model docs](http://jovo.tech/marketplace/jovo-model#model-structure)) can be extended with platform-specific content for Dialogflow.

### Intents

You can add options to Jovo intents like this:

```javascript
"HelloWorldIntent": {  
	"phrases":[  
		"hello",
		"say hello",
		"say hello world"
	],
	"dialogflow": {
		"priority": 500000,
		"webhookForSlotFilling": true
	}
},
```
In the above example, you can see that you can add specific elements like a `priority` to an intent.

The `priority` can have the following value :

| Definition | Value   | Color  |
| ---------- |:-------:|:------:|
| Highest    | 1000000 | Red    |
| High       | 750000  | Orange |
| Normal     | 500000  | Blue   | 
| Low        | 250000  | Green  |
| Ignore     | 0       | Grey  |

### Inputs and Input Types

You also can manage your entity as a list by specifying the parameter `isList`:

```javascript
"entities": [
	"any": {
		"type": {
			"dialogflow": "@sys.any"
		},
		"dialogflow": {
			"isList": true
		}
	}
]
```

You can add a specific parameter `automatedExpansion` to [allow automated expansion](https://cloud.google.com/dialogflow/docs/entities-options#expansion) like this:

```javascript
"inputTypes": [
    {
        "name": "myCityInputType",
	    "dialogflow": {
        	"automatedExpansion": true
      	},
        "values": [
            {
                "value": "Berlin"
            },
            {
                "value": "New York",
                "synonyms": [
                    "New York City"
                ]
            }
        ]
    }
],
```

### System Entities

> Find all types in the official [Dialogflow system entities documentation](https://cloud.google.com/dialogflow/docs/entities-system).

If your intent uses an entity ([see how they are added to the Jovo Model](http://jovo.tech/marketplace/jovo-model#intents)) that requires a Dialogflow system entity type, you can add it like this:

```javascript
"entities": [
	"name": {
		"type": {
			"dialogflow": "@sys.given-name"
			// ...
		}
	}
]
```

### Dialogflow-only Elements

Some elements (intents, entities) might be required only by the Dialogflow portion of your Jovo project. For this you can add a `dialogflow` object to your Jovo Model.

```javascript
 "dialogflow": {
    "intents": [
        {
            "name": "Default Fallback Intent",
            "auto": true,
            "webhookUsed": true,
            "fallbackIntent": true
        },
        {
            "name": "Default Welcome Intent",
            "auto": true,
            "webhookUsed": true,
            "events": [
                {
                    "name": "WELCOME"
                }
            ]
        }
    ],
    "entities": [
        {
            "name": "hobby",
            "isOverridable": true,
            "isEnum": false,
            "automatedExpansion": false
        }
    ]
}
```

The `dialogflow` object contains the agent data in its original syntax. For example, you export your Dialogflow Agent, look at the files, and copy-paste the stuff that you need into this part of the Jovo Language Model file.



## Using the Dialogflow Jovo Model npm Package

Install the package like this:

```sh
$ npm install @jovotech/model-dialogflow
```

You can learn more about all the Jovo Model features here: [Using the Jovo Model npm Packages](http://jovo.tech/marketplace/jovo-model#using-the-jovo-model-npm-packages).