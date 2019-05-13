import {
    IntentDialogflow,
    JovoModelDialogflowData,
    DialogflowLMEntity,
    DialogflowLMInputObject,
    DialogflowLMInputParameterObject,
    DialogflowLMIntent,
    DialogflowLMIntentData,
} from '.';

import {
    InputType,
    InputTypeValue,
    IntentInput,
    JovoModel,
    NativeFileInformation,
} from 'jovo-model';

import * as JovoModelDialogflowValidator from '../validators/JovoModelDialogflowData.json';

import * as _ from 'lodash';

const BUILTIN_PREFIX = '@sys.';


const DEFAULT_INTENT = {
    'auto': true,
    'contexts': [],
    'responses': [
        {
            'resetContexts': false,
            'affectedContexts': [],
            'parameters': [],
            'defaultResponsePlatforms': {},
            'speech': [],
        },
    ],
    'priority': 500000,
    'webhookUsed': false,
    'webhookForSlotFilling': false,
    'fallbackIntent': false,
    'events': [],
};

const DEFAULT_ENTITY = {
    'isOverridable': true,
    'isEnum': false,
    'automatedExpansion': false,
};



export class JovoModelDialogflow extends JovoModel {
    static MODEL_KEY = 'dialogflow';


    /**
     * Converts Dialogflow model files to JovoModel
     *
     * @param {NativeFileInformation[]} inputData The Dialogflow files
     * @param {string} locale The locale of the files
     * @returns {JovoModelDialogflowData}
     * @memberof JovoModelDialogflow
     */
    static toJovoModel(inputData: NativeFileInformation[], locale: string): JovoModelDialogflowData {
        const jovoModel: JovoModelDialogflowData = {
            invocation: '',
            intents: [],
            inputTypes: [],
        };

        const intentFiles = inputData.filter((file) => {
            if (file.path.length === 0) {
                return false;
            }
            if (file.path[0] !== 'intents') {
                return false;
            }

            return true;
        });

        // iterate through intent files
        let file: string;
        let fileInformation: NativeFileInformation;
        for (fileInformation of intentFiles) {
            file = fileInformation.path[1];

            // skip usersays files
            if (file.indexOf('usersays') > -1) {
                continue;
            }

            const dialogFlowIntent = fileInformation.content;

            const jovoIntent: IntentDialogflow = {
                name: dialogFlowIntent.name,
                phrases: [],
            };
            // skip default intent properties
            JovoModelDialogflow.skipDefaultIntentProps(jovoIntent, dialogFlowIntent, locale);

            // is fallback intent?
            if (dialogFlowIntent.fallbackIntent === true) {
                const fallbackIntent = jovoIntent.dialogflow;
                fallbackIntent!.name = dialogFlowIntent.name;
                _.set(jovoModel, 'dialogflow.intents', [fallbackIntent]);
                continue;
            }

            // is welcome intent?
            if (_.get(dialogFlowIntent, 'events[0].name') === 'WELCOME') {
                const welcomeIntent = jovoIntent.dialogflow;
                welcomeIntent!.name = dialogFlowIntent.name;

                if (!_.get(jovoModel, 'dialogflow.intents')) {
                    _.set(jovoModel, 'dialogflow.intents', [welcomeIntent]);
                } else {
                    // @ts-ignore
                    jovoModel.dialogflow.intents.push(welcomeIntent);
                }
                continue;
            }

            const inputs: IntentInput[] = [];
            if (dialogFlowIntent.responses) {
                for (const response of dialogFlowIntent.responses) {
                    for (const parameter of _.get(response, 'parameters', [])) {
                        const input: IntentInput = {
                            name: parameter.name,
                        };
                        if (parameter.dataType) {
                            if (_.startsWith(parameter.dataType, '@sys.')) {
                                input.type = {
                                    dialogflow: parameter.dataType,
                                };
                            } else {
                                input.type = parameter.dataType.substr(1);
                            }
                            inputs.push(input);
                        }
                    }
                }
            }

            if (inputs.length > 0) {
                jovoIntent.inputs = inputs;
            }

            // iterate through usersays intent files and generate sample phrases
            const userSaysFile = intentFiles.find((file) => {
                if (file.path[1] === dialogFlowIntent.name + '_usersays_' + locale + '.json') {
                    return true;
                }

                return false;
            });
            if (userSaysFile !== undefined) {
                const userSays = userSaysFile.content;
                for (const us of userSays) {
                    let phrase = '';
                    for (const data of us.data) {
                        phrase += data.alias ? '{' + data.alias + '}' : data.text;
                        // add sample text to input type
                        if (data.text !== data.alias) {
                            if (jovoIntent.inputs) {
                                for (const input of jovoIntent.inputs) {
                                    if (input.name === data.alias) {
                                        input.text = data.text;
                                    }
                                }
                            }
                        }
                    }
                    jovoIntent.phrases!.push(phrase);
                }
            }

            jovoModel.intents!.push(jovoIntent);
        }

        const entityFiles = inputData.filter((file) => {
            if (file.path.length === 0) {
                return false;
            }
            if (file.path[0] !== 'entities') {
                return false;
            }

            return true;
        });

        // iterate through entity files
        for (fileInformation of entityFiles) {
            file = fileInformation.path[1];
            // skip entries files
            if (file.indexOf('entries') > -1) {
                continue;
            }
            const dialogFlowEntity = fileInformation.content;

            const jovoInput: InputType = {
                name: dialogFlowEntity.name,
            };
            // skip default intent properties
            JovoModelDialogflow.skipDefaultEntityProps(jovoInput, dialogFlowEntity);

            // iterate through usersays intent files and generate sample phrases
            const userSaysFile = entityFiles.find((file) => {
                if (file.path[1] === dialogFlowEntity.name + '_entries_' + locale + '.json') {
                    return true;
                }

                return false;
            });

            if (userSaysFile !== undefined) {
                const values = [];
                const entries = userSaysFile.content;

                for (const entry of entries) {
                    const value: InputTypeValue = {
                        value: entry.value,
                    };

                    const tempSynonyms = [];
                    for (const synonym of entry.synonyms) {
                        if (synonym === entry.value) {
                            continue;
                        }
                        tempSynonyms.push(synonym);
                    }

                    if (tempSynonyms.length !== 0) {
                        value.synonyms = tempSynonyms;
                    }

                    values.push(value);
                }
                if (values.length > 0) {
                    jovoInput.values = values;
                }
            }

            jovoModel.inputTypes!.push(jovoInput);
        }


        if (jovoModel.inputTypes!.length === 0) {
            delete jovoModel.inputTypes;
        }

        return jovoModel;
    }


