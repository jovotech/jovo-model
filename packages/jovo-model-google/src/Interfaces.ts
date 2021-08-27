export interface GoogleActionParameter {
  name: string;
  type: {
    name: string;
  };
}

export interface GoogleActionIntent {
  trainingPhrases: string[];
  parameters?: GoogleActionParameter[];
}

export interface GoogleActionEntities {
  [key: string]: {
    synonyms: string[];
  };
}

export interface GoogleActionInput {
  synonym: {
    entities: GoogleActionEntities;
    matchType?: string;
  };
}

export interface GoogleActionLanguageModelProperty {
  [key: string]: object;
}
