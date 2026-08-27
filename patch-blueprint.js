const fs = require('fs');
const blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

blueprint.entities.WatchProgress = {
  "title": "Watch Progress",
  "description": "Tracks a user's playback progress for a media item",
  "type": "object",
  "properties": {
    "userId": { "type": "string" },
    "mediaId": { "type": "string" },
    "mediaType": { "type": "string" },
    "progress": { "type": "number", "description": "Progress in seconds" },
    "duration": { "type": "number", "description": "Total duration in seconds" },
    "seasonNumber": { "type": "number" },
    "episodeNumber": { "type": "number" },
    "updatedAt": { "type": "string", "description": "Timestamp of the last progress update" },
    "title": { "type": "string" },
    "imageUrl": { "type": "string" }
  },
  "required": ["userId", "mediaId", "mediaType", "progress", "updatedAt", "title", "imageUrl"]
};

blueprint.firestore["watch_progress/{progressId}"] = {
  "schema": { "$ref": "#/entities/WatchProgress" },
  "description": "Progress tracking for users"
};

fs.writeFileSync('firebase-blueprint.json', JSON.stringify(blueprint, null, 2));
