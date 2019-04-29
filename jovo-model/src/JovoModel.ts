import {
    NativeFileInformation,
    JovoModelData,
} from '.';


export class JovoModel {
    static MODEL_KEY = '';
    private data: JovoModelData | undefined;
    private locale: string | undefined;


    constructor(data?: JovoModelData, locale?: string) {
        this.data = data;
        this.locale = locale;
    }


    /**
     * Exports in as JovoModel file
     *
     * @returns {(JovoModelData | undefined)}
     * @memberof JovoModel
     */
    exportJovoModel(): JovoModelData | undefined {
        return this.data;
    }


    /**
     * Exports data in native file format
     *
     * @returns {(NativeFileInformation[] | undefined)}
     * @memberof JovoModel
     */
    exportNative(): NativeFileInformation[] | undefined {
        if (this.data === undefined || this.locale === undefined) {
            return undefined;
        }
        // @ts-ignore
        return this.constructor.fromJovoModel(this.data, this.locale);
    }


    /**
     * Imports the native files
     *
     * @param {NativeFileInformation[]} inputFiles The files in the native format
     * @param {string} locale The locale of the files
     * @memberof JovoModel
     */
    importNative(inputFiles: NativeFileInformation[], locale: string) {
        // @ts-ignore
        this.data = this.constructor.toJovoModel(inputFiles, locale);
        this.locale = locale;
    }



    /**
     * Imports JovoModel
     *
     * @param {JovoModelData} data The JovoModel data
     * @param {string} locale The locale of the model
     * @memberof JovoModel
     */
    importJovoModel(data: JovoModelData, locale: string) {
        this.data = data;
        this.locale = locale;
    }


    /**
     * Converts native model files to JovoModel
     *
     * @param {NativeFileInformation[]} inputFiles The files in the native format
     * @param {string} locale The locale of the files
     * @returns {JovoModelData}
     * @memberof JovoModel
     */
    static toJovoModel(inputFiles: NativeFileInformation[], locale: string): JovoModelData {
        // @ts-ignore
        throw new Error(`Method "toJovoModel" is not implemented for model "${this.constructor.MODEL_KEY}"!`);
    }


    /**
     * Converts JovoModel in native model files
     *
     * @param {JovoModel} model The JovoModel to convert
     * @param {string} locale The locale of the JovoModel
     * @returns {NativeFileInformation[]}
     * @memberof JovoModel
     */
    static fromJovoModel(model: JovoModelData, locale: string): NativeFileInformation[] {
        // @ts-ignore
        throw new Error(`Method "fromJovoModel" is not implemented for model "${this.constructor.MODEL_KEY}"!`);
    }


    /**
     * Returns Validation Schema to check if data is valid
     *
     * @returns {tv4.JsonSchema}
     * @memberof JovoModelBuilder
     */
    static getValidator(): tv4.JsonSchema {
        // @ts-ignore
        throw new Error(`Method "getValidator" is not implemented for model "${this.constructor.MODEL_KEY}"!`);
    }
}
