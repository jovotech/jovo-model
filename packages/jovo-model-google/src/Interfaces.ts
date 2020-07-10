export interface GAIntent {
    trainingPhrases: string[];
    parameters?: { name: string; type: { name: string } }[];
}

export interface GAInput {
    synonym: {
        entities: { [key: string]: { synonyms: string[] } };
        matchType?: string;
    };
}
