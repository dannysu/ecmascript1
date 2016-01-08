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
p.expectKeywords = function(keywords) {
    const token = this.consume();
    if (token.type !== tokenTypes.keyword) {
        throw new SyntaxError('TODO');
    }

    if (Array.isArray(keywords)) {
        if (keywords.indexOf(token.value) < 0) {
            throw new SyntaxError('TODO');
        }
    }
    else if (keywords !== token.value) {
        throw new SyntaxError('TODO');
    }

    // TODO: Add to AST
};

p.expectPunctuators = function(punctuators) {
    const token = this.consume();
    if (token.type !== tokenTypes.punctuator) {
        throw new SyntaxError('TODO');
    }

    if (Array.isArray(punctuators)) {
        if (punctuators.indexOf(token.value) < 0) {
            throw new SyntaxError('TODO');
        }
    }
    else if (punctuators !== token.value) {
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

p.matchKeywords = function(keywords) {
    const token = this.next();
    if (token.type !== tokenTypes.keyword) {
        return false;
    }

    if (Array.isArray(keywords)) {
        return keywords.indexOf(token.value) >= 0;
    }
    else {
        return keywords === token.value;
    }
};

p.matchPunctuators = function(punctuators) {
    const token = this.next();
    if (token.type !== tokenTypes.punctuator) {
        return false;
    }

    if (Array.isArray(punctuators)) {
        return punctuators.indexOf(token.value) >= 0;
    }
    else {
        return punctuators === token.value;
    }
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
    return this.matchPunctuators(";") ||
        this.matchKeywords("if") ||
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
};

p.parseAssignmentExpression = function() {
    return this.parsePrimaryExpression();
};

p.parseBlock = function() {
    const statements = [];

    this.expectPunctuators("{");

    while (this.matchStatement()) {
        statements.push(this.parseStatement());
    }

    this.expectPunctuators("}");

    return new estree.BlockStatement(statements);
};

p.parseExpression = function() {
    const expressions = [];

    expressions.push(this.parseAssignmentExpression());
    while (this.matchPunctuators(",")) {
        this.expectPunctuators(",");
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
    this.expectPunctuators(";");
    return new estree.ExpressionStatement(expression);
};

p.parseIfStatement = function() {
    this.expectKeywords("if");
    this.expectPunctuators("(");

    const test = this.parseExpression()

    this.expectPunctuators(")");

    const consequent = this.parseStatement();
    if (consequent === null) {
        throw new SyntaxError('Expecting statement for if-statement');
    }

    let alternate = null;

    if (this.matchKeywords("else")) {
        this.expectKeywords("else");
        alternate = this.parseStatement();
        if (alternate === null) {
            throw new SyntaxError('Expecting statement for else block in if-statement');
        }
    }

    return new estree.IfStatement(test, consequent, alternate);
};

p.parseStatement = function() {
    // Parse Block
    if (this.matchPunctuators("{")) {
        return this.parseBlock();
    }
    // Parse EmptyStatement
    else if (this.matchPunctuators(";")) {
        this.expectPunctuators(";");
        return new estree.EmptyStatement();
    }
    // Parse ExpressionStatement
    else if (this.matchAssignmentExpression()) {
        return this.parseExpressionStatement();
    }
    // Parse IfStatement
    else if (this.matchKeywords("if")) {
        return this.parseIfStatement();
    }

    // TODO: Need to parse other types of statements
    return null;
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
