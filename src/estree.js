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

e.Program = Program;
e.Literal = Literal;
e.SequenceExpression = SequenceExpression;
e.EmptyStatement = EmptyStatement;
e.ExpressionStatement = ExpressionStatement;
