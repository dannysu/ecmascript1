'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse variable statement without initializer', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                var _;
                var $;
                var abcdefg;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        '_',
                        should.not.exist
                    )
                ]),
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        '$',
                        should.not.exist
                    )
                ]),
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        'abcdefg',
                        should.not.exist
                    )
                ])
            ]);
        });
    });

    describe('parse variable statement with initializer', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                var _ = 1;
                var $ = 2;
                var abcdefg = 3;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        '_',
                        u.expectLiteralFn('1')
                    )
                ]),
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        '$',
                        u.expectLiteralFn('2')
                    )
                ]),
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        'abcdefg',
                        u.expectLiteralFn('3')
                    )
                ])
            ]);
        });
    });

    describe('parse variable statement with multiple declarators', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                var _, $;
                var a = 1, b = 2, c = 3;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        '_',
                        should.not.exist
                    ),
                    u.expectVariableDeclaratorFn(
                        '$',
                        should.not.exist
                    )
                ]),
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        'a',
                        u.expectLiteralFn('1')
                    ),
                    u.expectVariableDeclaratorFn(
                        'b',
                        u.expectLiteralFn('2')
                    ),
                    u.expectVariableDeclaratorFn(
                        'c',
                        u.expectLiteralFn('3')
                    )
                ])
            ]);
        });
    });

    describe('parse variable statement with incomplete declarator', function() {
        it('should fail', function() {
            const input = `
                var $ =;
            `;
            u.expectFail(input);
        });
    });

    describe('parse variable statement without identifier', function() {
        it('should fail', function() {
            const input = `
                var = 1 ;
            `;
            u.expectFail(input);
        });
    });
});
