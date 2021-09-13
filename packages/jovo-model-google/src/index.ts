import {GoogleActionLanguageModelProperty} from './Interfaces';

export * from './JovoModelGoogle';

declare module '@jovotech/model' {
  interface InvocationObject {
    googleAssistant: string;
  }

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
