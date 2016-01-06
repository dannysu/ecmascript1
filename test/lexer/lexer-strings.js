'use strict';

const should = require('should');

const Lexer = require('../../src/lexer.js');
const tokenTypes = require('../../src/token.js').tokenTypes;

describe('lexer', function() {
    describe('parse string with escape sequence', function() {
        it('should emit string token', function() {
            const input = `
                "\\\\"
            `;
            const lexer = new Lexer(input);

            const stringToken = lexer.nextToken();
            should.exist(stringToken);
            stringToken.type.should.be.eql(tokenTypes.stringLiteral);
            stringToken.value.should.be.eql('"\\\\"');

            // Should be EOF
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(tokenTypes.eof);
        });
    });

    describe('parse strings surrounded using "', function() {
        it('should emit string token', function() {
            const input = "\"a b'cdwrefas\\a\\\"fdsa\\'fda\"";
            const lexer = new Lexer(input);

            const stringToken = lexer.nextToken();
            should.exist(stringToken);
            stringToken.type.should.be.eql(tokenTypes.stringLiteral);
            stringToken.value.should.be.eql("\"a b'cdwrefas\\a\\\"fdsa\\'fda\"");

            // Should be EOF
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(tokenTypes.eof);
        });
    });

    describe('parse strings without starting quote char', function() {
        it('should fail', function() {
            const input = `
                "good"bad"
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

    describe('parse strings without ending quote char', function() {
        it('should fail', function() {
            const input = `
                "never ends...
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

    describe('parse multi-line string', function() {
        it('should fail without escape char', function() {
            const input = `
                "string over
                multiple lines"
            `;

            try {
                const lexer = new Lexer(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });

        it('should succeed with escape char', function() {
            const input = `
                "string over \\
                multiple lines"
            `;
            const lexer = new Lexer(input);

            const stringToken = lexer.nextToken();
            should.exist(stringToken);
            stringToken.type.should.be.eql(tokenTypes.stringLiteral);

            // Should be EOF
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(tokenTypes.eof);
        });
    });

    describe("parse strings surrounded using '", function() {
        it('should emit string token', function() {
            const input = "'a b\\'cdwrefas\\a\\\"fdsa'";
            const lexer = new Lexer(input);

            const stringToken = lexer.nextToken();
            should.exist(stringToken);
            stringToken.type.should.be.eql(tokenTypes.stringLiteral);
            stringToken.value.should.be.eql("'a b\\'cdwrefas\\a\\\"fdsa'");

            // Should be EOF
            const eofToken = lexer.nextToken();
            should.exist(eofToken);
            eofToken.type.should.be.eql(tokenTypes.eof);
        });
    });
});
