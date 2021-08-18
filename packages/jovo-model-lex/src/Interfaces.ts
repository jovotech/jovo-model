import { JovoModelData } from '@jovotech/model';

// Jovo Model Luis Format

export interface JovoModelLexData extends JovoModelData {}

// Native Lex JSON Format

export interface LexModelEnumerationValue {
  value: string;
  synonyms?: string[];
}

export interface LexModelMetadata {
  createdDate?: string;
  description?: string;
  importType?: string;
  importFormat?: string;
  lastUpdatedDate?: string;
  name?: string;
  schemaVersion?: string;
  version?: string;
}

export interface LexModelPrompt {
  messages: LexModelPromptMessage[];
  maxAttempts: number;
  responseCard?: string;
}

export interface LexModelPromptMessage {
  contentType: string;
  content: string;
}

export interface LexModelStatement {
  messages: LexModelStatementMessage[];
  responseCard?: string;
}

export interface LexModelStatementMessage {
  contentType: string;
  content: string;
}

// Lex Slot

export interface LexModelSlotTypeResource {
  name: string;
  version?: string;
  enumerationValues?: LexModelEnumerationValue[];
  valueSelectionStrategy?: string;
}

// Lex Intent

export interface LexModelIntentFulfillmentActivity {
  type: string;
}

export interface LexModelValueElicitationPrompt {
  messages: LexModelValueElicitationPromptMessage[];
  maxAttempts: number; // TOOD: No idea
}

export interface LexModelValueElicitationPromptMessage {
  contentType: string;
  content: string;
}

export interface LexModelIntentSlot {
  name: string;
  description?: string;
  slotConstraint?: string;
  slotType?: string;
  slotTypeVersion?: string;
  valueElicitationPrompt?: LexModelValueElicitationPrompt;
  priority?: number;
  responseCard?: string;
  sampleUtterances?: string[];
}

export interface LexModelIntentResource {
  description?: string;
  rejectionStatement?: LexModelStatement;
  name: string;
  version?: string;
  fulfillmentActivity?: LexModelIntentFulfillmentActivity;
  sampleUtterances?: string[];
  slots?: LexModelIntentSlot[];
  confirmationPrompt?: LexModelPrompt;
  slotTypes?: LexModelSlotTypeResource[];
}

// Lex Bot

export interface LexModelFileResource {
  name: string;
  version?: string;
  intents?: LexModelIntentResource[];
  slotTypes?: LexModelSlotTypeResource[];
  voiceId?: string;
  childDirected: boolean;
  locale: string;
  idleSessionTTLInSeconds?: number;
  description?: string;
  clarificationPrompt?: LexModelPrompt;
  abortStatement?: LexModelStatement;
}

export interface LexModelFile {
  metadata: LexModelMetadata;
  resource: LexModelFileResource;
}
