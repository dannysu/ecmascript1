'use strict';

const util = require('util');

const Lexer = require('./lexer.js');
const tokenTypes = require('./token.js').tokenTypes;
const estree = require('./estree.js');

const e = exports;

const operatorPrecedence = {
    '||': 0,
    '&&': 1,
    '|': 2,
    '^': 3,
    '&': 4,
    '==': 5,
    '!=': 5,
    '<': 6,
    '>': 6,
    '<=': 6,
    '=>': 6,
    '<<': 7,
    '>>': 7,
    '>>>': 7,
    '+': 8,
    '-': 8,
    '*': 9,
    '/': 9,
    '%': 9
};

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
p.expectIdentifier = function() {
    const token = this.consume();
    if (token.type !== tokenTypes.identifier) {
        throw new SyntaxError(`Expecting Identifier, but got ${token.type} with value: ${token.value}`);
    }

    return new estree.Identifier(token.value);
};

p.expectKeywords = function(keywords) {
    const token = this.consume();
    if (token.type !== tokenTypes.keyword) {
        throw new SyntaxError(`Expecting Keyword, but got ${token.type} with value: ${token.value}`);
    }

    if (Array.isArray(keywords)) {
        if (keywords.indexOf(token.value) < 0) {
            throw new SyntaxError(`Expected: ${keywords}    Actual: ${token.value}`);
        }
    }
    else if (keywords !== token.value) {
        throw new SyntaxError(`Expected: ${keywords}    Actual: ${token.value}`);
    }

    return token;
};

p.expectPunctuators = function(punctuators) {
    const token = this.consume();
    if (token.type !== tokenTypes.punctuator) {
        throw new SyntaxError(`Expecting Punctuator, but got ${token.type} with value: ${token.value}`);
    }

    if (Array.isArray(punctuators)) {
        if (punctuators.indexOf(token.value) < 0) {
            throw new SyntaxError(`Expected: ${punctuators}    Actual: ${token.value}`);
        }
    }
    else if (punctuators !== token.value) {
        throw new SyntaxError(`Expected: ${punctuators}    Actual: ${token.value}`);
    }

    return token;
};

p.expectLiteral = function() {
    const token = this.consume();
    if (!isLiteral(token)) {
        throw new SyntaxError(`Expecting Literal, but got ${token.type} with value: ${token.value}`);
    }

    return new estree.Literal(token.value);
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
        this.matchKeywords(["if", "var", "with", "while", "for", "continue", "break", "return"]) ||
        this.matchAssignmentExpression();
};

p.matchPrimaryExpression = function() {
    return this.matchKeywords("this") ||
        this.matchLiteral() ||
        this.matchIdentifier() ||
        this.matchPunctuators("(");
};

p.matchUnaryExpression = function() {
    return this.matchKeywords(["delete", "void", "typeof"]) ||
        this.matchPunctuators(["++", "--", "+", "-", "~", "!"]);
};

p.matchAssignmentExpression = function() {
    return this.matchUnaryExpression() ||
        this.matchLeftHandSideExpression();
};

p.matchMemberExpression = function() {
    return this.matchPrimaryExpression() ||
        this.matchKeywords("new");
};

p.matchLeftHandSideExpression = p.matchMemberExpression;

/*
 * Actual recursive descent part of things
 */
p.parsePrimaryExpression = function() {
    if (this.matchKeywords("this")) {
        this.expectKeywords("this");
        return new estree.ThisExpression();
    }
    else if (this.matchLiteral()) {
        return this.expectLiteral();
    }
    else if (this.matchIdentifier()) {
        return this.expectIdentifier();
    }
    else if (this.matchPunctuators("(")) {
        this.expectPunctuators("(");
        const expression = this.parseExpression();
        this.expectPunctuators(")");
        return expression;
    }
    return null;
};

p.parseArguments = function() {
    const args = [];

    this.expectPunctuators("(");

    if (this.matchAssignmentExpression()) {
        args.push(this.parseAssignmentExpression());
        while (this.matchPunctuators(",")) {
            args.push(this.parseAssignmentExpression());
        }
    }

    this.expectPunctuators(")");

    return args;
};

