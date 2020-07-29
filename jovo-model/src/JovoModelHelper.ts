import has = require('lodash.has');
import { InputType, InputTypeValue, Intent, IntentInput, JovoModelData } from './Interfaces';

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
 * All methods directly mutate the model!
 */
export class JovoModelHelper {
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

  static prepareModel(model: JovoModelData): JovoModelData {
    // remove observers
    if (model.inputTypes && model.inputTypes.length > 0) {
      model.inputTypes.forEach((inputType: InputType) => {
        if (inputType.values && inputType.values.length > 0) {
          inputType.values.forEach((value: InputTypeValue) => {
            if (!value.id) {
              value.id = '';
            }
            if (!value.synonyms) {
              value.synonyms = [];
            }
          });
        } else {
          inputType.values = [];
        }
      });
    } else {
      model.inputTypes = [];
    }

    if (model.intents && model.intents.length > 0) {
      model.intents.forEach((intent: Intent) => {
        if (!intent.phrases) {
          intent.phrases = [];
        }
        if (!intent.samples) {
          intent.samples = [];
        }
        if (!intent.inputs) {
          intent.inputs = [];
        }
      });
    } else {
      model.intents = [];
    }
    return model;
  }

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

  static removeIntent(model: JovoModelData, intent: ModelIntent) {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }

