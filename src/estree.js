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

class Identifier extends Expression {
    constructor(value) {
        super('Identifier');
        this.value = value;
    }
}

class Literal extends Expression {
    constructor(value) {
        super('Literal');
        this.value = value;
    }
}

class ThisExpression extends Expression {
    constructor() {
        super('ThisExpression');
    }
}

class UnaryExpression extends Expression {
    constructor(operator, argument, prefix) {
        super('UnaryExpression');
        this.operator = operator;
        this.argument = argument;
        this.prefix = prefix;
    }
}

class UpdateExpression extends Expression {
    constructor(operator, argument, prefix) {
        super('UpdateExpression');
        this.operator = operator;
        this.argument = argument;
        this.prefix = prefix;
    }
}

class BinaryExpression extends Expression {
    constructor(operator, left, right) {
        super('BinaryExpression');
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class AssignmentExpression extends Expression {
    constructor(operator, left, right) {
        super('AssignmentExpression');
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class LogicalExpression extends Expression {
    constructor(operator, left, right) {
        super('LogicalExpression');
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class MemberExpression extends Expression {
    constructor(object, property, computed) {
        super('MemberExpression');
        this.object = object;
        this.property = property;
        this.computed = computed;
    }
}

class ConditionalExpression extends Expression {
    constructor(test, consequent, alternate) {
        super('ConditionalExpression');
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class CallExpression extends Expression {
    constructor(callee, args) {
        super('CallExpression');
        this.callee = callee;
        this.arguments = args;
    }
}

class NewExpression extends Expression {
    constructor(callee, args) {
        super('NewExpression');
        this.callee = callee;
        this.arguments = args;
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

class ContinueStatement extends Statement {
    constructor(expression) {
        super('ContinueStatement');
    }
}

class BreakStatement extends Statement {
    constructor(expression) {
        super('BreakStatement');
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
e.Identifier = Identifier;
e.Literal = Literal;
e.ThisExpression = ThisExpression;
e.UnaryExpression = UnaryExpression;
e.UpdateExpression = UpdateExpression;
e.BinaryExpression = BinaryExpression;
e.AssignmentExpression = AssignmentExpression;
e.LogicalExpression = LogicalExpression;
e.MemberExpression = MemberExpression;
e.ConditionalExpression = ConditionalExpression;
e.CallExpression = CallExpression;
e.NewExpression = NewExpression;
e.SequenceExpression = SequenceExpression;
e.BlockStatement = BlockStatement;
e.EmptyStatement = EmptyStatement;
e.ExpressionStatement = ExpressionStatement;
e.ContinueStatement = ContinueStatement;
e.BreakStatement = BreakStatement;
e.IfStatement = IfStatement;
e.WhileStatement = WhileStatement;
e.ForStatement = ForStatement;
e.ForInStatement = ForInStatement;
e.WithStatement = WithStatement;
e.VariableDeclaration = VariableDeclaration;
e.VariableDeclarator = VariableDeclarator;
