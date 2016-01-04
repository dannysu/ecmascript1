'use strict';

const should = require('should');

const lexer = require('../src/lexer.js');

describe('lexer', function() {
    describe('parse valid octal numbers', function() {
        it('should emit numeric literal tokens', function() {
            const input = `
                0111;
                077;
            `;
            lexer.setInput(input);

            const token1 = lexer.nextToken();
            should.exist(token1);
            token1.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token1.value.should.be.eql('0111');

            const token2 = lexer.nextToken();
            should.exist(token2);
            token2.type.should.be.eql(lexer.tokenTypes.punctuator);
            token2.value.should.be.eql(';');

            const token3 = lexer.nextToken();
            should.exist(token3);
            token3.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token3.value.should.be.eql('077');

            const token4 = lexer.nextToken();
            should.exist(token4);
            token4.type.should.be.eql(lexer.tokenTypes.punctuator);
            token4.value.should.be.eql(';');

            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });

    describe('parse invalid octal numbers', function() {
        it('should fail', function() {
            const input = `
                08;
            `;

            try {
                lexer.setInput(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse 0', function() {
        it('should yield 0', function() {
            const input = `
                0;
            `;
            lexer.setInput(input);

            const token1 = lexer.nextToken();
            should.exist(token1);
            token1.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token1.value.should.be.eql('0');

            const token2 = lexer.nextToken();
            should.exist(token2);
            token2.type.should.be.eql(lexer.tokenTypes.punctuator);
            token2.value.should.be.eql(';');

            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });

    describe('parse valid hex numbers', function() {
        it('should succeed', function() {
            const input = `
                0x1;
                0xDEADC0DE;
            `;
            lexer.setInput(input);

            const token1 = lexer.nextToken();
            should.exist(token1);
            token1.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token1.value.should.be.eql('0x1');

            const token2 = lexer.nextToken();
            should.exist(token2);
            token2.type.should.be.eql(lexer.tokenTypes.punctuator);
            token2.value.should.be.eql(';');

            const token3 = lexer.nextToken();
            should.exist(token3);
            token3.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token3.value.should.be.eql('0xDEADC0DE');

            const token4 = lexer.nextToken();
            should.exist(token4);
            token4.type.should.be.eql(lexer.tokenTypes.punctuator);
            token4.value.should.be.eql(';');

            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });

    describe('parse invalid hex numbers', function() {
        it('should fail', function() {
            const input = `
                0xG00D;
            `;

            try {
                lexer.setInput(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse incomplete hex numbers', function() {
        it('should fail', function() {
            const input = `
                0x;
            `;

            try {
                lexer.setInput(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse invalid decimal numbers', function() {
        it('2e should fail', function() {
            const input = `
                2e;
            `;

            try {
                lexer.setInput(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });

        it('2eE should fail', function() {
            const input = `
                2eE;
            `;

            try {
                lexer.setInput(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });

        it('1.1.1 should fail', function() {
            const input = `
                1.1.1;
            `;

            try {
                lexer.setInput(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });

        it('2e+ should fail', function() {
            const input = `
                2e+;
            `;

            try {
                lexer.setInput(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });

        it('2.e should fail', function() {
            const input = `
                2.e;
            `;

            try {
                lexer.setInput(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse valid decimal numbers', function() {
        it('should succeed', function() {
            const input = `
                12345;
                2.;
                3e5;
                3e-5;
                3e+5;
                4.5E-6;
                .7;
            `;
            lexer.setInput(input);

            let token = null;

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token.value.should.be.eql('12345');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token.value.should.be.eql('2.');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token.value.should.be.eql('3e5');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token.value.should.be.eql('3e-5');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token.value.should.be.eql('3e+5');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token.value.should.be.eql('4.5E-6');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.punctuator);
            token.value.should.be.eql(';');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.numericLiteral);
            token.value.should.be.eql('.7');

            token = lexer.nextToken();
            token.type.should.be.eql(lexer.tokenTypes.punctuator);
            token.value.should.be.eql(';');

            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });
});
