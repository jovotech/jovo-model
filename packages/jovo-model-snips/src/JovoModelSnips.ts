import _startsWith from 'lodash.startswith';
import tv4 from 'tv4';
import _get from 'lodash.get';
import _set from 'lodash.set';
import {
  InputType,
  InputTypeValue,
  Intent,
  JovoModel,
  JovoModelData,
  NativeFileInformation,
} from 'jovo-model';

import * as JovoModelAlexaValidator from '../validators/JovoModelSnipsData.json';
import {
  NativeSnipsInformation,
  SnipsEntity,
  SnipsEntityData,
  SnipsIntent,
  SnipsModel,
  SnipsUtterance,
  SnipsUtteranceData,
} from './Interfaces';

export class JovoModelSnips extends JovoModel {
  static MODEL_KEY: string = 'snips';
  static BUILTIN_PREFIX: string = 'snips/';

  static fromJovoModel(model: JovoModelData, locale: string): NativeFileInformation[] {
    const errorPrefix: string = `/models/${locale}.json -`;
    const snipsModel: SnipsModel = {
      language: locale,
      intents: {},
      entities: {},
    };

    if (model.intents) {
      for (const intent of model.intents) {
        const snipsIntent: SnipsIntent = { utterances: [] };

        for (const phrase of intent.phrases || []) {
          const snipsUtterance: SnipsUtterance = { data: [{ text: phrase }] };

          const inputRegex: RegExp = /{([^\s\d]*)}/g;

          for (;;) {
            const match: RegExpExecArray | null = inputRegex.exec(phrase);

            if (!match) {
              break;
            }

            const matchedString: string = match[0];
            const matchedInput: string = match[1];

            if (!intent.inputs) {
              throw new Error(
                `${errorPrefix} No inputs defined for intent "${intent.name}", but "${matchedInput}" found.`,
              );
            }

            let inputSample: string | undefined;
            let intentInputType: string | undefined;

            // Try to get the input type for the matched input to insert random samples
            for (const input of intent.inputs) {
              console.log(matchedInput);
              if (matchedInput !== input.name) {
                continue;
              }

              if (!input.type) {
                console.log('Input Type found: ', input.type);
                throw new Error(`${errorPrefix} No input type found for input "${matchedInput}".`);
              }

              if (typeof input.type === 'object') {
                intentInputType = input.type.snips;
              } else {
                intentInputType = input.type;
              }

              if (!model.inputTypes) {
                throw new Error(`${errorPrefix} No inputTypes defined.`);
              }

              for (const inputType of model.inputTypes) {
                if (inputType.name !== intentInputType) {
                  continue;
                }

                if (!inputType.values) {
                  throw new Error(
                    `${errorPrefix} No input values found for inputType "${matchedInput}".`,
                  );
                }

                // Get a random sample input value to improve model accuracy
                const randomIndex: number = Math.round(
                  Math.random() * (inputType.values.length - 1),
                );
                inputSample = inputType.values[randomIndex].value;
              }
            }

            if (!intentInputType) {
              throw new Error(`${errorPrefix} No input type found for input "${matchedInput}".`);
            }

            if (!inputSample) {
              throw new Error(
                `${errorPrefix} No sample input found for input "${matchedInput}". Please provide at least one input value.`,
              );
            }

            // For every input defined in an intent phrase, this takes the last data entry,
            // parses the input and pushes the rest to the end of the array until no more inputs are found.
            const lastUtteranceData: SnipsUtteranceData = snipsUtterance.data.pop()!;
            // Capture everything before and after the current input
            const regex: RegExp = new RegExp(`(.*)${matchedString}(.*)`);
            // @ts-ignore
            const [, prefix, suffix] = regex.exec(lastUtteranceData.text);
            // Push preceding text back
            if (prefix && prefix.length) {
              snipsUtterance.data.push({ text: prefix });
            }

            // Parse entity and push it to utterance data
            snipsUtterance.data.push({
              text: inputSample,
              // @ts-ignore
              entity: intentInputType,
              slot_name: matchedInput,
            });

            // Add the rest of the phrase to the data array. If another input is found,
            // this will be prefix in the next iteration.
            if (suffix && suffix.length) {
              snipsUtterance.data.push({ text: suffix });
            }
          }

          snipsIntent.utterances.push(snipsUtterance);
        }

        snipsModel.intents[intent.name] = snipsIntent;
      }
    }

    if (model.inputTypes) {
      for (const inputType of model.inputTypes) {
        // TODO: Customize automatically_extensible & matching_strictness?
        const entity: SnipsEntity = {
          data: [],
          matching_strictness: 1.0,
          use_synonyms: false,
          automatically_extensible: true,
        };

        if (inputType.values) {
          for (const value of inputType.values) {
            const entityData: SnipsEntityData = { value: value.value, synonyms: [] };

            if (value.synonyms) {
              entity.use_synonyms = true;
              for (const synonym of value.synonyms) {
                entityData.synonyms.push(synonym);
              }
            }

            entity.data.push(entityData);
          }
        }

        snipsModel.entities[inputType.name] = entity;
      }
    }

    return [
      {
        path: [''],
        content: snipsModel,
      },
    ];
  }

  static toJovoModel(inputFiles: NativeSnipsInformation[]): JovoModelData {
    const jovoModel: JovoModelData = { invocation: '', intents: [], inputTypes: [] };
    const snipsModel: SnipsModel = inputFiles.pop()!.content;

    for (const [intentKey, intentData] of Object.entries(snipsModel.intents)) {
      const intent: Intent = { name: intentKey, phrases: [] };

      for (const utterance of intentData.utterances) {
        const phrase: string = utterance.data.reduce((phrase: string, data: SnipsUtteranceData) => {
          let appended: string = data.text;
          // Translate entity into Jovo input
          if (data.slot_name && data.entity) {
            appended = `{${data.slot_name}}`;

            if (!intent.inputs) {
              intent.inputs = [];
            }

            intent.inputs.push({ name: data.slot_name, type: { snips: data.entity } });
          }

          return `${phrase}${appended}`;
        }, '');
        intent.phrases!.push(phrase);
      }
      jovoModel.intents!.push(intent);
    }

    for (const [entityKey, entityData] of Object.entries(snipsModel.entities)) {
      // Ignore built-in entities
      if (entityKey.startsWith('snips/')) {
        continue;
      }
      const inputType: InputType = { name: entityKey, values: [] };

      for (const data of entityData.data) {
        const inputValue: InputTypeValue = { value: data.value, synonyms: data.synonyms };
        inputType.values!.push(inputValue);
      }

      if (!jovoModel.inputTypes) {
        jovoModel.inputTypes = [];
      }

      jovoModel.inputTypes.push(inputType);
    }

    return jovoModel;
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelAlexaValidator;
  }
}
