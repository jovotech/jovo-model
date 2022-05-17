import {JovoModelData} from "@jovotech/model";

export interface LexV2CustomPayload {
    value?: string;
}

export interface LexV2Button {
    text: string;
    value: string;
}

export interface LexV2ImageResponseCard {
    buttons?: LexV2Button[];
    imageUrl?: string;
    subtitle?: string;
    title: string;
}

export interface LexV2PlainTextMessage {
    value: string;
}

export interface LexV2SSMLMessage {
    value: string;
}

export interface LexV2Message {
    customPayload?: LexV2CustomPayload;
    imageResponseCard?: LexV2ImageResponseCard;
    plainTextMessage?: LexV2PlainTextMessage;
    ssmlMessage?: LexV2SSMLMessage;
}

export interface LexV2MessageGroup {
    message: LexV2Message;
    variations?: LexV2Message[];
}

export interface LexV2FulfillmentStartResponseSpecification {
    allowInterrupt?: boolean;
    delayInSecond: number;
    messageGroups: LexV2MessageGroup[];
}

export interface LexV2FulfillmentUpdateResponseSpecification {
    allowInterrupt?: boolean;
    frequencyInSeconds: number;
    messageGroups: LexV2MessageGroup[];
}

export type LexV2FulfillmentUpdatesSpecification = {active: false} | {
    active: true;
    startResponse: LexV2FulfillmentStartResponseSpecification;
    timeoutInSeconds: number;
    updateResponse: LexV2FulfillmentUpdateResponseSpecification;
};

export interface LexV2ResponseSpecification {
    allowInterrupt?: boolean;
    messageGroups: LexV2MessageGroup[];
}

export interface LexV2PostFulfillmentStatusSpecification {
    failureResponse?: LexV2ResponseSpecification;
    successResponse?: LexV2ResponseSpecification;
    timeoutResponse?: LexV2ResponseSpecification;
}

export interface LexV2FulfillmentCodeHookSettings {
    enabled: boolean;
    fulfillmentUpdatesSpecification?: LexV2FulfillmentUpdatesSpecification;
    postFulfillmentStatusSpecification?: LexV2PostFulfillmentStatusSpecification;
}

export interface LexV2InputContext {
    name: string;
}

export interface LexV2OutputContext {
    name: string;
    timeToLiveInSeconds: number;
    turnsToLive: number;
}

export interface LexV2IntentClosingSetting {
    active?: boolean;
    closingResponse: LexV2ResponseSpecification;
}

export interface LexV2PromptSpecification {
    allowInterrupt?: boolean;
    maxRetries: number;
    messageGroupsList: LexV2MessageGroup[];
}

export interface LexV2IntentConfirmationSetting {
    active?: boolean;
    declinationResponse?: LexV2ResponseSpecification;
    promptSpecification?: LexV2PromptSpecification;
}

export interface LexV2KendraConfiguration {
    kendraIndex: string;
    queryFilterString?: string;
    queryFilterStringEnabled?: boolean;
}

export interface LexV2SampleUtterance {
    utterance: string;
}

export interface LexV2ObfuscationSetting {
    obfuscationSettingType: "None" | "DefaultObfuscation";
}

export interface LexV2SlotDefaultValue {
    defaultValue: string;
}

export interface LexV2SlotDefaultValueSpecification {
    defaultValueList: LexV2SlotDefaultValue[];
}

export interface LexV2StillWaitingResponseSpecification {
    allowInterrupt?: boolean;
    frequencyInSeconds: number;
    messageGroups: LexV2MessageGroup[];
    timeoutInSeconds: number;
}

export interface LexV2WaitAndContinueSpecification {
    active?: boolean;
    continueResponse?: LexV2ResponseSpecification;
    stillWaitingResponse?: LexV2StillWaitingResponseSpecification;
    waitingResponse?: LexV2ResponseSpecification;
}

export interface LexV2SlotValueElicitationSetting {
    defaultValueSpecification?: LexV2SlotDefaultValueSpecification;
    promptSpecification?: LexV2PromptSpecification;
    sampleUtterances?: LexV2SampleUtterance[];
    slotConstraint: "Required" | "Optional";
    waitAndContinueSpecification?: LexV2WaitAndContinueSpecification;
}

