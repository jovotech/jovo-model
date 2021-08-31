import {
  EntityType,
  EntityTypeValue,
  Intent,
  IntentEntity,
  JovoModelData,
  JovoModelHelper,
  ModelEntityType,
  ModelEntityTypeValue,
  NativeFileInformation,
} from '.';
import { InputType, IntentInput, IntentV3 } from './Interfaces';

export class JovoModel {
  static MODEL_KEY = '';
  private data: JovoModelData | undefined;
  private locale: string | undefined;

  constructor(data?: JovoModelData, locale?: string) {
    this.data = data;
    this.locale = locale;
  }

  /**
   * Exports in as JovoModel file
   *
   * @returns {(JovoModelData | undefined)}
   * @memberof JovoModel
   */
  exportJovoModel(): JovoModelData | undefined {
    return this.data;
  }

  /**
   * Exports data in native file format
   *
   * @returns {(NativeFileInformation[] | undefined)}
   * @memberof JovoModel
   */
  exportNative(): NativeFileInformation[] | undefined {
    if (this.data === undefined || this.locale === undefined) {
      return undefined;
    }
    // @ts-ignore
    return this.constructor.fromJovoModel(this.data, this.locale);
  }

  /**
   * Imports the native files
   *
   * @param {NativeFileInformation[]} inputFiles The files in the native format
   * @param {string} locale The locale of the files
   * @memberof JovoModel
   */
  importNative(inputFiles: NativeFileInformation[], locale: string) {
    // @ts-ignore
    this.data = this.constructor.toJovoModel(inputFiles, locale);
    this.locale = locale;
  }

