#!/bin/bash
echo $0: creating public and private key files

# Create the .ssh directory
mkdir -p $HOME/.ssh
chmod 700 $HOME/.ssh

# Create the public and private key files from the environment variables.
echo $PUBLIC_KEY > $HOME/.ssh/heroku_id_rsa.pub
chmod 644 $HOME/.ssh/heroku_id_rsa.pub

# Note use of double quotes, required to preserve newlines
echo $PRIVATE_KEY > $HOME/.ssh/heroku_id_rsa
chmod 600 $HOME/.ssh/heroku_id_rsa

# Preload the known_hosts file  (see "version 2" below)
#ssh-keyscan -t rsa <REMOTE_MYSQL_HOST> > ~/.ssh/known_hosts

# Start the SSH tunnel if not already running
SSH_CMD="ssh -f -o StrictHostKeyChecking=no -p $TUNNEL_PORT -i $HOME/.ssh/heroku_id_rsa -N -L 6472:127.0.0.1:6472 $TUNNEL_USER@$TUNNEL_SITE"

PID=`pgrep -f "$SSH_CMD"`
if [ $PID ] ; then
    echo $0: tunnel already running on $PID
else
    echo $0 launching tunnel
    $SSH_CMD
fi