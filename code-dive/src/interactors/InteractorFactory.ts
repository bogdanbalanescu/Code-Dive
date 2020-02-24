import { BrowserInteractor } from './BrowserInteractor';
import { ExtensionInteractor } from './ExtensionInteractor';

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

export class InteractorFactory {
    static createInteractor() {
        if (vscode === null) {
            return new BrowserInteractor();
        } else {
            return new ExtensionInteractor(vscode);
        }
    }
}