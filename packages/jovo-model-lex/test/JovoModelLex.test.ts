import { JovoModelLex } from '../src';

import { NativeFileInformation, JovoModelData } from '@jovotech/model';

describe('JovoModelLex.ts', () => {
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
                metadata: {
                  schemaVersion: '1.0',
                  importType: 'LEX',
                  importFormat: 'JSON',
                },
                resource: {
                  name: 'JovoApp',
                  childDirected: false,
                  locale: 'en-US',
                  intents: [
                    {
                      name: 'Welcome',
                      version: '$LATEST',
                      fulfillmentActivity: {
                        type: 'ReturnIntent',
                      },
                      sampleUtterances: ['hey', 'howdy'],
                    },
                    {
                      name: 'RestaurantSearch',
                      version: '$LATEST',
                      fulfillmentActivity: {
                        type: 'ReturnIntent',
                      },
                      sampleUtterances: [
                        "i'm looking for a place to eat",
                        "i'm looking for a place to eat {plates}",
                        'show me {cuisine} restaurants',
                        'show me a {cuisine} place in the {location}',
                      ],
                      slots: [
                        {
                          name: 'cuisine',
                          slotType: 'Cuisine',
                          slotConstraint: 'Required',
                        },
                        {
                          name: 'location',
                          slotType: 'Location',
                          slotConstraint: 'Required',
                        },
                        {
                          name: 'plates',
                          slotType: 'Plates',
                          slotConstraint: 'Required',
                        },
                      ],
                    },
                  ],
                  slotTypes: [
                    {
                      name: 'Cuisine',
                      enumerationValues: [
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
                    {
                      name: 'Location',
                      enumerationValues: [
                        {
                          value: 'centre',
                          synonyms: ['center'],
                        },
                      ],
                    },
                    {
                      name: 'Plates',
                      enumerationValues: [
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
        description: 'it should set Alexa/AMAZON types again correctly',
        input: {
          locale: 'en',
          inputFiles: [
            {
              path: ['en-US.json'],
              content: {
                metadata: {
                  schemaVersion: '1.0',
                  importType: 'LEX',
                  importFormat: 'JSON',
                },
                resource: {
                  name: 'JovoApp',
                  locale: 'en-US',
                  intents: [
                    {
                      name: 'HelloWorldIntent',
                      version: '$LATEST',
                      fulfillmentActivity: {
                        type: 'ReturnIntent',
                      },
                      sampleUtterances: ['hello', 'say hello', 'say hello world'],
                    },
                    {
                      name: 'MyNameIsIntent',
                      version: '$LATEST',
                      fulfillmentActivity: {
                        type: 'ReturnIntent',
                      },
                      sampleUtterances: [
                        '{name}',
                        'my name is {name}',
                        'i am {name}',
                        'you can call me {name}',
                      ],
                      slots: [
                        {
                          name: 'name',
                          slotType: 'AMAZON.US_FIRST_NAME',
                          slotConstraint: 'Required',
                        },
                      ],
                    },
                  ],
                  slotTypes: [],
                  childDirected: false,
                },
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
              phrases: ['{name}', 'my name is {name}', 'i am {name}', 'you can call me {name}'],
              entities: {
                name: {
                  type: {
                    alexa: 'AMAZON.US_FIRST_NAME',
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
      const jovoModel = new JovoModelLex();
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
        description: 'should convert the intents and save the entityTypes as slotTypes',
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
              metadata: {
                schemaVersion: '1.0',
                importType: 'LEX',
                importFormat: 'JSON',
              },
              resource: {
                name: 'JovoApp',
                childDirected: false,
                locale: 'en-US',
                intents: [
                  {
                    name: 'Welcome',
                    version: '$LATEST',
                    fulfillmentActivity: {
                      type: 'ReturnIntent',
                    },
                    sampleUtterances: ['hey', 'howdy'],
                  },
                  {
                    name: 'RestaurantSearch',
                    version: '$LATEST',
                    fulfillmentActivity: {
                      type: 'ReturnIntent',
                    },
                    sampleUtterances: [
                      "i'm looking for a place to eat",
                      "i'm looking for a place to eat {plates}",
                      'show me {cuisine} restaurants',
                      'show me a {cuisine} place in the {location}',
                    ],
                    slots: [
                      {
                        name: 'cuisine',
                        slotType: 'Cuisine',
                        slotConstraint: 'Required',
                      },
                      {
                        name: 'location',
                        slotType: 'Location',
                        slotConstraint: 'Required',
                      },
                      {
                        name: 'plates',
                        slotType: 'Plates',
                        slotConstraint: 'Required',
                      },
                    ],
                  },
                ],
                slotTypes: [
                  {
                    name: 'Cuisine',
                    enumerationValues: [
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
                  {
                    name: 'Location',
                    enumerationValues: [
                      {
                        value: 'centre',
                        synonyms: ['center'],
                      },
                    ],
                  },
                  {
                    name: 'Plates',
                    enumerationValues: [
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
          },
        ],
      },
      {
        description: 'it should use Alexa/AMAZON types if defined',
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
                      alexa: 'AMAZON.US_FIRST_NAME',
                    },
                  },
                },
              },
            },
          },
        },
        result: [
          {
            path: ['en-US.json'],
            content: {
              metadata: {
                schemaVersion: '1.0',
                importType: 'LEX',
                importFormat: 'JSON',
              },
              resource: {
                name: 'JovoApp',
                locale: 'en-US',
                intents: [
                  {
                    name: 'HelloWorldIntent',
                    version: '$LATEST',
                    fulfillmentActivity: {
                      type: 'ReturnIntent',
                    },
                    sampleUtterances: ['hello', 'say hello', 'say hello world'],
                  },
                  {
                    name: 'MyNameIsIntent',
                    version: '$LATEST',
                    fulfillmentActivity: {
                      type: 'ReturnIntent',
                    },
                    sampleUtterances: [
                      '{name}',
                      'my name is {name}',
                      'i am {name}',
                      'you can call me {name}',
                    ],
                    slots: [
                      {
                        name: 'name',
                        slotType: 'AMAZON.US_FIRST_NAME',
                        slotConstraint: 'Required',
                      },
                    ],
                  },
                ],
                slotTypes: [],
                childDirected: false,
              },
            },
          },
        ],
      },
    ];

    for (const testData of testsData) {
      const jovoModel = new JovoModelLex(
        testData.input.data as unknown as JovoModelData,
        testData.input.locale,
      );
      test(testData.description, () => {
        expect(jovoModel.exportNative()).toEqual(testData.result);
      });
    }
  });
});
