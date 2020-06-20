import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { parseSourceCode } from "./codeParser/ClassParser";
import { ParsedTypes } from './codeModel/ParsedTypes';
import { CodeDiagramConfiguration } from './configuration/CodeDiagramConfiguration';
import { Class } from './codeModel/Types/Class';
import { Struct } from './codeModel/Types/Struct';
import { Interface } from './codeModel/Types/Interface';
import { Enum } from './codeModel/Types/Enum';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('extension.code-diagram', () => {
		ReactPanel.createOrShow(context.extensionPath);
		ReactPanel.startConfigurationLoad();
		ReactPanel.startCodeDiveAnalysis();
	}));
}

/**
 * Manages react webview panels
 */
class ReactPanel {
	/**
	 * Track the current panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: ReactPanel | undefined;

	private static readonly viewType = 'react';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _codeDiveChannel: vscode.OutputChannel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionPath: string) {
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

		// If we already have a panel, show it.
		// Otherwise, create a new panel.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.reveal(column);
		} else {
			ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.One);
		}
	}

	private constructor(extensionPath: string, column: vscode.ViewColumn) {
		this._extensionPath = extensionPath;

		// Create and show a new webview panel
		this._panel = vscode.window.createWebviewPanel(ReactPanel.viewType, "Code Diagram", column, {
			// Enable javascript in the webview
			enableScripts: true,

			// Retain context when hidden
			retainContextWhenHidden: true,

			// And restric the webview to only loading content from our extension's `media` directory.
			localResourceRoots: [
				vscode.Uri.file(path.join(this._extensionPath, 'build'))
			]
		});
		
		// Set the webview's initial html content 
		this._panel.webview.html = this._getHtmlForWebview();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Create an output channel for debugging purposes
		this._codeDiveChannel = vscode.window.createOutputChannel("Code-Diagram-Channel");

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(async message => {
			switch (message.command) {
				case 'extension:alert':
					vscode.window.showErrorMessage(message.text);
					break;
				case 'extension:loadConfiguration':
					var configuration = ReactPanel.loadConfiguration();
					ReactPanel.postConfigurationResults(configuration);
					break;
				case 'extension:startCodeDiveAnalysis':
					var parsedTypes = await this.parseTypesFromCurrentWorkspaceSourceFilesAsync();
					ReactPanel.postCodeDiveAnalysisResults(parsedTypes);
					break;
				case 'extension:updateCode':
					var parsedTypesToUpdate = new ParsedTypes(
						message.parsedTypesToUpdate.classes as Class[],
						message.parsedTypesToUpdate.structs as Struct[],
						message.parsedTypesToUpdate.interfaces as Interface[],
						message.parsedTypesToUpdate.enums as Enum[])
					var fsPath: string = (message.path as String).indexOf('.cs') !== -1 ? message.path : 
						vscode.workspace.workspaceFolders ? path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, `${message.path}.cs`) : '';
					try {
						// Parse to source code
						var sourceCode = parsedTypesToUpdate.mapToSourceCode();
						// Validate if source code is parsable
						var parsedTypes = parseSourceCode(sourceCode, fsPath);

						if ((message.path as String).indexOf('.cs') === -1) { // if there is a new type and the file already exists, preserve the previously added type as well
							if (fs.existsSync(fsPath)) {
								var existingParsedTypesInNewFile = await this.parseTypesFromSourceFile(fsPath);
								parsedTypes.addClasses(existingParsedTypesInNewFile.classes);
								parsedTypes.addStructs(existingParsedTypesInNewFile.structs);
								parsedTypes.addInterfaces(existingParsedTypesInNewFile.interfaces);
								parsedTypes.addEnums(existingParsedTypesInNewFile.enums);
							}
						}

						if (parsedTypes.count() === 0) {
							// Delete empty source files
							fs.unlinkSync(fsPath);
						}
						else {
							sourceCode = parsedTypes.mapToSourceCode();
							// Save source code to file
							fs.writeFileSync(fsPath, sourceCode);
						}
					}
					catch (e) {
						if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
							this.alertWebview('Please open a workspace or a folder before creating new types.');
						} else {
							this.alertWebview(e.message);
						}
					}
					break;
			}
		}, null, this._disposables);

		this.registerCodeDiveSourceFileListeners();
		this.registerConfigurationChangeListener();
	}

	// read and parse source files from the current workspace
	private parseTypesFromCurrentWorkspaceSourceFilesAsync = async (): Promise<ParsedTypes> => {
		return await vscode.workspace.findFiles('**/*.cs', '**/obj/**').then(async (uris: vscode.Uri[]) => {
			var allParsedTypes: ParsedTypes = new ParsedTypes([], [], [], []);
			var parsedTypesJobs = uris.map(async (uri: vscode.Uri) => {
				return await this.parseTypesFromSourceFile(uri.fsPath); // TODO: consider uri.fspath as well OR even the uri itself
			});
			var parsedTypes = await Promise.all(parsedTypesJobs);
			parsedTypes.forEach((parsedTypes: ParsedTypes) => {
				allParsedTypes.addClasses(parsedTypes.classes);
				allParsedTypes.addStructs(parsedTypes.structs);
				allParsedTypes.addInterfaces(parsedTypes.interfaces);
				allParsedTypes.addEnums(parsedTypes.enums);
			});
			return allParsedTypes;
		});
	}
	private parseTypesFromSourceFile = async (filePath: string): Promise<ParsedTypes> => {
		return fs.promises.readFile(filePath).then((data) => {
			try {
				return parseSourceCode(data.toString(), filePath);
			}
			catch (e) {
				this._codeDiveChannel.appendLine(`Error while parsing file ${filePath}: ${e.message}`);
				this.alertWebview(`Error while parsing file ${filePath}: ${e.message}`);

				return new ParsedTypes([], [], [], []);
			}
		});
	}

	// start and post full code dive analysis
	public static startCodeDiveAnalysis() {
		// Send a message to the webview.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'webview:startCodeDiveAnalysis' });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}
	private static postCodeDiveAnalysisResults(parsedTypes: ParsedTypes) {
		// Send a message to the webview.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'webview:codeDiveAnalysisResults', codeDiveAnalysisResults: parsedTypes });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}
	// update extension about with new code dive analysis
	private static updateCodeDiveAnalysisResultsForFilePath(parsedTypes: ParsedTypes, filePath: string) {
		// Send a message to the webview.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'webview:updateDiveAnalysisResultsForFilePath', codeDiveAnalysisResults: parsedTypes, filePath: filePath });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}
	// register code dive file listeners
	private registerCodeDiveSourceFileListeners = async () => {
		var workspaceFolders = vscode.workspace.workspaceFolders;
		var watcherPattern = workspaceFolders? new vscode.RelativePattern(workspaceFolders[0], "**/*.cs"): "**/*.cs"; // Note: does not listen to deleted folders
		var watcher = vscode.workspace.createFileSystemWatcher(watcherPattern);
		this._disposables.push(watcher);

		var onDidChangeWatcherDisposable = watcher.onDidChange(
			async changedFileUri => ReactPanel.updateCodeDiveAnalysisResultsForFilePath(await this.parseTypesFromSourceFile(changedFileUri.fsPath), changedFileUri.fsPath));
		this._disposables.push(onDidChangeWatcherDisposable);

		var onDidCreateWatcherDisposable = watcher.onDidCreate(
			async createdFileUri => ReactPanel.updateCodeDiveAnalysisResultsForFilePath(await this.parseTypesFromSourceFile(createdFileUri.fsPath), createdFileUri.fsPath));
		this._disposables.push(onDidCreateWatcherDisposable);

		var onDidDeleteWatcherDisposable = watcher.onDidDelete(
			deletedFileUri => ReactPanel.updateCodeDiveAnalysisResultsForFilePath(new ParsedTypes([], [], [], []), deletedFileUri.fsPath));
		this._disposables.push(onDidDeleteWatcherDisposable);
	}

	// start configuration load
	public static startConfigurationLoad() {
		// Send a message to the webview.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'webview:loadConfiguration' });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}
	private static loadConfiguration(): CodeDiagramConfiguration {
		var config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
		var codeDiagaramConfiguration: CodeDiagramConfiguration = {
			linkCreationConfiguration: {
				linksToSameType: config.get('linkCreationConfiguration.linksToSameType') as boolean,
				inheritance: config.get('linkCreationConfiguration.inheritance') as boolean,
				memberType: config.get('linkCreationConfiguration.memberType') as boolean,
				parameterType: config.get('linkCreationConfiguration.parameterType') as boolean,
				variableDeclarationType: config.get('linkCreationConfiguration.variableDeclarationType') as boolean,
				usedEnumValues: config.get('linkCreationConfiguration.usedEnumValues') as boolean,
				usedFieldAndProperties: config.get('linkCreationConfiguration.usedFieldAndProperties') as boolean,
				usedConstructorsAndMethods: config.get('linkCreationConfiguration.usedConstructorsAndMethods') as boolean
			},
			selectionHighlightsConfiguration: {
				recursionDepth: config.get("selectionHighlights.recursionDepth") as number,
				includeChildren: config.get("selectionHighlights.includeChildren") as boolean
			},
			theme: config.get("theme") as string,
			isLoaded: true,
			showOverview: config.get("showOverview") as boolean
		}
		return codeDiagaramConfiguration;
	}
	private static postConfigurationResults(configuration: CodeDiagramConfiguration) {
		// Send a message to the webview.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'webview:configurationResults', configuration: configuration });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}
	// register code dive configuration listener
	private registerConfigurationChangeListener = async () => {
		vscode.workspace.onDidChangeConfiguration(_ => {
			var linkCreationConfiguration = ReactPanel.loadConfiguration();
			ReactPanel.postConfigurationResults(linkCreationConfiguration);
		});
	}

	// alert webivew
	private alertWebview(message: string) {
		// Send a message to the webview.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'webview:alert', message: message });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}

	public dispose() {
		ReactPanel.currentPanel = undefined;

		// Clean up our resources
		this._codeDiveChannel.dispose();
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview() {
		const manifest = require(path.join(this._extensionPath, 'build', 'asset-manifest.json'));
		const mainScript = manifest['main.js'];
		const mainStyle = manifest['main.css'];

		const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'build', mainScript));
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
		const stylePathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'build', mainStyle));
		const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>Code Diagram, a visual programming tool for textual based programming languages.</title>
				<link rel="stylesheet" type="text/css" href="${styleUri}">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
				<base href="${vscode.Uri.file(path.join(this._extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}