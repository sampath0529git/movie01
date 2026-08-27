const fs = require('fs');
const files = ['src/views/DiscoverView.tsx', 'src/views/MoviesView.tsx', 'src/views/TvSeriesView.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/{ id: "All", name: "All" },\s*{ id: "Action", name: "ක්‍රියාදාම" },\s*{ id: "Crime", name: "අපරාධ" },\s*{ id: "Mystery", name: "අභිරහස්" },\s*{ id: "Romance", name: "ආදර කතා" },\s*{ id: "Animation", name: "ඇනිමේෂන්" },\s*{ id: "History", name: "ඉතිහාස" },\s*{ id: "Sports", name: "ක්‍රීඩා" },\s*{ id: "Thriller", name: "ත්‍රාසජනක" },\s*{ id: "Sci-Fi", name: "විද්‍යා ප්‍රබන්ධ" },\s*{ id: "Horror", name: "හොල්මන්" },\s*{ id: "Comedy", name: "විකට" },\s*{ id: "Adventure", name: "වීරක්‍රියා" }/g, 
  `{ id: "All", name: "All" },
    { id: "Action", name: "Action" },
    { id: "Crime", name: "Crime" },
    { id: "Mystery", name: "Mystery" },
    { id: "Romance", name: "Romance" },
    { id: "Animation", name: "Animation" },
    { id: "History", name: "History" },
    { id: "Sports", name: "Sports" },
    { id: "Thriller", name: "Thriller" },
    { id: "Sci-Fi", name: "Sci-Fi" },
    { id: "Horror", name: "Horror" },
    { id: "Comedy", name: "Comedy" },
    { id: "Adventure", name: "Adventure" }`);
    
  fs.writeFileSync(file, content, 'utf8');
}
