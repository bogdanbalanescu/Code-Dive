import { CodeDiagramConfiguration } from "../../components/CodeDiagram/CodeDiagramConfiguration";

// State
const initialConfigurationState: CodeDiagramConfiguration = new CodeDiagramConfiguration();

// Actions
const POST_CONFIGURATION = 'POST_CONFIGURATION';
interface SetConfigurationAction {
    type: typeof POST_CONFIGURATION,
    configuration: CodeDiagramConfiguration
}

type ConfigurationActions = SetConfigurationAction;

// Action Creators
export function postConfiguration(configuration: CodeDiagramConfiguration): ConfigurationActions {
    return {
        type: POST_CONFIGURATION,
        configuration: configuration
    };
}

// Reducers
export function configurationReducer(state = initialConfigurationState, action: ConfigurationActions) {
    switch (action.type) {
        case POST_CONFIGURATION:
            return action.configuration;
        default:
            return state
    }
}