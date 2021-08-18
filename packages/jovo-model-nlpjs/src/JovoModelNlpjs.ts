import { JovoModelNlpjsData, NlpjsData, NlpjsModelFile } from '.';

import {
  EntityType,
  EntityTypeValue,
  Intent,
  IntentEntity,
  JovoModel,
  JovoModelData,
  NativeFileInformation,
} from '@jovotech/model';

import * as JovoModelNlpjsValidator from '../validators/JovoModelNlpjsData.json';

export class JovoModelNlpjs extends JovoModel {
  static MODEL_KEY = 'nlpjs';

  static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
    const inputData: NlpjsModelFile = inputFiles[0].content;

    const jovoModel: JovoModelData = {
      version: '4.0',
      invocation: '',
      intents: [],
      entityTypes: [],
    };

    if (inputData.data) {
      inputData.data.forEach((data: NlpjsData) => {
        jovoModel.intents!.push({
          name: data.intent,
          phrases: data.utterances,
        });
      });
    }

    return jovoModel;
  }

  static fromJovoModel(model: JovoModelNlpjsData, locale: string): NativeFileInformation[] {
    const returnData: NlpjsModelFile = {
      data: [],
      name: '',
      locale,
    };
    const entitiesMap: Record<string, string> = {};

    if (model.intents) {
      model.intents.forEach((intent: Intent) => {
        const intentObj = {
          intent: intent.name,
          utterances: [],
        };

        if (intent.entities) {
          returnData.entities = {};

          intent.entities.forEach((entity: IntentEntity) => {
            if (entity.type && typeof entity.type === 'string') {
              // inputsMap[input.name] = input.type;
              entitiesMap[entity.type] = entity.name;
            } else if (entity.type && typeof entity.type === 'object' && entity.type.nlpjs) {
              // inputsMap[input.name] = input.type.nlpjs;
              entitiesMap[entity.type.nlpjs] = entity.name;
            }
          });
        }
        if (intent.phrases) {
          intent.phrases.forEach((phrase: string) => {
            const matches = phrase.match(/\{([^}]+)\}/g);

            if (matches) {
              matches.forEach((match: string) => {
                const matchValue = match.replace('{', '').replace('}', '');

                if (entitiesMap[matchValue]) {
                  phrase = phrase.replace(match, `@${entitiesMap[matchValue]}`);
                } else {
                  phrase = phrase.replace(match, `@${matchValue}`);
                }
              });
            }
            // @ts-ignore
            intentObj.utterances.push(phrase);
          });
        }
        returnData.data.push(intentObj);
      });
    }

    if (model.entityTypes) {
      returnData.entities = {};
      model.entityTypes.forEach((entityType: EntityType) => {
        const options: Record<string, string[]> = {};

        entityType.values!.forEach((entityTypeValue: EntityTypeValue) => {
          const key = entityTypeValue.value;
          options[key] = [entityTypeValue.value];
          if (entityTypeValue.synonyms) {
            options[key] = options[key].concat(entityTypeValue.synonyms);
          }
        });
        returnData.entities![entitiesMap[entityType.name]] = {
          options,
        };
      });
    }

    return [
      {
        path: [`${locale}.json`],
        content: returnData,
      },
    ];
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelNlpjsValidator;
  }
}