    /**
     * Converts JovoModel in Alexa model files
     *
     * @param {JovoModelDialogflowData} model The JovoModel to convert
     * @param {string} locale The locale of the JovoModel
     * @returns {NativeFileInformation[]}
     * @memberof JovoModelDialogflow
     */
    static fromJovoModel(model: JovoModelDialogflowData, locale: string): NativeFileInformation[] {
        const returnFiles: NativeFileInformation[] = [];

        for (const intent of (model.intents || []) as IntentDialogflow[]) {

            const dfIntentObj: DialogflowLMInputObject = {
                'name': intent.name,
                'auto': true,
                'webhookUsed': true,
            };

            // handle intent inputs
            if (intent.inputs) {
                dfIntentObj.responses = [{
                    parameters: [],
                }];

                for (const input of intent.inputs) {
                    let parameterObj: DialogflowLMInputParameterObject = {
                        isList: false,
                        name: input.name,
                        value: '$' + input.name,
                        dataType: ''
                    };
                    if (typeof input.type === 'object') {
                        if (input.type.dialogflow) {
                            if (_.startsWith(input.type.dialogflow, BUILTIN_PREFIX)) {
                                parameterObj.dataType = input.type.dialogflow;
                            } else {
                                input.type = input.type.dialogflow;
                            }
                        } else {
                            throw new Error('Please add a dialogflow property for input "' + input.name + '"');
                        }
                    }
                    // handle custom input types
                    if (parameterObj.dataType === '') {
                        if (!input.type) {
                            throw new Error('Invalid input type in intent "' + intent.name + '"');
                        }
                        parameterObj.dataType = input.type as string;
                        // throw error when no inputTypes object defined
                        if (!model.inputTypes) {
                            throw new Error('Input type "' + parameterObj.dataType + '" must be defined in inputTypes');
                        }

                        // find type in global inputTypes array
                        const matchedInputTypes = model.inputTypes.filter((item: InputType) => {
                            return item.name === parameterObj.dataType;
                        });

                        parameterObj.dataType = '@' + parameterObj.dataType;

                        if (matchedInputTypes.length === 0) {
                            throw new Error('Input type "' + parameterObj.dataType + '" must be defined in inputTypes');
                        }

                        // create alexaTypeObj from matched input types
                        for (const matchedInputType of matchedInputTypes) {
                            let dfEntityObj = {
                                name: matchedInputType.name,
                                isOverridable: true,
                                isEnum: false,
                                automatedExpansion: false,
                            };

                            if (matchedInputType.dialogflow) {
                                if (typeof matchedInputType.dialogflow === 'string') {
                                    dfEntityObj.name = matchedInputType.dialogflow;
                                } else {
                                    dfEntityObj = _.merge(dfEntityObj, matchedInputType.dialogflow);
                                }
                            }

                            returnFiles.push(
                                {
                                    path: ['entities', matchedInputType.name + '.json'],
                                    content: dfEntityObj,
                                }
                            );

                            // create entries if matched input type has values
                            if (matchedInputType.values && matchedInputType.values.length > 0) {
                                const entityValues = [];
                                // create dfEntityValueObj
                                for (const value of matchedInputType.values) {
                                    const dfEntityValueObj = {
                                        value: value.value,
                                        synonyms: [value.value.replace(/[^0-9A-Za-zÀ-ÿ-_' ]/gi, '')],
                                    };

                                    // save synonyms, if defined
                                    if (value.synonyms) {
                                        for (let i = 0; i < value.synonyms.length; i++) {
                                            value.synonyms[i] = value.synonyms[i].replace(/[^0-9A-Za-zÀ-ÿ-_' ]/gi, '');
                                        }

                                        dfEntityValueObj.synonyms =
                                            dfEntityValueObj.synonyms.concat(
                                                value.synonyms
                                            );
                                    }
                                    entityValues.push(dfEntityValueObj);
                                }

                                returnFiles.push(
                                    {
                                        path: ['entities', matchedInputType.name + '_entries_' + locale + '.json'],
                                        content: entityValues,
                                    }
                                );

                            }
                        }
                    }

                    // merges dialogflow specific data
                    if (input.dialogflow) {
                        parameterObj = _.merge(parameterObj, input.dialogflow);
                    }

                    dfIntentObj.responses[0].parameters.push(parameterObj);
                }
            }

            if (_.get(intent, 'dialogflow')) {
                _.merge(dfIntentObj, intent.dialogflow);
            }

            returnFiles.push(
                {
                    path: ['intents', intent.name + '.json'],
                    content: dfIntentObj,
                }
            );

            // handle user says files for intent

            const dialogFlowIntentUserSays: DialogflowLMIntent[] = [];
            const re = /{(.*?)}/g;

            const phrases = intent.phrases || [];
            // iterate through phrases and intent user says data objects
            for (const phrase of phrases) {
                let m;
                let data: DialogflowLMIntentData[] = [];
                let pos = 0;

                while (true) {
                    m = re.exec(phrase);
                    if (!m) {
                        break;
                    }

                    // text between entities
                    const text = phrase.substr(pos, m.index - pos);

                    // entities
                    const entity = phrase.substr(m.index + 1, m[1].length);

                    pos = m.index + 1 + m[1].length + 1;

                    const dataTextObj = {
                        text,
                        userDefined: false,
                    };

                    // skip empty text on entity index = 0
                    if (text.length > 0) {
                        data.push(dataTextObj);
                    }

                    const dataEntityObj: DialogflowLMIntentData = {
                        text: entity,
                        userDefined: true,
                    };

                    // add enityt sample text if available
                    if (intent.inputs) {
                        for (const input of intent.inputs) {
                            if (input.name === entity && input.text) {
                                dataEntityObj.text = input.text;
                            }
                        }
                    }

                    // create entity object based on parameters objects
                    if (_.get(dfIntentObj, 'responses[0].parameters')) {
                        dfIntentObj.responses![0].parameters.forEach((item) => {
                            if (item.name === entity) {
                                dataEntityObj.alias = item.name;
                                dataEntityObj.meta = item.dataType;
                            }
                        });
                    }

                    data.push(dataEntityObj);
                }

                if (pos < phrase.length) {
                    data.push({
                        text: phrase.substr(pos),
                        userDefined: false,
                    });
                }

                // if no entities in phrase use full phrase as data object
                if (data.length === 0) {
                    data = [
                        {
                            text: phrase,
                            userDefined: false,
                        },
                    ];
                }

                dialogFlowIntentUserSays.push({
                    data,
                    isTemplate: false,
                    count: 0,
                });
            }
            if (dialogFlowIntentUserSays.length > 0) {
                returnFiles.push(
                    {
                        path: ['intents', intent.name + '_usersays_' + locale + '.json'],
                        content: dialogFlowIntentUserSays,
                    }
                );

            }
        }
        // dialogflow intents form locale.json
        if (_.get(model, 'dialogflow.intents')) {
            for (const modelDialogflowIntent of _.get(model, 'dialogflow.intents')) {
                // user says
                if (modelDialogflowIntent.userSays) {
                    returnFiles.push(
                        {
                            path: ['intents', modelDialogflowIntent.name + '_usersays_' + locale + '.json'],
                            content: modelDialogflowIntent.userSays,
                        }
                    );
                    delete modelDialogflowIntent.userSays;
                }

                returnFiles.push(
                    {
                        path: ['intents', modelDialogflowIntent.name + '.json'],
                        content: modelDialogflowIntent,
                    }
                );

            }
        }

        // dialogflow entities form locale.json
        if (_.get(model, 'dialogflow.entities')) {
            for (const modelDialogflowEntity of _.get(model, 'dialogflow.entities')) {
                // entries
                if (modelDialogflowEntity.entries) {
                    returnFiles.push(
                        {
                            path: ['entities', modelDialogflowEntity.name + '_usersays_' + locale + '.json'],
                            content: modelDialogflowEntity.entries,
                        }
                    );

                    delete modelDialogflowEntity.entries;
                }

                returnFiles.push(
                    {
                        path: ['entities', modelDialogflowEntity.name + '.json'],
                        content: modelDialogflowEntity,
                    }
                );
            }
        }

        return returnFiles;
    }


    static getValidator(): tv4.JsonSchema {
        return JovoModelDialogflowValidator;
    }



    /**
     * Skips default intent properties
     * @param {*} jovoIntent
     * @param {*} dialogFlowIntent
     * @param {string} locale
     * @return {*}
     */
    static skipDefaultIntentProps(jovoIntent: IntentDialogflow, dialogFlowIntent: DialogflowLMInputObject, locale: string) {
        if (_.get(dialogFlowIntent, 'auto') !== _.get(DEFAULT_INTENT, 'auto')) {
            _.set(jovoIntent, 'dialogflow.auto', _.get(dialogFlowIntent, 'auto'));
        }

        if (_.difference(_.get(dialogFlowIntent, 'contexts'), _.get(DEFAULT_INTENT, 'contexts')).length > 0) {
            _.set(jovoIntent, 'dialogflow.contexts', _.get(dialogFlowIntent, 'contexts'));
        }

        const priority = _.get(dialogFlowIntent, 'priority');
        if (priority !== undefined && priority !== _.get(DEFAULT_INTENT, 'priority')) {
            _.set(jovoIntent, 'dialogflow.priority', priority);
        }

        const webhookUsed = _.get(dialogFlowIntent, 'webhookUsed');
        if (webhookUsed !== undefined && webhookUsed !== _.get(DEFAULT_INTENT, 'webhookUsed')) {
            _.set(jovoIntent, 'dialogflow.webhookUsed', webhookUsed);
        }

        const webhookForSlotFilling = _.get(dialogFlowIntent, 'webhookForSlotFilling');
        if (webhookForSlotFilling !== undefined && webhookForSlotFilling !== _.get(DEFAULT_INTENT, 'webhookForSlotFilling')) {
            _.set(jovoIntent, 'dialogflow.webhookForSlotFilling', webhookForSlotFilling);
        }

        const fallbackIntent = _.get(dialogFlowIntent, 'fallbackIntent');
        if (fallbackIntent !== undefined && fallbackIntent !== _.get(DEFAULT_INTENT, 'fallbackIntent')) {
            _.set(jovoIntent, 'dialogflow.fallbackIntent', fallbackIntent);
        }
        if (_.difference(_.get(dialogFlowIntent, 'events'), _.get(DEFAULT_INTENT, 'events')).length > 0) {
            _.set(jovoIntent, 'dialogflow.events', _.get(dialogFlowIntent, 'events'));
        }

        // skip parameters object in responses. it's handled somewhere else
        const responses = _.get(dialogFlowIntent, 'responses');

        if (responses !== undefined && responses.length !== 0 && !_.isEqual(responses, _.get(DEFAULT_INTENT, 'responses'))) {
            const resetContexts = _.get(dialogFlowIntent, 'responses[0].resetContexts');
            if (resetContexts !== undefined && !_.isEqual(resetContexts, _.get(DEFAULT_INTENT, 'responses[0].resetContexts'))) {
                _.set(jovoIntent, 'dialogflow.responses[0].resetContexts', resetContexts);
            }

            const affectedContexts = _.get(dialogFlowIntent, 'responses[0].affectedContexts');
            if (affectedContexts !== undefined && !_.isEqual(affectedContexts, _.get(DEFAULT_INTENT, 'responses[0].affectedContexts'))) {
                _.set(jovoIntent, 'dialogflow.responses[0].affectedContexts', affectedContexts);
            }

            const defaultResponsePlatforms = _.get(dialogFlowIntent, 'responses[0].defaultResponsePlatforms');
            if (defaultResponsePlatforms !== undefined && !_.isEqual(defaultResponsePlatforms, _.get(DEFAULT_INTENT, 'responses[0].defaultResponsePlatforms'))) {
                _.set(jovoIntent, 'dialogflow.responses[0].defaultResponsePlatforms', defaultResponsePlatforms);
            }

            if (!_.isEqual(_.get(dialogFlowIntent, 'responses[0].messages'), _.get(DEFAULT_INTENT, 'responses[0].messages'))) {

                for (const message of _.get(dialogFlowIntent, 'responses[0].messages')) {
                    if (_.get(message, 'lang') === locale) {
                        const jovoIntentDialogflowMessages = _.get(jovoIntent, 'dialogflow.responses[0].messages', []);

                        if (message.speech.length > 0) {
                            jovoIntentDialogflowMessages.push(message);
                            _.set(jovoIntent, 'dialogflow.responses[0].messages', jovoIntentDialogflowMessages);
                        }

                    }
                }
            }

            const responseSpeech = _.get(dialogFlowIntent, 'responses[0].speech');
            if (responseSpeech !== undefined && !_.isEqual(responseSpeech, _.get(DEFAULT_INTENT, 'responses[0].speech'))) {
                _.set(jovoIntent, 'dialogflow.responses[0].speech', responseSpeech);
            }
        }
        return jovoIntent;
    }


    /**
     * Skips default entity properties
     * @param {*} jovoInput
     * @param {*} dialogflowEntity
     * @return {*}
     */
    static skipDefaultEntityProps(jovoInput: InputType, dialogflowEntity: DialogflowLMEntity) {
        if (_.get(dialogflowEntity, 'isOverridable') !== _.get(DEFAULT_ENTITY, 'isOverridable')) {
            _.set(jovoInput, 'dialogflow.isOverridable', _.get(dialogflowEntity, 'isOverridable'));
        }
        if (_.get(dialogflowEntity, 'isEnum') !== _.get(DEFAULT_ENTITY, 'isEnum')) {
            _.set(jovoInput, 'dialogflow.isEnum', _.get(dialogflowEntity, 'isEnum'));
        }
        if (_.get(dialogflowEntity, 'automatedExpansion') !== _.get(DEFAULT_ENTITY, 'automatedExpansion')) {
            _.set(jovoInput, 'dialogflow.automatedExpansion', _.get(dialogflowEntity, 'automatedExpansion'));
        }
        return jovoInput;
    }
}
