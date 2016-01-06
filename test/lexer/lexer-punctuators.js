'use strict';

const should = require('should');

const Lexer = require('../../src/lexer.js');
const tokenTypes = require('../../src/token.js').tokenTypes;

describe('lexer', function() {
    describe('parse semicolon', function() {
        it('should emit proper punctuator tokens', function() {
            const input = `
                ;
                "testing";
                ;;`;
            const lexer = new Lexer(input);

            const token1 = lexer.nextToken();
            should.exist(token1);
            token1.type.should.be.eql(tokenTypes.punctuator);
            token1.value.should.be.eql(';');

            const stringToken = lexer.nextToken();
            should.exist(stringToken);
            stringToken.type.should.be.eql(tokenTypes.stringLiteral);
            stringToken.value = '"testing"';

            const token2 = lexer.nextToken();
            should.exist(token2);
            token2.type.should.be.eql(tokenTypes.punctuator);
            token2.value.should.be.eql(';');

            const token3 = lexer.nextToken();
            should.exist(token3);
            token3.type.should.be.eql(tokenTypes.punctuator);
            token3.value.should.be.eql(';');

            const token4 = lexer.nextToken();
            should.exist(token4);
            token4.type.should.be.eql(tokenTypes.punctuator);
            token4.value.should.be.eql(';');

            // Should be EOF here
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(tokenTypes.eof);
        });
    });

    describe('parse punctuators next to each other', function() {
        it('should emit proper punctuator tokens', function() {
            const input = `
                ++[x];
            `;
            const lexer = new Lexer(input);

            let token = null;

            // Lexer separates out the longest match
            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql('++');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql('[');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.identifier);
            token.value.should.be.eql('x');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql(']');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql(';');

            // Should be EOF here
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(tokenTypes.eof);
        });
    });
});
