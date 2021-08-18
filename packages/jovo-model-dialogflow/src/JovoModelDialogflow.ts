import {
  EntityType,
  EntityTypeValue,
  IntentEntity,
  JovoModel,
  NativeFileInformation,
} from 'jovo-model';
import _difference from 'lodash.difference';
import _get from 'lodash.get';
import _isEqual from 'lodash.isequal';
import _merge from 'lodash.merge';
import _set from 'lodash.set';
import { v4 as uuidv4 } from 'uuid';
import {
  DialogflowLMEntity,
  DialogflowLMInputObject,
  DialogflowLMInputParameterObject,
  DialogflowLMIntent,
  DialogflowLMIntentData,
  IntentDialogflow,
  JovoModelDialogflowData,
} from '.';
import * as JovoModelDialogflowValidator from '../validators/JovoModelDialogflowData.json';
import { DIALOGFLOW_LM_ENTITY } from './utils';
import { DialogflowLMEntries } from './utils/Interfaces';

const BUILTIN_PREFIX = '@sys.';

const DEFAULT_INTENT = {
  auto: true,
  contexts: [],
  responses: [
    {
      resetContexts: false,
      affectedContexts: [],
      parameters: [],
      defaultResponsePlatforms: {},
      speech: [],
    },
  ],
  priority: 500000,
  webhookUsed: false,
  webhookForSlotFilling: false,
  fallbackIntent: false,
  events: [],
};

const DEFAULT_ENTITY = {
  isOverridable: true,
  isEnum: false,
  automatedExpansion: false,
  isRegexp: false,
  allowFuzzyExtraction: false,
};

export class JovoModelDialogflow extends JovoModel {
  static MODEL_KEY = 'dialogflow';

  static toJovoModel(inputData: NativeFileInformation[], locale: string): JovoModelDialogflowData {
    const jovoModel: JovoModelDialogflowData = {
      version: '4.0',
      invocation: '',
      intents: [],
      entityTypes: [],
    };

    const intentFiles = inputData.filter((file) => {
      if (file.path.length === 0) {
        return false;
      }
      if (file.path[0] !== 'intents') {
        return false;
      }

      return true;
    });

    // iterate through intent files
    let file: string;
    let fileInformation: NativeFileInformation;
    for (fileInformation of intentFiles) {
      file = fileInformation.path[1];

      // skip usersays files
      if (file.indexOf('usersays') > -1) {
        continue;
      }

      const dialogFlowIntent = fileInformation.content;

      const jovoIntent: IntentDialogflow = {
        name: dialogFlowIntent.name,
        phrases: [],
      };
      // skip default intent properties
      JovoModelDialogflow.skipDefaultIntentProps(jovoIntent, dialogFlowIntent, locale);

      // is fallback intent?
      if (dialogFlowIntent.fallbackIntent === true) {
        const fallbackIntent = jovoIntent.dialogflow;
        fallbackIntent!.name = dialogFlowIntent.name;
        _set(jovoModel, 'dialogflow.intents', [fallbackIntent]);
        continue;
      }

      // is welcome intent?
      if (_get(dialogFlowIntent, 'events[0].name') === 'WELCOME') {
        const welcomeIntent = jovoIntent.dialogflow;
        welcomeIntent!.name = dialogFlowIntent.name;

        if (!_get(jovoModel, 'dialogflow.intents')) {
          _set(jovoModel, 'dialogflow.intents', [welcomeIntent]);
        } else {
          // @ts-ignore
          jovoModel.dialogflow.intents.push(welcomeIntent);
        }
        continue;
      }

      const entities: IntentEntity[] = [];
      if (dialogFlowIntent.responses) {
        for (const response of dialogFlowIntent.responses) {
          for (const parameter of _get(response, 'parameters', [])) {
            const entity: IntentEntity = {
              name: parameter.name,
            };
            if (parameter.dataType) {
              if (parameter.dataType.startsWith('@sys.')) {
                entity.type = {
                  dialogflow: parameter.dataType,
                };
              } else {
                entity.type = parameter.dataType.substr(1);
              }
              entities.push(entity);
            }
          }
        }
      }

      if (entities.length > 0) {
        jovoIntent.entities = entities;
      }

      // iterate through usersays intent files and generate sample phrases
      const userSaysFile = intentFiles.find((file) => {
        if (file.path[1] === dialogFlowIntent.name + '_usersays_' + locale + '.json') {
          return true;
        }

        return false;
      });
      if (userSaysFile !== undefined) {
        const userSays = userSaysFile.content;
        for (const us of userSays) {
          let phrase = '';
          for (const data of us.data) {
            phrase += data.alias ? '{' + data.alias + '}' : data.text;
            // add sample text to entity type
            if (data.text !== data.alias) {
              if (jovoIntent.entities) {
                for (const entity of jovoIntent.entities) {
                  if (entity.name === data.alias) {
                    entity.text = data.text;
                  }
                }
              }
            }
          }
          jovoIntent.phrases!.push(phrase);
        }
      }

      jovoModel.intents!.push(jovoIntent);
    }

    const entityFiles = inputData.filter((file) => {
      if (file.path.length === 0) {
        return false;
      }
      if (file.path[0] !== 'entities') {
        return false;
      }

      return true;
    });

    // iterate through entity files
    for (fileInformation of entityFiles) {
      file = fileInformation.path[1];
      // skip entries files
      if (file.indexOf('entries') > -1) {
        continue;
      }
      const dialogFlowEntity = fileInformation.content;
      const jovoInput: EntityType = {
        name: dialogFlowEntity.name,
      };
      // skip default intent properties
      JovoModelDialogflow.skipDefaultEntityProps(jovoInput, dialogFlowEntity);

      // iterate through usersays intent files and generate sample phrases
      const userSaysFile = entityFiles.find((file) => {
        if (file.path[1] === dialogFlowEntity.name + '_entries_' + locale + '.json') {
          return true;
        }

        return false;
      });

      if (userSaysFile !== undefined) {
        const values = [];
        const entries = userSaysFile.content;

        for (const entry of entries) {
          const value: EntityTypeValue = {
            value: entry.value,
          };
          if (!dialogFlowEntity.isEnum && !dialogFlowEntity.isRegexp) {
            const tempSynonyms = [];
            for (const synonym of entry.synonyms) {
              if (synonym === entry.value) {
                continue;
              }
              tempSynonyms.push(synonym);
            }

            if (tempSynonyms.length !== 0) {
              value.synonyms = tempSynonyms;
            }
          }
          values.push(value);
        }
        if (values.length > 0) {
          jovoInput.values = values;
        }
      }

      jovoModel.entityTypes!.push(jovoInput);
    }

    if (jovoModel.entityTypes!.length === 0) {
      delete jovoModel.entityTypes;
    }

    return jovoModel;
  }

