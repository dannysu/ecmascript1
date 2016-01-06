'use strict';

const should = require('should');

const Lexer = require('../../src/lexer.js');
const tokenTypes = require('../../src/token.js').tokenTypes;

describe('lexer', function() {
    describe('identifier starting with a number', function() {
        it('should fail', function() {
            const input = `
                0nono;
            `;

            try {
                const lexer = new Lexer(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('invalid character', function() {
        it('should fail', function() {
            const input = `
                #;
            `;

            try {
                const lexer = new Lexer(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse valid keywords', function() {
        it('should succeed', function() {
            const input = `
                // #@#
                while;
                delete;
            `;
            const lexer = new Lexer(input);

            let token = null;

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.keyword);
            token.value.should.be.eql('while');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.keyword);
            token.value.should.be.eql('delete');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql(';');

            // Should be EOF
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(tokenTypes.eof);
        });
    });

    describe('parse valid identifiers', function() {
        it('should succeed', function() {
            const input = `
                $;
                _;
                aB0$_;
                Zzz;
            `;
            const lexer = new Lexer(input);

            let token = null;

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.identifier);
            token.value.should.be.eql('$');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.identifier);
            token.value.should.be.eql('_');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.identifier);
            token.value.should.be.eql('aB0$_');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.identifier);
            token.value.should.be.eql('Zzz');

            token = lexer.nextToken();
            token.type.should.be.eql(tokenTypes.punctuator);
            token.value.should.be.eql(';');

            // Should be EOF
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(tokenTypes.eof);
        });
    });
});
