'use strict';

const should = require('should');

const lexer = require('../../src/lexer.js');
const codemirror = require('../codemirror-string.js');

describe('lexer', function() {
    describe('parse CodeMirror code', function() {
        it('should succeed', function() {
            lexer.setInput(codemirror.codemirror30);
        });
    });
});
