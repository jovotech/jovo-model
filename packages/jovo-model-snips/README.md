# Jovo Model: Snips NLU

Learn how to turn the Jovo Model into a Snips NLU model.

- [Introduction](#introduction)
- [Using the Snips Jovo Model npm Package](#using-the-snips-jovo-model-npm-package)
- [Customizing the Jovo Model](#customizing-the-jovo-model)

## Introduction

[Snips NLU](https://github.com/snipsco/snips-nlu) is an open source natural language understanding (NLU) service.

Learn more about the language model structure in the [official Rasa NLU docs](https://snips-nlu.readthedocs.io/en/latest/). The Jovo Model can be translated into this structure by using the npm package ([see below](#using-the-snips-jovo-model-npm-package)).


## Using the Snips Jovo Model npm Package

Install the package like this:

```sh
$ npm install @jovotech/model-snips
```

You can learn more about all the Jovo Model features here: [Using the Jovo Model npm Packages](http://jovo.tech/marketplace/jovo-model#using-the-jovo-model-npm-packages).

Here is a code sample of how to convert from a Jovo model to a Snips dataset:

```ts
import { JovoModelData } from '@jovotech/model';
import { JovoModelSnips } from '@jovotech/model-snips';
import jovoModel from './models/en.json';

const snipsDataset = JovoModelSnips.fromJovoModel(jovoModel as JovoModelData, 'en');
console.log(JSON.stringify(snipsDataset, null, 2));
```

## Customizing the Jovo Model

For Snips, the Jovo Model supports the following Intent entries:
- [Intent only](#intent-only)
- [Builtin entities](#builtin-entities)
- [Custom entities](#custom-entities)
- [Combined builtin and custom entities](#combined-builtin-and-custom-entities)

Look in the [examples](./examples/) folder to see how to structure a [Jovo model](./examples/basic/jovo4-model-en.json) and the corresponding [Snips dataset](./examples/basic/snips-dataset-en.json) that will be generated.

### Intent only

An intent-only entry includes an array of `phrases`:

```json
// Jovo model
{
  "invocation": "my test app",
  "version": "4.0",
  "intents": {
    "YesIntent": {
      "phrases": [
        "yes",
        "yes please",
        "sure"
      ]
    }
  }
}
```


### Builtin entities

An intent can include an array of `phrases` with `{variables}` that map to a key in the `entities` object.

For a builtin entity, the `type` starts with `"snips/"` followed by the entity type:

```json
// Jovo model
{
  "invocation": "my test app",
  "version": "4.0",
  "intents": {
    "NumberIntent": {
      "phrases": [
        "my number is {myNumber}"
      ],
      "entities": {
        "myNumber": {
          "type": "snips/number"
        }
      }
    }
  }
}
```

For a list of builtin Snips types, see [Supported builtin entities](https://snips-nlu.readthedocs.io/en/latest/builtin_entities.html) and refer to the `Identifier` column.

### Custom entities

An intent can include an array of `phrases` with `{variables}` that map to a key in the `entities` object.

For a custom entity, the `type` will be a custom name that you define and a corresponding entry must be added to the `entityTypes` section. Custom entity types can include synonyms:

```json
// Jovo model
{
  "invocation": "my test app",
  "version": "4.0",
  "intents": {
    "ColorIntent": {
      "phrases": [
        "i pick {color}",
        "my favorite color is {color}"
      ],
      "entities": {
        "color": {
          "type": "CUSTOM_COLORS"
        }
      }
    }
  },
  "entityTypes": {
    "CUSTOM_COLORS": {
      "name": "CUSTOM_COLORS",
      "values": [
        {
          "value": "red",
          "synonyms": [
            "crimson"
          ]
        },
        {
          "value": "yellow",
          "synonyms": []
        },
        {
          "value": "blue",
          "synonyms": []
        },
        {
          "value": "green",
          "synonyms": []
        },
        {
          "value": "orange",
          "synonyms": []
        },
        {
          "value": "purple",
          "synonyms": []
        }
      ]
    }
  }
}
```

**NOTICE**: There is a current limitation with the mapping of a Jovo model to a Snips dataset such that the values for `use_synonyms` and `automatically_extensible` are always `true` and `matching_strictness` is always `1`. With `automatically_extensible` set to `true` it means that the data list values provided are not all the values that will be recognized for the entity type.

```json
// Snips dataset (partial)
{
    "CUSTOM_COLORS": {
        "data": [
        {
            "value": "red",
            "synonyms": [
            "crimson"
            ]
        },
        {
            "value": "yellow",
            "synonyms": []
        },
        {
            "value": "blue",
            "synonyms": []
        },
        {
            "value": "green",
            "synonyms": []
        },
        {
            "value": "orange",
            "synonyms": []
        },
        {
            "value": "purple",
            "synonyms": []
        }
        ],
        "matching_strictness": 1,
        "use_synonyms": true,
        "automatically_extensible": true
    },
}
```

### Combined builtin and custom entities

You can also combine builtin and custom entities for the same intent:

```json
// Jovo model
{
  "invocation": "my test app",
  "version": "4.0",
  "intents": {
    "WeatherIntent": {
      "phrases": [
        "give me the weather forecast for {weatherLocation} {weatherDate}"
      ],
      "entities": {
        "weatherLocation": {
          "type": "CUSTOM_WEATHER_LOCATION"
        },
        "weatherDate": {
          "type": "snips/datetime"
        }
      }
    }
  },
  "entityTypes": {
    "CUSTOM_WEATHER_LOCATION": {
      "name": "CUSTOM_WEATHER_LOCATION",
      "values": [
        {
          "value": "phoenix",
          "synonyms": []
        },
        {
          "value": "los angeles",
          "synonyms": []
        },
        {
          "value": "new york city",
          "synonyms": []
        }
      ]
    }
  }
}
```
