import { readFileSync } from 'fs';
import {
  EntityType,
  EntityTypeValue,
  Intent,
  IntentEntity,
  JovoModel,
  JovoModelData,
  JovoModelDataV3,
  JovoModelHelper,
  NativeFileInformation,
} from '@jovotech/model';
import _get from 'lodash.get';
import _mergeWith from 'lodash.mergewith';
import _set from 'lodash.set';
import { join as pathJoin } from 'path';
import * as yaml from 'yaml';
import {
  GoogleActionInput,
  GoogleActionIntent,
  GoogleActionLanguageModelProperty,
} from './Interfaces';

// Configure yaml to always use double quotes on properties.
// @ts-ignore
yaml.scalarOptions.str.defaultType = 'QUOTE_DOUBLE';

export class JovoModelGoogle extends JovoModel {
  static MODEL_KEY = 'google';
  static defaultLocale?: string;

  constructor(data?: JovoModelData, locale?: string, defaultLocale?: string) {
    super(data, locale);
    JovoModelGoogle.defaultLocale = defaultLocale;
  }

  static fromJovoModel(
    model: JovoModelData | JovoModelDataV3,
    locale: string,
  ): NativeFileInformation[] {
    const errorPrefix = `/models/${locale}.json - `;
    const returnFiles: NativeFileInformation[] = [];

    const globalIntents: GoogleActionLanguageModelProperty = {
      'actions.intent.MAIN': {
        handler: {
          webhookHandler: 'Jovo',
        },
      },
    };

    if (!model.intents) {
      return [];
    }

    const intents = JovoModelHelper.getIntents(model);
    for (const [intentKey, intentData] of Object.entries(intents)) {
      const gaIntent: GoogleActionIntent = {
        trainingPhrases: [],
      };
      const path: string[] = ['custom', 'intents'];

      if (locale !== this.defaultLocale) {
        path.push(locale);
      }

      // Handle platform-specific intents
      if (intentData.googleAssistant) {
        const googleIntent: string = Object.keys(intentData.googleAssistant)[0];
        const data = intentData.googleAssistant[googleIntent];

        if (googleIntent.startsWith('actions.intent')) {
          globalIntents[googleIntent] = Object.keys(data).length
            ? data
            : { handler: { webhookHandler: 'Jovo' } };

          continue;
        } else {
          path.push(`${googleIntent}.yaml`);
          Object.assign(gaIntent, intentData.googleAssistant[googleIntent]);
        }
      } else {
        path.push(`${intentKey}.yaml`);

        for (let phrase of intentData.phrases || []) {
          const entityRegex: RegExp = /{(.*?)}/g;

          // Check if phrase contains any entities and parse them, if necessary.
          for (;;) {
            const match = entityRegex.exec(phrase);

            if (!match) {
              break;
            }

            const matched: string = match[0];
            const entity: string = match[1];
            let type: string | undefined;

            // Get entity type for current entity
            const entities = JovoModelHelper.getEntities(model, intentKey);
            for (const [entityKey, entityData] of Object.entries(entities)) {
              if (entity === entityKey) {
                if (typeof entityData.type === 'object') {
                  if (!entityData.type.googleAssistant) {
                    throw new Error(
                      `${errorPrefix}Please add a "googleAssistant" property for entity "${entityKey}"`,
                    );
                  }
                  type = entityData.type.googleAssistant;
                  continue;
                }

                type = entityData.type;
              }
            }

            if (!type) {
              throw new Error(
                `Couldn't find entity type for entity ${entity} for intent ${intentKey}.`,
              );
            }

            // For entity type, get an example value to work with.
            let sampleValue = '';
            const entityTypes = JovoModelHelper.getEntityTypes(model);
            for (const [entityTypeKey, entityTypeData] of Object.entries(entityTypes)) {
              if (entityTypeKey !== type) {
                continue;
              }

              const entityTypeDataValue = entityTypeData.values![0];
              if (typeof entityTypeDataValue === 'string') {
                sampleValue = entityTypeDataValue;
              } else {
                sampleValue = entityTypeDataValue.value;
              }
              break;
            }

            // If no sample value is given, take the entity id as a sample value.
            if (!sampleValue) {
              sampleValue = entity;
            }

            phrase = phrase.replace(matched, `($${entity} '${sampleValue}' auto=true)`);

            // Check for freeText entity type.
            if (type === 'actions.type.FreeText') {
              // Create InputType with content freeText: {}.
              JovoModelHelper.addEntityType(model, 'FreeTextType', {} as EntityType);
              // Change type to that InputType.
              type = 'FreeTextType';
            }

            if (locale === this.defaultLocale && JovoModelHelper.hasEntities(model, intentKey)) {
              if (!gaIntent.parameters) {
                gaIntent.parameters = [];
              }

              // If parameters already contain entity, skip.
              if (gaIntent.parameters.find((el) => el.name === entity)) {
                continue;
              }

              gaIntent.parameters.push({
                name: entity,
                type: {
                  name: type,
                },
              });
            }
          }
          gaIntent.trainingPhrases.push(phrase);
        }
      }

      returnFiles.push({
        path,
        content: yaml.stringify(gaIntent),
      });

      // Set global intent.
      globalIntents[intentKey] = { handler: { webhookHandler: 'Jovo' } };
    }

    const entityTypes = JovoModelHelper.getEntityTypes(model);
    for (const [entityTypeKey, entityTypeData] of Object.entries(entityTypes)) {
      const gaInput: GoogleActionInput = {
        synonym: {
          entities: {},
        },
      };

      const path: string[] = ['custom', 'types'];

      if (locale !== this.defaultLocale) {
        path.push(locale);
      }

      path.push(`${entityTypeKey}.yaml`);

      // prettier-ignore
      for (const entityTypeValue of (entityTypeData.values || [])) {
        if(typeof entityTypeValue === 'string') {
          gaInput.synonym.entities[entityTypeValue] = {synonyms: [entityTypeValue]};
        } else {
          gaInput.synonym.entities[entityTypeValue.key || entityTypeValue.value] = {
            synonyms: [
              entityTypeValue.value,
              ...(entityTypeValue.synonyms || [])
            ]
          };
        }
      }

      // If InputType is FreeText, don't include any entity values.
      if (entityTypeKey === 'FreeTextType') {
        returnFiles.push({
          path,
          content: yaml.stringify({ freeText: {} }),
        });
      } else {
        returnFiles.push({
          path,
          content: yaml.stringify(gaInput),
        });
      }
    }

    // Set google specific properties.
    for (const key of ['global', 'intents', 'types', 'scenes']) {
      const googleProps = _get(model, `googleAssistant.custom.${key}`, {});

      // Merge existing global intents with configured ones in language model.
      if (key === 'global') {
        _mergeWith(googleProps, globalIntents, (objValue: unknown) => {
          // Don't overwrite original properties.
          if (objValue) {
            return objValue;
          }
        });
      }

      for (const [name, content] of Object.entries(googleProps)) {
        const path = ['custom', key];
        if (key !== 'global' && locale !== this.defaultLocale) {
          path.push(locale);
        }
        path.push(`${name}.yaml`);

        returnFiles.push({
          path,
          content: yaml.stringify(content),
        });
      }
    }

    return returnFiles;
  }

