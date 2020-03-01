import { InteractorFactory } from '../interactors/InteractorFactory';

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
        }
    }) as EventListener);
}
