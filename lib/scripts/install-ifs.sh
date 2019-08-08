#!/usr/bin/env bash

if ls ./node_modules | grep -w "$1"
then
  echo "Extension source package is installed already"
  yarn extend-package-dependencies
else
  echo "Extension source package is not installed , now installing..."
  yarn add -D internal-frontend-scripts &
  pid=$!
  echo "Waiting for extension source package to finish installing (pid: ${pid})"
  wait $pid
  echo "Done installing extension source package"
  yarn extend-package-dependencies
fi

