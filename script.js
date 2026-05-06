const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const body = document.body;
const localTime = document.querySelector("#local-time");
const vibeButton = document.querySelector("#shuffle-vibe");
const focusOutput = document.querySelector("#focus-output");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-tags]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const twitchPlayers = document.querySelectorAll("[data-twitch-player]");
const twitchChats = document.querySelectorAll("[data-twitch-chat]");
const movieGrid = document.querySelector("#movie-grid");
const movieSearch = document.querySelector("#movie-search");
const movieResults = document.querySelector("[data-movie-results]");
const movieCount = document.querySelector("[data-movie-count]");
const movieClearButton = document.querySelector("[data-movie-clear]");

const palettes = [
  {
    name: "Workbench glow",
    colors: ["#ff6f4f", "#f5c45b", "#6de1a6", "#68b7ff", "#bd92ff"]
  },
  {
    name: "Arcade solder",
    colors: ["#ff4f8b", "#ffd166", "#08f7a6", "#45d6ff", "#a78bfa"]
  },
  {
    name: "Movie night",
    colors: ["#ff8a5c", "#f6d365", "#7bd88f", "#8ec5ff", "#f0abfc"]
  },
  {
    name: "Terminal mint",
    colors: ["#f07167", "#f8d66d", "#8cffc1", "#7cc7ff", "#c4a7ff"]
  }
];

const focusLines = [
  "tuning MovieBot, polishing the site, and catching the next tiny automation idea",
  "turning stream chores into buttons with brighter feedback",
  "keeping the projects small enough to finish and weird enough to remember",
  "writing down the setup details before they disappear"
];

