import {IntentEntity, JovoModel, JovoModelData, NativeFileInformation} from "@jovotech/model";
import {JovoModelDataLexV2, LexV2BotLocale, LexV2Intent, LexV2Manifest, LexV2Slot, LexV2SlotType} from "./Interfaces";

function createLexV2Identifier(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return [...new Array(10).keys()].map(() => charset.charAt(Math.floor(Math.random() * charset.length))).join("");
}

export class JovoModelLexV2 extends JovoModel {
    static MODEL_KEY = 'lexv2';

    private static *generateFiles(model: JovoModelDataLexV2, locale: string): Generator<NativeFileInformation, void, undefined> {
        console.log("Running generateFiles");
        const manifest: LexV2Manifest = {
            metaData: {
                schemaVersion: "1",
                fileFormat: "LexJson",
                resourceType: "BOT_LOCALE",
            }
        };
        yield {
            path: ['manifest.json'],
            content: manifest
        };

        const botName = (model as unknown as {name: string}).name ?? 'JovoBot';
        const botVersion = (model as unknown as {version: string}).version ?? '1';

        locale = locale.replace("-", "_");

        const botLocale: LexV2BotLocale = {
            name: "English (US)", // TODO: Revert if possible
            identifier: locale,
            nluConfidenceThreshold: model.lexv2?.nluConfidenceThreshold ?? 0.4,
            voiceSettings: {
                engine: model.lexv2?.voiceSettings?.engine ?? 'neural',
                voiceId: model.lexv2?.voiceSettings?.voiceId ?? 'Ivy'
            },
            version: null,
            description: null
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
                    synonyms: null
                } : {
                    sampleValue: {
                        value: value.value
                    },
                    synonyms: value.synonyms?.map(synonym => ({value: synonym})) ?? null
                })) ?? [],
                parentSlotTypeSignature: null,
                description: null,
                valueSelectionSetting: {
                    regexFilter: null,
                    resolutionStrategy: "ORIGINAL_VALUE",
                }
            };

            yield {
                path: [botName, 'BotLocales', locale, 'SlotTypes', entityName, 'SlotType.json'],
                content: slotType
            };
        }

        for (const [intentName, intent] of Object.entries(model.intents ?? {})) {
            const lexIntent: LexV2Intent = {
                name: intentName,
                identifier: createLexV2Identifier(),
                sampleUtterances: intent.phrases?.map(sample => ({
                    utterance: sample
                })) ?? [],
                intentConfirmationSetting: null,
                description: null,
                inputContexts: null,
                parentIntentSignature: null,
                dialogCodeHook: null,
                outputContexts: null,
                fulfillmentCodeHook: null,
                intentClosingSetting: null,
                kendraConfiguration: null,
                slotPriorities: Object.keys(intent.entities ?? {}).map((key, idx) => ({
                    slotName: key, priority: idx + 1
                })),
            };

            yield {
                path: [botName, 'BotLocales', locale, 'Intents', intentName, 'Intent.json'],
                content: lexIntent
            };

            for (const [entityName, entity] of Object.entries(intent.entities ?? {})) {
                const slot: LexV2Slot = {
                    name: entityName,
                    identifier: createLexV2Identifier(),
                    slotTypeName: (entity.type as Record<string, string>).lex ?? entity.type,
                    valueElicitationSetting: {
                        promptSpecification: {
                            maxRetries: 4,
                            messageGroupsList: [
                                {
                                    message: {
                                        plainTextMessage: {
                                            value: entity.text ?? `What should ${entityName} be?`
                                        },
                                        ssmlMessage: null,
                                        customPayload: null,
                                        imageResponseCard: null
                                    },
                                    variations: null
                                }
                            ],
                            allowInterrupt: true
                        },
                        slotConstraint: "Required",
                        sampleUtterances: null,
                        defaultValueSpecification: null,
                        waitAndContinueSpecification: null
                    },
                    multipleValuesSetting: null,
                    description: null,
                    obfuscationSetting: null,
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
            sampleUtterances: null,
            intentConfirmationSetting: null,
            intentClosingSetting: null,
            inputContexts: null,
            outputContexts: null,
            kendraConfiguration: null,
            dialogCodeHook: null,
            fulfillmentCodeHook: null,
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
        const jovoModel: JovoModelData = {
            invocation: '',
            version: '4.0',
            intents: {},
            entityTypes: {},
        };

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
                    break;

                case "Intents": {
                    if (file.path.length <= 5) {
                        continue;
                    }
                    const intentName = file.path[4];
                    switch (file.path[5]) {
                        case "Intent.json": {
                            const intent: LexV2Intent = file.content;
                            jovoModel.intents[intentName] = {
                                ...jovoModel.intents[intentName],
                                phrases: intent.sampleUtterances?.map(utterance => utterance.utterance) ?? [],
                            };
                            break;
                        }

                        case "Slots": {
                            if (file.path.length <= 7 || file.path[7] !== 'Slot.json') {
                                continue;
                            }
                            const slotName = file.path[6];
                            const entity: IntentEntity = {
                                type: (file.content as LexV2Slot).slotTypeName,
                            };
                            const existingIntent = jovoModel.intents[intentName] ?? {};
                            jovoModel.intents[intentName] = {
                                ...existingIntent,
                                entities: {
                                    ...existingIntent?.entities,
                                    [slotName]: entity
                                }
                            };
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
                    const slotType: LexV2SlotType = file.content;
                    jovoModel.entityTypes[slotName] = {
                        values: slotType.slotTypeValues.map(value => ({
                            value: value.sampleValue?.value ?? '',
                            synonyms: value.synonyms?.map(synonym => synonym.value)
                        }))
                    };
                    break;
                }

                default:
                    break;
            }
        }

        return jovoModel;
    }
}
