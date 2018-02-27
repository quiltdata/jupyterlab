# jupyterlab_quilt

Quilt Data plugin for JupyterLab

## Prerequisites

### JupyterLab
This plugin is developed using the latest conda version of Jupyter Lab. Note that Jupyter Lab is in alpha, and conda builds may not be stable. The developer APIs are also unstable, and this extension may break with any update to Jupyter Lab. Please file a GitHub Issue if you have any difficulties.

The instructions to install Jupyter Lab are [here](https://github.com/jupyterlab/jupyterlab#installation).

## Installation
```bash
pip install quilt
pip install jupyter -U
pip install jupyterlab
jupyter labextension install jupyterlab-quilt
jupyter lab
```

## Running

```bash
source activate jupyterlab-quilt # omit 'source' on Windows
jupyter lab
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run watch
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

