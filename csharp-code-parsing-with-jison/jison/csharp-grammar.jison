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
if (!('addVariableDeclarationStatement' in yy)) {
	yy.addVariableDeclarationStatement = function addVariableDeclarationStatement(text) {
		statements.push(createStatement(text));
	};
}
if (!('addEmptyStatement' in yy)) {
	yy.addEmptyStatement = function addEmptyStatement(text) {
		statements.push(createStatement(text));
	};
}
if (!('addExpressionStatement' in yy)) {
	yy.addExpressionStatement = function addExpressionStatement(text) {
		// TODO: revisit this
		statements.push(createStatement(text));
	};
}

function createStatement(text, usedFields = [], usedProperties = [], usedConstructors = [], usedMethods = []) {
	return {
		statementText: text,
		usedFields: usedFields,
		usedProperties: usedProperties,
		usedConstructors: usedConstructors,
		usedMethods: usedMethods
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
"true"					return 'TRUE';
"false"					return 'FALSE';
"null"					return 'NULL';
[_a-zA-Z]+[_a-zA-Z0-9]*	return 'IDENTIFIER';
[0-9]+					return yytext;
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
	: modifiers IDENTIFIER variable_declaration semicolon
		{yy.addField($2, $3);}
	| IDENTIFIER variable_declaration semicolon
		{yy.addField($1, $2);}
	;
variable_declaration
	: IDENTIFIER
	/*TODO: consider field declaration with variable initializer ?*/
	;
/* 3.2 Property declaration */
property_declaration
	: modifiers IDENTIFIER IDENTIFIER property_body
		{yy.addProperty($2, $3);}
	| IDENTIFIER IDENTIFIER property_body
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
	| IDENTIFIER IDENTIFIER
		{yy.addFixedParameter($1, $2);}
	/*TODO: see about default argument = expression*/
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
	: IDENTIFIER IDENTIFIER semicolon
		{$$ = $1 + ' ' + $2 + $3;
		 yy.addVariableDeclarationStatement($$);}
	/*TODO: see about initilizations of variables, such as int x = 2;*/
	;
/* 3.3.2.2 Embedded statements */
embedded_statement
	/*TODO: see about extending this with block as well*/
	: empty_statement
	
	/*TODO: revisit this - uncomment*/
	/*expression_statement*/

	/*selection_statement*/	
	/*iteration_statement*/	
	/*try_statement*/	
	;
/* 3.3.2.2.1 Empty statement */
empty_statement
	: semicolon
		{yy.addEmptyStatement($$);}
	;
/* 3.3.2.2.2 Expression statement */
expression_statement
	: statement_expression semicolon
		{$$ = $1 + $2;
		 yy.addExpressionStatement($$);}
	;
statement_expression
	: invocation_expression
	| object_creation_expression
	| assignment
	;
invocation_expression
	: primary_expression '(' argument_list ')'
	: primary_expression '(' ')'
	;
primary_expression
	: primary_no_array_creation_expression
	| array_creation_expression
	;
primary_no_array_creation_expression
	: literal
	| simple_name
	| parenthesized_expression
	| member_access
	| invocation_expression
	| element_access
	| this_access
	| base_access
	| object_creation_expression
	: 
array_creation_expression
	: 'new' IDENTIFIER '[' expression_list ']'
	;

argument_list
	: arguments
	;
arguments
	: arguments ',' argument
	: argument
	;
argument
	: IDENTIFIER ':' argument_value
	: argument_value
	;
argument_value
	: expression
	| REF expression
	| OUT expression
	;





qualified_identifier
	: qualified_identifier '.' IDENTIFIER 
		{$$ = $1 + $2 + $3;}
	| IDENTIFIER
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
/* Misc */
semicolon
	: ";"
	;
%%