p.parseRemainingMemberExpression = function(object) {
    while (this.matchPunctuators([".", "["])) {
        if (this.matchPunctuators(".")) {
            this.expectPunctuators(".");
            const identifier = this.expectIdentifier();
            object = new estree.MemberExpression(object, identifier, false);
        }
        else {
            this.expectPunctuators("[");
            const expression = this.parseExpression();
            this.expectPunctuators("]");
            object = new estree.MemberExpression(object, expression, true);
        }
    }

    return object;
};

p.parseRemainingCallExpression = function(object) {
    let args = this.parseArguments();
    object = new estree.CallExpression(object, args);

    while (this.matchPunctuators([".", "[", "("])) {
        if (this.matchPunctuators(".")) {
            this.expectPunctuators(".");
            const identifier = this.expectIdentifier();
            object = new estree.MemberExpression(object, identifier, false);
        }
        else if (this.matchPunctuators("[")) {
            this.expectPunctuators("[");
            const expression = this.parseExpression();
            this.expectPunctuators("]");
            object = new estree.MemberExpression(object, expression, true);
        }
        else if (this.matchPunctuators("(")) {
            args = this.parseArguments();
            object = new estree.CallExpression(object, args);
        }
    }

    return object;
};

p.parseNewOrCallOrMemberExpression = function(couldBeNewExpression, couldBeCallExpression) {
    let object = null;

    if (this.matchKeywords("new")) {
        this.expectKeywords("new");
        const result = this.parseNewOrCallOrMemberExpression(couldBeNewExpression, false);
        couldBeNewExpression = result.couldBeNewExpression;

        let args = [];

        if (!couldBeNewExpression || this.matchPunctuators("(")) {
            args = this.parseArguments();

            // As soon as ( Arguments ) is encountered, then we're no longer
            // parsing at the NewExpression level.
            // Also, if couldBeNewExpression is false, then always try to
            // parse Arguments it has to be there.
            couldBeNewExpression = false;
        }

        object = new estree.NewExpression(result.object, args);
    }
    else {
        object = this.parsePrimaryExpression();
    }

    object = this.parseRemainingMemberExpression(object);

    // If at the end of trying to parse MemberExpression we see Arguments
    // again, then that means this is a CallExpression instead.
    if (this.matchPunctuators("(") && couldBeCallExpression) {
        couldBeNewExpression = false;
        object = this.parseRemainingCallExpression(object);
    }

    return {
        object: object,
        couldBeNewExpression: couldBeNewExpression
    };
};

p.parseLeftHandSideExpression = function() {
    return this.parseNewOrCallOrMemberExpression(true, true).object;
};

p.parsePostfixExpression = function() {
    let lhs = true;
    let expression = this.parseLeftHandSideExpression();

    // TODO: Deny line terminator here

    if (this.matchPunctuators("++")) {
        lhs = false;
        this.expectPunctuators("++");
        expression = new estree.UpdateExpression("++", expression, false);
    }
    else if (this.matchPunctuators("--")) {
        lhs = false;
        this.expectPunctuators("--");
        expression = new estree.UpdateExpression("--", expression, false);
    }

    return {
        ast: expression,
        lhs: lhs
    };
};

p.parseUnaryExpression = function() {
    const unaryKeywords = ["delete", "void", "typeof"];
    const unaryPunctuators = ["++", "--", "+", "-", "~", "!"];

    if (this.matchKeywords(unaryKeywords)) {
        const operatorToken = this.expectKeywords(unaryKeywords);
        const argument = this.parseUnaryExpression();
        return {
            ast: estree.UnaryExpression(operatorToken.value, argument.ast, true),
            lhs: false
        }
    }
    else if (this.matchPunctuators(unaryPunctuators)) {
        const operatorToken = this.expectPunctuators(unaryPunctuators);
        const argument = this.parseUnaryExpression();

        let ast;
        if (operatorToken.value === '++' || operatorToken.value === '--') {
            ast = new estree.UpdateExpression(operatorToken.value, argument.ast, true);
        }
        else {
            ast = new estree.UnaryExpression(operatorToken.value, argument.ast, true);
        }

        return {
            ast: ast,
            lhs: false
        };
    }
    else {
        return this.parsePostfixExpression();
    }
};

