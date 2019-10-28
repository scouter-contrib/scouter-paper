#!/bin/bash
source .env
echo ">>> build paper version $PAPER_VERSION"
docker push scouterapm/scouter-paper:$PAPER_VERSION
