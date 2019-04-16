import {
    ExternalModelFile,
    JovoModel,
} from '.';
import { JovoConfigReader } from 'jovo-config';


export abstract class JovoModelBuilder {
    static MODEL_KEY = '';


    /**
     * Converts external model files to JovoModel
     *
     * @param {ExternalModelFile[]} inputFiles The files in the external format
     * @param {string} locale The locale of the files
     * @returns {JovoModel}
     * @memberof JovoModelBuilder
     */
    toJovoModel(inputFiles: ExternalModelFile[], locale: string): JovoModel {
        // @ts-ignore
        throw new Error(`Method "toJovoModel" is not implemented for model "${this.constructor.MODEL_KEY}"!`);
    }


    /**
     * Converts JovoModel in external model files
     *
     * @param {JovoConfigReader} configReader ConfigReader instance to read data from configuration
     * @param {JovoModel} model The JovoModel to convert
     * @param {string} locale The locale of the JovoModel
     * @param {string} [stage] Stage to use for configuration data
     * @returns {ExternalModelFile[]}
     * @memberof JovoModelBuilder
     */
    fromJovoModel(configReader: JovoConfigReader, model: JovoModel, locale: string, stage?: string): ExternalModelFile[] {
        // @ts-ignore
        throw new Error(`Method "fromJovoModel" is not implemented for model "${this.constructor.MODEL_KEY}"!`);
    }


    /**
     * Returns Validation Schema to check if data is valid
     *
     * @returns {tv4.JsonSchema}
     * @memberof JovoModelBuilder
     */
    getValidator(): tv4.JsonSchema {
        // @ts-ignore
        throw new Error(`Method "getValidator" is not implemented for model "${this.constructor.MODEL_KEY}"!`);
    }
}
