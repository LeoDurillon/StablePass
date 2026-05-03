#!/bin/sh

rm -rf out

mkdir out

mkdir out/popup

bun --filter '*' build

cp apps/generator/out/* out/

cp apps/popup/dist/* out/popup/

cp manifest/* out/
