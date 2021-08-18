import {
  EntityType,
  EntityTypeValue,
  Intent,
  IntentEntity,
  JovoModel,
  JovoModelData,
  NativeFileInformation,
} from 'jovo-model';
import {
  JovoModelLuisData,
  LuisModelClosedList,
  LuisModelClosedSubList,
  LuisModelEntity,
  LuisModelFile,
  LuisModelIntent,
  LuisModelUtterances,
} from '.';
import * as JovoModelLuisValidator from '../validators/JovoModelLuisData.json';

export interface EntityTypeNameUsedCounter {
  [key: string]: number;
}

export interface IntentInformation {
  entityNames: string[];
  utterances: LuisModelUtterances[];
}

export class JovoModelLuis extends JovoModel {
  static MODEL_KEY = 'luis';

  static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
    const inputData: LuisModelFile = inputFiles[0].content;

    const jovoModel: JovoModelData = {
      version: 4.0,
      invocation: '',
      intents: [],
      entityTypes: [],
    };

    let entityType: EntityType;
    let entityTypeValue: EntityTypeValue;
    for (const closedList of inputData.closedLists) {
      entityType = {
        name: closedList.name,
        values: [],
      };

      if (closedList.subLists === undefined) {
        continue;
      }
      for (const subList of closedList.subLists) {
        entityTypeValue = {
          value: subList.canonicalForm,
        };

        if (subList.list !== undefined) {
          entityTypeValue.synonyms = subList.list;
        }

        entityType.values!.push(entityTypeValue);
      }

      jovoModel.entityTypes!.push(entityType);
    }

    const tempIntents: {
      [key: string]: Intent;
    } = {};

    const entityNamesByIntent: {
      [key: string]: string[];
    } = {};
    for (const utterance of inputData.utterances) {
      let phraseText = utterance.text;
      if (tempIntents[utterance.intent] === undefined) {
        tempIntents[utterance.intent] = {
          name: utterance.intent,
          phrases: [],
        };
      }

      // Make sure that the entities later in the text come first
      // that it does not mess up the position of the earlier ones.
      if (utterance.entities !== undefined && utterance.entities.length !== 0) {
        utterance.entities.sort((a, b) => (a.startPos < b.startPos ? 1 : -1));
      }

      let entityName: string;
      for (const entity of utterance.entities) {
        if (entityNamesByIntent[utterance.intent] === undefined) {
          entityNamesByIntent[utterance.intent] = [entity.entity];
        } else if (!entityNamesByIntent[utterance.intent].includes(entity.entity)) {
          entityNamesByIntent[utterance.intent].push(entity.entity);
        }

        entityName = entity.entity;
        if (entityName.startsWith('builtin.')) {
          entityName = entityName.slice(8);
        }

        phraseText =
          phraseText.slice(0, entity.startPos) +
          `{${entityName}}` +
          phraseText.slice(entity.endPos + 1);
      }

      tempIntents[utterance.intent].phrases!.push(phraseText);
    }

    // Now that we did itterate over all utterances we can add all the found intents
    for (const intentName of Object.keys(entityNamesByIntent)) {
      tempIntents[intentName].entities = [];
      for (const entityName of entityNamesByIntent[intentName]) {
        if (entityName.startsWith('builtin.')) {
          // Is a built-in luis type
          tempIntents[intentName].entities!.unshift({
            name: entityName.slice(8),
            type: {
              luis: entityName,
            },
          });
        } else {
          // Is a regular type
          tempIntents[intentName].entities!.unshift({
            name: entityName,
            type: entityName,
          });
        }
      }
    }

    jovoModel.intents = Object.values(tempIntents);

