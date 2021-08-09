const jovoModel = require('jovo-model-util');


function build() {
    const validators = [
        {
            path: 'src/Interfaces',
            types: [
                'JovoModelAlexaData'
            ]
        }
    ];

    return jovoModel.createValidators('validators', validators);
}


exports.build = build;

exports.default = build;
