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
      intents: [],
      entityTypes: [],
    };

    const lexModel: LexModelFileResource = inputData.resource;

    let jovoIntent: Intent;
    if (lexModel.intents !== undefined) {
      let tempIntentInput: IntentEntity;

      for (const lexIntent of lexModel.intents) {
        jovoIntent = {
          name: lexIntent.name,
        };

        if (lexIntent.sampleUtterances !== undefined && lexIntent.sampleUtterances.length !== 0) {
          jovoIntent.phrases = lexIntent.sampleUtterances;
        }

        if (lexIntent.slots !== undefined && lexIntent.slots.length !== 0) {
          jovoIntent.entities = [];
          for (const lexIntentSlot of lexIntent.slots) {
            tempIntentInput = {
              name: lexIntentSlot.name,
            };

            if (lexIntentSlot.slotType !== undefined) {
              if (lexIntentSlot.slotType!.startsWith('AMAZON.')) {
                tempIntentInput.type = {
                  alexa: lexIntentSlot.slotType,
                };
              } else {
                tempIntentInput.type = lexIntentSlot.slotType;
              }
            }

            jovoIntent.entities.push(tempIntentInput);
          }
        }

        jovoModel.intents!.push(jovoIntent);
      }
    }
    if (lexModel.slotTypes !== undefined) {
      let entityType: EntityType;
      let entityTypeValue: EntityTypeValue;
      for (const lexSlotType of lexModel.slotTypes) {
        entityType = {
          name: lexSlotType.name,
        };

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

        jovoModel.entityTypes!.push(entityType);
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

      for (const intent of model.intents) {
        lexIntent = {
          name: intent.name,
          version: '$LATEST',
          fulfillmentActivity: {
            type: 'ReturnIntent',
          },
        };

        if (intent.phrases !== undefined) {
          lexIntent.sampleUtterances = intent.phrases;
        }

        if (intent.entities !== undefined && intent.entities.length !== 0) {
          lexIntent.slots = [];
          for (const intentEntity of intent.entities) {
            if (typeof intentEntity.type === 'object') {
              if (intentEntity.type.alexa === undefined) {
                throw new Error(
                  `No Alexa-Type is defined for entity "${intentEntity.name}" which is used in intent "${intent.name}"!`,
                );
              } else {
                entityTypeName = intentEntity.type.alexa as string;
              }
            } else {
              entityTypeName = intentEntity.type as string;
            }

            lexIntent.slots.push({
              name: intentEntity.name,
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

      for (const entityType of model.entityTypes) {
        lexSlot = {
          name: entityType.name,
        };

        if (entityType.values) {
          lexSlot.enumerationValues = [];
          for (const entityTypeValue of entityType.values) {
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