  /**
   * Imports JovoModel
   *
   * @param {JovoModelData} data The JovoModel data
   * @param {string} locale The locale of the model
   * @memberof JovoModel
   */
  importJovoModel(data: JovoModelData, locale: string) {
    this.data = data;
    this.locale = locale;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string to be added
   */
  addIntent(intent: string, intentData: Intent): JovoModel {
    if (this.data) {
      JovoModelHelper.addIntent(this.data, intent, intentData);
    }
    return this;
  }

  getIntents(): Record<string, Intent | IntentV3> {
    return this.data ? JovoModelHelper.getIntents(this.data) : {};
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string to get removed
   */
  removeIntent(intent: string): JovoModel {
    if (this.data) {
      JovoModelHelper.removeIntent(this.data, intent);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string to get updated
   * @param newIntent Intent-object
   */
  updateIntent(intent: string, intentData: Intent): JovoModel {
    if (this.data) {
      JovoModelHelper.updateIntent(this.data, intent, intentData);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param name Intent-name to look for
   */
  getIntentByName(name: string): Intent | undefined {
    return this.data ? JovoModelHelper.getIntentByName(this.data, name) : undefined;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string to get the phrases of
   */
  getPhrases(intent: string): string[] {
    return this.data ? JovoModelHelper.getPhrases(this.data, intent) : [];
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param phrase Phrase
   */
  addPhrase(intent: string, phrase: string): JovoModel {
    if (this.data) {
      JovoModelHelper.addPhrase(this.data, intent, phrase);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param phrase Phrase
   */
  removePhrase(intent: string, phrase: string): JovoModel {
    if (this.data) {
      JovoModelHelper.removePhrase(this.data, intent, phrase);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string to be
   * @param oldPhrase Old phrase to be replaced
   * @param newPhrase New phrase to replace
   */
  updatePhrase(intent: string, oldPhrase: string, newPhrase: string): JovoModel {
    if (this.data) {
      JovoModelHelper.updatePhrase(this.data, intent, oldPhrase, newPhrase);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string to be
   * @param phrase Phrase
   */
  getPhraseIndex(intent: string, phrase: string): number {
    return this.data ? JovoModelHelper.getPhraseIndex(this.data, intent, phrase) : -1;
  }

  /**
   * See [[JovoModelHelper]]
   * @param phrase Phrase
   */
  hasPhrase(phrase: string): boolean {
    return this.data ? JovoModelHelper.hasPhrase(this.data, phrase) : false;
  }

  hasEntities(intent: string): boolean {
    return this.data ? JovoModelHelper.hasEntities(this.data, intent) : false;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   */
  getEntities(intent: string): Record<string, IntentEntity | IntentInput> {
    return this.data ? JovoModelHelper.getEntities(this.data, intent) : {};
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param input IntentEntity-object or string
   * @param checkForDuplicates
   */
  addEntity(
    intent: string,
    entity: string,
    entityData: IntentEntity,
    checkForDuplicates = true,
  ): JovoModel {
    if (this.data) {
      JovoModelHelper.addEntity(this.data, intent, entity, entityData, checkForDuplicates);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param entity IntentEntity-object or string
   */
  removeEntity(intent: string, entity: string): JovoModel {
    if (this.data) {
      JovoModelHelper.removeEntity(this.data, intent, entity);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param entityType EntityType-object or string
   */
  addEntityType(entityType: string, entityTypeData: EntityType): JovoModel {
    if (this.data) {
      JovoModelHelper.addEntityType(this.data, entityType, entityTypeData);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param entityType EntityType-object or string
   */
  removeEntityType(entityType: string): JovoModel {
    if (this.data) {
      JovoModelHelper.removeEntityType(this.data, entityType);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param entityType EntityType-object or string to be replaced
   * @param newEntityType EntityType-object or string to replace
   */
  updateEntityType(entityType: string, entityTypeData: EntityType): JovoModel {
    if (this.data) {
      JovoModelHelper.updateEntityType(this.data, entityType, entityTypeData);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param entityType EntityType-object or string
   */
  getEntityTypeByName(entityType: string): EntityType | undefined {
    return this.data ? JovoModelHelper.getEntityTypeByName(this.data, entityType) : undefined;
  }

  /**
   * See [[JovoModelHelper]]
   * @param entityType EntityType-object or string
   */
  getEntityTypeValues(entityType: string): EntityTypeValue[] {
    return this.data ? JovoModelHelper.getEntityTypeValues(this.data, entityType) : [];
  }

  /**
   * See [[JovoModelHelper]]
   * @param entityType EntityType-object or string
   * @param entityTypeValue EntityTypeValue-object or string
   * @param checkForDuplicates
   */
  addEntityTypeValue(
    entityType: string,
    entityTypeValue: ModelEntityTypeValue,
    checkForDuplicates = true,
  ): JovoModel {
    if (this.data) {
      JovoModelHelper.addEntityTypeValue(
        this.data,
        entityType,
        entityTypeValue,
        checkForDuplicates,
      );
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param entityType EntityType-object or string
   * @param entityTypeValue EntityTypeValue-object or string
   */
  removeEntityTypeValue(entityType: string, entityTypeValue: string): JovoModel {
    if (this.data) {
      JovoModelHelper.removeEntityTypeValue(this.data, entityType, entityTypeValue);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param entityType EntityType-object or string
   * @param entityTypeValue EntityTypeValue-object or string
   */
  getEntityTypeValueIndex(entityType: string, entityTypeValue: string): number {
    return this.data
      ? JovoModelHelper.getEntityTypeValueIndex(this.data, entityType, entityTypeValue)
      : -1;
  }

  /**
   * Converts native model files to JovoModel
   *
   * @param {NativeFileInformation[]} inputFiles The files in the native format
   * @param {string} locale The locale of the files
   * @returns {JovoModelData}
   * @memberof JovoModel
   */
  static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
    // @ts-ignore
    throw new Error(
      `Method "toJovoModel" is not implemented for model "${
        (this.constructor as typeof JovoModel).MODEL_KEY
      }"!`,
    );
  }

  /**
   * Converts JovoModel in native model files
   *
   * @param {JovoModel} model The JovoModel to convert
   * @param {string} locale The locale of the JovoModel
   * @returns {NativeFileInformation[]}
   * @memberof JovoModel
   */
  static fromJovoModel(model: JovoModelData, locale: string): NativeFileInformation[] {
    // @ts-ignore
    throw new Error(
      `Method "fromJovoModel" is not implemented for model "${
        (this.constructor as typeof JovoModel).MODEL_KEY
      }"!`,
    );
  }

  /**
   * Returns Validation Schema to check if data is valid
   *
   * @returns {tv4.JsonSchema}
   * @memberof JovoModelBuilder
   */
  static getValidator(): tv4.JsonSchema {
    // @ts-ignore
    throw new Error(
      `Method "getValidator" is not implemented for model "${
        (this.constructor as typeof JovoModel).MODEL_KEY
      }"!`,
    );
  }
}
