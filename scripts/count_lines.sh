#!/bin/sh
# Copyright (c) Venzio 2013 All Rights Reserved
#
# this is my super unrobust script to count the lines in the project


pushd `dirname $0` < /dev/null

GFX='..'

LIB=$(find ${GFX}/root/client/lib -name \*.js | xargs wc -l | grep total | awk '{print $1}')
JS=$(find ${GFX} -name \*.js | xargs wc -l | grep total | awk '{print $1}')
MODULES_JS=$(find ${GFX}/node_modules -name \*.js | xargs wc -l | grep total | awk '{print $1}')
GLSL=$(find ${GFX} -name \*.glsl | xargs wc -l | grep total | awk '{print $1}')
CSS=$(find ${GFX} -name \*.css | xargs wc -l | grep total | awk '{print $1}')
MODULES_CSS=$(find ${GFX}/node_modules -name \*.css | xargs wc -l | grep total | awk '{print $1}')
HTML=$(find ${GFX} -name \*.html | xargs wc -l | grep total | awk '{print $1}')
MODULES_HTML=$(find ${GFX}/node_modules -name \*.html | xargs wc -l | grep total | awk '{print $1}')
SH=$(find ${GFX} -name \*.sh | xargs wc -l | grep total | awk '{print $1}')

echo "JS: $(expr $JS - $LIB - $MODULES_JS)"
echo "GLSL: $GLSL"
echo "CSS: $(expr $CSS - $MODULES_CSS)"
echo "HTML: $(expr $HTML - $MODULES_HTML)"
echo "SH: $SH"
echo "-----"
echo "Total: $(expr $JS + $GLSL + $CSS + $HTML + $SH - $LIB - $MODULES_JS - $MODULES_CSS - $MODULES_HTML)"

popd < /dev/null