// Uses precedence climbing to deal with binary expressions, all of which have
// left-to-right associtivity in this case.
p.parseBinaryExpression = function(minPrecedence) {
    const punctuators = [
        '||', '&&', '|', '^', '&', '==', '!=', '<', '>', '<=', '=>',
        '<<', '>>', '>>>', '+', '-', '*', '/', '%'
    ];

    const result = this.parseUnaryExpression();
    let ast = result.ast;
    let lhs = result.lhs

    while (this.matchPunctuators(punctuators) &&
           operatorPrecedence[this.next().value] >= minPrecedence) {

        // If any operator is encountered, then the result cannot be
        // LeftHandSideExpression anymore
        lhs = false;

        const precedenceLevel = operatorPrecedence[this.next().value];
        const operatorToken = this.expectPunctuators(punctuators);

        const right = this.parseBinaryExpression(precedenceLevel + 1);
        if (operatorToken.value === '||' || operatorToken.value === '&&') {
            ast = new estree.LogicalExpression(operatorToken.value, ast, right.ast);
        }
        else {
            ast = new estree.BinaryExpression(operatorToken.value, ast, right.ast);
        }
    }

    return {
        ast: ast,
        lhs: lhs
    };
};

p.parseConditionalExpression = function() {
    const result = this.parseBinaryExpression(0);
    let ast = result.ast;
    let lhs = result.lhs;

    if (this.matchPunctuators("?")) {
        this.expectPunctuators("?");
        const consequent = this.parseAssignmentExpression();
        this.expectPunctuators(":");
        const alternate = this.parseAssignmentExpression();

        ast = new estree.ConditionalExpression(ast, consequent, alternate);
        lhs = false;
    }

    return {
        ast: ast,
        lhs: lhs
    };
};

p.parseAssignmentExpression = function() {
    // Won't know immediately whether to parse as ConditionalExpression or
    // LeftHandSideExpression. We'll only know later on during parsing if we
    // come across things that cannot be in LeftHandSideExpression.
    const result = this.parseConditionalExpression();
    if (result.lhs) {
        // Once it is determined that the parse result yielded
        // LeftHandSideExpression though, then we can parse the remaining
        // AssignmentExpression with that knowledge
        const assignmentOperators = ["=", "*=", "/=", "%=", "+=", "-=", "<<=",
            ">>=", ">>>=", "&=", "^=", "|="];
        if (this.matchPunctuators(assignmentOperators)) {
            const left = result.ast;
            const operatorToken = this.expectPunctuators(assignmentOperators);
            const right = this.parseAssignmentExpression();
            return new estree.AssignmentExpression(operatorToken.value, left, right);
        }
        else {
            return result.ast;
        }
    }
    else {
        return result.ast;
    }
};

p.parseExpression = function(optional) {
    const expressions = [];

    let expression = this.parseAssignmentExpression();
    if (expression !== null) {
        expressions.push(expression);
    }
    else if (!optional) {
        const token = this.next();
        throw new SyntaxError(`Expecting AssignmentExpression, but got ${token.type} with value: ${token.value}`);
    }

    while (this.matchPunctuators(",")) {
        this.expectPunctuators(",");
        expression = this.parseAssignmentExpression();
        if (expression !== null) {
            expressions.push(expression);
        }
        else if (!optional) {
            const token = this.next();
            throw new SyntaxError(`Expecting AssignmentExpression, but got ${token.type} with value: ${token.value}`);
        }
    }

    if (expressions.length > 1) {
        return new estree.SequenceExpression(expressions);
    }
    else if (expressions.length === 1) {
        return expressions[0];
    }
    else if (optional) {
        return null;
    }
    else {
        throw new Error(`Shouldn't ever be here`);
    }
};

p.parseVariableDeclaration = function() {
    const identifier = this.expectIdentifier();
    let assignment = null;
    if (this.matchPunctuators("=")) {
        this.expectPunctuators("=");
        assignment = this.parseAssignmentExpression();
        if (assignment === null) {
            const token = this.next();
            throw new SyntaxError(`Expecting AssignmentExpression, but got ${token.type} with value: ${token.value}`);
        }
    }

    return {
        identifier: identifier,
        assignment: assignment
    };
};

