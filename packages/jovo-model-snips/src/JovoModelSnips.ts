import {
  EntityType,
  EntityTypeValue,
  Intent,
  IntentEntity,
  JovoModel,
  JovoModelData,
  NativeFileInformation,
} from 'jovo-model';
import tv4 from 'tv4';
import * as JovoModelSnipsValidator from '../validators/JovoModelSnipsData.json';
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

          const entityRegex: RegExp = /{([^\s\d]*)}/g;

          for (;;) {
            const match: RegExpExecArray | null = entityRegex.exec(phrase);

            if (!match) {
              break;
            }

            const matchedString: string = match[0];
            const matchedEntity: string = match[1];

            if (!intent.entities) {
              throw new Error(
                `${errorPrefix} No entities defined for intent "${intent.name}", but "${matchedEntity}" found.`,
              );
            }

            // For built-in entities, no entity samples are provided, use the slot name instead
            let entitySample: string = matchedEntity;
            let intentEntityType: string | undefined;

            // Try to get the entity type for the matched entity to insert random samples
            for (const entity of intent.entities) {
              if (matchedEntity !== entity.name) {
                continue;
              }

              if (!entity.type) {
                throw new Error(
                  `${errorPrefix} No entity type found for entity "${matchedEntity}".`,
                );
              }

              if (typeof entity.type === 'object') {
                intentEntityType = entity.type.snips;
              } else {
                intentEntityType = entity.type;
              }

              // Catch built-in entities
              if (intentEntityType.startsWith('snips/')) {
                // Add entity to model and exit
                snipsModel.entities[intentEntityType] = {};
                break;
              }

              if (!model.entityTypes) {
                throw new Error(`${errorPrefix} No entityTypes defined.`);
              }

              for (const entityType of model.entityTypes) {
                if (entityType.name !== intentEntityType) {
                  continue;
                }

                if (!entityType.values) {
                  throw new Error(
                    `${errorPrefix} No entity values found for entityType "${matchedEntity}".`,
                  );
                }

                // Get a random sample entity value to improve model accuracy
                const randomIndex: number = Math.round(
                  Math.random() * (entityType.values.length - 1),
                );
                entitySample = entityType.values[randomIndex]?.value || entitySample;
              }
            }

            if (!intentEntityType) {
              throw new Error(`${errorPrefix} No entity type found for entity "${matchedEntity}".`);
            }

            // For every entity defined in an intent phrase, this takes the last data entry,
            // parses the entity and pushes the rest to the end of the array until no more entities are found.
            const lastUtteranceData: SnipsUtteranceData = snipsUtterance.data.pop()!;
            // Capture everything before and after the current entity
            const regex: RegExp = new RegExp(`(.*)${matchedString}(.*)`);
            // @ts-ignore
            const [, prefix, suffix] = regex.exec(lastUtteranceData.text);
            // Push preceding text back
            if (prefix && prefix.length) {
              snipsUtterance.data.push({ text: prefix });
            }

            // Parse entity and push it to utterance data
            snipsUtterance.data.push({
              text: entitySample,
              // @ts-ignore
              entity: intentEntityType,
              slot_name: matchedEntity,
            });

            // Add the rest of the phrase to the data array. If another entity is found,
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

    if (model.entityTypes) {
      for (const entityType of model.entityTypes) {
        // TODO: Customize automatically_extensible & matching_strictness?
        const entity: SnipsEntity = {
          data: [],
          matching_strictness: 1.0,
          use_synonyms: false,
          automatically_extensible: true,
        };

        if (entityType.values) {
          for (const value of entityType.values) {
            const entityData: SnipsEntityData = { value: value.value, synonyms: [] };

            if (value.synonyms) {
              entity.use_synonyms = true;
              for (const synonym of value.synonyms) {
                entityData.synonyms.push(synonym);
              }
            }

            entity.data!.push(entityData);
          }
        }

        snipsModel.entities[entityType.name] = entity;
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
    const jovoModel: JovoModelData = { version: '4.0', invocation: '', intents: [], entityTypes: [] };
    const snipsModel: SnipsModel = inputFiles.pop()!.content;

    for (const [intentKey, intentData] of Object.entries(snipsModel.intents)) {
      const intent: Intent = { name: intentKey, phrases: [] };

      for (const utterance of intentData.utterances) {
        const phrase: string = utterance.data.reduce((phrase: string, data: SnipsUtteranceData) => {
          let appended: string = data.text;
          // Translate entity into Jovo entity
          if (data.slot_name && data.entity) {
            appended = `{${data.slot_name}}`;

            if (!intent.entities) {
              intent.entities = [];
            }

            // Only add entity if not present already
            if (!intent.entities.find((entity: IntentEntity) => entity.name === data.slot_name)) {
              intent.entities.push({ name: data.slot_name, type: { snips: data.entity } });
            }
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
      const entityType: EntityType = { name: entityKey, values: [] };

      for (const data of entityData.data!) {
        const entityValue: EntityTypeValue = { value: data.value, synonyms: data.synonyms };
        entityType.values!.push(entityValue);
      }

      if (!jovoModel.entityTypes) {
        jovoModel.entityTypes = [];
      }

      jovoModel.entityTypes.push(entityType);
    }

    return jovoModel;
  }

  static getValidator(): tv4.JsonSchema {
    return JovoModelSnipsValidator;
  }
}
