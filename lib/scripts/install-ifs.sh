#!/usr/bin/env bash

if ls ./node_modules | grep -w "$1"
then
  echo "${$1} is installed already"
  yarn extend-package-dependencies
else
  echo "${} is not installed , now installing..."
  yarn add -D internal-frontend-scripts &
  pid=$!
  echo "Waiting for process $1 id:${pid} to fni"
  wait $pid
  echo DONE DONE DONE
  yarn extend-package-dependencies
fi

