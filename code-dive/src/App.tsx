import * as React from 'react';
import './App.css';
import 'react-reflex/styles.css'

import { RootState } from './redux';
import { connect } from 'react-redux';
import { postLinkCreationConfiguration } from './redux/modules/configuration'
import { postTypes, updateTypesForFilePath } from './redux/modules/types';
import { CodeDiagram } from './components/CodeDiagram/CodeDiagram';
import { ParsedTypes } from './codeModel/ParsedTypes';
import { ExtensionInteractor } from './interactors/ExtensionInteractor';
import { Helmet } from 'react-helmet';

import { types } from './components/CodeDiagram/typesExample';
import { LinkCreationConfiguration } from './components/CodeDiagram/LinkCreationConfiguration';

const mapStateToProps = (state: RootState) => ({
  configuration: state.configuration,
  types: state.types,
  interactor: state.interactor
});

const mapDispatchToProps = { postLinkCreationConfiguration, postTypes, updateTypesForFilePath }

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const connector = connect(mapStateToProps, mapDispatchToProps);

class App extends React.Component<Props> {
  componentDidMount() {
    window.addEventListener('message', this.windowEventListener as EventListener);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.windowEventListener as EventListener);
  }

  windowEventListener = (event: MessageEvent) => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case 'sayHello':
        this.props.interactor.alert('Just here to say hello! 👋')
        break;
      case 'loadConfiguration':
        this.props.interactor.loadConfiguration();
        break;
      case 'configurationResults':
        var linkCreationConfiguration: LinkCreationConfiguration = message.linkCreationConfiguration;
        this.props.postLinkCreationConfiguration(linkCreationConfiguration);
        break;
      case 'startCodeDiveAnalysis':
        this.props.interactor.startCodeDiveAnalysis();
        break;
      case 'codeDiveAnalysisResults':
        var codeDiveAnalysisResults: ParsedTypes = message.codeDiveAnalysisResults;
        this.props.postTypes(codeDiveAnalysisResults);
        break;
      case 'updateDiveAnalysisResultsForFilePath':
        var codeDiveAnalysisResults: ParsedTypes = message.codeDiveAnalysisResults;
        var filePath = message.filePath;
        this.props.updateTypesForFilePath(codeDiveAnalysisResults, filePath);
        break;
    }
  }

  public render() {
    return (
      <div>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Code Dive, a visual programming tool for textual based programming languages.</title>
        </Helmet>
        <CodeDiagram 
          types={this.props.interactor instanceof ExtensionInteractor? this.props.types: types} 
          configuration={this.props.interactor instanceof ExtensionInteractor? this.props.configuration: new LinkCreationConfiguration()}>
        </CodeDiagram>
      </div>
    );
  }
}

export default connector(App);
