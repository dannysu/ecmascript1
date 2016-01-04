'use strict';

const should = require('should');

const lexer = require('../../src/lexer.js');

describe('lexer', function() {
    describe('parse code containing single-line comments', function() {
        it('should ignore them', function() {
            const input = `

                // This is a single-line comment
                // This is another single-line comment

                // Lastly, this is the final single-line comment
            `;
            lexer.setInput(input);

            // All code comments are ignored and not emitted as tokens.
            // Should be EOF here
            const token = lexer.nextToken();
            should.exist(token);
            token.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });

    describe('parse code containing multi-line comments', function() {
        it('should ignore them', function() {
            const input = `

                /* This is a multi-line comment
                 * that goes on for multiple lines.
                 * // everything is a comment
                 */
            `;
            lexer.setInput(input);

            // All code comments are ignored and not emitted as tokens.
            // Should be EOF here
            const token = lexer.nextToken();
            should.exist(token);
            token.type.should.be.eql(lexer.tokenTypes.eof);
        });
    });
});
