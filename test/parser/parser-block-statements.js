'use strict';

const should = require('should');

const parser = require('../../src/parser.js');
const estree = require('../../src/estree.js');

describe('parser', function() {
    describe('parse a block statement with missing ending }', function() {
        it('should fail', function() {
            const input = `
                {
                    1;
            `;
            try {
                const ast = parser.parse(input);
                throw new Error('Expecting error from bad syntax');
            }
            catch (ex) {
                (ex instanceof SyntaxError).should.be.eql(true);
            }
        });
    });

    describe('parse a block statement', function() {
        it('should return proper ESTree AST', function() {
            const input = `
                {
                    1;
                    2;
                    3;
                }
            `;
            const ast = parser.parse(input);

            ast.type.should.be.eql('Program');
            should.exist(ast.body);
            ast.body.length.should.be.eql(1);

            const block = ast.body[0];
            block.type.should.be.eql('BlockStatement');
            block.body.length.should.be.eql(3);
            block.body[0].type.should.be.eql('ExpressionStatement');
            block.body[0].expression.type.should.be.eql('Literal');
            block.body[0].expression.value.should.be.eql('1');
            block.body[1].type.should.be.eql('ExpressionStatement');
            block.body[1].expression.type.should.be.eql('Literal');
            block.body[1].expression.value.should.be.eql('2');
            block.body[2].type.should.be.eql('ExpressionStatement');
            block.body[2].expression.type.should.be.eql('Literal');
            block.body[2].expression.value.should.be.eql('3');
        });
    });
});
