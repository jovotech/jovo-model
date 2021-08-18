import {
  EntityType,
  EntityTypeIndex,
  EntityTypeValue,
  Intent,
  IntentIndex,
  IntentEntity,
  JovoModelData,
  JovoModelHelper,
  ModelEntityType,
  ModelEntityTypeValue,
  ModelIntent,
  ModelIntentEntity,
  NativeFileInformation,
} from '.';

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
  addIntent(intent: ModelIntent): JovoModel {
    if (this.data) {
      JovoModelHelper.addIntent(this.data, intent);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string to get removed
   */
  removeIntent(intent: ModelIntent): JovoModel {
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
  updateIntent(intent: ModelIntent, newIntent: Intent): JovoModel {
    if (this.data) {
      JovoModelHelper.updateIntent(this.data, intent, newIntent);
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
   * @param name Intent-name to look for
   */
  getIntentIndexByName(name: string): number {
    return this.data ? JovoModelHelper.getIntentIndexByName(this.data, name) : -1;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string to get the phrases of
   */
  getPhrases(intent: ModelIntent): string[] {
    return this.data ? JovoModelHelper.getPhrases(this.data, intent) : [];
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param phrase Phrase
   */
  addPhrase(intent: ModelIntent, phrase: string): JovoModel {
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
  removePhrase(intent: ModelIntent, phrase: string): JovoModel {
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
  updatePhrase(intent: ModelIntent, oldPhrase: string, newPhrase: string): JovoModel {
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
  getPhraseIndex(intent: ModelIntent, phrase: string): IntentIndex {
    return this.data
      ? JovoModelHelper.getPhraseIndex(this.data, intent, phrase)
      : { index: -1, intentIndex: -1 };
  }

  /**
   * See [[JovoModelHelper]]
   * @param phrase Phrase
   */
  hasPhrase(phrase: string): boolean {
    return this.data ? JovoModelHelper.hasPhrase(this.data, phrase) : false;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   */
  getEntities(intent: ModelIntent): IntentEntity[] {
    return this.data ? JovoModelHelper.getEntities(this.data, intent) : [];
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param input IntentEntity-object or string
   * @param checkForDuplicates
   */
  addEntity(intent: ModelIntent, input: ModelIntentEntity, checkForDuplicates = true): JovoModel {
    if (this.data) {
      JovoModelHelper.addEntity(this.data, intent, input, checkForDuplicates);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param input IntentEntity-object or string
   */
  removeEntity(intent: ModelIntent, input: ModelIntentEntity): JovoModel {
    if (this.data) {
      JovoModelHelper.removeEntity(this.data, intent, input);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param input IntentEntity-object or string
   */
  getEntityIndex(intent: ModelIntent, input: ModelIntentEntity): IntentIndex {
    return this.data
      ? JovoModelHelper.getEntityIndex(this.data, intent, input)
      : { index: -1, intentIndex: -1 };
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType EntityType-object or string
   */
  addEntityType(inputType: ModelEntityType): JovoModel {
    if (this.data) {
      JovoModelHelper.addEntityType(this.data, inputType);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType EntityType-object or string
   */
  removeEntityType(inputType: ModelEntityType): JovoModel {
    if (this.data) {
      JovoModelHelper.removeEntityType(this.data, inputType);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType EntityType-object or string to be replaced
   * @param newEntityType EntityType-object or string to replace
   */
  updateEntityType(inputType: ModelEntityType, newEntityType: EntityType): JovoModel {
    if (this.data) {
      JovoModelHelper.updateEntityType(this.data, inputType, newEntityType);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param name EntityType-object or string
   */
  getEntityTypeByName(name: string): EntityType | undefined {
    return this.data ? JovoModelHelper.getEntityTypeByName(this.data, name) : undefined;
  }

  /**
   * See [[JovoModelHelper]]
   * @param name EntityType-object or string
   */
  getEntityTypeIndexByName(name: string): number {
    return this.data ? JovoModelHelper.getEntityTypeIndexByName(this.data, name) : -1;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType EntityType-object or string
   */
  getEntityTypeValues(inputType: ModelEntityType): EntityTypeValue[] {
    return this.data ? JovoModelHelper.getEntityTypeValues(this.data, inputType) : [];
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType EntityType-object or string
   * @param value EntityTypeValue-object or string
   * @param checkForDuplicates
   */
  addEntityTypeValue(
    inputType: ModelEntityType,
    value: ModelEntityTypeValue,
    checkForDuplicates = true,
  ): JovoModel {
    if (this.data) {
      JovoModelHelper.addEntityTypeValue(this.data, inputType, value, checkForDuplicates);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType EntityType-object or string
   * @param value EntityTypeValue-object or string
   */
  removeEntityTypeValue(inputType: ModelEntityType, value: ModelEntityTypeValue): JovoModel {
    if (this.data) {
      JovoModelHelper.removeEntityTypeValue(this.data, inputType, value);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType EntityType-object or string
   * @param value EntityTypeValue-object or string
   */
  getEntityTypeValueIndex(inputType: ModelEntityType, value: ModelEntityTypeValue): EntityTypeIndex {
    return this.data
      ? JovoModelHelper.getEntityTypeValueIndex(this.data, inputType, value)
      : {
          entityTypeIndex: -1,
          index: -1,
        };
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
