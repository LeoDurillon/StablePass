#!/bin/sh

bun build ./index.ts --outdir=out

cp manifest/* out/
