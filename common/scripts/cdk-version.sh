#!/bin/bash

sst -v | grep CDK | cut -d ":" -s -f2- | awk '{$1=$1};1'