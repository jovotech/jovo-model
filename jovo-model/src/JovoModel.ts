import {
    Intent,
    InputType,
    ExternalModelFile,
    JovoModelData,
} from '.';


// export abstract class JovoModelBuilder {
export abstract class JovoModel {
    static MODEL_KEY = '';


    /**
     * Converts external model files to JovoModel
     *
     * @param {ExternalModelFile[]} inputFiles The files in the external format
     * @param {string} locale The locale of the files
     * @returns {JovoModelData}
     * @memberof JovoModel
     */
    toJovoModel(inputFiles: ExternalModelFile[], locale: string): JovoModelData {
        // @ts-ignore
        throw new Error(`Method "toJovoModel" is not implemented for model "${this.constructor.MODEL_KEY}"!`);
    }


    /**
     * Converts JovoModel in external model files
     *
     * @param {JovoModel} model The JovoModel to convert
     * @param {string} locale The locale of the JovoModel
     * @returns {ExternalModelFile[]}
     * @memberof JovoModel
     */
    fromJovoModel(model: JovoModelData, locale: string): ExternalModelFile[] {
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
