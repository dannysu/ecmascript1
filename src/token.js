'use strict';

/*
 * Token Definitions
 */
class Token {
    constructor(type, value, from, to) {
        this.type = type;
        this.value = value;
        this.from = from;
        this.to = to;
    }
}

const tokenTypes = {
    comment:         'comment',
    stringLiteral:   'stringLiteral',
    numericLiteral:  'numericLiteral',
    punctuator:      'punctuator',
    keyword:         'keyword',
    identifier:      'identifier',
    eof:             'eof'
};

exports.Token = Token;
exports.tokenTypes = tokenTypes;
