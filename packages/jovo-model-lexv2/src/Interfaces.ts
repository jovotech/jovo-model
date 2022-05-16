import {JovoModelData} from "@jovotech/model";

export interface LexV2CustomPayload {
    value: string | null;
}

export interface LexV2Button {
    text: string;
    value: string;
}

export interface LexV2ImageResponseCard {
    buttons: LexV2Button[] | null;
    imageUrl: string | null;
    subtitle: string | null;
    title: string;
}

export interface LexV2PlainTextMessage {
    value: string;
}

export interface LexV2SSMLMessage {
    value: string;
}

export interface LexV2Message {
    customPayload: LexV2CustomPayload | null;
    imageResponseCard: LexV2ImageResponseCard | null;
    plainTextMessage: LexV2PlainTextMessage | null;
    ssmlMessage: LexV2SSMLMessage | null;
}

export interface LexV2MessageGroup {
    message: LexV2Message;
    variations: LexV2Message[] | null;
}

export interface LexV2FulfillmentStartResponseSpecification {
    allowInterrupt: boolean | null;
    delayInSecond: number;
    messageGroups: LexV2MessageGroup[];
}

export interface LexV2FulfillmentUpdateResponseSpecification {
    allowInterrupt: boolean | null;
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
    allowInterrupt: boolean | null;
    messageGroups: LexV2MessageGroup[];
}

export interface LexV2PostFulfillmentStatusSpecification {
    failureResponse: LexV2ResponseSpecification | null;
    successResponse: LexV2ResponseSpecification | null;
    timeoutResponse: LexV2ResponseSpecification | null;
}

export interface LexV2FulfillmentCodeHookSettings {
    enabled: boolean;
    fulfillmentUpdatesSpecification: LexV2FulfillmentUpdatesSpecification | null;
    postFulfillmentStatusSpecification: LexV2PostFulfillmentStatusSpecification | null;
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
    active: boolean | null;
    closingResponse: LexV2ResponseSpecification;
}

export interface LexV2PromptSpecification {
    allowInterrupt: boolean | null;
    maxRetries: number;
    messageGroupsList: LexV2MessageGroup[];
}

export interface LexV2IntentConfirmationSetting {
    active: boolean | null;
    declinationResponse: LexV2ResponseSpecification | null;
    promptSpecification: LexV2PromptSpecification | null;
}

export interface LexV2KendraConfiguration {
    kendraIndex: string;
    queryFilterString: string | null;
    queryFilterStringEnabled: boolean | null;
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
    allowInterrupt: boolean | null;
    frequencyInSeconds: number;
    messageGroups: LexV2MessageGroup[];
    timeoutInSeconds: number;
}

export interface LexV2WaitAndContinueSpecification {
    active: boolean | null;
    continueResponse: LexV2ResponseSpecification | null;
    stillWaitingResponse: LexV2StillWaitingResponseSpecification | null;
    waitingResponse: LexV2ResponseSpecification | null;
}

export interface LexV2SlotValueElicitationSetting {
    defaultValueSpecification: LexV2SlotDefaultValueSpecification | null;
    promptSpecification: LexV2PromptSpecification | null;
    sampleUtterances: LexV2SampleUtterance[] | null;
    slotConstraint: "Required" | "Optional";
    waitAndContinueSpecification: LexV2WaitAndContinueSpecification | null;
}

export interface LexV2GrammarSlotTypeSource {
    kmsKeyArn: string | null;
    s3BucketName: string;
    s3ObjectKey: string;
}

export interface LexV2GrammarSlotTypeSetting {
    source: LexV2GrammarSlotTypeSource | null;
}

export interface LexV2ExternalSourceSetting {
    grammarSlotTypeSetting: LexV2GrammarSlotTypeSetting | null;
}

export interface LexV2SampleValue {
    value: string;
}

export interface LexV2SlotTypeValue {
    sampleValue: LexV2SampleValue | null;
    synonyms: LexV2SampleValue[] | null;
}

export interface LexV2AdvancedRecognitionSetting {
    audioRecognitionStrategy: "UseSlotValuesAsCustomVocabulary" | null;
}

export interface LexV2SlotValueRegexFilter {
    pattern: string;
}

export interface LexV2SlotValueSelectionSetting {
    advancedRecognitionSetting?: LexV2AdvancedRecognitionSetting;
    regexFilter: LexV2SlotValueRegexFilter | null;
    resolutionStrategy: "ORIGINAL_VALUE" | "TOP_RESOLUTION";
}

export interface LexV2CustomVocabularyItem {
    weight: number | null;
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
    identifier: string | null;
    version: string;
    description: string | null;
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
    version: string | null;
    description: string | null;
    voiceSettings: LexV2Voice;
    nluConfidenceThreshold: number;
}

export interface LexV2SlotPriority {
    priority: number;
    slotName: string;
}

export interface LexV2Intent {
    description: string | null;
    dialogCodeHook: {
        enabled: boolean;
    } | null;
    fulfillmentCodeHook: LexV2FulfillmentCodeHookSettings | null;
    inputContexts: LexV2InputContext[] | null;
    identifier: string | null;
    intentClosingSetting: LexV2IntentClosingSetting | null;
    intentConfirmationSetting: LexV2IntentConfirmationSetting | null;
    name: string;
    kendraConfiguration: LexV2KendraConfiguration | null;
    outputContexts: LexV2OutputContext[] | null;
    parentIntentSignature: string | null;
    sampleUtterances: LexV2SampleUtterance[] | null;
    slotPriorities: LexV2SlotPriority[] | null;
}

export interface LexV2Slot {
    name: string;
    identifier: string | null;
    description: string | null;
    multipleValuesSetting: {
        allowMutlipleValues: boolean;
    } | null;
    obfuscationSetting: LexV2ObfuscationSetting | null;
    slotTypeName: string;
    valueElicitationSetting: LexV2SlotValueElicitationSetting;
}

export interface LexV2SlotType {
    name: string;
    identifier: string;
    description: string | null;
    externalSourceSetting?: LexV2ExternalSourceSetting;
    parentSlotTypeSignature: "AMAZON.AlphaNumeric" | null;
    slotTypeValues: LexV2SlotTypeValue[];
    valueSelectionSetting: LexV2SlotValueSelectionSetting | null;
}

export interface LexV2CustomVocabulary {
    customVocabularyItems: LexV2CustomVocabularyItem[];
}

export interface LexV2ModelExtensions {
    nluConfidenceThreshold: number | null;
    voiceSettings: LexV2Voice | null;
}

export interface JovoModelDataLexV2 extends JovoModelData {
    lexv2?: LexV2ModelExtensions;
}
