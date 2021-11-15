export interface AlexaLMTypeObject {
  name: string;
  values: AlexaLMTypeValue[];
}

export interface AlexaLMTypeValue {
  id?: string;
  name: {
    value: string;
    synonyms?: string[];
  };
}

export interface AlexaLMInputObject {
  name: string;
  type:
    | string
    | {
        [key: string]: string;
      };
  alexaInputObjtype?: string;
}

export interface AlexaLMIntent {
  name: string;
  slots?: AlexaLMInputObject[];
  samples?: string[];
}

export interface AlexaModel {
  interactionModel: {
    languageModel: {
      invocationName?: string;
      intents?: AlexaLMIntent[];
      types?: AlexaLMTypeObject[];
    };
  };
}
