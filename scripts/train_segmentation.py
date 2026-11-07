"""Prepare, compare and freeze Task 4 clustering; no changes to Task 3 artifacts."""

import argparse
from pathlib import Path

from netflix_ml.tasks.task_04.training import train

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path)
    train(parser.parse_args().config)
