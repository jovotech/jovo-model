import { v4 as uuid } from 'uuid';
import { DialogflowLMEntity } from './Interfaces';

export const DIALOGFLOW_LM_ENTITY: DialogflowLMEntity = {
  id: uuid(),
  name: '',
  isOverridable: true,
  isEnum: false,
  automatedExpansion: false,
  isRegexp: false,
  allowFuzzyExtraction: false,
};
