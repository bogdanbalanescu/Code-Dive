import { BrowserInteractor } from './BrowserInteractor';
import { ExtensionInteractor } from './ExtensionInteractor';

declare var acquireVsCodeApi: any;
const vscode = navigator.userAgent.indexOf('Electron') !== -1 ? acquireVsCodeApi() : null;

export class InteractorFactory {
    static createInteractor() {
        if (vscode === null) {
            return new BrowserInteractor();
        } else {
            return new ExtensionInteractor(vscode);
        }
    }
}