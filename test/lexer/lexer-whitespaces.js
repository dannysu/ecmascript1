'use strict';

const should = require('should');

const lexer = require('../../src/lexer.js');

describe('lexer', function() {
    describe('parse whitespaces', function() {
        it('should ignore them', function() {
            const input = "      ";
            lexer.setInput(input);

            // Should be EOF
            const token = lexer.nextToken();
            should.exist(token);
            token.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });
});
