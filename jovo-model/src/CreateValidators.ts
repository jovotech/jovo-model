import {
    join as pathJoin,
    resolve as pathResolve,
} from 'path';
import { writeFile } from 'fs';

import * as TJS from 'typescript-json-schema';
import { RunValidator } from '.';


/**
 * Simple wrapper to write files async with promises
 * TODO: Once we do not have to support Node 6.9 anymore
 *       remove and use built-in util.promisify instead
 *
 * @param {string} path The name of the file to write
 * @param {string} content The content of the file
 * @returns
 */
const writeFileAsync = (path: string, content: string) => {
    return new Promise((resolve, reject) => {
        writeFile(path, content, 'utf8', (error) => {
            if (error) {
                return reject(error);
            }

            resolve();
        });
    });
};



/**
 * Creates validation files according to TypeScript definitions
 *
 * @export
 * @param {string} destinationDirectory The directory to write the validation files to
 * @param {RunValidator[]} runValidators The validators to create
 */
export async function createValidators(destinationDirectory: string, runValidators: RunValidator[]) {
    const settings = {
        required: true
    };

    const compilerOptions = {
        strictNullChecks: true
    };

    let program: TJS.Program;
    let schema;
    runValidators.forEach(async (validatorData) => {
        program = TJS.getProgramFromFiles([pathResolve(validatorData.path)], compilerOptions);
        validatorData.types.forEach(async (typeName: string) => {
            schema = TJS.generateSchema(program, typeName, settings);
            await writeFileAsync(pathJoin(destinationDirectory, typeName + '.json'), JSON.stringify(schema, null, '\t'));
        });
    });
}
