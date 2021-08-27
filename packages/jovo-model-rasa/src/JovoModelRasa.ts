import {
  EntityType,
  EntityTypeValue,
  Intent,
  IntentEntity,
  JovoModel,
  JovoModelData,
  NativeFileInformation,
} from '@jovotech/model';
import {
  JovoModelRasaData,
  RasaCommonExample,
  RasaEntitySynonym,
  RasaLookupTable,
  RasaNluData,
} from '.';
import * as JovoModelRasaValidator from '../validators/JovoModelRasaData.json';

export interface EntityTypeNameUsedCounter {
  [key: string]: number;
}

export class JovoModelRasa extends JovoModel {
  static MODEL_KEY = 'rasa';

  static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
    const inputData = inputFiles[0].content;

    const jovoModel: JovoModelData = {
      version: '4.0',
      invocation: '',
      intents: {},
      entityTypes: {},
    };

    const intentDirectory: {
      [key: string]: Intent;
    } = {};

    const synonymDirectory: {
      [key: string]: RasaEntitySynonym;
    } = {};

    const lookupTableDirectory: {
      [key: string]: RasaLookupTable;
    } = {};

    const existingIntentEntitiesDirectory: {
      [key: string]: string[];
    } = {};

    const entityTypes: {
      [key: string]: string[];
    } = {};

    if (inputData.rasa_nlu_data !== undefined) {
      let example: RasaCommonExample;
      let phraseText: string;

      // Convert the Rasa examples to intents and EntityTypes
      for (example of inputData.rasa_nlu_data.common_examples) {
        if (example.intent === undefined) {
          // If the example does not have an intent defined
          // it can not be added and has to get skipped
          continue;
        }

        if (intentDirectory[example.intent] === undefined) {
          intentDirectory[example.intent] = { phrases: [] };
        }

        // Make sure that the entities later in the text come first
        // that it does not mess up the position of the earlier ones.
        if (example.entities !== undefined && example.entities.length !== 0) {
          example.entities.sort((a, b) => (a.start < b.start ? 1 : -1));
        }

        // Replace the example entity texts with placeholders and save all
        // the used entities
        phraseText = example.text;
        const entityNames: string[] = [];
        for (const entity of example.entities) {
          phraseText =
            phraseText.slice(0, entity.start) + `{${entity.entity}}` + phraseText.slice(entity.end);

          if (!entityNames.includes(entity.entity)) {
            entityNames.unshift(entity.entity);

            // Save all the EntityTypes which exist
            if (entityTypes[entity.entity] === undefined) {
              entityTypes[entity.entity] = [entity.value];
            } else if (!entityTypes[entity.entity].includes(entity.value)) {
              entityTypes[entity.entity].push(entity.value);
            }
          }
        }

        // Add all the entities the phrase used
        if (entityNames.length !== 0) {
          // Prepare the directory for the entities for each intent
          // which gets added in the end to the model once everything
          // got processed.
          if (intentDirectory[example.intent].entities === undefined) {
            intentDirectory[example.intent].entities = {};
          }

          // Prepare the directory for the entities for each intent
          // to not add some multiple times and to not having to look
          // through all the already added ones on the intent very time.
          if (existingIntentEntitiesDirectory[example.intent] === undefined) {
            existingIntentEntitiesDirectory[example.intent] = [];
          }

          for (const entityName of entityNames) {
            if (existingIntentEntitiesDirectory[example.intent].includes(entityName)) {
              continue;
            }

            existingIntentEntitiesDirectory[example.intent].push(entityName);

            intentDirectory[example.intent].entities![entityName] = { type: entityName };
          }
        }

        intentDirectory[example.intent].phrases!.push(phraseText);
      }

      // Save the synonyms by name that they are easily accessible
      // when they are needed to create the entityTypes
      for (const synonym of inputData.rasa_nlu_data.entity_synonyms) {
        synonymDirectory[synonym.value] = synonym;
      }

      // Save the lookupTable by name that we can add all its values
      // to the entityType
      for (const lookupTable of inputData.rasa_nlu_data.lookup_tables) {
        lookupTableDirectory[lookupTable.name] = lookupTable;
      }

      let entityType: EntityType;
      let values: string[];
      for (const entityTypeName of Object.keys(entityTypes)) {
        values = entityTypes[entityTypeName];

        if (lookupTableDirectory[entityTypeName] !== undefined) {
          if (Array.isArray(lookupTableDirectory[entityTypeName].elements)) {
            // Is an array of values
            for (const value of lookupTableDirectory[entityTypeName].elements) {
              if (!values.includes(value)) {
                values.push(value);
              }
            }
          } else {
            // Is a file reference
            // TODO: Add support
            throw new Error('File references in lookup_tables are not supported yet!');
          }
        }

        entityType = {
          values: values.map((value) => {
            // Add all the entityType values with the synonyms
            // which got found
            const returnData: EntityTypeValue = {
              value,
            };

            if (
              synonymDirectory[value] !== undefined &&
              synonymDirectory[value].synonyms !== undefined
            ) {
              returnData.synonyms = synonymDirectory[value].synonyms;
            }

            return returnData;
          }),
        };

        jovoModel.entityTypes![entityTypeName] = entityType;
      }
    }

