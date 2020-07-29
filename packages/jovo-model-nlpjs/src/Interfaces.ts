import { JovoModelData } from 'jovo-model';

// Jovo Model Rasa Format

export interface JovoModelNlpjsData extends JovoModelData {}

export interface NlpjsData {
  id?: number;
  intent: string;
  utterances?: string[];
  answers?: string[];
  tests?: string[];
}

export interface NlpjsEntity {
  options: Record<string, string[]>;
}

// Native NpJs JSON Format

export interface NlpjsModelFile {
  name: string;
  locale: string;
  data: NlpjsData[];
  entities?: Record<string, NlpjsEntity>;
}
