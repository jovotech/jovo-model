import {
  EntityType,
  EntityTypeValue,
  InputType,
  Intent,
  IntentEntity,
  IntentV3,
  JovoModel,
  JovoModelData,
  JovoModelDataV3,
  JovoModelHelper,
  NativeFileInformation,
} from '@jovotech/model';
import {
  LuisModelClosedList,
  LuisModelClosedSubList,
  LuisModelEntity,
  LuisModelFile,
  LuisModelIntent,
  LuisModelUtterances,
} from '.';

export interface EntityTypeNameUsedCounter {
  [key: string]: number;
}

export interface IntentInformation {
  entityNames: string[];
  utterances: LuisModelUtterances[];
}

export class JovoModelLuis extends JovoModel {
  static MODEL_KEY = 'luis';

  static toJovoModel(inputFiles: NativeFileInformation[]): JovoModelData {
    const inputData: LuisModelFile = inputFiles[0].content;

    const jovoModel: JovoModelData = {
      version: '4.0',
      invocation: '',
      intents: {},
      entityTypes: {},
    };

    let entityType: EntityType;
    let entityTypeValue: EntityTypeValue;
    for (const closedList of inputData.closedLists) {
      entityType = { values: [] };

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

      jovoModel.entityTypes![closedList.name] = entityType;
    }

    const tempIntents: Record<string, Intent> = {};

    const entityNamesByIntent: Record<string, string[]> = {};

    for (const utterance of inputData.utterances) {
      let phraseText = utterance.text;
      if (tempIntents[utterance.intent] === undefined) {
        tempIntents[utterance.intent] = {
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
      tempIntents[intentName].entities = {};
      for (const entityName of entityNamesByIntent[intentName]) {
        if (entityName.startsWith('builtin.')) {
          // Is a built-in luis type
          tempIntents[intentName].entities![entityName.slice(8)] = {
            type: {
              luis: entityName,
            },
          };
        } else {
          // Is a regular type
          tempIntents[intentName].entities![entityName] = {
            type: entityName,
          };
        }
      }
    }

    jovoModel.intents = tempIntents;

    return jovoModel;
  }

  static fromJovoModel(
    model: JovoModelData | JovoModelDataV3,
    locale: string,
  ): NativeFileInformation[] {
    const entityTypeNameUsedCounter: EntityTypeNameUsedCounter = {};

    const luisIntents: LuisModelIntent[] = [];
    const luisUtterances: LuisModelUtterances[] = [];
    const luisClosedLists: LuisModelClosedList[] = [];
    let intentInformation: IntentInformation;
    const entityNames: string[] = [];

    if (JovoModelHelper.hasIntents(model)) {
      const intents = JovoModelHelper.getIntents(model);
      // Get all the utterances and entities
      for (const [intentKey, intentData] of Object.entries(intents)) {
        luisIntents.push({ name: intentKey });

        intentInformation = this.getIntentInformation(
          model,
          intentKey,
          intentData,
          JovoModelHelper.getEntityTypes(model),
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
    if (JovoModelHelper.hasEntityTypes(model)) {
      const entityTypes = JovoModelHelper.getEntityTypes(model);
      for (const [entityTypeKey, entityTypeData] of Object.entries(entityTypes)) {
        if (entityTypeKey.startsWith('builtin.')) {
          // Skip the builtin types
          continue;
        }

        tempSubLists = [];

        if (entityTypeData.values === undefined) {
          // If an EntityType does not have any values defined
          // for some reason, skip it.
          continue;
        }

        for (const typeValue of entityTypeData.values) {
          if (typeof typeValue === 'string') {
            tempSubLists.push({ canonicalForm: typeValue });
          } else {
            tempSubLists.push({
              canonicalForm: typeValue.value,
              list: typeValue.synonyms,
            });
          }
        }

        luisClosedLists.push({
          name: entityTypeKey,
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
    model: JovoModelData | JovoModelDataV3,
    intent: string,
    intentData: Intent | IntentV3,
    entityTypes: Record<string, EntityType | InputType> | undefined,
    entityTypeNameUsedCounter: EntityTypeNameUsedCounter,
  ): IntentInformation {
    const returnData: IntentInformation = {
      entityNames: [],
      utterances: [],
    };

    let tempUtterance: LuisModelUtterances;

    let startIndex: number;
    let entityType: EntityType | InputType | undefined;
    let intentEntity: IntentEntity | undefined;
    let exampleValue = '';
    let entityTypeName:
      | string
      | {
          [key: string]: string;
        };

    if (intentData.phrases) {
      for (const phrase of intentData.phrases) {
        tempUtterance = {
          text: phrase,
          intent,
          entities: [],
        };

        // Get the entities of the phrase
        const phraseEntities = phrase.match(/{[^}]*}/g);

        // Add the ones which are defined as entities
        if (phraseEntities !== null) {
          for (let entityName of phraseEntities) {
            // Cut the curly braces away
            entityName = entityName.slice(1, -1);

            if (!JovoModelHelper.hasEntities(model, intent)) {
              // No entities are defined so the value is not an entity
              continue;
            }

            // Check if the value is really an entity
            intentEntity = JovoModelHelper.getEntityByName(model, intent, entityName);
            if (!intentEntity) {
              // No entity exists with that name so it is not an entity
              continue;
            }

            if (!intentEntity.type) {
              if (JovoModelHelper.isJovoModelV3(model)) {
                throw new Error(
                  `No type is defined for input "${entityName}" which is used in phrase "${phrase}"!`,
                );
              } else {
                throw new Error(
                  `No type is defined for entity "${entityName}" which is used in phrase "${phrase}"!`,
                );
              }
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

            entityType = entityTypes[entityTypeName];
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
            const entityTypeValue: string | EntityTypeValue = entityType.values[exampleEntityIndex];
            exampleValue =
              typeof entityTypeValue === 'string' ? entityTypeValue : entityTypeValue.value;

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

  static getValidator(model: JovoModelData | JovoModelDataV3): tv4.JsonSchema {
    return super.getValidator(model);
  }
}
