/* description: Parses a C# class. */

/* lexical grammar */
%lex
%options flex

%{
/* 1. Namespace dependency */
var namespaceDependecies = []; // current conventions says it is RECOMMENDED to declare namespace dependencies at file level and to apply them to all classes in the source file.
if (!('addNamespace' in yy)) {
	yy.addNamespace = function addNamespace(name) {
		namespaceDependecies.push({
			name: name
		});
	};
}
/* 2. Namespace declaration */
var currentNamespaceDeclaration = ''; // current convention says it is RECOMMENDED to have only one namespace declaration per source file.
if (!('setCurrentNamespaceDeclaration' in yy)) {
	yy.setCurrentNamespaceDeclaration = function setCurrentNamespaceDeclaration(name) {
		currentNamespaceDeclaration = name;
	};
}
if (!('removeCurrentNamespaceDeclaration' in yy)) {
	yy.removeCurrentNamespaceDeclaration = function removeCurrentNamespaceDeclaration() {
		currentNamespaceDeclaration = '';
	};
}
/* Misc: modifiers */
var modifiers = [];
if (!('addModifier' in yy)) {
	yy.addModifier = function addModifier(name) {
		modifiers.push(name);
	};
}
/* 3. Class declaration */
var classDeclarations = [];
var currentClassName = '';
var currentClassModifiers = [];
var fields = [];
var properties = [];
var propertyAccessors = [];
var constructors = [];
var currentConstructorName = "";
var currentConstructorModifiers = [];
var currentConstructorFixedParameters = [];
var statements = [];
var declaredVariables = [];
if (!('beginCurrentClassDeclaration' in yy)) {
	yy.beginCurrentClassDeclaration = function beginCurrentClassDeclaration(name) {
		currentClassName = name;
		currentClassModifiers = modifiers;
		// Cleanup modifiers
		modifiers = [];
	};
}
if (!('endCurrentClassDeclaration' in yy)) {
	yy.endCurrentClassDeclaration = function endCurrentClassDeclaration() {
		classDeclarations.push({
			namespaceDependecies : namespaceDependecies,
			namespace : currentNamespaceDeclaration,
			name : currentClassName,
			modifiers : currentClassModifiers,
			/*TODO: parents/inheritances*/
			fields : fields,
			properties: properties,
			constructors: constructors
			/*TODO: continue with others*/
		});
		// Cleanup after class declaration
		currentClassName = '';
		currentClassModifiers = [];
		fields = [];
		properties = [];
	};
}
/* 3.1 Field declaration */
if (!('addField' in yy)) {
	yy.addField = function addField(type, name) {
		fields.push({
			type: type,
			name: name,
			modifiers : modifiers
		});
		// Cleanup modifiers
		modifiers = [];
	};
}
/* 3.2 Property declaration */
if (!('addPropertyAccessor' in yy)) {
	yy.addPropertyAccessor = function addPropertyAccessor(type) {
		propertyAccessors.push({
			type: type,
			body: statements.length > 0 ? statements : undefined // functionality not yet supported
		});
		// Cleanup
		statements = [];
	};
}
if (!('addProperty' in yy)) {
	yy.addProperty = function addProperty(type, name) {
		properties.push({
			type: type,
			name: name,
			modifiers : modifiers,
			accessors : propertyAccessors
		});
		// Cleanup after property
		modifiers = [];
		propertyAccessors = [];
	};
}
/* 3.3 Constructor declaration */
if (!('beginCurrentConstructorDeclaration' in yy)) {
	yy.beginCurrentConstructorDeclaration = function beginCurrentConstructorDeclaration(name) {
		currentConstructorName = name;
		currentConstructorModifiers = modifiers;
		// Cleanup modifiers
		modifiers = [];
	}
}
if (!('addFixedParameter' in yy)) {
	yy.addFixedParameter = function addFixedParameter(type, name, modifier = "") {
		currentConstructorFixedParameters.push({
			type: type,
			name: name,
			modifier: modifier
		});
		// Cleanup modifiers
		modifiers = [];
	}
}
if (!('endCurrentConstructorDeclaration' in yy)) {
	yy.endCurrentConstructorDeclaration = function endCurrentConstructorDeclaration() {
		constructors.push({
			name: currentConstructorName,
			modifiers: currentConstructorModifiers,
			parameters: currentConstructorFixedParameters,
			declaredVariables: declaredVariables,
			statements: statements
		});
		// Cleanup after constructor declaration
		currentConstructorName = "";
		currentConstructorModifiers = [];
		currentConstructorFixedParameters = [];
		declaredVariables = [];
		statements = [];
	}
}
/* Statements */
var currentStatementUsedFieldsAndProperties = [];
var currentStatementUsedConstructors = [];
var currentStatementUsedMethods = [];
if (!('addVariableDeclaration' in yy)) {
	yy.addVariableDeclaration = function addVariableDeclaration(type, name) {
		declaredVariables.push({
			type: type,
			name: name
		});
	};
}
if (!('addStatement' in yy)) {
	yy.addStatement = function addStatement(text) {
		statements.push({
			statementText: text,
			usedFieldsAndProperties: currentStatementUsedFieldsAndProperties,
			usedConstructors: currentStatementUsedConstructors,
			usedMethods: currentStatementUsedMethods
		});
		// Cleanup
		currentStatementUsedFieldsAndProperties = [];
		currentStatementUsedConstructors = [];
		currentStatementUsedMethods = [];
	};
}
if (!('addUsedMethod' in yy)) {
	yy.addUsedMethod = function addUsedMethod(methodName) {
		currentStatementUsedMethods.push(methodName);
	};
}
if (!('addUsedFieldOrProperty' in yy)) {
	yy.addUsedFieldOrProperty = function addUsedFieldOrProperty(fieldOrPropertyName) {
		currentStatementUsedFieldsAndProperties.push(fieldOrPropertyName);
	};
}
if (!('addUsedConstructor' in yy)) {
	yy.addUsedConstructor = function addUsedConstructor(constructorName) {
		currentStatementUsedConstructors.push(constructorName);
	};
}

if (!('getParsedSourceFile' in yy)) {
	yy.getParsedSourceFile = function getParsedSourceFile() {
		return {
			classDeclarations : classDeclarations
		}
	};
}
%}

