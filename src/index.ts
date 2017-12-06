import {
  // JupyterLab,
  JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette
  , Toolbar
  , ToolbarButton
} from '@jupyterlab/apputils';

import {
  PanelLayout,
  Widget
} from '@phosphor/widgets';

import {
  IDisposable,
  DisposableDelegate
} from '@phosphor/disposable';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookActions,
  NotebookPanel,
  INotebookModel,
  INotebookTracker
} from '@jupyterlab/notebook';

import '../style/index.css';

(window as any).gpanel = 'asdf';

class QuiltWidget extends Widget {
  constructor(printCode : any) {
    super();

    this.id = 'quilt';
    this.title.label = 'Quilt Data';

    this.addClass('jp-FileBrowser');

    let layout = new PanelLayout();

    this.toolbar = new Toolbar<Widget>();

    this.tb = new ToolbarButton({
      className : 'jp-AddIcon'
    });

    // this.toolbar.addItem('New', this.tb);

    let search = new Widget();
    let input = document.createElement('input');
    input.spellcheck = false;
    input.className = 'p-CommandPalette-input';
    search.node.appendChild(input); 

    layout.addWidget(search);
    // layout.addWidget(this.toolbar);

    let results = new Widget();
    let ul = document.createElement('ul');
    ul.id = 'quilt-search-results';
    ul.setAttribute('class', 'jp-DirListing-content');
    results.node.appendChild(ul);
    layout.addWidget(results);

    this.layout = layout;

    function handleSearch() {
      fetch('https://pkg.quiltdata.com/api/search/?q=' + input.value)
        .then(response => response.json())
        .then(json => {
          // console.log(json);
          if (json.status === 200) {
            while (ul.children.length) {
              ul.removeChild(ul.children.item(0));
            }
            json.packages.forEach((e:any) => {
              let i = document.createElement('li');
              i.innerText = e.owner + '/' + e.name;
              i.setAttribute('class', 'jp-DirListing-item');
              function print() {
                var code = 'import quilt\n' +
                  'quilt.install("' + e.owner + '/' + e.name + 
                    '", force=True)\n' +
                  'from quilt.data.' + e.owner + ' import ' + e.name;
                printCode(code);
              };
              i.addEventListener('click', print);
              ul.appendChild(i);
            });
          };
        });
    }

    input.addEventListener("change", handleSearch, false);


    this.toolbar.addClass('jp-FileBrowser-toolbar');
  }

  setOnClick(f? : () => void) {
    this.tb.node.addEventListener('click', f, false);
  }

  updateSendPython(f :(code : string) => void) {
    this.sendPython = f;
  }

  readonly toolbar : Toolbar<Widget>;
  readonly tb : ToolbarButton;
  private sendPython? : (code : string) => void;

}

class QuiltNotebookExtension implements 
    DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  constructor(setActiveNotebook : any) {
    this.setActiveNotebook = setActiveNotebook;
  }

  insertPython = (command : string) : void => {
    var text = this.panel.notebook.activeCell.model.value.text;
    if (text === '') {
      this.panel.notebook.activeCell.model.value.text = command;
    } else {
      NotebookActions.insertBelow(this.panel.notebook);
      this.panel.notebook.activeCell.model.value.text = command;
    }
  }

  executePython(commands : Array<string>) : void {
    this.panel.notebook.activeCell.model.value.text = commands.shift();
    var p = NotebookActions.runAndInsert(this.panel.notebook, this.context.session);
    while (commands.length) {
      var curr = commands.shift();
      p.then(() => {
        this.panel.notebook.activeCell.model.value.text = curr;
        return NotebookActions.runAndInsert(this.panel.notebook, this.context.session);
      });
    }
  }

  setActive = () => {
    this.setActiveNotebook(this.insertPython);
  };

  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>) : IDisposable {
    this.panel = panel;
    this.context = context;
    this.setActive();
    panel.notebook.stateChanged.connect(() => this.setActive());
    panel.notebook.selectionChanged.connect(() => this.setActive());
    return new DisposableDelegate(() => {});
  }

  private panel : NotebookPanel;
  private context : DocumentRegistry.IContext<INotebookModel>;
  private setActiveNotebook : any;
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
    function setActiveNotebook(f : (code : string) => void) {
    }

    let widget = new QuiltWidget(printCode);

    app.shell.addToLeftArea(widget);

    let ext = new QuiltNotebookExtension(setActiveNotebook);
    app.docRegistry.addWidgetExtension('Notebook', ext);
  }
};

export default extension;
