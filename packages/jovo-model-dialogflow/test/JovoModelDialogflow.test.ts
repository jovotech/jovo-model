import {
    JovoModelDialogflow,
} from '../src';

import {
    NativeFileInformation,
    JovoModelData,
} from 'jovo-model';



describe("JovoModelDialogflow.ts", () => {

    describe("exportJovoModel (toJovoModel)", () => {

        const testsData = [
            {
                "description": "should convert Dialogflow model to JovoModel",
                "input": {
                    "locale": "en",
                    "inputFiles": [
                        {
                            "path": [
                                "intents",
                                "Welcome.json"
                            ],
                            "content": {
                                "name": "Welcome",
                                "auto": true,
                                "webhookUsed": true
                            }
                        },
                        {
                            "path": [
                                "intents",
                                "Welcome_usersays_en.json"
                            ],
                            "content": [
                                {
                                    "data": [
                                        {
                                            "text": "hey",
                                            "userDefined": false
                                        }
                                    ],
                                    "isTemplate": false,
                                    "count": 0
                                },
                                {
                                    "data": [
                                        {
                                            "text": "howdy",
                                            "userDefined": false
                                        }
                                    ],
                                    "isTemplate": false,
                                    "count": 0
                                }
                            ]
                        },
                        {
                            "path": [
                                "entities",
                                "Cuisine.json"
                            ],
                            "content": {
                                "name": "Cuisine",
                                "isOverridable": true,
                                "isEnum": false,
                                "automatedExpansion": false
                            }
                        },
                        {
                            "path": [
                                "entities",
                                "Cuisine_entries_en.json"
                            ],
                            "content": [
                                {
                                    "value": "chinese",
                                    "synonyms": [
                                        "chinese",
                                        "Chinese",
                                        "Chines",
                                        "chines"
                                    ]
                                },
                                {
                                    "value": "vegetarian",
                                    "synonyms": [
                                        "vegetarian",
                                        "veggie",
                                        "vegg"
                                    ]
                                }
                            ]
                        },
                        {
                            "path": [
                                "entities",
                                "Location.json"
                            ],
                            "content": {
                                "name": "Location",
                                "isOverridable": true,
                                "isEnum": false,
                                "automatedExpansion": false
                            }
                        },
                        {
                            "path": [
                                "entities",
                                "Location_entries_en.json"
                            ],
                            "content": [
                                {
                                    "value": "centre",
                                    "synonyms": [
                                        "centre",
                                        "center"
                                    ]
                                }
                            ]
                        },
                        {
                            "path": [
                                "entities",
                                "Plates.json"
                            ],
                            "content": {
                                "name": "Plates",
                                "isOverridable": true,
                                "isEnum": false,
                                "automatedExpansion": false
                            }
                        },
                        {
                            "path": [
                                "entities",
                                "Plates_entries_en.json"
                            ],
                            "content": [
                                {
                                    "value": "beans",
                                    "synonyms": [
                                        "beans"
                                    ]
                                },
                                {
                                    "value": "cheese",
                                    "synonyms": [
                                        "cheese"
                                    ]
                                },
                                {
                                    "value": "rice",
                                    "synonyms": [
                                        "rice"
                                    ]
                                },
                                {
                                    "value": "tacos",
                                    "synonyms": [
                                        "tacos"
                                    ]
                                }
                            ]
                        },
                        {
                            "path": [
                                "intents",
                                "RestaurantSearch.json"
                            ],
                            "content": {
                                "name": "RestaurantSearch",
                                "auto": true,
                                "webhookUsed": true,
                                "responses": [
                                    {
                                        "parameters": [
                                            {
                                                "isList": false,
                                                "name": "cuisine",
                                                "value": "$cuisine",
                                                "dataType": "@Cuisine"
                                            },
                                            {
                                                "isList": false,
                                                "name": "location",
                                                "value": "$location",
                                                "dataType": "@Location"
                                            },
                                            {
                                                "isList": false,
                                                "name": "plates",
                                                "value": "$plates",
                                                "dataType": "@Plates"
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            "path": [
                                "intents",
                                "RestaurantSearch_usersays_en.json"
                            ],
                            "content": [
                                {
                                    "data": [
                                        {
                                            "text": "i'm looking for a place to eat",
                                            "userDefined": false
                                        }
                                    ],
                                    "isTemplate": false,
                                    "count": 0
                                },
                                {
                                    "data": [
                                        {
                                            "text": "i'm looking for a place to eat ",
                                            "userDefined": false
                                        },
                                        {
                                            "text": "plates",
                                            "userDefined": true,
                                            "alias": "plates",
                                            "meta": "@Plates"
                                        }
                                    ],
                                    "isTemplate": false,
                                    "count": 0
                                },
                                {
                                    "data": [
                                        {
                                            "text": "show me ",
                                            "userDefined": false
                                        },
                                        {
                                            "text": "cuisine",
                                            "userDefined": true,
                                            "alias": "cuisine",
                                            "meta": "@Cuisine"
                                        },
                                        {
                                            "text": " restaurants",
                                            "userDefined": false
                                        }
                                    ],
                                    "isTemplate": false,
                                    "count": 0
                                },
                                {
                                    "data": [
                                        {
                                            "text": "show me a ",
                                            "userDefined": false
                                        },
                                        {
                                            "text": "cuisine",
                                            "userDefined": true,
                                            "alias": "cuisine",
                                            "meta": "@Cuisine"
                                        },
                                        {
                                            "text": " place in the ",
                                            "userDefined": false
                                        },
                                        {
                                            "text": "location",
                                            "userDefined": true,
                                            "alias": "location",
                                            "meta": "@Location"
                                        }
                                    ],
                                    "isTemplate": false,
                                    "count": 0
                                }
                            ]
                        }
                    ],
                },
                "result": {
                    "invocation": "",
                    "intents": [
                        {
                            "name": "Welcome",
                            "dialogflow": {
                                "webhookUsed": true,
                            },
                            "phrases": [
                                "hey",
                                "howdy"
                            ],
                        },
                        {
                            "name": "RestaurantSearch",
                            "dialogflow": {
                                "webhookUsed": true,
                            },
                            "phrases": [
                                "i'm looking for a place to eat",
                                "i'm looking for a place to eat {plates}",
                                "show me {cuisine} restaurants",
                                "show me a {cuisine} place in the {location}"
                            ],
                            "inputs": [
                                {
                                    "name": "cuisine",
                                    "type": "Cuisine"
                                },
                                {
                                    "name": "location",
                                    "type": "Location"
                                },
                                {
                                    "name": "plates",
                                    "type": "Plates"
                                }
                            ]
                        }
                    ],
                    "inputTypes": [
                        {
                            "name": "Cuisine",
                            "values": [
                                {
                                    "value": "chinese",
                                    "synonyms": [
                                        "Chinese",
                                        "Chines",
                                        "chines"
                                    ]
                                },
                                {
                                    "value": "vegetarian",
                                    "synonyms": [
                                        "veggie",
                                        "vegg"
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "Location",
                            "values": [
                                {
                                    "value": "centre",
                                    "synonyms": [
                                        "center"
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "Plates",
                            "values": [
                                {
                                    "value": "beans"
                                },
                                {
                                    "value": "cheese"
                                },
                                {
                                    "value": "rice"
                                },
                                {
                                    "value": "tacos"
                                }
                            ]
                        }
                    ]
                }
            },
        ];

        for (const testData of testsData) {
            const jovoModel = new JovoModelDialogflow();
            test(testData.description, () => {
                jovoModel.importNative(testData.input.inputFiles as NativeFileInformation[], testData.input.locale);
                expect(jovoModel.exportJovoModel()).toEqual(testData.result);
            });
        }

    });


    describe("exportNative (fromJovoModel)", () => {

        const testsData = [
            {
                "description": "should convert JovoModel to Dialogflow model",
                "input": {
                    "locale": "en",
                    "data": {
                        "invocation": "my test app",
                        "intents": [
                            {
                                "name": "Welcome",
                                "phrases": [
                                    "hey",
                                    "howdy"
                                ]
                            },
                            {
                                "name": "RestaurantSearch",
                                "phrases": [
                                    "i'm looking for a place to eat",
                                    "i'm looking for a place to eat {plates}",
                                    "show me {cuisine} restaurants",
                                    "show me a {cuisine} place in the {location}"
                                ],
                                "inputs": [
                                    {
                                        "name": "cuisine",
                                        "type": "Cuisine"
                                    },
                                    {
                                        "name": "location",
                                        "type": "Location"
                                    },
                                    {
                                        "name": "plates",
                                        "type": "Plates"
                                    }
                                ]
                            }
                        ],
                        "inputTypes": [
                            {
                                "name": "Cuisine",
                                "values": [
                                    {
                                        "id": 1,
                                        "key": "chinese",
                                        "value": "chinese",
                                        "synonyms": [
                                            "Chinese",
                                            "Chines",
                                            "chines"
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "key": "vegetarian",
                                        "value": "vegetarian",
                                        "synonyms": [
                                            "veggie",
                                            "vegg"
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "Location",
                                "values": [
                                    {
                                        "value": "centre",
                                        "synonyms": [
                                            "center"
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "Plates",
                                "values": [
                                    {
                                        "value": "beans"
                                    },
                                    {
                                        "value": "cheese"
                                    },
                                    {
                                        "value": "rice"
                                    },
                                    {
                                        "value": "tacos"
                                    }
                                ]
                            }
                        ]
                    },
                },
                "result": [
                    {
                        "path": [
                            "intents",
                            "Welcome.json"
                        ],
                        "content": {
                            "name": "Welcome",
                            "auto": true,
                            "webhookUsed": true
                        }
                    },
                    {
                        "path": [
                            "intents",
                            "Welcome_usersays_en.json"
                        ],
                        "content": [
                            {
                                "data": [
                                    {
                                        "text": "hey",
                                        "userDefined": false
                                    }
                                ],
                                "isTemplate": false,
                                "count": 0
                            },
                            {
                                "data": [
                                    {
                                        "text": "howdy",
                                        "userDefined": false
                                    }
                                ],
                                "isTemplate": false,
                                "count": 0
                            }
                        ]
                    },
                    {
                        "path": [
                            "entities",
                            "Cuisine.json"
                        ],
                        "content": {
                            "name": "Cuisine",
                            "isOverridable": true,
                            "isEnum": false,
                            "automatedExpansion": false
                        }
                    },
                    {
                        "path": [
                            "entities",
                            "Cuisine_entries_en.json"
                        ],
                        "content": [
                            {
                                "value": "chinese",
                                "synonyms": [
                                    "chinese",
                                    "Chinese",
                                    "Chines",
                                    "chines"
                                ]
                            },
                            {
                                "value": "vegetarian",
                                "synonyms": [
                                    "vegetarian",
                                    "veggie",
                                    "vegg"
                                ]
                            }
                        ]
                    },
                    {
                        "path": [
                            "entities",
                            "Location.json"
                        ],
                        "content": {
                            "name": "Location",
                            "isOverridable": true,
                            "isEnum": false,
                            "automatedExpansion": false
                        }
                    },
                    {
                        "path": [
                            "entities",
                            "Location_entries_en.json"
                        ],
                        "content": [
                            {
                                "value": "centre",
                                "synonyms": [
                                    "centre",
                                    "center"
                                ]
                            }
                        ]
                    },
                    {
                        "path": [
                            "entities",
                            "Plates.json"
                        ],
                        "content": {
                            "name": "Plates",
                            "isOverridable": true,
                            "isEnum": false,
                            "automatedExpansion": false
                        }
                    },
                    {
                        "path": [
                            "entities",
                            "Plates_entries_en.json"
                        ],
                        "content": [
                            {
                                "value": "beans",
                                "synonyms": [
                                    "beans"
                                ]
                            },
                            {
                                "value": "cheese",
                                "synonyms": [
                                    "cheese"
                                ]
                            },
                            {
                                "value": "rice",
                                "synonyms": [
                                    "rice"
                                ]
                            },
                            {
                                "value": "tacos",
                                "synonyms": [
                                    "tacos"
                                ]
                            }
                        ]
                    },
                    {
                        "path": [
                            "intents",
                            "RestaurantSearch.json"
                        ],
                        "content": {
                            "name": "RestaurantSearch",
                            "auto": true,
                            "webhookUsed": true,
                            "responses": [
                                {
                                    "parameters": [
                                        {
                                            "isList": false,
                                            "name": "cuisine",
                                            "value": "$cuisine",
                                            "dataType": "@Cuisine"
                                        },
                                        {
                                            "isList": false,
                                            "name": "location",
                                            "value": "$location",
                                            "dataType": "@Location"
                                        },
                                        {
                                            "isList": false,
                                            "name": "plates",
                                            "value": "$plates",
                                            "dataType": "@Plates"
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        "path": [
                            "intents",
                            "RestaurantSearch_usersays_en.json"
                        ],
                        "content": [
                            {
                                "data": [
                                    {
                                        "text": "i'm looking for a place to eat",
                                        "userDefined": false
                                    }
                                ],
                                "isTemplate": false,
                                "count": 0
                            },
                            {
                                "data": [
                                    {
                                        "text": "i'm looking for a place to eat ",
                                        "userDefined": false
                                    },
                                    {
                                        "text": "plates",
                                        "userDefined": true,
                                        "alias": "plates",
                                        "meta": "@Plates"
                                    }
                                ],
                                "isTemplate": false,
                                "count": 0
                            },
                            {
                                "data": [
                                    {
                                        "text": "show me ",
                                        "userDefined": false
                                    },
                                    {
                                        "text": "cuisine",
                                        "userDefined": true,
                                        "alias": "cuisine",
                                        "meta": "@Cuisine"
                                    },
                                    {
                                        "text": " restaurants",
                                        "userDefined": false
                                    }
                                ],
                                "isTemplate": false,
                                "count": 0
                            },
                            {
                                "data": [
                                    {
                                        "text": "show me a ",
                                        "userDefined": false
                                    },
                                    {
                                        "text": "cuisine",
                                        "userDefined": true,
                                        "alias": "cuisine",
                                        "meta": "@Cuisine"
                                    },
                                    {
                                        "text": " place in the ",
                                        "userDefined": false
                                    },
                                    {
                                        "text": "location",
                                        "userDefined": true,
                                        "alias": "location",
                                        "meta": "@Location"
                                    }
                                ],
                                "isTemplate": false,
                                "count": 0
                            }
                        ]
                    }
                ]
            },
        ];

        for (const testData of testsData) {
            const jovoModel = new JovoModelDialogflow(testData.input.data as JovoModelData, testData.input.locale);
            test(testData.description, () => {

                const result = jovoModel.exportNative();

                // delete variable ids
                delete result![2].content.id;
                delete result![4].content.id;
                delete result![6].content.id;

                expect(result).toEqual(testData.result);
            });
        }

    });

});
