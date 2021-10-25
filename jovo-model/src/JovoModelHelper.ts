import _has = require('lodash.has');
import {
  EntityType,
  EntityTypeValue,
  InputType,
  InputTypeValue,
  Intent,
  IntentEntity,
  IntentInput,
  IntentV3,
  JovoModelData,
  JovoModelDataV3,
} from './Interfaces';
import { reduceToMap } from './utilities';

export type ModelIntent = Intent | string;
export type ModelIntentEntity = IntentEntity | string;

export type ModelEntityType = EntityType | string;
export type ModelEntityTypeValue = EntityTypeValue | string;

/**
 * Helper class that provides methods to mutate the model.
 * All methods directly mutate the model!
 */
export class JovoModelHelper {
  static new(
    invocation = 'app',
    intents: Record<string, Intent> = {},
    entityTypes: Record<string, EntityType> = {},
  ): JovoModelData {
    return {
      version: '4.0',
      invocation,
      intents,
      entityTypes,
    };
  }

  static prepareModel(model: JovoModelData | JovoModelDataV3): JovoModelData | JovoModelDataV3 {
    if (this.isJovoModelV3(model)) {
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
        model.intents.forEach((intent: IntentV3) => {
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
    } else {
      // remove observers
      if (model.entityTypes && Object.keys(model.entityTypes).length > 0) {
        for (const entityType of Object.values(model.entityTypes)) {
          if (entityType.values && entityType.values.length > 0) {
            entityType.values.forEach((value: EntityTypeValue | string) => {
              if (typeof value === 'object') {
                if (!value.id) {
                  value.id = '';
                }
                if (!value.synonyms) {
                  value.synonyms = [];
                }
              }
            });
          } else {
            entityType.values = [];
          }
        }
      } else {
        model.entityTypes = {};
      }

      if (model.intents && model.intents.length > 0) {
        for (const intent of Object.values(model.intents)) {
          if (!intent.phrases) {
            intent.phrases = [];
          }
          if (!intent.samples) {
            intent.samples = [];
          }
          if (!intent.entities) {
            intent.entities = {};
          }
        }
      } else {
        model.intents = {};
      }
    }
    return model;
  }

  static hasIntents(model: JovoModelData | JovoModelDataV3): boolean {
    if (!model.intents) {
      return false;
    }

    return this.isJovoModelV3(model)
      ? model.intents.length >= 0
      : Object.keys(model.intents).length >= 0;
  }

  static addIntent(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
    intentData: Intent | IntentV3,
  ) {
    if (this.isJovoModelV3(model)) {
      if (!this.getIntentByName(model, intent)) {
        if (!model.intents) {
          model.intents = [];
        }

        model.intents.push(intentData as IntentV3);
      }
    } else {
      if (!this.getIntentByName(model, intent)) {
        if (!model.intents) {
          model.intents = {};
        }

        model.intents[intent] = intentData;
      }
    }
  }

  static removeIntent(model: JovoModelData | JovoModelDataV3, intent: string) {
    if (this.isJovoModelV3(model)) {
      const index = this.getIntentIndex(model, intent);
      if (index >= 0 && model.intents) {
        model.intents.splice(index, 1);
      }
    } else {
      if (model.intents) {
        delete model.intents[intent];
      }
    }
  }

  static updateIntent(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
    intentData: Intent | IntentV3,
  ) {
    if (this.isJovoModelV3(model)) {
      const index = this.getIntentIndex(model, intent);
      if (index >= 0 && model.intents) {
        const intents = model.intents.slice();
        intents[index] = intentData as IntentV3;
        model.intents = intents;
      }
    } else {
      if (model.intents) {
        model.intents[intent] = intentData;
      }
    }
  }

  static isJovoModelV3(model: JovoModelData | JovoModelDataV3): model is JovoModelDataV3 {
    return !(model as JovoModelData).version;
  }

  static isIntentV3(intent: Intent | IntentV3): intent is IntentV3 {
    return !!(intent as IntentV3).name;
  }

  static getIntents(model: JovoModelData | JovoModelDataV3): Record<string, Intent | IntentV3> {
    if (this.isJovoModelV3(model)) {
      if (!model.intents) {
        return {};
      }

      const intents = reduceToMap('name', model.intents);
      return intents;
    } else {
      return model.intents || {};
    }
  }

  static getIntentByName(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
  ): Intent | undefined {
    if (!model.intents) {
      return;
    }

    return this.getIntents(model)[intent];
  }

  static getPhrases(model: JovoModelData | JovoModelDataV3, intent: string): string[] {
    const foundIntent: Intent | IntentV3 | undefined = this.getIntentByName(model, intent);
    return foundIntent?.phrases || [];
  }

  static addPhrase(model: JovoModelData | JovoModelDataV3, intent: string, phrase: string) {
    const foundIntent: Intent | IntentV3 | undefined = this.getIntentByName(model, intent);
    if (foundIntent) {
      if (!foundIntent.phrases) {
        foundIntent.phrases = [];
      }
      if (!foundIntent.phrases.includes(phrase)) {
        foundIntent.phrases.push(phrase);
      }
    }
  }

  static removePhrase(model: JovoModelData | JovoModelDataV3, intent: string, phrase: string) {
    if (this.isJovoModelV3(model)) {
      const intentIndex: number = this.getIntentIndex(model, intent);
      const phraseIndex = this.getPhraseIndex(model, intent, phrase);

      if (_has(model, `intents[${intentIndex}].phrases[${phraseIndex}]`)) {
        model.intents![intentIndex].phrases!.splice(phraseIndex, 1);
      }
    } else {
      const index: number = this.getPhraseIndex(model, intent, phrase);
      if (_has(model, `intents[${intent}].phrases[${index}]`)) {
        model.intents![intent].phrases!.splice(index, 1);
      }
    }
  }

  static updatePhrase(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
    oldPhrase: string,
    newPhrase: string,
  ) {
    if (this.isJovoModelV3(model)) {
      const intentIndex: number = this.getIntentIndex(model, intent);
      const phraseIndex: number = this.getPhraseIndex(model, intent, oldPhrase);

      if (_has(model, `intents[${intentIndex}].phrases[${phraseIndex}]`)) {
        const phrases = model.intents![intentIndex].phrases!.slice();
        phrases[phraseIndex] = newPhrase;
        model.intents![intentIndex].phrases = phrases;
      }
    } else {
      const index: number = this.getPhraseIndex(model, intent, oldPhrase);
      if (_has(model, `intents[${intent}].phrases[${index}]`)) {
        model.intents![intent].phrases![index] = newPhrase;
      }
    }
  }

  static getPhraseIndex(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
    phrase: string,
  ): number {
    if (this.isJovoModelV3(model)) {
      const intentIndex: number = this.getIntentIndex(model, intent);
      if (!_has(model, `intents[${intentIndex}].phrases`)) {
        return -1;
      }

      return model.intents![intentIndex].phrases!.indexOf(phrase);
    } else {
      if (_has(model, `intents[${intent}].phrases`)) {
        return model.intents![intent].phrases!.indexOf(phrase);
      }
      return -1;
    }
  }

  static hasPhrase(model: JovoModelData | JovoModelDataV3, phrase: string): boolean {
    if (!model.intents) {
      return false;
    }
    return Object.values(model.intents).some((intent: Intent) => {
      return (intent.phrases || []).includes(phrase);
    });
  }

  static hasEntities(model: JovoModelData | JovoModelDataV3, intent: string) {
    const foundIntent: Intent | IntentV3 | undefined = this.getIntentByName(model, intent);
    return foundIntent
      ? this.isIntentV3(foundIntent)
        ? !!foundIntent.inputs
        : !!foundIntent.entities
      : false;
  }

  static getEntities(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
  ): Record<string, IntentEntity | IntentInput> {
    const foundIntent: Intent | IntentV3 | undefined = this.getIntentByName(model, intent);
    if (!foundIntent) {
      return {};
    }

    if (this.isIntentV3(foundIntent)) {
      if (!foundIntent.inputs) {
        return {};
      }

      return reduceToMap('name', foundIntent.inputs);
    } else {
      return foundIntent.entities || {};
    }
  }

  static getEntityByName(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
    entity: string,
  ): IntentEntity | IntentInput | undefined {
    const entities = this.getEntities(model, intent);

    return entities[entity];
  }

  static addEntity(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
    entity: string,
    entityData: IntentEntity = { type: '', text: '' },
    checkForDuplicates: boolean = true,
  ) {
    const foundIntent: Intent | undefined = this.getIntentByName(model, intent);

    if (!foundIntent) {
      return;
    }

    if (!foundIntent.entities) {
      foundIntent.entities = {};
    }
    if (!checkForDuplicates || !foundIntent.entities[entity]) {
      foundIntent.entities[entity] = entityData;
    }
  }

  static removeEntity(model: JovoModelData | JovoModelDataV3, intent: string, entity: string) {
    if (this.isJovoModelV3(model)) {
      const intentIndex: number = this.getIntentIndex(model, intent);
      const inputIndex: number = this.getInputIndex(model, intent, entity);

      if (_has(model, `intents[${intentIndex}].inputs[${inputIndex}]`)) {
        model.intents![intentIndex].inputs!.splice(inputIndex, 1);
      }
    } else {
      if (_has(model, `intents[${intent}].entities[${entity}]`)) {
        delete model.intents![intent].entities![entity];
      }
    }
  }

  static updateEntity(
    model: JovoModelData | JovoModelDataV3,
    intent: string,
    entity: string,
    entityData: IntentEntity | IntentInput,
  ) {
    if (this.isJovoModelV3(model)) {
      const intentIndex: number = this.getIntentIndex(model, intent);
      const inputIndex: number = this.getInputIndex(model, intent, entity);

      if (_has(model, `intents[${intentIndex}].inputs[${inputIndex}]`)) {
        const inputs = model.intents![intentIndex].inputs!.slice();
        inputs[inputIndex] = entityData as IntentInput;
        model.intents![intentIndex].inputs = inputs;
      }
    } else {
      if (_has(model, `intents[${intent}].entities[${entity}]`)) {
        model.intents![intent].entities![entity] = entityData;
      }
    }
  }

  static hasEntityTypes(model: JovoModelData | JovoModelDataV3): boolean {
    return this.isJovoModelV3(model) ? !!model.inputTypes : !!model.entityTypes;
  }

  static addEntityType(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
    entityTypeData: EntityType | InputType = { values: [] },
  ) {
    if (!this.hasEntityTypes(model)) {
      if (this.isJovoModelV3(model)) {
        model.inputTypes = [];
      } else {
        model.entityTypes = {};
      }
    }

    if (!this.getEntityTypeByName(model, entityType)) {
      if (this.isJovoModelV3(model)) {
        model.inputTypes!.push({ ...(entityTypeData as InputType), name: entityType });
      } else {
        model.entityTypes![entityType] = entityTypeData as EntityType;
      }
    }
  }

  static removeEntityType(model: JovoModelData | JovoModelDataV3, entityType: string) {
    if (this.isJovoModelV3(model)) {
      const inputIndex: number = this.getInputTypeIndex(model, entityType);
      if (inputIndex >= 0 && model.inputTypes) {
        model.inputTypes.splice(inputIndex, 1);
      }
    } else {
      if (model.entityTypes) {
        delete model.entityTypes[entityType];
      }
    }
  }

  static updateEntityType(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
    entityTypeData: EntityType | InputType,
  ) {
    if (this.isJovoModelV3(model)) {
      const index = this.getInputTypeIndex(model, entityType);
      if (index >= 0 && model.inputTypes) {
        const inputTypes = model.inputTypes.slice();
        inputTypes[index] = entityTypeData as InputType;
        model.inputTypes = inputTypes;
      }
    } else {
      if (model.entityTypes) {
        model.entityTypes[entityType] = entityTypeData as EntityType;
      }
    }
  }

  static getEntityTypes(
    model: JovoModelData | JovoModelDataV3,
  ): Record<string, EntityType | InputType> {
    if (this.isJovoModelV3(model)) {
      if (!model.inputTypes) {
        return {};
      }

      return reduceToMap('name', model.inputTypes);
    } else {
      return model.entityTypes || {};
    }
  }

  static getEntityTypeByName(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
  ): EntityType | InputType | undefined {
    const entityTypes = this.getEntityTypes(model);
    return entityTypes[entityType];
  }

  static getEntityTypeValues(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
  ): Array<string | EntityTypeValue> {
    if (this.isJovoModelV3(model)) {
      const foundInputType: InputType | undefined = this.getInputTypeByName(model, entityType);

      return foundInputType && foundInputType.values ? foundInputType.values : [];
    } else {
      const foundEntityType: EntityType | undefined = this.getEntityTypeByName(
        model,
        entityType,
      ) as EntityType | undefined;
      return foundEntityType?.values || [];
    }
  }

  static addEntityTypeValue(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
    entityTypeValue: ModelEntityTypeValue,
    checkForDuplicates: boolean = true,
  ) {
    if (this.isJovoModelV3(model)) {
      const foundInputType = this.getInputTypeByName(model, entityType);
      if (foundInputType) {
        if (!foundInputType.values) {
          foundInputType.values = [];
        }

        if (checkForDuplicates) {
          // check if there is no input with the name of 'input'; if true => add
          if (
            !foundInputType.values.some((inputTypeValue: InputTypeValue) => {
              return inputTypeValue.value === (entityTypeValue as InputTypeValue).value;
            })
          ) {
            foundInputType.values.push(entityTypeValue as InputTypeValue);
          }
        } else {
          foundInputType.values.push(entityTypeValue as InputTypeValue);
        }
      }
    } else {
      const foundEntityType: EntityType | undefined = this.getEntityTypeByName(
        model,
        entityType,
      ) as EntityType | undefined;

      if (!foundEntityType) {
        return;
      }

      if (!foundEntityType.values) {
        foundEntityType.values = [];
      }

      if (typeof entityTypeValue === 'string') {
        entityTypeValue = {
          value: entityTypeValue,
          synonyms: [],
          id: '',
        };
      }

      if (
        !checkForDuplicates ||
        !foundEntityType.values.some(
          (el: ModelEntityTypeValue) =>
            (typeof el === 'string' ? el : el.value) === (entityTypeValue as EntityTypeValue).value,
        )
      ) {
        foundEntityType.values.push(entityTypeValue as EntityTypeValue);
      }
    }
  }

  static removeEntityTypeValue(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
    entityTypeValue: string,
  ) {
    if (this.isJovoModelV3(model)) {
      const inputTypeIndex: number = this.getInputTypeIndex(model, entityType);
      const inputTypeValueIndex: number = this.getInputTypeValueIndex(
        model,
        entityType,
        entityTypeValue,
      );

      if (_has(model, `inputTypes[${inputTypeIndex}].values[${inputTypeValueIndex}]`)) {
        model.inputTypes![inputTypeIndex].values!.splice(inputTypeValueIndex, 1);
      }
    } else {
      const index: number = this.getEntityTypeValueIndex(model, entityType, entityTypeValue);

      if (_has(model, `entityTypes[${entityType}].values[${index}]`)) {
        model.entityTypes![entityType].values!.splice(index, 1);
      }
    }
  }

  static updateEntityTypeValue(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
    entityTypeValue: string,
    entityTypeValueData: EntityTypeValue,
  ) {
    if (this.isJovoModelV3(model)) {
      const inputTypeIndex: number = this.getInputTypeIndex(model, entityType);
      const inputTypeValueIndex: number = this.getInputTypeValueIndex(
        model,
        entityType,
        entityTypeValue,
      );

      if (_has(model, `inputTypes[${inputTypeIndex}].values[${inputTypeValueIndex}]`)) {
        const values = model.inputTypes![inputTypeIndex].values!.slice();
        values[inputTypeValueIndex] = entityTypeValueData;
        model.inputTypes![inputTypeIndex].values = values;
      }
    } else {
      const index: number = this.getEntityTypeValueIndex(model, entityType, entityTypeValue);

      if (_has(model, `entityTypes[${entityType}].values[${index}]`)) {
        model.entityTypes![entityType].values![index] = entityTypeValueData;
      }
    }
  }

  static getIntentIndex(model: JovoModelDataV3, intent: string): number {
    if (!model.intents) {
      return -1;
    }
    return model.intents.findIndex((el: Intent) => el === intent);
  }

  static getInputIndex(model: JovoModelDataV3, intent: string, input: string): number {
    const intentIndex: number = this.getIntentIndex(model, intent);

    if (!_has(model, `intents[${intentIndex}].inputs`)) {
      return -1;
    }

    return model.intents![intentIndex].inputs!.findIndex(
      (intentInput: IntentInput) => intentInput.name === input,
    );
  }

  static getInputTypeIndex(model: JovoModelDataV3, inputType: string): number {
    if (!model.inputTypes) {
      return -1;
    }
    return model.inputTypes.findIndex((type: InputType) => type.name === inputType);
  }

  static getInputTypeByName(model: JovoModelDataV3, inputType: string): InputType | undefined {
    if (!model.inputTypes) {
      return;
    }
    return model.inputTypes.find((type: InputType) => type.name === inputType);
  }

  static getInputTypeValueIndex(
    model: JovoModelDataV3,
    inputType: string,
    inputTypeValue: string,
  ): number {
    const inputTypeIndex: number = this.getInputTypeIndex(model, inputType);

    if (!_has(model, `inputTypes[${inputTypeIndex}].values`)) {
      return -1;
    }

    return model.inputTypes![inputTypeIndex].values!.findIndex(
      (el: InputTypeValue) => el.value === inputTypeValue,
    );
  }

  static getEntityTypeValueIndex(
    model: JovoModelData,
    entityType: string,
    entityTypeValue: string,
  ): number {
    if (_has(model, `entityTypes[${entityType}].values`)) {
      return model.entityTypes![entityType].values!.findIndex((el: ModelEntityTypeValue) => {
        return typeof el === 'string' ? el === entityTypeValue : el.value === entityTypeValue;
      });
    }
    return -1;
  }

  static addEntityTypeValueSynonym(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
    entityTypeValue: string,
    synonym: string,
    checkForDuplicates: boolean = true,
  ) {
    if (this.isJovoModelV3(model)) {
      const inputTypeIndex: number = this.getInputTypeIndex(model, entityType);
      const inputTypeValueIndex: number = this.getInputTypeValueIndex(
        model,
        entityType,
        entityTypeValue,
      );

      if (_has(model, `inputTypes[${inputTypeIndex}].values[${inputTypeValueIndex}]`)) {
        if (!model.inputTypes![inputTypeIndex].values![inputTypeValueIndex].synonyms) {
          model.inputTypes![inputTypeIndex].values![inputTypeValueIndex].synonyms = [];
        }

        if (checkForDuplicates) {
          if (
            !model.inputTypes![inputTypeIndex].values![inputTypeValueIndex].synonyms!.includes(
              synonym,
            )
          ) {
            model.inputTypes![inputTypeIndex].values![inputTypeValueIndex].synonyms!.push(synonym);
          }
        } else {
          model.inputTypes![inputTypeIndex].values![inputTypeValueIndex].synonyms!.push(synonym);
        }
      }
    } else {
      const index: number = this.getEntityTypeValueIndex(model, entityType, entityTypeValue);

      if (_has(model, `entityTypes[${entityType}].values[${index}]`)) {
        const foundEntityTypeValue: ModelEntityTypeValue = model.entityTypes![entityType].values[
          index
        ];

        if (typeof foundEntityTypeValue === 'string') {
          return;
        }

        const entityTypeValueSynonyms: string[] = foundEntityTypeValue.synonyms || [];

        if (!checkForDuplicates || entityTypeValueSynonyms.includes(synonym)) {
          entityTypeValueSynonyms.push(synonym);
        }

        foundEntityTypeValue.synonyms = entityTypeValueSynonyms;
      }
    }
  }

  static removeEntityTypeValueSynonym(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
    entityTypeValue: string,
    synonym: string,
  ) {
    if (this.isJovoModelV3(model)) {
      const inputTypeIndex: number = this.getInputTypeIndex(model, entityType);
      const inputTypeValueIndex: number = this.getInputTypeValueIndex(
        model,
        entityType,
        entityTypeValue,
      );

      if (_has(model, `inputTypes[${inputTypeIndex}].values[${inputTypeValueIndex}].synonyms`)) {
        const synonymIndex = model.inputTypes![inputTypeIndex].values![
          inputTypeValueIndex
        ].synonyms!.indexOf(synonym);
        if (synonymIndex >= 0) {
          model.inputTypes![inputTypeIndex].values![inputTypeValueIndex].synonyms!.splice(
            synonymIndex,
            1,
          );
        }
      }
    } else {
      const entityTypeValueIndex: number = this.getEntityTypeValueIndex(
        model,
        entityType,
        entityTypeValue,
      );

      if (_has(model, `entityTypes[${entityType}].values[${entityTypeValueIndex}].synonyms`)) {
        const synonyms: string[] = (model.entityTypes![entityType].values[
          entityTypeValueIndex
        ] as EntityTypeValue).synonyms!;

        const synonymIndex: number = synonyms.indexOf(synonym);

        if (synonymIndex >= 0) {
          synonyms.splice(synonymIndex, 1);
        }
      }
    }
  }

  static updateEntityTypeValueSynonym(
    model: JovoModelData | JovoModelDataV3,
    entityType: string,
    entityTypeValue: string,
    oldSynonym: string,
    newSynonym: string,
  ) {
    if (this.isJovoModelV3(model)) {
      const inputTypeIndex: number = this.getInputTypeIndex(model, entityType);
      const inputTypeValueIndex: number = this.getInputTypeValueIndex(
        model,
        entityType,
        entityTypeValue,
      );

      if (_has(model, `inputTypes[${inputTypeIndex}].values[${inputTypeValueIndex}].synonyms`)) {
        const synonymIndex = model.inputTypes![inputTypeIndex].values![
          inputTypeValueIndex
        ].synonyms!.indexOf(oldSynonym);
        if (synonymIndex >= 0) {
          const synonyms = model.inputTypes![inputTypeIndex].values![
            inputTypeValueIndex
          ].synonyms!.slice();
          synonyms[synonymIndex] = newSynonym;
          model.inputTypes![inputTypeIndex].values![inputTypeValueIndex].synonyms = synonyms;
        }
      }
    } else {
      const entityTypeValueIndex: number = this.getEntityTypeValueIndex(
        model,
        entityType,
        entityTypeValue,
      );

      if (_has(model, `entityTypes[${entityType}].values[${entityTypeValueIndex}].synonyms`)) {
        const synonyms: string[] = (model.entityTypes![entityType].values[
          entityTypeValueIndex
        ] as EntityTypeValue).synonyms!;

        const synonymIndex: number = synonyms.indexOf(oldSynonym);

        if (synonymIndex >= 0) {
          synonyms[synonymIndex] = newSynonym;
        }
      }
    }
  }
}
