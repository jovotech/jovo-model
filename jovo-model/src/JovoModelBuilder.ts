import { EntityType, EntityTypeValue, Intent, IntentEntity, JovoModelData } from './Interfaces';
import {
  EntityTypeIndex,
  IntentIndex,
  JovoModelHelper,
  ModelEntityType,
  ModelEntityTypeValue,
  ModelIntent,
  ModelIntentEntity,
} from './JovoModelHelper';

type JovoModelHelperKeys = keyof typeof JovoModelHelper;
type Keys = Exclude<JovoModelHelperKeys, 'prototype' | 'new'>;

// tslint:disable-next-line:no-any
type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
  ? [] // tslint:disable-next-line:no-any
  : ((...b: T) => any) extends (a: T[0], ...b: infer I) => any
  ? I
  : [];

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

  addEntity!: (
    intent: ModelIntent,
    input: ModelIntentEntity,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilder;

  addEntityType!: (inputType: ModelEntityType) => JovoModelBuilder;

  addEntityTypeValue!: (
    inputType: ModelEntityType,
    value: ModelEntityTypeValue,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilder;

  addIntent!: (intent: ModelIntent) => JovoModelBuilder;

  addPhrase!: (intent: ModelIntent, phrase: string) => JovoModelBuilder;

  getEntityIndex!: (intent: ModelIntent, input: ModelIntentEntity) => IntentIndex;

  getEntityTypeByName!: (name: string) => EntityType | undefined;

  getEntityTypeIndexByName!: (name: string) => number;

  getEntityTypeValueIndex!: (
    inputType: ModelEntityType,
    value: ModelEntityTypeValue,
  ) => EntityTypeIndex;

  getEntityTypeValues!: (inputType: ModelEntityType) => EntityTypeValue[];

  getEntities!: (intent: ModelIntent) => IntentEntity[];

  getIntentByName!: (name: string) => Intent | undefined;

  getIntentIndexByName!: (name: string) => number;

  getPhraseIndex!: (intent: ModelIntent, phrase: string) => IntentIndex;

  getPhrases!: (intent: ModelIntent) => string[];

  hasPhrase!: (phrase: string) => boolean;

  prepareModel!: () => JovoModelBuilder;

  removeEntity!: (intent: ModelIntent, input: ModelIntentEntity) => JovoModelBuilder;

  removeEntityType!: (inputType: ModelEntityType) => JovoModelBuilder;

  removeEntityTypeValue!: (
    inputType: ModelEntityType,
    value: ModelEntityTypeValue,
  ) => JovoModelBuilder;

  removeIntent!: (intent: ModelIntent) => JovoModelBuilder;

  removePhrase!: (intent: ModelIntent, phrase: string) => JovoModelBuilder;

  updateEntityType!: (inputType: ModelEntityType, newEntityType: EntityType) => JovoModelBuilder;

  updateIntent!: (intent: ModelIntent, newIntent: Intent) => JovoModelBuilder;

  updateEntity!: (
    intent: ModelIntent,
    oldEntity: ModelIntentEntity,
    newEntity: IntentEntity,
  ) => JovoModelBuilder;

  updateEntityTypeValue!: (
    inputType: ModelEntityType,
    value: ModelEntityTypeValue,
    newValue: EntityTypeValue,
  ) => JovoModelBuilder;

  updatePhrase!: (intent: ModelIntent, oldPhrase: string, newPhrase: string) => JovoModelBuilder;

  addEntityTypeValueSynonym!: (
    inputType: ModelEntityType,
    value: ModelEntityTypeValue,
    synonym: string,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilder;

  removeEntityTypeValueSynonym!: (
    inputType: ModelEntityType,
    value: ModelEntityTypeValue,
    synonym: string,
  ) => JovoModelBuilder;

  updateEntityTypeValueSynonym!: (
    inputType: ModelEntityType,
    value: ModelEntityTypeValue,
    synonym: string,
    newSynonym: string,
  ) => JovoModelBuilder;

  private readonly $model: JovoModelData;

  constructor(model?: JovoModelData, private $timestamp = new Date().getTime()) {
    this.prepareBuilder();

    this.$model = model
      ? JSON.parse(JSON.stringify(model))
      : JovoModelHelper.prepareModel({ version: 4.0, invocation: '' });
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
          // tslint:disable-next-line:no-any
          typeof (JovoModelHelper as any)[prop] === 'function' &&
          // tslint:disable-next-line:no-any
          !EXCLUDED_PROPERTIES.includes(prop as any)
        );
      },
    ) as Array<keyof typeof JovoModelHelper>;

    for (const methodName of staticHelperMethodNames) {
      const method = JovoModelHelper[methodName] as Function;
      // tslint:disable-next-line:no-any
      (JovoModelBuilder.prototype as any)[methodName] = (...args: any[]) => {
        const result = method.call(JovoModelHelper, this.$model, ...args);

        if (result || methodName === 'getIntentByName' || methodName === 'getEntityTypeByName') {
          return result;
        }

        return this;
      };
    }
  }
}
