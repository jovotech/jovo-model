import {
    InputType,
    Intent,
    IntentInput,
    JovoModelData,
} from 'jovo-model';


export interface DialogflowLMInputObject {
    name: string;
    auto: boolean;
    webhookUsed: boolean;
    fallbackIntent?: boolean;
    responses?: DialogflowResponse[];
    events?: [
        {
            name: string;
        }
    ];
}


export interface DialogflowLMIntentData {
    text: string;
    userDefined: boolean;
    alias?: string;
    meta?: string;
}


export interface DialogflowLMIntent {
    isTemplate: boolean;
    count: number;
    data: DialogflowLMIntentData[];
}


export interface IntentDialogflow extends Intent {
    inputs?: DialogflowIntentInput[];
    dialogflow?: IntentDialogflow;
}


export interface DialogflowModel {
    intents?: [
        DialogflowLMInputObject
    ];
}


export interface DialogflowLMInputParameterObject {
    name: string;
    isList: boolean;
    value: string;
    dataType: string;
}


export interface DialogflowResponse {
    parameters: DialogflowLMInputParameterObject[];
}


export interface DialogflowLMEntity {
    isOverridable?: boolean;
    isEnum?: boolean;
    automatedExpansion?: boolean;
    isRegexp?: boolean;
    allowFuzzyExtraction?: boolean;
}


export interface DialogflowInputType extends InputType {
    dialogflow?: string | object;
}


export interface JovoModelDialogflowData extends JovoModelData {
    inputTypes?: DialogflowInputType[];
    dialogflow?: DialogflowModel;
}


export interface DialogflowIntentInput extends IntentInput {
    dialogflow?: string | object;
}
