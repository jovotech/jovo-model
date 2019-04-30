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

export interface LuisModelEntity {
    name: string;
    children?: string[];
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

export interface LuisModelFile {
    luis_schema_version: string;
    versionId: string;
    name?: string;
    desc?: string;
    culture: string;
    intents: LuisModelIntent[];
    entities: LuisModelEntity[];
    closedLists: LuisModelClosedList[];
    utterances: LuisModelUtterances[];
}
