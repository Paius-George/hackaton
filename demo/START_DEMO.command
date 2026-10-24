#!/bin/zsh
cd -- "$(dirname -- "$0")"
exec python3 energy_data_pipeline.py --synthetic-baseline --serve