  static toJovoModel(inputFiles: NativeFileInformation[]): JovoModelData {
    const jovoModel: JovoModelData = {
      version: '4.0',
      invocation: '',
      intents: {},
      entityTypes: {},
    };

    for (const inputFile of inputFiles) {
      const filePath: string[] = inputFile.path;
      const modelType: string = filePath[1];
      const modelName: string = filePath[filePath.length - 1].replace('.yaml', '');

      if (modelType === 'intents') {
        const intent: GoogleActionIntent = inputFile.content;
        // Create regex to match entity patterns such as ($entity 'test' auto=true).
        const entityRegex: RegExp = /\(\$([a-z]*).*?\)/gi;
        const phrases: string[] = [];
        const entities: Record<string, IntentEntity> = {};

        for (let phrase of intent.trainingPhrases) {
          for (;;) {
            const match = entityRegex.exec(phrase);

            if (!match) {
              break;
            }

            const [matched, entityName] = match;

            phrase = phrase.replace(matched, `{${entityName}}`);

            // Check if current model has parameters.
            let model: GoogleActionIntent = intent;

            if (!model.parameters) {
              // Get the entity type from the default locale model.
              const defaultModelPath = pathJoin(filePath[0], modelType, `${modelName}.yaml`);

              const file = readFileSync(defaultModelPath, 'utf-8');
              const defaultModel: GoogleActionIntent = yaml.parse(file);

              if (!defaultModel.parameters) {
                // If no type is given, convert the entity to a simple string.
                const entityValue = matched.match(/'.*'/);
                const entityPhrase: string = entityValue?.shift()?.replace(/'/g, '') || entityName;
                phrase = phrase.replace(`{${entityName}}`, entityPhrase);
                continue;
              }

              model = defaultModel;
            }

            // Find entity parameter for the current entity name.
            const entityParameter = model.parameters!.find((el) => el.name === entityName)!;

            // Check for duplicated inputs.
            const hasInput: boolean = !!entities[entityParameter.name];

            // If the current input already has been registered, skip.
            if (!hasInput) {
              // Check for freeText.
              if (entityParameter.type.name === 'FreeTextType') {
                entities[entityParameter.name] = {
                  type: {
                    googleAssistant: 'actions.type.FreeText',
                  },
                };
              } else {
                entities[entityParameter.name] = {
                  type: entityParameter.type.name,
                };
              }
            }
          }

          phrases.push(phrase);
        }

        const jovoIntent: Intent = { phrases };

        if (entities.length > 0) {
          jovoIntent.entities = entities;
        }

        jovoModel.intents![modelName] = jovoIntent;
      } else if (modelType === 'types') {
        const entity: GoogleActionInput = inputFile.content;
        const entities = entity.synonym?.entities || {};
        const values: EntityTypeValue[] = [];

        // Check for FreeTextType.
        if (modelName === 'FreeTextType') {
          continue;
        }

        for (const entityKey of Object.keys(entities)) {
          const entityValues: string[] = entities[entityKey].synonyms;

          const entityTypeValue: EntityTypeValue = {
            key: entityKey,
            value: entityValues.shift()!,
            synonyms: entityValues,
          };

          values.push(entityTypeValue);
        }

        const jovoEntity: EntityType = { values };

        jovoModel.entityTypes![modelName] = jovoEntity;
      } else {
        // @ts-ignore
          const props: GoogleActionLanguageModelProperty[] = _get(
          jovoModel,
          `googleAssistant.custom.${modelType}`,
          {},
        );
        _set(props, [modelName], inputFile.content);
        _set(jovoModel, `googleAssistant.custom.${modelType}`, props);
      }
    }

    return jovoModel;
  }

  static getValidator(model: JovoModelData | JovoModelDataV3): tv4.JsonSchema {
    return super.getValidator(model);
  }
}
