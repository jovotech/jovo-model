import {InputType, InputTypeValue, Intent, IntentInput, JovoModelData} from './Interfaces';

export type ModelIntent = Intent | string;
export type ModelIntentInput = IntentInput | string;

export type ModelInputType = InputType | string;
export type ModelInputTypeValue = InputTypeValue | string;

export interface IntentIndex {
    index: number;
    intentIndex: number;
}

export interface InputTypeIndex {
    index: number;
    inputTypeIndex: number;
}


/**
 * Helper class that provides methods to mutate the model.
 */
export class JovoModelHelper {

    /**
     * Creates a new data for JovoModel
     *
     * @static
     * @param {string} [invocation='app']
     * @param {Intent[]} [intents=[]]
     * @param {InputType[]} [inputTypes=[]]
     */
    static new(
        invocation = 'app',
        intents: Intent[] = [],
        inputTypes: InputType[] = [],
    ): JovoModelData {
        return {
            invocation,
            intents,
            inputTypes,
        };
    }

    /**
     * Adds an intent to the model, if at least one with the name does not exist.
     * @param model Model that is being mutated
     * @param intent Intent-object or string (intent-name)
     */
    static addIntent(model: JovoModelData, intent: ModelIntent) {
        if (typeof intent === 'string') {
            intent = {
                name: intent,
                phrases: [],
                inputs: [],
                samples: [],
            };
        }

        if (!this.getIntentByName(model, intent.name)) {
            if (!model.intents) {
                model.intents = [];
            }

            model.intents.push(intent);
        }
    }

    /**
     * Removes an intent from the model, if at least one with the name does exist.
     * @param model Model that is being mutated
     * @param intent Intent-object or string (intent-name)
     */
    static removeIntent(model: JovoModelData, intent: ModelIntent) {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }

