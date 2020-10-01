import { JovoModelData } from 'jovo-model';

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

export interface JovoModelGoogleActionData extends JovoModelData {
  google?: {
    custom?: {
      global?: GoogleActionLanguageModelProperty;
      intents?: GoogleActionLanguageModelProperty;
      scenes?: GoogleActionLanguageModelProperty;
      types?: GoogleActionLanguageModelProperty;
    };
  };
}

export interface GoogleActionLanguageModelProperty {
  [key: string]: object;
}
