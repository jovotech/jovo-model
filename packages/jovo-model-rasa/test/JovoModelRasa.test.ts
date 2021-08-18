import { JovoModelRasa } from '../src';

import { NativeFileInformation, JovoModelData } from '@jovotech/model';

describe('JovoModelRasa.ts', () => {
  describe('exportJovoModel (toJovoModel)', () => {
    const testsData = [
      {
        description: "should export 'common_examples' as 'intents'",
        input: {
          locale: 'en',
          inputFiles: [
            {
              path: ['en.json'],
              content: {
                rasa_nlu_data: {
                  common_examples: [
                    {
                      text: 'hey',
                      intent: 'greet',
                      entities: [],
                    },
                    {
                      text: 'howdy',
                      intent: 'greet',
                      entities: [],
                    },
                  ],
                  entity_synonyms: [],
                  lookup_tables: [],
                },
              },
            },
          ],
        },
        result: {
          version: '4.0',
          invocation: '',
          entityTypes: [],
          intents: [
            {
              name: 'greet',
              phrases: ['hey', 'howdy'],
            },
          ],
        },
      },
      {
        description:
          "should replace used entity in 'common_examples' with placeholder and add as 'entities' to 'intents'",
        input: {
          locale: 'en',
          inputFiles: [
            {
              path: ['en.json'],
              content: {
                rasa_nlu_data: {
                  common_examples: [
                    {
                      text: "i'm looking for a place to eat",
                      intent: 'restaurant_search',
                      entities: [],
                    },
                    {
                      text: 'show me chinese restaurants',
                      intent: 'restaurant_search',
                      entities: [
                        {
                          start: 8,
                          end: 15,
                          value: 'chinese',
                          entity: 'Cuisine',
                        },
                      ],
                    },
                    {
                      text: 'show me a mexican place in the centre',
                      intent: 'restaurant_search',
                      entities: [
                        {
                          start: 10,
                          end: 17,
                          value: 'mexican',
                          entity: 'Cuisine',
                        },
                        {
                          start: 31,
                          end: 37,
                          value: 'centre',
                          entity: 'Location',
                        },
                      ],
                    },
                  ],
                  lookup_tables: [],
                  entity_synonyms: [
                    {
                      value: 'chinese',
                      synonyms: ['Chinese', 'Chines', 'chines'],
                    },
                    {
                      value: 'mexican',
                      synonyms: ['Mexican', 'mexikan'],
                    },
                    {
                      value: 'centre',
                      synonyms: ['center'],
                    },
                  ],
                },
              },
            },
          ],
        },
        result: {
          version: '4.0',
          invocation: '',
          intents: [
            {
              name: 'restaurant_search',
              phrases: [
                "i'm looking for a place to eat",
                'show me {Cuisine} restaurants',
                'show me a {Cuisine} place in the {Location}',
              ],
              entities: [
                {
                  name: 'Cuisine',
                  type: 'Cuisine',
                },
                {
                  name: 'Location',
                  type: 'Location',
                },
              ],
            },
          ],
          entityTypes: [
            {
              name: 'Cuisine',
              values: [
                {
                  value: 'chinese',
                  synonyms: ['Chinese', 'Chines', 'chines'],
                },
                {
                  value: 'mexican',
                  synonyms: ['Mexican', 'mexikan'],
                },
              ],
            },
            {
              name: 'Location',
              values: [
                {
                  value: 'centre',
                  synonyms: ['center'],
                },
              ],
            },
          ],
        },
      },
      {
        description: "should export 'lookup_tables' and 'entity_synonyms' as 'entityTypes'",
        input: {
          locale: 'en',
          inputFiles: [
            {
              path: ['en.json'],
              content: {
                rasa_nlu_data: {
                  common_examples: [
                    {
                      text: 'show me a chinese place which sells beans',
                      intent: 'restaurant_search',
                      entities: [
                        {
                          start: 10,
                          end: 17,
                          value: 'chinese',
                          entity: 'Cuisine',
                        },
                        {
                          start: 36,
                          end: 41,
                          value: 'beans',
                          entity: 'Plates',
                        },
                      ],
                    },
                  ],
                  lookup_tables: [
                    {
                      name: 'Plates',
                      elements: ['beans', 'cheese', 'rice', 'tacos'],
                    },
                  ],
                  entity_synonyms: [
                    {
                      value: 'chinese',
                      synonyms: ['Chinese', 'Chines', 'chines'],
                    },
                  ],
                },
              },
            },
          ],
        },
        result: {
          version: '4.0',
          invocation: '',
          intents: [
            {
              name: 'restaurant_search',
              phrases: ['show me a {Cuisine} place which sells {Plates}'],
              entities: [
                {
                  name: 'Cuisine',
                  type: 'Cuisine',
                },
                {
                  name: 'Plates',
                  type: 'Plates',
                },
              ],
            },
          ],
          entityTypes: [
            {
              name: 'Plates',
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
            {
              name: 'Cuisine',
              values: [
                {
                  value: 'chinese',
                  synonyms: ['Chinese', 'Chines', 'chines'],
                },
              ],
            },
          ],
        },
      },
      {
        description: 'should work with all above combined',
        input: {
          locale: 'en',
          inputFiles: [
            {
              path: ['en.json'],
              content: {
                rasa_nlu_data: {
                  common_examples: [
                    {
                      text: 'hey',
                      intent: 'greet',
                      entities: [],
                    },
                    {
                      text: 'howdy',
                      intent: 'greet',
                      entities: [],
                    },
                    {
                      text: "i'm looking for a place to eat",
                      intent: 'restaurant_search',
                      entities: [],
                    },
                    {
                      text: "i'm looking for a place to eat beans",
                      intent: 'restaurant_search',
                      entities: [
                        {
                          start: 31,
                          end: 36,
                          value: 'beans',
                          entity: 'Plates',
                        },
                      ],
                    },
                    {
                      text: 'show me chinese restaurants',
                      intent: 'restaurant_search',
                      entities: [
                        {
                          start: 8,
                          end: 15,
                          value: 'chinese',
                          entity: 'Cuisine',
                        },
                      ],
                    },
                    {
                      text: 'show me a chinese place in the centre',
                      intent: 'restaurant_search',
                      entities: [
                        {
                          start: 10,
                          end: 17,
                          value: 'chinese',
                          entity: 'Cuisine',
                        },
                        {
                          start: 31,
                          end: 37,
                          value: 'centre',
                          entity: 'Location',
                        },
                      ],
                    },
                  ],
                  lookup_tables: [
                    {
                      name: 'Plates',
                      elements: ['beans', 'cheese', 'rice', 'tacos'],
                    },
                  ],
                  entity_synonyms: [
                    {
                      value: 'chinese',
                      synonyms: ['Chinese', 'Chines', 'chines'],
                    },
                    {
                      value: 'vegetarian',
                      synonyms: ['veggie', 'vegg'],
                    },
                    {
                      value: 'centre',
                      synonyms: ['center'],
                    },
                  ],
                },
              },
            },
          ],
        },
        result: {
          version: '4.0',
          invocation: '',
          intents: [
            {
              name: 'greet',
              phrases: ['hey', 'howdy'],
            },
            {
              name: 'restaurant_search',
              phrases: [
                "i'm looking for a place to eat",
                "i'm looking for a place to eat {Plates}",
                'show me {Cuisine} restaurants',
                'show me a {Cuisine} place in the {Location}',
              ],
              entities: [
                {
                  name: 'Plates',
                  type: 'Plates',
                },
                {
                  name: 'Cuisine',
                  type: 'Cuisine',
                },
                {
                  name: 'Location',
                  type: 'Location',
                },
              ],
            },
          ],
          entityTypes: [
            {
              name: 'Plates',
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
            {
              name: 'Cuisine',
              values: [
                {
                  value: 'chinese',
                  synonyms: ['Chinese', 'Chines', 'chines'],
                },
              ],
            },
            {
              name: 'Location',
              values: [
                {
                  value: 'centre',
                  synonyms: ['center'],
                },
              ],
            },
          ],
        },
      },
    ];

    for (const testData of testsData) {
      const jovoModel = new JovoModelRasa();
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
        description: "should export 'intents' without entities as 'common_examples'",
        input: {
          locale: 'en',
          data: {
            version: '4.0',
            invocation: '',
            intents: [
              {
                name: 'greet',
                phrases: ['hey', 'howdy'],
              },
            ],
          },
        },
        result: [
          {
            path: ['en.json'],
            content: {
              rasa_nlu_data: {
                common_examples: [
                  {
                    text: 'hey',
                    intent: 'greet',
                    entities: [],
                  },
                  {
                    text: 'howdy',
                    intent: 'greet',
                    entities: [],
                  },
                ],
                entity_synonyms: [],
                lookup_tables: [],
              },
            },
          },
        ],
      },
      {
        description:
          "should replace placeholders with an example value and add it to 'common_examples'",
        input: {
          locale: 'en',
          data: {
            version: '4.0',
            invocation: '',
            intents: [
              {
                name: 'restaurant_search',
                phrases: [
                  "i'm looking for a place to eat",
                  'show me {cuisine} restaurants',
                  'show me a {cuisine} place in the {location}',
                ],
                entities: [
                  {
                    name: 'cuisine',
                    type: 'Cuisine',
                  },
                  {
                    name: 'location',
                    type: 'Location',
                  },
                ],
              },
            ],
            entityTypes: [
              {
                name: 'Cuisine',
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
              {
                name: 'Location',
                values: [
                  {
                    value: 'centre',
                    synonyms: ['center'],
                  },
                ],
              },
            ],
          },
        },
        result: [
          {
            path: ['en.json'],
            content: {
              rasa_nlu_data: {
                common_examples: [
                  {
                    text: "i'm looking for a place to eat",
                    intent: 'restaurant_search',
                    entities: [],
                  },
                  {
                    text: 'show me chinese restaurants',
                    intent: 'restaurant_search',
                    entities: [
                      {
                        start: 8,
                        end: 15,
                        value: 'chinese',
                        entity: 'Cuisine',
                      },
                    ],
                  },
                  {
                    text: 'show me a vegetarian place in the centre',
                    intent: 'restaurant_search',
                    entities: [
                      {
                        start: 10,
                        end: 20,
                        value: 'vegetarian',
                        entity: 'Cuisine',
                      },
                      {
                        start: 34,
                        end: 40,
                        value: 'centre',
                        entity: 'Location',
                      },
                    ],
                  },
                ],
                lookup_tables: [],
                entity_synonyms: [
                  {
                    value: 'chinese',
                    synonyms: ['Chinese', 'Chines', 'chines'],
                  },
                  {
                    value: 'vegetarian',
                    synonyms: ['veggie', 'vegg'],
                  },
                  {
                    value: 'centre',
                    synonyms: ['center'],
                  },
                ],
              },
            },
          },
        ],
      },
      {
        description:
          "should replace placeholders with an example value and add it to 'common_examples' (Spacy built in type, still needs example values defined to create common_examples)",
        input: {
          locale: 'en',
          data: {
            version: '4.0',
            invocation: '',
            intents: [
              {
                name: 'HelloWorldIntent',
                phrases: ['hello', 'say hello', 'say hello world'],
              },
              {
                name: 'MyNameIsIntent',
                phrases: ['{name}', 'my name is {name}', 'i am {name}', 'you can call me {name}'],
                entities: [
                  {
                    name: 'name',
                    type: {
                      rasa: 'PERSON',
                    },
                  },
                ],
              },
            ],
            entityTypes: [
              {
                name: 'PERSON',
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
            ],
          },
        },
        result: [
          {
            path: ['en.json'],
            content: {
              rasa_nlu_data: {
                common_examples: [
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
                        value: 'Alex',
                        entity: 'PERSON',
                        start: 0,
                        end: 4,
                      },
                    ],
                  },
                  {
                    text: 'my name is Andre',
                    intent: 'MyNameIsIntent',
                    entities: [
                      {
                        value: 'Andre',
                        entity: 'PERSON',
                        start: 11,
                        end: 16,
                      },
                    ],
                  },
                  {
                    text: 'i am Florian',
                    intent: 'MyNameIsIntent',
                    entities: [
                      {
                        value: 'Florian',
                        entity: 'PERSON',
                        start: 5,
                        end: 12,
                      },
                    ],
                  },
                  {
                    text: 'you can call me Jan',
                    intent: 'MyNameIsIntent',
                    entities: [
                      {
                        value: 'Jan',
                        entity: 'PERSON',
                        start: 16,
                        end: 19,
                      },
                    ],
                  },
                ],
                lookup_tables: [
                  {
                    name: 'PERSON',
                    elements: ['Alex', 'Andre', 'Florian', 'Jan', 'Kaan', 'Max', 'Pia', 'Ruben'],
                  },
                ],
                entity_synonyms: [],
              },
            },
          },
        ],
      },
      {
        description:
          "should export 'entityTypes' values with only 'value' set as 'lookup_tables' and all other ones as 'entity_synonyms'",
        input: {
          locale: 'en',
          data: {
            version: '4.0',
            invocation: '',
            entityTypes: [
              {
                name: 'Cuisine',
                values: [
                  {
                    id: 1,
                    key: 'chinese',
                    value: 'chinese',
                    synonyms: ['Chinese', 'Chines', 'chines'],
                  },
                ],
              },
              {
                name: 'Plates',
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
            ],
          },
        },
        result: [
          {
            path: ['en.json'],
            content: {
              rasa_nlu_data: {
                common_examples: [],
                lookup_tables: [
                  {
                    name: 'Plates',
                    elements: ['beans', 'cheese', 'rice', 'tacos'],
                  },
                ],
                entity_synonyms: [
                  {
                    value: 'chinese',
                    synonyms: ['Chinese', 'Chines', 'chines'],
                  },
                ],
              },
            },
          },
        ],
      },
      {
        description: 'should work with all above combined',
        input: {
          locale: 'en',
          data: {
            version: '4.0',
            invocation: '',
            intents: [
              {
                name: 'greet',
                phrases: ['hey', 'howdy'],
              },
              {
                name: 'restaurant_search',
                phrases: [
                  "i'm looking for a place to eat",
                  "i'm looking for a place to eat {plates}",
                  'show me {cuisine} restaurants',
                  'show me a {cuisine} place in the {location}',
                ],
                entities: [
                  {
                    name: 'cuisine',
                    type: 'Cuisine',
                  },
                  {
                    name: 'location',
                    type: 'Location',
                  },
                  {
                    name: 'plates',
                    type: 'Plates',
                  },
                ],
              },
            ],
            entityTypes: [
              {
                name: 'Cuisine',
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
              {
                name: 'Location',
                values: [
                  {
                    value: 'centre',
                    synonyms: ['center'],
                  },
                ],
              },
              {
                name: 'Plates',
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
            ],
          },
        },
        result: [
          {
            path: ['en.json'],
            content: {
              rasa_nlu_data: {
                common_examples: [
                  {
                    text: 'hey',
                    intent: 'greet',
                    entities: [],
                  },
                  {
                    text: 'howdy',
                    intent: 'greet',
                    entities: [],
                  },
                  {
                    text: "i'm looking for a place to eat",
                    intent: 'restaurant_search',
                    entities: [],
                  },
                  {
                    text: "i'm looking for a place to eat beans",
                    intent: 'restaurant_search',
                    entities: [
                      {
                        start: 31,
                        end: 36,
                        value: 'beans',
                        entity: 'Plates',
                      },
                    ],
                  },
                  {
                    text: 'show me chinese restaurants',
                    intent: 'restaurant_search',
                    entities: [
                      {
                        start: 8,
                        end: 15,
                        value: 'chinese',
                        entity: 'Cuisine',
                      },
                    ],
                  },
                  {
                    text: 'show me a vegetarian place in the centre',
                    intent: 'restaurant_search',
                    entities: [
                      {
                        start: 10,
                        end: 20,
                        value: 'vegetarian',
                        entity: 'Cuisine',
                      },
                      {
                        start: 34,
                        end: 40,
                        value: 'centre',
                        entity: 'Location',
                      },
                    ],
                  },
                ],
                lookup_tables: [
                  {
                    name: 'Plates',
                    elements: ['beans', 'cheese', 'rice', 'tacos'],
                  },
                ],
                entity_synonyms: [
                  {
                    value: 'chinese',
                    synonyms: ['Chinese', 'Chines', 'chines'],
                  },
                  {
                    value: 'vegetarian',
                    synonyms: ['veggie', 'vegg'],
                  },
                  {
                    value: 'centre',
                    synonyms: ['center'],
                  },
                ],
              },
            },
          },
        ],
      },
    ];

    for (const testData of testsData) {
      const jovoModel = new JovoModelRasa(
        testData.input.data as JovoModelData,
        testData.input.locale,
      );
      test(testData.description, () => {
        expect(jovoModel.exportNative()).toEqual(testData.result);
      });
    }
  });
});
