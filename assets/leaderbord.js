function getProviderIcon(provider) {
  const icons = {
    'Pragmatic': 'images/provider/pragmatic.webp',
    'PG Soft': 'images/provider/pgsoft.webp',
    '5Games': 'images/provider/nolimitcity.webp',
    'Habanero': 'images/provider/habanero.webp',
    'Microgaming': 'images/provider/microgaming.webp',
    'Spadegaming': 'images/provider/spadegaming.webp',
    'JILI': 'images/provider/jili.webp'
  };
  const icon = icons[provider] || 'https://yourcdn.com/icons/default.png';
  return `<img src="${icon}" width="16" style="vertical-align:middle; margin-right:4px;">`;
}

function getBadge(multiplier) {
  if (multiplier >= 50) return '<span class="badge">Epic</span>';
  if (multiplier >= 25) return '<span class="badge">Mega</span>';
  if (multiplier >= 10) return '<span class="badge">x' + multiplier.toFixed(0) + '</span>';
  return '';
}

const baseNames = [
  'anwar', 'budi', 'citra', 'devi', 'eko', 'fajar', 'gilang', 'hani', 'ivan',
  'joko', 'kiki', 'lia', 'miko', 'nina', 'omar', 'putri', 'rian', 'sari',
  'toni', 'ucup', 'vina', 'wawan', 'xena', 'yanto', 'zaki', 'dimas', 'rizky',
  'indah', 'arif', 'nanda', 'maya', 'agus', 'dian', 'ilham', 'febri', 'galih',
  'nurul', 'sinta', 'fitri', 'reza',
  'abian', 'bahar', 'calvin', 'dayat', 'elga', 'farrel', 'gita', 'helmi',
  'intan', 'jihan', 'karim', 'linda', 'mahesa', 'niko', 'opik', 'pasha',
  'qila', 'raka', 'salwa', 'tian', 'umar', 'vicky', 'wina', 'xaver', 'yulia', 'zamir',
  'aurel', 'bram', 'cello', 'delon', 'elvino', 'fino', 'gerry', 'habib',
  'iwan', 'jenni', 'kayla', 'leo', 'melda', 'nathan', 'oki', 'prama', 'quincy',
  'rafa', 'syifa', 'tomi', 'utami', 'verdy', 'wita', 'xio', 'yani', 'zarah'
];

const gamesByProvider = {
  'Pragmatic': [
    'Gates of Olympus Superscate', 'Mahjong Wins 3 - Bonus Buy', 'Waves of Poseidon',
    'Starlight Princess 1000', 'Gates of Olympus 1000', 'Mahjong Wins 2',
    'Gates of Olympus', 'Starlight Princess', 'Gates of Gatotkaca 1000',
    'Sweet Bonanza 1000', 'Wild West Gold Blazing', 'Wisdom of Athena',
    'Sweet Bonanza', 'Sugar Rush 1000', 'Aztec Gems', 'Rujak Bonanza',
    'Mahjong Wins - Gold', 'Triple Pot Gold', 'Gates of Hades', 'Pyramid Bonanza'
  ],
  'PG Soft': [
    'Mahjong Ways', 'Mahjong Ways 2', 'Wild Bounty Showdown', 'Wild Bandito',
    'Lucky Neko', 'Treasures of Aztec', 'Ways of the Qilin', 'Gemstones Gold',
    'Wild Ape #3258', 'Cocktail Nights', 'Pinata Wins', 'Mafia Mayhem',
    'Jurassic Kingdom', 'Anubis Wrath', 'Queen of Bounty', 'Geisha\'s Revenge',
    'Caishen Wins', 'The Great Icescape', 'Dragon Hatch 2', 'Speed Winner'
  ],
  '5Games': [
    'Labuby', 'Wild Bounty', 'Fortune Trio',
    'Neko Titan', 'Pichu Pichu', 'Golden Island', 'Mega Ace',
    'Throne Of Poseidon', 'Gems Miner', 'Opera Panda', 'Treasures Of Egypt',
    'Lucky Tiger', 'God Of Fortune', 'God Of Fortune 2', 'Golden Legend'
  ],
  'Habanero': [
    'Shivering Strings', 'Mystic Shaman', 'Safari Rumble', 'Gladiator Royal',
    'Haunted Harbor', 'Witches Tome', 'Fruity Halloween', 'Vampire\'s Fate',
    'Mighty Medusa', 'Hot Hot Halloween', 'Egyptian Dreams Deluxe',
    'Pumpkin Patch', 'Glory of Rome', 'Koi Koi Treasure', 'Mystic Fortune Deluxe',
    'Waltz Beauty', 'Jump! 2', 'Moo Moo Cow', 'Laughing Buddha', 'Hot Hot Fruit'
  ],
  'Microgaming': [
    'Lucky Twins Wilds', 'Joker Loko\'s Multiplier Trail', '12 Skulls Of The Dead',
    'Candy Rush Wilds', 'Lucky Twins', 'Pong Pong Mahjong', 'Lucky Twins Power Clusters',
    'Queen of Cairo', 'Pong Pong Mahjong 2', 'Almighty Zeus Empire',
    'Almighty Zeus Wilds', 'Gold Blitz', 'Emerald Gold', 'Lucky Little Dragons',
    'Money on Reels', 'Candy Rush Wilds 2', 'Masters of Valhalla', 'Wildfire Wins'
  ],
  'Spadegaming': [
    'Legacy of Kong Maxways', 'Royale House', 'Clash of the Giants',
    'Royale Vegas', 'Royal Katt', 'Mahjong Riches', 'Gold Panther Maxways',
    'Brothers Kingdom', '888', 'Poker Ways', 'Caishen', 'Gold Rush Cowboys',
    'Wild Wet Win', 'Dancing Fever', 'Dragon Wish', 'Fiery Sevens',
    'Farmland Frenzy Maxways', 'Caishen Deluxe Maxways', 'Fruits Mania', 'Golden Lotus SE'
  ],
  'JILI': [
    'Fortune Gems', 'Pirate Queen 2', 'Fortune Gems 2', 'Fortune Gems 3',
    'Chin Shi Huang', 'Golden Empire', 'Fortune Coins', 'SUPER MAHJONG',
    'Super Ace Deluxe', 'Jackpot Joker', 'Super Ace', 'Lucky Jaguar',
    'Circus Joker 4096', 'GOLDEN EMPIRE 2', 'Party Star'
  ]
};

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateBetOptions() {
  const options = [];

  for (let i = 400; i <= 10000; i += 200) {
    options.push(i);
  }

  for (let i = 20000; i <= 100000; i += 5000) {
    options.push(i);
    options.push(i);
  }


  for (let i = 200000; i <= 2000000; i += 100000) {
    options.push(i);
    options.push(i);
    options.push(i);
  }

  return options;
}


