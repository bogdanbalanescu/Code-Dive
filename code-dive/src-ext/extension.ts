import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { parseSourceCode } from "./codeParser/ClassParser";
import { IType } from './codeModel/Types/IType';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('extension.code-dive', () => {
		ReactPanel.createOrShow(context.extensionPath);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.code-says-hello', () => {
		ReactPanel.sayHello();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('extension.code-dive-analysis', () => {
		ReactPanel.startCodeDiveAnalysis();
	}));
}

/**
 * Manages react webview panels
 */
class ReactPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
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
		this._panel = vscode.window.createWebviewPanel(ReactPanel.viewType, "React", column, {
			// Enable javascript in the webview
			enableScripts: true,

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
		this._codeDiveChannel = vscode.window.createOutputChannel("Code-Dive-Channel");

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(async message => {
			switch (message.command) {
				case 'alert':
					vscode.window.showErrorMessage(message.text);
					return;
				case 'startCodeDiveAnalysis':
					var sourceFilesPaths = await this.readSourceFilesPathsFromCurrentWorkspace();
					var parsedTypes = await this.parseSourceFilesAsTypes(sourceFilesPaths);
					
					ReactPanel.postCodeDiveAnalysisResults(parsedTypes);
					// TODO: continue from here -> async problem, parsed classes are not awaited and array is empty
					// TODO: pass the classes as message to the extension
					// TODO: show a visual representation of the classes
					var x = parsedTypes;
			}
		}, null, this._disposables);
	}

	private async readSourceFilesPathsFromCurrentWorkspace(): Promise<string[]> {
		return await vscode.workspace.findFiles('**/*.cs', '**/obj/**').then((uris: vscode.Uri[]) => {
			var sourceFilePaths : string[] = [];
			uris.forEach((uri: vscode.Uri) => {
				sourceFilePaths.push(uri.path); // TODO: consider uri.fspath as well OR even the uri itself

				// log path
				this._codeDiveChannel.appendLine(uri.path);
			});
			return sourceFilePaths;
		});
	}
	
	private async parseSourceFilesAsTypes(sourceFilesPaths: string[]): Promise<IType[]> {
		// TODO: parse each source file as IType array when possible.
		var types: IType[] = [];
		var typesJobs = sourceFilesPaths.map(async (filePath: string) => {
			var fileText = await vscode.workspace.openTextDocument(filePath).then((file) => {
				return file.getText();
			})
			try {
				return this.parseSourceCodeAsTypes(fileText);
			}
			catch (e) {
				this._codeDiveChannel.appendLine(`Error while parsing file ${filePath}: ${e.message}`);

				// TODO: warn about source files that could not be parsed. (use something similar to 'alert')
				// throw new Error("Unaccepted message occurred when parsing source file.");
				return [];
			}
		});
		types = (await Promise.all(typesJobs)).reduce((previous, current) => previous.concat(current));
		return types;
	}

	private parseSourceCodeAsTypes(sourceCode: string): IType[] {
		return parseSourceCode(sourceCode);
	}

	public static sayHello() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'sayHello' });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}

	public static startCodeDiveAnalysis() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'startCodeDiveAnalysis' });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}

	public static postCodeDiveAnalysisResults(parsedTypes: IType[]) {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.webview.postMessage({ command: 'codeDiveAnalysisResults', codeDiveAnalysisResults: parsedTypes });
		} else {
			// TODO: signal somehow that there is no panel
		}
	}

	public dispose() {
		ReactPanel.currentPanel = undefined;

		// Clean up our resources
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
				<title>Code Dive</title>
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