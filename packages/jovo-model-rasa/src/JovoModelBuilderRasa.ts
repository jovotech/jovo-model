import {
    JovoModelRasa,
    RasaNluData,
    RasaCommonExample,
    RasaCommonExampleEntity,
    RasaEntitySynonym,
    RasaLookupTable,
} from '.';

import {
    ExternalModelFile,
    InputType,
    Intent,
    IntentInput,
    JovoModelBuilder,
} from 'jovo-model-core';

import { JovoConfigReader } from 'jovo-config';

import * as JovoModelRasaValidator from '../validators/JovoModelRasa.json';

import * as _ from 'lodash';


export class JovoModelBuilderRasa extends JovoModelBuilder {
    static MODEL_KEY = 'rasa';


    /**
     * Converts JovoModel in Raza files
     *
     * @param {JovoConfigReader} configReader ConfigReader instance to read data from configuration
     * @param {JovoModelRasa} model The JovoModel to convert
     * @param {string} locale The locale of the JovoModel
     * @param {string} [stage] Stage to use for configuration data
     * @returns {ExternalModelFile[]}
     * @memberof JovoModelBuilderDialogflow
     */
    fromJovoModel(configReader: JovoConfigReader, model: JovoModelRasa, locale: string, stage?: string): ExternalModelFile[] {

        const returnData: RasaNluData = {
            common_examples: [],
            entity_synonyms: [],
            lookup_tables: [],
        };

        let rasaExample: RasaCommonExample | undefined;
        if (model.intents !== undefined) {
            for (const intent of model.intents) {
                if (intent.phrases) {
                    for (const phrase of intent.phrases) {
                        rasaExample = this.getRasaExampleFromPhrase(phrase, intent, model.inputTypes);
                        returnData.common_examples.push(rasaExample);
                    }
                }
            }
        }

        let saveAsLookupTable: boolean;
        let rasaSynonym: RasaEntitySynonym;
        if (model.inputTypes !== undefined) {
            // returnData.entity_synonyms = [];
            for (const inputType of model.inputTypes) {
                saveAsLookupTable = true;

                if (inputType.values === undefined) {
                    // If an InputType does not have any values defined
                    // for some reason skip it.
                    continue;
                }

                // Check it it should be saved under synonyms or lookupTable

                for (const typeValue of inputType.values) {
                    if (Object.keys(typeValue).length !== 1 || typeValue.value === undefined) {
                        // It can only be saved as lookupTable if it does not
                        // have any other properties than "value"
                        saveAsLookupTable = false;
                        break;
                    }
                }

                if (saveAsLookupTable === true) {
                    // Save a lookupTable
                    returnData.lookup_tables!.push({
                        name: inputType.name,
                        // TODO: remove the !
                        elements: inputType.values.map((data) => data.value),
                    });

                } else {
                    // Save as synonyms
                    for (const typeValue of inputType.values) {
                        rasaSynonym = {
                            value: typeValue.value,
                            synonyms: [],
                        };

                        if (typeValue.synonyms !== undefined) {
                            rasaSynonym.synonyms = typeValue.synonyms;
                        }

                        returnData.entity_synonyms!.push(rasaSynonym);
                    }
                }
            }
        }

        return [
            {
                path: [`${locale}.json`],
                content: {
                    rasa_nlu_data: returnData,
                }
            },
        ];
    }


    /**
     * Returns a Rasa common example for a Jovo Model phrase
     *
     * @param {string} phrase The phrase to return the example for
     * @param {Intent} intent The intent in which it gets ued
     * @param {(InputType[] | undefined)} inputTypes All the inputTypes of the model
     * @returns {RasaCommonExample}
     * @memberof JovoModelBuilderRasa
     */
    getRasaExampleFromPhrase(phrase: string, intent: Intent, inputTypes: InputType[] | undefined): RasaCommonExample {
        const returnData: RasaCommonExample = {
            text: phrase,
            intent: intent.name,
            entities: [],
        };

        let startIndex: number;
        let inputType: InputType | undefined;
        let intentInput: IntentInput | undefined;
        let exampleValue = '';

        // Get the inputs of the phrase
        const phraseInputs = phrase.match(/{[^}]*}/g);

        // Add the ones which are defined as inputs as rasa Example
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

                // Get the InputType data to get an example value to replace the placeholder with
                if (inputTypes === undefined) {
                    throw new Error(`No InputTypes are defined but type "${inputName}" is used in phrase "${phrase}"!`);
                }
                inputType = inputTypes.find((data) => data.name === inputName);
                if (inputType === undefined) {
                    throw new Error(`InputType "${inputName}" is not defined but is used in phrase "${phrase}"!`);
                }
                if (inputType.values === undefined || inputType.values.length === 0) {
                    throw new Error(`InputType "${inputName}" does not have any values!`);
                }

                // As we are going in order of appearance in the text we can be sure
                // that the start index does not change. The end index gets calculated
                // via stringe the placeholder got replaced with.
                startIndex = returnData.text.indexOf(`{${inputName}}`);

                exampleValue = inputType.values[0].value;
                returnData.entities.push({
                    value: exampleValue,
                    entity: inputName,
                    start: startIndex,
                    end: startIndex + exampleValue.length,
                });

                // Replace the placeholder with an example value
                returnData.text = returnData.text.replace(new RegExp(`{${inputName}}`, 'g'), exampleValue);
            }
        }

        return returnData;
    }


    getValidator(): tv4.JsonSchema {
        return JovoModelRasaValidator;
    }
}
