#!/bin/sh
# Copyright (c) Venzio 2013 All Rights Reserved
#
# this is my super unrobust script to count the lines in the project

pushd `dirname $0` > /dev/null

GFX='..'

JS=$(wc -l `find ${GFX} -name \*.js -print` | grep total | awk '{print $1}')
LIB=$(wc -l `find ${GFX}/roots/www/root/client/lib -name \*.js -print` | grep total | awk '{print $1}')
MODULES_JS=$(wc -l `find ${GFX}/node_modules -name \*.js -print` | grep total | awk '{print $1}')
GLSL=$(wc -l `find ${GFX} -name \*.glsl -print` | grep total | awk '{print $1}')
CSS=$(wc -l `find ${GFX} -name \*.css -print` | grep total | awk '{print $1}')
MODULES_CSS=$(wc -l `find ${GFX}/node_modules -name \*.css -print` | grep total | awk '{print $1}')
HTML=$(wc -l `find ${GFX} -name \*.html -print` | grep total | awk '{print $1}')
MODULES_HTML=$(wc -l `find ${GFX}/node_modules -name \*.html -print` | grep total | awk '{print $1}')
SH=$(wc -l `find ${GFX} -name \*.sh -print` | grep total | awk '{print $1}')
MODULES_SH=$(wc -l `find ${GFX}/node_modules -name \*.sh -print` | awk '{print $1}')
EJS=$(wc -l `find ${GFX} -name \*.ejs -print` | grep total | awk '{print $1}')
MODULES_EJS=$(wc -l `find ${GFX}/node_modules -name \*.ejs -print` | grep total | awk '{print $1}')

echo "JS: $(expr $JS - $LIB - $MODULES_JS)"
echo "GLSL: $GLSL"
echo "CSS: $(expr $CSS - $MODULES_CSS)"
echo "HTML: $(expr $HTML - $MODULES_HTML)"
echo "EJS: $(expr $EJS - $MODULES_EJS)"
echo "SH: $(expr $SH - $MODULES_SH)"
echo "-----"
echo "Total: $(expr $JS + $GLSL + $CSS + $HTML + $EJS + $SH - $LIB - $MODULES_JS - $MODULES_CSS - $MODULES_HTML - $MODULES_EJS - $MODULES_SH)"

popd > /dev/null
