import {
    join as pathJoin,
    resolve as pathResolve,
} from 'path';
import { writeFile } from 'fs';

import * as TJS from 'typescript-json-schema';
import { RunValidator } from '.';


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
