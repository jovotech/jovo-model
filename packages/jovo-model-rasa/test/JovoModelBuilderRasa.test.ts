import {
    JovoModelBuilderRasa,
} from '../src';

import {
    JovoConfigReader,
} from 'jovo-config';


import {
    JovoModel,
} from 'jovo-model-core';



describe("JovoModelBuilderRasa.ts", () => {

    describe("fromJovoModel", () => {

        const testsData = [
            {
                "description": "should export 'intents' without inputs as 'common_examples'",
                "input": {
                    "locale": "en",
                    "data": {
                        "invocation": "",
                        "intents": [
                            {
                                "name": "greet",
                                "phrases": [
                                    "hey",
                                    "howdy",
                                ],
                            },
                        ],
                    },
                },
                "result": [
                    {
                        "path": [
                            "en.json"
                        ],
                        "content": {
                            "rasa_nlu_data": {
                                "common_examples": [
                                    {
                                        "text": "hey",
                                        "intent": "greet",
                                        "entities": [],
                                    },
                                    {
                                        "text": "howdy",
                                        "intent": "greet",
                                        "entities": []
                                    },
                                ],
                                "entity_synonyms": [],
                                "lookup_tables": [],
                            },
                        },
                    }
                ]
            },
            {
                "description": "should replace placeholders with an example value and add it to 'common_examples'",
                "input": {
                    "locale": "en",
                    "data": {
                        "invocation": "",
                        "intents": [
                            {
                                "name": "restaurant_search",
                                "phrases": [
                                    "i'm looking for a place to eat",
                                    "show me {cuisine} restaurants",
                                    "show me a {cuisine} place in the {location}",
                                ],
                                "inputs": [
                                    {
                                        "name": "cuisine",
                                        "type": "cuisine"
                                    },
                                    {
                                        "name": "location",
                                        "type": "location"
                                    },
                                ]
                            },
                        ],
                        "inputTypes": [
                            {
                                "name": "cuisine",
                                "values": [
                                    {
                                        "id": 1,
                                        "key": "chinese",
                                        "value": "chinese",
                                        "synonyms": [
                                            "Chinese",
                                            "Chines",
                                            "chines",
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "key": "vegetarian",
                                        "value": "vegetarian",
                                        "synonyms": [
                                            "veggie",
                                            "vegg",
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "location",
                                "values": [
                                    {
                                        "value": "centre",
                                        "synonyms": [
                                            "center",
                                        ]
                                    }
                                ]
                            },
                        ],
                    },
                },
                "result": [
                    {
                        "path": [
                            "en.json"
                        ],
                        "content": {
                            "rasa_nlu_data": {
                                "common_examples": [
                                    {
                                        "text": "i'm looking for a place to eat",
                                        "intent": "restaurant_search",
                                        "entities": [],
                                    },
                                    {
                                        "text": "show me chinese restaurants",
                                        "intent": "restaurant_search",
                                        "entities": [
                                            {
                                                "start": 8,
                                                "end": 15,
                                                "value": "chinese",
                                                "entity": "cuisine",
                                            },
                                        ],
                                    },
                                    {
                                        "text": "show me a chinese place in the centre",
                                        "intent": "restaurant_search",
                                        "entities": [
                                            {
                                                "start": 10,
                                                "end": 17,
                                                "value": "chinese",
                                                "entity": "cuisine",
                                            },
                                            {
                                                "start": 31,
                                                "end": 37,
                                                "value": "centre",
                                                "entity": "location",
                                            },
                                        ],
                                    },
                                ],
                                "lookup_tables": [],
                                "entity_synonyms": [
                                    {
                                        "value": "chinese",
                                        "synonyms": [
                                            "Chinese",
                                            "Chines",
                                            "chines",
                                        ]
                                    },
                                    {
                                        "value": "vegetarian",
                                        "synonyms": [
                                            "veggie",
                                            "vegg",
                                        ],
                                    },
                                    {
                                        "value": "centre",
                                        "synonyms": [
                                            "center",
                                        ],
                                    },
                                ],
                            },
                        },
                    }
                ]
            },
            {
                "description": "should export 'inputTypes' values with only 'value' set as 'lookup_tables' and all other ones as 'entity_synonyms'",
                "input": {
                    "locale": "en",
                    "data": {
                        "invocation": "",
                        "inputTypes": [
                            {
                                "name": "cuisine",
                                "values": [
                                    {
                                        "id": 1,
                                        "key": "chinese",
                                        "value": "chinese",
                                        "synonyms": [
                                            "Chinese",
                                            "Chines",
                                            "chines",
                                        ]
                                    },
                                ]
                            },
                            {
                                "name": "plates",
                                "values": [
                                    {
                                        "value": "beans",
                                    },
                                    {
                                        "value": "cheese",
                                    },
                                    {
                                        "value": "rice",
                                    },
                                    {
                                        "value": "tacos",
                                    }
                                ]
                            },
                        ],
                    },
                },
                "result": [
                    {
                        "path": [
                            "en.json"
                        ],
                        "content": {
                            "rasa_nlu_data": {
                                "common_examples": [],
                                "lookup_tables": [
                                    {
                                        "name": "plates",
                                        "elements": ["beans", "cheese", "rice", "tacos"]
                                    }
                                ],
                                "entity_synonyms": [
                                    {
                                        "value": "chinese",
                                        "synonyms": [
                                            "Chinese",
                                            "Chines",
                                            "chines",
                                        ]
                                    },
                                ],
                            },
                        },
                    }
                ]
            },
            {
                "description": "should work with all above combined",
                "input": {
                    "locale": "en",
                    "data": {
                        "invocation": "",
                        "intents": [
                            {
                                "name": "greet",
                                "phrases": [
                                    "hey",
                                    "howdy",
                                ]
                            },
                            {
                                "name": "restaurant_search",
                                "phrases": [
                                    "i'm looking for a place to eat",
                                    "i'm looking for a place to eat {plates}",
                                    "show me {cuisine} restaurants",
                                    "show me a {cuisine} place in the {location}",
                                ],
                                "inputs": [
                                    {
                                        "name": "cuisine",
                                        "type": "cuisine"
                                    },
                                    {
                                        "name": "location",
                                        "type": "location"
                                    },
                                    {
                                        "name": "plates",
                                        "type": "plates"
                                    },
                                ]
                            },
                        ],
                        "inputTypes": [
                            {
                                "name": "cuisine",
                                "values": [
                                    {
                                        "id": 1,
                                        "key": "chinese",
                                        "value": "chinese",
                                        "synonyms": [
                                            "Chinese",
                                            "Chines",
                                            "chines",
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "key": "vegetarian",
                                        "value": "vegetarian",
                                        "synonyms": [
                                            "veggie",
                                            "vegg",
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "location",
                                "values": [
                                    {
                                        "value": "centre",
                                        "synonyms": [
                                            "center",
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "plates",
                                "values": [
                                    {
                                        "value": "beans",
                                    },
                                    {
                                        "value": "cheese",
                                    },
                                    {
                                        "value": "rice",
                                    },
                                    {
                                        "value": "tacos",
                                    }
                                ]
                            },
                        ],
                    },
                },
                "result": [
                    {
                        "path": [
                            "en.json"
                        ],
                        "content": {
                            "rasa_nlu_data": {
                                "common_examples": [
                                    {
                                        "text": "hey",
                                        "intent": "greet",
                                        "entities": [],
                                    },
                                    {
                                        "text": "howdy",
                                        "intent": "greet",
                                        "entities": []
                                    },
                                    {
                                        "text": "i'm looking for a place to eat",
                                        "intent": "restaurant_search",
                                        "entities": [],
                                    },
                                    {
                                        "text": "i'm looking for a place to eat beans",
                                        "intent": "restaurant_search",
                                        "entities": [
                                            {
                                                "start": 31,
                                                "end": 36,
                                                "value": "beans",
                                                "entity": "plates",
                                            },
                                        ],
                                    },
                                    {
                                        "text": "show me chinese restaurants",
                                        "intent": "restaurant_search",
                                        "entities": [
                                            {
                                                "start": 8,
                                                "end": 15,
                                                "value": "chinese",
                                                "entity": "cuisine",
                                            },
                                        ],
                                    },
                                    {
                                        "text": "show me a chinese place in the centre",
                                        "intent": "restaurant_search",
                                        "entities": [
                                            {
                                                "start": 10,
                                                "end": 17,
                                                "value": "chinese",
                                                "entity": "cuisine",
                                            },
                                            {
                                                "start": 31,
                                                "end": 37,
                                                "value": "centre",
                                                "entity": "location",
                                            },
                                        ],
                                    },
                                ],
                                "lookup_tables": [
                                    {
                                        "name": "plates",
                                        "elements": ["beans", "cheese", "rice", "tacos"]
                                    }
                                ],
                                "entity_synonyms": [
                                    {
                                        "value": "chinese",
                                        "synonyms": [
                                            "Chinese",
                                            "Chines",
                                            "chines",
                                        ]
                                    },
                                    {
                                        "value": "vegetarian",
                                        "synonyms": [
                                            "veggie",
                                            "vegg",
                                        ],
                                    },
                                    {
                                        "value": "centre",
                                        "synonyms": [
                                            "center",
                                        ],
                                    },
                                ],
                            },
                        },
                    }
                ]
            },
        ];

        const stage = '';
        const configReader = new JovoConfigReader({});
        for (const testData of testsData) {
            const jovoModelBuilder = new JovoModelBuilderRasa();
            test(testData.description, () => {
                expect(jovoModelBuilder.fromJovoModel(configReader, testData.input.data as JovoModel, testData.input.locale, stage)).toEqual(testData.result);
            });
        }

    });

});
