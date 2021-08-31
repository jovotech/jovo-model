import { DialogflowLMInputObject, DialogflowModel } from './utils';

export * from './utils';
export * from './JovoModelDialogflow';

declare module '@jovotech/model' {
  interface JovoModelData {
    dialogflow?: DialogflowModel;
  }

  interface Intent {
    dialogflow?: DialogflowLMInputObject;
  }

  interface IntentV3 {
    dialogflow?: DialogflowLMInputObject;
  }

  interface IntentEntity {
    dialogflow?: string | object;
  }

  interface IntentInput {
    dialogflow?: string | object;
  }

  interface EntityType {
    dialogflow?: string | object;
  }

  interface InputType {
    dialogflow?: string | object;
  }
}
