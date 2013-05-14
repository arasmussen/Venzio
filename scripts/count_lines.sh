#!/bin/sh
# Copyright (c) Venzio 2013 All Rights Reserved
#
# this is my super unrobust script to count the lines in the project


pushd `dirname $0` < /dev/null

GFX='..'

JS=$(wc -l `find ${GFX} -name \*.js` | grep total | awk '{print $1}')
LIB=$(wc -l `find ${GFX}/root/client/lib -name \*.js` | grep total | awk '{print $1}')
MODULES_JS=$(wc -l `find ${GFX}/node_modules -name \*.js` | grep total | awk '{print $1}')
GLSL=$(wc -l `find ${GFX} -name \*.glsl` | grep total | awk '{print $1}')
CSS=$(wc -l `find ${GFX} -name \*.css` | grep total | awk '{print $1}')
MODULES_CSS=$(wc -l `find ${GFX}/node_modules -name \*.css` | grep total | awk '{print $1}')
HTML=$(wc -l `find ${GFX} -name \*.html` | grep total | awk '{print $1}')
MODULES_HTML=$(wc -l `find ${GFX}/node_modules -name \*.html` | grep total | awk '{print $1}')
SH=$(wc -l `find ${GFX} -name \*.sh` | grep total | awk '{print $1}')

echo "JS: $(expr $JS - $LIB - $MODULES_JS)"
echo "GLSL: $GLSL"
echo "CSS: $(expr $CSS - $MODULES_CSS)"
echo "HTML: $(expr $HTML - $MODULES_HTML)"
echo "SH: $SH"
echo "-----"
echo "Total: $(expr $JS + $GLSL + $CSS + $HTML + $SH - $LIB - $MODULES_JS - $MODULES_CSS - $MODULES_HTML)"

popd < /dev/null