export interface LexV2GrammarSlotTypeSource {
    kmsKeyArn?: string;
    s3BucketName: string;
    s3ObjectKey: string;
}

export interface LexV2GrammarSlotTypeSetting {
    source?: LexV2GrammarSlotTypeSource;
}

export interface LexV2ExternalSourceSetting {
    grammarSlotTypeSetting?: LexV2GrammarSlotTypeSetting;
}

export interface LexV2SampleValue {
    value: string;
}

export interface LexV2SlotTypeValue {
    sampleValue?: LexV2SampleValue;
    synonyms?: LexV2SampleValue[];
}

export interface LexV2AdvancedRecognitionSetting {
    audioRecognitionStrategy?: "UseSlotValuesAsCustomVocabulary";
}

export interface LexV2SlotValueRegexFilter {
    pattern: string;
}

export interface LexV2SlotValueSelectionSetting {
    advancedRecognitionSetting?: LexV2AdvancedRecognitionSetting;
    regexFilter?: LexV2SlotValueRegexFilter;
    resolutionStrategy: "ORIGINAL_VALUE" | "TOP_RESOLUTION";
}

export interface LexV2CustomVocabularyItem {
    weight?: number;
    phrase: string;
}

export interface LexV2Manifest {
    metaData: {
        schemaVersion: "1";
        fileFormat: "LexJson";
        resourceType: "BOT" | "BOT_LOCALE" | "CUSTOM_VOCABULARY";
    };
}

export interface LexV2Bot {
    name: string;
    identifier?: string;
    version: string;
    description?: string;
    dataPrivacy: {
        childDirected: boolean;
    };
    idleSessionTTLInSeconds: number;
}

export interface LexV2Voice {
    voiceId: string;
    engine: "standard" | "neural";
}

export interface LexV2BotLocale {
    name: string;
    identifier: string;
    version?: string;
    description?: string;
    voiceSettings: LexV2Voice;
    nluConfidenceThreshold: number;
}

export interface LexV2SlotPriority {
    priority: number;
    slotName: string;
}

export interface LexV2Intent {
    description?: string;
    dialogCodeHook?: {
        enabled: boolean;
    };
    fulfillmentCodeHook?: LexV2FulfillmentCodeHookSettings;
    inputContexts?: LexV2InputContext[];
    identifier?: string;
    intentClosingSetting?: LexV2IntentClosingSetting;
    intentConfirmationSetting?: LexV2IntentConfirmationSetting;
    name: string;
    kendraConfiguration?: LexV2KendraConfiguration;
    outputContexts?: LexV2OutputContext[];
    parentIntentSignature?: string;
    sampleUtterances?: LexV2SampleUtterance[];
    slotPriorities?: LexV2SlotPriority[];
}

export interface LexV2Slot {
    name: string;
    identifier?: string;
    description?: string;
    multipleValuesSetting?: {
        allowMutlipleValues: boolean;
    };
    obfuscationSetting?: LexV2ObfuscationSetting;
    slotTypeName: string;
    valueElicitationSetting: LexV2SlotValueElicitationSetting;
}

export interface LexV2SlotType {
    name: string;
    identifier: string;
    description?: string;
    externalSourceSetting?: LexV2ExternalSourceSetting;
    parentSlotTypeSignature?: "AMAZON.AlphaNumeric";
    slotTypeValues: LexV2SlotTypeValue[];
    valueSelectionSetting?: LexV2SlotValueSelectionSetting;
}

export interface LexV2CustomVocabulary {
    customVocabularyItems: LexV2CustomVocabularyItem[];
}

export type LexV2IntentExtensions = {slots?: {[slotName: string]: Partial<LexV2Slot>}} & Partial<LexV2Intent>;

export interface LexV2ModelExtensions {
    nluConfidenceThreshold?: number;
    voiceSettings?: LexV2Voice;
    intents?: {[intentName: string]: LexV2IntentExtensions};
    slotTypes?: {[slotTypeName: string]: Partial<LexV2SlotType>};
}

export interface JovoModelDataLexV2 extends JovoModelData {
    lexv2?: LexV2ModelExtensions;
}
