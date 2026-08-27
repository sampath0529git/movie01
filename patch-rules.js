const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const watchProgressRule = `
    function isValidWatchProgress(data) {
      return data.keys().hasAll(['userId', 'mediaId', 'mediaType', 'progress', 'updatedAt', 'title', 'imageUrl']) &&
             data.userId is string && data.userId.size() > 0 && data.userId.size() <= 128 &&
             data.userId == request.auth.uid &&
             data.mediaId is string && data.mediaId.size() > 0 && data.mediaId.size() <= 128 &&
             data.mediaType is string && (data.mediaType == 'MOVIE' || data.mediaType == 'TV') &&
             data.progress is number && data.progress >= 0 &&
             (!('duration' in data) || data.duration is number) &&
             (!('seasonNumber' in data) || data.seasonNumber is number) &&
             (!('episodeNumber' in data) || data.episodeNumber is number) &&
             data.title is string && data.title.size() <= 200 &&
             data.imageUrl is string && data.imageUrl.size() <= 5000 &&
             data.updatedAt == request.time;
    }

    match /watch_progress/{progressId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && isValidId(progressId) && isValidWatchProgress(incoming());
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid && isValidWatchProgress(incoming()) && incoming().userId == existing().userId && incoming().mediaId == existing().mediaId;
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
`;

rules = rules.replace(/match \/media\/\{mediaId\}/, watchProgressRule + '\n    match /media/{mediaId}');
fs.writeFileSync('firestore.rules', rules);