const betOptions = generateBetOptions();

function generateUsername() {
  const base = getRandomItem(baseNames);
  const number = Math.floor(Math.random() * 900 + 100);
  const style = Math.random();

  if (style < 0.33) return base + number;
  if (style < 0.66) return base + '_' + number;
  return base + '.' + number;
}

// Generate data pemain
function generatePlayerData(count) {
  const result = [];
  const providerKeys = Object.keys(gamesByProvider);
  const bets = generateBetOptions();

  while (result.length < count) {
    const nama = generateUsername();
    const taruhan = getRandomItem(bets);

    let kelipatan = 0;
    if (taruhan >= 1000000) {
      kelipatan = Math.random() * 25 + 5;
    } else if (taruhan >= 500000) {
      kelipatan = Math.random() * 40 + 10;
    } else if (taruhan >= 100000) {
      kelipatan = Math.random() * 70 + 20;
    } else if (taruhan >= 20000) {
      kelipatan = Math.random() * 120 + 40;
    } else if (taruhan >= 10000) {
      kelipatan = Math.random() * 80 + 20;
    } else {
      kelipatan = Math.random() * 30 + 5;
    }

    let menang = taruhan * kelipatan;
    menang = Math.round(menang / 1000) * 1000;

    if (menang >= 500000) {
      const provider = getRandomItem(providerKeys);
      const game = getRandomItem(gamesByProvider[provider]);
      result.push({ nama, taruhan, menang, provider, game });
    }
  }

  return result;
}



function formatRupiah(val) {
  return 'Rp' + val.toLocaleString('id-ID');
}

const dataGabungan = generatePlayerData(50);
const container = document.getElementById("playerList");

function renderRows() {
  container.innerHTML = '';
  const data = [...dataGabungan, ...dataGabungan];

  data.forEach(p => {
    const kelipatan = p.taruhan > 0 ? (p.menang / p.taruhan).toFixed(1) : '0.0';
    const row = document.createElement("div");
    row.className = "leaderboard-row";
row.innerHTML = `
  <span><span class="player-name">${p.nama}</span></span>
  <span>
    <img src="images/icons/koin.webp" width="18" style="vertical-align:middle; margin-right:4px;">
    ${formatRupiah(p.taruhan)}
  </span>
  <span class="menang">
    <img src="images/icons/bintang.webp" width="18" style="vertical-align:middle; margin-right:4px;">
    ${formatRupiah(p.menang)} ${getBadge(p.menang / p.taruhan)}
  </span>
  <span>${getProviderIcon(p.provider)} ${p.provider}</span>
  <span>${p.game}</span>
`;

    container.appendChild(row);
  });
}

renderRows();