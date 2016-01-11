'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

const u = require('../utils.js');

describe('parser', function() {
    describe('parse simple jsx', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                var a = <div></div>;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        u.expectIdentifierFn('a'),
                        u.expectJSXElementFn(
                            u.expectIdentifierFn('div'),
                            []
                        )
                    )
                ])
            ]);
        });
    });

    describe('parse nested jsx', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                var a = <div>
                            <div>
                            </div>
                        </div>;
            `;
            const ast = parser.parse(input);

            u.expectProgram(ast, [
                u.expectVariableDeclarationFn([
                    u.expectVariableDeclaratorFn(
                        u.expectIdentifierFn('a'),
                        u.expectJSXElementFn(
                            u.expectIdentifierFn('div'),
                            [
                                u.expectJSXElementFn(
                                    u.expectIdentifierFn('div'),
                                    []
                                )
                            ]
                        )
                    )
                ])
            ]);
        });
    });
});