  static fromJovoModel(model: JovoModelDialogflowData, locale: string): NativeFileInformation[] {
    const returnFiles: NativeFileInformation[] = [];

    for (const intent of (model.intents || []) as IntentDialogflow[]) {
      const dfIntentObj: DialogflowLMInputObject = {
        id: uuidv4(),
        name: intent.name,
        auto: true,
        webhookUsed: true,
      };

      // handle intent entities
      if (intent.entities) {
        dfIntentObj.responses = [
          {
            parameters: [],
          },
        ];

        for (const entity of intent.entities) {
          let parameterObj: DialogflowLMInputParameterObject = {
            isList: false,
            name: entity.name,
            value: '$' + entity.name,
            dataType: '',
          };
          if (typeof entity.type === 'object') {
            if (entity.type.dialogflow) {
              if (entity.type.dialogflow.startsWith(BUILTIN_PREFIX)) {
                parameterObj.dataType = entity.type.dialogflow;
              } else {
                entity.type = entity.type.dialogflow;
              }
            } else {
              throw new Error('Please add a dialogflow property for entity "' + entity.name + '"');
            }
          }

          // handle custom entity types
          if (parameterObj.dataType === '') {
            if (!entity.type) {
              throw new Error('Invalid entity type in intent "' + intent.name + '"');
            }
            parameterObj.dataType = entity.type as string;
            // throw error when no entityTypes object defined
            if (!model.entityTypes) {
              throw new Error(
                'Input type "' + parameterObj.dataType + '" must be defined in entityTypes',
              );
            }

            // find type in global entityTypes array
            const matchedInputTypes = model.entityTypes.filter((item: EntityType) => {
              return item.name === parameterObj.dataType;
            });

            parameterObj.dataType = '@' + parameterObj.dataType;

            if (matchedInputTypes.length === 0) {
              throw new Error(
                'Input type "' + parameterObj.dataType + '" must be defined in entityTypes',
              );
            }

            // create alexaTypeObj from matched entity types
            for (const matchedInputType of matchedInputTypes) {
              let dfEntityObj: DialogflowLMEntity = {
                ...DIALOGFLOW_LM_ENTITY,
                id: uuidv4(),
                name: matchedInputType.name,
              };

              if (matchedInputType.dialogflow) {
                if (typeof matchedInputType.dialogflow === 'string') {
                  dfEntityObj.name = matchedInputType.dialogflow;
                } else {
                  dfEntityObj = _merge(dfEntityObj, matchedInputType.dialogflow);
                }
              }

              returnFiles.push({
                path: ['entities', matchedInputType.name + '.json'],
                content: dfEntityObj,
              });

              // create entries if matched entity type has values
              if (matchedInputType.values && matchedInputType.values.length > 0) {
                const entityValues = [];
                // create dfEntityValueObj
                for (const value of matchedInputType.values) {
                  const dfEntityValueObj: DialogflowLMEntries = {
                    value: value.value,
                  };

                  // save synonyms, if defined
                  if (!dfEntityObj.isEnum && !dfEntityObj.isRegexp) {
                    dfEntityValueObj.synonyms = [value.value.replace(/[^0-9A-Za-zÀ-ÿ-_' ]/gi, '')];
                    if (value.synonyms) {
                      for (let i = 0; i < value.synonyms.length; i++) {
                        value.synonyms[i] = value.synonyms[i].replace(/[^0-9A-Za-zÀ-ÿ-_' ]/gi, '');
                      }

                      dfEntityValueObj.synonyms = dfEntityValueObj.synonyms.concat(value.synonyms);
                    }
                  }
                  entityValues.push(dfEntityValueObj);
                }

                returnFiles.push({
                  path: ['entities', matchedInputType.name + '_entries_' + locale + '.json'],
                  content: entityValues,
                });
              }
            }
          } else {
            // Parse system entities with default values for validation.
            const dfEntityObj = {
              ...DIALOGFLOW_LM_ENTITY,
              id: uuidv4(),
              name: parameterObj.dataType.replace('@', ''),
            };

            returnFiles.push({
              path: ['entities', `${dfEntityObj.name}.json`],
              content: dfEntityObj,
            });

            const dfEntityValueObj: DialogflowLMEntries[] = [
              {
                value: entity.name,
                synonyms: [entity.name],
              },
            ];

            returnFiles.push({
              path: ['entities', `${dfEntityObj.name}_entries_${locale}.json`],
              content: dfEntityValueObj,
            });
          }

          // merges dialogflow specific data
          if (entity.dialogflow) {
            parameterObj = _merge(parameterObj, entity.dialogflow);
          }

          dfIntentObj.responses[0].parameters.push(parameterObj);
        }
      }

      if (_get(intent, 'dialogflow')) {
        _merge(dfIntentObj, intent.dialogflow);
      }

      returnFiles.push({
        path: ['intents', intent.name + '.json'],
        content: dfIntentObj,
      });

      // handle user says files for intent

      const dialogFlowIntentUserSays: DialogflowLMIntent[] = [];
      const re = /{(.*?)}/g;

      const phrases = intent.phrases || [];
      // iterate through phrases and intent user says data objects
      for (const phrase of phrases) {
        let m;
        let data: DialogflowLMIntentData[] = [];
        let pos = 0;

        while (true) {
          m = re.exec(phrase);
          if (!m) {
            break;
          }

          // text between entities
          const text = phrase.substr(pos, m.index - pos);

          // entities
          const entity = phrase.substr(m.index + 1, m[1].length);

          pos = m.index + 1 + m[1].length + 1;

          const dataTextObj = {
            text,
            userDefined: false,
          };

          // skip empty text on entity index = 0
          if (text.length > 0) {
            data.push(dataTextObj);
          }

          const dataEntityObj: DialogflowLMIntentData = {
            text: entity,
            userDefined: true,
          };

          // add enityt sample text if available
          if (intent.entities) {
            for (const entities of intent.entities) {
              if (entities.name === entity && entities.text) {
                dataEntityObj.text = entities.text;
              }
            }
          }

          // create entity object based on parameters objects
          if (_get(dfIntentObj, 'responses[0].parameters')) {
            dfIntentObj.responses![0].parameters.forEach((item) => {
              if (item.name === entity) {
                dataEntityObj.alias = item.name;
                dataEntityObj.meta = item.dataType;
              }
            });
          }

          data.push(dataEntityObj);
        }

        if (pos < phrase.length) {
          data.push({
            text: phrase.substr(pos),
            userDefined: false,
          });
        }

        // if no entities in phrase use full phrase as data object
        if (data.length === 0) {
          data = [
            {
              text: phrase,
              userDefined: false,
            },
          ];
        }

        dialogFlowIntentUserSays.push({
          id: uuidv4(),
          data,
          isTemplate: false,
          count: 0,
          lang: locale,
        });
      }
      if (dialogFlowIntentUserSays.length > 0) {
        returnFiles.push({
          path: ['intents', intent.name + '_usersays_' + locale + '.json'],
          content: dialogFlowIntentUserSays,
        });
      }
    }
    // dialogflow intents form locale.json
    if (_get(model, 'dialogflow.intents')) {
      for (const modelDialogflowIntent of _get(model, 'dialogflow.intents')) {
        // user says
        if (modelDialogflowIntent.userSays) {
          returnFiles.push({
            path: ['intents', modelDialogflowIntent.name + '_usersays_' + locale + '.json'],
            content: modelDialogflowIntent.userSays,
          });
          delete modelDialogflowIntent.userSays;
        }

        returnFiles.push({
          path: ['intents', modelDialogflowIntent.name + '.json'],
          content: modelDialogflowIntent,
        });
      }
    }

    // dialogflow entities form locale.json
    if (_get(model, 'dialogflow.entities')) {
      for (const modelDialogflowEntity of _get(model, 'dialogflow.entities')) {
        // entries
        if (modelDialogflowEntity.entries) {
          returnFiles.push({
            path: ['entities', modelDialogflowEntity.name + '_entries_' + locale + '.json'],
            content: modelDialogflowEntity.entries,
          });

          delete modelDialogflowEntity.entries;
        }

        returnFiles.push({
          path: ['entities', modelDialogflowEntity.name + '.json'],
          content: modelDialogflowEntity,
        });
      }
    }

    return returnFiles;
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelDialogflowValidator;
  }

  static skipDefaultIntentProps(
    jovoIntent: IntentDialogflow,
    dialogFlowIntent: DialogflowLMInputObject,
    locale: string,
  ) {
    if (_get(dialogFlowIntent, 'auto') !== _get(DEFAULT_INTENT, 'auto')) {
      _set(jovoIntent, 'dialogflow.auto', _get(dialogFlowIntent, 'auto'));
    }

    if (
      _difference(_get(dialogFlowIntent, 'contexts'), _get(DEFAULT_INTENT, 'contexts')).length > 0
    ) {
      _set(jovoIntent, 'dialogflow.contexts', _get(dialogFlowIntent, 'contexts'));
    }

    const priority = _get(dialogFlowIntent, 'priority');
    if (priority !== undefined && priority !== _get(DEFAULT_INTENT, 'priority')) {
      _set(jovoIntent, 'dialogflow.priority', priority);
    }

    const webhookUsed = _get(dialogFlowIntent, 'webhookUsed');
    if (webhookUsed !== undefined && webhookUsed !== _get(DEFAULT_INTENT, 'webhookUsed')) {
      _set(jovoIntent, 'dialogflow.webhookUsed', webhookUsed);
    }

    const webhookForSlotFilling = _get(dialogFlowIntent, 'webhookForSlotFilling');
    if (
      webhookForSlotFilling !== undefined &&
      webhookForSlotFilling !== _get(DEFAULT_INTENT, 'webhookForSlotFilling')
    ) {
      _set(jovoIntent, 'dialogflow.webhookForSlotFilling', webhookForSlotFilling);
    }

    const fallbackIntent = _get(dialogFlowIntent, 'fallbackIntent');
    if (fallbackIntent !== undefined && fallbackIntent !== _get(DEFAULT_INTENT, 'fallbackIntent')) {
      _set(jovoIntent, 'dialogflow.fallbackIntent', fallbackIntent);
    }
    if (_difference(_get(dialogFlowIntent, 'events'), _get(DEFAULT_INTENT, 'events')).length > 0) {
      _set(jovoIntent, 'dialogflow.events', _get(dialogFlowIntent, 'events'));
    }

    // skip parameters object in responses. it's handled somewhere else
    const responses = _get(dialogFlowIntent, 'responses');

    if (
      responses !== undefined &&
      responses.length !== 0 &&
      !_isEqual(responses, _get(DEFAULT_INTENT, 'responses'))
    ) {
      const resetContexts = _get(dialogFlowIntent, 'responses[0].resetContexts');
      if (
        resetContexts !== undefined &&
        !_isEqual(resetContexts, _get(DEFAULT_INTENT, 'responses[0].resetContexts'))
      ) {
        _set(jovoIntent, 'dialogflow.responses[0].resetContexts', resetContexts);
      }

      const affectedContexts = _get(dialogFlowIntent, 'responses[0].affectedContexts');
      if (
        affectedContexts !== undefined &&
        !_isEqual(affectedContexts, _get(DEFAULT_INTENT, 'responses[0].affectedContexts'))
      ) {
        _set(jovoIntent, 'dialogflow.responses[0].affectedContexts', affectedContexts);
      }

      const defaultResponsePlatforms = _get(
        dialogFlowIntent,
        'responses[0].defaultResponsePlatforms',
      );
      if (
        defaultResponsePlatforms !== undefined &&
        !_isEqual(
          defaultResponsePlatforms,
          _get(DEFAULT_INTENT, 'responses[0].defaultResponsePlatforms'),
        )
      ) {
        _set(
          jovoIntent,
          'dialogflow.responses[0].defaultResponsePlatforms',
          defaultResponsePlatforms,
        );
      }

      if (
        !_isEqual(
          _get(dialogFlowIntent, 'responses[0].messages'),
          _get(DEFAULT_INTENT, 'responses[0].messages'),
        )
      ) {
        for (const message of _get(dialogFlowIntent, 'responses[0].messages')) {
          if (_get(message, 'lang') === locale) {
            const jovoIntentDialogflowMessages = _get(
              jovoIntent,
              'dialogflow.responses[0].messages',
              [],
            );

            if (_get(message, 'speech', '').length > 0) {
              jovoIntentDialogflowMessages.push(message);
              _set(jovoIntent, 'dialogflow.responses[0].messages', jovoIntentDialogflowMessages);
            }
          }
        }
      }

      const responseSpeech = _get(dialogFlowIntent, 'responses[0].speech');
      if (
        responseSpeech !== undefined &&
        !_isEqual(responseSpeech, _get(DEFAULT_INTENT, 'responses[0].speech'))
      ) {
        _set(jovoIntent, 'dialogflow.responses[0].speech', responseSpeech);
      }
    }
    return jovoIntent;
  }

  static skipDefaultEntityProps(jovoInput: EntityType, dialogflowEntity: DialogflowLMEntity) {
    //isOverridable
    if (_get(dialogflowEntity, 'isOverridable') !== _get(DEFAULT_ENTITY, 'isOverridable')) {
      _set(jovoInput, 'dialogflow.isOverridable', _get(dialogflowEntity, 'isOverridable'));
    }
    //isEnum
    if (_get(dialogflowEntity, 'isEnum') !== _get(DEFAULT_ENTITY, 'isEnum')) {
      _set(jovoInput, 'dialogflow.isEnum', _get(dialogflowEntity, 'isEnum'));
    }
    //automatedExpansion
    if (
      _get(dialogflowEntity, 'automatedExpansion') !== _get(DEFAULT_ENTITY, 'automatedExpansion')
    ) {
      _set(
        jovoInput,
        'dialogflow.automatedExpansion',
        _get(dialogflowEntity, 'automatedExpansion'),
      );
    }
    //isRegexp
    if (_get(dialogflowEntity, 'isRegexp') !== _get(DEFAULT_ENTITY, 'isRegexp')) {
      _set(jovoInput, 'dialogflow.isRegexp', _get(dialogflowEntity, 'isRegexp'));
    }
    //allowFuzzyExtraction
    if (
      _get(dialogflowEntity, 'allowFuzzyExtraction') !==
      _get(DEFAULT_ENTITY, 'allowFuzzyExtraction')
    ) {
      _set(
        jovoInput,
        'dialogflow.allowFuzzyExtraction',
        _get(dialogflowEntity, 'allowFuzzyExtraction'),
      );
    }
    return jovoInput;
  }
}

