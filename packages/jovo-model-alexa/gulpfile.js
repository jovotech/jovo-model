const jovoModelCore = require('jovo-model-core');


function build() {
    const validators = [
        {
            path: 'src/Interfaces',
            types: [
                'JovoModelAlexa'
            ]
        }
    ];

    return jovoModelCore.createValidators('validators', validators);
}


exports.build = build;

exports.default = build;
