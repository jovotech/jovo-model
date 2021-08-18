import { JovoModelDialogflow } from '../src';

import { NativeFileInformation, JovoModelData } from '@jovotech/model';

jest.mock('uuid');

describe('JovoModelDialogflow.ts', () => {
  describe('exportJovoModel (toJovoModel)', () => {
    const testsData = [
      {
        description: 'should convert Dialogflow model to JovoModel',
        input: {
          locale: 'en',
          inputFiles: [
            {
              path: ['intents', 'Welcome.json'],
              content: {
                name: 'Welcome',
                auto: true,
                webhookUsed: true,
              },
            },
            {
              path: ['intents', 'Welcome_usersays_en.json'],
              content: [
                {
                  data: [
                    {
                      text: 'hey',
                      userDefined: false,
                    },
                  ],
                  isTemplate: false,
                  count: 0,
                  lang: 'en',
                },
                {
                  data: [
                    {
                      text: 'howdy',
                      userDefined: false,
                    },
                  ],
                  isTemplate: false,
                  count: 0,
                  lang: 'en',
                },
              ],
            },
            {
              path: ['entities', 'Cuisine.json'],
              content: {
                name: 'Cuisine',
                isOverridable: true,
                isEnum: false,
                automatedExpansion: false,
                isRegexp: false,
                allowFuzzyExtraction: false,
              },
            },
            {
              path: ['entities', 'Cuisine_entries_en.json'],
              content: [
                {
                  value: 'chinese',
                  synonyms: ['chinese', 'Chinese', 'Chines', 'chines'],
                },
                {
                  value: 'vegetarian',
                  synonyms: ['vegetarian', 'veggie', 'vegg'],
                },
              ],
            },
            {
              path: ['entities', 'Location.json'],
              content: {
                name: 'Location',
                isOverridable: true,
                isEnum: false,
                automatedExpansion: false,
                isRegexp: false,
                allowFuzzyExtraction: false,
              },
            },
            {
              path: ['entities', 'Location_entries_en.json'],
              content: [
                {
                  value: 'centre',
                  synonyms: ['centre', 'center'],
                },
              ],
            },
            {
              path: ['entities', 'Plates.json'],
              content: {
                name: 'Plates',
                isOverridable: true,
                isEnum: false,
                automatedExpansion: false,
                isRegexp: false,
                allowFuzzyExtraction: false,
              },
            },
            {
              path: ['entities', 'Plates_entries_en.json'],
              content: [
                {
                  value: 'beans',
                  synonyms: ['beans'],
                },
                {
                  value: 'cheese',
                  synonyms: ['cheese'],
                },
                {
                  value: 'rice',
                  synonyms: ['rice'],
                },
                {
                  value: 'tacos',
                  synonyms: ['tacos'],
                },
              ],
            },
            {
              path: ['intents', 'RestaurantSearch.json'],
              content: {
                name: 'RestaurantSearch',
                auto: true,
                webhookUsed: true,
                responses: [
                  {
                    parameters: [
                      {
                        isList: false,
                        name: 'cuisine',
                        value: '$cuisine',
                        dataType: '@Cuisine',
                      },
                      {
                        isList: false,
                        name: 'location',
                        value: '$location',
                        dataType: '@Location',
                      },
                      {
                        isList: false,
                        name: 'plates',
                        value: '$plates',
                        dataType: '@Plates',
                      },
                    ],
                  },
                ],
              },
            },
            {
              path: ['intents', 'RestaurantSearch_usersays_en.json'],
              content: [
                {
                  data: [
                    {
                      text: "i'm looking for a place to eat",
                      userDefined: false,
                    },
                  ],
                  isTemplate: false,
                  count: 0,
                  lang: 'en',
                },
                {
                  data: [
                    {
                      text: "i'm looking for a place to eat ",
                      userDefined: false,
                    },
                    {
                      text: 'plates',
                      userDefined: true,
                      alias: 'plates',
                      meta: '@Plates',
                    },
                  ],
                  isTemplate: false,
                  count: 0,
                  lang: 'en',
                },
                {
                  data: [
                    {
                      text: 'show me ',
                      userDefined: false,
                    },
                    {
                      text: 'cuisine',
                      userDefined: true,
                      alias: 'cuisine',
                      meta: '@Cuisine',
                    },
                    {
                      text: ' restaurants',
                      userDefined: false,
                    },
                  ],
                  isTemplate: false,
                  count: 0,
                  lang: 'en',
                },
                {
                  data: [
                    {
                      text: 'show me a ',
                      userDefined: false,
                    },
                    {
                      text: 'cuisine',
                      userDefined: true,
                      alias: 'cuisine',
                      meta: '@Cuisine',
                    },
                    {
                      text: ' place in the ',
                      userDefined: false,
                    },
                    {
                      text: 'location',
                      userDefined: true,
                      alias: 'location',
                      meta: '@Location',
                    },
                  ],
                  isTemplate: false,
                  count: 0,
                  lang: 'en',
                },
              ],
            },
            {
              path: ['entities', 'OrderCode.json'],
              content: {
                name: 'OrderCode',
                isOverridable: true,
                automatedExpansion: false,
                isRegexp: true,
                allowFuzzyExtraction: false,
              },
            },
            {
              path: ['entities', 'OrderCode_entries_en.json'],
              content: [
                {
                  value: 'w{4}',
                },
              ],
            },
          ],
        },
        result: {
          version: '4.0',
          invocation: '',
          intents: [
            {
              name: 'Welcome',
              dialogflow: {
                webhookUsed: true,
              },
              phrases: ['hey', 'howdy'],
            },
            {
              name: 'RestaurantSearch',
              dialogflow: {
                webhookUsed: true,
              },
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
            {
              name: 'OrderCode',
              dialogflow: {
                isRegexp: true,
              },
              values: [
                {
                  value: 'w{4}',
                },
              ],
            },
          ],
        },
      },
    ];

    for (const testData of testsData) {
      const jovoModel = new JovoModelDialogflow();
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
        description: 'should convert JovoModel to Dialogflow model',
        input: {
          locale: 'en',
          data: {
            version: '4.0',
            invocation: 'my test app',
            intents: [
              {
                name: 'Welcome',
                phrases: ['hey', 'howdy'],
              },
              {
                name: 'RestaurantSearch',
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
                  {
                    name: 'ordercode',
                    type: 'OrderCode',
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
              {
                name: 'OrderCode',
                dialogflow: {
                  isRegexp: true,
                },
                values: [
                  {
                    value: 'w{4}',
                  },
                ],
              },
            ],
          },
        },
        result: [
          {
            path: ['intents', 'Welcome.json'],
            content: {
              name: 'Welcome',
              auto: true,
              webhookUsed: true,
            },
          },
          {
            path: ['intents', 'Welcome_usersays_en.json'],
            content: [
              {
                data: [
                  {
                    text: 'hey',
                    userDefined: false,
                  },
                ],
                isTemplate: false,
                count: 0,
                lang: 'en',
              },
              {
                data: [
                  {
                    text: 'howdy',
                    userDefined: false,
                  },
                ],
                isTemplate: false,
                count: 0,
                lang: 'en',
              },
            ],
          },
          {
            path: ['entities', 'Cuisine.json'],
            content: {
              name: 'Cuisine',
              isOverridable: true,
              isEnum: false,
              automatedExpansion: false,
              allowFuzzyExtraction: false,
              isRegexp: false,
            },
          },
          {
            path: ['entities', 'Cuisine_entries_en.json'],
            content: [
              {
                value: 'chinese',
                synonyms: ['chinese', 'Chinese', 'Chines', 'chines'],
              },
              {
                value: 'vegetarian',
                synonyms: ['vegetarian', 'veggie', 'vegg'],
              },
            ],
          },
          {
            path: ['entities', 'Location.json'],
            content: {
              name: 'Location',
              isOverridable: true,
              isEnum: false,
              automatedExpansion: false,
              allowFuzzyExtraction: false,
              isRegexp: false,
            },
          },
          {
            path: ['entities', 'Location_entries_en.json'],
            content: [
              {
                value: 'centre',
                synonyms: ['centre', 'center'],
              },
            ],
          },
          {
            path: ['entities', 'Plates.json'],
            content: {
              name: 'Plates',
              isOverridable: true,
              isEnum: false,
              automatedExpansion: false,
              allowFuzzyExtraction: false,
              isRegexp: false,
            },
          },
          {
            path: ['entities', 'Plates_entries_en.json'],
            content: [
              {
                value: 'beans',
                synonyms: ['beans'],
              },
              {
                value: 'cheese',
                synonyms: ['cheese'],
              },
              {
                value: 'rice',
                synonyms: ['rice'],
              },
              {
                value: 'tacos',
                synonyms: ['tacos'],
              },
            ],
          },
          {
            path: ['entities', 'OrderCode.json'],
            content: {
              name: 'OrderCode',
              isOverridable: true,
              automatedExpansion: false,
              isEnum: false,
              isRegexp: true,
              allowFuzzyExtraction: false,
            },
          },
          {
            path: ['entities', 'OrderCode_entries_en.json'],
            content: [
              {
                value: 'w{4}',
              },
            ],
          },
          {
            path: ['intents', 'RestaurantSearch.json'],
            content: {
              name: 'RestaurantSearch',
              auto: true,
              webhookUsed: true,
              responses: [
                {
                  parameters: [
                    {
                      isList: false,
                      name: 'cuisine',
                      value: '$cuisine',
                      dataType: '@Cuisine',
                    },
                    {
                      isList: false,
                      name: 'location',
                      value: '$location',
                      dataType: '@Location',
                    },
                    {
                      isList: false,
                      name: 'plates',
                      value: '$plates',
                      dataType: '@Plates',
                    },
                    {
                      isList: false,
                      name: 'ordercode',
                      value: '$ordercode',
                      dataType: '@OrderCode',
                    },
                  ],
                },
              ],
            },
          },
          {
            path: ['intents', 'RestaurantSearch_usersays_en.json'],
            content: [
              {
                data: [
                  {
                    text: "i'm looking for a place to eat",
                    userDefined: false,
                  },
                ],
                isTemplate: false,
                count: 0,
                lang: 'en',
              },
              {
                data: [
                  {
                    text: "i'm looking for a place to eat ",
                    userDefined: false,
                  },
                  {
                    text: 'plates',
                    userDefined: true,
                    alias: 'plates',
                    meta: '@Plates',
                  },
                ],
                isTemplate: false,
                count: 0,
                lang: 'en',
              },
              {
                data: [
                  {
                    text: 'show me ',
                    userDefined: false,
                  },
                  {
                    text: 'cuisine',
                    userDefined: true,
                    alias: 'cuisine',
                    meta: '@Cuisine',
                  },
                  {
                    text: ' restaurants',
                    userDefined: false,
                  },
                ],
                isTemplate: false,
                count: 0,
                lang: 'en',
              },
              {
                data: [
                  {
                    text: 'show me a ',
                    userDefined: false,
                  },
                  {
                    text: 'cuisine',
                    userDefined: true,
                    alias: 'cuisine',
                    meta: '@Cuisine',
                  },
                  {
                    text: ' place in the ',
                    userDefined: false,
                  },
                  {
                    text: 'location',
                    userDefined: true,
                    alias: 'location',
                    meta: '@Location',
                  },
                ],
                isTemplate: false,
                count: 0,
                lang: 'en',
              },
            ],
          },
        ],
      },
    ];

    for (const testData of testsData) {
      const jovoModel = new JovoModelDialogflow(
        testData.input.data as JovoModelData,
        testData.input.locale,
      );
      test(testData.description, () => {
        const result = jovoModel.exportNative();

        // delete variable ids
        delete result![2].content.id;
        delete result![4].content.id;
        delete result![6].content.id;
        delete result![8].content.id;

        expect(result).toEqual(testData.result);
      });
    }
  });
});
