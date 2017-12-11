# jupyterlab_quilt

Quilt Data plugin for JupyterLab

## Prerequisites

### JupyterLab
This plugin is developed using the latest conda version of Jupyter Lab. Note that Jupyter Lab is in alpha, and conda builds may not be stable. The developer APIs are also unstable, and this extension may break with any update to Jupyter Lab. Please file a GitHub Issue if you have any difficulties.

## Installation

```bash
conda install jupyterlab
jupyter labextension install jupyterlab-quilt
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

