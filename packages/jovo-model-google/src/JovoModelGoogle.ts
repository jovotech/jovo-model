import {
    Intent,
    JovoModel,
    JovoModelData,
    NativeFileInformation,
    InputType,
    InputTypeValue
} from "jovo-model";

import * as JovoModelGoogleValidator from "../validators/JovoModelGoogleValidator.json";
import { GAIntent, GAInput } from "./Interfaces";

export class JovoModelGoogle extends JovoModel {
    static MODEL_KEY: string = "google";
    static defaultLocale?: string;

    constructor(data?: JovoModelData, locale?: string, defaultLocale?: string) {
        super(data, locale);
        JovoModelGoogle.defaultLocale = defaultLocale;
    }

    static fromJovoModel(
        model: JovoModelData,
        locale: string
    ): NativeFileInformation[] {
        const returnFiles: NativeFileInformation[] = [];

        for (const intent of (model.intents || []) as Intent[]) {
            const gaIntent: GAIntent = {
                trainingPhrases: []
            };
            const path: string[] = ["custom", "intents"];

            if (locale !== this.defaultLocale) {
                path.push(locale);
            }

            path.push(`${intent.name}.yaml`);

            for (let phrase of intent.phrases || []) {
                const inputRegex: RegExp = /{(.*)}/g;

                // Check if phrase contains any inputs and parse them, if necessary.
                for (;;) {
                    const match = inputRegex.exec(phrase);

                    if (!match) {
                        break;
                    }

                    const matched: string = match[0];
                    const input: string = match[1];
                    let type: string = "";

                    // Get input type for cTesturrent input.
                    for (const i of intent.inputs || []) {
                        if (input === i.name) {
                            if (i.type === "object") {
                                // ToDo: !
                                continue;
                            }

                            // @ts-ignore
                            type = i.type;
                        }
                    }

                    // For input type, get an example value to work with.
                    let sampleValue: string = "";
                    for (const inputType of model.inputTypes || []) {
                        if (inputType.name !== type) {
                            continue;
                        }

                        sampleValue = inputType.values![0].value;
                    }

                    phrase = phrase.replace(
                        matched,
                        `($${input} '${sampleValue}' auto=true)`
                    );

                    if (locale === this.defaultLocale && intent.inputs) {
                        if (!gaIntent.parameters) {
                            gaIntent.parameters = [];
                        }

                        if (gaIntent.parameters.find(el => el.name === input)) {
                            continue;
                        }

                        gaIntent.parameters.push({
                            name: input,
                            type: {
                                name: type
                            }
                        });
                    }
                }
                gaIntent.trainingPhrases.push(phrase);
            }

            returnFiles.push({
                path,
                content: gaIntent
            });
        }

        for (const inputType of (model.inputTypes || []) as InputType[]) {
            const gaInput: GAInput = {
                synonym: {
                    entities: {}
                }
            };

            const path: string[] = ["custom", "types"];

            if (locale !== this.defaultLocale) {
                path.push(locale);
            }

            path.push(`${inputType.name}.yaml`);

            // prettier-ignore
            for (const inputTypeValue of (inputType.values || []) as InputTypeValue[]) {
                // prettier-ignore
                gaInput.synonym.entities[inputTypeValue.key || inputTypeValue.value] = {
                    synonyms: [
                        inputTypeValue.value,
                        ...(inputTypeValue.synonyms || [])
                    ]
                };
            }

            returnFiles.push({
                path,
                content: gaInput
            });
        }

        return returnFiles;
    }

    static getValidator(): tv4.JsonSchema {
        return JovoModelGoogleValidator;
    }
}
