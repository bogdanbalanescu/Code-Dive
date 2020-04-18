import { IType } from "../../codeModel/Types/IType";

// State
const initialTypesState: IType[] = [];

// Actions
const SET_TYPES = 'SET_TYPES'
interface SetTypesAction {
    type: typeof SET_TYPES,
    types: IType[]
}
type TypesActions = SetTypesAction;

// Action Creators
export function postTypes(types: IType[]): TypesActions {
    return {
        type: SET_TYPES,
        types: types
    };
}

// Reducers
export function typesReducer(state = initialTypesState, action: TypesActions) {
    switch (action.type) {
        case SET_TYPES:
            return action.types
        default:
            return state
    }
}