#!/bin/bash
set -eo pipefail

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG=$BASEDIR/.env

echo "What hostname do you want to run the app on?"
read HOST
echo "What port do you want to run the listener on?"
read PORT

cat <<EOF > $CONFIG
HOSTNAME=$HOST
PORT=$PORT
EOF

