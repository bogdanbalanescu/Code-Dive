# Code Diagram, a Visual Programming tool for Textual Based Programming Languages (Proof of Concept)
Currently only covering a subset of C#, this tool is not ready for production use.

## Development
The following project is made of two main parts:
* A Visual Studio Code extension that contains a webview
  * Sources are in ```src-ext```
* A React application that fills the webview's content
  * Sources are in ```src```

To run the React application (separately) in browser:
```
yarn install
yarn start
```

To run the extension in Visual Studio Code debugging mode:
```
yarn install
yarn build
Then press 'F5' to run (in Visual Studio Code).
In the newly opened Visual Studio Code session, open a folder with C# source files.
Press (Ctrl+Shift+P) to open the Command Pallete.
Enter '>Code Diagram'.
```

To create a package and install the extension on the local environment:
```
yarn package   <--- this will generate a file called 'code-diagram-0.1.0.vsix' in the 'build' folder
code --install-extension build/code-diagram-0.1.0.vsix
```
To uninstall the extension from the local environment:
```
code --uninstall-extension bdaniel.code-diagram
```

## Documentation

For documentation about the architectural design of Code Diagram, please open the Visual Paradigm Project found at: ```./documentation/Code Diagram.vpp```. This project contains the following diagrams:
- ```Component Diagram``` containing an architectural overview of the whole system
- ```C# Class Diagram``` describing the JSON structure of the parsed types
- ```Node Class Diagram``` describing the JSON structure of the mapped nodes from the parsed types
- ```Link Class Diagram``` describing the JSON structured of the mapped links from the parsed types
- ```Sequence Diagram - Start Code Diagram``` which describes the interaction between the system's components each time Code Diagram is run for the first time
- ```Sequence Diagram - Modify the Code Diagram``` which describes the interaction between the system's components in order to update the code diagram and keep the code in sync
- ```Sequence Diagram - Modify the Source Code``` which describes the interaction between the system's components in order to keep the diagram in sync with the code whenever the source code is modified

## Features
The following is a short list describing the features provided by Code Diagram:
* Visual representation of the code under the form of a UML-like diagram capable of delivering the full capabilities of source code as well.
* Real-time code synchronization between the source files and between the visual representation of the code.
* Links shown between statements, parameters, type members and types.
* Configurations available to show/hide certain link types and real-time updates to the diagram.
* Highlighted selections for the selected code components, their links and the components those links point to.
* Configurations available to increase the number of layers of dependency taken into consideration for the highlighted selections.
* Ability to add new types, type members, statements and parameters from the visual representation of the code.
* Ability to change the source files of types from the visual representation of the code.

## The covered subset of the C# language
The following is a short description of what Code Diagram understand of the C# language.

If something is not covered in this list, then it most probably is not supported - again, this tool is only a Proof of Concept at the present moment.

Note: for brevity, the dots ```...``` shall replace the content of the body of methods, constructors, etc. and shall not be taken as part of the syntax.
* **using** directives: preferably placed at the top of the file and applying to all types in the same source file.
  * Example: ```using System;```
* **namespace** declaration
  * Example: ```namespace CodeDiagramNamespace { ... }```
* **class**, **struct**, **interface** or **enum** declaration:
  * Example: ```class ClassExample { ... }```
  * Example: ```struct StructExample { ... }```
  * Example: ```interface InterfaceExample { ... }```
  * Example: ```enum EnumExample { ... }```
* **field** declaration:
  * Example: ```public int x = 42;```
* **property** declaration:
  * Example: ```protected sealed MagicNumber { get; set; }```
  * Example: ```public PropertyWithAccessModifiers { get { return backedField; } set { backedField = value; } }```
* **constructor** or **method** declaration:
  * Example: ```public ClassExample() { ... }```
  * Example: ```public int Add(int x, int y) { return x + y; }```
* **statements**
  * Variable declarations: ```int x = 42;```
  * Invocation: ```object.CallMethod()```
  * Assignment: ```x = 43;```
  * If and else: ```if (IsThisTrue()) { ... } else { ... }```
  * While: ```While (condition) { ... }```
  * Do: ```do { ... } while (Possible());```
  * For: ```for (x = 1; x < 2; x=x+1) { ... }```
  * Foreach: ```foreach(int x in numbers) { ... }```
  * Return: ```return expression;```
  * Throw: ```throw exception;```
  * Try, catch and finally: ``` try { ... } catch (Exception ex) { ... } finally { ... }```

