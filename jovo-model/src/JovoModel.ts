import {
  InputType,
  InputTypeIndex,
  InputTypeValue,
  Intent,
  IntentIndex,
  IntentInput,
  JovoModelData,
  JovoModelHelper,
  ModelInputType,
  ModelInputTypeValue,
  ModelIntent,
  ModelIntentInput,
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
  getInputs(intent: ModelIntent): IntentInput[] {
    return this.data ? JovoModelHelper.getInputs(this.data, intent) : [];
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param input IntentInput-object or string
   * @param checkForDuplicates
   */
  addInput(intent: ModelIntent, input: ModelIntentInput, checkForDuplicates = true): JovoModel {
    if (this.data) {
      JovoModelHelper.addInput(this.data, intent, input, checkForDuplicates);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param input IntentInput-object or string
   */
  removeInput(intent: ModelIntent, input: ModelIntentInput): JovoModel {
    if (this.data) {
      JovoModelHelper.removeInput(this.data, intent, input);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param intent Intent-object or string
   * @param input IntentInput-object or string
   */
  getInputIndex(intent: ModelIntent, input: ModelIntentInput): IntentIndex {
    return this.data
      ? JovoModelHelper.getInputIndex(this.data, intent, input)
      : { index: -1, intentIndex: -1 };
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType InputType-object or string
   */
  addInputType(inputType: ModelInputType): JovoModel {
    if (this.data) {
      JovoModelHelper.addInputType(this.data, inputType);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType InputType-object or string
   */
  removeInputType(inputType: ModelInputType): JovoModel {
    if (this.data) {
      JovoModelHelper.removeInputType(this.data, inputType);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType InputType-object or string to be replaced
   * @param newInputType InputType-object or string to replace
   */
  updateInputType(inputType: ModelInputType, newInputType: InputType): JovoModel {
    if (this.data) {
      JovoModelHelper.updateInputType(this.data, inputType, newInputType);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param name InputType-object or string
   */
  getInputTypeByName(name: string): InputType | undefined {
    return this.data ? JovoModelHelper.getInputTypeByName(this.data, name) : undefined;
  }

  /**
   * See [[JovoModelHelper]]
   * @param name InputType-object or string
   */
  getInputTypeIndexByName(name: string): number {
    return this.data ? JovoModelHelper.getInputTypeIndexByName(this.data, name) : -1;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType InputType-object or string
   */
  getInputTypeValues(inputType: ModelInputType): InputTypeValue[] {
    return this.data ? JovoModelHelper.getInputTypeValues(this.data, inputType) : [];
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType InputType-object or string
   * @param value InputTypeValue-object or string
   * @param checkForDuplicates
   */
  addInputTypeValue(
    inputType: ModelInputType,
    value: ModelInputTypeValue,
    checkForDuplicates = true,
  ): JovoModel {
    if (this.data) {
      JovoModelHelper.addInputTypeValue(this.data, inputType, value, checkForDuplicates);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType InputType-object or string
   * @param value InputTypeValue-object or string
   */
  removeInputTypeValue(inputType: ModelInputType, value: ModelInputTypeValue): JovoModel {
    if (this.data) {
      JovoModelHelper.removeInputTypeValue(this.data, inputType, value);
    }
    return this;
  }

  /**
   * See [[JovoModelHelper]]
   * @param inputType InputType-object or string
   * @param value InputTypeValue-object or string
   */
  getInputTypeValueIndex(inputType: ModelInputType, value: ModelInputTypeValue): InputTypeIndex {
    return this.data
      ? JovoModelHelper.getInputTypeValueIndex(this.data, inputType, value)
      : {
          inputTypeIndex: -1,
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
