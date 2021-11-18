const jovoModel = require('@jovotech/model-util');


function build() {
    const validators = [
        {
            path: 'src/JovoModelAlexa',
            types: [
                'JovoModelAlexa'
            ]
        }
    ];

    return jovoModel.createValidators('validators', validators);
}


exports.build = build;

exports.default = build;
