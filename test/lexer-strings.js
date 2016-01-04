'use strict';

const should = require('should');

const lexer = require('../src/lexer.js');

describe('lexer', function() {
    describe('parse strings surrounded using "', function() {
        it('should emit string token', function() {
            const input = `
                "a b'cdwrefas\\a\\"fdsa\\'fda"
            `;
            lexer.setInput(input);

            const stringToken = lexer.nextToken();
            should.exist(stringToken);
            stringToken.type.should.be.eql(lexer.tokenTypes.stringLiteral);
            stringToken.value.should.be.eql("\"a b'cdwrefas\\a\\\"fdsa\\'fda\"");

            // Should be EOF
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });

    describe('parse strings without starting quote char', function() {
        it('should fail', function() {
            const input = `
                "good"bad"
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

    describe('parse strings without ending quote char', function() {
        it('should fail', function() {
            const input = `
                "never ends...
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

    describe('parse multi-line string', function() {
        it('should fail', function() {
            const input = `
                "string over
                multiple lines"
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

    describe("parse strings surrounded using '", function() {
        it('should emit string token', function() {
            const input = `
                'a b\\'cdwrefas\\a\\"fdsa'
            `;
            lexer.setInput(input);

            const stringToken = lexer.nextToken();
            should.exist(stringToken);
            stringToken.type.should.be.eql(lexer.tokenTypes.stringLiteral);
            stringToken.value.should.be.eql("'a b\\'cdwrefas\\a\\\"fdsa'");

            // Should be EOF
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });
});
