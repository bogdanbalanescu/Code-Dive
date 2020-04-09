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
			body: undefined // functionality not yet supported
		});
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
			statements: statements
		});
		// Cleanup after constructor declaration
		currentConstructorName = "";
		currentConstructorModifiers = [];
		currentConstructorFixedParameters = [];
		statements = [];
	}
}
/* Statements */
var currentStatementUsedFields = [];
var currentStatementUsedProperties = [];
var currentStatementUsedConstructors = [];
var currentStatementUsedMethods = [];
if (!('addStatement' in yy)) {
	yy.addStatement = function addStatement(text) {
		statements.push({
			statementText: text,
			usedFields: currentStatementUsedFields,
			usedProperties: currentStatementUsedProperties,
			usedConstructors: currentStatementUsedConstructors,
			usedMethods: currentStatementUsedMethods
		});
		// Cleanup
		currentStatementUsedFields = [];
		currentStatementUsedProperties = [];
		currentStatementUsedConstructors = [];
		currentStatementUsedMethods = [];
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
('\\.') return 'CHARACTER_LITERAL';
('[^\\]') return 'CHARACTER_LITERAL';
(".*(\\.)*.*") return 'STRING_LITERAL';
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
'bool'					return 'BOOL';
'byte'					return 'BYTE';
'char'					return 'CHAR';
'decimal'				return 'DECIMAL';
'double'				return 'DOUBLE';
'float' 				return 'FLOAT';
'int'					return 'INT';
'long'					return 'LONG';
'object'				return 'OBJECT';
'sbyte' 				return 'SBYTE';
'short' 				return 'SHORT';
'string'				return 'STRING';
'uint'					return 'UINT';
'ulong' 				return 'ULONG';
'ushort'				return 'USHORT';
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
	/* TODO: add method, property and constructor members (+ others when time is right) */
	;
/* 3.1 Field declaration */
field_declaration
	: modifiers type variable_declaration semicolon
		{yy.addField($2, $3);}
	| type variable_declaration semicolon
		{yy.addField($1, $2);}
	;
variable_declaration
	: IDENTIFIER
	/*TODO: consider field declaration with variable initializer ?*/
	;
/* 3.2 Property declaration */
property_declaration
	: modifiers type IDENTIFIER property_body
		{yy.addProperty($2, $3);}
	| type IDENTIFIER property_body
		{yy.addProperty($1, $2);}
	;
property_body
	: '{' accessor_declarations '}'
	/*TODO: consider lambda expressions prop X => expression;*/
	/*TODO: consider property initializer ?*/
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
	/*TODO: see about properties with a block body*/
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
	;
/* 3.3.2.1 Variable declaration statement */
variable_declaration_statement
	: type IDENTIFIER semicolon
		{$$ = $1 + ' ' + $2 + $3;
		 yy.addStatement($$);}
	/*TODO: see about initilizations of variables, such as int x = 2;*/
	;
/* 3.3.2.2 Embedded statements */
embedded_statement
	/*TODO: see about extending this with block as well*/
	: empty_statement
	| expression_statement

	/*TODO: follow up with the next ones*/
	/*selection_statement*/	
	/*iteration_statement*/	
	/*try_statement*/	
	;
/* 3.3.2.2.1 Empty statement */
empty_statement
	: semicolon
		{yy.addStatement($$);}
	;
/* 3.3.2.2.2 Expression statement */
expression_statement
	: statement_expression semicolon
		{$$ = $1 + $2;
		 yy.addStatement($$);}
	;
statement_expression
	: invocation_expression

	/*TODO: follow up with the next ones*/
    /*| null_conditional_invocation_expression*/
    /*| object_creation_expression*/
    /*| assignment*/
    /*| post_increment_expression*/
    /*| post_decrement_expression*/
    /*| pre_increment_expression*/
    /*| pre_decrement_expression*/
    /*| await_expression*/
	;
/* 3.3.2.2.2.1 Invocation expression */
invocation_expression
	: primary_expression '(' argument_list ')'
		{$$ = $1 + $2 + $3 + $4;}
	| primary_expression '(' ')'
		{$$ = $1 + $2 + $3;}
	;
primary_expression
    : primary_no_array_creation_expression
    | array_creation_expression
    ;
primary_no_array_creation_expression
    : literal
    /*| interpolated_string_expression*/
    | simple_name
    | parenthesized_expression
    | member_access
    | invocation_expression
    | element_access
    | this_access
    | base_access
    /*| post_increment_expression*/
    /*| post_decrement_expression*/
    | object_creation_expression
    /*| delegate_creation_expression*/
    /*| anonymous_object_creation_expression*/
    /*| typeof_expression*/
    /*| checked_expression*/
    /*| unchecked_expression*/
    /*| default_value_expression*/
    /*| nameof_expression*/
    /*| anonymous_method_expression*/
    /*| primary_no_array_creation_expression_unsafe*/
    ;
array_creation_expression
    /*: NEW non_array_type '[' expression_list ']' rank_specifier* array_initializer?*/
    : NEW non_array_type '[' expression_list ']'
    /*| NEW array_type array_initializer*/
    /*| NEW rank_specifier array_initializer*/
    ;
non_array_type
	: type
	;


// TODO: continue with fixing the expression statement (conflicts when running parsing the source code)
//





/* Misc. I: qualified identifier, type, modifiers, semicolon. */
qualified_identifier
	: qualified_identifier '.' IDENTIFIER 
		{$$ = $1 + $2 + $3;}
	| IDENTIFIER
	;
type
	: IDENTIFIER
	| predefined_type
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
	: modifier type IDENTIFIER
		{yy.addFixedParameter($2, $3, $1);}
	| type IDENTIFIER
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
/* Misc. IV: expressions */
expression_list
	: expression_list ',' expression
		{$$ = $1 + $2 + ' ' + $3;}
    | expression
    ;
expression
    : non_assignment_expression
    | assignment
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
    | relational_expression IS type
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
    | relational_expression AS type
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
    : primary_expression
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
assignment
    : unary_expression assignment_operator expression
		{$$ = $1 + ' ' + $2 + ' ' + $3;}
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
/* Misc. V: primary expressions - literals */
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
	: decimal_digits integer_type_suffix
		{$$ = $1 + $2;}
	| decimal_digits
    ;
decimal_digits
	: decimal_digits decimal_digit
		{$$ = $1 + $2;}
	| decimal_digit
	;
decimal_digit
    : '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    ;
integer_type_suffix
    : 'U' | 'u' | 'L' | 'l' | 'UL' | 'Ul' | 'uL' | 'ul' | 'LU' | 'Lu' | 'lU' | 'lu'
    ;
hexadecimal_integer_literal
	: '0x' hex_digits integer_type_suffix
		{$$ = $1 + $2 + $3;}
	| '0x' hex_digits
		{$$ = $1 + $2;}
	| '0X' hex_digits integer_type_suffix
		{$$ = $1 + $2 + $3;}
	| '0X' hex_digits
		{$$ = $1 + $2;}
	;
hex_digits
	: hex_digits hex_digit
		{$$ = $1 + $2;}
	| hex_digit
	;
hex_digit
    : '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
	;
real_literal
    : decimal_digits '.' decimal_digits
    | decimal_digits '.' decimal_digits exponent_part
    | decimal_digits '.' decimal_digits real_type_suffix
    | decimal_digits '.' decimal_digits exponent_part real_type_suffix
    | '.' decimal_digits
    | '.' decimal_digits exponent_part
    | '.' decimal_digits real_type_suffix
    | '.' decimal_digits exponent_part real_type_suffix
    | decimal_digits exponent_part
    | decimal_digits exponent_part real_type_suffix
    | decimal_digits real_type_suffix
    ;
exponent_part
    : 'e' decimal_digits
    | 'e' sign decimal_digits
    | 'E' decimal_digits
    | 'E' sign decimal_digits
    ;
sign
    : '+'
    | '-'
    ;
real_type_suffix
    : 'F' | 'f' | 'D' | 'd' | 'M' | 'm'
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
/* Misc. V: primary expressions - simple name */
simple_name
	: IDENTIFIER
    /*: IDENTIFIER type_argument_list*/
    ;
/* Misc. V: primary expressions - parenthesized expression */
parenthesized_expression
    : '(' expression ')'
		{$$ = $1 + $2 + $3;}
    ;
/* Misc. V: primary expressions - member access, element access, this access, base access */
member_access
    : primary_expression '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    /*| primary_expression '.' IDENTIFIER type_argument_list?*/
    | predefined_type '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    /*| predefined_type '.' identifier type_argument_list?*/
    /*| qualified_alias_member '.' IDENTIFIER*/
    ;
predefined_type
    : BOOL   | BYTE  | CHAR  | DECIMAL | DOUBLE | FLOAT | INT | LONG
    | OBJECT | SBYTE | SHORT | STRING  | UINT   | ULONG | USHORT
    ;
element_access
    : primary_no_array_creation_expression '[' expression_list ']'
    ;
this_access
    : THIS
    ;
base_access
    : BASE '.' IDENTIFIER
		{$$ = $1 + $2 + $3;}
    | BASE '[' expression_list ']'
		{$$ = $1 + $2 + $3 + $4;}
    ;
/* Misc. V: primary expressions - object creation expression */
object_creation_expression
    : NEW type '(' argument_list ')'
    | NEW type '(' ')'
    /*| NEW type '(' argument_list ')' object_or_collection_initializer*/
    /*| NEW type '(' ')' object_or_collection_initializer*/
    /*| NEW type object_or_collection_initializer*/
    ;
%%