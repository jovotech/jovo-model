import {
  EntityType,
  EntityTypeValue,
  InputType,
  Intent,
  IntentEntity,
  IntentV3,
  JovoModelData,
  JovoModelDataV3,
} from './Interfaces';
import { JovoModelHelper, ModelEntityType, ModelEntityTypeValue } from './JovoModelHelper';

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
    intent: string,
    entity: string,
    entityData?: IntentEntity,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilder;

  addEntityType!: (entityType: string) => JovoModelBuilder;

  addEntityTypeValue!: (
    entityType: string,
    entityTypeValue: ModelEntityTypeValue,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilder;

  addIntent!: (intent: string, intentData?: Intent) => JovoModelBuilder;

  getIntents!: () => Record<string, Intent | IntentV3>;

  addPhrase!: (intent: string, phrase: string) => JovoModelBuilder;

  getEntityTypeByName!: (entityType: string) => EntityType | undefined;

  getEntityTypeValueIndex!: (entityType: string, entityTypeValue: string) => number;

  getEntityTypeValues!: (inputType: ModelEntityType) => EntityTypeValue[];

  hasEntities!: (intent: string) => boolean;

  getEntities!: (intent: string) => Record<string, IntentEntity>;

  getIntentByName!: (intent: string) => Intent | undefined;

  getPhraseIndex!: (intent: string, phrase: string) => number;

  getPhrases!: (intent: string) => string[];

  hasPhrase!: (phrase: string) => boolean;

  prepareModel!: () => JovoModelBuilder;

  removeEntity!: (intent: string, entity: string) => JovoModelBuilder;

  removeEntityType!: (entityType: string) => JovoModelBuilder;

  removeEntityTypeValue!: (entityType: string, entityTypeValue: string) => JovoModelBuilder;

  removeIntent!: (intent: string) => JovoModelBuilder;

  removePhrase!: (intent: string, phrase: string) => JovoModelBuilder;

  getEntityTypes!: () => Record<string, EntityType | InputType>;

  updateEntityType!: (entityType: string, entityTypeData: EntityType) => JovoModelBuilder;

  updateIntent!: (intent: string, intentData: Intent) => JovoModelBuilder;

  updateEntity!: (intent: string, entity: string, entityData: IntentEntity) => JovoModelBuilder;

  updateEntityTypeValue!: (
    entityType: string,
    entityTypeValue: string,
    entityTypeValueData: EntityTypeValue,
  ) => JovoModelBuilder;

  updatePhrase!: (intent: string, oldPhrase: string, newPhrase: string) => JovoModelBuilder;

  addEntityTypeValueSynonym!: (
    entityType: string,
    entityTypeValue: string,
    synonym: string,
    checkForDuplicates?: boolean,
  ) => JovoModelBuilder;

  removeEntityTypeValueSynonym!: (
    entityType: string,
    entityTypeValue: string,
    synonym: string,
  ) => JovoModelBuilder;

  updateEntityTypeValueSynonym!: (
    entityType: string,
    entityTypeValue: string,
    oldSynonym: string,
    newSynonym: string,
  ) => JovoModelBuilder;

  isJovoModelV3!: () => boolean;

  isIntentV3!: () => boolean;

  private readonly $model: JovoModelData;

  constructor(model?: JovoModelData, private $timestamp = new Date().getTime()) {
    this.prepareBuilder();

    this.$model = model
      ? JSON.parse(JSON.stringify(model))
      : JovoModelHelper.prepareModel({ version: '4.0', invocation: '' });
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
