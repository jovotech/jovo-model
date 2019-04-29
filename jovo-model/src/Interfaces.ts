
export interface InputType {
    name: string;
    values?: InputTypeValue[];
}


export interface InputTypeValue {
    value: string;
    id?: string;
    synonyms?: string[];
}


export interface Intent {
    name: string;
    phrases?: string[];
    samples?: string[];
    inputs?: IntentInput[];
}


export interface IntentInput {
    name: string;
    text?: string;
    type?: string | {
        [key: string]: string;
    };
}


export interface JovoModelData {
    inputTypes?: InputType[];
    intents?: Intent[];
    invocation: string;
}


export interface RunValidator {
    path: string;
    types: string[];
}


export interface ExternalModelFile {
    path: string[];
    content: any; // tslint:disable-line:no-any
}
