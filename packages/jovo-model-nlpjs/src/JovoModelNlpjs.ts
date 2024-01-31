import {
  EntityTypeValue,
  JovoModel,
  JovoModelData,
  JovoModelDataV3,
  JovoModelHelper,
  NativeFileInformation,
} from '@jovotech/model';
import { NlpjsData, NlpjsModelFile } from '.';

const REGEX_PREFIX = 'regex:';

export class JovoModelNlpjs extends JovoModel {
  static MODEL_KEY = 'nlpjs';

  static toJovoModel(inputFiles: NativeFileInformation[]): JovoModelData {
    const inputData: NlpjsModelFile = inputFiles[0].content;

    const jovoModel: JovoModelData = {
      version: '4.0',
      invocation: '',
      intents: {},
      entityTypes: {},
    };

    if (inputData.data) {
      inputData.data.forEach((data: NlpjsData) => {
        jovoModel.intents![data.intent] = {
          phrases: data.utterances,
        };
      });
    }

    return jovoModel;
  }

  static fromJovoModel(
    model: JovoModelData | JovoModelDataV3,
    locale: string,
  ): NativeFileInformation[] {
    const returnData: NlpjsModelFile = {
      data: [],
      name: '',
      locale,
    };
    const entitiesMap: Record<string, string> = {};

    if (JovoModelHelper.hasIntents(model)) {
      const intents = JovoModelHelper.getIntents(model);
      for (const [intentKey, intentData] of Object.entries(intents)) {
        const intentObj = {
          intent: intentKey,
          utterances: [] as string[],
        };

        if (JovoModelHelper.hasEntities(model, intentKey)) {
          const entities = JovoModelHelper.getEntities(model, intentKey);
          returnData.entities = {};

          for (const [entityKey, entityData] of Object.entries(entities)) {
            if (entityData.type && typeof entityData.type === 'string') {
              entitiesMap[entityKey] = entityData.type;
            } else if (
              entityData.type &&
              typeof entityData.type === 'object' &&
              entityData.type.nlpjs
            ) {
              entitiesMap[entityKey] = entityData.type.nlpjs;
            }
          }
        }
        if (intentData.phrases) {
          intentData.phrases.forEach((phrase: string) => {
            const matches = phrase.match(/\{([^}]+)\}/g);

            if (matches) {
              matches.forEach((match: string) => {
                const matchValue = match.replace('{', '').replace('}', '');
                phrase = phrase.replace(match, `@${matchValue}`);
              });
            }
            intentObj.utterances.push(phrase);
          });
        }
        returnData.data.push(intentObj);
      }
    }

    if (JovoModelHelper.hasEntityTypes(model)) {
      returnData.entities = {};
      for (const [entityKey, entityTypeName] of Object.entries(entitiesMap)) {

        if (entityTypeName.startsWith(REGEX_PREFIX)) {
          returnData.entities![entityKey] = entityTypeName.slice(REGEX_PREFIX.length);
          continue;
        }

        const relatedEntityType = JovoModelHelper.getEntityTypeByName(model, entityTypeName);
        if (!relatedEntityType?.values?.length) {
          continue;
        }
        const options: Record<string, string[]> = {};
        relatedEntityType.values.forEach((entityTypeValue: string | EntityTypeValue) => {
          if (typeof entityTypeValue === 'string') {
            options[entityTypeValue] = [entityTypeValue];
          } else {
            const key = entityTypeValue.value;
            options[key] = [entityTypeValue.value];
            if (entityTypeValue.synonyms) {
              options[key] = options[key].concat(entityTypeValue.synonyms);
            }
          }
        });
        returnData.entities[entityKey] = {
          options,
        };
      }
    }

    return [
      {
        path: [`${locale}.json`],
        content: returnData,
      },
    ];
  }

  static getValidator(model: JovoModelData | JovoModelDataV3): tv4.JsonSchema {
    return super.getValidator(model);
  }
}
