# Code Diagram
Code Diagram is a Visual Programming Tool for Textual Based Programming Languages. It is currently built as an extension for VS Code and works for a subset of the C# language.

## Documentation for Code Diagram (previously named Code Dive)
For a more elaborate documentation of Code Diagram (folder structure, how to run, how to package and install, how to uninstall), please visit the markdown file found at: ```./code-dive/README.md```.

For documentation about the architectural design of Code Diagram, please open the Visual Paradigm Project found at: ```./Code Diagram/documentation/Code Diagram.vpp```. This project contains the following diagrams:
- ```Component Diagram``` containing an architectural overview of the whole system
- ```C# Class Diagram``` describing the JSON structure of the parsed types
- ```Node Class Diagram``` describing the JSON structure of the mapped nodes from the parsed types
- ```Link Class Diagram``` describing the JSON structured of the mapped links from the parsed types
- ```Sequence Diagram - Start Code Diagram``` which describes the interaction between the system's components each time Code Diagram is run for the first time
- ```Sequence Diagram - Modify the Code Diagram``` which describes the interaction between the system's components in order to update the code diagram and keep the code in sync
- ```Sequence Diagram - Modify the Source Code``` which describes the interaction between the system's components in order to keep the diagram in sync with the code whenever the source code is modified
