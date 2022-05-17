import {EntityTypeValue, IntentEntity, JovoModel, JovoModelData, NativeFileInformation} from "@jovotech/model";
import {
    JovoModelDataLexV2,
    LexV2BotLocale,
    LexV2Intent,
    LexV2Manifest,
    LexV2ModelExtensions,
    LexV2Slot,
    LexV2SlotType
} from "./Interfaces";
import {strip} from "jest-docblock";

function createLexV2Identifier(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return [...new Array(10).keys()].map(() => charset.charAt(Math.floor(Math.random() * charset.length))).join("");
}

type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

function stripUndefined<T>(object: T, recursive: false): Partial<T>;
// tslint:disable-next-line
function stripUndefined<T>(object: T[], recursive: false): Partial<T>[];
function stripUndefined<T>(object: T, recursive: boolean): DeepPartial<T>;
// tslint:disable-next-line
function stripUndefined<T>(object: T[], recursive: boolean): DeepPartial<T>[];
// tslint:disable-next-line
function stripUndefined<T>(object: T | T[], recursive: boolean = false): DeepPartial<T> | DeepPartial<T>[] {
    if (object === null || object === undefined) {
        return object as DeepPartial<T>;
    } else if (typeof object !== "object") {
        return object as DeepPartial<T>;
    }
    if (Array.isArray(object)) {
        const stripped = object.filter(x => x !== undefined);
        if (recursive) {
            return stripped.map(x => stripUndefined(x, recursive));
        } else {
            // tslint:disable-next-line
            return stripped as DeepPartial<T>[];
        }
    } else {
        const stripped = Object.entries(object).filter(([key, value]) => value !== undefined);

        if (recursive) {
            return Object.fromEntries(
                stripped.map(([key, value]) => [key, stripUndefined(value, recursive)])
            ) as DeepPartial<T>;
        } else {
            return Object.fromEntries(stripped) as DeepPartial<T>;
        }
    }
}

export class JovoModelLexV2 extends JovoModel {
    static MODEL_KEY = 'lexv2';

    private static *generateFiles(model: JovoModelDataLexV2, locale: string): Generator<NativeFileInformation, void, undefined> {
        const manifest: LexV2Manifest = {
            metaData: {
                schemaVersion: "1",
                resourceType: "BOT_LOCALE",
                fileFormat: "LexJson",
            }
        };
        yield {
            path: ['Manifest.json'],
            content: manifest
        };

        const extensions: LexV2ModelExtensions = model.lexv2 ?? {};

        const botName = ((model as unknown as {name: string}).name ?? 'JovoBot').replace(" ", "_");

        locale = locale.replace("-", "_");

        const botLocale: LexV2BotLocale = {
            name: locale,
            identifier: locale,
            nluConfidenceThreshold: 0.4,
            ...extensions.locale
        };
        yield {
            path: [botName, 'BotLocales', locale, 'BotLocale.json'],
            content: botLocale
        };

        for (const [entityName, entityType] of Object.entries(model.entityTypes ?? {})) {
            const slotType: LexV2SlotType = {
                name: entityName,
                identifier: createLexV2Identifier(),
                slotTypeValues: entityType.values?.map(value => (typeof value === "string" ? {
                    sampleValue: {
                        value
                    },
                } : {
                    sampleValue: {
                        value: value.value
                    },
                    synonyms: value.synonyms?.map(synonym => ({value: synonym}))
                })) ?? [],
                valueSelectionSetting: {
                    resolutionStrategy: entityType.values?.some(value => ((value as EntityTypeValue).synonyms?.length ?? 0) > 0) ? "TOP_RESOLUTION" : "ORIGINAL_VALUE",
                },
                ...(extensions.slotTypes?.[entityName])
            };

            yield {
                path: [botName, 'BotLocales', locale, 'SlotTypes', entityName, 'SlotType.json'],
                content: slotType
            };
        }

        for (const [intentName, intent] of Object.entries(model.intents ?? {})) {
            const {slots: slotExtensions, ...intentExtensions} = extensions.intents?.[intentName] ?? {};

            const lexIntent: LexV2Intent = {
                name: intentName,
                identifier: createLexV2Identifier(),
                sampleUtterances: intent.phrases?.map(sample => ({
                    utterance: sample
                })) ?? [],
                slotPriorities: Object.keys(intent.entities ?? {}).map((key, idx) => ({
                    slotName: key, priority: idx + 1
                })),
                ...intentExtensions
            };

            yield {
                path: [botName, 'BotLocales', locale, 'Intents', intentName, 'Intent.json'],
                content: lexIntent
            };

            for (const [entityName, entity] of Object.entries(intent.entities ?? {})) {
                const slotTypeName = (typeof entity.type === "string" ? entity.type : entity.type?.lex);

                if (slotTypeName === undefined) {
                    throw new Error(`Property "entity.type" must be defined for lex for entity "${entityName}" in intent "${intentName}".`);
                }

                const slot: LexV2Slot = {
                    name: entityName,
                    identifier: createLexV2Identifier(),
                    slotTypeName,
                    valueElicitationSetting: {
                        promptSpecification: {
                            maxRetries: 4,
                            messageGroupsList: [
                                {
                                    message: {
                                        plainTextMessage: {
                                            value: entity.text ?? `What should ${entityName} be?`
                                        },
                                    },
                                }
                            ],
                            allowInterrupt: true
                        },
                        slotConstraint: "Required",
                    },
                    ...(slotExtensions?.[entityName])
                };

                yield {
                    path: [botName, 'BotLocales', locale, 'Intents', intentName, 'Slots', entityName, 'Slot.json'],
                    content: slot
                };
            }
        }

        const fallbackIntent: LexV2Intent = {
            name: "FallbackIntent",
            identifier: "FALLBCKINT",
            description: "Default intent when no other intent matches",
            parentIntentSignature: "AMAZON.FallbackIntent",
            slotPriorities: []
        };

        yield {
            path: [botName, 'BotLocales', locale, 'Intents', "FallbackIntent", 'Intent.json'],
            content: fallbackIntent
        };

    }

