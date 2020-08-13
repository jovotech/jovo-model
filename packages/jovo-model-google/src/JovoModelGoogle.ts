import { join as pathJoin } from 'path';
import * as yaml from 'yaml';
import { readFileSync } from 'fs';
import {
  Intent,
  JovoModel,
  JovoModelData,
  NativeFileInformation,
  InputType,
  InputTypeValue,
  IntentInput,
} from 'jovo-model';

import * as JovoModelGoogleValidator from '../validators/JovoModelGoogleValidator.json';
import { GoogleActionIntent, GoogleActionInput, JovoModelGoogleActionData } from './Interfaces';

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
                if (!i.type.googleAction) {
                  throw new Error(
                    `${errorPrefix}Please add a "googleAction" property for input "${i.name}"`,
                  );
                }
                type = i.type.googleAction;
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
        content: gaIntent,
      });
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
        content: gaInput,
      });
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
                throw new Error(`Could not find parameters for type ${modelName}.`);
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
      } else {
        const input: GoogleActionInput = inputFile.content;
        const entities = input.synonym.entities;
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
      }
    }

    return jovoModel;
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelGoogleValidator;
  }
}
