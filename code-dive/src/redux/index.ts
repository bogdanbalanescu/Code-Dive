import { combineReducers } from 'redux';
import { typesReducer } from './modules/types'
import { interactorReducer } from './modules/interactor';

export const rootReducer = combineReducers({
    types: typesReducer,
    interactor: interactorReducer
});

export type RootState = ReturnType<typeof rootReducer>;