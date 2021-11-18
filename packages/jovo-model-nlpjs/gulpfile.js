const jovoModel = require('@jovotech/model-util');


function build() {
    const validators = [
        {
            path: 'src/Interfaces',
            types: [
                'JovoModelNlpjsData'
            ]
        }
    ];

    return jovoModel.createValidators('validators', validators);
}


exports.build = build;

exports.default = build;
