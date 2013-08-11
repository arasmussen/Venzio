#!/bin/sh
# Copyright (c) Venzio 2013 All Rights Reserved

pushd `dirname $0` > /dev/null

ROOTS='../../roots'
SUBDOMAIN="${ROOTS}/$1"

if [ ! -d $SUBDOMAIN ]; then
  mkdir $SUBDOMAIN
  cp -R example/* $SUBDOMAIN
fi

popd > /dev/null