const movieNightRows = [
  [1, "tt0017463", "3 Bad Men", "1926", "1h 32m", "7.5", "https://m.media-amazon.com/images/M/MV5BNzdiNDRlZDItZGUxNy00YmRiLWFjMzItMDlkYzJkODM0NGYxXkEyXkFqcGc@._V1_QL75_UX180_CR0,11,180,266_.jpg"],
  [2, "tt0018379", "7th Heaven", "1927", "1h 50m", "7.5", "https://m.media-amazon.com/images/M/MV5BMTk2MjUzMzk3OV5BMl5BanBnXkFtZTcwOTk1MjQxMw@@._V1_QL75_UX180_CR0,4,180,266_.jpg"],
  [3, "tt0020620", "Abraham Lincoln", "1930", "1h 36m", "5.7", "https://m.media-amazon.com/images/M/MV5BMTM0Nzk2MDg5N15BMl5BanBnXkFtZTcwOTIyMTMzNA@@._V1_QL75_UX180_CR0,7,180,266_.jpg"],
  [4, "tt0015532", "The Adventures of Prince Achmed", "1926", "1h 20m", "7.8", "https://m.media-amazon.com/images/M/MV5BODUyYWQ1MTItODIwMy00NzdmLTkyZmEtNzE2MzRhMjBlNTYzXkEyXkFqcGc@._V1_QL75_UX180_CR0,2,180,266_.jpg"],
  [5, "tt0040829", "The Amazing Mr. X", "1948", "1h 18m", "6.4", "https://m.media-amazon.com/images/M/MV5BMWFlMTMyYzAtNDZiYi00MmUxLTgxNzktYTJkMTA0ODMyNzAxXkEyXkFqcGc@._V1_QL75_UX180_CR0,8,180,266_.jpg"],
  [6, "tt0039152", "Angel and the Badman", "1947", "1h 40m", "6.8", "https://m.media-amazon.com/images/M/MV5BZjc4NzhmYjQtOTMwNi00OGVlLTlhMzItMWMxNTQ3YjFmYmYxXkEyXkFqcGc@._V1_QL75_UX180_CR0,1,180,266_.jpg"],
  [7, "tt0052602", "The Bat", "1959", "1h 20m", "6.1", "https://m.media-amazon.com/images/M/MV5BNjgwMDc3ZTUtMjNiZi00Y2RhLTgzNDItZjZmYjdkZjE2MmVmXkEyXkFqcGc@._V1_QL75_UX180_CR0,7,180,266_.jpg"],
  [8, "tt0015648", "Battleship Potemkin", "1925", "1h 15m", "7.9", "https://m.media-amazon.com/images/M/MV5BYTc5YmIxYjEtYmE3NS00MzIzLTkzMDctNjFlZTg4OGVjNmQxXkEyXkFqcGc@._V1_QL75_UY266_CR6,0,180,266_.jpg"],
  [9, "tt0046414", "Beat the Devil", "1953", "1h 29m", "6.4", "https://m.media-amazon.com/images/M/MV5BMjA2MDUyMzcxMl5BMl5BanBnXkFtZTgwOTQzNzYzMjE@._V1_QL75_UY266_CR13,0,180,266_.jpg"],
  [10, "tt0016641", "Ben-Hur: A Tale of the Christ", "1925", "2h 23m", "7.8", "https://m.media-amazon.com/images/M/MV5BMjQ4MTFjODUtMzBlNy00ODc4LWJmMDctZDM0YjczZDdhMGNjXkEyXkFqcGc@._V1_QL75_UY266_CR0,0,180,266_.jpg"],
  [11, "tt0047878", "The Big Combo", "1955", "1h 27m", "7.3", "https://m.media-amazon.com/images/M/MV5BNzJiYjQ1ODgtZjhjNy00NzZiLWEzZjYtMDk2NWYxYzY4OWIyXkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [12, "tt0015624", "The Big Parade", "1925", "2h 31m", "7.9", "https://m.media-amazon.com/images/M/MV5BNjY2MTA1MjExNV5BMl5BanBnXkFtZTgwNzQ2ODAyMjE@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [13, "tt0052646", "The Brain That Wouldn't Die", "1962", "1h 22m", "4.6", "https://m.media-amazon.com/images/M/MV5BNWQ4MzE2OGQtZDg5OS00NTQzLTg5NTMtZjU5ZGUxMTlhZDk0XkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [14, "tt0009968", "Broken Blossoms", "1919", "1h 30m", "7.2", "https://m.media-amazon.com/images/M/MV5BNTM0MjdkZTAtZGMzNi00MTU0LTg3MGYtNmRjMmVkMTY4OGMzXkEyXkFqcGc@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [15, "tt0052655", "A Bucket of Blood", "1959", "1h 6m", "6.7", "https://m.media-amazon.com/images/M/MV5BNDA4NTI0ZDAtYTNiMS00MDE3LTk4ZDgtNGQyNGQ0Y2M4OWM1XkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [16, "tt0010323", "The Cabinet of Dr. Caligari", "1920", "58m", "8.0", "https://m.media-amazon.com/images/M/MV5BMTY3MzQzNzQyNF5BMl5BanBnXkFtZTgwNDUyNjkxMTE@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [17, "tt0018742", "The Cameraman", "1928", "1h 16m", "8.0", "https://m.media-amazon.com/images/M/MV5BNTMyYzllZjEtNDg0Ni00MDc1LTkzZTYtN2E1NzJiMWMxY2Q5XkEyXkFqcGc@._V1_QL75_UX90_CR0,4,90,133_.jpg"],
  [18, "tt0055830", "Carnival of Souls", "1962", "1h 18m", "7.0", "https://m.media-amazon.com/images/M/MV5BZGZiMTVjNDYtYjhmNy00ODhlLWI0YjEtN2FmZmI2ZDAyMjM0XkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [19, "tt0056923", "Charade", "1963", "1h 53m", "7.8", "https://m.media-amazon.com/images/M/MV5BM2FiMmFkNWItNzNmOS00MWQ3LWExNTUtZWJkOTBmNzg0ZWRjXkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [20, "tt0012349", "The Kid", "1921", "58m", "8.2", "https://m.media-amazon.com/images/M/MV5BNjkxMzY1NTQtN2YwOS00NmIwLTlkNTMtMjNkMzk1ZTk3ZDU2XkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [21, "tt0018773", "The Circus", "1928", "1h 12m", "8.1", "https://m.media-amazon.com/images/M/MV5BZjNhZWY4YjgtOTI2Zi00NWZlLWIyNDItNGY0MzhhNmUxNTkyXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [22, "tt0018806", "The Crowd", "1928", "1h 38m", "8.0", "https://m.media-amazon.com/images/M/MV5BZmRkNjk1ZDgtOTk2Ny00ZjU5LTg4NWQtYzNmNzFkMzA4MWMxXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [23, "tt0007832", "The Cure", "1917", "24m", "7.1", "https://m.media-amazon.com/images/M/MV5BMjAyNjkyODYxNF5BMl5BanBnXkFtZTgwMDc0NzkwMjE@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [24, "tt0042369", "D.O.A.", "1949", "1h 23m", "7.2", "https://m.media-amazon.com/images/M/MV5BNDFjMmJjNjQtMDk3MS00ZjVkLWI4ZTItZGEzYTY2NTVkNTQzXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [25, "tt0012494", "Destiny", "1921", "1h 37m", "7.6", "https://m.media-amazon.com/images/M/MV5BOGQ4NjhkMDktOTJhMC00ZTk0LTliYzEtOTAyZDcxMmZlMTE4XkEyXkFqcGc@._V1_QL75_UY133_CR4,0,90,133_.jpg"],
  [26, "tt0037638", "Detour", "1945", "1h 6m", "7.3", "https://m.media-amazon.com/images/M/MV5BNzI3MGM0NmQtOWNjYS00OTcxLWE0MDctZTZhMTgzNjc3NjMwXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [27, "tt0018839", "The Docks of New York", "1928", "1h 16m", "7.5", "https://m.media-amazon.com/images/M/MV5BZDM5Mjc3ZGMtMTcxYy00ZDBmLWJhZGEtOWQwNGVmZDJmNzQ2XkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [28, "tt0038494", "Dressed to Kill", "1946", "1h 11m", "6.8", "https://m.media-amazon.com/images/M/MV5BYmEyOTZhNWQtNjM5Mi00YWEzLWE3ZWMtZWExYWY5MTI3MWU1XkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [29, "tt0016847", "Faust", "1926", "1h 47m", "8.1", "https://m.media-amazon.com/images/M/MV5BMWU5N2FjNGItNWNmMi00MmFkLWE4NzUtNzU1YTNlODRmNDdlXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [30, "tt0045758", "Fear and Desire", "1952", "1h 2m", "5.3", "https://m.media-amazon.com/images/M/MV5BMzU5OGNkMDItMzU4Yi00ZmZjLWI2MmQtZGFkOGMzNGIxMTcwXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [31, "tt0016884", "Flesh and the Devil", "1926", "1h 12m", "7.6", "https://m.media-amazon.com/images/M/MV5BMzcyYmM5MTgtZDgzOS00NzUwLTg5NGUtZDg2NzEwM2NhMmZiXkEyXkFqcGc@._V1_QL75_UX90_CR0,3,90,133_.jpg"],
  [32, "tt0006689", "The Floorwalker", "1916", "22m", "6.6", "https://m.media-amazon.com/images/M/MV5BZTVlZDc1YjYtMjhhMC00ZWE4LThiNWMtOTM5N2QwMzhhMGFiXkEyXkFqcGc@._V1_QL75_UY133_CR0,0,90,133_.jpg"],
  [33, "tt0015841", "The Freshman", "1925", "1h 17m", "7.5", "https://m.media-amazon.com/images/M/MV5BMGI5NWY1YTgtMGYzNS00NGE0LThiM2UtZmU5NGI2NjBmMDRiXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [34, "tt0017925", "The General", "1926", "1h 18m", "8.1", "https://m.media-amazon.com/images/M/MV5BMTVhM2Y1MDUtMDkxYi00Y2UxLWI2MTMtZjMzYTY4ODM4MGIzXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [35, "tt0045826", "Glen or Glenda", "1953", "1h 5m", "4.3", "https://m.media-amazon.com/images/M/MV5BMjExMTg3ODEzMl5BMl5BanBnXkFtZTgwMjMyNTc2MDE@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [36, "tt0015864", "The Gold Rush", "1925", "1h 35m", "8.1", "https://m.media-amazon.com/images/M/MV5BOTE1MWFkOWQtOWM1NC00ZjA4LTk5NmUtZTFjZDFjMzEwYTQzXkEyXkFqcGc@._V1_QL75_UY133_CR4,0,90,133_.jpg"],
  [37, "tt0011237", "The Golem", "1920", "1h 16m", "7.2", "https://m.media-amazon.com/images/M/MV5BMTYwODUxNDc3N15BMl5BanBnXkFtZTgwODY4MjIyMjE@._V1_QL75_UY133_CR10,0,90,133_.jpg"],
  [38, "tt0015881", "Greed", "1924", "2h 20m", "8.0", "https://m.media-amazon.com/images/M/MV5BZDIzZGJhMWEtNzc2OS00NWI1LTk1NmUtNTM3MmMxZjIxNDYzXkEyXkFqcGc@._V1_QL75_UY133_CR5,0,90,133_.jpg"],
  [39, "tt0031397", "Gulliver's Travels", "1939", "1h 16m", "6.6", "https://m.media-amazon.com/images/M/MV5BMzQxZjI3MTQtNWFjYy00MzY4LWJjYTctZDg4MmEwNGVjZmM2XkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [40, "tt0013257", "Häxan: Witchcraft Through the Ages", "1922", "1h 31m", "7.6", "https://m.media-amazon.com/images/M/MV5BMjEwMzgzMTEtYzI3ZS00M2M4LWJjZGYtY2UxZjgzNzNjNjc0XkEyXkFqcGc@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [41, "tt0032599", "His Girl Friday", "1940", "1h 32m", "7.8", "https://m.media-amazon.com/images/M/MV5BMzRhMTQ1ZjEtYzM2MC00OThiLTk3NTEtNGRhNzcwNGM2YWQ4XkEyXkFqcGc@._V1_QL75_UX90_CR0,3,90,133_.jpg"],
  [42, "tt0045877", "The Hitch-Hiker", "1953", "1h 11m", "6.9", "https://m.media-amazon.com/images/M/MV5BMDYwNzllZTAtYzUxMS00NTk0LWFkMjMtOTJkYjYzZjQ5NDZmXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [43, "tt0051744", "House on Haunted Hill", "1959", "1h 15m", "6.7", "https://m.media-amazon.com/images/M/MV5BOGMwMDk2YjYtYTc5YS00MDAxLThlNDEtNmM0YTgyMDMzZTRlXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [44, "tt0008133", "The Immigrant", "1917", "30m", "7.5", "https://m.media-amazon.com/images/M/MV5BYTIwMGVmNTAtOGMxMC00ZTYzLWI1ZTQtZGIzZDhiM2MxZDdkXkEyXkFqcGc@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [45, "tt0006864", "Intolerance: Love's Struggle Throughout the Ages", "1916", "2h 43m", "7.6", "https://m.media-amazon.com/images/M/MV5BNmVhY2U4Y2QtYTg1ZC00OWZkLWI0OTgtZTkwZmY5Y2ZlMjUxXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [46, "tt0038650", "It's a Wonderful Life", "1946", "2h 10m", "8.6", "https://m.media-amazon.com/images/M/MV5BMDM4OWFhYjEtNTE5Yy00NjcyLTg5N2UtZDQwNDZlYjlmNDU5XkEyXkFqcGc@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [47, "tt0018037", "The Jazz Singer", "1927", "1h 28m", "6.4", "https://m.media-amazon.com/images/M/MV5BNTMxODVjM2MtYjFlYS00Y2Y1LTg1NTEtNjcwZTBhNTE3MTJmXkEyXkFqcGc@._V1_QL75_UY133_CR4,0,90,133_.jpg"],
  [48, "tt0034928", "The Jungle Book", "1942", "1h 48m", "6.7", "https://m.media-amazon.com/images/M/MV5BYjRjZjcxOGUtODcxYS00ZmE3LTkzYjgtYTBiMTVmNWYyY2RmXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [49, "tt0044789", "Kansas City Confidential", "1952", "1h 39m", "7.3", "https://m.media-amazon.com/images/M/MV5BMzBiMjE3MmMtOTQwOC00NGI0LWJhNmMtMWI4ZTc3MjBlZDgxXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [50, "tt0018051", "The Kid Brother", "1927", "1h 22m", "7.6", "https://m.media-amazon.com/images/M/MV5BOGIxMzdkOGYtYzY1Yy00ZGM1LWE4OTctM2MxMjMwNmYwNWQ0XkEyXkFqcGc@._V1_QL75_UY133_CR5,0,90,133_.jpg"],
  [51, "tt0030341", "The Lady Vanishes", "1938", "1h 36m", "7.7", "https://m.media-amazon.com/images/M/MV5BMzQxY2M5ODUtYjQ5ZS00M2NmLWI2OTMtYzY3ZWJmZjcyNDIwXkEyXkFqcGc@._V1_QL75_UY133_CR0,0,90,133_.jpg"],
  [52, "tt0048287", "The Last Command", "1955", "1h 45m", "6.3", "https://m.media-amazon.com/images/M/MV5BNzFlNWU0MmQtMWZiZS00ZGUyLWE2MDAtNjJkMjY0NzQ5ZTYxXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [53, "tt0015064", "The Last Laugh", "1924", "1h 28m", "8.0", "https://m.media-amazon.com/images/M/MV5BNjU5ODQ5YjMtMWRmMC00MmI0LTgyNjUtY2FhMDcwZTBmOGI0XkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [54, "tt0058700", "The Last Man on Earth", "1964", "1h 26m", "6.7", "https://m.media-amazon.com/images/M/MV5BNmYzYWQxNmQtMDg0ZS00MTQyLTk3YmEtNzA2NTQwMTJkYmZlXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [55, "tt0054033", "The Little Shop of Horrors", "1960", "1h 13m", "6.2", "https://m.media-amazon.com/images/M/MV5BYzhkNzgwNGMtNWQyYS00MTVhLThmMjQtZmQ4YWVmNWE4NmQwXkEyXkFqcGc@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [56, "tt0017075", "The Lodger", "1927", "1h 32m", "7.3", "https://m.media-amazon.com/images/M/MV5BMjE4OTg0ODgyNF5BMl5BanBnXkFtZTgwMDY3NTMzMjE@._V1_QL75_UY133_CR4,0,90,133_.jpg"],
  [57, "tt0016039", "The Lost World", "1925", "1h 50m", "7.0", "https://m.media-amazon.com/images/M/MV5BZjgzZWZhMDYtMDA2YS00MDQ5LWFiNTEtNjRkOTc1MDY5Mzg3XkEyXkFqcGc@._V1_QL75_UY133_CR8,0,90,133_.jpg"],
  [58, "tt0019130", "The Man Who Laughs", "1928", "1h 50m", "7.6", "https://m.media-amazon.com/images/M/MV5BNTIyOTY1MTkwMl5BMl5BanBnXkFtZTgwNzc5NzMwMjE@._V1_QL75_UX90_CR0,5,90,133_.jpg"],
  [59, "tt0057298", "McLintock!", "1963", "2h 6m", "7.1", "https://m.media-amazon.com/images/M/MV5BNGQwOTdlOWUtZWIxNC00NWI0LTk4MWEtNzgyOWE0M2VmZjAwXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [60, "tt0033891", "Meet John Doe", "1941", "2h 15m", "7.6", "https://m.media-amazon.com/images/M/MV5BNDYxM2Q0MmMtZTY4MS00YmMzLTljMzItYWQ5OWRiY2ZmN2IzXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [61, "tt0017136", "Metropolis", "1927", "2h 33m", "8.2", "https://m.media-amazon.com/images/M/MV5BMjhjMGYyMjAtMzJkYy00NzhlLWIwY2MtMWQ2ODIxZDUyOGYyXkEyXkFqcGc@._V1_QL75_UY133_CR0,0,90,133_.jpg"],
  [62, "tt0023238", "The Most Dangerous Game", "1932", "1h 3m", "7.0", "https://m.media-amazon.com/images/M/MV5BMmYzZjZlMmItNjMyYS00ZDNlLWE5ZjQtOTdmMzM4ZDY5YzIxXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [63, "tt0039645", "My Favorite Brunette", "1947", "1h 27m", "6.7", "https://m.media-amazon.com/images/M/MV5BNDk1ZjY1M2UtM2Y5NC00OGFkLWE1NGQtZDE3ZTNjYzE3MTM2XkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [64, "tt0028010", "My Man Godfrey", "1936", "1h 34m", "7.9", "https://m.media-amazon.com/images/M/MV5BOTg3ZTE1M2UtODE3MS00NWU3LTgyMWEtMzI1M2RmM2NmMDI0XkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [65, "tt0013427", "Nanook of the North", "1922", "1h 18m", "7.6", "https://m.media-amazon.com/images/M/MV5BMTg4Njk3MjU5Ml5BMl5BanBnXkFtZTgwOTIyODg5MTE@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [66, "tt0018192", "Napoleon", "1927", "5h 30m", "8.2", "https://m.media-amazon.com/images/M/MV5BNTM4YWFmOWMtZGRhMy00NWU4LTg5MzQtMzdlMjA0OTRiMTkyXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [67, "tt0015163", "The Navigator", "1924", "59m", "7.5", "https://m.media-amazon.com/images/M/MV5BM2E4Y2E2MzItMzMyOS00OWM1LWIxMDAtZTk5N2UxOGY3OWIzXkEyXkFqcGc@._V1_QL75_UX90_CR0,5,90,133_.jpg"],
  [68, "tt0015174", "Die Nibelungen: Kriemhild's Revenge", "1924", "2h 9m", "7.9", "https://m.media-amazon.com/images/M/MV5BYjQ4YjIwZDQtM2NkNS00MTFjLTkzYTEtMTAyZGVhMzk2ZTQ4XkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [69, "tt0015175", "Die Nibelungen: Siegfried", "1924", "2h 38m", "8.1", "https://m.media-amazon.com/images/M/MV5BMTYzNTU2NjU2Ml5BMl5BanBnXkFtZTgwMTE2MTA5MTE@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [70, "tt0063350", "Night of the Living Dead", "1968", "1h 36m", "7.8", "https://m.media-amazon.com/images/M/MV5BZGMyZTA0MWEtZjczMS00ZDE5LTk1OTQtNmIxNGYzNDA2NDVhXkEyXkFqcGc@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [71, "tt0013442", "Nosferatu", "1922", "1h 34m", "7.8", "https://m.media-amazon.com/images/M/MV5BNmU0YjQ5OTUtZGJiYS00MWY0LTkxYjYtODEyZGJmYjhkNWIxXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [72, "tt0055257", "One-Eyed Jacks", "1961", "2h 21m", "7.1", "https://m.media-amazon.com/images/M/MV5BYzg3MWFmY2MtYmE5NC00MTA5LWI4YzUtMjVhNjJmY2U1MzkwXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [73, "tt0011541", "One Week", "1920", "25m", "8.1", "https://m.media-amazon.com/images/M/MV5BYjdlNTkxZmYtYWY1NC00YjFiLWEyMjAtNjZlOWNhNGQ2NGRhXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [74, "tt0014341", "Our Hospitality", "1923", "1h 10m", "7.7", "https://m.media-amazon.com/images/M/MV5BNDY2MjRmZWQtZTRmYS00YjA2LTg0ZTgtYzBjODJiNTFkMTc4XkEyXkFqcGc@._V1_QL75_UY133_CR5,0,90,133_.jpg"],
  [75, "tt0017048", "A Page of Madness", "1926", "1h 10m", "7.3", "https://m.media-amazon.com/images/M/MV5BZDViZTZmOTAtNmI2OS00MDY3LWEwNTEtZDVmYWQwZDZlMDU1XkEyXkFqcGc@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [76, "tt0019254", "The Passion of Joan of Arc", "1928", "1h 50m", "8.1", "https://m.media-amazon.com/images/M/MV5BNTE1MDliZjgtYTU2Yy00YjAxLTljYTItNDE2ZGYwYTY1MGQ1XkEyXkFqcGc@._V1_QL75_UX90_CR0,4,90,133_.jpg"],
  [77, "tt0007162", "The Pawnshop", "1916", "25m", "7.0", "https://m.media-amazon.com/images/M/MV5BOTRlM2U0ZWMtNmM4NC00OTQxLTliNmYtMDMyNTc2ZTVjM2NlXkEyXkFqcGc@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [78, "tt0012364", "The Phantom Carriage", "1921", "1h 47m", "8.0", "https://m.media-amazon.com/images/M/MV5BNGVmY2EyZTktYzUwMy00YTU1LWJhZDYtNjIwYTFhMTZhOTVhXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [79, "tt0016220", "The Phantom of the Opera", "1925", "1h 41m", "7.5", "https://m.media-amazon.com/images/M/MV5BMGE4MDQ0ZjEtMWIwNi00YWVlLTk3NTQtMzViMGRlYjA4NzdlXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [80, "tt0052077", "Plan 9 from Outer Space", "1958", "1h 19m", "3.9", "https://m.media-amazon.com/images/M/MV5BZGM4Y2MwMzktODg3MS00ZjVkLTk2NGMtY2Y0M2Y2MWQ0ZDBiXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [81, "tt0039757", "The Red House", "1947", "1h 40m", "6.7", "https://m.media-amazon.com/images/M/MV5BNTllYTE3N2UtMmRmMS00YTM4LWIzYzctYjZkMDQwOTIyMGExXkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [82, "tt0007264", "The Rink", "1916", "30m", "7.0", "https://m.media-amazon.com/images/M/MV5BZGNhZGU1ZmItYmNmMi00NTA4LWExZDQtOWQ5NjEyMWI4NDUxXkEyXkFqcGc@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [83, "tt0014417", "The Wheel", "1923", "6h 57m", "7.5", "https://m.media-amazon.com/images/M/MV5BMjAzODE4NTg5MF5BMl5BanBnXkFtZTcwODIzMzg2MQ@@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [84, "tt0058536", "Rudolph the Red-Nosed Reindeer", "1964", "47m", "8.0", "https://m.media-amazon.com/images/M/MV5BZGZmNDZjYjktMDA5OC00NDljLWEyNWQtOWViOTFkZjAyMTVjXkEyXkFqcGc@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [85, "tt0028212", "Sabotage", "1936", "1h 16m", "7.0", "https://m.media-amazon.com/images/M/MV5BNTFmNDQ4MWYtN2Q5YS00ZWQyLThkMTItYzQyNDcyM2E4ZDdmXkEyXkFqcGc@._V1_QL75_UY133_CR3,0,90,133_.jpg"],
  [86, "tt0014429", "Safety Last!", "1923", "1h 14m", "8.1", "https://m.media-amazon.com/images/M/MV5BMjkyOTg2MzE1MV5BMl5BanBnXkFtZTgwMDUzODYwMjE@._V1_QL75_UX90_CR0,16,90,133_.jpg"],
  [87, "tt0047443", "Salt of the Earth", "1954", "1h 34m", "7.3", "https://m.media-amazon.com/images/M/MV5BOGE3MjY0MGQtNGU1MC00YmFjLTk1ZTQtMzkzMmM3MjMxOTFmXkEyXkFqcGc@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [88, "tt0038057", "Scarlet Street", "1945", "1h 42m", "7.7", "https://m.media-amazon.com/images/M/MV5BODg1Y2Y2YjQtM2NjNS00NWIwLWE0ZTUtMzM2M2M1YWJjYTdlXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [89, "tt0016332", "Seven Chances", "1925", "56m", "7.8", "https://m.media-amazon.com/images/M/MV5BNjA4YzJiZmItNTVmOC00YjI1LWFiOGEtNmM1MmU2MTQ3OTE1XkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [90, "tt0015324", "Sherlock Jr.", "1924", "45m", "8.1", "https://m.media-amazon.com/images/M/MV5BMjQzM2E2NjYtYmRjMC00ZmVlLTljZTgtNmQ5MGZlNDYyZTc5XkEyXkFqcGc@._V1_QL75_UX90_CR0,4,90,133_.jpg"],
  [91, "tt0019412", "Speedy", "1928", "1h 25m", "7.6", "https://m.media-amazon.com/images/M/MV5BMTg0ODM0NzEwN15BMl5BanBnXkFtZTgwMzgzODYwMjE@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [92, "tt0019415", "Spies (Spione)", "1928", "2h 30m", "7.5", "https://m.media-amazon.com/images/M/MV5BNzdhMmZhNmYtYjAxYi00MzBiLTgzODctMzQxMDUxMDhkNTFmXkEyXkFqcGc@._V1_QL75_UY133_CR6,0,90,133_.jpg"],
  [93, "tt0189219", "Spring in a Small Town", "1948", "1h 38m", "7.3", "https://m.media-amazon.com/images/M/MV5BOGVlZDc0NjUtYmE0MC00ZjRkLWE0MTctMGFjNjQ3ZGViNzg2XkEyXkFqcGc@._V1_QL75_UY133_CR3,0,90,133_.jpg"],
  [94, "tt0029606", "A Star Is Born", "1937", "1h 51m", "7.3", "https://m.media-amazon.com/images/M/MV5BMjFmNGE5NzItZTI1Mi00MzFkLTg1YTctNGUxZjlmMGZiNDMwXkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [95, "tt0019421", "Steamboat Bill, Jr.", "1928", "1h 10m", "7.8", "https://m.media-amazon.com/images/M/MV5BOTg2MjUyMjYyOV5BMl5BanBnXkFtZTgwNjM0NDAwMjE@._V1_QL75_UY133_CR0,0,90,133_.jpg"],
  [96, "tt0019422", "Steamboat Willie", "1928", "8m", "7.4", "https://m.media-amazon.com/images/M/MV5BODhlNGQyZTAtNGE0ZS00OWVhLTkzODQtOTBiMmQ2ODZjNzI2XkEyXkFqcGc@._V1_QL75_UX90_CR0,1,90,133_.jpg"],
  [97, "tt0038991", "The Stranger", "1946", "1h 35m", "7.3", "https://m.media-amazon.com/images/M/MV5BOGViZjhjNWQtZjY2MS00OTExLThlNDUtYTIwZTgwODdhMDdhXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [98, "tt0015361", "Stachka", "1925", "1h 35m", "7.6", "https://m.media-amazon.com/images/M/MV5BMDA0MmE2M2UtNmIyZS00NjEyLTg4NDItZWMyMDU1MjA2MmJkXkEyXkFqcGc@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [99, "tt0047542", "Suddenly", "1954", "1h 17m", "6.8", "https://m.media-amazon.com/images/M/MV5BNjU1MjVkMGEtMTAxNC00YmFjLThlYzQtNzY5NDhjMzNmN2FkXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [100, "tt0018455", "Sunrise: A Song of Two Humans", "1927", "1h 34m", "8.1", "https://m.media-amazon.com/images/M/MV5BYTk4N2UyZjAtZGMxNy00MjE4LWEyNzUtYWQzNjFjNzQxOTI0XkEyXkFqcGc@._V1_QL75_UX90_CR0,3,90,133_.jpg"],
  [101, "tt0033152", "The Thief of Bagdad", "1940", "1h 46m", "7.4", "https://m.media-amazon.com/images/M/MV5BYjcyOTFmOGItMzNkNC00MjFhLTk1NzEtOThkMGEzNTRmYzJkXkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [102, "tt0028358", "Things to Come", "1936", "1h 57m", "6.6", "https://m.media-amazon.com/images/M/MV5BYzEwYzgwNGUtOTAyNC00OTFhLWJlOWYtNDQzMmUxOTJmODNlXkEyXkFqcGc@._V1_QL75_UY133_CR6,0,90,133_.jpg"],
  [103, "tt0000417", "A Trip to the Moon", "1902", "13m", "8.1", "https://m.media-amazon.com/images/M/MV5BYzNlMDkxM2UtN2MzNS00NGFkLWFhMzAtMWUxOTZjOGQ2MTI5XkEyXkFqcGc@._V1_QL75_UY133_CR5,0,90,133_.jpg"],
  [104, "tt0018526", "Underworld", "1927", "1h 20m", "7.5", "https://m.media-amazon.com/images/M/MV5BYjU2MTcwMTMtYzE3Yy00YzcxLTg5MjctZjI3OWFmYjA4MTA3XkEyXkFqcGc@._V1_QL75_UX90_CR0,2,90,133_.jpg"],
  [105, "tt0018528", "The Unknown", "1927", "1h 8m", "7.7", "https://m.media-amazon.com/images/M/MV5BYmRiOWVlMGQtNGI4NS00ZjdmLTg3YWQtMzMzZWM4NzY1NjBmXkEyXkFqcGc@._V1_QL75_UX90_CR0,0,90,133_.jpg"],
  [106, "tt0007507", "The Vagabond", "1916", "21m", "6.8", "https://m.media-amazon.com/images/M/MV5BNWYwODc0N2YtNjIzOC00ZDFhLTg0ZWMtNjVkYzY0NDRlM2NhXkEyXkFqcGc@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [107, "tt0006206", "Les Vampires", "1915", "7h 1m", "7.3", "https://m.media-amazon.com/images/M/MV5BMTc1NTY3NDIzNl5BMl5BanBnXkFtZTgwNTIyODg5MTE@._V1_QL75_UY133_CR3,0,90,133_.jpg"],
  [108, "tt0011841", "Way Down East", "1920", "2h 25m", "7.3", "https://m.media-amazon.com/images/M/MV5BMjI5OTI3NTQ4NV5BMl5BanBnXkFtZTgwNDY3NTAwMjE@._V1_QL75_UY133_CR1,0,90,133_.jpg"],
  [109, "tt0023694", "White Zombie", "1932", "1h 9m", "6.2", "https://m.media-amazon.com/images/M/MV5BYzUwZThhZWMtNDAxMy00NDlhLWFhZTctOTljNzAwMThlNGY5XkEyXkFqcGc@._V1_QL75_UY133_CR2,0,90,133_.jpg"],
  [110, "tt0018578", "Wings", "1927", "2h 24m", "7.5", "https://m.media-amazon.com/images/M/MV5BMGM5NTRlNDUtYzc3Zi00Yzg1LTgyNjMtMDQ3MzAwOTk3NTQ2XkEyXkFqcGc@._V1_QL75_UX90_CR0,3,90,133_.jpg"]
];

const movieNightMovies = movieNightRows.map(([position, id, title, year, runtime, rating, poster]) => ({
  position,
  id,
  title,
  year,
  runtime,
  rating,
  poster,
  imdb: `https://www.imdb.com/title/${id}/`
}));

let focusIndex = 0;

function syncPressedState(buttons) {
  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
  });
}

function updateLocalTime() {
  if (!localTime) return;
  localTime.textContent = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/St_Johns",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date());
}

function getTwitchParents() {
  const knownParents = ["zacbatten.me", "www.zacbatten.me", "inefy.github.io", "localhost", "127.0.0.1"];
  const host = window.location.hostname;
  const parents = host ? [host, ...knownParents] : knownParents;
  return [...new Set(parents)].map((parent) => `parent=${encodeURIComponent(parent)}`).join("&");
}

function isLocalHost() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

const allowedMovieLinkOrigins = new Set(["https://www.imdb.com"]);
const allowedPosterOrigins = new Set(["https://m.media-amazon.com"]);

function safeExternalUrl(value, allowedOrigins) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !allowedOrigins.has(url.origin)) {
      return "";
    }
    return url.href;
  } catch {
    return "";
  }
}

function safeTwitchChannel(value) {
  return /^[a-zA-Z0-9_]{1,25}$/.test(value) ? value : "zurra3";
}

function setExternalLink(anchor, href, allowedOrigins) {
  const safeHref = safeExternalUrl(href, allowedOrigins);
  if (safeHref) {
    anchor.href = safeHref;
  } else {
    anchor.removeAttribute("href");
  }
  anchor.rel = "noopener noreferrer";
}

function renderTwitchFallback(container, channel) {
  const fallback = document.createElement("div");
  fallback.className = "embed-fallback";

  const inner = document.createElement("div");
  inner.className = "embed-fallback-inner";

  const title = document.createElement("strong");
  title.textContent = "Twitch embeds need HTTPS here.";

  const detail = document.createElement("p");
  detail.textContent = "Open the stream directly for now. Once GitHub Pages has a valid HTTPS certificate for zacbatten.me and Enforce HTTPS is enabled, this embed can load on the custom domain.";

  const link = document.createElement("a");
  link.className = "button primary";
  link.href = `https://www.twitch.tv/${encodeURIComponent(channel)}`;
  link.rel = "noopener noreferrer";
  link.textContent = "Open on Twitch";

  inner.append(title, detail, link);
  fallback.appendChild(inner);
  container.appendChild(fallback);
}

function mountTwitchEmbeds() {
  const isPlainPublicHttp = window.location.protocol !== "https:" && !isLocalHost();
  const parentQuery = getTwitchParents();

  twitchPlayers.forEach((container) => {
    const channel = safeTwitchChannel(container.dataset.channel || "zurra3");

    if (isPlainPublicHttp) {
      renderTwitchFallback(container, channel);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.title = `${channel} Twitch stream`;
    iframe.src = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&autoplay=false&muted=false&${parentQuery}`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms";
    container.appendChild(iframe);
  });

  twitchChats.forEach((container) => {
    const channel = safeTwitchChannel(container.dataset.channel || "zurra3");

    if (isPlainPublicHttp) {
      renderTwitchFallback(container, channel);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.title = `${channel} Twitch chat`;
    iframe.src = `https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat?darkpopout&${parentQuery}`;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms";
    container.appendChild(iframe);
  });
}

function posterUrl(url) {
  const cropMatch = url.match(/\._V1_QL75_U([XY])(\d+)_CR(\d+),(\d+),(\d+),(\d+)_\.jpg$/);
  if (!cropMatch) return url;

  const [, axis, size, cropX, cropY, cropWidth, cropHeight] = cropMatch;
  const scale = 260 / Number(size);
  const scaledCrop = [cropX, cropY, cropWidth, cropHeight]
    .map((value) => Math.round(Number(value) * scale));

  return url.replace(
    /\._V1_QL75_U[XY]\d+_CR\d+,\d+,\d+,\d+_\.jpg$/,
    `._V1_QL75_U${axis}260_CR${scaledCrop.join(",")}_.jpg`
  );
}

function voteCommand(title) {
  return `!vote ${title}`;
}

function createMovieCard(movie) {
  const article = document.createElement("article");
  article.className = "movie-card";

  const position = document.createElement("span");
  position.className = "movie-position";
  position.textContent = `#${String(movie.position).padStart(2, "0")}`;

  const cardLink = document.createElement("a");
  cardLink.className = "movie-card-link";
  cardLink.setAttribute("aria-label", `${movie.title} on IMDb`);
  setExternalLink(cardLink, movie.imdb, allowedMovieLinkOrigins);

  const poster = document.createElement("div");
  poster.className = "movie-poster";

  const posterImage = document.createElement("img");
  const safePoster = safeExternalUrl(posterUrl(movie.poster), allowedPosterOrigins);
  if (safePoster) {
    posterImage.src = safePoster;
  }
  posterImage.alt = `${movie.title} poster`;
  posterImage.loading = "lazy";
  posterImage.decoding = "async";
  posterImage.width = 260;
  posterImage.height = 390;

  const cardBody = document.createElement("div");
  cardBody.className = "movie-card-body";

  const title = document.createElement("h3");
  title.textContent = movie.title;

  const meta = document.createElement("div");
  meta.className = "movie-meta";
  meta.setAttribute("aria-label", `${movie.title} details`);

  [movie.year, movie.runtime, `IMDb ${movie.rating}`].forEach((value) => {
    const item = document.createElement("span");
    item.textContent = value;
    meta.appendChild(item);
  });

  const source = document.createElement("span");
  source.className = "movie-source";
  source.textContent = "Open IMDb";

  const actions = document.createElement("div");
  actions.className = "movie-card-actions";

  const copyButton = document.createElement("button");
  copyButton.className = "movie-copy";
  copyButton.type = "button";
  copyButton.dataset.vote = voteCommand(movie.title);
  copyButton.setAttribute("aria-label", `Copy vote command for ${movie.title}`);
  copyButton.textContent = "Copy !vote";

  poster.appendChild(posterImage);
  cardBody.append(title, meta, source);
  cardLink.append(poster, cardBody);
  actions.appendChild(copyButton);
  article.append(position, cardLink, actions);

  return article;
}

async function copyTextToClipboard(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const didCopy = document.execCommand("copy");
  textarea.remove();

  if (!didCopy) {
    throw new Error("Copy command failed");
  }
}

function renderMovieList(movies) {
  if (!movieGrid) return;

  if (movieCount) {
    movieCount.textContent = movieNightMovies.length;
  }

  if (movieResults) {
    movieResults.textContent = movies.length === movieNightMovies.length
      ? `Showing all ${movieNightMovies.length} movies`
      : `Showing ${movies.length} of ${movieNightMovies.length} movies`;
  }

  if (movies.length === 0) {
    const empty = document.createElement("p");
    empty.className = "movie-empty";
    empty.textContent = "No movies match that search.";
    movieGrid.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => {
    fragment.appendChild(createMovieCard(movie));
  });
  movieGrid.replaceChildren(fragment);
}

function filterMovieList() {
  if (!movieSearch) return;

  const query = movieSearch.value.trim().toLowerCase();
  const filteredMovies = query
    ? movieNightMovies.filter((movie) => [movie.title, movie.year, movie.runtime, movie.rating]
      .some((value) => value.toLowerCase().includes(query)))
    : movieNightMovies;

  renderMovieList(filteredMovies);
}

updateLocalTime();
window.setInterval(updateLocalTime, 15000);
mountTwitchEmbeds();
renderMovieList(movieNightMovies);
syncPressedState(filterButtons);

if (movieSearch) {
  movieSearch.addEventListener("input", filterMovieList);
}

if (movieClearButton && movieSearch) {
  movieClearButton.addEventListener("click", () => {
    movieSearch.value = "";
    movieSearch.focus();
    renderMovieList(movieNightMovies);
  });
}

document.addEventListener("click", async (event) => {
  const button = event.target instanceof Element
    ? event.target.closest("[data-vote]")
    : null;

  if (!button) return;

  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;
  button.disabled = true;

  try {
    await copyTextToClipboard(button.dataset.vote);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Copy failed";
  }

  window.clearTimeout(Number(button.dataset.resetTimer));
  button.dataset.resetTimer = String(window.setTimeout(() => {
    button.textContent = button.dataset.originalText || "Copy !vote";
    button.disabled = false;
  }, 1800));
});

if (vibeButton) {
  vibeButton.addEventListener("click", () => {
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const [ember, gold, mint, blue, violet] = palette.colors;

    body.style.setProperty("--ember", ember);
    body.style.setProperty("--gold", gold);
    body.style.setProperty("--mint", mint);
    body.style.setProperty("--blue", blue);
    body.style.setProperty("--violet", violet);
    vibeButton.textContent = palette.name;
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    syncPressedState(filterButtons);
    projectCards.forEach((card) => {
      const tags = card.dataset.tags.split(" ");
      card.classList.toggle("hidden", filter !== "all" && !tags.includes(filter));
    });
  });
});

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    body.style.setProperty("--mouse-x", `${event.clientX}px`);
    body.style.setProperty("--mouse-y", `${event.clientY}px`);
  });

  if (focusOutput) {
    window.setInterval(() => {
      focusIndex = (focusIndex + 1) % focusLines.length;
      focusOutput.textContent = focusLines[focusIndex];
    }, 5000);
  }
}
