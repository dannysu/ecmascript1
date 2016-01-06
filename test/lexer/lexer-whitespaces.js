'use strict';

const should = require('should');

const Lexer = require('../../src/lexer.js');
const tokenTypes = require('../../src/token.js').tokenTypes;

describe('lexer', function() {
    describe('parse whitespaces', function() {
        it('should ignore them', function() {
            const input = "      ";
            const lexer = new Lexer(input);

            // Should be EOF
            const token = lexer.nextToken();
            should.exist(token);
            token.type.should.be.eql(tokenTypes.eof);
        });
    });
});
