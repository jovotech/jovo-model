# Jovo Model Schema

Learn more about all the elements that are part of the Jovo Model.
- [Introduction](#introduction)
- [Model Elements](#model-elements)
  - [Version](#version)
  - [Invocation](#invocation)
  - [Intents](#intents)
  - [Entity Types](#entity-types)
  - [Platform-specific Elements](#platform-specific-elements)

## Introduction

Each locale is represented by its own model. For example, the `en.json` in the [Jovo v4 template](https://github.com/jovotech/jovo-v4-template/blob/master/models/en.json) looks like this:

```javascript
{
  "version": "4.0",
  "invocation": "my test app",
  "intents": {
    "YesIntent": {
      "phrases": [
        "yes",
        "yes please",
        "sure"
      ]
    },
    "NoIntent": {
      "phrases": [
        "no",
        "no thanks"
      ]
    }
  }
}
```

## Model Elements

The model schema supports the following properties:

* [`version`](#version): The Jovo Model version (introduced with Jovo `v4`)
* [`invocation`](#invocation): How the app is launched on voice assistant platforms
* [`intents`](#intents): Groups of `phrases` and `entities`
* [`entityTypes`](#entity-types): Types of entities that can be used across intents
* [platform-specific elements](#platform-specific-elements): Elements that are only added for some platforms, e.g. `alexa`

### Version

```javascript
{
  "version": "4.0",
  // ...
}
```

### Invocation

The `invocation` is used by some voice assistant platforms as the "app name" to access the app (see [Voice App Basics](https://www.jovo.tech/docs/voice-app-basics) in the Jovo Docs).

```javascript
{
  "invocation": "my test app",
  // ...
}
```


It is possible to add platform-specific invocations like this:

```javascript
{
  "invocation": {
    "alexa": "my test skill",
    "googleAssistant": "my test action"
  }
  // ...
}
```

Currently, this element is supported by Alexa Skills and Google Assistant Conversational Actions. If you use Google Assistant with Dialogflow, you need to set the invocation name manually in the Actions on Google console.  


### Intents

Intents can be added to the JSON as objects that include:

* a name as object key
* sample [`phrases`](#phrases) 
* [`entities`](#entities) (optional)

This is how a `MyNameIsIntent` could look like:

```javascript
{
  "intents": {
    "MyNameIsIntent": {
      "phrases": [  
        "{name}",
        "my name is {name}",
        "i am {name}",
        "you can call me {name}"
      ],
      "entities": {  
        "name": {  
          "type": {  
              "alexa": "AMAZON.US_FIRST_NAME",
              "dialogflow": "@sys.given-name"
          }
        }
      }
    }
  }
  // ...
}
```


#### Phrases

This is an array of example `phrases` that will be used to train the language model on the respective NLU platforms.

Some providers use different names for these phrases, for example utterances, samples, or "user says."

```javascript
"MyNameIsIntent": {
  "phrases": [  
    "{name}",
    "my name is {name}",
    "i am {name}",
    "you can call me {name}"
  ],
  // ...
}
```


#### Entities

Often, phrases contain variable input such as slots or entities, as some NLU services call them. In the Jovo Model, they are called `entities`.

Entities consist of a `name` (how it's reference in the phrases) and a `type` (learn more in the [Entity Types](#entity-types) section). For example an intent with phrases like `I live in {city}` would come with an entity like this:

```javascript
"MyCityIntent": {
  "entities": {
    "city": {
      "type": "myCityEntityType"
    }
  },
  // ...
}
```

You can also choose to provide different entity types for each NLU service:

```javascript
"MyNameIsIntent": {
  "entities": {
    "name": {
      "type": {
        "alexa": "AMAZON.US_FIRST_NAME",
        "dialogflow": "@sys.given-name"
      }
    }
  },
  // ...
}
```

You can either reference entity types defined in the [`entityTypes` object](#entity-types), or reference built-in entity types provided by the respective NLU platforms (like `AMAZON.US_FIRST_NAME` for Alexa).


### Entity Types

The `entityTypes` object lists all the entity types that are referenced as `entities` inside `intents`.

Each input type contains:
* a name as object key
* [`values`](#values)

```javascript
{
  "entityTypes": {
    "myCityEntityType": {
      "values": [
        "Berlin",
        "New York"
      ]
    }
  },
  // ...
}
```


#### Values

You can define the values for an entity type by either adding as strings or objects. For example this is how the `myCityEntityType` looks like with two values:

```javascript
"myCityEntityType": {
  "values": [
    "Berlin",
    "New York"
  ]
}
```

Some entity values could be expressed in the same way. For this, you can add `synonyms` by turning the value into an object:

```javascript
"myCityEntityType": {
  "values": [
    "Berlin",
    {
      "value": "New York",
      "synonyms": [
        "New York City",
        "NYC"
      ]
    }
  ]
}
```


### Platform-specific Elements

Some intents or entity types may be needed for just some platforms. You can define them as additional elements as shown for Alexa in the example below:

```javascript
{
  // ...
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
  }
}
```

The format of the elements inside the `alexa` object from above is the original structure of the Alexa Interaction Model. For example, `phrases` (Jovo Model naming) are called `samples` here.