import { InteractorFactory } from '../interactors/InteractorFactory';
import { IType } from '../codeModel/Types/IType'

const interactor = InteractorFactory.createInteractor();

export function registerWindowEventListener() {
    window.addEventListener('message', ((event: MessageEvent) => {
        const message = event.data; // The JSON data our extension sent
    
        switch (message.command) {
            case 'sayHello':
                interactor.alert('Just here to say hello! 👋')
                break;
            case 'startCodeDiveAnalysis':
                interactor.startCodeDiveAnalysis();
                break;
            case 'codeDiveAnalysisResults':
                var codeDiveAnalysisResults: IType[] = message.codeDiveAnalysisResults;
                // TODO: used codeDiveAnalysisResults for the visual representation
                // for now, we only show it in an existing pop-up
                interactor.alert(codeDiveAnalysisResults.map(x => JSON.stringify(x)).reduce((x,y) => x + '\n' + y));
                break;
        }
    }) as EventListener);
}
