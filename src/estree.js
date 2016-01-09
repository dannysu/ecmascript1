'use strict';

const e = exports;

class Node {
    constructor(type) {
        this.type = type;
        this.loc = null; // TODO: For now avoid dealing with location information. Fix it later.
    }
}

class Program extends Node {
    constructor(body) {
        super('Program');
        this.body = body;
    }
}

class Expression extends Node {
    constructor(type) {
        super(type);
    }
}

class Literal extends Expression {
    constructor(value) {
        super('Literal');
        this.value = value;
    }
}

class SequenceExpression extends Expression {
    constructor(expressions) {
        super('SequenceExpression');
        this.expressions = expressions;
    }
}

class Statement extends Node {
    constructor(type) {
        super(type);
    }
}

class BlockStatement extends Statement {
    constructor(statements) {
        super('BlockStatement');
        this.body = statements;
    }
}

class EmptyStatement extends Statement {
    constructor() {
        super('EmptyStatement');
    }
}

class ExpressionStatement extends Statement {
    constructor(expression) {
        super('ExpressionStatement');
        this.expression = expression;
    }
}

class IfStatement extends Statement {
    constructor(test, consequent, alternate) {
        super('IfStatement');
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class WhileStatement extends Statement {
    constructor(test, body) {
        super('WhileStatement');
        this.test = test;
        this.body = body;
    }
}

class ForStatement extends Statement {
    constructor(init, test, update, body) {
        super('ForStatement');
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
    }
}

class ForInStatement extends Statement {
    constructor(left, right, body) {
        super('ForInStatement');
        this.left = left;
        this.right = right;
        this.body = body;
    }
}

class WithStatement extends Statement {
    constructor(test, body) {
        super('WithStatement');
        this.test = test;
        this.body = body;
    }
}

class Declaration extends Statement {
    constructor(type) {
        super(type);
    }
}

class VariableDeclaration extends Declaration {
    constructor(declarations) {
        super('VariableDeclaration');
        this.declarations = declarations;
        this.kind = "var";
    }
}

class VariableDeclarator extends Node {
    constructor(identifier, initialValue) {
        super('VariableDeclarator');
        this.id = identifier;
        this.init = initialValue;
    }
}

e.Program = Program;
e.Literal = Literal;
e.SequenceExpression = SequenceExpression;
e.BlockStatement = BlockStatement;
e.EmptyStatement = EmptyStatement;
e.ExpressionStatement = ExpressionStatement;
e.IfStatement = IfStatement;
e.WhileStatement = WhileStatement;
e.ForStatement = ForStatement;
e.ForInStatement = ForInStatement;
e.WithStatement = WithStatement;
e.VariableDeclaration = VariableDeclaration;
e.VariableDeclarator = VariableDeclarator;
