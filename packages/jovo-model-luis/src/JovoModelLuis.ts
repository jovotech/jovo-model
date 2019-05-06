import {
    JovoModelLuisData,
    LuisModelClosedList,
    LuisModelClosedSubList,
    LuisModelEntity,
    LuisModelFile,
    LuisModelIntent,
    LuisModelUtterances,
} from '.';


import {
    InputType,
    Intent,
    IntentInput,
    InputTypeValue,
    JovoModel,
    JovoModelData,
    NativeFileInformation,
} from 'jovo-model';

import * as JovoModelLuisValidator from '../validators/JovoModelLuisData.json';

import * as _ from 'lodash';


export interface InputTypeNameUsedCounter {
    [key: string]: number;
}

export interface IntentInformation {
    entityNames: string[];
    utterances: LuisModelUtterances[];
}


export class JovoModelLuis extends JovoModel {
    static MODEL_KEY = 'luis';


    /**
     * Converts Luis files to JovoModel
     *
     * @param {NativeFileInformation[]} inputData The luis files
     * @param {string} locale The locale of the files
     * @memberof JovoModelLuis
     */
    static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
        const inputData: LuisModelFile = inputFiles[0].content;

        const jovoModel: JovoModelData = {
            invocation: '',
            intents: [],
            inputTypes: [],
        };

        let tempInputType: InputType;
        let tempInputTypeValue: InputTypeValue;
        for (const closedList of inputData.closedLists) {
            tempInputType = {
                name: closedList.name,
                values: [],
            };

            if (closedList.subLists === undefined) {
                continue;
            }
            for (const subList of closedList.subLists) {
                tempInputTypeValue = {
                    value: subList.canonicalForm,
                };

                if (subList.list !== undefined) {
                    tempInputTypeValue.synonyms = subList.list;
                }

                tempInputType.values!.push(tempInputTypeValue);
            }

            jovoModel.inputTypes!.push(tempInputType);
        }

        const tempIntents: {
            [key: string]: Intent;
        } = {};

        const inputNamesByIntent: {
            [key: string]: string[]
        } = {};
        for (const utterance of inputData.utterances) {

            let phraseText = utterance.text;
            if (tempIntents[utterance.intent] === undefined) {
                tempIntents[utterance.intent] = {
                    name: utterance.intent,
                    phrases: [],
                };
            }

            // Make sure that the entities later in the text come first
            // that it does not mess up the position of the earlier ones.
            if (utterance.entities !== undefined && utterance.entities.length !== 0) {
                utterance.entities.sort((a, b) => a.startPos < b.startPos ? 1 : -1);
            }

            let entityName: string;
            for (const entity of utterance.entities) {
                if (inputNamesByIntent[utterance.intent] === undefined) {
                    inputNamesByIntent[utterance.intent] = [entity.entity];
                } else if (!inputNamesByIntent[utterance.intent].includes(entity.entity)) {
                    inputNamesByIntent[utterance.intent].push(entity.entity);
                }

                entityName = entity.entity;
                if (entityName.startsWith('builtin.')) {
                    entityName = entityName.slice(8);
                }

                phraseText = phraseText.slice(0, entity.startPos) + `{${entityName}}` + phraseText.slice(entity.endPos + 1);
            }

            tempIntents[utterance.intent].phrases!.push(phraseText);
        }

        // Now that we did itterate over all utterances we can add all the found intents
        for (const intentName of Object.keys(inputNamesByIntent)) {
            tempIntents[intentName].inputs = [];
            for (const inputName of inputNamesByIntent[intentName]) {
                if (inputName.startsWith('builtin.')) {
                    // Is a built-in luis type
                    tempIntents[intentName].inputs!.unshift({
                        name: inputName.slice(8),
                        type: {
                            luis: inputName,
                        },
                    });
                } else {
                    // Is a regular type
                    tempIntents[intentName].inputs!.unshift({
                        name: inputName,
                        type: inputName,
                    });
                }
            }
        }

        jovoModel.intents = Object.values(tempIntents);

