import {JovoModel, JovoModelData} from "@jovotech/model";
import {JovoModelLexV2} from "../src/JovoModelLexV2";
import {promises as fs} from "fs";
import {join, dirname} from "path";

describe('JovoModelLexV2.ts', () => {
    describe('exportNative @v4 (fromJovoModel)', () => {
        const jovoModel: JovoModelData = {
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
