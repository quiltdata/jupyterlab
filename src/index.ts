import {
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

import '../style/index.css';

class QuiltWidget extends Widget {
  constructor() {
    super();

    this.id = 'quilt';
    this.title.label = 'Quilt Data';

    this.addClass('jp-FileBrowser');

    let layout = new PanelLayout();

    this.toolbar = new Toolbar<Widget>();

    let newthing = new ToolbarButton({
      className : 'jp-AddIcon'
    });

    this.toolbar.addItem('New', newthing);

    let search = new Widget();
    let input = document.createElement('input');
    input.spellcheck = false;
    input.className = 'p-CommandPalette-input';
    search.node.appendChild(input); 

    layout.addWidget(search);
    layout.addWidget(this.toolbar);

    let results = new Widget();
    let ul = document.createElement('ul');
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
              let i = document.createElement('ul');
              i.innerText = e.name;
              ul.appendChild(i);
            });
          };
        });
    }

    input.addEventListener("change", handleSearch, false);


    this.toolbar.addClass('jp-FileBrowser-toolbar');

  }

  readonly toolbar : Toolbar<Widget>;

}

/**
 * Initialization data for the jupyterlab_quilt extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'Quilt',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app, palette: ICommandPalette) => {
    console.log('JupyterLab extension Quilt is activated!');

    let widget = new QuiltWidget();

    app.shell.addToLeftArea(widget);
  }
};

export default extension;
