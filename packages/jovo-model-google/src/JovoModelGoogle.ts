import { join as pathJoin } from 'path';
import * as yaml from 'yaml';
import * as _ from 'lodash';
import { readFileSync } from 'fs';
import {
  Intent,
  JovoModel,
  NativeFileInformation,
  InputType,
  InputTypeValue,
  IntentInput,
} from 'jovo-model';

import * as JovoModelGoogleValidator from '../validators/JovoModelGoogleValidator.json';
import {
  GoogleActionIntent,
  GoogleActionInput,
  JovoModelGoogleActionData,
  GoogleActionLanguageModelProperty,
} from './Interfaces';

// Configure yaml to always use double quotes on properties.
// @ts-ignore
yaml.scalarOptions.str.defaultType = 'QUOTE_DOUBLE';

export class JovoModelGoogle extends JovoModel {
  static MODEL_KEY = 'google';
  static defaultLocale?: string;

  constructor(data?: JovoModelGoogleActionData, locale?: string, defaultLocale?: string) {
    super(data, locale);
    JovoModelGoogle.defaultLocale = defaultLocale;
  }

  static fromJovoModel(model: JovoModelGoogleActionData, locale: string): NativeFileInformation[] {
    const errorPrefix = `/models/${locale}.json - `;
    const returnFiles: NativeFileInformation[] = [];

    const globalIntents: GoogleActionLanguageModelProperty = {
      'actions.intent.MAIN': {
        handler: {
          webhookHandler: 'Jovo',
        },
      },
    };

    for (const intent of (model.intents || []) as Intent[]) {
      const gaIntent: GoogleActionIntent = {
        trainingPhrases: [],
      };
      const path: string[] = ['custom', 'intents'];

      if (locale !== this.defaultLocale) {
        path.push(locale);
      }

      path.push(`${intent.name}.yaml`);

      for (let phrase of intent.phrases || []) {
        const inputRegex: RegExp = /{(.*?)}/g;

        // Check if phrase contains any inputs and parse them, if necessary.
        for (;;) {
          const match = inputRegex.exec(phrase);

          if (!match) {
            break;
          }

          const matched: string = match[0];
          const input: string = match[1];
          let type: string | undefined;

          // Get input type for current input.
          for (const i of intent.inputs || []) {
            if (input === i.name) {
              if (typeof i.type === 'object') {
                if (!i.type.googleAssistant) {
                  throw new Error(
                    `${errorPrefix}Please add a "googleAssistant" property for input "${i.name}"`,
                  );
                }
                type = i.type.googleAssistant;
                continue;
              }

              // @ts-ignore
              type = i.type;
            }
          }

          if (!type) {
            throw new Error(
              `Couldn't find input type for input ${input} for intent ${intent.name}.`,
            );
          }

          // For input type, get an example value to work with.
          let sampleValue = '';
          for (const inputType of model.inputTypes || []) {
            if (inputType.name !== type) {
              continue;
            }

            sampleValue = inputType.values![0].value;
            break;
          }

          // If no sample value is given, take the input id as a sample value.
          if (!sampleValue) {
            sampleValue = input;
          }

          phrase = phrase.replace(matched, `($${input} '${sampleValue}' auto=true)`);

          if (locale === this.defaultLocale && intent.inputs) {
            if (!gaIntent.parameters) {
              gaIntent.parameters = [];
            }

            if (gaIntent.parameters.find((el) => el.name === input)) {
              continue;
            }

            gaIntent.parameters.push({
              name: input,
              type: {
                name: type,
              },
            });
          }
        }
        gaIntent.trainingPhrases.push(phrase);
      }

      returnFiles.push({
        path,
        content: yaml.stringify(gaIntent),
      });

      // Set global intent.
      globalIntents[intent.name] = { handler: { webhookHandler: 'Jovo' } };
    }

    for (const inputType of (model.inputTypes || []) as InputType[]) {
      const gaInput: GoogleActionInput = {
        synonym: {
          entities: {},
        },
      };

      const path: string[] = ['custom', 'types'];

      if (locale !== this.defaultLocale) {
        path.push(locale);
      }

      path.push(`${inputType.name}.yaml`);

      // prettier-ignore
      for (const inputTypeValue of (inputType.values || []) as InputTypeValue[]) {
        gaInput.synonym.entities[inputTypeValue.key || inputTypeValue.value] = {
          synonyms: [
            inputTypeValue.value,
            ...(inputTypeValue.synonyms || [])
          ]
        };
      }

      returnFiles.push({
        path,
        content: yaml.stringify(gaInput),
      });
    }

    // Set google specific properties.
    for (const key of ['global', 'intents', 'types', 'scenes']) {
      const googleProps = _.get(model, `googleAssistant.custom.${key}`);

      if (!googleProps) {
        continue;
      }

      // Merge existing global intents with configured ones in language model.
      if (key === 'global') {
        _.mergeWith(googleProps, globalIntents, (objValue, srcValue, key) => {
          // Don't overwrite original properties.
          if (objValue) {
            return objValue;
          }
        });
      }

      for (const [name, content] of Object.entries(googleProps)) {
        returnFiles.push({
          path: ['custom', key, `${name}.yaml`],
          content: yaml.stringify(content),
        });
      }
    }

    return returnFiles;
  }

