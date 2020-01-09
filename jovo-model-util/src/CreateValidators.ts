import { join as pathJoin, resolve as pathResolve } from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';

import * as TJS from 'typescript-json-schema';
import { RunValidator } from 'jovo-model';

const writeFileAsync = promisify(writeFile);

/**
 * Creates validation files according to TypeScript definitions
 *
 * @export
 * @param {string} destinationDirectory The directory to write the validation files to
 * @param {RunValidator[]} runValidators The validators to create
 */
export async function createValidators(
    destinationDirectory: string,
    runValidators: RunValidator[],
) {
    const settings = {
        required: true,
    };

    const compilerOptions = {
        strictNullChecks: true,
    };

    for (const validatorData of runValidators) {
        const program = TJS.getProgramFromFiles([pathResolve(validatorData.path)], compilerOptions);
        for (const typeName of validatorData.types) {
            const schema = TJS.generateSchema(program, typeName, settings);
            const path = pathJoin(destinationDirectory, typeName + '.json');
            await writeFileAsync(path, JSON.stringify(schema, null, '\t'));
        }
    }
}
