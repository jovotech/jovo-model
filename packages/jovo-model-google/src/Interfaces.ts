import { JovoModelData } from 'jovo-model';

export interface GoogleActionIntent {
  trainingPhrases: string[];
  parameters?: Array<{ name: string; type: { name: string } }>;
}

export interface GoogleActionInput {
  synonym: {
    entities: { [key: string]: { synonyms: string[] } };
    matchType?: string;
  };
}

export interface JovoModelGoogleActionData extends JovoModelData {}