    jovoModel.intents = intentDirectory;

    return jovoModel;
  }

  static fromJovoModel(model: JovoModelRasaData, locale: string): NativeFileInformation[] {
    const returnData: RasaNluData = {
      common_examples: [],
      entity_synonyms: [],
      lookup_tables: [],
    };

    const entityTypeNameUsedCounter: EntityTypeNameUsedCounter = {};

    let rasaExample: RasaCommonExample | undefined;
    if (model.intents !== undefined) {
      for (const [intentKey, intentData] of Object.entries(model.intents)) {
        if (intentData.phrases) {
          for (const phrase of intentData.phrases) {
            rasaExample = this.getRasaExampleFromPhrase(
              phrase,
              intentKey,
              intentData,
              model.entityTypes,
              entityTypeNameUsedCounter,
            );
            returnData.common_examples.push(rasaExample);
          }
        }
      }
    }

    let saveAsLookupTable: boolean;
    let rasaSynonym: RasaEntitySynonym;
    if (model.entityTypes !== undefined) {
      for (const [entityTypeKey, entityTypeData] of Object.entries(model.entityTypes)) {
        saveAsLookupTable = true;

        if (entityTypeData.values === undefined) {
          // If an EntityType does not have any values defined
          // for some reason skip it.
          continue;
        }

        // Check it it should be saved under synonyms or lookupTable

        for (const typeValue of entityTypeData.values) {
          if (Object.keys(typeValue).length !== 1 || typeValue.value === undefined) {
            // It can only be saved as lookupTable if it does not
            // have any other properties than "value"
            saveAsLookupTable = false;
            break;
          }
        }

        if (saveAsLookupTable === true) {
          // Save a lookupTable
          returnData.lookup_tables!.push({
            name: entityTypeKey,
            // TODO: remove the !
            elements: entityTypeData.values.map((data) => data.value),
          });
        } else {
          // Save as synonyms
          for (const typeValue of entityTypeData.values) {
            rasaSynonym = {
              value: typeValue.value,
              synonyms: [],
            };

            if (typeValue.synonyms !== undefined) {
              rasaSynonym.synonyms = typeValue.synonyms;
            }

            returnData.entity_synonyms!.push(rasaSynonym);
          }
        }
      }
    }

    return [
      {
        path: [`${locale}.json`],
        content: {
          rasa_nlu_data: returnData,
        },
      },
    ];
  }

  static getRasaExampleFromPhrase(
    phrase: string,
    intent: string,
    intentData: Intent,
    entityTypes: Record<string, EntityType> | undefined,
    entityTypeNameUsedCounter: EntityTypeNameUsedCounter,
  ): RasaCommonExample {
    const returnData: RasaCommonExample = {
      text: phrase,
      intent,
      entities: [],
    };

    let startIndex: number;
    let entityType: EntityType | undefined;
    let intentEntity: IntentEntity | undefined;
    let exampleValue = '';
    let entityTypeName:
      | string
      | {
          [key: string]: string;
        };

    // Get the entities of the phrase
    const phraseEntities = phrase.match(/{[^}]*}/g);

    // Add the ones which are defined as entities as rasa Example
    if (phraseEntities !== null) {
      for (let entityName of phraseEntities) {
        // Cut the curly braces away
        entityName = entityName.slice(1, -1);

        if (intentData.entities === undefined) {
          // No entities are defined so the value is not an entity
          continue;
        }

        // Check if the value is really an entity
        intentEntity = intentData.entities[entityName];
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
          if (intentEntity.type.rasa === undefined) {
            throw new Error(
              `No Rasa-Type is defined for entity "${entityName}" which is used in phrase "${phrase}"!`,
            );
          } else {
            entityTypeName = intentEntity.type.rasa as string;
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
        startIndex = returnData.text.indexOf(`{${entityName}}`);

        // Make sure that different example values get used becaues if not
        // entities do not seem to get extracted properly
        if (entityTypeNameUsedCounter[entityTypeName] === undefined) {
          entityTypeNameUsedCounter[entityTypeName] = 0;
        }
        const exampleEntityIndex =
          entityTypeNameUsedCounter[entityTypeName]++ % entityType.values.length;
        exampleValue = entityType.values[exampleEntityIndex].value;

        returnData.entities.push({
          value: exampleValue,
          entity: entityTypeName,
          start: startIndex,
          end: startIndex + exampleValue.length,
        });

        // Replace the placeholder with an example value
        returnData.text = returnData.text.replace(new RegExp(`{${entityName}}`, 'g'), exampleValue);
      }
    }

    return returnData;
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelRasaValidator;
  }
}
