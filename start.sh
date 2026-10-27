#!/bin/sh
# DOGS app setup (see start.js). Run once in a fresh copy of the template.
exec node "$(dirname "$0")/start.js" "$@"
