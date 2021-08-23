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
  JovoModelLexData,
  LexModelEnumerationValue,
  LexModelFile,
  LexModelFileResource,
  LexModelIntentResource,
  LexModelSlotTypeResource,
} from '.';
import * as JovoModelLexValidator from '../validators/JovoModelLexData.json';

export class JovoModelLex extends JovoModel {
  static MODEL_KEY = 'lex';

  static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
    const inputData: LexModelFile = inputFiles[0].content;

    const jovoModel: JovoModelData = {
      version: '4.0',
      invocation: '',
      intents: {},
      entityTypes: {},
    };

    const lexModel: LexModelFileResource = inputData.resource;

    let jovoIntent: Intent;
    if (lexModel.intents !== undefined) {
      let tempIntentEntity: IntentEntity;

      for (const lexIntent of lexModel.intents) {
        jovoIntent = {};

        if (lexIntent.sampleUtterances !== undefined && lexIntent.sampleUtterances.length !== 0) {
          jovoIntent.phrases = lexIntent.sampleUtterances;
        }

        if (lexIntent.slots !== undefined && lexIntent.slots.length !== 0) {
          jovoIntent.entities = {};
          for (const lexIntentSlot of lexIntent.slots) {
            tempIntentEntity = {};

            if (lexIntentSlot.slotType !== undefined) {
              if (lexIntentSlot.slotType!.startsWith('AMAZON.')) {
                tempIntentEntity.type = {
                  alexa: lexIntentSlot.slotType,
                };
              } else {
                tempIntentEntity.type = lexIntentSlot.slotType;
              }
            }

            jovoIntent.entities[lexIntentSlot.name] = tempIntentEntity;
          }
        }

        jovoModel.intents![lexIntent.name] = jovoIntent;
      }
    }
    if (lexModel.slotTypes !== undefined) {
      let entityType: EntityType;
      let entityTypeValue: EntityTypeValue;
      for (const lexSlotType of lexModel.slotTypes) {
        entityType = {};

        if (
          lexSlotType.enumerationValues !== undefined &&
          lexSlotType.enumerationValues.length !== 0
        ) {
          entityType.values = [];
          for (const enumerationValue of lexSlotType.enumerationValues) {
            entityTypeValue = {
              value: enumerationValue.value,
            };

            if (enumerationValue.synonyms !== undefined && enumerationValue.synonyms.length !== 0) {
              entityTypeValue.synonyms = enumerationValue.synonyms;
            }

            entityType.values.push(entityTypeValue);
          }
        }

        jovoModel.entityTypes![lexSlotType.name] = entityType;
      }
    }

    return jovoModel;
  }

  static fromJovoModel(model: JovoModelLexData, locale: string): NativeFileInformation[] {
    const lexModel: LexModelFileResource = {
      name: 'JovoApp',
      locale,
      intents: [],
      slotTypes: [],
      childDirected: false,
    };

    if (model.intents !== undefined && model.intents.length !== 0) {
      let lexIntent: LexModelIntentResource;
      let entityTypeName: string;

      for (const [intentKey, intentData] of Object.entries(model.intents)) {
        lexIntent = {
          name: intentKey,
          version: '$LATEST',
          fulfillmentActivity: {
            type: 'ReturnIntent',
          },
        };

        if (intentData.phrases !== undefined) {
          lexIntent.sampleUtterances = intentData.phrases;
        }

        if (intentData.entities !== undefined && intentData.entities.length !== 0) {
          lexIntent.slots = [];
          for (const [intentEntityKey, intentEntityData] of Object.entries(intentData.entities)) {
            if (typeof intentEntityData.type === 'object') {
              if (intentEntityData.type.alexa === undefined) {
                throw new Error(
                  `No Alexa-Type is defined for entity "${intentEntityKey}" which is used in intent "${intentEntityKey}"!`,
                );
              } else {
                entityTypeName = intentEntityData.type.alexa as string;
              }
            } else {
              entityTypeName = intentEntityData.type as string;
            }

            lexIntent.slots.push({
              name: intentEntityKey,
              slotType: entityTypeName,
              slotConstraint: 'Required',
            });
          }
        }

        lexModel.intents!.push(lexIntent);
      }
    }

    if (model.entityTypes !== undefined && model.entityTypes.length !== 0) {
      let lexSlot: LexModelSlotTypeResource;
      let lexEnumerationValue: LexModelEnumerationValue;

      for (const [entityTypeKey, entityTypeData] of Object.entries(model.entityTypes)) {
        lexSlot = { name: entityTypeKey };

        if (entityTypeData.values) {
          lexSlot.enumerationValues = [];
          for (const entityTypeValue of entityTypeData.values) {
            lexEnumerationValue = {
              value: entityTypeValue.value,
            };

            if (entityTypeValue.synonyms !== undefined && entityTypeValue.synonyms.length) {
              lexEnumerationValue.synonyms = entityTypeValue.synonyms;
            }
            lexSlot.enumerationValues.push(lexEnumerationValue);
          }
        }

        lexModel.slotTypes!.push(lexSlot);
      }
    }

    return [
      {
        path: [`${locale}.json`],
        content: {
          metadata: {
            schemaVersion: '1.0',
            importType: 'LEX',
            importFormat: 'JSON',
          },
          resource: lexModel,
        },
      },
    ];
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelLexValidator;
  }
}
