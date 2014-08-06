# This script requires the convert command line tool,
# which is part of imagemagick package

# args:
#   $1 : input directory (containing png screen shots)
#   $2 : output directory (cropped images will be written here)

for file in $1/*.png
do
	filename="${file##*/}";
	convert -crop 613x550+4+227 ${file} $2/${filename}
done
