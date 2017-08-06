#!/bin/bash

sed '/return {/a \
'"$1"': require('"'"'./'"$2"'/'"$1"'Message'"'"')(bot),\
' "./messages/$2Messages.js"