        return jovoModel;
    }


    /**
     * Converts JovoModel to Luis files
     *
     * @param {JovoModelLuisData} model The JovoModel to convert
     * @param {string} locale The locale of the JovoModel
     * @returns {NativeFileInformation[]}
     * @memberof JovoModelLuis
     */
    static fromJovoModel(model: JovoModelLuisData, locale: string): NativeFileInformation[] {
        const inputTypeNameUsedCounter: InputTypeNameUsedCounter = {};

        const luisIntents: LuisModelIntent[] = [];
        const luisUtterances: LuisModelUtterances[] = [];
        const luisClosedLists: LuisModelClosedList[] = [];
        let intentInformation: IntentInformation;
        const entityNames: string[] = [];

        if (model.intents !== undefined) {
            // Get all the utterances and entities
            for (const intent of model.intents) {
                luisIntents.push({
                    name: intent.name,
                });

                intentInformation = this.getIntentInformation(intent, model.inputTypes, inputTypeNameUsedCounter);
                luisUtterances.push.apply(luisUtterances, intentInformation.utterances);

                for (const entityName of intentInformation.entityNames) {
                    if (!entityNames.includes(entityName)) {
                        entityNames.push(entityName);
                    }
                }
            }
        }

        // Add all the found entities
        const luisEntities: LuisModelEntity[] = [];
        for (const name of entityNames) {
            luisEntities.push({
                name,
            });
        }

        // Convert the inputTypes to closedLists
        let tempSubLists: LuisModelClosedSubList[];
        let tempSubList: LuisModelClosedSubList;
        if (model.inputTypes !== undefined) {
            for (const inputType of model.inputTypes) {
                if (inputType.name.startsWith('builtin.')) {
                    // Skip the builtin types
                    continue;
                }

                tempSubLists = [];

                if (inputType.values === undefined) {
                    // If an InputType does not have any values defined
                    // for some reason, skip it.
                    continue;
                }

                for (const typeValue of inputType.values) {
                    tempSubList = {
                        canonicalForm: typeValue.value,
                    };

                    if (typeValue.synonyms) {
                        tempSubList.list = typeValue.synonyms;
                    }

                    tempSubLists.push(tempSubList);
                }

                luisClosedLists.push({
                    name: inputType.name,
                    subLists: tempSubLists,
                });
            }
        }

        const luisModel: LuisModelFile = {
            luis_schema_version: '3.2.0',
            versionId: '0.1',
            name: 'Jovo App',
            desc: '',
            culture: locale.toLowerCase(),
            tokenizerVersion: '1.0.0',
            intents: luisIntents,
            entities: luisEntities,
            composites: [],
            closedLists: luisClosedLists,
            patternAnyEntities: [],
            regex_entities: [],
            prebuiltEntities: [],
            model_features: [],
            regex_features: [],
            patterns: [],
            utterances: luisUtterances,
        };

        return [
            {
                path: [`${locale}.json`],
                content: luisModel
            },
        ];
    }


    /**
     * Returns Luis untterances and unique entityNames for each
     * Jovo intent
     *
     * @static
     * @param {Intent} intent The intent to return the data for
     * @param {(InputType[] | undefined)} inputTypes All the inputTypes of the model
     * @param {InputTypeNameUsedCounter} inputTypeNameUsedCounter Counts which values of the input types got used
     * @returns {IntentInformation}
     * @memberof JovoModelLuis
     */
    static getIntentInformation(intent: Intent, inputTypes: InputType[] | undefined, inputTypeNameUsedCounter: InputTypeNameUsedCounter): IntentInformation {
        const returnData: IntentInformation = {
            entityNames: [],
            utterances: [],
        };

        let tempUtterance: LuisModelUtterances;

        let startIndex: number;
        let inputType: InputType | undefined;
        let intentInput: IntentInput | undefined;
        let exampleValue = '';
        let inputTypeName: string | {
            [key: string]: string;
        };

        if (intent.phrases) {
            for (const phrase of intent.phrases) {
                tempUtterance = {
                    text: phrase,
                    intent: intent.name,
                    entities: []
                };

                // Get the inputs of the phrase
                const phraseInputs = phrase.match(/{[^}]*}/g);

                // Add the ones which are defined as entities
                if (phraseInputs !== null) {
                    for (let inputName of phraseInputs) {
                        // Cut the curly braces away
                        inputName = inputName.slice(1, -1);

                        if (intent.inputs === undefined) {
                            // No inputs are defined so the value is not an input
                            continue;
                        }

                        // Check if the value is really an input
                        intentInput = intent.inputs.find((data) => data.name === inputName);
                        if (intentInput === undefined) {
                            // No input exists with that name so it is not an input
                            continue;
                        }

                        if (intentInput.type === undefined) {
                            throw new Error(`No type is defined for input "${inputName}" which is used in phrase "${phrase}"!`);
                        }

                        // Get the InputType data to get an example value to replace the placeholder with
                        if (inputTypes === undefined) {
                            throw new Error(`No InputTypes are defined but type "${inputName}" is used in phrase "${phrase}"!`);
                        }

                        inputTypeName = intentInput.type;
                        if (typeof intentInput.type === 'object') {
                            if (intentInput.type.luis === undefined) {
                                throw new Error(`No Luis-Type is defined for input "${inputName}" which is used in phrase "${phrase}"!`);
                            } else {
                                inputTypeName = intentInput.type.luis as string;
                            }
                        } else {
                            inputTypeName = inputTypeName as string;
                        }

                        inputType = inputTypes.find((data) => data.name === inputTypeName);
                        if (inputType === undefined) {
                            throw new Error(`InputType "${inputTypeName}" is not defined but is used in phrase "${phrase}"!`);
                        }
                        if (inputType.values === undefined || inputType.values.length === 0) {
                            throw new Error(`InputType "${inputTypeName}" does not have any values!`);
                        }

                        // As we are going in order of appearance in the text we can be sure
                        // that the start index does not change. The end index gets calculated
                        // by adding the length of the value the placeholder got replaced with.
                        startIndex = tempUtterance.text.indexOf(`{${inputName}}`);

                        // Make sure that different example values get used becaues if not
                        // entities do not seem to get extracted properly
                        if (inputTypeNameUsedCounter[inputTypeName] === undefined) {
                            inputTypeNameUsedCounter[inputTypeName] = 0;
                        }
                        const exampleInputIndex = inputTypeNameUsedCounter[inputTypeName]++ % inputType.values.length;
                        exampleValue = inputType.values[exampleInputIndex].value;

                        tempUtterance.entities.push({
                            // value: exampleValue,
                            entity: inputTypeName,
                            startPos: startIndex,
                            endPos: startIndex + exampleValue.length - 1, // No idea why they are always one to short in examples
                        });

                        if (!returnData.entityNames.includes(inputTypeName)) {
                            returnData.entityNames.push(inputTypeName);
                        }

                        // Replace the placeholder with an example value
                        tempUtterance.text = tempUtterance.text.replace(new RegExp(`{${inputName}}`, 'g'), exampleValue);
                    }
                }

                returnData.utterances.push(tempUtterance);
            }
        }

        return returnData;
    }


    static getValidator(): tv4.JsonSchema {
        return JovoModelLuisValidator;
    }
}
