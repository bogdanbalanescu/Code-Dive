import { Interactor } from './Interactor';

import { IType } from '../codeModel/Types/IType';
import { ParsedTypes } from '../codeModel/ParsedTypes';

import { Class } from '../codeModel/Types/Class';
import { Struct } from '../codeModel/Types/Struct';
import { Interface } from '../codeModel/Types/Interface';
import { Enum } from '../codeModel/Types/Enum';

export class ExtensionInteractor implements Interactor {
    vsCodeApi: any;

    constructor(vscode: any) {
        this.vsCodeApi = vscode;
    }

    alert(message: string): void {
        this.vsCodeApi.postMessage({
            command: 'extension:alert',
            text: message
        });
    }
    
    loadConfiguration(): void {
        this.vsCodeApi.postMessage({
            command: 'extension:loadConfiguration'
        });
    }

    startCodeDiveAnalysis(): void {
        this.vsCodeApi.postMessage({
            command: 'extension:startCodeDiveAnalysis'
        });
    }

    updateCode(typesToUpdate: IType[], path: string): void {
        this.vsCodeApi.postMessage({
            command: 'extension:updateCode',
            parsedTypesToUpdate: new ParsedTypes(
                typesToUpdate.filter(type => type instanceof Class).map(type => type as Class), 
                typesToUpdate.filter(type => type instanceof Struct).map(type => type as Struct),
                typesToUpdate.filter(type => type instanceof Interface).map(type => type as Interface),
                typesToUpdate.filter(type => type instanceof Enum).map(type => type as Enum)),
            path: path
        });
    }
}