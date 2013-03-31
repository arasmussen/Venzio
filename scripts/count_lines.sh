#!/bin/sh
# this is my super unrobust script to count the lines in the project

GFX='/home/ec2-user/www/venzio'

LIB=$(find ${GFX}/root/client/lib -name \*.js | xargs wc -l | grep total | awk '{print $1}')
JS=$(find ${GFX} -name \*.js | xargs wc -l | grep total | awk '{print $1}')
GLSL=$(find ${GFX} -name \*.glsl | xargs wc -l | grep total | awk '{print $1}')
CSS=$(find ${GFX} -name \*.css | xargs wc -l | awk '{print $1}')
HTML=$(find ${GFX} -name \*.html | xargs wc -l | awk '{print $1}')
SH=$(find ${GFX} -name \*.sh | xargs wc -l | awk '{print $1}')

echo "JS: $(expr $JS - $LIB)"
echo "GLSL: $GLSL"
echo "CSS: $CSS"
echo "HTML: $HTML"
echo "SH: $SH"
echo "-----"
echo "Total: $(expr $JS - $LIB + $GLSL + $CSS + $HTML + $SH)"
