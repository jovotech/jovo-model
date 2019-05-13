const jovoModel = require('jovo-model');


function build() {
    const validators = [
        {
            path: 'src/Interfaces',
            types: [
                'JovoModelLuisData'
            ]
        }
    ];

    return jovoModel.createValidators('validators', validators);
}


exports.build = build;

exports.default = build;
