// Native Rasa JSON Format

export interface RasaCommonExample {
  text: string;
  intent?: string;
  entities: RasaCommonExampleEntity[];
}

export interface RasaCommonExampleEntity {
  start: number;
  end: number;
  value: string;
  entity: string;
}

export interface RasaEntitySynonym {
  value: string;
  synonyms: string[];
}

export interface RasaLookupTable {
  name: string;
  elements: string | string[];
}

export interface RasaModel {
  rasa_nlu_data: RasaNluData;
}

export interface RasaNluData {
  common_examples: RasaCommonExample[];
  entity_synonyms?: RasaEntitySynonym[];
  lookup_tables?: RasaLookupTable[];
  regex_features?: RasaRegexFeature[];
}

export interface RasaRegexFeature {
  name: string;
  pattern: string;
}