    const index = this.getIntentIndexByName(model, intent);
    if (index >= 0 && model.intents) {
      model.intents.splice(index, 1);
    }
  }

  static updateIntent(model: JovoModelData, intent: ModelIntent, newIntent: Intent) {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }
    const index = this.getIntentIndexByName(model, intent);
    if (index >= 0 && model.intents) {
      const intents = model.intents.slice();
      intents[index] = newIntent;
      model.intents = intents;
    }
  }

  static getIntentByName(model: JovoModelData, name: string): Intent | undefined {
    if (!model.intents) {
      return;
    }
    return model.intents.find((intent: Intent) => {
      return intent.name === name;
    });
  }

  static getIntentIndexByName(model: JovoModelData, name: string): number {
    if (!model.intents) {
      return -1;
    }
    return model.intents.findIndex((intent: Intent) => {
      return intent.name === name;
    });
  }

  static getPhrases(model: JovoModelData, intent: ModelIntent): string[] {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }

    const foundIntent = this.getIntentByName(model, intent);
    return foundIntent && foundIntent.phrases ? foundIntent.phrases : [];
  }

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

  static removePhrase(model: JovoModelData, intent: ModelIntent, phrase: string) {
    const indexes = this.getPhraseIndex(model, intent, phrase);

    if (has(model, `intents[${indexes.intentIndex}].phrases[${indexes.index}]`)) {
      model.intents![indexes.intentIndex].phrases!.splice(indexes.index, 1);
    }
  }

  static updatePhrase(
    model: JovoModelData,
    intent: ModelIntent,
    oldPhrase: string,
    newPhrase: string,
  ) {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }

    const indexes = this.getPhraseIndex(model, intent, oldPhrase);
    if (has(model, `intents[${indexes.intentIndex}].phrases[${indexes.index}]`)) {
      const phrases = model.intents![indexes.intentIndex].phrases!.slice();
      phrases[indexes.index] = newPhrase;
      model.intents![indexes.intentIndex].phrases = phrases;
    }
  }

  static getPhraseIndex(model: JovoModelData, intent: ModelIntent, phrase: string): IntentIndex {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }

    const intentIndex = this.getIntentIndexByName(model, intent);
    if (has(model, `intents[${intentIndex}].phrases`)) {
      return {
        intentIndex,
        index: model.intents![intentIndex].phrases!.indexOf(phrase),
      };
    }
    return { intentIndex, index: -1 };
  }

  static hasPhrase(model: JovoModelData, phrase: string): boolean {
    if (!model.intents) {
      return false;
    }
    return model.intents.some((intent: Intent) => {
      return intent.phrases!.includes(phrase);
    });
  }

  static getInputs(model: JovoModelData, intent: ModelIntent): IntentInput[] {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }

    const foundIntent = this.getIntentByName(model, intent);
    return foundIntent && foundIntent.inputs ? foundIntent.inputs : [];
  }

  static addInput(
    model: JovoModelData,
    intent: ModelIntent,
    input: ModelIntentInput,
    checkForDuplicates = true,
  ) {
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
        if (
          !foundIntent.inputs.some((intentInput: IntentInput) => {
            return intentInput.name === (input as IntentInput).name;
          })
        ) {
          foundIntent.inputs.push(input);
        }
      } else {
        foundIntent.inputs.push(input);
      }
    }
  }

  static removeInput(model: JovoModelData, intent: ModelIntent, input: ModelIntentInput) {
    const indexes = this.getInputIndex(model, intent, input);

    if (has(model, `intents[${indexes.intentIndex}].inputs[${indexes.index}]`)) {
      model.intents![indexes.intentIndex].inputs!.splice(indexes.index, 1);
    }
  }

  static updateInput(
    model: JovoModelData,
    intent: ModelIntent,
    oldInput: ModelIntentInput,
    newInput: IntentInput,
  ) {
    const indexes = this.getInputIndex(model, intent, oldInput);

    if (has(model, `intents[${indexes.intentIndex}].inputs[${indexes.index}]`)) {
      const inputs = model.intents![indexes.intentIndex].inputs!.slice();
      inputs[indexes.index] = newInput;
      model.intents![indexes.intentIndex].inputs = inputs;
    }
  }

  static getInputIndex(
    model: JovoModelData,
    intent: ModelIntent,
    input: ModelIntentInput,
  ): IntentIndex {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }

    const intentIndex = this.getIntentIndexByName(model, intent);
    if (has(model, `intents[${intentIndex}].inputs`)) {
      if (typeof input !== 'string') {
        input = input.name;
      }

      const index = model.intents![intentIndex].inputs!.findIndex((intentInput: IntentInput) => {
        return intentInput.name === input;
      });
      return {
        intentIndex,
        index,
      };
    }
    return { intentIndex, index: -1 };
  }

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

  static removeInputType(model: JovoModelData, inputType: ModelInputType) {
    if (typeof inputType !== 'string') {
      inputType = inputType.name;
    }

    const index = this.getInputTypeIndexByName(model, inputType);
    if (index >= 0 && model.inputTypes) {
      model.inputTypes.splice(index, 1);
    }
  }

  static updateInputType(model: JovoModelData, inputType: ModelInputType, newInputType: InputType) {
    if (typeof inputType !== 'string') {
      inputType = inputType.name;
    }

    const index = this.getInputTypeIndexByName(model, inputType);
    if (index >= 0 && model.inputTypes) {
      const inputTypes = model.inputTypes.slice();
      inputTypes[index] = newInputType;
      model.inputTypes = inputTypes;
    }
  }

  static getInputTypeByName(model: JovoModelData, name: string): InputType | undefined {
    if (!model.inputTypes) {
      return;
    }
    return model.inputTypes.find((type: InputType) => {
      return type.name === name;
    });
  }

  static getInputTypeIndexByName(model: JovoModelData, name: string): number {
    if (!model.inputTypes) {
      return -1;
    }
    return model.inputTypes.findIndex((type: InputType) => {
      return type.name === name;
    });
  }

  static getInputTypeValues(model: JovoModelData, inputType: ModelInputType): InputTypeValue[] {
    if (typeof inputType !== 'string') {
      inputType = inputType.name;
    }

    const foundInputType = this.getInputTypeByName(model, inputType);
    return foundInputType && foundInputType.values ? foundInputType.values : [];
  }

  static addInputTypeValue(
    model: JovoModelData,
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    checkForDuplicates = true,
  ) {
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
        if (
          !foundInputType.values.some((inputTypeValue: InputTypeValue) => {
            return inputTypeValue.value === (value as InputTypeValue).value;
          })
        ) {
          foundInputType.values.push(value);
        }
      } else {
        foundInputType.values.push(value);
      }
    }
  }

  static removeInputTypeValue(
    model: JovoModelData,
    inputType: ModelInputType,
    value: ModelInputTypeValue,
  ) {
    const indexes = this.getInputTypeValueIndex(model, inputType, value);

    if (has(model, `inputTypes[${indexes.inputTypeIndex}].values[${indexes.index}]`)) {
      model.inputTypes![indexes.inputTypeIndex].values!.splice(indexes.index, 1);
    }
  }

  static updateInputTypeValue(
    model: JovoModelData,
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    newValue: InputTypeValue,
  ) {
    const indexes = this.getInputTypeValueIndex(model, inputType, value);

    if (has(model, `inputTypes[${indexes.inputTypeIndex}].values[${indexes.index}]`)) {
      const values = model.inputTypes![indexes.inputTypeIndex].values!.slice();
      values[indexes.index] = newValue;
      model.inputTypes![indexes.inputTypeIndex].values = values;
    }
  }

  static getInputTypeValueIndex(
    model: JovoModelData,
    inputType: ModelInputType,
    value: ModelInputTypeValue,
  ): InputTypeIndex {
    if (typeof inputType !== 'string') {
      inputType = inputType.name;
    }

    const inputTypeIndex = this.getInputTypeIndexByName(model, inputType);
    if (has(model, `inputTypes[${inputTypeIndex}].values`)) {
      if (typeof value !== 'string') {
        value = value.value;
      }
      const index = model.inputTypes![inputTypeIndex].values!.findIndex(
        (inputTypeValue: InputTypeValue) => {
          return inputTypeValue.value === value;
        },
      );
      return {
        inputTypeIndex,
        index,
      };
    }
    return { inputTypeIndex, index: -1 };
  }

  static addInputTypeValueSynonym(
    model: JovoModelData,
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    synonym: string,
    checkForDuplicates = true,
  ) {
    if (typeof inputType !== 'string') {
      inputType = inputType.name;
    }

    const indexes = this.getInputTypeValueIndex(model, inputType, value);
    if (has(model, `inputTypes[${indexes.inputTypeIndex}].values[${indexes.index}]`)) {
      if (!model.inputTypes![indexes.inputTypeIndex].values![indexes.index].synonyms) {
        model.inputTypes![indexes.inputTypeIndex].values![indexes.index].synonyms = [];
      }

      if (checkForDuplicates) {
        if (
          !model.inputTypes![indexes.inputTypeIndex].values![indexes.index].synonyms!.includes(
            synonym,
          )
        ) {
          model.inputTypes![indexes.inputTypeIndex].values![indexes.index].synonyms!.push(synonym);
        }
      } else {
        model.inputTypes![indexes.inputTypeIndex].values![indexes.index].synonyms!.push(synonym);
      }
    }
  }

  static removeInputTypeValueSynonym(
    model: JovoModelData,
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    synonym: string,
  ) {
    if (typeof inputType !== 'string') {
      inputType = inputType.name;
    }

    const indexes = this.getInputTypeValueIndex(model, inputType, value);
    if (has(model, `inputTypes[${indexes.inputTypeIndex}].values[${indexes.index}].synonyms`)) {
      const synonymIndex = model.inputTypes![indexes.inputTypeIndex].values![
        indexes.index
      ].synonyms!.indexOf(synonym);
      if (synonymIndex >= 0) {
        model.inputTypes![indexes.inputTypeIndex].values![indexes.index].synonyms!.splice(
          synonymIndex,
          1,
        );
      }
    }
  }

  static updateInputTypeValueSynonym(
    model: JovoModelData,
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    synonym: string,
    newSynonym: string,
  ) {
    if (typeof inputType !== 'string') {
      inputType = inputType.name;
    }

    const indexes = this.getInputTypeValueIndex(model, inputType, value);
    if (has(model, `inputTypes[${indexes.inputTypeIndex}].values[${indexes.index}].synonyms`)) {
      const synonymIndex = model.inputTypes![indexes.inputTypeIndex].values![
        indexes.index
      ].synonyms!.indexOf(synonym);
      if (synonymIndex >= 0) {
        const synonyms = model.inputTypes![indexes.inputTypeIndex].values![
          indexes.index
        ].synonyms!.slice();
        synonyms[synonymIndex] = newSynonym;
        model.inputTypes![indexes.inputTypeIndex].values![indexes.index].synonyms = synonyms;
      }
    }
  }
}
