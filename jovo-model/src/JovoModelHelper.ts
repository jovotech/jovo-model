import has = require('lodash.has');
import { EntityType, EntityTypeValue, Intent, IntentEntity, JovoModelData } from './Interfaces';

export type ModelIntent = Intent | string;
export type ModelIntentEntity = IntentEntity | string;

export type ModelEntityType = EntityType | string;
export type ModelEntityTypeValue = EntityTypeValue | string;

export interface IntentIndex {
  index: number;
  intentIndex: number;
}

export interface EntityTypeIndex {
  index: number;
  entityTypeIndex: number;
}

/**
 * Helper class that provides methods to mutate the model.
 * All methods directly mutate the model!
 */
export class JovoModelHelper {
  static new(
    invocation = 'app',
    intents: Intent[] = [],
    entityTypes: EntityType[] = [],
  ): JovoModelData {
    return {
      version: 4.0,
      invocation,
      intents,
      entityTypes,
    };
  }

  static prepareModel(model: JovoModelData): JovoModelData {
    // remove observers
    if (model.entityTypes && model.entityTypes.length > 0) {
      model.entityTypes.forEach((entityType: EntityType) => {
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
      });
    } else {
      model.entityTypes = [];
    }

    if (model.intents && model.intents.length > 0) {
      model.intents.forEach((intent: Intent) => {
        if (!intent.phrases) {
          intent.phrases = [];
        }
        if (!intent.samples) {
          intent.samples = [];
        }
        if (!intent.entities) {
          intent.entities = [];
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
        entities: [],
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

  static getEntities(model: JovoModelData, intent: ModelIntent): IntentEntity[] {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }

    const foundIntent = this.getIntentByName(model, intent);
    return foundIntent && foundIntent.entities ? foundIntent.entities : [];
  }

  static addEntity(
    model: JovoModelData,
    intent: ModelIntent,
    entity: ModelIntentEntity,
    checkForDuplicates = true,
  ) {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }
    const foundIntent = this.getIntentByName(model, intent);
    if (foundIntent) {
      if (!foundIntent.entities) {
        foundIntent.entities = [];
      }

      if (typeof entity === 'string') {
        entity = {
          type: '',
          text: '',
          name: entity,
        };
      }

      if (checkForDuplicates) {
        // check if there is no entity with the name of 'entity'; if true => add
        if (
          !foundIntent.entities.some((intentEntity: IntentEntity) => {
            return intentEntity.name === (entity as IntentEntity).name;
          })
        ) {
          foundIntent.entities.push(entity);
        }
      } else {
        foundIntent.entities.push(entity);
      }
    }
  }

  static removeEntity(model: JovoModelData, intent: ModelIntent, entity: ModelIntentEntity) {
    const indexes = this.getEntityIndex(model, intent, entity);

    if (has(model, `intents[${indexes.intentIndex}].entities[${indexes.index}]`)) {
      model.intents![indexes.intentIndex].entities!.splice(indexes.index, 1);
    }
  }

  static updateEntity(
    model: JovoModelData,
    intent: ModelIntent,
    oldEntity: ModelIntentEntity,
    newEntity: IntentEntity,
  ) {
    const indexes = this.getEntityIndex(model, intent, oldEntity);

    if (has(model, `intents[${indexes.intentIndex}].entities[${indexes.index}]`)) {
      const entities = model.intents![indexes.intentIndex].entities!.slice();
      entities[indexes.index] = newEntity;
      model.intents![indexes.intentIndex].entities = entities;
    }
  }

  static getEntityIndex(
    model: JovoModelData,
    intent: ModelIntent,
    entity: ModelIntentEntity,
  ): IntentIndex {
    if (typeof intent !== 'string') {
      intent = intent.name;
    }

    const intentIndex = this.getIntentIndexByName(model, intent);
    if (has(model, `intents[${intentIndex}].entities`)) {
      if (typeof entity !== 'string') {
        entity = entity.name;
      }

      const index = model.intents![intentIndex].entities!.findIndex((intentEntity: IntentEntity) => {
        return intentEntity.name === entity;
      });
      return {
        intentIndex,
        index,
      };
    }
    return { intentIndex, index: -1 };
  }

  static addEntityType(model: JovoModelData, entityType: ModelEntityType) {
    if (typeof entityType === 'string') {
      entityType = {
        name: entityType,
        values: [],
      };
    }

    if (!model.entityTypes) {
      model.entityTypes = [];
    }

    if (!this.getEntityTypeByName(model, entityType.name)) {
      model.entityTypes.push(entityType);
    }
  }

  static removeEntityType(model: JovoModelData, entityType: ModelEntityType) {
    if (typeof entityType !== 'string') {
      entityType = entityType.name;
    }

    const index = this.getEntityTypeIndexByName(model, entityType);
    if (index >= 0 && model.entityTypes) {
      model.entityTypes.splice(index, 1);
    }
  }

  static updateEntityType(
    model: JovoModelData,
    entityType: ModelEntityType,
    newEntityType: EntityType,
  ) {
    if (typeof entityType !== 'string') {
      entityType = entityType.name;
    }

    const index = this.getEntityTypeIndexByName(model, entityType);
    if (index >= 0 && model.entityTypes) {
      const entityTypes = model.entityTypes.slice();
      entityTypes[index] = newEntityType;
      model.entityTypes = entityTypes;
    }
  }

  static getEntityTypeByName(model: JovoModelData, name: string): EntityType | undefined {
    if (!model.entityTypes) {
      return;
    }
    return model.entityTypes.find((type: EntityType) => {
      return type.name === name;
    });
  }

  static getEntityTypeIndexByName(model: JovoModelData, name: string): number {
    if (!model.entityTypes) {
      return -1;
    }
    return model.entityTypes.findIndex((type: EntityType) => {
      return type.name === name;
    });
  }

  static getEntityTypeValues(model: JovoModelData, entityType: ModelEntityType): EntityTypeValue[] {
    if (typeof entityType !== 'string') {
      entityType = entityType.name;
    }

    const foundEntityType = this.getEntityTypeByName(model, entityType);
    return foundEntityType && foundEntityType.values ? foundEntityType.values : [];
  }

  static addEntityTypeValue(
    model: JovoModelData,
    entityType: ModelEntityType,
    value: ModelEntityTypeValue,
    checkForDuplicates = true,
  ) {
    if (typeof entityType !== 'string') {
      entityType = entityType.name;
    }

    const foundEntityType = this.getEntityTypeByName(model, entityType);
    if (foundEntityType) {
      if (!foundEntityType.values) {
        foundEntityType.values = [];
      }

      if (typeof value === 'string') {
        value = {
          value,
          synonyms: [],
          id: '',
        };
      }

      if (checkForDuplicates) {
        // check if there is no entity with the name of 'entity'; if true => add
        if (
          !foundEntityType.values.some((entityTypeValue: EntityTypeValue) => {
            return entityTypeValue.value === (value as EntityTypeValue).value;
          })
        ) {
          foundEntityType.values.push(value);
        }
      } else {
        foundEntityType.values.push(value);
      }
    }
  }

  static removeEntityTypeValue(
    model: JovoModelData,
    entityType: ModelEntityType,
    value: ModelEntityTypeValue,
  ) {
    const indexes = this.getEntityTypeValueIndex(model, entityType, value);

    if (has(model, `entityTypes[${indexes.entityTypeIndex}].values[${indexes.index}]`)) {
      model.entityTypes![indexes.entityTypeIndex].values!.splice(indexes.index, 1);
    }
  }

  static updateEntityTypeValue(
    model: JovoModelData,
    entityType: ModelEntityType,
    value: ModelEntityTypeValue,
    newValue: EntityTypeValue,
  ) {
    const indexes = this.getEntityTypeValueIndex(model, entityType, value);

    if (has(model, `entityTypes[${indexes.entityTypeIndex}].values[${indexes.index}]`)) {
      const values = model.entityTypes![indexes.entityTypeIndex].values!.slice();
      values[indexes.index] = newValue;
      model.entityTypes![indexes.entityTypeIndex].values = values;
    }
  }

  static getEntityTypeValueIndex(
    model: JovoModelData,
    entityType: ModelEntityType,
    value: ModelEntityTypeValue,
  ): EntityTypeIndex {
    if (typeof entityType !== 'string') {
      entityType = entityType.name;
    }

    const entityTypeIndex = this.getEntityTypeIndexByName(model, entityType);
    if (has(model, `entityTypes[${entityTypeIndex}].values`)) {
      if (typeof value !== 'string') {
        value = value.value;
      }
      const index = model.entityTypes![entityTypeIndex].values!.findIndex(
        (entityTypeValue: EntityTypeValue) => {
          return entityTypeValue.value === value;
        },
      );
      return {
        entityTypeIndex,
        index,
      };
    }
    return { entityTypeIndex, index: -1 };
  }

  static addEntityTypeValueSynonym(
    model: JovoModelData,
    entityType: ModelEntityType,
    value: ModelEntityTypeValue,
    synonym: string,
    checkForDuplicates = true,
  ) {
    if (typeof entityType !== 'string') {
      entityType = entityType.name;
    }

    const indexes = this.getEntityTypeValueIndex(model, entityType, value);
    if (has(model, `entityTypes[${indexes.entityTypeIndex}].values[${indexes.index}]`)) {
      if (!model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms) {
        model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms = [];
      }

      if (checkForDuplicates) {
        if (
          !model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms!.includes(
            synonym,
          )
        ) {
          model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms!.push(
            synonym,
          );
        }
      } else {
        model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms!.push(synonym);
      }
    }
  }

  static removeEntityTypeValueSynonym(
    model: JovoModelData,
    entityType: ModelEntityType,
    value: ModelEntityTypeValue,
    synonym: string,
  ) {
    if (typeof entityType !== 'string') {
      entityType = entityType.name;
    }

    const indexes = this.getEntityTypeValueIndex(model, entityType, value);
    if (has(model, `entityTypes[${indexes.entityTypeIndex}].values[${indexes.index}].synonyms`)) {
      const synonymIndex =
        model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms!.indexOf(
          synonym,
        );
      if (synonymIndex >= 0) {
        model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms!.splice(
          synonymIndex,
          1,
        );
      }
    }
  }

  static updateEntityTypeValueSynonym(
    model: JovoModelData,
    entityType: ModelEntityType,
    value: ModelEntityTypeValue,
    synonym: string,
    newSynonym: string,
  ) {
    if (typeof entityType !== 'string') {
      entityType = entityType.name;
    }

    const indexes = this.getEntityTypeValueIndex(model, entityType, value);
    if (has(model, `entityTypes[${indexes.entityTypeIndex}].values[${indexes.index}].synonyms`)) {
      const synonymIndex =
        model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms!.indexOf(
          synonym,
        );
      if (synonymIndex >= 0) {
        const synonyms =
          model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms!.slice();
        synonyms[synonymIndex] = newSynonym;
        model.entityTypes![indexes.entityTypeIndex].values![indexes.index].synonyms = synonyms;
      }
    }
  }
}
