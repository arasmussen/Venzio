#!/bin/sh
# Copyright (c) Venzio 2013 All Rights Reserved

pushd `dirname $0` > /dev/null

ROOT='../root'
WWW="${ROOT}/www"
SUBDOMAIN="${ROOT}/$1"

if [ ! -d $SUBDOMAIN ]; then
  mkdir $SUBDOMAIN
  mkdir $SUBDOMAIN/img
  mkdir $SUBDOMAIN/css
  cp $WWW/img/headerLogo.png $SUBDOMAIN/img
  cp $WWW/img/favicon.ico $SUBDOMAIN/img
  cp $WWW/img/whiteBackground.jpg $SUBDOMAIN/img
  cp $WWW/css/reset.css $SUBDOMAIN/css
  cp $WWW/css/global.css $SUBDOMAIN/css/global.css
  cp $WWW/analytics.js $SUBDOMAIN/analytics.js
  cp $WWW/script.js $SUBDOMAIN/script.js
  touch $SUBDOMAIN/index.html
fi

popd > /dev/null
