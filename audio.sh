 
audiosprite --output public/audio/1 --format howler src/assets/audio_src/*
cp public/audio/1.json src/assets/spritesheet.json
sed -i 's/public//g' src/assets/spritesheet.json
