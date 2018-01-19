# jupyterlab_quilt

Quilt Data plugin for JupyterLab

## Prerequisites

### JupyterLab
This plugin is developed using the latest conda version of Jupyter Lab. Note that Jupyter Lab is in alpha, and conda builds may not be stable. The developer APIs are also unstable, and this extension may break with any update to Jupyter Lab. Please file a GitHub Issue if you have any difficulties.

## Installation

If you don't have Conda installed, follow [this link](https://conda.io/miniconda.html) and follow the instructions for your OS.

```bash
conda create -n jupyterlab-quilt python=3.6
source activate jupyterlab-quilt # omit 'source' on Windows
pip install quilt
conda install jupyterlab
jupyter labextension install jupyterlab-quilt
```

## Running

```bash
source activate jupyterlab-quilt # omit 'source' on Windows
jupyter lab
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
# from root of repository
npm install
jupyter labextension link . 
npm run watch
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