p.parseVariableDeclarationList = function() {
    const declarations = [];

    // Destructuring not yet on by default in nodejs
    let declarator = this.parseVariableDeclaration();
    let identifier = declarator.identifier;
    let assignment = declarator.assignment;
    declarations.push(new estree.VariableDeclarator(identifier, assignment));
    while (this.matchPunctuators(",")) {
        this.expectPunctuators(",");
        declarator = this.parseVariableDeclaration();
        identifier = declarator.identifier;
        assignment = declarator.assignment;
        declarations.push(new estree.VariableDeclarator(identifier, assignment));
    }

    return new estree.VariableDeclaration(declarations);
};

p.parseBlock = function(insideIteration, insideFunction) {
    const statements = [];

    this.expectPunctuators("{");

    while (this.matchStatement()) {
        statements.push(this.parseStatement(insideIteration, insideFunction));
    }

    this.expectPunctuators("}");

    return new estree.BlockStatement(statements);
};

p.parseVariableStatement = function() {
    this.expectKeywords("var");
    const ast = this.parseVariableDeclarationList();
    this.expectPunctuators(";");
    return ast;
};

p.parseExpressionStatement = function() {
    const expression = this.parseExpression();
    this.expectPunctuators(";");
    return new estree.ExpressionStatement(expression);
};

p.parseIfStatement = function(insideIteration, insideFunction) {
    this.expectKeywords("if");
    this.expectPunctuators("(");

    const test = this.parseExpression()

    this.expectPunctuators(")");

    const consequent = this.parseStatement(insideIteration, insideFunction);
    if (consequent === null) {
        throw new SyntaxError('Expecting statement for if-statement');
    }

    let alternate = null;

    if (this.matchKeywords("else")) {
        this.expectKeywords("else");
        alternate = this.parseStatement(insideIteration, insideFunction);
        if (alternate === null) {
            throw new SyntaxError('Expecting statement for else block in if-statement');
        }
    }

    return new estree.IfStatement(test, consequent, alternate);
};

p.parseWhileStatement = function() {
    this.expectKeywords("while");
    this.expectPunctuators("(");

    const test = this.parseExpression()

    this.expectPunctuators(")");

    const statement = this.parseStatement(true);
    if (statement === null) {
        throw new SyntaxError('Expecting statement for while-statement');
    }

    return new estree.WhileStatement(test, statement);
};

p.parseForStatement = function() {
    this.expectKeywords("for");
    this.expectPunctuators("(");

    let isForInStatement = false;

    let left = null, right = null;
    let init = null, test = null, update = null;

    if (this.matchKeywords("var")) {
        // Can be either of the following forms:
        // for ( var VariableDeclarationList ; Expression(opt) ; Expression(opt) ) Statement
        // for ( var Identifier Initializer(opt) in Expression ) Statement

        this.expectKeywords("var");
        const ast = this.parseVariableDeclarationList();
        if (this.matchKeywords("in")) {
            isForInStatement = true;
            left = ast;

            // Make sure the ast contains only one identifier and at most one initializer
            if (ast.declarations.length !== 1) {
                throw new SyntaxError(`Expecting only one Identifier and at most one Initializer in a ForIn statement`);
            }

            this.expectKeywords("in");

            right = this.parseExpression();
        }
        else {
            init = ast;

            this.expectPunctuators(";");

            test = this.parseExpression(true);
            this.expectPunctuators(";");

            update = this.parseExpression(true);
        }
    }
    else {
        // Can be either of the following forms:
        // for ( Expression(opt) ; Expression(opt) ; Expression(opt) ) Statement
        // for ( LeftHandSideExpression in Expression ) Statement
        init = left = this.parseExpression(true);

        if (this.matchPunctuators(";")) {
            this.expectPunctuators(";");

            test = this.parseExpression(true);
            this.expectPunctuators(";");

            update = this.parseExpression(true);
        }
        else {
            isForInStatement = true;
            this.expectKeywords("in");

            right = this.parseExpression();
        }
    }

    this.expectPunctuators(")");

    const statement = this.parseStatement(true);
    if (statement === null) {
        throw new SyntaxError('Expecting statement for for-statement');
    }

    if (isForInStatement) {
        return new estree.ForInStatement(left, right, statement);
    }
    else {
        return new estree.ForStatement(init, test, update, statement);
    }
};

