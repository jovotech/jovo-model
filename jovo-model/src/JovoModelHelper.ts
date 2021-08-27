import _has = require('lodash.has');
import { EntityType, EntityTypeValue, Intent, IntentEntity, JovoModelData } from './Interfaces';

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

  static prepareModel(model: JovoModelData): JovoModelData {
    // remove observers
    if (model.entityTypes && model.entityTypes.length > 0) {
      for (const entityType of Object.values(model.entityTypes)) {
        if (entityType.values && entityType.values.length > 0) {
          entityType.values.forEach((value: EntityTypeValue) => {
            if (!value.id) {
              value.id = '';
            }
            if (!value.synonyms) {
              value.synonyms = [];
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
    return model;
  }

  static addIntent(
    model: JovoModelData,
    intent: string,
    intentData: Intent = { phrases: [], entities: {}, samples: [] },
  ) {
    if (!this.getIntentByName(model, intent)) {
      if (!model.intents) {
        model.intents = {};
      }

      model.intents[intent] = intentData;
    }
  }

  static removeIntent(model: JovoModelData, intent: string) {
    if (model.intents) {
      delete model.intents[intent];
    }
  }

  static updateIntent(model: JovoModelData, intent: string, intentData: Intent) {
    if (model.intents) {
      model.intents[intent] = intentData;
    }
  }

  static getIntentByName(model: JovoModelData, intent: string): Intent | undefined {
    if (!model.intents) {
      return;
    }

    return model.intents[intent];
  }

  static getPhrases(model: JovoModelData, intent: string): string[] {
    const foundIntent: Intent | undefined = this.getIntentByName(model, intent);
    return foundIntent?.phrases || [];
  }

  static addPhrase(model: JovoModelData, intent: string, phrase: string) {
    const foundIntent: Intent | undefined = this.getIntentByName(model, intent);
    if (foundIntent) {
      if (!foundIntent.phrases) {
        foundIntent.phrases = [];
      }
      if (!foundIntent.phrases.includes(phrase)) {
        foundIntent.phrases.push(phrase);
      }
    }
  }

  static removePhrase(model: JovoModelData, intent: string, phrase: string) {
    const index: number = this.getPhraseIndex(model, intent, phrase);
    if (_has(model, `intents[${intent}].phrases[${index}]`)) {
      model.intents![intent].phrases!.splice(index, 1);
    }
  }

  static updatePhrase(model: JovoModelData, intent: string, oldPhrase: string, newPhrase: string) {
    const index: number = this.getPhraseIndex(model, intent, oldPhrase);
    if (_has(model, `intents[${intent}].phrases[${index}]`)) {
      model.intents![intent].phrases![index] = newPhrase;
    }
  }

  static getPhraseIndex(model: JovoModelData, intent: string, phrase: string): number {
    if (_has(model, `intents[${intent}].phrases`)) {
      return model.intents![intent].phrases!.indexOf(phrase);
    }
    return -1;
  }

  static hasPhrase(model: JovoModelData, phrase: string): boolean {
    if (!model.intents) {
      return false;
    }
    return Object.values(model.intents).some((intent: Intent) => {
      return (intent.phrases || []).includes(phrase);
    });
  }

  static getEntities(model: JovoModelData, intent: string): Record<string, IntentEntity> {
    const foundIntent: Intent | undefined = this.getIntentByName(model, intent);
    return foundIntent?.entities || {};
  }

  static addEntity(
    model: JovoModelData,
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

  static removeEntity(model: JovoModelData, intent: string, entity: string) {
    if (_has(model, `intents[${intent}].entities[${entity}]`)) {
      delete model.intents![intent].entities![entity];
    }
  }

  static updateEntity(
    model: JovoModelData,
    intent: string,
    entity: string,
    entityData: IntentEntity,
  ) {
    if (_has(model, `intents[${intent}].entities[${entity}]`)) {
      model.intents![intent].entities![entity] = entityData;
    }
  }

  static addEntityType(
    model: JovoModelData,
    entityType: string,
    entityTypeData: EntityType = { values: [] },
  ) {
    if (!model.entityTypes) {
      model.entityTypes = {};
    }

    if (!this.getEntityTypeByName(model, entityType)) {
      model.entityTypes[entityType] = entityTypeData;
    }
  }

  static removeEntityType(model: JovoModelData, entityType: string) {
    if (model.entityTypes) {
      delete model.entityTypes[entityType];
    }
  }

  static updateEntityType(model: JovoModelData, entityType: string, entityTypeData: EntityType) {
    if (model.entityTypes) {
      model.entityTypes[entityType] = entityTypeData;
    }
  }

  static getEntityTypeByName(model: JovoModelData, entityType: string): EntityType | undefined {
    if (!model.entityTypes) {
      return;
    }
    return model.entityTypes[entityType];
  }

  static getEntityTypeValues(model: JovoModelData, entityType: string): EntityTypeValue[] {
    const foundEntityType: EntityType | undefined = this.getEntityTypeByName(model, entityType);
    return foundEntityType?.values || [];
  }

  static addEntityTypeValue(
    model: JovoModelData,
    entityType: string,
    entityTypeValue: ModelEntityTypeValue,
    checkForDuplicates: boolean = true,
  ) {
    const foundEntityType: EntityType | undefined = this.getEntityTypeByName(model, entityType);

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
        (el: EntityTypeValue) => el.value === (entityTypeValue as EntityTypeValue).value,
      )
    ) {
      foundEntityType.values.push(entityTypeValue);
    }
  }

  static removeEntityTypeValue(model: JovoModelData, entityType: string, entityTypeValue: string) {
    const index: number = this.getEntityTypeValueIndex(model, entityType, entityTypeValue);

    if (_has(model, `entityTypes[${entityType}].values[${index}]`)) {
      model.entityTypes![entityType].values!.splice(index, 1);
    }
  }

  static updateEntityTypeValue(
    model: JovoModelData,
    entityType: string,
    entityTypeValue: string,
    entityTypeValueData: EntityTypeValue,
  ) {
    const index: number = this.getEntityTypeValueIndex(model, entityType, entityTypeValue);

    if (_has(model, `entityTypes[${entityType}].values[${index}]`)) {
      model.entityTypes![entityType].values![index] = entityTypeValueData;
    }
  }

  static getEntityTypeValueIndex(model: JovoModelData, entityType: string, entityTypeValue: string): number {
    if (_has(model, `entityTypes[${entityType}].values`)) {
      return model.entityTypes![entityType].values!.findIndex(
        (el: EntityTypeValue) => el.value === entityTypeValue,
      );
    }
    return -1;
  }

  static addEntityTypeValueSynonym(
    model: JovoModelData,
    entityType: string,
    entityTypeValue: string,
    synonym: string,
    checkForDuplicates: boolean = true,
  ) {
    const index: number = this.getEntityTypeValueIndex(model, entityType, entityTypeValue);

    if (_has(model, `entityTypes[${entityType}].values[${index}]`)) {
      const entityTypeValueSynonyms: string[] =
        model.entityTypes![entityType].values![index].synonyms || [];

      if (!checkForDuplicates || entityTypeValueSynonyms.includes(synonym)) {
        entityTypeValueSynonyms.push(synonym);
      }

      model.entityTypes![entityType].values![index].synonyms = entityTypeValueSynonyms;
    }
  }

  static removeEntityTypeValueSynonym(
    model: JovoModelData,
    entityType: string,
    entityTypeValue: string,
    synonym: string,
  ) {
    const entityTypeValueIndex: number = this.getEntityTypeValueIndex(model, entityType, entityTypeValue);

    if (_has(model, `entityTypes[${entityType}].values[${entityTypeValueIndex}].synonyms`)) {
      const synonymIndex: number = model.entityTypes![entityType].values![
        entityTypeValueIndex
      ].synonyms!.indexOf(synonym);

      if (synonymIndex >= 0) {
        model.entityTypes![entityType].values![entityTypeValueIndex].synonyms!.splice(
          synonymIndex,
          1,
        );
      }
    }
  }

  static updateEntityTypeValueSynonym(
    model: JovoModelData,
    entityType: string,
    entityTypeValue: string,
    oldSynonym: string,
    newSynonym: string,
  ) {
    const entityTypeValueIndex: number = this.getEntityTypeValueIndex(
      model,
      entityType,
      entityTypeValue,
    );

    if (_has(model, `entityTypes[${entityType}].values[${entityTypeValueIndex}].synonyms`)) {
      const synonymIndex: number = model.entityTypes![entityType].values![
        entityTypeValueIndex
      ].synonyms!.indexOf(oldSynonym);

      if (synonymIndex >= 0) {
        model.entityTypes![entityType].values![entityTypeValueIndex].synonyms![
          synonymIndex
        ] = newSynonym;
      }
    }
  }
}
