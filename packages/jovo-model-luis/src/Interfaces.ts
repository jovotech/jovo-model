import {
    JovoModelData,
} from 'jovo-model';


// Jovo Model Luis Format

export interface JovoModelLuisData extends JovoModelData {
}



// Native Luis JSON Format


export interface LuisModelIntent {
    name: string;
    inherits?: {
        domain_name: string;
        model_name: string;
    };
}

export interface LuisModelClosedSubList {
    canonicalForm: string;
    list?: string[];
}

export interface LuisModelClosedList {
    name: string;
    subLists?: LuisModelClosedSubList[];
}

export interface LuisModelComposite {
    name: string;
    children: string[];
    roles: string[];
}

export interface LuisModelEntity {
    name: string;
    children?: string[];
}

export interface LuisModelModelFeatures {
    name: string;
    mode: boolean;
    words: string;
    activated: boolean;
}

export interface LuisModelUtteranceEntity {
    entity: string;
    startPos: number;
    endPos: number;
}

export interface LuisModelUtterances {
    text: string;
    intent: string;
    entities: LuisModelUtteranceEntity[];
}

export interface LuisModelPattern {
    pattern: string;
    intent: string;
}

export interface LuisModelPatternAnyEntity {
    name: string;
    explicitList: string[];
    roles: string[];
}

export interface LuisModelPrebuiltEntity {
    name: string;
    roles: string[];
}

export interface LuisModelRegexEntity {
    name: string;
    regexPattern: string;
    roles: string[];
}

export interface LuisModelFile {
    luis_schema_version: string;
    versionId: string;
    name: string;
    desc: string;
    culture: string;
    tokenizerVersion?: string;
    intents: LuisModelIntent[];
    entities: LuisModelEntity[];
    composites: LuisModelComposite[];
    closedLists: LuisModelClosedList[];
    patternAnyEntities?: LuisModelPatternAnyEntity[];
    regex_entities: LuisModelRegexEntity[];
    prebuiltEntities: LuisModelPrebuiltEntity[];
    model_features: LuisModelModelFeatures[];
    regex_features: []; // TODO: Add interface! Did not find an example yet
    patterns?: LuisModelPattern[];
    utterances: LuisModelUtterances[];
    settings?: [];
}
