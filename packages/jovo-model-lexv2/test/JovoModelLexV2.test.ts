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
                            id: "1",
                            key: 'chinese',
                            value: 'chinese',
                            synonyms: ['Chinese', 'Chines', 'chines'],
                        },
                        {
                            id: "2",
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
        };

        const model = new JovoModelLexV2(jovoModel as JovoModelData, 'en-US');
        const lexModelFiles = model.exportNative();

        test('expect files to save', () => {
            expect((async () => {
                for (const file of lexModelFiles ?? []) {
                    const filePath = join('./lex_models', ...file.path);
                    const dir = dirname(filePath);
                    await fs.mkdir(dir, {recursive: true});
                    await fs.writeFile(filePath, JSON.stringify(file.content, null, 4));
                }
            })()).resolves.toBeUndefined();
        });
    });
});
