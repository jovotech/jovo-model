import {
    AlexaModel,
    AlexaLMIntent,
    AlexaLMInputObject,
    AlexaLMTypeObject,
    AlexaLMTypeValue,
    IntentInputAlexa,
    JovoModelAlexa
} from '.';

import {
    ExternalModelFile,
    InputType,
    InputTypeValue,
    Intent,
    JovoModel,
    JovoModelBuilder,
} from 'jovo-model-core';

import { JovoConfigReader } from 'jovo-config';

import * as JovoModelAlexaValidator from '../validators/JovoModelAlexa.json';

import * as _ from 'lodash';

const BUILTIN_PREFIX = 'AMAZON.';


export class JovoModelBuilderAlexa extends JovoModelBuilder {
    static MODEL_KEY = 'alexa';


    /**
     * Converts Alexa model files to JovoModel
     *
     * @param {ExternalModelFile[]} inputData The Dialogflow files
     * @param {string} locale The locale of the files
     * @returns {JovoModelAlexa}
     * @memberof JovoModelBuilderDialogflow
     */
    toJovoModel(inputFiles: ExternalModelFile[], locale: string): JovoModelAlexa {
        const inputData = inputFiles[0].content;

        const jovoModel: JovoModel = {
            invocation: _.get(inputData, 'interactionModel.languageModel.invocationName')
        };

        // prompts
        if (_.get(inputData, 'interactionModel.prompts')) {
            _.set(jovoModel, 'alexa.interactionModel.prompts', _.get(inputData, 'interactionModel.prompts'));
        }

        // dialog
        if (_.get(inputData, 'interactionModel.dialog')) {
            _.set(jovoModel, 'alexa.interactionModel.dialog', _.get(inputData, 'interactionModel.dialog'));
        }

        const alexaIntents: Intent[] = [];
        const jovoIntents: Intent[] = [];
        let intent;
        for (intent of _.get(inputData, 'interactionModel.languageModel.intents')) {
            if (_.startsWith(intent.name, BUILTIN_PREFIX)) {
                alexaIntents.push(intent);
            } else {
                const jovoIntent: Intent = {
                    name: intent.name,
                    phrases: intent.samples,
                };
                const inputs: IntentInputAlexa[] = [];
                if (intent.slots) {
                    for (const slot of intent.slots) {
                        const input: IntentInputAlexa = {
                            name: slot.name,
                            type: slot.type
                        };
                        if (_.startsWith(slot.type, BUILTIN_PREFIX)) {
                            input.type = {
                                alexa: slot.type,
                            };
                        }

                        if (slot.samples) {
                            input.alexa = {
                                samples: slot.samples,
                            };
                        }
                        inputs.push(input);
                    }
                    jovoIntent.inputs = inputs;
                }
                jovoIntents.push(jovoIntent);
            }
        }

        _.set(jovoModel, 'intents', jovoIntents);

        if (_.get(inputData, 'interactionModel.languageModel.types')) {
            // input types
            const inputTypes: InputType[] = [];
            for (const type of _.get(inputData, 'interactionModel.languageModel.types')) {

                const values: InputTypeValue[] = [];
                let tV: InputTypeValue;
                for (const typeValue of type.values) {
                    tV = {
                        value: typeValue.name.value,
                    };
                    if (typeValue.name.synonyms) {
                        tV.synonyms = typeValue.name.synonyms;
                    }
                    if (typeValue.id) {
                        tV.id = typeValue.id;
                    }
                    values.push(tV);
                }
                inputTypes.push({
                    name: type.name,
                    values
                });
            }
            _.set(jovoModel, 'inputTypes', inputTypes);
        }

        _.set(jovoModel, 'alexa.interactionModel.languageModel.intents', alexaIntents);

        return jovoModel;
    }


