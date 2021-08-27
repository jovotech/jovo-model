import {
  EntityType,
  EntityTypeValue,
  Intent,
  JovoModel,
  JovoModelData,
  NativeFileInformation,
} from '@jovotech/model';
import _assign from 'lodash.assign';
import _get from 'lodash.get';
import _merge from 'lodash.merge';
import _set from 'lodash.set';
import _startsWith from 'lodash.startswith';
import {
  AlexaLMInputObject,
  AlexaLMIntent,
  AlexaLMTypeObject,
  AlexaLMTypeValue,
  AlexaModel,
  EntityTypeAlexa,
  IntentEntityAlexa,
  JovoModelAlexaData,
} from '.';
import * as JovoModelAlexaValidator from '../validators/JovoModelAlexaData.json';
import { IntentAlexa } from './Interfaces';

const BUILTIN_PREFIX = 'AMAZON.';

export class JovoModelAlexa extends JovoModel {
  static MODEL_KEY = 'alexa';

  static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelAlexaData {
    const inputData = inputFiles[0].content;

    const jovoModel: JovoModelData = {
      version: '4.0',
      invocation: _get(inputData, 'interactionModel.languageModel.invocationName'),
    };

    // prompts
    if (_get(inputData, 'interactionModel.prompts')) {
      _set(
        jovoModel,
        'alexa.interactionModel.prompts',
        _get(inputData, 'interactionModel.prompts'),
      );
    }

    // dialog
    if (_get(inputData, 'interactionModel.dialog')) {
      _set(jovoModel, 'alexa.interactionModel.dialog', _get(inputData, 'interactionModel.dialog'));
    }

    const alexaIntents: Record<string, Intent> = {};
    const jovoIntents: Record<string, Intent> = {};
    for (const intent of _get(inputData, 'interactionModel.languageModel.intents')) {
      if (_startsWith(intent.name, BUILTIN_PREFIX)) {
        const intentName: string = intent.name;
        delete intent.name;
        alexaIntents[intentName] = intent;
      } else {
        const jovoIntent: Intent = {
          phrases: intent.samples,
        };
        const entities: Record<string, IntentEntityAlexa> = {};
        if (intent.slots) {
          for (const slot of intent.slots) {
            const entity: IntentEntityAlexa = {
              type: slot.type,
            };
            if (_startsWith(slot.type, BUILTIN_PREFIX)) {
              entity.type = {
                alexa: slot.type,
              };
            }

            if (slot.samples) {
              entity.alexa = {
                samples: slot.samples,
              };
            }
            entities[slot.name] = entity;
          }
          jovoIntent.entities = entities;
        }
        jovoIntents[intent.name] = jovoIntent;
      }
    }

    _set(jovoModel, 'intents', jovoIntents);

    if (_get(inputData, 'interactionModel.languageModel.types')) {
      // Entity types
      const entityTypes: Record<string, EntityType> = {};
      for (const type of _get(inputData, 'interactionModel.languageModel.types')) {
        const values: EntityTypeValue[] = [];
        let tV: EntityTypeValue;
        for (const typeValue of type.values) {
          tV = {
            value: typeValue.name.value,
          };
          if (typeValue.name.synonyms) {
            tV.synonyms = typeValue.name.synonyms;
          }
          if (typeValue.id) {
            tV.id = typeValue.id;
          }
          values.push(tV);
        }
        entityTypes[type.name] = { values };
      }
      _set(jovoModel, 'entityTypes', entityTypes);
    }

    _set(jovoModel, 'alexa.interactionModel.languageModel.intents', alexaIntents);

    return jovoModel as JovoModelAlexaData;
  }

