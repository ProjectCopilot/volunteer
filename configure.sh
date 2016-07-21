#!/bin/bash
set -eo pipefail

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG=$BASEDIR/.env

echo "What hostname do you want to run the app on?"
read HOST
echo "What port do you want to run the listener on?"
read PORT
echo "What is the Firebase Client API Key?"
read FB_KEY
echo "What is the Firebase database ID?"
read FB_ID

cat <<EOF > $CONFIG
HOSTNAME=$HOST
PORT=$PORT
FIREBASE_CLIENT_API_KEY=$FB_KEY
FIREBASE_ID=$FB_ID
EOF
