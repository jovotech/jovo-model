import {JovoModelNlpjsData, NlpjsData,  NlpjsModelFile} from '.';

import {
    InputType,
    InputTypeValue,
    Intent,
    IntentInput,
    JovoModel,
    JovoModelData,
    NativeFileInformation
} from "jovo-model";

import * as JovoModelNlpjsValidator from "../validators/JovoModelNlpjsData.json";

export class JovoModelNlpjs extends JovoModel {
    static MODEL_KEY = "nlpjs";

    static toJovoModel(
        inputFiles: NativeFileInformation[],
        locale: string
    ): JovoModelData {
        const inputData: NlpjsModelFile = inputFiles[0].content;

        const jovoModel: JovoModelData = {
            invocation: "",
            intents: [],
            inputTypes: []
        };

        if (inputData.data) {
            inputData.data.forEach((data: NlpjsData) => {
                jovoModel.intents!.push({
                    name: data.intent,
                    phrases: data.utterances
                });
            });
        }

        return jovoModel;
    }

    static fromJovoModel(
        model: JovoModelNlpjsData,
        locale: string
    ): NativeFileInformation[] {
        const returnData: NlpjsModelFile = {
            data: [],
            name: "",
            locale
        };
        const inputsMap: Record<string, string> = {};

        if (model.intents) {
            model.intents.forEach((intent: Intent) => {
                const intentObj = {
                    intent: intent.name,
                    utterances: []
                };


                if (intent.inputs) {
                    returnData.entities = {};

                    intent.inputs.forEach((input: IntentInput) => {
                        if (input.type && typeof input.type === 'string') {
                            // inputsMap[input.name] = input.type;
                            inputsMap[input.type] = input.name;
                        } else if (input.type && typeof input.type === 'object' && input.type.nlpjs) {
                            // inputsMap[input.name] = input.type.nlpjs;
                            inputsMap[input.type.nlpjs] = input.name;
                        }
                    });
                }
                if (intent.phrases) {

                    intent.phrases.forEach((phrase: string) => {
                        const matches = phrase.match(/\{([^}]+)\}/g);

                        if (matches) {
                            matches.forEach((match: string) => {
                                const matchValue = match.replace('{', '').replace('}', '');

                                if (inputsMap[matchValue]) {
                                    phrase = phrase.replace(match, `@${inputsMap[matchValue]}`);
                                } else {
                                    phrase = phrase.replace(match, `@${matchValue}`);
                                }
                            });
                        }
                        // @ts-ignore
                        intentObj.utterances.push(phrase);
                    });
                }
                returnData.data.push(intentObj);
            });
        }

        if(model.inputTypes) {
            returnData.entities = {};
            model.inputTypes.forEach((inputType:InputType) => {

                const options: Record<string, string[]> = {};

                inputType.values!.forEach((inputTypeValue: InputTypeValue) => {
                    const key = inputTypeValue.value;
                    options[key] = [inputTypeValue.value];
                    if(inputTypeValue.synonyms) {
                        options[key] = options[key].concat(inputTypeValue.synonyms);
                    }
                });
                returnData.entities![inputsMap[inputType.name]] = {
                    options
                };
            });
        }

        return [
            {
                path: [`${locale}.json`],
                content: returnData
            }
        ];
    }

    static getValidator(): tv4.JsonSchema {
        return JovoModelNlpjsValidator;
    }

}
