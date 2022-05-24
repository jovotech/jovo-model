import {JovoModel, JovoModelData} from "@jovotech/model";
import {JovoModelLexV2} from "../src/JovoModelLexV2";
import {promises as fs} from "fs";
import {join, dirname} from "path";
import {JovoModelDataLexV2} from "../src";

describe('JovoModelLexV2.ts', () => {
    describe('exportNative @v4 (fromJovoModel)', () => {
        const jovoModel: JovoModelDataLexV2 = {
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
            lexv2:     {
                intents: {
                    Welcome: {
                        identifier: "0TZW8H05Y5",
                        slotPriorities: []
                    },
                    RestaurantSearch: {
                        identifier: "G36WE2Y5P6",
                        slotPriorities: [
                            {
                                slotName: "cuisine",
                                priority: 1
                            },
                            {
                                slotName: "location",
                                priority: 2
                            },
                            {
                                slotName: "plates",
                                priority: 3
                            }
                        ],
                        slots: {
                            cuisine: {
                                identifier: "PVS1V1P0RE",
                                valueElicitationSetting: {
                                    promptSpecification: {
                                        maxRetries: 4,
                                        messageGroupsList: [
                                            {
                                                message: {
                                                    plainTextMessage: {
                                                        value: "What should cuisine be?"
                                                    }
                                                }
                                            }
                                        ],
                                        allowInterrupt: true
                                    },
                                    slotConstraint: "Required"
                                }
                            },
                            location: {
                                identifier: "Y1Z5N3HQZM",
                                valueElicitationSetting: {
                                    promptSpecification: {
                                        maxRetries: 4,
                                        messageGroupsList: [
                                            {
                                                message: {
                                                    plainTextMessage: {
                                                        value: "What should location be?"
                                                    }
                                                }
                                            }
                                        ],
                                        allowInterrupt: true
                                    },
                                    slotConstraint: "Required"
                                }
                            },
                            plates: {
                                identifier: "PIRRALI865",
                                valueElicitationSetting: {
                                    promptSpecification: {
                                        maxRetries: 4,
                                        messageGroupsList: [
                                            {
                                                message: {
                                                    plainTextMessage: {
                                                        value: "What should plates be?"
                                                    }
                                                }
                                            }
                                        ],
                                        allowInterrupt: true
                                    },
                                    slotConstraint: "Required"
                                }
                            }
                        }
                    }
                },
                slotTypes: {
                    Cuisine: {
                        identifier: "N50JV4LVCF",
                    },
                    Location: {
                        identifier: "TCLUY3J2U2",
                    },
                    Plates: {
                        identifier: "GM7QMUGDM5",
                    }
                },
                locale: {
                    name: "English (US)",
                    nluConfidenceThreshold: 0.4,
                    voiceSettings: {
                        engine: "neural",
                        voiceId: "Ivy"
                    }
                }
            }
        };

        test('expect roundtrip conversion to keep model consistent', () => {
            const model = new JovoModelLexV2(jovoModel as JovoModelData, 'en-US');
            const lexModelFiles = model.exportNative();

            expect(lexModelFiles).toBeDefined();
            if (lexModelFiles === undefined) {
                return;
            }

            const importer = new JovoModelLexV2();
            importer.importNative(lexModelFiles, 'en-US');
            const roundtripModel = importer.exportJovoModel();

            expect(roundtripModel).toBeDefined();
            if (roundtripModel === undefined) {
                return;
            }

            expect(roundtripModel).toEqual(jovoModel);
        });
    });
});
