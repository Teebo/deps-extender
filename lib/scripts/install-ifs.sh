#!/usr/bin/env bash

if ls ./node_modules | grep -w "$1"
then
  echo "IFS IS INSTALLED"
  yarn extend-package-dependencies
else
  echo "IFS NOT INSTALLED, INSTALLING..."
  yarn add -D internal-frontend-scripts &
  pid=$!
  echo "THEHEHE ${pid}"
  wait $pid
  echo DONE DONE DONE
  yarn extend-package-dependencies
fi