%%
\s+                   	/* skip whitespace */
(\'(\\)?.\') return 'CHARACTER_LITERAL';
(\".*(\\.)*.*\") return 'STRING_LITERAL';
([0-9]+(UL|Ul|uL|ul|LU|Lu|lU|lu|U|u|L|l)?) return 'DECIMAL_INTEGER';
((0x|0X)[0-9A-Fa-f]+(UL|Ul|uL|ul|LU|Lu|lU|lu|U|u|L|l)?) return 'HEXADECIMAL_INTEGER';
(([0-9]+)?(\.)?[0-9]+((e|E)(\+|\-)?[0-9]+)?(F|f|D|d|M|m)?) return 'REAL_NUMBER';
"using"				  	return 'USING';
"namespace"				return 'NAMESPACE';
"class"					return 'CLASS';
"new"					return 'NEW';
"public"				return 'PUBLIC';
"protected"				return 'PROTECTED';
"internal"				return 'INTERNAL';
"private"				return 'PRIVATE';
"static"				return 'STATIC';
'virtual'				return 'VIRTUAL';
'sealed'				return 'SEALED';
'override'				return 'OVERRIDE';
'abstract'				return 'ABSTRACT';
'extern'				return 'EXTERN';
"readonly"				return 'READONLY';
"volatile"				return 'VOLATILE';
"get"					return 'GET';
"set"					return 'SET';
"ref"					return 'REF';
"out"					return 'OUT';
"this"					return 'THIS';
"base"					return 'BASE';
"true"					return 'TRUE';
"false" 				return 'FALSE';
"null"					return 'NULL';
"is"					return 'IS';
"as"					return 'AS';
(bool|byte|char|decimal|double|float|int|long|object|sbyte|short|string|uint|ulong|ushort) return 'IDENTIFIER';
[_a-zA-Z]+[_a-zA-Z0-9]*	return 'IDENTIFIER';
<<EOF>>               	return 'EOF';
.						return yytext; /*returns the matched text*/
/lex

%start source_file

%% /* language grammar */
/* 0. Source file */
source_file
	: EOF /* in case the file is empty */
	| source_file_parts EOF
        {return yy.getParsedSourceFile();}
    ;
source_file_parts
	: source_file_parts source_file_part
	| source_file_part
	;
source_file_part
	: using_statement
	| namespace_declaration
	| class_declaration
	;
/* 1. Namespace dependency */
using_statement
	: USING qualified_identifier semicolon
		{yy.addNamespace($2);}
	;
/* 2. Namespace declaration */
namespace_declaration
	: NAMESPACE qualified_identifier _subroutine_add_current_namespace '{' namespace_body '}'
		{yy.removeCurrentNamespaceDeclaration();}
	;
_subroutine_add_current_namespace
	: /* empty */
		{yy.setCurrentNamespaceDeclaration($1);}
	;
namespace_body
	: /* empty */
	| namespace_members
	;
namespace_members
	: namespace_members namespace_member
	| namespace_member
	;
namespace_member
	: class_declaration
	/* TODO: add interface, struct, enum, delegate */
	;
/* 3. Class declaration */
class_declaration
	: modifiers CLASS IDENTIFIER _subroutine_add_current_class '{' class_body '}'
		{yy.endCurrentClassDeclaration();}
	| CLASS IDENTIFIER _subroutine_add_current_class '{' class_body '}'
		{yy.endCurrentClassDeclaration();}
	;
_subroutine_add_current_class
	: /* empty */
		{yy.beginCurrentClassDeclaration($1);}
	;
class_body
	: /* empty */
	| class_members
	;
class_members
	: class_members class_member
	| class_member
	;
class_member
	: field_declaration
	| property_declaration
	| constructor_declaration
	/* TODO: add method member */
	;
/* 3.1 Field declaration */
field_declaration
	: modifiers IDENTIFIER variable_declaration semicolon
		{yy.addField($2, $3);}
	| modifiers array_type variable_declaration semicolon
		{yy.addField($2, $3);}
	| IDENTIFIER variable_declaration semicolon
		{yy.addField($1, $2);}
	| array_type variable_declaration semicolon
		{yy.addField($1, $2);}
	;
variable_declaration
	: IDENTIFIER
	;
/* 3.2 Property declaration */
property_declaration
	: modifiers IDENTIFIER IDENTIFIER property_body
		{yy.addProperty($2, $3);}
	| modifiers array_type IDENTIFIER property_body
		{yy.addProperty($2, $3);}
	| IDENTIFIER IDENTIFIER property_body
		{yy.addProperty($1, $2);}
	| array_type IDENTIFIER property_body
		{yy.addProperty($1, $2);}
	;
property_body
	: '{' accessor_declarations '}'
	;
accessor_declarations
	: get_accessor_declaration set_accessor_declaration
	| set_accessor_declaration get_accessor_declaration
	| get_accessor_declaration
	| set_accessor_declaration
	;
get_accessor_declaration
	: modifier GET accessor_body
		{yy.addPropertyAccessor($2);}
	| GET accessor_body
		{yy.addPropertyAccessor($1);}
	;
set_accessor_declaration
	: modifier SET accessor_body
		{yy.addPropertyAccessor($2);}
	| SET accessor_body
		{yy.addPropertyAccessor($1);}
	;
accessor_body
	: semicolon
	| block
	;
/* 3.3 Constructor declaration */
constructor_declaration
	: modifiers constructor_declarator constructor_body
		{yy.endCurrentConstructorDeclaration();}
	| constructor_declarator constructor_body
		{yy.endCurrentConstructorDeclaration();}
	;
/* 3.3.1 Constructor declarator*/
constructor_declarator
	: IDENTIFIER _subroutine_add_current_constructor '(' formal_parameter_list ')'
	| IDENTIFIER _subroutine_add_current_constructor '(' ')'
	/*TODO: see about constructor initializer: base(...), this(...) */
	;
_subroutine_add_current_constructor
	: /* empty */
		{yy.beginCurrentConstructorDeclaration($1);}
	;
/* 3.3.2 Constructor body*/
constructor_body
	: block
	| semicolon
	;
block
	: '{' statement_list '}'
	| '{' '}'
	;
statement_list
	: statement_list statement
	| statement
	;
statement
	: variable_declaration_statement
	| embedded_statement
		{yy.addStatement($$);}
	;
/* 3.3.2.1 Variable declaration statement */
variable_declaration_statement
	: IDENTIFIER IDENTIFIER semicolon
		{yy.addVariableDeclaration($1, $2);}
	| array_type IDENTIFIER semicolon
		{yy.addVariableDeclaration($1, $2);}
	;
/* 3.3.2.2 Embedded statements */
embedded_statement
	: empty_statement
	| invocation_statement
	| assignment_statement

	/*TODO: follow up with the next ones*/
	/*selection_statement*/	
	/*iteration_statement*/	
	/*try_statement*/	
	;
/* 3.3.2.2.1 Empty statement */
empty_statement
	: semicolon
	;
/* 3.3.2.2.2 Invocation statement */
invocation_statement
	: invocation_expression semicolon
		{$$ = $1 + $2;}
	;
invocation_expression
	: expression_literal '(' argument_list ')'
		{$$ = $1 + $2 + $3 + $4;
		 yy.addUsedMethod($1);}
	| expression_literal '(' ')'
		{$$ = $1 + $2 + $3;
		 yy.addUsedMethod($1);}
	;
expression_literal
    : IDENTIFIER
    | member_access
    | this_access
    | base_access
    ;
/* 3.3.2.2.3 Assignment statement (expression, invocation expression, object creation expression) */
assignment_statement
	: assignment_expression semicolon
		{$$ = $1 + $2;}
	;
assignment_expression
    : unary_expression assignment_operator expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
	| unary_expression assignment_operator invocation_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | unary_expression assignment_operator object_creation_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
	| unary_expression assignment_operator array_creation_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
	;
object_creation_expression
    : NEW IDENTIFIER '(' argument_list ')'
		{$$ = $1 + ' ' + $2 + $3 + $4 + $5;
		 yy.addUsedConstructor($2);}
    | NEW IDENTIFIER '(' ')'
		{$$ = $1 + ' ' + $2 + $3 + $4;
		 yy.addUsedConstructor($2);}
	;
array_creation_expression
    : NEW IDENTIFIER '[' expression_list ']'
		{$$ = $1 + ' ' + $2 + $3 + $4 + $5;}
    ;


















/* Misc. I: qualified identifier, modifiers, semicolon. */
qualified_identifier
	: qualified_identifier '.' IDENTIFIER 
		{$$ = $1 + $2 + $3;}
	| IDENTIFIER
	;
array_type
	: IDENTIFIER '[' ']'
		{$$ = $1 + $2 + $3;}
	;
modifiers
	: modifiers modifier
		{yy.addModifier($2)}
	| modifier
		{yy.addModifier($1)}
	;
modifier
	/* modifiers for classes, fields, methods, constructors and properties */
	: NEW | PUBLIC | PROTECTED | INTERNAL | PRIVATE | STATIC | VIRTUAL | SEALED | OVERRIDE | ABSTRACT | EXTERN | READONLY | VOLATILE
	/* modifiers for parameters */
	| REF | OUT | THIS
	;
semicolon
	: ";"
	;
/* Misc. II: formal parameter list (for defining methods and constructors) */
formal_parameter_list
	: fixed_parameters
	/*TODO: see about params array*/
	;
fixed_parameters
	: fixed_parameters ',' fixed_parameter
	| fixed_parameter
	;
fixed_parameter
	: modifier IDENTIFIER IDENTIFIER
		{yy.addFixedParameter($2, $3, $1);}
	| modifier array_type IDENTIFIER
		{yy.addFixedParameter($2, $3, $1);}
	| IDENTIFIER IDENTIFIER
		{yy.addFixedParameter($1, $2);}
	| array_type IDENTIFIER
		{yy.addFixedParameter($1, $2);}
	/*TODO: see about default argument = expression*/
	;
/* Misc. III: arguments list (for calling methods and constructors) */
argument_list
	: arguments
	;
arguments
	: arguments ',' argument
		{$$ = $1 + $2 + ' ' + $3;}
	| argument
	;
argument
	: IDENTIFIER ':' argument_value
		{$$ = $1 + $2 + ' ' + $3;}
	| argument_value
	;
argument_value
	: expression
	| REF expression
		{$$ = $1 + ' ' + $2}
	| OUT expression
		{$$ = $1 + ' ' + $2}
	;
/* Misc. IV: expression list, expression */
expression_list
	: expression_list ',' expression
		{$$ = $1 + $2 + ' ' + $3;}
    | expression
    ;
expression
    : non_assignment_expression
    | assignment_expression
    ;
non_assignment_expression
    : conditional_expression
    /*| lambda_expression*/
    /*| query_expression*/
    ;
conditional_expression
    : null_coalescing_expression
    | null_coalescing_expression '?' expression ':' expression
		{$$ = $1 + $2 + ' ' + $3 + $4 + ' ' + $5;}
    ;
null_coalescing_expression
    : conditional_or_expression
    | conditional_or_expression '??' null_coalescing_expression
		{$$ = $1 + $2 + ' ' + $3;}
    ;
conditional_or_expression
    : conditional_and_expression
    | conditional_or_expression '||' conditional_and_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
conditional_and_expression
    : inclusive_or_expression
    | conditional_and_expression '&&' inclusive_or_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
inclusive_or_expression
    : exclusive_or_expression
    | inclusive_or_expression '|' exclusive_or_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
exclusive_or_expression
    : and_expression
    | exclusive_or_expression '^' and_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
and_expression
    : equality_expression
    | and_expression '&' equality_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
equality_expression
    : relational_expression
    | equality_expression '==' relational_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | equality_expression '!=' relational_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
relational_expression
    : shift_expression
    | relational_expression '<' shift_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | relational_expression '>' shift_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | relational_expression '<=' shift_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | relational_expression '>=' shift_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | relational_expression IS IDENTIFIER
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | relational_expression AS IDENTIFIER
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
shift_expression
    : additive_expression
    | shift_expression '<<' additive_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | shift_expression '>>' additive_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
additive_expression
    : multiplicative_expression
    | additive_expression '+' multiplicative_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | additive_expression '-' multiplicative_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
multiplicative_expression
    : unary_expression
    | multiplicative_expression '*' unary_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | multiplicative_expression '/' unary_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | multiplicative_expression '%' unary_expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    ;
unary_expression
    : expression_literal
		{yy.addUsedFieldOrProperty($1);}
	| literal
    /*| null_conditional_expression*/
    | '+' unary_expression
		{$$ = $1 + $2;}
    | '-' unary_expression
		{$$ = $1 + $2;}
    | '!' unary_expression
		{$$ = $1 + $2;}
    | '~' unary_expression
		{$$ = $1 + $2;}
    /*| pre_increment_expression*/
    /*| pre_decrement_expression*/
    /*| cast_expression*/
    /*| await_expression*/
    /*| unary_expression_unsafe*/
    ;
assignment_operator
    : '='
    | '+='
    | '-='
    | '*='
    | '/='
    | '%='
    | '&='
    | '|='
    | '^='
    | '<<='
    | '>>='
    ;
/* Misc. V: literals */
literal
    : boolean_literal
    | integer_literal
    | real_literal
    | character_literal
    | string_literal
    | null_literal
    ;
boolean_literal
    : TRUE
    | FALSE
    ;
integer_literal
    : decimal_integer_literal
    | hexadecimal_integer_literal
    ;
decimal_integer_literal
	: DECIMAL_INTEGER
    ;
hexadecimal_integer_literal
	: HEXADECIMAL_INTEGER
	;
real_literal
    : REAL_NUMBER
	;
character_literal
    : CHARACTER_LITERAL
    ;
string_literal
	: STRING_LITERAL
	;
null_literal
	: NULL
	;
/* Misc. V: primary expressions - parenthesized expression */
parenthesized_expression
    : '(' expression ')'
		{$$ = $1 + $2 + $3;}
    ;
/* Misc. V: primary expressions - member access, element access, this access, base access */
member_access
    : IDENTIFIER '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
	| literal '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    /*| primary_expression '.' IDENTIFIER type_argument_list?*/
    /*| predefined_type '.' IDENTIFIER*/ /*covered by primary_expression fow now*/
    /*| predefined_type '.' identifier type_argument_list?*/
    /*| qualified_alias_member '.' IDENTIFIER*/
    ;
element_access
    : IDENTIFIER '[' expression_list ']'
	| member_access '[' expression_list ']'
    ;
this_access
	: THIS '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    ;
base_access
    : BASE '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    ;
%%