        const index = this.getIntentIndexByName(model, intent);
        if (index >= 0 && model.intents) {
            model.intents.splice(index, 1);
        }
    }

    /**
     * Updates an intent in the model, if at least one with the name does exist.
     * @param model Model that is being mutated
     * @param intent Intent-object or string (intent-name) that will be replaced
     * @param newIntent Intent-object that will replace the original
     */
    static updateIntent(model: JovoModelData, intent: ModelIntent, newIntent: Intent): JovoModelData {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }
        const index = this.getIntentIndexByName(model, intent);
        if (index >= 0 && model.intents) {
            model.intents[index] = newIntent;
        }
        return model;
    }

    /**
     * Retrieves an intent from the model that has the given name.
     * @param model Model
     * @param name Intent-name to look for
     */
    static getIntentByName(model: JovoModelData, name: string): Intent | undefined {
        if (!model.intents) {
            return;
        }
        return model.intents.find((intent: Intent) => {
            return intent.name === name;
        });
    }

    /**
     * Retrieves the index of an intent from the model that has the given name.
     * @param model Model
     * @param name Intent-name to look for
     */
    static getIntentIndexByName(model: JovoModelData, name: string): number {
        if (!model.intents) {
            return -1;
        }
        return model.intents.findIndex((intent: Intent) => {
            return intent.name === name;
        });
    }

    /**
     * Retrieves the phrases of an intent, if the intent does exist.
     * @param model Model
     * @param intent Intent-object or string (intent-name)
     */
    static getPhrases(model: JovoModelData, intent: ModelIntent): string[] {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }

        const foundIntent = this.getIntentByName(model, intent);
        return foundIntent && foundIntent.phrases ? foundIntent.phrases : [];
    }

    /**
     * Adds a phrase to the given intent, if the intent does exist.
     * @param model Model that is being mutated
     * @param intent Intent-object or string (intent-name)
     * @param phrase Phrase to add to the intent
     */
    static addPhrase(model: JovoModelData, intent: ModelIntent, phrase: string) {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }

        const foundIntent = this.getIntentByName(model, intent);
        if (foundIntent) {
            if (!foundIntent.phrases) {
                foundIntent.phrases = [];
            }
            if (!foundIntent.phrases.includes(phrase)) {
                foundIntent.phrases.push(phrase);
            }
        }
    }

    /**
     * Removes a phrase from the given intent, if the intent & phrase exist.
     * @param model Model that is being mutated
     * @param intent Intent-object or string (intent-name)
     * @param phrase Phrase to remove from the intent
     */
    static removePhrase(model: JovoModelData, intent: ModelIntent, phrase: string) {
        const indexes = this.getPhraseIndex(model, intent, phrase);

        if (indexes.intentIndex >= 0
            && indexes.index >= 0
            && model.intents
            && model.intents[indexes.intentIndex]
            && model.intents[indexes.intentIndex].phrases) {
            model.intents![indexes.intentIndex].phrases!.splice(indexes.index, 1);
        }
    }

    /**
     * Updates a phrase's value of the given intent, if the intent & phrase exist.
     * @param model Model that is being mutated
     * @param intent Intent-object or string (intent-name)
     * @param oldPhrase Old phrase to be replace
     * @param newPhrase New phrase to replace
     */
    static updatePhrase(model: JovoModelData, intent: ModelIntent, oldPhrase: string, newPhrase: string) {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }

        const intentIndex = this.getIntentIndexByName(model, intent);
        if (intentIndex >= 0
            && model.intents
            && model.intents[intentIndex]
            && model.intents[intentIndex].phrases) {
            const phraseIndex = model.intents[intentIndex].phrases!.indexOf(oldPhrase);
            if (phraseIndex >= 0) {
                const phrases = model.intents[intentIndex].phrases!.slice();
                phrases[phraseIndex] = newPhrase;
                model.intents[intentIndex].phrases = phrases;
            }
        }
    }

    /**
     * Retrieves a phrase's index of the given intent, if the intent & phrase exist.
     * @param model Model
     * @param intent Intent-object or string (intent-name)
     * @param phrase Phrase to look for
     */
    static getPhraseIndex(model: JovoModelData, intent: ModelIntent, phrase: string): IntentIndex {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }

        const intentIndex = this.getIntentIndexByName(model, intent);
        if (intentIndex >= 0
            && model.intents
            && model.intents[intentIndex]
            && model.intents[intentIndex].phrases) {
            return {
                intentIndex,
                index: model.intents[intentIndex].phrases!.indexOf(phrase),
            };
        }
        return {intentIndex, index: -1};
    }

    /**
     * Checks if the phrase exists in any intent.
     * @param model Model
     * @param phrase Phrase to look for
     */
    static hasPhrase(model: JovoModelData, phrase: string): boolean {
        if (!model.intents) {
            return false;
        }
        return model.intents.some((intent: Intent) => {
            return intent.phrases!.includes(phrase);
        });
    }

    /**
     * Retrieves the inputs of the given intent, if the intent does exist.
     * @param model Model
     * @param intent Intent-object or string (intent-name)
     */
    static getInputs(model: JovoModelData, intent: ModelIntent): IntentInput[] {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }

        const foundIntent = this.getIntentByName(model, intent);
        return foundIntent && foundIntent.inputs ? foundIntent.inputs : [];
    }

    /**
     * Adds an input to the given intent, if the intent does exist.
     * @param model Model that is being mutated
     * @param intent Intent-object or string (intent-name)
     * @param input IntentInput-object or string (input-name)
     * @param checkForDuplicates
     */
    static addInput(model: JovoModelData, intent: ModelIntent, input: ModelIntentInput, checkForDuplicates = true) {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }
        const foundIntent = this.getIntentByName(model, intent);
        if (foundIntent) {
            if (!foundIntent.inputs) {
                foundIntent.inputs = [];
            }

            if (typeof input === 'string') {
                input = {
                    type: '',
                    text: '',
                    name: input,
                };
            }

            if (checkForDuplicates) {
                // check if there is no input with the name of 'input'; if true => add
                if (!foundIntent.inputs.some((intentInput: IntentInput) => {
                    return intentInput.name === (input as IntentInput).name;
                })) {
                    foundIntent.inputs.push(input);
                }
            } else {
                foundIntent.inputs.push(input);
            }
        }
    }

    /**
     * Removes an input from the given intent if the intent & input exist.
     * @param model Model that is being mutated
     * @param intent Intent-object or string (intent-name)
     * @param input IntentInput-object or string (input-name)
     */
    static removeInput(model: JovoModelData, intent: ModelIntent, input: ModelIntentInput) {
        const indexes = this.getInputIndex(model, intent, input);

        if (indexes.intentIndex >= 0
            && indexes.index >= 0
            && model.intents
            && model.intents[indexes.intentIndex]
            && model.intents[indexes.intentIndex].inputs) {
            model.intents![indexes.intentIndex].inputs!.splice(indexes.index, 1);
        }
    }

    /**
     * Retrieves a inputs's index of the given intent, if the intent & input exist.
     * @param model Model
     * @param intent Intent-object or string (intent-name)
     * @param input IntentInput-object or string (input-name)
     */
    static getInputIndex(model: JovoModelData, intent: ModelIntent, input: ModelIntentInput): IntentIndex {
        if (typeof intent !== 'string') {
            intent = intent.name;
        }

        const intentIndex = this.getIntentIndexByName(model, intent);
        if (intentIndex >= 0 && model.intents && model.intents[intentIndex] && model.intents[intentIndex].inputs) {
            if (typeof input !== 'string') {
                input = input.name;
            }

            const index = model.intents[intentIndex].inputs!.findIndex((intentInput: IntentInput) => {
                return intentInput.name === input;
            });
            return {
                intentIndex,
                index,
            };
        }
        return {intentIndex, index: -1};
    }

    /**
     * Adds an input-type to the model, if at least one with the name does not exist.
     * @param model Model that is being mutated
     * @param inputType InputType-object or string (input-type-name)
     */
    static addInputType(model: JovoModelData, inputType: ModelInputType) {
        if (typeof inputType === 'string') {
            inputType = {
                name: inputType,
                values: [],
            };
        }

        if (!model.inputTypes) {
            model.inputTypes = [];
        }

        if (!this.getInputTypeByName(model, inputType.name)) {
            model.inputTypes.push(inputType);
        }
    }

    /**
     * Removes an input-type from the model, if at least one with the name does exist.
     * @param model Model that is being mutated
     * @param inputType InputType-object or string (input-type-name)
     */
    static removeInputType(model: JovoModelData, inputType: ModelInputType) {
        if (typeof inputType !== 'string') {
            inputType = inputType.name;
        }

        const index = this.getInputTypeIndexByName(model, inputType);
        if (index >= 0 && model.inputTypes) {
            model.inputTypes.splice(index, 1);
        }
    }

    /**
     * Updates an input-type in the model, if at least one with the name does exist.
     * @param model Model that is being mutated
     * @param inputType InputType-object or string (input-type-name) to be replaced
     * @param newInputType InputType-object to replace
     */
    static updateInputType(model: JovoModelData, inputType: ModelInputType, newInputType: InputType): JovoModelData {
        if (typeof inputType !== 'string') {
            inputType = inputType.name;
        }

        const index = this.getInputTypeIndexByName(model, inputType);
        if (index >= 0 && model.inputTypes) {
            model.inputTypes[index] = newInputType;
        }
        return model;
    }

    /**
     * Retrieves an input-type from the model that has the given name.
     * @param model Model
     * @param name InputType-name to look for
     */
    static getInputTypeByName(model: JovoModelData, name: string): InputType | undefined {
        if (!model.inputTypes) {
            return;
        }
        return model.inputTypes.find((type: InputType) => {
            return type.name === name;
        });
    }

    /**
     * Retrieves the index of an input-type from the model that has the given name.
     * @param model Model
     * @param name InputType-name to look for
     */
    static getInputTypeIndexByName(model: JovoModelData, name: string): number {
        if (!model.inputTypes) {
            return -1;
        }
        return model.inputTypes.findIndex((type: InputType) => {
            return type.name === name;
        });
    }

    /**
     * Retrieves the values of an input-type, if the input-type does exist.
     * @param model Model
     * @param inputType InputType-object or string (input-type-name)
     */
    static getInputTypeValues(model: JovoModelData, inputType: ModelInputType): InputTypeValue[] {
        if (typeof inputType !== 'string') {
            inputType = inputType.name;
        }

        const foundInputType = this.getInputTypeByName(model, inputType);
        return foundInputType && foundInputType.values ? foundInputType.values : [];
    }

    /**
     * Adds a value to the given input-type, if one with the name does exist.
     * @param model Model that is being mutated
     * @param inputType InputType-object or string (input-type-name)
     * @param value InputTypeValue-object or string (input-type-value-value)
     * @param checkForDuplicates
     */
    static addInputTypeValue(model: JovoModelData, inputType: ModelInputType, value: ModelInputTypeValue, checkForDuplicates = true) {
        if (typeof inputType !== 'string') {
            inputType = inputType.name;
        }

        const foundInputType = this.getInputTypeByName(model, inputType);
        if (foundInputType) {
            if (!foundInputType.values) {
                foundInputType.values = [];
            }

            if (typeof value === 'string') {
                value = {
                    value,
                    synonyms: [],
                    id: '',
                };
            }

            if (checkForDuplicates) {
                // check if there is no input with the name of 'input'; if true => add
                if (!foundInputType.values.some((inputTypeValue: InputTypeValue) => {
                    return inputTypeValue.value === (value as InputTypeValue).value;
                })) {
                    foundInputType.values.push(value);
                }
            } else {
                foundInputType.values.push(value);
            }
        }
    }

    /**
     * Removes the value of the given input-type, if the input-type & value exist.
     * @param model Model that is being mutated
     * @param inputType InputType-object or string (input-type-name)
     * @param value InputTypeValue-object or string (input-type-value-value)
     */
    static removeInputTypeValue(model: JovoModelData, inputType: ModelInputType, value: ModelInputTypeValue) {
        const indexes = this.getInputTypeValueIndex(model, inputType, value);

        if (indexes.inputTypeIndex >= 0
            && indexes.index >= 0
            && model.inputTypes
            && model.inputTypes[indexes.inputTypeIndex]
            && model.inputTypes[indexes.inputTypeIndex].values) {
            model.inputTypes[indexes.inputTypeIndex].values!.splice(indexes.index, 1);
        }
    }

    /**
     * Retrieves the index of an input-type-value from the given input-type that has the given value.
     * @param model Model
     * @param inputType InputType-object or string (input-type-name)
     * @param value InputTypeValue-object or string (input-type-value-value)
     */
    static getInputTypeValueIndex(model: JovoModelData, inputType: ModelInputType, value: ModelInputTypeValue): InputTypeIndex {
        if (typeof inputType !== 'string') {
            inputType = inputType.name;
        }

        const inputTypeIndex = this.getInputTypeIndexByName(model, inputType);
        if (inputTypeIndex >= 0 && model.inputTypes && model.inputTypes[inputTypeIndex] && model.inputTypes[inputTypeIndex].values) {
            if (typeof value !== 'string') {
                value = value.value;
            }
            const index = model.inputTypes[inputTypeIndex].values!.findIndex((inputTypeValue: InputTypeValue) => {
                return inputTypeValue.value === value;
            });
            return {
                inputTypeIndex,
                index,
            };
        }
        return {inputTypeIndex, index: -1};
    }

}
