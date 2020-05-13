#!/usr/bin/env bash
FILE1=scouter-paper.zip
FILE2=./docker/$FILE1
BUILDFILE=./docker/docker-compose.yml
export GENERATE_SOURCEMAP=true
if [ -e $FILE1 ]
then
  echo "****1. build local file delete... "
  rm -f scouter-paper.zip
fi

if [ -e $DOCKER ]
then
  echo "****2. build docker folder local file delete... "
  rm -f FILE2
fi

echo "**** Finally build file ****"
 npm run build

echo "Last JOB docker build"
cd docker;docker-compose build;docker-compose push