p.parseIterationStatement = function() {
    if (this.matchKeywords("while")) {
        return this.parseWhileStatement();
    }
    else {
        return this.parseForStatement();
    }
};

p.parseWithStatement = function(insideIteration, insideFunction) {
    this.expectKeywords("with");
    this.expectPunctuators("(");

    const test = this.parseExpression()

    this.expectPunctuators(")");

    const statement = this.parseStatement(insideIteration, insideFunction);
    if (statement === null) {
        throw new SyntaxError('Expecting statement for with-statement');
    }

    return new estree.WithStatement(test, statement);
};

p.parseContinueStatement = function() {
    this.expectKeywords("continue");
    this.expectPunctuators(";");
    return new estree.ContinueStatement();
};

p.parseBreakStatement = function() {
    this.expectKeywords("break");
    this.expectPunctuators(";");
    return new estree.BreakStatement();
};

p.parseReturnStatement = function() {
    this.expectKeywords("return");
    let expression = null;
    if (this.matchAssignmentExpression()) {
        expression = this.parseAssignmentExpression();
    }
    this.expectPunctuators(";");

    return new estree.ReturnStatement(expression);
};

p.parseStatement = function(insideIteration, insideFunction) {
    // Parse Block
    if (this.matchPunctuators("{")) {
        return this.parseBlock(insideIteration, insideFunction);
    }
    // Parse Variable Statement
    else if (this.matchKeywords("var")) {
        return this.parseVariableStatement();
    }
    // Parse Empty Statement
    else if (this.matchPunctuators(";")) {
        this.expectPunctuators(";");
        return new estree.EmptyStatement();
    }
    // Parse Expression Statement
    else if (this.matchAssignmentExpression()) {
        return this.parseExpressionStatement();
    }
    // Parse If Statement
    else if (this.matchKeywords("if")) {
        return this.parseIfStatement(insideIteration, insideFunction);
    }
    // Parse Iteration Statement
    else if (this.matchKeywords("while") ||
             this.matchKeywords("for")) {
        return this.parseIterationStatement();
    }
    // Parse With Statement
    else if (this.matchKeywords("with")) {
        return this.parseWithStatement(insideIteration, insideFunction);
    }
    else if (this.matchKeywords("continue")) {
        if (insideIteration) {
            return this.parseContinueStatement();
        }
        else {
            throw new SyntaxError(`continue; statement can only be inside an iteration`);
        }
    }
    else if (this.matchKeywords("break")) {
        if (insideIteration) {
            return this.parseBreakStatement();
        }
        else {
            throw new SyntaxError(`break; statement can only be inside an iteration`);
        }
    }
    else if (this.matchKeywords("return")) {
        if (insideFunction) {
            return this.parseReturnStatement();
        }
        else {
            throw new SyntaxError(`return statement can only be inside a function`);
        }
    }
    else {
        throw new SyntaxError(`Unexpected token`);
    }
};

p.parseFunction = function() {
    this.expectKeywords("function");

    // Parse name of the function
    const identifier = this.expectIdentifier();

    let parameters = [];

    this.expectPunctuators("(");

    // Parse optional parameter list
    if (this.matchIdentifier()) {
        parameters.push(this.expectIdentifier());
        while (this.matchPunctuators(",")) {
            this.expectPunctuators(",");
            parameters.push(this.expectIdentifier());
        }
    }

    this.expectPunctuators(")");

    // Parse function body
    const body = this.parseBlock(false, true);

    return new estree.FunctionDeclaration(identifier, parameters, body);
};

p.parseSourceElement = function() {
    if (this.matchKeywords("function")) {
        return this.parseFunction();
    }
    else {
        return this.parseStatement(false, false);
    }
}

p.parseProgram = function() {
    const body = [];

    body.push(this.parseSourceElement());

    // Check to see if there are more SourceElement
    while (this.matchStatement() || this.matchKeywords("function")) {
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
