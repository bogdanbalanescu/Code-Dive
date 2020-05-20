import { LinkCreationConfiguration } from "../../components/CodeDiagram/LinkCreationConfiguration";

// State
const initialConfigurationState: LinkCreationConfiguration = new LinkCreationConfiguration();

// Actions
const POST_LINK_CREATION_CONFIGURATION = 'POST_LINK_CREATION_CONFIGURATION';
interface SetLinksCreationConfigurationAction {
    type: typeof POST_LINK_CREATION_CONFIGURATION,
    linkCreationConfiguration: LinkCreationConfiguration
}

type ConfigurationActions = SetLinksCreationConfigurationAction;

// Action Creators
export function postLinkCreationConfiguration(linkCreationConfiguration: LinkCreationConfiguration): ConfigurationActions {
    return {
        type: POST_LINK_CREATION_CONFIGURATION,
        linkCreationConfiguration: linkCreationConfiguration
    };
}

// Reducers
export function configurationReducer(state = initialConfigurationState, action: ConfigurationActions) {
    switch (action.type) {
        case POST_LINK_CREATION_CONFIGURATION:
            return action.linkCreationConfiguration;
        default:
            return state
    }
}