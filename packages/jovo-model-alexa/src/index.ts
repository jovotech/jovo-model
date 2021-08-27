import { AlexaLMIntent, AlexaModel } from './Interfaces';

export * from './Interfaces';
export * from './JovoModelAlexa';

declare module '@jovotech/model' {
  interface IntentEntity {
    alexa?: {
      samples: string[];
    };
  }

  interface IntentInput {
    alexa?: {
      samples: string[];
    };
  }

  interface EntityType {
    alexa?: string;
  }

  interface InputType {
    alexa?: string;
  }

  interface Intent {
    alexa?: AlexaLMIntent;
  }

  interface IntentV3 {
    alexa?: AlexaLMIntent;
  }

  interface JovoModelAlexaData {
    invocation: string | { alexaSkill: string };
    alexa?: AlexaModel;
  }
}
