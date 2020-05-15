import { ParsedTypes } from "../../codeModel/ParsedTypes";
import { IType } from "../../codeModel/Types/IType";
import { Class } from "../../codeModel/Types/Class";
import { Struct } from "../../codeModel/Types/Struct";
import { Enum } from "../../codeModel/Types/Enum";
import { Interface } from "../../codeModel/Types/Interface";

// State
const initialTypesState: IType[] = [];

// Actions
const SET_TYPES = 'SET_TYPES';
interface SetTypesAction {
    type: typeof SET_TYPES,
    parsedTypes: ParsedTypes
}
const UPDATE_TYPES_FOR_FILE_PATH = 'UPDATE_TYPES_FOR_FILE_PATH';
interface UpdateTypesAction {
    type: typeof UPDATE_TYPES_FOR_FILE_PATH,
    parsedTypes: ParsedTypes,
    filePath: string
}
type TypesActions = SetTypesAction | UpdateTypesAction;

const convertParsedTypesToTypeScriptTypes = (parsedTypes: ParsedTypes): IType[] => {
    return parsedTypes
        .classes.map(type => new Class(type) as IType)
        .concat(parsedTypes.structs.map(type => new Struct(type)))
        .concat(parsedTypes.interfaces.map(type => new Interface(type)))
        .concat(parsedTypes.enums.map(type => new Enum(type)));
}

// Action Creators
export function postTypes(parsedTypes: ParsedTypes): TypesActions {
    return {
        type: SET_TYPES,
        parsedTypes: parsedTypes
    };
}
export function updateTypesForFilePath(parsedTypes: ParsedTypes, filePath: string): TypesActions {
    return {
        type: UPDATE_TYPES_FOR_FILE_PATH,
        parsedTypes: parsedTypes,
        filePath: filePath
    };
}

// Reducers
export function typesReducer(state = initialTypesState, action: TypesActions) {
    switch (action.type) {
        case SET_TYPES:
            return convertParsedTypesToTypeScriptTypes(action.parsedTypes);
        case UPDATE_TYPES_FOR_FILE_PATH:
            return [...state.filter(type => type.sourceFilePath !== action.filePath), ...convertParsedTypesToTypeScriptTypes(action.parsedTypes)]
        default:
            return state
    }
}