    return jovoModel;
  }

  static fromJovoModel(model: JovoModelLuisData, locale: string): NativeFileInformation[] {
    const entityTypeNameUsedCounter: EntityTypeNameUsedCounter = {};

    const luisIntents: LuisModelIntent[] = [];
    const luisUtterances: LuisModelUtterances[] = [];
    const luisClosedLists: LuisModelClosedList[] = [];
    let intentInformation: IntentInformation;
    const entityNames: string[] = [];

    if (model.intents !== undefined) {
      // Get all the utterances and entities
      for (const intent of model.intents) {
        luisIntents.push({
          name: intent.name,
        });

        intentInformation = this.getIntentInformation(
          intent,
          model.entityTypes,
          entityTypeNameUsedCounter,
        );
        luisUtterances.push.apply(luisUtterances, intentInformation.utterances);

        for (const entityName of intentInformation.entityNames) {
          if (!entityNames.includes(entityName)) {
            entityNames.push(entityName);
          }
        }
      }
    }

    // Add all the found entities
    const luisEntities: LuisModelEntity[] = [];
    for (const name of entityNames) {
      luisEntities.push({
        name,
      });
    }

    // Convert the entityTypes to closedLists
    let tempSubLists: LuisModelClosedSubList[];
    let tempSubList: LuisModelClosedSubList;
    if (model.entityTypes !== undefined) {
      for (const entityType of model.entityTypes) {
        if (entityType.name.startsWith('builtin.')) {
          // Skip the builtin types
          continue;
        }

        tempSubLists = [];

        if (entityType.values === undefined) {
          // If an EntityType does not have any values defined
          // for some reason, skip it.
          continue;
        }

        for (const typeValue of entityType.values) {
          tempSubList = {
            canonicalForm: typeValue.value,
          };

          if (typeValue.synonyms) {
            tempSubList.list = typeValue.synonyms;
          }

          tempSubLists.push(tempSubList);
        }

        luisClosedLists.push({
          name: entityType.name,
          subLists: tempSubLists,
        });
      }
    }

    const luisModel: LuisModelFile = {
      luis_schema_version: '3.2.0',
      versionId: '0.1',
      name: 'Jovo App',
      desc: '',
      culture: locale.toLowerCase(),
      tokenizerVersion: '1.0.0',
      intents: luisIntents,
      entities: luisEntities,
      composites: [],
      closedLists: luisClosedLists,
      patternAnyEntities: [],
      regex_entities: [],
      prebuiltEntities: [],
      model_features: [],
      regex_features: [],
      patterns: [],
      utterances: luisUtterances,
    };

    return [
      {
        path: [`${locale}.json`],
        content: luisModel,
      },
    ];
  }

  static getIntentInformation(
    intent: Intent,
    entityTypes: EntityType[] | undefined,
    entityTypeNameUsedCounter: EntityTypeNameUsedCounter,
  ): IntentInformation {
    const returnData: IntentInformation = {
      entityNames: [],
      utterances: [],
    };

    let tempUtterance: LuisModelUtterances;

    let startIndex: number;
    let entityType: EntityType | undefined;
    let intentEntity: IntentEntity | undefined;
    let exampleValue = '';
    let entityTypeName:
      | string
      | {
          [key: string]: string;
        };

    if (intent.phrases) {
      for (const phrase of intent.phrases) {
        tempUtterance = {
          text: phrase,
          intent: intent.name,
          entities: [],
        };

        // Get the entities of the phrase
        const phraseEntities = phrase.match(/{[^}]*}/g);

        // Add the ones which are defined as entities
        if (phraseEntities !== null) {
          for (let entityName of phraseEntities) {
            // Cut the curly braces away
            entityName = entityName.slice(1, -1);

            if (intent.entities === undefined) {
              // No entities are defined so the value is not an entity
              continue;
            }

            // Check if the value is really an entity
            intentEntity = intent.entities.find((data) => data.name === entityName);
            if (intentEntity === undefined) {
              // No entity exists with that name so it is not an entity
              continue;
            }

            if (intentEntity.type === undefined) {
              throw new Error(
                `No type is defined for entity "${entityName}" which is used in phrase "${phrase}"!`,
              );
            }

            // Get the EntityType data to get an example value to replace the placeholder with
            if (entityTypes === undefined) {
              throw new Error(
                `No EntityTypes are defined but type "${entityName}" is used in phrase "${phrase}"!`,
              );
            }

            entityTypeName = intentEntity.type;
            if (typeof intentEntity.type === 'object') {
              if (intentEntity.type.luis === undefined) {
                throw new Error(
                  `No Luis-Type is defined for entity "${entityName}" which is used in phrase "${phrase}"!`,
                );
              } else {
                entityTypeName = intentEntity.type.luis as string;
              }
            } else {
              entityTypeName = entityTypeName as string;
            }

            entityType = entityTypes.find((data) => data.name === entityTypeName);
            if (entityType === undefined) {
              throw new Error(
                `EntityType "${entityTypeName}" is not defined but is used in phrase "${phrase}"!`,
              );
            }
            if (entityType.values === undefined || entityType.values.length === 0) {
              throw new Error(`EntityType "${entityTypeName}" does not have any values!`);
            }

            // As we are going in order of appearance in the text we can be sure
            // that the start index does not change. The end index gets calculated
            // by adding the length of the value the placeholder got replaced with.
            startIndex = tempUtterance.text.indexOf(`{${entityName}}`);

            // Make sure that different example values get used becaues if not
            // entities do not seem to get extracted properly
            if (entityTypeNameUsedCounter[entityTypeName] === undefined) {
              entityTypeNameUsedCounter[entityTypeName] = 0;
            }
            const exampleEntityIndex =
              entityTypeNameUsedCounter[entityTypeName]++ % entityType.values.length;
            exampleValue = entityType.values[exampleEntityIndex].value;

            tempUtterance.entities.push({
              // value: exampleValue,
              entity: entityTypeName,
              startPos: startIndex,
              endPos: startIndex + exampleValue.length - 1, // No idea why they are always one to short in examples
            });

            if (!returnData.entityNames.includes(entityTypeName)) {
              returnData.entityNames.push(entityTypeName);
            }

            // Replace the placeholder with an example value
            tempUtterance.text = tempUtterance.text.replace(
              new RegExp(`{${entityName}}`, 'g'),
              exampleValue,
            );
          }
        }

        returnData.utterances.push(tempUtterance);
      }
    }

    return returnData;
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelLuisValidator;
  }
}
