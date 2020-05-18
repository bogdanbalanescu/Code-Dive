import { combineReducers } from 'redux';
import { configurationReducer } from './modules/configuration';
import { typesReducer } from './modules/types'
import { interactorReducer } from './modules/interactor';

export const rootReducer = combineReducers({
    configuration: configurationReducer,
    types: typesReducer,
    interactor: interactorReducer
});

export type RootState = ReturnType<typeof rootReducer>;