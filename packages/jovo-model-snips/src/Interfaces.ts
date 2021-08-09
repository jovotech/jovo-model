import {NativeFileInformation} from "jovo-model";

export interface SnipsModel {
  language: string;
  intents: { [key: string]: SnipsIntent };
  entities: { [key: string]: SnipsEntity };
}

export interface SnipsIntent {
  utterances: SnipsUtterance[];
}

export interface SnipsUtterance {
  data: SnipsUtteranceData[];
}

export interface SnipsUtteranceData {
  text: string;
  entity?: string;
  slot_name?: string;
}

export interface SnipsEntity {
  data?: SnipsEntityData[];
  use_synonyms?: boolean;
  automatically_extensible?: boolean;
  matching_strictness?: number;
}

export interface SnipsEntityData {
  value: string;
  synonyms: string[];
}

export interface NativeSnipsInformation extends NativeFileInformation {
  content: SnipsModel;
}
