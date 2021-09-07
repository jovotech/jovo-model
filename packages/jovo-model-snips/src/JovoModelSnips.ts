import {
  EntityType,
  EntityTypeValue,
  Intent,
  JovoModel,
  JovoModelData,
  JovoModelDataV3,
  JovoModelHelper,
  NativeFileInformation,
} from '@jovotech/model';
import tv4 from 'tv4';
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

  static fromJovoModel(
    model: JovoModelData | JovoModelDataV3,
    locale: string,
  ): NativeFileInformation[] {
    const errorPrefix: string = `/models/${locale}.json -`;
    const snipsModel: SnipsModel = {
      language: locale,
      intents: {},
      entities: {},
    };

    if (model.intents) {
      const intents = JovoModelHelper.getIntents(model);
      for (const [intentKey, intentData] of Object.entries(intents)) {
        const snipsIntent: SnipsIntent = { utterances: [] };

        for (const phrase of intentData.phrases || []) {
          const snipsUtterance: SnipsUtterance = { data: [{ text: phrase }] };

          const entityRegex: RegExp = /{([^\s\d]*)}/g;

          for (;;) {
            const match: RegExpExecArray | null = entityRegex.exec(phrase);

            if (!match) {
              break;
            }

            const matchedString: string = match[0];
            const matchedEntity: string = match[1];

            if (!JovoModelHelper.hasEntities(model, intentKey)) {
              throw new Error(
                `${errorPrefix} No entities defined for intent "${intentKey}", but "${matchedEntity}" found.`,
              );
            }

            // For built-in entities, no entity samples are provided, use the slot name instead
            let entitySample: string = matchedEntity;
            let intentEntityType: string | undefined;
            const entities = JovoModelHelper.getEntities(model, intentKey);

            // Try to get the entity type for the matched entity to insert random samples
            for (const [entityKey, entityData] of Object.entries(entities)) {
              if (matchedEntity !== entityKey) {
                continue;
              }

              if (!entityData.type) {
                throw new Error(
                  `${errorPrefix} No entity type found for entity "${matchedEntity}".`,
                );
              }

              if (typeof entityData.type === 'object') {
                intentEntityType = entityData.type.snips;
              } else {
                intentEntityType = entityData.type;
              }

              // Catch built-in entities
              if (intentEntityType.startsWith('snips/')) {
                // Add entity to model and exit
                snipsModel.entities[intentEntityType] = {};
                break;
              }

              if (!JovoModelHelper.hasEntityTypes(model)) {
                throw new Error(`${errorPrefix} No entityTypes defined.`);
              }

              const entityTypes = JovoModelHelper.getEntityTypes(model);
              for (const [entityTypeKey, entityTypeData] of Object.entries(entityTypes)) {
                if (entityTypeKey !== intentEntityType) {
                  continue;
                }

                if (!entityTypeData.values) {
                  throw new Error(
                    `${errorPrefix} No entity values found for entityType "${matchedEntity}".`,
                  );
                }

                // Get a random sample entity value to improve model accuracy
                const randomIndex: number = Math.round(
                  Math.random() * (entityTypeData.values.length - 1),
                );
                entitySample = entityTypeData.values[randomIndex]?.value || entitySample;
              }
            }

            if (!intentEntityType) {
              throw new Error(
                `${errorPrefix} Please add a "snips" property for entity "${matchedEntity}"`,
              );
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

        snipsModel.intents[intentKey] = snipsIntent;
      }
    }

    if (JovoModelHelper.hasEntityTypes(model)) {
      const entityTypes = JovoModelHelper.getEntityTypes(model);
      for (const [entityTypeKey, entityTypeData] of Object.entries(entityTypes)) {
        // TODO: Customize automatically_extensible & matching_strictness?
        const entity: SnipsEntity = {
          data: [],
          matching_strictness: 1.0,
          use_synonyms: false,
          automatically_extensible: true,
        };

        if (entityTypeData.values) {
          for (const value of entityTypeData.values) {
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

        snipsModel.entities[entityTypeKey] = entity;
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
    const jovoModel: JovoModelData = {
      version: '4.0',
      invocation: '',
      intents: {},
      entityTypes: {},
    };
    const snipsModel: SnipsModel = inputFiles.pop()!.content;

    for (const [intentKey, intentData] of Object.entries(snipsModel.intents)) {
      const intent: Intent = { phrases: [] };

      for (const utterance of intentData.utterances) {
        const phrase: string = utterance.data.reduce((phrase: string, data: SnipsUtteranceData) => {
          let appended: string = data.text;
          // Translate entity into Jovo entity
          if (data.slot_name && data.entity) {
            appended = `{${data.slot_name}}`;

            if (!intent.entities) {
              intent.entities = {};
            }

            // Only add entity if not present already
            if (!intent.entities[data.slot_name]) {
              intent.entities[data.slot_name] = { type: { snips: data.entity } };
            }
          }

          return `${phrase}${appended}`;
        }, '');
        intent.phrases!.push(phrase);
      }
      jovoModel.intents![intentKey] = intent;
    }

    for (const [entityKey, entityData] of Object.entries(snipsModel.entities)) {
      // Ignore built-in entities
      if (entityKey.startsWith('snips/')) {
        continue;
      }
      const entityType: EntityType = { values: [] };

      for (const data of entityData.data!) {
        const entityValue: EntityTypeValue = { value: data.value, synonyms: data.synonyms };
        entityType.values!.push(entityValue);
      }

      if (!jovoModel.entityTypes) {
        jovoModel.entityTypes = {};
      }

      jovoModel.entityTypes[entityKey] = entityType;
    }

    return jovoModel;
  }

  static getValidator(model: JovoModelData | JovoModelDataV3): tv4.JsonSchema {
    return super.getValidator(model);
  }
}
