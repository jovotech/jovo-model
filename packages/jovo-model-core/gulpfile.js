const CreateValidators = require('./dist/src/CreateValidators');


function build() {
    const validators = [
        {
            path: 'src/Interfaces',
            types: [
                'JovoModel'
            ]
        }
    ];

    return CreateValidators.createValidators('validators', validators);
}


exports.build = build;

exports.default = build;
