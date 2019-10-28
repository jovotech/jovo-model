import { InputType, InputTypeValue, Intent, IntentInput, JovoModelData } from './Interfaces';
import {
  InputTypeIndex,
  IntentIndex,
  JovoModelHelper,
  ModelInputType,
  ModelInputTypeValue,
  ModelIntent,
  ModelIntentInput,
} from './JovoModelHelper';

type JovoModelHelperKeys = keyof typeof JovoModelHelper;
type Keys = Exclude<JovoModelHelperKeys, 'prototype' | 'new'>;

type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
  ? []
  : (((...b: T) => any) extends (a: T[0], ...b: infer I) => any ? I : []);

export type JovoModelBuilderType = {
  [key in Keys]: (
    ...args: RemoveFirstFromTuple<Parameters<typeof JovoModelHelper[key]>>
  ) => ReturnType<typeof JovoModelHelper[key]> extends undefined | JovoModelData
    ? JovoModelBuilderInterface
    : ReturnType<typeof JovoModelHelper[key]>;
};

export interface JovoModelBuilderInterface extends JovoModelBuilderType {
  build(): JovoModelData;
}

const EXCLUDED_PROPERTIES: JovoModelHelperKeys[] = ['new', 'prototype'];

export class JovoModelBuilder implements JovoModelBuilderInterface {
  private static $initialized = false;

  addInput!: (
    intent: ModelIntent,
    input: ModelIntentInput,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilderInterface;

  addInputType!: (inputType: ModelInputType) => JovoModelBuilderInterface;

  addInputTypeValue!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilderInterface;

  addIntent!: (intent: ModelIntent) => JovoModelBuilderInterface;

  addPhrase!: (intent: ModelIntent, phrase: string) => JovoModelBuilderInterface;

  getInputIndex!: (intent: ModelIntent, input: ModelIntentInput) => IntentIndex;

  getInputTypeByName!: (name: string) => InputType | undefined;

  getInputTypeIndexByName!: (name: string) => number;

  getInputTypeValueIndex!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
  ) => InputTypeIndex;

  getInputTypeValues!: (inputType: ModelInputType) => InputTypeValue[];

  getInputs!: (intent: ModelIntent) => IntentInput[];

  getIntentByName!: (name: string) => Intent | undefined;

  getIntentIndexByName!: (name: string) => number;

  getPhraseIndex!: (intent: ModelIntent, phrase: string) => IntentIndex;

  getPhrases!: (intent: ModelIntent) => string[];

  hasPhrase!: (phrase: string) => boolean;

  prepareModel!: () => JovoModelBuilderInterface;

  removeInput!: (intent: ModelIntent, input: ModelIntentInput) => JovoModelBuilderInterface;

  removeInputType!: (inputType: ModelInputType) => JovoModelBuilderInterface;

  removeInputTypeValue!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
  ) => JovoModelBuilderInterface;

  removeIntent!: (intent: ModelIntent) => JovoModelBuilderInterface;

  removePhrase!: (intent: ModelIntent, phrase: string) => JovoModelBuilderInterface;

  updateInputType!: (
    inputType: ModelInputType,
    newInputType: InputType,
  ) => JovoModelBuilderInterface;

  updateIntent!: (intent: ModelIntent, newIntent: Intent) => JovoModelBuilderInterface;

  updateInput!: (
    intent: ModelIntent,
    oldInput: ModelIntentInput,
    newInput: IntentInput,
  ) => JovoModelBuilderInterface;

  updateInputTypeValue!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    newValue: InputTypeValue,
  ) => JovoModelBuilderInterface;

  updatePhrase!: (
    intent: ModelIntent,
    oldPhrase: string,
    newPhrase: string,
  ) => JovoModelBuilderInterface;

  addInputTypeValueSynonym!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    synonym: string,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilderInterface;

  removeInputTypeValueSynonym!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    synonym: string,
  ) => JovoModelBuilderInterface;

  updateInputTypeValueSynonym!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    synonym: string,
    newSynonym: string,
  ) => JovoModelBuilderInterface;

  private readonly $model: JovoModelData;

  constructor(model?: JovoModelData, private $timestamp = new Date().getTime()) {
    this.prepareBuilder();

    this.$model = model
      ? JSON.parse(JSON.stringify(model))
      : JovoModelHelper.prepareModel({ invocation: '' });
  }

  build(): JovoModelData {
    return JSON.parse(JSON.stringify(this.$model));
  }

  private prepareBuilder() {
    this.loadFunctions();
  }

  private loadFunctions() {
    const staticHelperMethodNames = Object.getOwnPropertyNames(JovoModelHelper).filter(
      (prop: string) => {
        return (
          typeof (JovoModelHelper as any)[prop] === 'function' &&
          !EXCLUDED_PROPERTIES.includes(prop as any)
        );
      },
    ) as Array<keyof typeof JovoModelHelper>;

    for (const methodName of staticHelperMethodNames) {
      const method = JovoModelHelper[methodName] as Function;
      (JovoModelBuilder.prototype as any)[methodName] = (...args: any[]) => {
        const result = method.call(JovoModelHelper, this.$model, ...args);

        if (result || methodName === 'getIntentByName' || methodName === 'getInputTypeByName') {
          return result;
        }

        return this;
      };
    }
  }
}
