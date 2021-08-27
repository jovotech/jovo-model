export interface EntityType {
  values?: EntityTypeValue[];
}

export interface EntityTypeValue {
  value: string;
  id?: string;
  key?: string;
  synonyms?: string[];
}

export interface InputType {
  name: string;
  values?: InputTypeValue[];
}

export interface InputTypeValue {
  value: string;
  id?: string;
  key?: string;
  synonyms?: string[];
}

export interface Intent {
  phrases?: string[];
  samples?: string[];
  entities?: Record<string, IntentEntity>;
}

export interface IntentV3 {
  name: string;
  phrases?: string[];
  samples?: string[];
  inputs?: IntentInput[];
}

export interface IntentEntity {
  text?: string;
  type?: IntentEntityType;
}

export interface IntentInput {
  name: string;
  text?: string;
  type?: string | Record<string, string>;
}

export type IntentEntityType = string | IntentEntityTypeObject;
export type IntentEntityTypeObject = Record<string, string>;

export interface InvocationObject {
  [key: string]: string;
}

export interface JovoModelData {
  version?: `${number}.${number}`;
  entityTypes?: Record<string, EntityType>;
  intents?: Record<string, Intent>;
  invocation: string | InvocationObject;
}

export interface JovoModelDataV3 {
  inputTypes?: InputType[];
  intents?: IntentV3[];
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
