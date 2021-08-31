#!/bin/bash

# https://stackoverflow.com/a/14203146 for positional arg parsing

POSITIONAL=()
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -n|--name)
      PROJECT_NAME="$2"
      shift # past argument
      shift # past value
      ;;
    -p|--path)
      PROJECT_PATH="$2"
      shift # past argument
      shift # past value
      ;;
    *)    # unknown option
      POSITIONAL+=("$1") # save it in an array for later
      shift # past argument
      ;;
  esac
done

set -- "${POSITIONAL[@]}" # restore positional parameters

echo "Creating new serverless-stack $PROJECT_PATH/$PROJECT_NAME"

cd $PROJECT_PATH
yarn create serverless-stack $PROJECT_NAME --language typescript --use-yarn
cd -