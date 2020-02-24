import { Interactor } from './Interactor';

export class ExtensionInteractor implements Interactor {
    vsCodeApi: any;

    constructor(vscode: any) {
        this.vsCodeApi = vscode;
    }

    alert(message: string): void {
        this.vsCodeApi.postMessage({
            command: 'alert',
            text: '🐛  on line 999'
        });
    }
}