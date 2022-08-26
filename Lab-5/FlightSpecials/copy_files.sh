if [ $# -eq 0 ]; then
    echo ""
    echo "-----------------------------------------------"
    echo "No arguments provided"
    echo "Please provide the target folder absolute path"
    echo "-----------------------------------------------"
    echo ""
    exit 1
fi

echo ""
echo "-----------------------------------------------"
echo "Copying new implementation to:"
echo "     $1"
echo "-----------------------------------------------"
echo ""

sleep 0.1s

rm -rf $1/src
cp -r src $1/src
rm -rf $1/target
cp buildspec.yml $1/.
rm -rf $1/swagger.yml
cp swagger.yml $1/.
rm -rf $1/pom.yml
cp pom.xml $1/.
rm -rf $1/template.yml
cp template.yml $1/.
cp template-configuration.json $1/.
cp .gitignore $1/.

sleep 0.1s

[ -f "$1/README.md" ] && rm "$1/README.md"
echo "     done!"
echo ""
echo ""

sleep 0.2s