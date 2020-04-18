import { Interactor } from "../../interactors/Interactor";
import { InteractorFactory } from "../../interactors/InteractorFactory";

// State
const initialInteractorState: Interactor = InteractorFactory.createInteractor();

// Reducers
export function interactorReducer(state = initialInteractorState, action: any) {
    return state;
}