  static fromJovoModel(model: JovoModelAlexaData, locale: string): NativeFileInformation[] {
    const errorPrefix = '/models/' + locale + '.json - ';

    const alexaModel: AlexaModel = {
      interactionModel: {
        languageModel: {
          invocationName: '',
        },
      },
    };

    let invocationName: string = model.invocation as string;

    if (typeof model.invocation === 'object') {
      if (!model.invocation.alexaSkill) {
        throw new Error(`Can\'t find invocation name for locale ${locale}.`);
      }

      invocationName = model.invocation.alexaSkill;
    }

    _set(alexaModel, 'interactionModel.languageModel.invocationName', invocationName);

    // handle invocation name requirements
    if (alexaModel.interactionModel.languageModel.invocationName) {
      if (
        alexaModel.interactionModel.languageModel.invocationName.length < 2 ||
        alexaModel.interactionModel.languageModel.invocationName.length > 50
      ) {
        throw new Error(errorPrefix + 'Invocation name must be between 2 and 50 characters.');
      }

      if (/[A-Z]/.test(alexaModel.interactionModel.languageModel.invocationName)) {
        throw new Error(errorPrefix + 'Invocation name cannot contain upper case characters.');
      }

      if (/\d/.test(alexaModel.interactionModel.languageModel.invocationName)) {
        throw new Error(
          errorPrefix +
            'Invocation name may only contain alphabetic characters, apostrophes, periods and spaces.',
        );
      }
    }

    alexaModel.interactionModel.languageModel.types = [];

    const alexaIntents: AlexaLMIntent[] = [];
    // convert generic intents
    if (model.intents) {
      for (const [intentKey, intentData] of Object.entries(model.intents)) {
        const alexaIntentObj: AlexaLMIntent = {
          name: intentKey,
          samples: intentData.phrases,
        };
        for (const sample of alexaIntentObj.samples!) {
          if (/\d/.test(sample)) {
            // has number?
            throw new Error(
              errorPrefix + `Intent "${alexaIntentObj.name}" must not have numbers in sample`,
            ); // eslint-disable-line
          }
        }

        // handle intent entities
        if (intentData.entities) {
          alexaIntentObj.slots = [];

          for (const [entityKey, entityData] of Object.entries(intentData.entities)) {
            const alexaInputObj: AlexaLMInputObject = {
              name: entityKey,
              type: '',
            };

            if (typeof entityData.type === 'object') {
              if (entityData.type.alexa) {
                alexaInputObj.type = entityData.type.alexa;
                if (_startsWith(entityData.type.alexa, BUILTIN_PREFIX)) {
                  alexaInputObj.type = entityData.type.alexa;
                }
              } else {
                throw new Error(
                  `${errorPrefix} Please add an Alexa property for entity "${entityKey}"`,
                );
              }
            }

            // handle custom entity types
            if (!alexaInputObj.type) {
              if (!entityData.type) {
                throw new Error(`${errorPrefix} Invalid entity type in intent "${intentKey}"`);
              }

              alexaInputObj.type = entityData.type;

              // throw error when no entityTypes object defined
              if (!model.entityTypes) {
                throw new Error(
                  `${errorPrefix} Entity type "${alexaInputObj.type}" must be defined in entityTypes`,
                );
              }

              const matchedEntityType: EntityTypeAlexa =
                model.entityTypes?.[alexaInputObj.type as string];

              // find type in global entityTypes array
              if (!matchedEntityType) {
                throw new Error(
                  `${errorPrefix} Entity type "${alexaInputObj.type}" must be defined in entityTypes`,
                );
              }

              if (!alexaModel.interactionModel.languageModel.types) {
                alexaModel.interactionModel.languageModel.types = [];
              }

              // create alexaTypeObj from matched entity type
              const alexaTypeObj: AlexaLMTypeObject = {
                name: matchedEntityType.alexa || (alexaInputObj.type as string),
                values: [],
              };

              if (!matchedEntityType.values) {
                throw new Error(
                  `${errorPrefix} Entity type "${alexaInputObj.type}" must have at least one value`,
                );
              }

              // create alexaTypeValueObj
              for (const value of matchedEntityType.values) {
                const alexaTypeValueObj: AlexaLMTypeValue = {
                  id: value.id ? value.id.toString() : null,
                  name: {
                    value: value.value,
                  },
                };
                // save synonyms, if defined
                if (value.synonyms) {
                  alexaTypeValueObj.name.synonyms = value.synonyms;
                }
                alexaTypeObj.values.push(alexaTypeValueObj);
              }

              // skip existing alexa types
              const existingAlexaTypes = alexaModel.interactionModel.languageModel.types.filter(
                (item) => {
                  return alexaTypeObj.name === item.name;
                },
              );

              if (existingAlexaTypes.length === 0) {
                // add type to interaction model
                alexaModel.interactionModel.languageModel.types.push(alexaTypeObj);
              }
            }

            if ((entityData as IntentEntityAlexa).alexa) {
              _merge(alexaInputObj, (entityData as IntentEntityAlexa).alexa);
            }
            alexaIntentObj.slots.push(alexaInputObj);
          }
        }

        if (_get(intentData, 'alexa')) {
          _assign(alexaIntentObj, (intentData as IntentAlexa).alexa);
        }

        alexaIntents.push(alexaIntentObj);
      }
    }

    // convert alexa specific intents
    if (_get(model, 'alexa.interactionModel.languageModel.intents')) {
      for (const intent of _get(model, 'alexa.interactionModel.languageModel.intents')) {
        alexaIntents.push(intent);
      }
    }
    _set(alexaModel, 'interactionModel.languageModel.intents', alexaIntents);

    // prompts
    if (_get(model, 'alexa.interactionModel.prompts')) {
      _set(alexaModel, 'interactionModel.prompts', _get(model, 'alexa.interactionModel.prompts'));
    }

    // types
    if (_get(model, 'alexa.interactionModel.languageModel.types')) {
      _set(
        alexaModel,
        'interactionModel.languageModel.types',
        _get(model, 'alexa.interactionModel.languageModel.types'),
      );
    }

    // modelConfiguration
    if (_get(model, 'alexa.interactionModel.languageModel.modelConfiguration')) {
      _set(
        alexaModel,
        'interactionModel.languageModel.modelConfiguration',
        _get(model, 'alexa.interactionModel.languageModel.modelConfiguration'),
      );
    }

    // dialog
    if (_get(model, 'alexa.interactionModel.dialog')) {
      _set(alexaModel, 'interactionModel.dialog', _get(model, 'alexa.interactionModel.dialog'));
    }

    // types
    if (_get(model, 'entityTypes')) {
      for (const [entityTypeKey, entityTypeData] of Object.entries(model.entityTypes!)) {
        let findings: AlexaLMTypeObject[] = [];

        // skip entity types that are already in alexa types
        if (_get(alexaModel, 'interactionModel.languageModel.types')) {
          findings = alexaModel.interactionModel.languageModel.types.filter((item) => {
            return entityTypeKey === item.name;
          });
        }

        if (findings.length > 0) {
          continue;
        }

        // create alexa type
        const alexaType: AlexaLMTypeObject = {
          name: entityTypeKey,
          values: [],
        };

        // iterate through values
        if (entityTypeData.values) {
          for (const value of entityTypeData.values) {
            const alexaTypeValue: AlexaLMTypeValue = {
              id: value.id ? value.id.toString() : null,
              name: {
                value: value.value,
              },
            };

            if (value.synonyms) {
              alexaTypeValue.name.synonyms = value.synonyms;
            }

            alexaType.values.push(alexaTypeValue);
          }
        }

        alexaModel.interactionModel.languageModel.types.push(alexaType);
      }
    }

    return [
      {
        path: [`${locale}.json`],
        content: alexaModel,
      },
    ];
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelAlexaValidator;
  }
}