  static toJovoModel(inputFiles: NativeFileInformation[]): JovoModelGoogleActionData {
    const jovoModel: JovoModelGoogleActionData = {
      invocation: '',
      intents: [],
      inputTypes: [],
    };

    for (const inputFile of inputFiles) {
      const filePath: string[] = inputFile.path;
      const modelType: string = filePath[1];
      const modelName: string = filePath[filePath.length - 1].replace('.yaml', '');

      if (modelType === 'intents') {
        const intent: GoogleActionIntent = inputFile.content;
        // Create regex to match input patterns such as ($input 'test' auto=true).
        const inputRegex: RegExp = /\(\$([a-z]*).*?\)/gi;
        const phrases: string[] = [];
        const inputs: IntentInput[] = [];

        for (let phrase of intent.trainingPhrases) {
          for (;;) {
            const match = inputRegex.exec(phrase);

            if (!match) {
              break;
            }

            const [matched, inputName] = match;

            phrase = phrase.replace(matched, `{${inputName}}`);

            // Check if current model has parameters.
            let model: GoogleActionIntent = intent;

            if (!model.parameters) {
              // Get the input type from the default locale model.
              const defaultModelPath = pathJoin(filePath[0], modelType, `${modelName}.yaml`);

              const file = readFileSync(defaultModelPath, 'utf-8');
              const defaultModel: GoogleActionIntent = yaml.parse(file);

              if (!defaultModel.parameters) {
                // If no type is given, convert the input to a simple string.
                const inputValue = matched.match(/'.*'/);
                const inputPhrase: string = inputValue?.shift()?.replace(/'/g, '') || inputName;
                phrase = phrase.replace(`{${inputName}}`, inputPhrase);
                continue;
              }

              model = defaultModel;
            }

            const inputParameter = model.parameters!.find((el) => el.name === inputName)!;

            const hasInput = inputs.find((el) => el.name === inputParameter.name);

            if (!hasInput) {
              inputs.push({
                name: inputParameter.name,
                type: inputParameter.type.name,
              });
            }
          }

          phrases.push(phrase);
        }

        const jovoIntent: Intent = {
          name: modelName,
          phrases,
        };

        if (inputs.length > 0) {
          jovoIntent.inputs = inputs;
        }

        jovoModel.intents!.push(jovoIntent);
      } else if (modelType === 'types') {
        const input: GoogleActionInput = inputFile.content;
        const entities = input.synonym?.entities || {};
        const values: InputTypeValue[] = [];

        for (const inputKey of Object.keys(entities)) {
          const inputValues: string[] = entities[inputKey].synonyms;

          const inputTypeValue: InputTypeValue = {
            key: inputKey,
            value: inputValues.shift()!,
            synonyms: inputValues,
          };

          values.push(inputTypeValue);
        }

        const jovoInput: InputType = {
          name: modelName,
          values,
        };

        jovoModel.inputTypes!.push(jovoInput);
      } else {
        const props: GoogleActionLanguageModelProperty[] = _.get(
          jovoModel,
          `googleAssistant.custom.${modelType}`,
          {},
        );
        _.set(props, [modelName], inputFile.content);
        _.set(jovoModel, `googleAssistant.custom.${modelType}`, props);
      }
    }

    return jovoModel;
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelGoogleValidator;
  }
}
