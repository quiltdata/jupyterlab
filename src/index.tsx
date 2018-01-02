import {
  JupyterLabPlugin
} from '@jupyterlab/application';

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

    type QuiltQueryResult = Array<{owner : string, name : string}>;

    class QuiltResultList extends 
      React.Component<{results : QuiltQueryResult}, any> {
      constructor(props : {results : QuiltQueryResult}) {
        super(props);
      }
      render() {
        return this.props.results.map((result : {owner : string, name : string}) => { 
          let name = result.owner + '/' + result.name;
          let landingpage = 'https://quiltdata.com/package/' + name;
          return <li className='jp-DirListing-item' key={name}>
              <div style={{'width':'100%'}}>
              <div
                onClick={(e : any) => {
                e.preventDefault(); 
                var code = 'import quilt\n' +
                  'quilt.install("' + result.owner + '/' + result.name + 
                    '", force=True)\n' +
                  'from quilt.data.' + result.owner + ' import ' + result.name;
                printCode(code);
                }}
                style={{'width':'80%', 'display':'inline-block'}} key={name}>
              {name}
              </div>
            <div style={{'background':'http://www.pvhc.net/img32/hpgctwysginkuscamdih.jpg', 
                'float':'right', 'display':'inline-block',
                'ariaHidden':'true'}}>
              <input type='button' 
                  className='p-TabBar-tabCloseIcon' onClick={() => {window.open(landingpage)}} />
            </div>
            </div>
          </li>
        });
      }
    };

    function QuiltSearchBar(props : {kd : (e : React.KeyboardEvent<HTMLInputElement>) => void}) {
      return <div className="p-CommandPalette-search">
          <div className="p-CommandPalette-wrapper">
            <input onKeyDown={props.kd} id="quiltwidget-input" 
              className="p-CommandPalette-input" placeholder="SEARCH"
              onChange={evt => updateInputValue(evt)}
            />
          </div>
        </div>;
    };

    function QuiltWidgetElement(props : 
        {results : QuiltQueryResult, kd : (e : React.KeyboardEvent<HTMLInputElement>) => void}) {
      var res = (props.results === null || props.results.length) ? 
          <ul className='jp-DirListing-content' style={{"overflow": "auto"}}>
            <QuiltResultList results={props.results || []}/>
          </ul>
        :
          <div className='jp-DirListing-content' style={{"padding": "20px"}}>
            <span>No results!</span>
          </div>
      ;
      return <div className='jp-DirListing' style={{"height": "100%"}}>
        <QuiltSearchBar kd={kd} />
        {res}
      </div>
      ;
    };

    ReactDOM.render(
      <QuiltWidgetElement kd={kd} results={null} />
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
  requires: [INotebookTracker],
  activate: (app, tracker : INotebookTracker) => {
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
