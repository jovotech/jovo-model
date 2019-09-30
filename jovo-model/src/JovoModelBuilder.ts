import {InputType, InputTypeValue, Intent, IntentInput, JovoModelData} from './Interfaces';
import {JovoModelHelper, ModelInputType, ModelInputTypeValue, ModelIntent, ModelIntentInput} from './JovoModelHelper';


type JovoModelHelperKeys = keyof typeof JovoModelHelper;
type Keys = Exclude<JovoModelHelperKeys, 'prototype' | 'new'>;

type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0 // tslint:disable-line:no-any
    ? []
  : (((...b: T) => any) extends (a: T[0], ...b: infer I) => any ? I : []); // tslint:disable-line:no-any

export type JovoModelBuilderType = {
  [key in Keys]: (
    ...args: RemoveFirstFromTuple<Parameters<typeof JovoModelHelper[key]>>
  ) => JovoModelBuilderInterface
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

  addPhrase!: (
    intent: ModelIntent,
    phrase: string,
  ) => JovoModelBuilderInterface;

  getInputIndex!: (
    intent: ModelIntent,
    input: ModelIntentInput,
  ) => JovoModelBuilderInterface;

  getInputTypeByName!: (name: string) => JovoModelBuilderInterface;

  getInputTypeIndexByName!: (name: string) => JovoModelBuilderInterface;

  getInputTypeValueIndex!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
  ) => JovoModelBuilderInterface;

  getInputTypeValues!: (inputType: ModelInputType) => JovoModelBuilderInterface;

  getInputs!: (intent: ModelIntent) => JovoModelBuilderInterface;

  getIntentByName!: (name: string) => JovoModelBuilderInterface;

  getIntentIndexByName!: (name: string) => JovoModelBuilderInterface;

  getPhraseIndex!: (
    intent: ModelIntent,
    phrase: string,
  ) => JovoModelBuilderInterface;

  getPhrases!: (intent: ModelIntent) => JovoModelBuilderInterface;

  hasPhrase!: (phrase: string) => JovoModelBuilderInterface;

  prepareModel!: () => JovoModelBuilderInterface;

  removeInput!: (
    intent: ModelIntent,
    input: ModelIntentInput,
  ) => JovoModelBuilderInterface;

  removeInputType!: (inputType: ModelInputType) => JovoModelBuilderInterface;

  removeInputTypeValue!: (
    inputType: ModelInputType,
    value: ModelInputTypeValue,
  ) => JovoModelBuilderInterface;

  removeIntent!: (intent: ModelIntent) => JovoModelBuilderInterface;

  removePhrase!: (
    intent: ModelIntent,
    phrase: string,
  ) => JovoModelBuilderInterface;

  updateInputType!: (
    inputType: ModelInputType,
    newInputType: InputType,
  ) => JovoModelBuilderInterface;

  updateIntent!: (
    intent: ModelIntent,
    newIntent: Intent,
  ) => JovoModelBuilderInterface;

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

  private $model: JovoModelData;

  constructor(
    model?: JovoModelData,
    private $timestamp = new Date().getTime(),
  ) {
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
    const staticHelperMethodNames = Object.getOwnPropertyNames(
      JovoModelHelper,
    ).filter((prop: string) => {
      return (
        typeof (JovoModelHelper as any)[prop] === 'function' && // tslint:disable-line:no-any
        !EXCLUDED_PROPERTIES.includes(prop as any) // tslint:disable-line:no-any
      );
    });

    staticHelperMethodNames.forEach((methodName: string) => {
      const method: (...args: any[]) => any = (JovoModelHelper as any)[ // tslint:disable-line:no-any
        methodName
      ];
      (JovoModelBuilder.prototype as any)[methodName] = (...args: any[]) => { // tslint:disable-line:no-any
        method.call(JovoModelHelper, this.$model, ...args);
        return this;
      };
    });
  }
}
