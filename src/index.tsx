import {
  JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import {
  Widget
} from '@phosphor/widgets';

import {
  NotebookActions,
  INotebookTracker
} from '@jupyterlab/notebook';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../style/index.css';

class QuiltWidget extends Widget {
  constructor(printCode : any) {
    super();

    this.id = 'quiltwidget';
    this.title.label = 'Quilt Data';

    let node = this.node;

    function handleSearch(query : string) {
      fetch('https://pkg.quiltdata.com/api/search/?q=' + query)
        .then(response => response.json())
        .then(json => {
          if (json.status === 200) {
            ReactDOM.render(
              <QuiltWidgetElement kd={kd} results={json.packages} />
              , node
            );
          }
        });
    };

    var inputValue = '';
    function updateInputValue(evt : any) {
      inputValue = evt.target.value;
    };
    
    function kd(e : React.KeyboardEvent<HTMLInputElement>) {
      if (e.keyCode === 13) {
        handleSearch(inputValue);
        e.preventDefault();
      }
    };

    type QuiltQueryResult = Array<{owner : string, name : string}>;

    class QuiltResultList extends 
      React.Component<{results : QuiltQueryResult}, any> {
      constructor(props : {results : QuiltQueryResult}) {
        super(props);
      }
      render() {
        return this.props.results.map((result : {owner : string, name : string}) => { 
          let name = result.owner + '/' + result.name;
          return <li onClick={(e : any) => {
            e.preventDefault(); 
            var code = 'import quilt\n' +
              'quilt.install("' + result.owner + '/' + result.name + 
                '", force=True)\n' +
              'from quilt.data.' + result.owner + ' import ' + result.name;
            printCode(code);
          }}
            className='jp-DirListing-item' key={name}>{name}</li>
        });
      }
    };

    function QuiltWidgetElement(props : 
        {results : QuiltQueryResult, kd : (e : React.KeyboardEvent<HTMLInputElement>) => void}) {
      return <div className='jp-DirListing'>
        <div className="p-CommandPalette-search">
          <div className="p-CommandPalette-wrapper">
            <input onKeyDown={props.kd} id="quiltwidget-input" 
              className="p-CommandPalette-input" placeholder="SEARCH"
              onChange={evt => updateInputValue(evt)}
            />
          </div>
        </div>
        <ul className='jp-DirListing-content'>
          <QuiltResultList results={props.results}/>
        </ul>
      </div>
      ;
    };

    ReactDOM.render(
      <QuiltWidgetElement kd={kd} results={[]} />
      , this.node
    );

  }

}

/**
 * Initialization data for the jupyterlab_quilt extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'Quilt',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker],
  activate: (app, palette: ICommandPalette, tracker : INotebookTracker) => {
    console.log('JupyterLab extension Quilt is activated!');


    function printCode(code : string) {
      if (tracker.currentWidget) {
        var cell = tracker.currentWidget.notebook.activeCell;
        var text = cell.model.value.text;
        if (text === '') {
          cell.model.value.text = code;
        } else {
          NotebookActions.insertBelow(tracker.currentWidget.notebook);
          tracker.currentWidget.notebook.activeCell.model.value.text = code;
        }
      }
    };

    let widget = new QuiltWidget(printCode);

    app.shell.addToLeftArea(widget);
  }
};

export default extension;
