#!/bin/bash
source .env

echo ">>> build paper version $PAPER_VERSION"
export $PAPER_VERSION
docker build -t scouterapm/scouter-paper:$PAPER_VERSION .
