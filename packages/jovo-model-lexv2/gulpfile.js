const jovoModel = require('@jovotech/model-util');


function build() {
    const validators = [
        {
            path: 'src/Interfaces',
            types: [
                'LexV2CustomVocabulary',
                'LexV2SlotType',
                'LexV2Slot',
                'LexV2Intent',
                'LexV2BotLocale',
                'LexV2Bot',
                'LexV2Manifest'
            ]
        }
    ];

    return jovoModel.createValidators('validators', validators);
}


exports.build = build;

exports.default = build;
