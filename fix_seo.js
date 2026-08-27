const fs = require('fs');

function replaceFileContent(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/අලුත්ම චිත්‍රපට සිංහල උපසිරැසි සහිතව. Watch the latest action, marvel, tamil and hindi movies with sinhala subtitles online for free/g, 'Watch the latest movies online for free');
  content = content.replace(/Watch top rated IMDb movies with Sinhala subtitles/g, 'Watch top rated IMDb movies');
  content = content.replace(/with Sinhala subtitles in HD quality/g, 'in HD quality');
  content = content.replace(/with Sinhala subtitles/g, '');
  content = content.replace(/අලුත්ම \$\{sinhalaTitle\} චිත්‍රපට \(\$\{englishTitle\} Movies\) සිංහල උපසිරැසි සමඟ නැරඹීමට සහ බාගත කරගැනීමට. හොඳම සහ නවතම \$\{sinhalaTitle\} චිත්‍රපට සිංහලෙන් උපසිරැසි ගන්වා ඇති අතර, ඔබට ඉතා පහසුවෙන් මෙම චිත්‍රපට අන්තර්ජාලය හරහා නැරඹිය හැකිය. ජනප්‍රිය \$\{sinhalaTitle\} චිත්‍රපට රැසක් අප අඩවියෙන් නොමිලේ රසවිඳින්න./g, `Watch the latest \${englishTitle} Movies online for free. Enjoy our best and newest \${englishTitle} movies collection in HD quality. Download and stream the most popular \${englishTitle} titles easily right now.`);
  content = content.replace(/අලුත්ම \$\{sinhalaTitle\} ටෙලි නාට්‍ය සහ කතාමාලා \(\$\{englishTitle\} TV Series\) සිංහල උපසිරැසි සමඟ නැරඹීමට සහ බාගත කරගැනීමට. හොඳම සහ නවතම \$\{sinhalaTitle\} කතාමාලා සිංහලෙන් උපසිරැසි ගන්වා ඇති අතර, ඔබට ඉතා පහසුවෙන් මේවා අන්තර්ජාලය හරහා නැරඹිය හැකිය. ජනප්‍රිය \$\{sinhalaTitle\} කතාමාලා රැසක් අප අඩවියෙන් නොමිලේ රසවිඳින්න./g, `Watch the latest \${englishTitle} TV Series online for free. Enjoy our best and newest \${englishTitle} series collection in HD quality. Download and stream the most popular \${englishTitle} episodes easily right now.`);
  content = content.replace(/සිංහල උපසිරැසි සමඟ චිත්‍රපට/g, 'free movies online');
  content = content.replace(/sinhala subtitles movies/g, 'free movies');
  content = content.replace(/sinhala sub download/g, 'movie download');
  content = content.replace(/aluth film sinhala sub/g, 'latest films');
  content = content.replace(/download english movies with sinhala subtitles/g, 'download movies');
  content = content.replace(/best action movies 2026 sinhala sub/g, 'best action movies 2026');
  content = content.replace(/marvel movies sinhala sub list/g, 'marvel movies list');
  content = content.replace(/hindi movies with sinhala subtitles/g, 'hindi movies');
  content = content.replace(/tamil movies sinhala sub/g, 'tamil movies');
  content = content.replace(/korean drama sinhala sub/g, 'korean dramas');
  content = content.replace(/movies sinhala subtitle/g, 'movies online');
  content = content.replace(/Sinhala sub movies/g, 'HD movies');
  content = content.replace(/download movies sinhala subtitles/g, 'download movies');
  content = content.replace(/සිංහල උපසිරැසි/g, 'HD movies');
  content = content.replace(/Sinhala sub/gi, 'HD movies');
  content = content.replace(/Sinhala subtitles/gi, 'HD movies');
  fs.writeFileSync(filepath, content, 'utf8');
}

['src/views/MoviesView.tsx', 'src/views/TvSeriesView.tsx', 'src/views/HomeView.tsx', 'src/views/DiscoverView.tsx'].forEach(replaceFileContent);