    /**
     * Converts JovoModel in Dialogflow model files
     *
     * @param {JovoConfigReader} configReader ConfigReader instance to read data from configuration
     * @param {JovoModelAlexa} model The JovoModel to convert
     * @param {string} locale The locale of the JovoModel
     * @param {string} [stage] Stage to use for configuration data
     * @returns {ExternalModelFile[]}
     * @memberof JovoModelBuilderDialogflow
     */
    fromJovoModel(configReader: JovoConfigReader, model: JovoModelAlexa, locale: string, stage?: string): ExternalModelFile[] {
        const errorPrefix = '/models/' + locale + '.json - ';

        const concatArrays = function customizer(objValue: any[], srcValue: any) { // tslint:disable-line:no-any
            if (_.isArray(objValue)) {
                return objValue.concat(srcValue);
            }
        };

        if (configReader.getConfigParameter(`languageModel.${locale}`, stage)) {
            model = _.mergeWith(
                model,
                configReader.getConfigParameter(`languageModel.${locale}`, stage),
                concatArrays);
        }
        if (configReader.getConfigParameter(`alexaSkill.languageModel.${locale}`, stage)) {
            model = _.mergeWith(
                model,
                configReader.getConfigParameter(`alexaSkill.languageModel.${locale}`, stage),
                concatArrays);
        }

        const alexaModel: AlexaModel = {
            interactionModel: {
                languageModel: {
                    invocationName: ''
                }
            }
        };
        _.set(alexaModel, 'interactionModel.languageModel.invocationName', model.invocation);

        // handle invocation name requirements
        if (alexaModel.interactionModel.languageModel.invocationName) {
            if (alexaModel.interactionModel.languageModel.invocationName.length < 2 ||
                alexaModel.interactionModel.languageModel.invocationName.length > 50) {
                throw new Error(errorPrefix + 'Invocation name must be between 2 and 50 characters.');
            }

            if (/[A-Z]/.test(alexaModel.interactionModel.languageModel.invocationName)) {
                throw new Error(errorPrefix + 'Invocation name cannot contain upper case characters.');
            }

            if (/\d/.test(alexaModel.interactionModel.languageModel.invocationName)) {
                throw new Error(errorPrefix + 'Invocation name may only contain alphabetic characters, apostrophes, periods and spaces.');
            }
        }

        alexaModel.interactionModel.languageModel.types = [];

        const alexaIntents: AlexaLMIntent[] = [];
        // convert generic intents
        if (model.intents) {
            for (const intent of model.intents) {
                const alexaIntentObj: AlexaLMIntent = {
                    name: intent.name,
                    samples: intent.phrases,
                };
                for (const sample of alexaIntentObj.samples!) {
                    if (/\d/.test(sample)) { // has number?
                        throw new Error(errorPrefix + `Intent "${alexaIntentObj.name}" must not have numbers in sample`); // eslint-disable-line
                    }
                }

                // handle intent inputs
                if (intent.inputs) {
                    alexaIntentObj.slots = [];

                    let input: IntentInputAlexa;
                    for (input of intent.inputs) {
                        const alexaInputObj: AlexaLMInputObject = {
                            name: input.name,
                            type: ''
                        };

                        if (typeof input.type === 'object') {
                            if (input.type.alexa) {
                                alexaInputObj.type = input.type.alexa;
                                if (_.startsWith(input.type.alexa, BUILTIN_PREFIX)) {
                                    alexaInputObj.type = input.type.alexa;
                                } else {
                                    input.type = input.type.alexa;
                                }
                            } else {
                                throw new Error(errorPrefix + 'Please add an Alexa property for input "' + input.name + '"');
                            }
                        }

                        // handle custom input types
                        if (!alexaInputObj.type) {
                            if (!input.type) {
                                throw new Error(errorPrefix + 'Invalid input type in intent "' + intent.name + '"');
                            }

                            alexaInputObj.type = input.type;

                            // throw error when no inputTypes object defined
                            if (!model.inputTypes) {
                                throw new Error(errorPrefix + 'Input type "' + alexaInputObj.type + '" must be defined in inputTypes');
                            }

                            // find type in global inputTypes array
                            const matchedInputTypes = model.inputTypes.filter((item) => {
                                return item.name === alexaInputObj.type;
                            });

                            if (matchedInputTypes.length === 0) {
                                throw new Error(errorPrefix + 'Input type "' + alexaInputObj.type + '" must be defined in inputTypes');
                            }

                            if (!alexaModel.interactionModel.languageModel.types) {
                                alexaModel.interactionModel.languageModel.types = [];
                            }

                            // create alexaTypeObj from matched input types
                            for (const matchedInputType of matchedInputTypes) {
                                const alexaTypeObj: AlexaLMTypeObject = {
                                    // @ts-ignore
                                    name: matchedInputType.alexa || matchedInputType.name,
                                    values: [],
                                };

                                if (!matchedInputType.values) {
                                    throw new Error(
                                        errorPrefix + `Input type "${matchedInputType.name}" must have at least one value`
                                    );
                                }

                                // create alexaTypeValueObj
                                for (const value of matchedInputType.values) {
                                    const alexaTypeValueObj: AlexaLMTypeValue = {
                                        id: value.id ? value.id : null,
                                        name: {
                                            value: value.value,
                                        },
                                    };
                                    // save synonyms, if defined
                                    if (value.synonyms) {
                                        alexaTypeValueObj.name.synonyms = value.synonyms;
                                    }
                                    alexaTypeObj.values.push(alexaTypeValueObj);
                                }

                                // skip existing alexa types
                                const existingAlexaTypes = alexaModel.interactionModel.languageModel.types.filter((item) => {
                                    return alexaTypeObj.name === item.name;
                                });

                                if (existingAlexaTypes.length === 0) {
                                    // add type to interaction model
                                    alexaModel.interactionModel.languageModel.types.push(alexaTypeObj);
                                }
                            }
                        }
                        if (input.alexa) {
                            _.merge(alexaInputObj, input.alexa);
                        }
                        alexaIntentObj.slots.push(alexaInputObj);
                    }
                }

                if (_.get(intent, 'alexa')) {
                    // @ts-ignore
                    _.assign(alexaIntentObj, intent.alexa);
                }

                alexaIntents.push(alexaIntentObj);
            }
        }

        // convert alexa specific intents
        if (_.get(model, 'alexa.interactionModel.languageModel.intents')) {
            for (const intent of _.get(model, 'alexa.interactionModel.languageModel.intents')) {
                alexaIntents.push(intent);
            }
        }
        _.set(alexaModel, 'interactionModel.languageModel.intents', alexaIntents);

        // prompts
        if (_.get(model, 'alexa.interactionModel.prompts')) {
            _.set(alexaModel, 'interactionModel.prompts', _.get(model, 'alexa.interactionModel.prompts'));
        }

        // types
        if (_.get(model, 'alexa.interactionModel.languageModel.types')) {
            _.set(alexaModel, 'interactionModel.languageModel.types', _.get(model, 'alexa.interactionModel.languageModel.types'));
        }

        // dialog
        if (_.get(model, 'alexa.interactionModel.dialog')) {
            _.set(alexaModel, 'interactionModel.dialog', _.get(model, 'alexa.interactionModel.dialog'));
        }

        // types
        if (_.get(model, 'inputTypes')) {
            for (const inputType of model.inputTypes!) {
                let findings: AlexaLMTypeObject[] = [];

                // skip input types that are already in alexa types
                if (_.get(alexaModel, 'interactionModel.languageModel.types')) {
                    findings = alexaModel.interactionModel.languageModel.types.filter((item) => {
                        return inputType.name === item.name;
                    });
                }

                if (findings.length > 0) {
                    continue;
                }

                // create alexa type
                const alexaType: AlexaLMTypeObject = {
                    name: inputType.name,
                    values: [],
                };

                // iterate through values
                if (inputType.values) {
                    for (const value of inputType.values) {
                        const alexaTypeValue: AlexaLMTypeValue = {
                            id: value.id || null,
                            name: {
                                value: value.value,
                            },
                        };

                        if (value.synonyms) {
                            alexaTypeValue.name.synonyms = value.synonyms;
                        }

                        alexaType.values.push(alexaTypeValue);
                    }
                }

                alexaModel.interactionModel.languageModel.types.push(alexaType);
            }
        }

        return [
            {
                path: [`${locale}.json`],
                content: alexaModel,
            },
        ];
    }


    getValidator(): tv4.JsonSchema {
        return JovoModelAlexaValidator;
    }
}