    static fromJovoModel(model: JovoModelData, locale: string): NativeFileInformation[] {
        return [...this.generateFiles(model, locale)];
    }

    static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
        const jovoModel: JovoModelDataLexV2 = {
            invocation: '',
            version: '4.0',
            intents: {},
            entityTypes: {},
        };

        const extensions: LexV2ModelExtensions = {};

        extensions.intents = {};
        extensions.slotTypes = {};

        locale = locale.replace("-", "_");

        // Satisfy undefined checks
        if (jovoModel.intents === undefined) {
            jovoModel.intents = {};
        }
        if (jovoModel.entityTypes === undefined) {
            jovoModel.entityTypes = {};
        }

        for (const file of inputFiles) {
            // path is [bot_name, BotLocales, lang_COUNTRY, ...]
            if (file.path.length <= 3) {
                continue;
            }
            if (file.path[1] !== "BotLocales") {
                continue;
            }
            if (file.path[2] !== locale) {
                continue;
            }
            switch (file.path[3]) {
                case "BotLocale.json":
                    const locale: LexV2BotLocale = file.content;
                    const {identifier, ...rest} = locale as LexV2BotLocale;
                    extensions.locale = rest;
                    break;

                case "Intents": {
                    if (file.path.length <= 5) {
                        continue;
                    }
                    const intentName = file.path[4];

                    if (intentName === "FallbackIntent") {
                        continue;
                    }

                    switch (file.path[5]) {
                        case "Intent.json": {
                            const intent: LexV2Intent = file.content;
                            const {name, sampleUtterances, ...rest} = intent;
                            jovoModel.intents[intentName] = {
                                ...jovoModel.intents[intentName],
                                phrases: sampleUtterances?.map(utterance => utterance.utterance) ?? [],
                            };

                            if (Object.keys(rest).length > 0) {
                                extensions.intents[intentName] = {...extensions.intents[intentName], ...rest};
                            }

                            break;
                        }

                        case "Slots": {
                            if (file.path.length <= 7 || file.path[7] !== 'Slot.json') {
                                continue;
                            }
                            const slotName = file.path[6];
                            const {name, slotTypeName, ...rest} = file.content as LexV2Slot;
                            const entity: IntentEntity = {
                                type: slotTypeName,
                            };
                            const existingIntent = jovoModel.intents[intentName] ?? {};
                            jovoModel.intents[intentName] = {
                                ...existingIntent,
                                entities: {
                                    ...existingIntent?.entities,
                                    [slotName]: entity
                                }
                            };

                            if (Object.keys(rest).length > 0) {
                                extensions.intents[intentName] = {
                                    ...extensions.intents[intentName],
                                    slots: {
                                        ...extensions.intents[intentName].slots,
                                        [slotName]: rest
                                    }
                                };
                            }

                            break;
                        }

                        default:
                            break;
                    }
                    break;
                }

                case "SlotTypes": {
                    if (file.path.length <= 5 || file.path[5] !== 'SlotType.json') {
                        continue;
                    }

                    const slotName = file.path[4];
                    const {name, slotTypeValues, ...rest} = file.content as LexV2SlotType;
                    jovoModel.entityTypes[slotName] = {
                        values: slotTypeValues.map(value => ({
                            value: value.sampleValue?.value ?? '',
                            synonyms: value.synonyms?.map(synonym => synonym.value)
                        }))
                    };

                    if (Object.keys(rest).length > 0) {
                        extensions.slotTypes[slotName] = rest;
                    }

                    break;
                }

                default:
                    break;
            }
        }

        if (Object.keys(extensions.intents).length === 0) {
            delete extensions.intents;
        }
        if (Object.keys(extensions.slotTypes).length === 0) {
            delete extensions.slotTypes;
        }

        jovoModel.lexv2 = extensions;
        return stripUndefined(jovoModel, true) as unknown as JovoModelData;
    }
}
