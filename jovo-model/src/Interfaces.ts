export interface EntityType {
  name: string;
  values?: EntityTypeValue[];
}

export interface EntityTypeValue {
  value: string;
  id?: string;
  key?: string;
  synonyms?: string[];
}

export interface Intent {
  name: string;
  phrases?: string[];
  samples?: string[];
  entities?: IntentEntity[];
}

export interface IntentEntity {
  name: string;
  text?: string;
  type?: IntentEntityType;
}

export type IntentEntityType = string | IntentEntityTypeObject;
export type IntentEntityTypeObject = Record<string, string>;

export interface InvocationObject {
  [key: string]: string;
}

export interface JovoModelData {
  version: number;
  entityTypes?: EntityType[];
  intents?: Intent[];
  invocation: string | InvocationObject;
}

export interface RunValidator {
  path: string;
  types: string[];
}

export interface NativeFileInformation {
  path: string[];
  content: any; // tslint:disable-line:no-any
}
