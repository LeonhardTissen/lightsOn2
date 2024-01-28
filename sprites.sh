npx spritesheet-js assets/game/*.png -f pixi.js -p src/assets/imgs/ -n game.spritesheet #--trim
optipng src/assets/**/*.png
# correct the ref
jq --tab '.meta.image = "@ref(./\(.meta.image))"' src/assets/imgs/game.spritesheet.json > src/assets/imgs/game.spritesheet.json.tmp
mv src/assets/imgs/game.spritesheet.json.tmp src/assets/imgs/game.spritesheet.json
