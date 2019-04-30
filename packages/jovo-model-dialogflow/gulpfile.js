const jovoModel = require('jovo-model');


function build() {
    const validators = [
        {
            path: 'src/Interfaces',
            types: [
                'JovoModelDialogflowData'
            ]
        }
    ];

    return jovoModel.createValidators('validators', validators);
}


exports.build = build;

exports.default = build;
