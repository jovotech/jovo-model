import {
  JovoModelLexData,
  LexModelEnumerationValue,
  LexModelIntentResource,
  LexModelSlotTypeResource,
  LexModelFileResource,
  LexModelFile,
} from '.';

import {
  InputType,
  Intent,
  IntentInput,
  InputTypeValue,
  JovoModel,
  JovoModelData,
  NativeFileInformation,
} from 'jovo-model';

import * as JovoModelLexValidator from '../validators/JovoModelLexData.json';

export class JovoModelLex extends JovoModel {
  static MODEL_KEY = 'lex';

  static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
    const inputData: LexModelFile = inputFiles[0].content;

    const jovoModel: JovoModelData = {
      invocation: '',
      intents: [],
      inputTypes: [],
    };

    const lexModel: LexModelFileResource = inputData.resource;

    let tempJovoIntent: Intent;
    if (lexModel.intents !== undefined) {
      let tempIntentInput: IntentInput;

      for (const lexIntent of lexModel.intents) {
        tempJovoIntent = {
          name: lexIntent.name,
        };

        if (lexIntent.sampleUtterances !== undefined && lexIntent.sampleUtterances.length !== 0) {
          tempJovoIntent.phrases = lexIntent.sampleUtterances;
        }

        if (lexIntent.slots !== undefined && lexIntent.slots.length !== 0) {
          tempJovoIntent.inputs = [];
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

            tempJovoIntent.inputs.push(tempIntentInput);
          }
        }

        jovoModel.intents!.push(tempJovoIntent);
      }
    }
    if (lexModel.slotTypes !== undefined) {
      let tempInputType: InputType;
      let tempInputTypeValue: InputTypeValue;
      for (const lexSlotType of lexModel.slotTypes) {
        tempInputType = {
          name: lexSlotType.name,
        };

        if (
          lexSlotType.enumerationValues !== undefined &&
          lexSlotType.enumerationValues.length !== 0
        ) {
          tempInputType.values = [];
          for (const enumerationValue of lexSlotType.enumerationValues) {
            tempInputTypeValue = {
              value: enumerationValue.value,
            };

            if (enumerationValue.synonyms !== undefined && enumerationValue.synonyms.length !== 0) {
              tempInputTypeValue.synonyms = enumerationValue.synonyms;
            }

            tempInputType.values.push(tempInputTypeValue);
          }
        }

        jovoModel.inputTypes!.push(tempInputType);
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
      let tempIntent: LexModelIntentResource;
      let inputTypeName: string;

      for (const intent of model.intents) {
        tempIntent = {
          name: intent.name,
          version: '$LATEST',
          fulfillmentActivity: {
            type: 'ReturnIntent',
          },
        };

        if (intent.phrases !== undefined) {
          tempIntent.sampleUtterances = intent.phrases;
        }

        if (intent.inputs !== undefined && intent.inputs.length !== 0) {
          tempIntent.slots = [];
          for (const intentInput of intent.inputs) {
            if (typeof intentInput.type === 'object') {
              if (intentInput.type.alexa === undefined) {
                throw new Error(
                  `No Alexa-Type is defined for input "${intentInput.name}" which is used in intent "${intent.name}"!`,
                );
              } else {
                inputTypeName = intentInput.type.alexa as string;
              }
            } else {
              inputTypeName = intentInput.type as string;
            }

            tempIntent.slots.push({
              name: intentInput.name,
              slotType: inputTypeName,
              slotConstraint: 'Required',
            });
          }
        }

        lexModel.intents!.push(tempIntent);
      }
    }

    if (model.inputTypes !== undefined && model.inputTypes.length !== 0) {
      let tempSlot: LexModelSlotTypeResource;
      let tempEnumerationValue: LexModelEnumerationValue;

      for (const inputType of model.inputTypes) {
        tempSlot = {
          name: inputType.name,
        };

        if (inputType.values) {
          tempSlot.enumerationValues = [];
          for (const inputTypeValue of inputType.values) {
            tempEnumerationValue = {
              value: inputTypeValue.value,
            };

            if (inputTypeValue.synonyms !== undefined && inputTypeValue.synonyms.length) {
              tempEnumerationValue.synonyms = inputTypeValue.synonyms;
            }
            tempSlot.enumerationValues.push(tempEnumerationValue);
          }
        }

        lexModel.slotTypes!.push(tempSlot);
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
