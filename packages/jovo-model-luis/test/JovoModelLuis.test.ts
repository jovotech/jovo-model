import { JovoModelLuis } from '../src';

import { NativeFileInformation, JovoModelData } from '@jovotech/model';

describe('JovoModelLuis.ts', () => {
  describe('exportJovoModel (toJovoModel)', () => {
    const testsData = [
      {
        description:
          'should replace all the values with placeholders and save the closedLists as custom entityTypes',
        input: {
          locale: 'en',
          inputFiles: [
            {
              path: ['en-US.json'],
              content: {
                luis_schema_version: '3.2.0',
                versionId: '0.1',
                name: 'Jovo App',
                desc: '',
                culture: 'en-us',
                tokenizerVersion: '1.0.0',
                intents: [
                  {
                    name: 'Welcome',
                  },
                  {
                    name: 'RestaurantSearch',
                  },
                ],
                entities: [
                  {
                    name: 'Plates',
                  },
                  {
                    name: 'Cuisine',
                  },
                  {
                    name: 'Location',
                  },
                ],
                composites: [],
                closedLists: [
                  {
                    name: 'Cuisine',
                    subLists: [
                      {
                        canonicalForm: 'chinese',
                        list: ['Chinese', 'Chines', 'chines'],
                      },
                      {
                        canonicalForm: 'vegetarian',
                        list: ['veggie', 'vegg'],
                      },
                    ],
                  },
                  {
                    name: 'Location',
                    subLists: [
                      {
                        canonicalForm: 'centre',
                        list: ['center'],
                      },
                    ],
                  },
                  {
                    name: 'Plates',
                    subLists: [
                      {
                        canonicalForm: 'beans',
                      },
                      {
                        canonicalForm: 'cheese',
                      },
                      {
                        canonicalForm: 'rice',
                      },
                      {
                        canonicalForm: 'tacos',
                      },
                    ],
                  },
                ],
                patternAnyEntities: [],
                regex_entities: [],
                prebuiltEntities: [],
                model_features: [],
                regex_features: [],
                patterns: [],
                utterances: [
                  {
                    text: 'hey',
                    intent: 'Welcome',
                    entities: [],
                  },
                  {
                    text: 'howdy',
                    intent: 'Welcome',
                    entities: [],
                  },
                  {
                    text: "i'm looking for a place to eat",
                    intent: 'RestaurantSearch',
                    entities: [],
                  },
                  {
                    text: "i'm looking for a place to eat beans",
                    intent: 'RestaurantSearch',
                    entities: [
                      {
                        entity: 'Plates',
                        startPos: 31,
                        endPos: 35,
                      },
                    ],
                  },
                  {
                    text: 'show me chinese restaurants',
                    intent: 'RestaurantSearch',
                    entities: [
                      {
                        entity: 'Cuisine',
                        startPos: 8,
                        endPos: 14,
                      },
                    ],
                  },
                  {
                    text: 'show me a vegetarian place in the centre',
                    intent: 'RestaurantSearch',
                    entities: [
                      {
                        entity: 'Cuisine',
                        startPos: 10,
                        endPos: 19,
                      },
                      {
                        entity: 'Location',
                        startPos: 34,
                        endPos: 39,
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        result: {
          version: '4.0',
          invocation: '',
          intents: {
            Welcome: {
              phrases: ['hey', 'howdy'],
            },
            RestaurantSearch: {
              phrases: [
                "i'm looking for a place to eat",
                "i'm looking for a place to eat {Plates}",
                'show me {Cuisine} restaurants',
                'show me a {Cuisine} place in the {Location}',
              ],
              entities: {
                Location: {
                  type: 'Location',
                },
                Cuisine: {
                  type: 'Cuisine',
                },
                Plates: {
                  type: 'Plates',
                },
              },
            },
          },
          entityTypes: {
            Cuisine: {
              values: [
                {
                  value: 'chinese',
                  synonyms: ['Chinese', 'Chines', 'chines'],
                },
                {
                  value: 'vegetarian',
                  synonyms: ['veggie', 'vegg'],
                },
              ],
            },
            Location: {
              values: [
                {
                  value: 'centre',
                  synonyms: ['center'],
                },
              ],
            },
            Plates: {
              values: [
                {
                  value: 'beans',
                },
                {
                  value: 'cheese',
                },
                {
                  value: 'rice',
                },
                {
                  value: 'tacos',
                },
              ],
            },
          },
        },
      },
      {
        description: 'it should export entities of built-in luis types without the prefix',
        input: {
          locale: 'en',
          inputFiles: [
            {
              path: ['en-US.json'],
              content: {
                luis_schema_version: '3.2.0',
                versionId: '0.1',
                name: 'Jovo App',
                desc: '',
                culture: 'en-us',
                tokenizerVersion: '1.0.0',
                intents: [
                  {
                    name: 'HelloWorldIntent',
                  },
                  {
                    name: 'MyNameIsIntent',
                  },
                ],
                entities: [
                  {
                    name: 'builtin.personName',
                  },
                ],
                composites: [],
                closedLists: [],
                patternAnyEntities: [],
                regex_entities: [],
                prebuiltEntities: [],
                model_features: [],
                regex_features: [],
                patterns: [],
                utterances: [
                  {
                    text: 'hello',
                    intent: 'HelloWorldIntent',
                    entities: [],
                  },
                  {
                    text: 'say hello',
                    intent: 'HelloWorldIntent',
                    entities: [],
                  },
                  {
                    text: 'say hello world',
                    intent: 'HelloWorldIntent',
                    entities: [],
                  },
                  {
                    text: 'Alex',
                    intent: 'MyNameIsIntent',
                    entities: [
                      {
                        entity: 'builtin.personName',
                        startPos: 0,
                        endPos: 3,
                      },
                    ],
                  },
                  {
                    text: 'my name is Andre',
                    intent: 'MyNameIsIntent',
                    entities: [
                      {
                        entity: 'builtin.personName',
                        startPos: 11,
                        endPos: 15,
                      },
                    ],
                  },
                  {
                    text: 'i am Florian',
                    intent: 'MyNameIsIntent',
                    entities: [
                      {
                        entity: 'builtin.personName',
                        startPos: 5,
                        endPos: 11,
                      },
                    ],
                  },
                  {
                    text: 'you can call me Jan',
                    intent: 'MyNameIsIntent',
                    entities: [
                      {
                        entity: 'builtin.personName',
                        startPos: 16,
                        endPos: 18,
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        result: {
          version: '4.0',
          invocation: '',
          intents: {
            HelloWorldIntent: {
              phrases: ['hello', 'say hello', 'say hello world'],
            },
            MyNameIsIntent: {
              phrases: [
                '{personName}',
                'my name is {personName}',
                'i am {personName}',
                'you can call me {personName}',
              ],
              entities: {
                personName: {
                  type: {
                    luis: 'builtin.personName',
                  },
                },
              },
            },
          },
          entityTypes: {},
        },
      },
    ];

    for (const testData of testsData) {
      const jovoModel = new JovoModelLuis();
      test(testData.description, () => {
        jovoModel.importNative(
          testData.input.inputFiles as NativeFileInformation[],
          testData.input.locale,
        );
        expect(jovoModel.exportJovoModel()).toEqual(testData.result);
      });
    }
  });

  describe('exportNative (fromJovoModel)', () => {
    const testsData = [
      {
        description:
          'should replace all the placeholders with example values and save the custom entityTypes as closedLists',
        input: {
          locale: 'en-US',
          data: {
            version: '4.0',
            invocation: '',
            intents: {
              Welcome: {
                phrases: ['hey', 'howdy'],
              },
              RestaurantSearch: {
                phrases: [
                  "i'm looking for a place to eat",
                  "i'm looking for a place to eat {plates}",
                  'show me {cuisine} restaurants',
                  'show me a {cuisine} place in the {location}',
                ],
                entities: {
                  cuisine: {
                    type: 'Cuisine',
                  },
                  location: {
                    type: 'Location',
                  },
                  plates: {
                    type: 'Plates',
                  },
                },
              },
            },
            entityTypes: {
              Cuisine: {
                values: [
                  {
                    id: 1,
                    key: 'chinese',
                    value: 'chinese',
                    synonyms: ['Chinese', 'Chines', 'chines'],
                  },
                  {
                    id: 2,
                    key: 'vegetarian',
                    value: 'vegetarian',
                    synonyms: ['veggie', 'vegg'],
                  },
                ],
              },
              Location: {
                values: [
                  {
                    value: 'centre',
                    synonyms: ['center'],
                  },
                ],
              },
              Plates: {
                values: [
                  {
                    value: 'beans',
                  },
                  {
                    value: 'cheese',
                  },
                  {
                    value: 'rice',
                  },
                  {
                    value: 'tacos',
                  },
                ],
              },
            },
          },
        },
        result: [
          {
            path: ['en-US.json'],
            content: {
              luis_schema_version: '3.2.0',
              versionId: '0.1',
              name: 'Jovo App',
              desc: '',
              culture: 'en-us',
              tokenizerVersion: '1.0.0',
              intents: [
                {
                  name: 'Welcome',
                },
                {
                  name: 'RestaurantSearch',
                },
              ],
              entities: [
                {
                  name: 'Plates',
                },
                {
                  name: 'Cuisine',
                },
                {
                  name: 'Location',
                },
              ],
              composites: [],
              closedLists: [
                {
                  name: 'Cuisine',
                  subLists: [
                    {
                      canonicalForm: 'chinese',
                      list: ['Chinese', 'Chines', 'chines'],
                    },
                    {
                      canonicalForm: 'vegetarian',
                      list: ['veggie', 'vegg'],
                    },
                  ],
                },
                {
                  name: 'Location',
                  subLists: [
                    {
                      canonicalForm: 'centre',
                      list: ['center'],
                    },
                  ],
                },
                {
                  name: 'Plates',
                  subLists: [
                    {
                      canonicalForm: 'beans',
                    },
                    {
                      canonicalForm: 'cheese',
                    },
                    {
                      canonicalForm: 'rice',
                    },
                    {
                      canonicalForm: 'tacos',
                    },
                  ],
                },
              ],
              patternAnyEntities: [],
              regex_entities: [],
              prebuiltEntities: [],
              model_features: [],
              regex_features: [],
              patterns: [],
              utterances: [
                {
                  text: 'hey',
                  intent: 'Welcome',
                  entities: [],
                },
                {
                  text: 'howdy',
                  intent: 'Welcome',
                  entities: [],
                },
                {
                  text: "i'm looking for a place to eat",
                  intent: 'RestaurantSearch',
                  entities: [],
                },
                {
                  text: "i'm looking for a place to eat beans",
                  intent: 'RestaurantSearch',
                  entities: [
                    {
                      entity: 'Plates',
                      startPos: 31,
                      endPos: 35,
                    },
                  ],
                },
                {
                  text: 'show me chinese restaurants',
                  intent: 'RestaurantSearch',
                  entities: [
                    {
                      entity: 'Cuisine',
                      startPos: 8,
                      endPos: 14,
                    },
                  ],
                },
                {
                  text: 'show me a vegetarian place in the centre',
                  intent: 'RestaurantSearch',
                  entities: [
                    {
                      entity: 'Cuisine',
                      startPos: 10,
                      endPos: 19,
                    },
                    {
                      entity: 'Location',
                      startPos: 34,
                      endPos: 39,
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        description: 'it should not export values of built-in types as closedLists',
        input: {
          locale: 'en-US',
          data: {
            version: '4.0',
            invocation: '',
            intents: {
              HelloWorldIntent: {
                phrases: ['hello', 'say hello', 'say hello world'],
              },
              MyNameIsIntent: {
                phrases: ['{name}', 'my name is {name}', 'i am {name}', 'you can call me {name}'],
                entities: {
                  name: {
                    type: {
                      luis: 'builtin.personName',
                    },
                  },
                },
              },
            },
            entityTypes: {
              'builtin.personName': {
                values: [
                  {
                    value: 'Alex',
                  },
                  {
                    value: 'Andre',
                  },
                  {
                    value: 'Florian',
                  },
                  {
                    value: 'Jan',
                  },
                  {
                    value: 'Kaan',
                  },
                  {
                    value: 'Max',
                  },
                  {
                    value: 'Pia',
                  },
                  {
                    value: 'Ruben',
                  },
                ],
              },
            },
          },
        },
        result: [
          {
            path: ['en-US.json'],
            content: {
              luis_schema_version: '3.2.0',
              versionId: '0.1',
              name: 'Jovo App',
              desc: '',
              culture: 'en-us',
              tokenizerVersion: '1.0.0',
              intents: [
                {
                  name: 'HelloWorldIntent',
                },
                {
                  name: 'MyNameIsIntent',
                },
              ],
              entities: [
                {
                  name: 'builtin.personName',
                },
              ],
              composites: [],
              closedLists: [],
              patternAnyEntities: [],
              regex_entities: [],
              prebuiltEntities: [],
              model_features: [],
              regex_features: [],
              patterns: [],
              utterances: [
                {
                  text: 'hello',
                  intent: 'HelloWorldIntent',
                  entities: [],
                },
                {
                  text: 'say hello',
                  intent: 'HelloWorldIntent',
                  entities: [],
                },
                {
                  text: 'say hello world',
                  intent: 'HelloWorldIntent',
                  entities: [],
                },
                {
                  text: 'Alex',
                  intent: 'MyNameIsIntent',
                  entities: [
                    {
                      entity: 'builtin.personName',
                      startPos: 0,
                      endPos: 3,
                    },
                  ],
                },
                {
                  text: 'my name is Andre',
                  intent: 'MyNameIsIntent',
                  entities: [
                    {
                      entity: 'builtin.personName',
                      startPos: 11,
                      endPos: 15,
                    },
                  ],
                },
                {
                  text: 'i am Florian',
                  intent: 'MyNameIsIntent',
                  entities: [
                    {
                      entity: 'builtin.personName',
                      startPos: 5,
                      endPos: 11,
                    },
                  ],
                },
                {
                  text: 'you can call me Jan',
                  intent: 'MyNameIsIntent',
                  entities: [
                    {
                      entity: 'builtin.personName',
                      startPos: 16,
                      endPos: 18,
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    ];

    for (const testData of testsData) {
      const jovoModel = new JovoModelLuis(
        (testData.input.data as unknown) as JovoModelData,
        testData.input.locale,
      );
      test(testData.description, () => {
        expect(jovoModel.exportNative()).toEqual(testData.result);
      });
    }
  });
});
