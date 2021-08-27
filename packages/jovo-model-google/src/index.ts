import {GoogleActionLanguageModelProperty} from './Interfaces';

export * from './JovoModelGoogle';

declare module '@jovotech/model/dist/src/Interfaces' {
  interface JovoModelData {
    googleAssistant?: {
      custom?: {
        global?: GoogleActionLanguageModelProperty;
        intents?: GoogleActionLanguageModelProperty;
        scenes?: GoogleActionLanguageModelProperty;
        types?: GoogleActionLanguageModelProperty;
      };
    };
  }
}
