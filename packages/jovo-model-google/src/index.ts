import { GoogleActionIntent, GoogleActionLanguageModelProperty } from './Interfaces';

export * from './JovoModelGoogle';

declare module '@jovotech/model' {
  interface InvocationObject {
    googleAssistant: string;
  }

  interface Intent {
    googleAssistant?: Record<string, GoogleActionIntent>;
  }

  interface IntentV3 {
    googleAssistant?: Record<string, GoogleActionIntent>;
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
