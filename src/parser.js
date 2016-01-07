'use strict';

const util = require('util');

const Lexer = require('./lexer.js');
const tokenTypes = require('./token.js').tokenTypes;
const estree = require('./estree.js');

const e = exports;

function Parser(sourceText) {
    this.tokens = [];
    this.lexer = new Lexer(sourceText);
}

const p = Parser.prototype;

/*
 * Lexer Interactions
 */
// Returns the next token
p.next = function() {
    if (this.tokens.length > 0) {
        return this.tokens[0];
    }
    else {
        const token = this.lexer.nextToken();
        this.tokens.push(token);
        return token;
    }
};

p.consume = function() {
    if (this.tokens.length === 0) {
        this.next();
    }
    const token = this.tokens.shift();
    return token;
};

/*
 * Helper Functions
 */
p.expectPunctuator = function(punctuator) {
    return this.expectPunctuators([punctuator]);
};

p.expectPunctuators = function(punctuators) {
    const token = this.consume();
    if (token.type !== tokenTypes.punctuator) {
        throw new SyntaxError('TODO');
    }

    if (punctuators.indexOf(token.value) < 0) {
        throw new SyntaxError('TODO');
    }

    // TODO: Add to AST
};

p.expectLiteral = function() {
    const token = this.consume();
    if (!isLiteral(token)) {
        throw new SyntaxError('TODO');
    }

    return token;
}

p.matchPunctuator = function(punctuator) {
    return this.matchPunctuators([punctuator]);
};

p.matchPunctuators = function(punctuators) {
    const token = this.next();
    if (token.type !== tokenTypes.punctuator) {
        return false;
    }

    return punctuators.indexOf(token.value) >= 0;
};

p.matchIdentifier = function() {
    const token = this.next();
    return (token.type === tokenTypes.identifier);
};

function isLiteral(token) {
    return (token.type === tokenTypes.stringLiteral) ||
        (token.type === tokenTypes.numericLiteral) ||
        (token.type === tokenTypes.nullLiteral) ||
        (token.type === tokenTypes.booleanLiteral);
}

p.matchLiteral = function() {
    const token = this.next();
    return isLiteral(token);
};

p.matchStatement = function() {
    return this.matchPunctuator(";") ||
        this.matchAssignmentExpression();
};

p.matchPrimaryExpression = function() {
    return this.matchIdentifier() || this.matchLiteral();
};

p.matchAssignmentExpression = function() {
    return this.matchPrimaryExpression();
};

/*
 * Actual recursive descent part of things
 */
p.parsePrimaryExpression = function() {
    if (this.matchLiteral()) {
        const token = this.expectLiteral();
        return new estree.Literal(token.value);
    }
}

p.parseAssignmentExpression = function() {
    return this.parsePrimaryExpression();
}

p.parseExpression = function() {
    const expressions = [];

    expressions.push(this.parseAssignmentExpression());
    while (this.matchPunctuator(",")) {
        this.expectPunctuator(",");
        expressions.push(this.parseAssignmentExpression());
    }

    if (expressions.length > 1) {
        return new estree.SequenceExpression(expressions);
    }
    else {
        return new estree.Literal(expressions[0].value);
    }
};

p.parseExpressionStatement = function() {
    const expression = this.parseExpression();
    this.expectPunctuator(";");
    return new estree.ExpressionStatement(expression);
};

p.parseStatement = function() {
    // Parse EmptyStatement
    if (this.matchPunctuator(";")) {
        this.expectPunctuator(";");
        return new estree.EmptyStatement();
    }
    // Parse ExpressionStatement
    else if (this.matchAssignmentExpression()) {
        return this.parseExpressionStatement();
    }

    // TODO: Need to parse other types of statements
};

p.parseSourceElement = function() {
    // TODO: Need to parse function declaration at some point
    return this.parseStatement();
}

p.parseProgram = function() {
    const body = [];

    body.push(this.parseSourceElement());

    // Check to see if there are more SourceElement
    while (this.matchStatement()) {
        body.push(this.parseSourceElement());
    }

    if (this.tokens.length >= 1 && this.tokens[0].type !== tokenTypes.eof) {
        throw new SyntaxError("Didn't consume all tokens: " + util.inspect(this.tokens[0]));
    }

    return new estree.Program(body);
};

function parse(sourceText) {
    const parser = new Parser(sourceText);
    return parser.parseProgram();
}

e.parse = parse;
