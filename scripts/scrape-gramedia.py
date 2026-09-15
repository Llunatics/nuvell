#!/usr/bin/env python3
"""
Entrypoint for npm run scrape:gramedia
Executes the Master Gramedia Catalog Ingestion & Specification Pipeline.
"""

import importlib.util
import os
import sys

scripts_dir = os.path.dirname(os.path.abspath(__file__))
module_path = os.path.join(scripts_dir, 'fetch-complete-catalog.py')
spec = importlib.util.spec_from_file_location('fetch_complete_catalog', module_path)
if spec and spec.loader:
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    run_master_ingestion = mod.run_master_ingestion
else:
    raise ImportError(f'Could not load {module_path}')

if __name__ == '__main__':
    run_master_ingestion()
