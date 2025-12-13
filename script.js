// ============================================
// SCHOOL-SAFE CONFIGURATION
// Multiple CDN fallbacks for restricted networks
// ============================================

const GITHUB_USER = 'ProjectApex1243';
const GITHUB_REPO = 'Unblockedweb';
const GITHUB_BRANCH = 'master';
const COVER_REPO = 'Covers-for-web';

// CDN Configuration - Priority order for school networks
const CDN_CONFIG = {
    // CDNs to try in order (some schools block specific ones)
    cdns: [
        {
            name: 'jsDelivr',
            baseUrl: (user, repo, branch) => `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}`,
            priority: 1
        },
        {
            name: 'Statically',
            baseUrl: (user, repo, branch) => `https://cdn.statically.io/gh/${user}/${repo}@${branch}`,
            priority: 2
        },
        {
            name: 'GitHack',
            baseUrl: (user, repo, branch) => `https://rawcdn.githack.com/${user}/${repo}/${branch}`,
            priority: 3
        },
        {
            name: 'RawGitHub',
            baseUrl: (user, repo, branch) => `https://raw.githubusercontent.com/${user}/${repo}/${branch}`,
            priority: 4
        }
    ],
    
    // Track which CDN works
    workingCDN: null,
    workingCoverCDN: null,
    
    // Get URL for main content
    getContentURL: function(file) {
        if (this.workingCDN) {
            return `${this.workingCDN.baseUrl(GITHUB_USER, GITHUB_REPO, GITHUB_BRANCH)}/${file}`;
        }
        // Default fallback
        return `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}/${file}`;
    },
    
    // Get URL for covers
    getCoverURL: function(file) {
        if (this.workingCoverCDN) {
            return `${this.workingCoverCDN.baseUrl(GITHUB_USER, COVER_REPO, 'master')}/${file}`;
        }
        // Default fallback
        return `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${COVER_REPO}@master/${file}`;
    },
    
    // Get all possible URLs for a cover (for fallback loading)
    getAllCoverURLs: function(file) {
        return this.cdns.map(cdn => `${cdn.baseUrl(GITHUB_USER, COVER_REPO, 'master')}/${file}`);
    },
    
    // Get all possible URLs for content (for fallback loading)
    getAllContentURLs: function(file) {
        return this.cdns.map(cdn => `${cdn.baseUrl(GITHUB_USER, GITHUB_REPO, GITHUB_BRANCH)}/${file}`);
    }
};

// Legacy support - keep COVER_URL working
const COVER_URL = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${COVER_REPO}@master`;

// ============================================
// CDN DETECTION & FALLBACK SYSTEM
// ============================================

async function testCDNAccess(url, timeout = 5000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (e) {
        return false;
    }
}

async function findWorkingCDN() {
    console.log('🔍 Testing CDN accessibility...');
    
    // Test file that should exist
    const testFile = 'bowmasters.html';
    
    for (const cdn of CDN_CONFIG.cdns) {
        const testUrl = `${cdn.baseUrl(GITHUB_USER, GITHUB_REPO, GITHUB_BRANCH)}/${testFile}`;
        console.log(`  Testing ${cdn.name}: ${testUrl}`);
        
        if (await testCDNAccess(testUrl)) {
            console.log(`  ✓ ${cdn.name} is accessible!`);
            CDN_CONFIG.workingCDN = cdn;
            return cdn;
        } else {
            console.log(`  ✗ ${cdn.name} blocked or unavailable`);
        }
    }
    
    console.warn('⚠️ All CDNs appear blocked. Games may not load.');
    return null;
}

async function findWorkingCoverCDN() {
    console.log('🔍 Testing Cover CDN accessibility...');
    
    const testFile = 'bowmasters.png';
    
    for (const cdn of CDN_CONFIG.cdns) {
        const testUrl = `${cdn.baseUrl(GITHUB_USER, COVER_REPO, 'master')}/${testFile}`;
        
        if (await testCDNAccess(testUrl)) {
            console.log(`  ✓ Cover CDN ${cdn.name} is accessible!`);
            CDN_CONFIG.workingCoverCDN = cdn;
            return cdn;
        }
    }
    
    console.warn('⚠️ All Cover CDNs appear blocked. Using placeholder images.');
    return null;
}

// ============================================
// GAMES DATA WITH DYNAMIC CDN SUPPORT
// ============================================

// Function to get cover URL with fallback support
function getCoverWithFallback(filename) {
    if (CDN_CONFIG.workingCoverCDN) {
        return `${CDN_CONFIG.workingCoverCDN.baseUrl(GITHUB_USER, COVER_REPO, 'master')}/${filename}`;
    }
    return `${COVER_URL}/${filename}`;
}

cconst GAMES_JSON = [
  {
    "id": -1,
    "name": "",
    "cover": ``,
    "url": ""
  },
  {
    "id": 0,
    "name": "Bowmasters",
    "cover": `${COVER_URL}/bowmasters.png`,
    "url": "bowmasters.html",
    "author": "Azur Games, Playgendary"
  },
  {
    "id": 1,
    "name": "OvO",
    "cover": `${COVER_URL}/ovo.png`,
    "url": "ovo.html",
    "author": "Dedra Games"
  },
  {
    "id": 2,
    "name": "OvO 2",
    "cover": `${COVER_URL}/ovo-2.png`,
    "url": "ovo-2.html",
    "author": "Dedra Games"
  },
  {
    "id": 3,
    "name": "OvO 3 Dimensions",
    "cover": `${COVER_URL}/ovo-3-dimensions.png`,
    "url": "ovo-3-dimensions.html",
    "author": "Dedra Games"
  },
  {
    "id": 4,
    "name": "Gladihoppers",
    "cover": `${COVER_URL}/gladihoppers.png`,
    "url": "gladihoppers.html",
    "author": "Dreamon Studios"
  },
  {
    "id": 5,
    "name": "Ice Dodo",
    "cover": `${COVER_URL}/ice-dodo.png`,
    "url": "ice-dodo.html",
    "author": "Onionfist Studio"
  },
  {
    "id": 6,
    "name": "Block Blast",
    "cover": `${COVER_URL}/block-blast.png`,
    "url": "block-blast.html",
    "author": "reunbozdo"
  },
  {
    "id": 7,
    "name": "Jetpack Joyride",
    "cover": `${COVER_URL}/jetpack-joyride.png`,
    "url": "jetpack-joyride.html",
    "author": "Halfbrick Studios"
  },
  {
    "id": 8,
    "name": "Friday Night Funkin",
    "cover": `${COVER_URL}/friday-night-funkin.png`,
    "url": "friday-night-funkin.html",
    "author": "ninja-muffin24"
  },
  {
    "id": 9,
    "name": "Sprunki",
    "cover": `${COVER_URL}/sprunki.png`,
    "url": "sprunki.html",
    "author": "NyankoBfLol"
  },
  {
    "id": 10,
    "name": "Temple Run 2",
    "cover": `${COVER_URL}/temple-run-2.png`,
    "url": "temple-run-2.html",
    "author": "Imangi STUDIOS"
  },
  {
    "id": 11,
    "name": "Stickman Hook",
    "cover": `${COVER_URL}/stickman-hook.png`,
    "url": "stickman-hook.html",
    "author": "Madbox"
  },
  {
    "id": 12,
    "name": "Subway Surfers: San Francisco",
    "cover": `${COVER_URL}/subway-surfers-san-francisco.png`,
    "url": "subway-surfers-san-francisco.html",
    "author": "SYBO"
  },
  {
    "id": 13,
    "name": "Attack Hole",
    "cover": `${COVER_URL}/attack-hole.png`,
    "url": "attack-hole.html",
    "author": "Homa Games"
  },
  {
    "id": 14,
    "name": "Bridge Race",
    "cover": `${COVER_URL}/bridge-race.png`,
    "url": "bridge-race.html",
    "author": "QubicGames"
  },
  {
    "id": 15,
    "name": "Color Water Sort 3D",
    "cover": `${COVER_URL}/color-water-sort-3d.png`,
    "url": "color-water-sort-3d.html",
    "author": "Tapnation"
  },
  {
    "id": 16,
    "name": "Hide N Seek",
    "cover": `${COVER_URL}/hide-n-seek.png`,
    "url": "hide-n-seek.html",
    "author": "Supersonic Studios LTD"
  },
  {
    "id": 17,
    "name": "Magic Tiles 3",
    "cover": `${COVER_URL}/magic-tiles-3.png`,
    "url": "magic-tiles-3.html",
    "author": "AmaNotes"
  },
  {
    "id": 18,
    "name": "Stacky Dash",
    "cover": `${COVER_URL}/stacky-dash.png`,
    "url": "stacky-dash.html",
    "author": "Supersonic Studios LTD"
  },
  {
    "id": 19,
    "name": "Supreme Duelist",
    "cover": `${COVER_URL}/supreme-duelist.png`,
    "url": "supreme-duelist.html",
    "author": "Neron's Brother"
  },
  {
    "id": 20,
    "name": "Tall Man Run",
    "cover": `${COVER_URL}/tall-man-run.png`,
    "url": "tall-man-run.html",
    "author": "Supersonic Studios LTD"
  },
  {
    "id": 21,
    "name": "Turbo Stars",
    "cover": `${COVER_URL}/turbo-stars.png`,
    "url": "turbo-stars.html",
    "author": "https://play.google.com/store/apps/details?id=com.turbo.stars"
  },
  {
    "id": 22,
    "name": "Mob Control HTML5",
    "cover": `${COVER_URL}/mob-control-html5.png`,
    "url": "mob-control-html5.html",
    "author": "Voodoo"
  },
  {
    "id": 23,
    "name": "Pou",
    "cover": `${COVER_URL}/pou.png`,
    "url": "pou.html",
    "author": "Zakeh"
  },
  {
    "id": 24,
    "name": "Crossy Road",
    "cover": `${COVER_URL}/crossy-road.png`,
    "url": "crossy-road.html",
    "author": "Hipster Whale"
  },
  {
    "id": 25,
    "name": "Basket Battle",
    "cover": `${COVER_URL}/basket-battle.png`,
    "url": "basket-battle.html",
    "author": "Supersonic Studios LTD"
  },
  {
    "id": 26,
    "name": "Amaze",
    "cover": `${COVER_URL}/amaze.png`,
    "url": "amaze.html",
    "author": "CrazyLabs"
  },
  {
    "id": 27,
    "name": "Geometry Dash Lite",
    "cover": `${COVER_URL}/geometry-dash-lite.png`,
    "url": "geometry-dash-lite.html",
    "author": "https://play.google.com/store/apps/details?id=com.robtopx.geometryjumplite"
  },
  {
    "id": 28,
    "name": "Basketball Frvr",
    "cover": `${COVER_URL}/basketball-frvr.png`,
    "url": "basketball-frvr.html",
    "author": "FRVR"
  },
  {
    "id": 29,
    "name": "Bazooka Boy",
    "cover": `${COVER_URL}/bazooka-boy.png`,
    "url": "bazooka-boy.html",
    "author": "Supersonic Studios LTD"
  },
  {
    "id": 30,
    "name": "Bottle Jump 3D",
    "cover": `${COVER_URL}/bottle-jump-3d.png`,
    "url": "bottle-jump-3d.html",
    "author": "CASUAL AZUR GAMES"
  },
  {
    "id": 31,
    "name": "Color Match",
    "cover": `${COVER_URL}/color-match.png`,
    "url": "color-match.html"
  },
  {
    "id": 32,
    "name": "Dig Deep",
    "cover": `${COVER_URL}/dig-deep.png`,
    "url": "dig-deep.html"
  },
  {
    "id": 33,
    "name": "Retro Bowl",
    "cover": `${COVER_URL}/retro-bowl.png`,
    "url": "retro-bowl.html"
  },
  {
    "id": 34,
    "name": "Retro Bowl College",
    "cover": `${COVER_URL}/retro-bowl-college.png`,
    "url": "retro-bowl-college.html"
  },
  {
    "id": 35,
    "name": "Drive Mad",
    "cover": `${COVER_URL}/drive-mad.png`,
    "url": "drive-mad.html"
  },
  {
    "id": 36,
    "name": "Monster Tracks",
    "cover": `${COVER_URL}/monster-tracks.png`,
    "url": "monster-tracks.html"
  },
  {
    "id": 37,
    "name": "Gobble",
    "cover": `${COVER_URL}/gobble.png`,
    "url": "gobble.html"
  },
  {
    "id": 38,
    "name": "Five Nights at Freddy's",
    "cover": `${COVER_URL}/five-nights-at-freddys.png`,
    "url": "five-nights-at-freddys.html",
    "special": ["port"]
  },
  {
    "id": 39,
    "name": "Five Nights at Freddy's 2",
    "cover": `${COVER_URL}/five-nights-at-freddys-2.png`,
    "url": "five-nights-at-freddys-2.html",
    "special": ["port"]
  },
  {
    "id": 40,
    "name": "Five Nights at Freddy's 3",
    "cover": `${COVER_URL}/five-nights-at-freddys-3.png`,
    "url": "five-nights-at-freddys-3.html",
    "special": ["port"]
  },
  {
    "id": 41,
    "name": "Five Nights at Freddy's 4",
    "cover": `${COVER_URL}/five-nights-at-freddys-4.png`,
    "url": "five-nights-at-freddys-4.html",
    "special": ["port"]
  },
  {
    "id": 42,
    "name": "Road of Fury",
    "cover": `${COVER_URL}/road-of-fury.png`,
    "url": "road-of-fury.html"
  },
  {
    "id": 43,
    "name": "Driven Wild",
    "cover": `${COVER_URL}/driven-wild.png`,
    "url": "driven-wild.html"
  },
  {
    "id": 44,
    "name": "Ragdoll Hit",
    "cover": `${COVER_URL}/ragdoll-hit.png`,
    "url": "ragdoll-hit.html"
  },
  {
    "id": 45,
    "name": "Vex 1",
    "cover": `${COVER_URL}/vex-1.png`,
    "url": "vex-1.html",
    "special": ["flash"]
  },
  {
    "id": 46,
    "name": "Vex 2",
    "cover": `${COVER_URL}/vex-2.png`,
    "url": "vex-2.html",
    "special": ["flash"]
  },
  {
    "id": 47,
    "name": "Vex 3",
    "cover": `${COVER_URL}/vex-3.png`,
    "url": "vex-3.html",
    "special": ["flash"]
  },
  {
    "id": 48,
    "name": "Vex 3 XMAS",
    "cover": `${COVER_URL}/vex-3-xmas.png`,
    "url": "vex-3-xmas.html"
  },
  {
    "id": 49,
    "name": "Vex 4",
    "cover": `${COVER_URL}/vex-4.png`,
    "url": "vex-4.html"
  },
  {
    "id": 50,
    "name": "Vex 5",
    "cover": `${COVER_URL}/vex-5.png`,
    "url": "vex-5.html"
  },
  {
    "id": 51,
    "name": "Vex 6",
    "cover": `${COVER_URL}/vex-6.png`,
    "url": "vex-6.html"
  },
  {
    "id": 52,
    "name": "Vex 7",
    "cover": `${COVER_URL}/vex-7.png`,
    "url": "vex-7.html"
  },
  {
    "id": 53,
    "name": "Vex 8",
    "cover": `${COVER_URL}/vex-8.png`,
    "url": "vex-8.html"
  },
  {
    "id": 54,
    "name": "Vex Challenges",
    "cover": `${COVER_URL}/vex-challenges.png`,
    "url": "vex-challenges.html"
  },
  {
    "id": 55,
    "name": "Vex X3M",
    "cover": `${COVER_URL}/vex-x3m.png`,
    "url": "vex-x3m.html"
  },
  {
    "id": 56,
    "name": "Vex X3M 2",
    "cover": `${COVER_URL}/vex-x3m-2.png`,
    "url": "vex-x3m-2.html"
  },
  {
    "id": 57,
    "name": "Monkey Mart",
    "cover": `${COVER_URL}/monkey-mart.png`,
    "url": "monkey-mart.html"
  },
  {
    "id": 58,
    "name": "1v1.LoL",
    "cover": `${COVER_URL}/1v1lol.png`,
    "url": "1v1lol.html"
  },
  {
    "id": 59,
    "name": "A Dance of Fire and Ice",
    "cover": `${COVER_URL}/a-dance-of-fire-and-ice.png`,
    "url": "a-dance-of-fire-and-ice.html"
  },
  {
    "id": 60,
    "name": "Achievement Unlocked",
    "cover": `${COVER_URL}/achievement-unlocked.png`,
    "url": "achievement-unlocked.html",
    "special": ["flash"]
  },
  {
    "id": 61,
    "name": "Achievement Unlocked 2",
    "cover": `${COVER_URL}/achievement-unlocked-2.png`,
    "url": "achievement-unlocked-2.html",
    "special": ["flash"]
  },
  {
    "id": 62,
    "name": "Achievement Unlocked 3",
    "cover": `${COVER_URL}/achievement-unlocked-3.png`,
    "url": "achievement-unlocked-3.html",
    "special": ["flash"]
  },
  {
    "id": 63,
    "name": "Angry Birds",
    "cover": `${COVER_URL}/angry-birds.png`,
    "url": "angry-birds.html"
  },
  {
    "id": 64,
    "name": "Backrooms",
    "cover": `${COVER_URL}/backrooms.png`,
    "url": "backrooms.html"
  },
  {
    "id": 65,
    "name": "Baldi's Basics",
    "cover": `${COVER_URL}/baldis-basics.png`,
    "url": "baldis-basics.html"
  },
  {
    "id": 66,
    "name": "Basket Random",
    "cover": `${COVER_URL}/basket-random.png`,
    "url": "basket-random.html"
  },
  {
    "id": 67,
    "name": "Big Tower Tiny Square",
    "cover": `${COVER_URL}/big-tower-tiny-square.png`,
    "url": "big-tower-tiny-square.html"
  },
  {
    "id": 68,
    "name": "Big NEON Tower Tiny Square",
    "cover": `${COVER_URL}/big-neon-tower-tiny-square.png`,
    "url": "big-neon-tower-tiny-square.html"
  },
  {
    "id": 69,
    "name": "Big ICE Tower Tiny Square",
    "cover": `${COVER_URL}/big-ice-tower-tiny-square.png`,
    "url": "big-ice-tower-tiny-square.html"
  },
  {
    "id": 70,
    "name": "BitLife",
    "cover": `${COVER_URL}/bitlife.png`,
    "url": "bitlife.html"
  },
  {
    "id": 71,
    "name": "Bloons TD",
    "cover": `${COVER_URL}/bloons-td.png`,
    "url": "bloons-td.html",
    "special": ["flash"]
  },
  {
    "id": 72,
    "name": "Bloons TD 2",
    "cover": `${COVER_URL}/bloons-td-2.png`,
    "url": "bloons-td-2.html",
    "special": ["flash"]
  },
  {
    "id": 73,
    "name": "Bloons TD 3",
    "cover": `${COVER_URL}/bloons-td-3.png`,
    "url": "bloons-td-3.html",
    "special": ["flash"]
  },
  {
    "id": 74,
    "name": "Bloons TD 4",
    "cover": `${COVER_URL}/bloons-td-4.png`,
    "url": "bloons-td-4.html",
    "special": ["flash"]
  },
  {
    "id": 75,
    "name": "Bloons TD 5",
    "cover": `${COVER_URL}/bloons-td-5.png`,
    "url": "bloons-td-5.html",
    "special": ["flash"]
  },
  {
    "id": 76,
    "name": "Bob The Robber 2",
    "cover": `${COVER_URL}/bob-the-robber-2.png`,
    "url": "bob-the-robber-2.html"
  },
  {
    "id": 77,
    "name": "Boxing Random",
    "cover": `${COVER_URL}/boxing-random.png`,
    "url": "boxing-random.html"
  },
  {
    "id": 78,
    "name": "Burrito Bison",
    "cover": `${COVER_URL}/burrito-bison.png`,
    "url": "burrito-bison.html",
    "special": ["flash"]
  },
  {
    "id": 79,
    "name": "Cannon Basketball",
    "cover": `${COVER_URL}/cannon-basketball.png`,
    "url": "cannon-basketball.html",
    "special": ["flash"]
  },
  {
    "id": 80,
    "name": "Cannon Basketball 2",
    "cover": `${COVER_URL}/cannon-basketball-2.png`,
    "url": "cannon-basketball-2.html",
    "special": ["flash"]
  },
  {
    "id": 81,
    "name": "Cluster Rush",
    "cover": `${COVER_URL}/cluster-rush.png`,
    "url": "cluster-rush.html"
  },
  {
    "id": 82,
    "name": "Cookie Clicker",
    "cover": `${COVER_URL}/cookie-clicker.png`,
    "url": "cookie-clicker.html"
  },
  {
    "id": 83,
    "name": "Coreball",
    "cover": `${COVER_URL}/coreball.png`,
    "url": "coreball.html"
  },
  {
    "id": 84,
    "name": "Cubefield",
    "cover": `${COVER_URL}/cubefield.png`,
    "url": "cubefield.html",
    "special": ["flash"]
  },
  {
    "id": 85,
    "name": "Cut the Rope",
    "cover": `${COVER_URL}/cut-the-rope.png`,
    "url": "cut-the-rope.html"
  },
  {
    "id": 86,
    "name": "Draw Climber",
    "cover": `${COVER_URL}/draw-climber.png`,
    "url": "draw-climber.html"
  },
  {
    "id": 87,
    "name": "Emulator.JS",
    "cover": `${COVER_URL}/emulatorjs.png`,
    "url": "emulatorjs.html",
    "special": ["emulator"]
  },
  {
    "id": 88,
    "name": "Fireboy and Watergirl 2",
    "cover": `${COVER_URL}/fireboy-and-watergirl-2.png`,
    "url": "fireboy-and-watergirl-2.html",
    "special": ["flash"]
  },
  {
    "id": 89,
    "name": "Fireboy and Watergirl 3",
    "cover": `${COVER_URL}/fireboy-and-watergirl-3.png`,
    "url": "fireboy-and-watergirl-3.html",
    "special": ["flash"]
  },
  {
    "id": 90,
    "name": "Granny",
    "cover": `${COVER_URL}/granny.png`,
    "url": "granny.html"
  },
  {
    "id": 91,
    "name": "Gunspin",
    "cover": `${COVER_URL}/gunspin.png`,
    "url": "gunspin.html",
    "special": ["flash"]
  },
  {
    "id": 92,
    "name": "Highway Racer 2",
    "cover": `${COVER_URL}/highway-racer-2.png`,
    "url": "highway-racer-2.html"
  },
  {
    "id": 93,
    "name": "Johnny Trigger",
    "cover": `${COVER_URL}/johnny-trigger.png`,
    "url": "johnny-trigger.html"
  },
  {
    "id": 94,
    "name": "Journey Downhill",
    "cover": `${COVER_URL}/journey-downhill.png`,
    "url": "journey-downhill.html"
  },
  {
    "id": 95,
    "name": "Line Rider",
    "cover": `${COVER_URL}/line-rider.png`,
    "url": "line-rider.html",
    "special": ["flash"]
  },
  {
    "id": 96,
    "name": "Moto X3M",
    "cover": `${COVER_URL}/moto-x3m.png`,
    "url": "moto-x3m.html"
  },
  {
    "id": 97,
    "name": "Moto X3M 2",
    "cover": `${COVER_URL}/moto-x3m-2.png`,
    "url": "moto-x3m-2.html"
  },
  {
    "id": 98,
    "name": "Moto X3M 3",
    "cover": `${COVER_URL}/moto-x3m-3.png`,
    "url": "moto-x3m-3.html"
  },
  {
    "id": 99,
    "name": "Moto X3M Spooky",
    "cover": `${COVER_URL}/moto-x3m-spooky.png`,
    "url": "moto-x3m-spooky.html"
  },
  {
    "id": 100,
    "name": "Moto X3M Winter",
    "cover": `${COVER_URL}/moto-x3m-winter.png`,
    "url": "moto-x3m-winter.html"
  },
  {
    "id": 101,
    "name": "Ninja vs EvilCorp",
    "cover": `${COVER_URL}/ninja-vs-evilcorp.png`,
    "url": "ninja-vs-evilcorp.html",
    "author": "Rémi Vansteelandt"
  },
  {
    "id": 102,
    "name": "Paper.io 2",
    "cover": `${COVER_URL}/paperio-2.png`,
    "url": "paperio-2.html"
  },
  {
    "id": 103,
    "name": "The World's Hardest Game",
    "cover": `${COVER_URL}/the-worlds-hardest-game.png`,
    "url": "the-worlds-hardest-game.html",
    "special": ["flash"]
  },
  {
    "id": 104,
    "name": "The World's Hardest Game 3",
    "cover": `${COVER_URL}/the-worlds-hardest-game-3.png`,
    "url": "the-worlds-hardest-game-3.html",
    "special": ["flash"]
  },
  {
    "id": 105,
    "name": "The World's Hardest Game 4",
    "cover": `${COVER_URL}/the-worlds-hardest-game-4.png`,
    "url": "the-worlds-hardest-game-4.html",
    "special": ["flash"]
  },
  {
    "id": 106,
    "name": "This Is The Only Level",
    "cover": `${COVER_URL}/this-is-the-only-level.png`,
    "url": "this-is-the-only-level.html",
    "special": ["flash"]
  },
  {
    "id": 107,
    "name": "This Is The Only Level 2",
    "cover": `${COVER_URL}/this-is-the-only-level-2.png`,
    "url": "this-is-the-only-level-2.html",
    "special": ["flash"]
  },
  {
    "id": 108,
    "name": "Tiny Fishing",
    "cover": `${COVER_URL}/tiny-fishing.png`,
    "url": "tiny-fishing.html"
  },
  {
    "id": 109,
    "name": "Tomb Of The Mask",
    "cover": `${COVER_URL}/tomb-of-the-mask.png`,
    "url": "tomb-of-the-mask.html"
  },
  {
    "id": 110,
    "name": "Toss The Turtle",
    "cover": `${COVER_URL}/toss-the-turtle.png`,
    "url": "toss-the-turtle.html",
    "special": ["flash"]
  },
  {
    "id": 111,
    "name": "Tube Jumpers",
    "cover": `${COVER_URL}/tube-jumpers.png`,
    "url": "tube-jumpers.html"
  },
  {
    "id": 112,
    "name": "Wordle",
    "cover": `${COVER_URL}/wordle.png`,
    "url": "wordle.html"
  },
  {
    "id": 113,
    "name": "Ruffle",
    "cover": `${COVER_URL}/ruffle.png`,
    "url": "ruffle.html",
    "special": ["emulator","flash"]
  },
  {
    "id": 114,
    "name": "2048",
    "cover": `${COVER_URL}/2048.png`,
    "url": "2048.html"
  },
  {
    "id": 115,
    "name": "8 Ball Pool",
    "cover": `${COVER_URL}/8-ball-pool.png`,
    "url": "8-ball-pool.html"
  },
  {
    "id": 116,
    "name": "Offroad Mountain Bike",
    "cover": `${COVER_URL}/offroad-mountain-bike.png`,
    "url": "offroad-mountain-bike.html"
  },
  {
    "id": 117,
    "name": "Space Waves",
    "cover": `${COVER_URL}/space-waves.png`,
    "url": "space-waves.html"
  },
  {
    "id": 118,
    "name": "Solar Smash",
    "cover": `${COVER_URL}/solar-smash.png`,
    "url": "solar-smash.html"
  },
  {
    "id": 119,
    "name": "Snow Rider 3D",
    "cover": `${COVER_URL}/snow-rider-3d.png`,
    "url": "snow-rider-3d.html"
  },
  {
    "id": 120,
    "name": "Fortzone Battle Royale",
    "cover": `${COVER_URL}/fortzone-battle-royale.png`,
    "url": "fortzone-battle-royale.html"
  },
  {
    "id": 121,
    "name": "Brawl Guys.io",
    "cover": `${COVER_URL}/brawl-guysio.png`,
    "url": "brawl-guysio.html"
  },
  {
    "id": 122,
    "name": "Survival Race",
    "cover": `${COVER_URL}/survival-race.png`,
    "url": "survival-race.html"
  },
  {
    "id": 123,
    "name": "Poly Track",
    "cover": `${COVER_URL}/poly-track.png`,
    "url": "poly-track.html"
  },
  {
    "id": 124,
    "name": "Moto X3M Pool Party",
    "cover": `${COVER_URL}/moto-x3m-pool-party.png`,
    "url": "moto-x3m-pool-party.html"
  },
  {
    "id": 125,
    "name": "Granny 2",
    "cover": `${COVER_URL}/granny-2.png`,
    "url": "granny-2.html"
  },
  {
    "id": 126,
    "name": "Granny 3",
    "cover": `${COVER_URL}/granny-3.png`,
    "url": "granny-3.html"
  },
  {
    "id": 127,
    "name": "Fashion Battle",
    "cover": `${COVER_URL}/fashion-battle.png`,
    "url": "fashion-battle.html"
  },
  {
    "id": 128,
    "name": "Slice it All",
    "cover": `${COVER_URL}/slice-it-all.png`,
    "url": "slice-it-all.html"
  },
  {
    "id": 129,
    "name": "Flappy Bird",
    "cover": `${COVER_URL}/flappy-bird.png`,
    "url": "flappy-bird.html"
  },
  {
    "id": 130,
    "name": "osu!",
    "cover": `${COVER_URL}/osu.png`,
    "url": "osu.html"
  },
  {
    "id": 131,
    "name": "Subway Surfers: Barcelona",
    "cover": `${COVER_URL}/subway-surfers-barcelona.png`,
    "url": "subway-surfers-barcelona.html",
    "author": "SYBO"
  },
  {
    "id": 132,
    "name": "Subway Surfers: Beijing",
    "cover": `${COVER_URL}/subway-surfers-beijing.png`,
    "url": "subway-surfers-beijing.html",
    "author": "SYBO"
  },
  {
    "id": 133,
    "name": "Subway Surfers: Berlin",
    "cover": `${COVER_URL}/subway-surfers-berlin.png`,
    "url": "subway-surfers-berlin.html",
    "author": "SYBO"
  },
  {
    "id": 134,
    "name": "Subway Surfers: Buenos Aires",
    "cover": `${COVER_URL}/subway-surfers-buenos-aires.png`,
    "url": "subway-surfers-buenos-aires.html",
    "author": "SYBO"
  },
  {
    "id": 135,
    "name": "Subway Surfers: Havana",
    "cover": `${COVER_URL}/subway-surfers-havana.png`,
    "url": "subway-surfers-havana.html",
    "author": "SYBO"
  },
  {
    "id": 136,
    "name": "Subway Surfers: Houston",
    "cover": `${COVER_URL}/subway-surfers-houston.png`,
    "url": "subway-surfers-houston.html",
    "author": "SYBO"
  },
  {
    "id": 137,
    "name": "Subway Surfers: Iceland",
    "cover": `${COVER_URL}/subway-surfers-iceland.png`,
    "url": "subway-surfers-iceland.html",
    "author": "SYBO"
  },
  {
    "id": 138,
    "name": "Subway Surfers: London",
    "cover": `${COVER_URL}/subway-surfers-london.png`,
    "url": "subway-surfers-london.html",
    "author": "SYBO"
  },
  {
    "id": 139,
    "name": "Subway Surfers: Mexico",
    "cover": `${COVER_URL}/subway-surfers-mexico.png`,
    "url": "subway-surfers-mexico.html",
    "author": "SYBO"
  },
  {
    "id": 140,
    "name": "Subway Surfers: Miami",
    "cover": `${COVER_URL}/subway-surfers-miami.png`,
    "url": "subway-surfers-miami.html",
    "author": "SYBO"
  },
  {
    "id": 141,
    "name": "Subway Surfers: Monaco",
    "cover": `${COVER_URL}/subway-surfers-monaco.png`,
    "url": "subway-surfers-monaco.html",
    "author": "SYBO"
  },
  {
    "id": 142,
    "name": "Subway Surfers: New Orleans",
    "cover": `${COVER_URL}/subway-surfers-new-orleans.png`,
    "url": "subway-surfers-new-orleans.html",
    "author": "SYBO"
  },
  {
    "id": 143,
    "name": "Subway Surfers: St. Petersburg",
    "cover": `${COVER_URL}/subway-surfers-st-petersburg.png`,
    "url": "subway-surfers-st-petersburg.html",
    "author": "SYBO"
  },
  {
    "id": 144,
    "name": "Subway Surfers: Winter Holiday",
    "cover": `${COVER_URL}/subway-surfers-winter-holiday.png`,
    "url": "subway-surfers-winter-holiday.html",
    "author": "SYBO"
  },
  {
    "id": 145,
    "name": "Subway Surfers: Zurich",
    "cover": `${COVER_URL}/subway-surfers-zurich.png`,
    "url": "subway-surfers-zurich.html",
    "author": "SYBO"
  },
  {
    "id": 146,
    "name": "8 Ball Classic",
    "cover": `${COVER_URL}/8-ball-classic.png`,
    "url": "8-ball-classic.html",
    "author": "Famobi"
  },
  {
    "id": 147,
    "name": "Angry Birds Showdown",
    "cover": `${COVER_URL}/angry-birds-showdown.png`,
    "url": "angry-birds-showdown.html",
    "author": "Rovio Entertainment"
  },
  {
    "id": 148,
    "name": "Archery World Tour",
    "cover": `${COVER_URL}/archery-world-tour.png`,
    "url": "archery-world-tour.html",
    "author": "Famobi"
  },
  {
    "id": 149,
    "name": "Ball Blast",
    "cover": `${COVER_URL}/ball-blast.png`,
    "url": "ball-blast.html",
    "author": "Voodoo"
  },
  {
    "id": 150,
    "name": "Cannon Balls 3D",
    "cover": `${COVER_URL}/cannon-balls-3d.png`,
    "url": "cannon-balls-3d.html",
    "author": "Famobi"
  },
  {
    "id": 151,
    "name": "Chess Classic",
    "cover": `${COVER_URL}/chess-classic.png`,
    "url": "chess-classic.html",
    "author": "Famobi"
  },
  {
    "id": 152,
    "name": "Draw the Line",
    "cover": `${COVER_URL}/draw-the-line.png`,
    "url": "draw-the-line.html",
    "author": "Supersonic Studios LTD"
  },
  {
    "id": 153,
    "name": "Flappy Dunk",
    "cover": `${COVER_URL}/flappy-dunk.png`,
    "url": "flappy-dunk.html",
    "author": "Voodoo"
  },
  {
    "id": 154,
    "name": "Fork n Sausage",
    "cover": `${COVER_URL}/fork-n-sausage.png`,
    "url": "fork-n-sausage.html",
    "author": "SayGames"
  },
  {
    "id": 155,
    "name": "Guess Their Answer",
    "cover": `${COVER_URL}/guess-their-answer.png`,
    "url": "guess-their-answer.html",
    "author": "TapNation"
  },
  {
    "id": 156,
    "name": "Harvest.io",
    "cover": `${COVER_URL}/harvestio.png`,
    "url": "harvestio.html",
    "author": "CASUAL AZUR GAMES"
  },
  {
    "id": 157,
    "name": "Hill Climb Racing Lite",
    "cover": `${COVER_URL}/hill-climb-racing-lite.png`,
    "url": "hill-climb-racing-lite.html",
    "author": "Fingersoft"
  },
  {
    "id": 158,
    "name": "Pac-Man Superfast",
    "cover": `${COVER_URL}/pac-man-superfast.png`,
    "url": "pac-man-superfast.html",
    "author": "RedFox Games"
  },
  {
    "id": 159,
    "name": "Parking Rush",
    "cover": `${COVER_URL}/parking-rush.png`,
    "url": "parking-rush.html",
    "author": "Nine&Nine"
  },
  {
    "id": 160,
    "name": "Race Master 3D",
    "cover": `${COVER_URL}/race-master-3d.png`,
    "url": "race-master-3d.html",
    "author": "Beresnev Games"
  },
  {
    "id": 161,
    "name": "State.io",
    "cover": `${COVER_URL}/stateio.png`,
    "url": "stateio.html",
    "author": "CASUAL AZUR GAMES"
  },
  {
    "id": 162,
    "name": "Tower Crash 3D",
    "cover": `${COVER_URL}/tower-crash-3d.png`,
    "url": "tower-crash-3d.html",
    "author": "Famobi"
  },
  {
    "id": 163,
    "name": "Trivia Crack",
    "cover": `${COVER_URL}/trivia-crack.png`,
    "url": "trivia-crack.html",
    "author": "etermax"
  },
  {
    "id": 164,
    "name": "Crazy Cattle 3D",
    "cover": `${COVER_URL}/crazy-cattle-3d.png`,
    "url": "crazy-cattle-3d.html",
    "author": "4nn4t4t",
    "special": ["port"]
  },
  {
    "id": 165,
    "name": "Cheese Chompers 3D",
    "cover": `${COVER_URL}/cheese-chompers-3d.png`,
    "url": "cheese-chompers-3d.html",
    "author": "NavaNoid"
  },
  {
    "id": 166,
    "name": "Bad Parenting 1",
    "cover": `${COVER_URL}/bad-parenting-1.png`,
    "url": "bad-parenting-1.html",
    "author": "98corbins",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 167,
    "name": "Blade Ball",
    "cover": `${COVER_URL}/blade-ball.png`,
    "url": "blade-ball.html",
    "author": "??"
  },
  {
    "id": 168,
    "name": "Blocky Snakes",
    "cover": `${COVER_URL}/blocky-snakes.png`,
    "url": "blocky-snakes.html",
    "author": "Beedo Games"
  },
  {
    "id": 169,
    "name": "Bloxorz",
    "cover": `${COVER_URL}/bloxorz.png`,
    "url": "bloxorz.html",
    "author": "Damien Clarke"
  },
  {
    "id": 170,
    "name": "Big Tower Tiny Square 2",
    "cover": `${COVER_URL}/big-tower-tiny-square-2.png`,
    "url": "big-tower-tiny-square-2.html",
    "author": "EO Interactive",
    "special": ["flash"]
  },
  {
    "id": 171,
    "name": "Candy Crush",
    "cover": `${COVER_URL}/candy-crush.png`,
    "url": "candy-crush.html",
    "author": "King.com"
  },
  {
    "id": 172,
    "name": "Melon Playground",
    "cover": `${COVER_URL}/melon-playground.png`,
    "url": "melon-playground.html",
    "author": "playducky.com"
  },
  {
    "id": 173,
    "name": "Drift Hunters",
    "cover": `${COVER_URL}/drift-hunters.png`,
    "url": "drift-hunters.html",
    "author": "Illia Kaminetskyi"
  },
  {
    "id": 174,
    "name": "World Box",
    "cover": `${COVER_URL}/world-box.png`,
    "url": "world-box.html",
    "author": "Kendja",
    "special": ["flash"]
  },
  {
    "id": 175,
    "name": "Run 1",
    "cover": `${COVER_URL}/run-1.png`,
    "url": "run-1.html",
    "author": "Joseph Cloutier",
    "special": ["flash"]
  },
  {
    "id": 176,
    "name": "Run 2",
    "cover": `${COVER_URL}/run-2.png`,
    "url": "run-2.html",
    "author": "Joseph Cloutier",
    "special": ["flash"]
  },
  {
    "id": 177,
    "name": "Run 3",
    "cover": `${COVER_URL}/run-3.png`,
    "url": "run-3.html",
    "author": "Joseph Cloutier",
    "special": ["flash"]
  },
  {
    "id": 178,
    "name": "Swords and Souls",
    "cover": `${COVER_URL}/swords-and-souls.png`,
    "url": "swords-and-souls.html",
    "author": "Armor Games",
    "special": ["flash"]
  },
  {
    "id": 179,
    "name": "Soundboard",
    "cover": `${COVER_URL}/soundboard.png`,
    "url": "soundboard.html",
    "author": "genizy",
    "special": ["tools"],
    "featured": true
  },
  {
    "id": 180,
    "name": "n-gon",
    "cover": `${COVER_URL}/n-gon.png`,
    "url": "n-gon.html",
    "author": "landgreen"
  },
  {
    "id": 181,
    "name": "Minecraft 1.8.8",
    "cover": `${COVER_URL}/minecraft-188.png`,
    "url": "minecraft-188.html",
    "author": "lax1dude"
  },
  {
    "id": 182,
    "name": "Minecraft 1.12.2",
    "cover": `${COVER_URL}/minecraft-1122.png`,
    "url": "minecraft-1122.html",
    "author": "lax1dude",
    "featured": true
  },
  {
    "id": 183,
    "name": "Minecraft 1.21.4",
    "cover": `${COVER_URL}/minecraft-1214.png`,
    "url": "minecraft-1214.html",
    "author": "zardoy"
  },
  {
    "id": 185,
    "name": "Five Nights at Freddy's: Sister Location",
    "cover": `${COVER_URL}/five-nights-at-freddys-sister-location.png`,
    "url": "five-nights-at-freddys-sister-location.html",
    "author": "Scott Cawthon",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 186,
    "name": "Ragdoll Archers",
    "cover": `${COVER_URL}/ragdoll-archers.png`,
    "url": "ragdoll-archers.html",
    "author": "Ericetto"
  },
  {
    "id": 187,
    "name": "Papers, Please",
    "cover": `${COVER_URL}/papers-please.png`,
    "url": "papers-please.html",
    "author": "Lucas Pope",
    "special": ["flash"]
  },
  {
    "id": 188,
    "name": "Scrap Metal 3",
    "cover": `${COVER_URL}/scrap-metal-3.png`,
    "url": "scrap-metal-3.html",
    "author": "Ciorbyn"
  },
  {
    "id": 190,
    "name": "Five Nights at Freddy's: World",
    "cover": `${COVER_URL}/five-nights-at-freddys-world.png`,
    "url": "five-nights-at-freddys-world.html",
    "author": "Scott Cawthon",
    "special": ["port"]
  },
  {
    "id": 191,
    "name": "Five Nights at Freddy's: Pizza Simulator",
    "cover": `${COVER_URL}/five-nights-at-freddys-pizza-simulator.png`,
    "url": "five-nights-at-freddys-pizza-simulator.html",
    "author": "Scott Cawthon",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 192,
    "name": "Five Nights at Freddy's: Ultimate Custom Night",
    "cover": `${COVER_URL}/five-nights-at-freddys-ultimate-custom-night.png`,
    "url": "five-nights-at-freddys-ultimate-custom-night.html",
    "author": "Scott Cawthon",
    "special": ["port"]
  },
  {
    "id": 193,
    "name": "Do NOT Take This Cat Home",
    "cover": `${COVER_URL}/do-not-take-this-cat-home.png`,
    "url": "do-not-take-this-cat-home.html",
    "author": "Pixelliminal",
    "special": ["port"]
  },
  {
    "id": 194,
    "name": "People Playground",
    "cover": `${COVER_URL}/people-playground.png`,
    "url": "people-playground.html",
    "author": "Studio Minus, 98corbins",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 195,
    "name": "R.E.P.O",
    "cover": `${COVER_URL}/repo.png`,
    "url": "repo.html",
    "author": "semiwork, 98corbins",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 196,
    "name": "ULTRAKILL",
    "cover": `${COVER_URL}/ultrakill.png`,
    "url": "ultrakill.html",
    "author": "New Blood Interactive, Cake Logic",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 197,
    "name": "Elastic Man",
    "cover": `${COVER_URL}/elastic-man.png`,
    "url": "elastic-man.html",
    "author": "David Li"
  },
  {
    "id": 198,
    "name": "Slope",
    "cover": `${COVER_URL}/slope.png`,
    "url": "slope.html",
    "author": "coweggs"
  },
  {
    "id": 199,
    "name": "Time Shooter 1",
    "cover": `${COVER_URL}/time-shooter-1.png`,
    "url": "time-shooter-1.html",
    "author": "g80g"
  },
  {
    "id": 200,
    "name": "Time Shooter 2",
    "cover": `${COVER_URL}/time-shooter-2.png`,
    "url": "time-shooter-2.html",
    "author": "g80g"
  },
  {
    "id": 201,
    "name": "Time Shooter 3: SWAT",
    "cover": `${COVER_URL}/time-shooter-3-swat.png`,
    "url": "time-shooter-3-swat.html",
    "author": "g80g"
  },
  {
    "id": 202,
    "name": "Carrom Clash",
    "cover": `${COVER_URL}/carrom-clash.png`,
    "url": "carrom-clash.html",
    "author": "GameSnacks"
  },
  {
    "id": 203,
    "name": "DOOM",
    "cover": `${COVER_URL}/doom.png`,
    "url": "doom.html",
    "author": "Id Software"
  },
  {
    "id": 204,
    "name": "Five Nights at Winston's",
    "cover": `${COVER_URL}/five-nights-at-winstons.png`,
    "url": "five-nights-at-winstons.html",
    "author": "lax1dude"
  },
  {
    "id": 205,
    "name": "Buckshot Roulette",
    "cover": `${COVER_URL}/buckshot-roulette.png`,
    "url": "buckshot-roulette.html",
    "author": "Mike Klubnika",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 206,
    "name": "Tunnel Rush",
    "cover": `${COVER_URL}/tunnel-rush.png`,
    "url": "tunnel-rush.html",
    "author": "Deer Cat Games"
  },
  {
    "id": 207,
    "name": "Snowbattle.io",
    "cover": `${COVER_URL}/snowbattleio.png`,
    "url": "snowbattleio.html",
    "author": "Royalec/Tokyo"
  },
  {
    "id": 208,
    "name": "Rolly Vortex",
    "cover": `${COVER_URL}/rolly-vortex.png`,
    "url": "rolly-vortex.html",
    "author": "Voodoo"
  },
  {
    "id": 209,
    "name": "Draw the Hill",
    "cover": `${COVER_URL}/draw-the-hill.png`,
    "url": "draw-the-hill.html",
    "author": "Stelennnn"
  },
  {
    "id": 210,
    "name": "Dragon vs Bricks",
    "cover": `${COVER_URL}/dragon-vs-bricks.png`,
    "url": "dragon-vs-bricks.html",
    "author": "Voodoo"
  },
  {
    "id": 211,
    "name": "Death Run 3D",
    "cover": `${COVER_URL}/death-run-3d.png`,
    "url": "death-run-3d.html",
    "author": "kevin.wang"
  },
  {
    "id": 212,
    "name": "Cut the Rope",
    "cover": `${COVER_URL}/cut-the-rope.png`,
    "url": "cut-the-rope.html",
    "author": "ZeptoLab"
  },
  {
    "id": 213,
    "name": "Cut the Rope: Time Travel",
    "cover": `${COVER_URL}/cut-the-rope-time-travel.png`,
    "url": "cut-the-rope-time-travel.html",
    "author": "ZeptoLab"
  },
  {
    "id": 214,
    "name": "Cut the Rope: Holiday Gift",
    "cover": `${COVER_URL}/cut-the-rope-holiday-gift.png`,
    "url": "cut-the-rope-holiday-gift.html",
    "author": "ZeptoLab"
  },
  {
    "id": 215,
    "name": "Bendy and the Ink Machine",
    "cover": `${COVER_URL}/bendy-and-the-ink-machine.png`,
    "url": "bendy-and-the-ink-machine.html",
    "author": "Joey Drew Studios",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 216,
    "name": "That's Not My Neighbor",
    "cover": `${COVER_URL}/thats-not-my-neighbor.png`,
    "url": "thats-not-my-neighbor.html",
    "author": "Nacho Games",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 217,
    "name": "Hotline Miami",
    "cover": `${COVER_URL}/hotline-miami.png`,
    "url": "hotline-miami.html",
    "author": "Dennaton Games",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 218,
    "name": "Papa's Bakeria",
    "cover": `${COVER_URL}/papas-bakeria.png`,
    "url": "papas-bakeria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 219,
    "name": "Papa's Burgeria",
    "cover": `${COVER_URL}/papas-burgeria.png`,
    "url": "papas-burgeria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 220,
    "name": "Papa's Cheeseria",
    "cover": `${COVER_URL}/papas-cheeseria.png`,
    "url": "papas-cheeseria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 221,
    "name": "Papa's Cupcakeria",
    "cover": `${COVER_URL}/papas-cupcakeria.png`,
    "url": "papas-cupcakeria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 222,
    "name": "Papa's Donuteria",
    "cover": `${COVER_URL}/papas-donuteria.png`,
    "url": "papas-donuteria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 223,
    "name": "Papa's Freezeria",
    "cover": `${COVER_URL}/papas-freezeria.png`,
    "url": "papas-freezeria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 224,
    "name": "Papa's Hot Doggeria",
    "cover": `${COVER_URL}/papas-hot-doggeria.png`,
    "url": "papas-hot-doggeria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 225,
    "name": "Papa's Pancakeria",
    "cover": `${COVER_URL}/papas-pancakeria.png`,
    "url": "papas-pancakeria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 226,
    "name": "Papa's Pastaria",
    "cover": `${COVER_URL}/papas-pastaria.png`,
    "url": "papas-pastaria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 227,
    "name": "Papa's Pizeria",
    "cover": `${COVER_URL}/papas-pizeria.png`,
    "url": "papas-pizeria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 228,
    "name": "Papa's Scooperia",
    "cover": `${COVER_URL}/papas-scooperia.png`,
    "url": "papas-scooperia.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 229,
    "name": "Papa's Sushiria",
    "cover": `${COVER_URL}/papas-sushiria.png`,
    "url": "papas-sushiria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 230,
    "name": "Papa's Taco Mia",
    "cover": `${COVER_URL}/papas-taco-mia.png`,
    "url": "papas-taco-mia.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 231,
    "name": "Papa's Wingeria",
    "cover": `${COVER_URL}/papas-wingeria.png`,
    "url": "papas-wingeria.html",
    "author": "Flipline Studios",
    "special": ["flash"]
  },
  {
    "id": 232,
    "name": "Plants vs Zombies",
    "cover": `${COVER_URL}/plants-vs-zombies.png`,
    "url": "plants-vs-zombies.html",
    "author": "PopCap Games",
    "special": ["flash"]
  },
  {
    "id": 233,
    "name": "Superhot",
    "cover": `${COVER_URL}/superhot.png`,
    "url": "superhot.html",
    "author": "Superhot Team"
  },
  {
    "id": 234,
    "name": "Duck Life",
    "cover": `${COVER_URL}/duck-life.png`,
    "url": "duck-life.html",
    "author": "Mad.com",
    "special": ["flash"]
  },
  {
    "id": 235,
    "name": "Duck Life 2",
    "cover": `${COVER_URL}/duck-life-2.png`,
    "url": "duck-life-2.html",
    "author": "Mad.com",
    "special": ["flash"]
  },
  {
    "id": 236,
    "name": "Duck Life 3",
    "cover": `${COVER_URL}/duck-life-3.png`,
    "url": "duck-life-3.html",
    "author": "Mad.com",
    "special": ["flash"]
  },
  {
    "id": 237,
    "name": "Duck Life 4",
    "cover": `${COVER_URL}/duck-life-4.png`,
    "url": "duck-life-4.html",
    "author": "Mad.com",
    "special": ["flash"]
  },
  {
    "id": 238,
    "name": "Duck Life 5",
    "cover": `${COVER_URL}/duck-life-5.png`,
    "url": "duck-life-5.html",
    "author": "Mad.com",
    "special": ["flash"]
  },
  {
    "id": 239,
    "name": "Red Ball",
    "cover": `${COVER_URL}/red-ball.png`,
    "url": "red-ball.html",
    "author": "Yohoho Games",
    "special": ["flash"]
  },
  {
    "id": 240,
    "name": "Red Ball 2",
    "cover": `${COVER_URL}/red-ball-2.png`,
    "url": "red-ball-2.html",
    "author": "Yohoho Games",
    "special": ["flash"]
  },
  {
    "id": 241,
    "name": "Red Ball 3",
    "cover": `${COVER_URL}/red-ball-3.png`,
    "url": "red-ball-3.html",
    "author": "Yohoho Games",
    "special": ["flash"]
  },
  {
    "id": 242,
    "name": "Red Ball 4",
    "cover": `${COVER_URL}/red-ball-4.png`,
    "url": "red-ball-4.html",
    "author": "Yohoho Games",
    "special": ["flash"]
  },
  {
    "id": 243,
    "name": "Red Ball 4 Vol. 2",
    "cover": `${COVER_URL}/red-ball-4-vol-2.png`,
    "url": "red-ball-4-vol-2.html",
    "author": "Yohoho Games",
    "special": ["flash"]
  },
  {
    "id": 244,
    "name": "Red Ball 4 Vol. 3",
    "cover": `${COVER_URL}/red-ball-4-vol-3.png`,
    "url": "red-ball-4-vol-3.html",
    "author": "Yohoho Games",
    "special": ["flash"]
  },
  {
    "id": 245,
    "name": "Wheely",
    "cover": `${COVER_URL}/wheely.png`,
    "url": "wheely.html",
    "author": "Pegas Games",
    "special": ["flash"]
  },
  {
    "id": 246,
    "name": "Wheely 2",
    "cover": `${COVER_URL}/wheely-2.png`,
    "url": "wheely-2.html",
    "author": "Pegas Games",
    "special": ["flash"]
  },
  {
    "id": 247,
    "name": "Wheely 3",
    "cover": `${COVER_URL}/wheely-3.png`,
    "url": "wheely-3.html",
    "author": "Pegas Games",
    "special": ["flash"]
  },
  {
    "id": 248,
    "name": "Wheely 4",
    "cover": `${COVER_URL}/wheely-4.png`,
    "url": "wheely-4.html",
    "author": "Pegas Games",
    "special": ["flash"]
  },
  {
    "id": 249,
    "name": "Wheely 5",
    "cover": `${COVER_URL}/wheely-5.png`,
    "url": "wheely-5.html",
    "author": "Pegas Games",
    "special": ["flash"]
  },
  {
    "id": 250,
    "name": "Wheely 6",
    "cover": `${COVER_URL}/wheely-6.png`,
    "url": "wheely-6.html",
    "author": "Pegas Games",
    "special": ["flash"]
  },
  {
    "id": 251,
    "name": "Wheely 7",
    "cover": `${COVER_URL}/wheely-7.png`,
    "url": "wheely-7.html",
    "author": "Pegas Games",
    "special": ["flash"]
  },
  {
    "id": 252,
    "name": "Wheely 8",
    "cover": `${COVER_URL}/wheely-8.png`,
    "url": "wheely-8.html",
    "author": "Pegas Games",
    "special": ["flash"]
  },
  {
    "id": 253,
    "name": "Chat Bot (A.|.I)",
    "cover": `${COVER_URL}/chat-bot-ai.png`,
    "url": "chat-bot-ai.html",
    "author": "gn-math",
    "special": ["tools"],
    "featured": true
  },
  {
    "id": 255,
    "name": "Crazy Chicken 3D",
    "cover": `${COVER_URL}/crazy-chicken-3d.png`,
    "url": "crazy-chicken-3d.html",
    "author": "Teasle"
  },
  {
    "id": 256,
    "name": "Crazy Kitty 3D",
    "cover": `${COVER_URL}/crazy-kitty-3d.png`,
    "url": "crazy-kitty-3d.html",
    "author": "Teasle"
  },
  {
    "id": 257,
    "name": "Google Baseball",
    "cover": `${COVER_URL}/google-baseball.png`,
    "url": "google-baseball.html",
    "author": "Google"
  },
  {
    "id": 258,
    "name": "A Bite at Freddy's",
    "cover": `${COVER_URL}/a-bite-at-freddys.png`,
    "url": "a-bite-at-freddys.html",
    "author": "Garrett McKay",
    "special": ["port"]
  },
  {
    "id": 259,
    "name": "Class of '09",
    "cover": `${COVER_URL}/class-of-09.png`,
    "url": "class-of-09.html",
    "author": "sbn3",
    "special": ["port"]
  },
  {
    "id": 260,
    "name": "RE:RUN",
    "cover": `${COVER_URL}/rerun.png`,
    "url": "rerun.html",
    "author": "DaniDev",
    "special": ["port"]
  },
  {
    "id": 261,
    "name": "Fruit Ninja",
    "cover": `${COVER_URL}/fruit-ninja.png`,
    "url": "fruit-ninja.html",
    "author": "Halfbrick Studios"
  },
  {
    "id": 262,
    "name": "Half Life",
    "cover": `${COVER_URL}/half-life.png`,
    "url": "half-life.html",
    "author": "Valve",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 263,
    "name": "Quake III Arena",
    "cover": `${COVER_URL}/quake-iii-arena.png`,
    "url": "quake-iii-arena.html",
    "author": "Id Software",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 264,
    "name": "Escape Road",
    "cover": `${COVER_URL}/escape-road.png`,
    "url": "escape-road.html",
    "author": "AzGames"
  },
  {
    "id": 265,
    "name": "Escape Road 2",
    "cover": `${COVER_URL}/escape-road-2.png`,
    "url": "escape-road-2.html",
    "author": "AzGames"
  },
  {
    "id": 266,
    "name": "Speed Stars",
    "cover": `${COVER_URL}/speed-stars.png`,
    "url": "speed-stars.html",
    "author": "Luke Doukakis",
    "special": ["port"]
  },
  {
    "id": 267,
    "name": "Pizza Tower",
    "cover": `${COVER_URL}/pizza-tower.png`,
    "url": "pizza-tower.html",
    "author": "Tour De Pizza, BurnedPopcorn",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 268,
    "name": "Bacon May Die",
    "cover": `${COVER_URL}/bacon-may-die.png`,
    "url": "bacon-may-die.html",
    "author": "SnoutUp"
  },
  {
    "id": 269,
    "name": "Bad Ice Cream",
    "cover": `${COVER_URL}/bad-ice-cream.png`,
    "url": "bad-ice-cream.html",
    "author": "Nitrome"
  },
  {
    "id": 270,
    "name": "Bad Ice Cream 2",
    "cover": `${COVER_URL}/bad-ice-cream-2.png`,
    "url": "bad-ice-cream-2.html",
    "author": "Nitrome"
  },
  {
    "id": 271,
    "name": "Bad Ice Cream 3",
    "cover": `${COVER_URL}/bad-ice-cream-3.png`,
    "url": "bad-ice-cream-3.html",
    "author": "Nitrome"
  },
  {
    "id": 272,
    "name": "Basketball Stars",
    "cover": `${COVER_URL}/basketball-stars.png`,
    "url": "basketball-stars.html",
    "author": "MadPuffers"
  },
  {
    "id": 273,
    "name": "BlockPost",
    "cover": `${COVER_URL}/blockpost.png`,
    "url": "blockpost.html",
    "author": "SkullCap Studios"
  },
  {
    "id": 274,
    "name": "CircloO",
    "cover": `${COVER_URL}/circloo.png`,
    "url": "circloo.html",
    "author": "Florian van Strien"
  },
  {
    "id": 275,
    "name": "CircloO 2",
    "cover": `${COVER_URL}/circloo-2.png`,
    "url": "circloo-2.html",
    "author": "Florian van Strien"
  },
  {
    "id": 276,
    "name": "Drift Boss",
    "cover": `${COVER_URL}/drift-boss.png`,
    "url": "drift-boss.html",
    "author": "marketjs"
  },
  {
    "id": 277,
    "name": "Evil Glitch",
    "cover": `${COVER_URL}/evil-glitch.png`,
    "url": "evil-glitch.html",
    "author": "agar3s"
  },
  {
    "id": 278,
    "name": "Madalin Stunt Cars 2",
    "cover": `${COVER_URL}/madalin-stunt-cars-2.png`,
    "url": "madalin-stunt-cars-2.html",
    "author": "Madalin Games"
  },
  {
    "id": 279,
    "name": "Madalin Stunt Cars 3",
    "cover": `${COVER_URL}/madalin-stunt-cars-3.png`,
    "url": "madalin-stunt-cars-3.html",
    "author": "Madalin Games"
  },
  {
    "id": 280,
    "name": "Papery Planes",
    "cover": `${COVER_URL}/papery-planes.png`,
    "url": "papery-planes.html",
    "author": "Akos Makovics"
  },
  {
    "id": 281,
    "name": "Pixel Gun Survival",
    "cover": `${COVER_URL}/pixel-gun-survival.png`,
    "url": "pixel-gun-survival.html",
    "author": "Mentolatux"
  },
  {
    "id": 282,
    "name": "Protektor",
    "cover": `${COVER_URL}/protektor.png`,
    "url": "protektor.html",
    "author": "rujogames"
  },
  {
    "id": 283,
    "name": "Rooftop Snipers",
    "cover": `${COVER_URL}/rooftop-snipers.png`,
    "url": "rooftop-snipers.html",
    "author": "New Eich Games"
  },
  {
    "id": 284,
    "name": "War The Knights",
    "cover": `${COVER_URL}/war-the-knights.png`,
    "url": "war-the-knights.html",
    "author": "BANZAI"
  },
  {
    "id": 285,
    "name": "Basket Bros",
    "cover": `${COVER_URL}/basket-bros.png`,
    "url": "basket-bros.html",
    "author": "Blue Wizard Digital"
  },
  {
    "id": 286,
    "name": "Endoparasitic",
    "cover": `${COVER_URL}/endoparasitic.png`,
    "url": "endoparasitic.html",
    "author": "Deep Root Interactive",
    "special": ["port"]
  },
  {
    "id": 287,
    "name": "Riddle School",
    "cover": `${COVER_URL}/riddle-school.png`,
    "url": "riddle-school.html",
    "author": "JonBro",
    "special": ["flash"]
  },
  {
    "id": 288,
    "name": "Riddle School 2",
    "cover": `${COVER_URL}/riddle-school-2.png`,
    "url": "riddle-school-2.html",
    "author": "JonBro",
    "special": ["flash"]
  },
  {
    "id": 289,
    "name": "Riddle School 3",
    "cover": `${COVER_URL}/riddle-school-3.png`,
    "url": "riddle-school-3.html",
    "author": "JonBro",
    "special": ["flash"]
  },
  {
    "id": 290,
    "name": "Riddle School 4",
    "cover": `${COVER_URL}/riddle-school-4.png`,
    "url": "riddle-school-4.html",
    "author": "JonBro",
    "special": ["flash"]
  },
  {
    "id": 291,
    "name": "Riddle School 5",
    "cover": `${COVER_URL}/riddle-school-5.png`,
    "url": "riddle-school-5.html",
    "author": "JonBro",
    "special": ["flash"]
  },
  {
    "id": 292,
    "name": "Riddle Transfer",
    "cover": `${COVER_URL}/riddle-transfer.png`,
    "url": "riddle-transfer.html",
    "author": "JonBro",
    "special": ["flash"]
  },
  {
    "id": 293,
    "name": "Riddle Transfer 2",
    "cover": `${COVER_URL}/riddle-transfer-2.png`,
    "url": "riddle-transfer-2.html",
    "author": "JonBro",
    "special": ["flash"]
  },
  {
    "id": 294,
    "name": "Idle Dice",
    "cover": `${COVER_URL}/idle-dice.png`,
    "url": "idle-dice.html",
    "author": "Lutz Schönfelder"
  },
  {
    "id": 295,
    "name": "12 Mini Battles",
    "cover": `${COVER_URL}/12-mini-battles.png`,
    "url": "12-mini-battles.html",
    "author": "Shared Dreams Studio"
  },
  {
    "id": 296,
    "name": "Play!.js",
    "cover": `${COVER_URL}/playjs.png`,
    "url": "playjs.html",
    "author": "jpd002",
    "special": ["emulator"]
  },
  {
    "id": 297,
    "name": "Minecraft 1.5.2",
    "cover": `${COVER_URL}/minecraft-152.png`,
    "url": "minecraft-152.html",
    "author": "lax1dude"
  },
  {
    "id": 298,
    "name": "Minecraft Alpha 1.2.6",
    "cover": `${COVER_URL}/minecraft-alpha-126.png`,
    "url": "minecraft-alpha-126.html",
    "author": "lax1dude"
  },
  {
    "id": 299,
    "name": "Minecraft Beta 1.3",
    "cover": `${COVER_URL}/minecraft-beta-13.png`,
    "url": "minecraft-beta-13.html",
    "author": "lax1dude"
  },
  {
    "id": 300,
    "name": "Minecraft Beta 1.7.3",
    "cover": `${COVER_URL}/minecraft-beta-173.png`,
    "url": "minecraft-beta-173.html",
    "author": "lax1dude"
  },
  {
    "id": 301,
    "name": "Minecraft Indev",
    "cover": `${COVER_URL}/minecraft-indev.png`,
    "url": "minecraft-indev.html",
    "author": "lax1dude"
  },
  {
    "id": 302,
    "name": "Little Runmo",
    "cover": `${COVER_URL}/little-runmo.png`,
    "url": "little-runmo.html",
    "author": "juhosprite, gooseworx"
  },
  {
    "id": 303,
    "name": "Territorial.io",
    "cover": `${COVER_URL}/territorialio.png`,
    "url": "territorialio.html",
    "author": "TTCreator"
  },
  {
    "id": 304,
    "name": "Alien Hominid",
    "cover": `${COVER_URL}/alien-hominid.png`,
    "url": "alien-hominid.html",
    "author": "Tom Fulp, Dan Paladin",
    "special": ["flash"]
  },
  {
    "id": 305,
    "name": "Tanuki Sunset",
    "cover": `${COVER_URL}/tanuki-sunset.png`,
    "url": "tanuki-sunset.html",
    "author": "Rewind Games"
  },
  {
    "id": 306,
    "name": "Shipo.io",
    "cover": `${COVER_URL}/shipoio.png`,
    "url": "shipoio.html",
    "author": "OnRush Studio"
  },
  {
    "id": 307,
    "name": "Rainbow Obby",
    "cover": `${COVER_URL}/rainbow-obby.png`,
    "url": "rainbow-obby.html",
    "author": "emolingo games"
  },
  {
    "id": 308,
    "name": "Nazi Zombies: Portable",
    "cover": `${COVER_URL}/nazi-zombies-portable.png`,
    "url": "nazi-zombies-portable.html",
    "author": "nzp team"
  },
  {
    "id": 309,
    "name": "Sandboxels",
    "cover": `${COVER_URL}/sandboxels.png`,
    "url": "sandboxels.html",
    "author": "R74N"
  },
  {
    "id": 310,
    "name": "Dreadhead Parkour",
    "cover": `${COVER_URL}/dreadhead-parkour.png`,
    "url": "dreadhead-parkour.html",
    "author": "GameTornado"
  },
  {
    "id": 311,
    "name": "Sandtris",
    "cover": `${COVER_URL}/sandtris.png`,
    "url": "sandtris.html",
    "author": "FRANCO MIRANDA"
  },
  {
    "id": 312,
    "name": "BlackJack",
    "cover": `${COVER_URL}/blackjack.png`,
    "url": "blackjack.html",
    "author": "Synic-dx"
  },
  {
    "id": 313,
    "name": "Minesweeper Mania",
    "cover": `${COVER_URL}/minesweeper-mania.png`,
    "url": "minesweeper-mania.html",
    "author": "gamesnacks"
  },
  {
    "id": 314,
    "name": "Super Mario 63",
    "cover": `${COVER_URL}/super-mario-63.png`,
    "url": "super-mario-63.html",
    "author": "Runouw"
  },
  {
    "id": 315,
    "name": "Jelly Mario",
    "cover": `${COVER_URL}/jelly-mario.png`,
    "url": "jelly-mario.html",
    "author": "Schteppe"
  },
  {
    "id": 316,
    "name": "Angry Birds Chrome",
    "cover": `${COVER_URL}/angry-birds-chrome.png`,
    "url": "angry-birds-chrome.html",
    "author": "Rovio"
  },
  {
    "id": 317,
    "name": "sandspiel",
    "cover": `${COVER_URL}/sandspiel.png`,
    "url": "sandspiel.html",
    "author": "maxbittker"
  },
  {
    "id": 318,
    "name": "Side Effects",
    "cover": `${COVER_URL}/side-effects.png`,
    "url": "side-effects.html",
    "author": "hi rohun, Mr.Pootsley, Jaybooty"
  },
  {
    "id": 319,
    "name": "Build a Queen",
    "cover": `${COVER_URL}/build-a-queen.png`,
    "url": "build-a-queen.html",
    "author": "Supersonic Studios LTD"
  },
  {
    "id": 320,
    "name": "3D Bowling",
    "cover": `${COVER_URL}/3d-bowling.png`,
    "url": "3d-bowling.html",
    "author": "Italic Games"
  },
  {
    "id": 321,
    "name": "Room Sort",
    "cover": `${COVER_URL}/room-sort.png`,
    "url": "room-sort.html",
    "author": "Gamincat"
  },
  {
    "id": 322,
    "name": "Sushi Roll",
    "cover": `${COVER_URL}/sushi-roll.png`,
    "url": "sushi-roll.html",
    "author": "Famobi"
  },
  {
    "id": 323,
    "name": "Find the Alien",
    "cover": `${COVER_URL}/find-the-alien.png`,
    "url": "find-the-alien.html",
    "author": "MOONEE PUBLISHING LTD"
  },
  {
    "id": 324,
    "name": "Maze Speedrun",
    "cover": `${COVER_URL}/maze-speedrun.png`,
    "url": "maze-speedrun.html",
    "author": "Raval Matic"
  },
  {
    "id": 325,
    "name": "Kitchen Bazar",
    "cover": `${COVER_URL}/kitchen-bazar.png`,
    "url": "kitchen-bazar.html",
    "author": "Gameloft"
  },
  {
    "id": 326,
    "name": "Pokey Ball",
    "cover": `${COVER_URL}/pokey-ball.png`,
    "url": "pokey-ball.html",
    "author": "Voodoo"
  },
  {
    "id": 327,
    "name": "Slime.io",
    "cover": `${COVER_URL}/slimeio.png`,
    "url": "slimeio.html",
    "author": "GameSnacks"
  },
  {
    "id": 328,
    "name": "Om Nom Run",
    "cover": `${COVER_URL}/om-nom-run.png`,
    "url": "om-nom-run.html",
    "author": "ZeptoLab"
  },
  {
    "id": 329,
    "name": "TileTopia",
    "cover": `${COVER_URL}/tiletopia.png`,
    "url": "tiletopia.html",
    "author": "GameSnacks"
  },
  {
    "id": 330,
    "name": "BitPlanes",
    "cover": `${COVER_URL}/bitplanes.png`,
    "url": "bitplanes.html",
    "author": "Anton Medvedev"
  },
  {
    "id": 331,
    "name": "Crazy Cars",
    "cover": `${COVER_URL}/crazy-cars.png`,
    "url": "crazy-cars.html",
    "author": "No Pressure Studios"
  },
  {
    "id": 332,
    "name": "Going Balls",
    "cover": `${COVER_URL}/going-balls.png`,
    "url": "going-balls.html",
    "author": "Supersonic Studios LTD"
  },
  {
    "id": 333,
    "name": "Fancy Pants Adventure",
    "cover": `${COVER_URL}/fancy-pants-adventure.png`,
    "url": "fancy-pants-adventure.html",
    "author": "Brad Borne",
    "special": ["flash"]
  },
  {
    "id": 334,
    "name": "Fancy Pants Adventure 2",
    "cover": `${COVER_URL}/fancy-pants-adventure-2.png`,
    "url": "fancy-pants-adventure-2.html",
    "author": "Brad Borne",
    "special": ["flash"]
  },
  {
    "id": 335,
    "name": "Fancy Pants Adventure 3",
    "cover": `${COVER_URL}/fancy-pants-adventure-3.png`,
    "url": "fancy-pants-adventure-3.html",
    "author": "Brad Borne",
    "special": ["flash"]
  },
  {
    "id": 336,
    "name": "Fancy Pants Adventure 4 Part 1",
    "cover": `${COVER_URL}/fancy-pants-adventure-4-part-1.png`,
    "url": "fancy-pants-adventure-4-part-1.html",
    "author": "Brad Borne",
    "special": ["flash"]
  },
  {
    "id": 337,
    "name": "Fancy Pants Adventure 4 Part 2",
    "cover": `${COVER_URL}/fancy-pants-adventure-4-part-2.png`,
    "url": "fancy-pants-adventure-4-part-2.html",
    "author": "Brad Borne",
    "special": ["flash"]
  },
  {
    "id": 338,
    "name": "Getaway Shootout",
    "cover": `${COVER_URL}/getaway-shootout.png`,
    "url": "getaway-shootout.html",
    "author": "New Eich Games"
  },
  {
    "id": 339,
    "name": "House of Hazards",
    "cover": `${COVER_URL}/house-of-hazards.png`,
    "url": "house-of-hazards.html",
    "author": "New Eich Games"
  },
  {
    "id": 340,
    "name": "Learn to Fly",
    "cover": `${COVER_URL}/learn-to-fly.png`,
    "url": "learn-to-fly.html",
    "author": "Light Bringer Games",
    "special": ["flash"]
  },
  {
    "id": 341,
    "name": "Learn to Fly 2",
    "cover": `${COVER_URL}/learn-to-fly-2.png`,
    "url": "learn-to-fly-2.html",
    "author": "Light Bringer Games",
    "special": ["flash"]
  },
  {
    "id": 342,
    "name": "Learn to Fly 3",
    "cover": `${COVER_URL}/learn-to-fly-3.png`,
    "url": "learn-to-fly-3.html",
    "author": "Light Bringer Games",
    "special": ["flash"]
  },
  {
    "id": 343,
    "name": "Learn to Fly Idle",
    "cover": `${COVER_URL}/learn-to-fly-idle.png`,
    "url": "learn-to-fly-idle.html",
    "author": "Light Bringer Games",
    "special": ["flash"]
  },
  {
    "id": 344,
    "name": "Raft Wars",
    "cover": `${COVER_URL}/raft-wars.png`,
    "url": "raft-wars.html",
    "author": "GaZZer Game",
    "special": ["flash"]
  },
  {
    "id": 345,
    "name": "Raft Wars 2",
    "cover": `${COVER_URL}/raft-wars-2.png`,
    "url": "raft-wars-2.html",
    "author": "GaZZer Game",
    "special": ["flash"]
  },
  {
    "id": 346,
    "name": "Sort the Court",
    "cover": `${COVER_URL}/sort-the-court.png`,
    "url": "sort-the-court.html",
    "author": "graebor"
  },
  {
    "id": 347,
    "name": "SpiderDoll",
    "cover": `${COVER_URL}/spiderdoll.png`,
    "url": "spiderdoll.html",
    "author": "Ysopprod"
  },
  {
    "id": 348,
    "name": "They Are Coming",
    "cover": `${COVER_URL}/they-are-coming.png`,
    "url": "they-are-coming.html",
    "author": "OnHit Developments"
  },
  {
    "id": 349,
    "name": "Spiral Roll",
    "cover": `${COVER_URL}/spiral-roll.png`,
    "url": "spiral-roll.html",
    "author": "Voodoo"
  },
  {
    "id": 350,
    "name": "Binding of Issac: Wrath of the Lamb",
    "cover": `${COVER_URL}/binding-of-issac-wrath-of-the-lamb.png`,
    "url": "binding-of-issac-wrath-of-the-lamb.html",
    "author": "Edmund McMillen",
    "special": ["flash"]
  },
  {
    "id": 351,
    "name": "Happy Sheepies",
    "cover": `${COVER_URL}/happy-sheepies.png`,
    "url": "happy-sheepies.html",
    "author": "Berker Games"
  },
  {
    "id": 352,
    "name": "DON'T YOU LECTURE ME",
    "cover": `${COVER_URL}/dont-you-lecture-me.png`,
    "url": "dont-you-lecture-me.html",
    "author": "GD Colon",
    "special": ["tools"]
  },
  {
    "id": 353,
    "name": "Blumgi Rocket",
    "cover": `${COVER_URL}/blumgi-rocket.png`,
    "url": "blumgi-rocket.html",
    "author": "Blumgi"
  },
  {
    "id": 354,
    "name": "Adventure Capatalist",
    "cover": `${COVER_URL}/adventure-capatalist.png`,
    "url": "adventure-capatalist.html",
    "author": "Hyper Hippo Games"
  },
  {
    "id": 355,
    "name": "Dadish 2",
    "cover": `${COVER_URL}/dadish-2.png`,
    "url": "dadish-2.html",
    "author": "Thomas K. Young"
  },
  {
    "id": 356,
    "name": "Dadish 3",
    "cover": `${COVER_URL}/dadish-3.png`,
    "url": "dadish-3.html",
    "author": "Thomas K. Young"
  },
  {
    "id": 357,
    "name": "Dadish",
    "cover": `${COVER_URL}/dadish.png`,
    "url": "dadish.html",
    "author": "Thomas K. Young"
  },
  {
    "id": 358,
    "name": "Dadish 3D",
    "cover": `${COVER_URL}/dadish-3d.png`,
    "url": "dadish-3d.html",
    "author": "Thomas K. Young"
  },
  {
    "id": 359,
    "name": "Daily Dadish",
    "cover": `${COVER_URL}/daily-dadish.png`,
    "url": "daily-dadish.html",
    "author": "Thomas K. Young"
  },
  {
    "id": 360,
    "name": "EvoWars.io",
    "cover": `${COVER_URL}/evowarsio.png`,
    "url": "evowarsio.html",
    "author": "Night Steed S.C."
  },
  {
    "id": 361,
    "name": "Google Feud",
    "cover": `${COVER_URL}/google-feud.png`,
    "url": "google-feud.html",
    "author": "Justin Hook"
  },
  {
    "id": 362,
    "name": "Idle Breakout",
    "cover": `${COVER_URL}/idle-breakout.png`,
    "url": "idle-breakout.html",
    "author": "Kodiqi"
  },
  {
    "id": 363,
    "name": "Idle Lumber Inc",
    "cover": `${COVER_URL}/idle-lumber-inc.png`,
    "url": "idle-lumber-inc.html",
    "author": "NoPowerUp"
  },
  {
    "id": 364,
    "name": "Idle Mining Empire",
    "cover": `${COVER_URL}/idle-mining-empire.png`,
    "url": "idle-mining-empire.html",
    "author": "marketjs"
  },
  {
    "id": 365,
    "name": "JustFall.lol",
    "cover": `${COVER_URL}/justfalllol.png`,
    "url": "justfalllol.html",
    "author": "JustPlay.LOL"
  },
  {
    "id": 366,
    "name": "Merge Harvest",
    "cover": `${COVER_URL}/merge-harvest.png`,
    "url": "merge-harvest.html",
    "author": "idfk"
  },
  {
    "id": 367,
    "name": "Parking Fury 3D",
    "cover": `${COVER_URL}/parking-fury-3d.png`,
    "url": "parking-fury-3d.html",
    "author": "Brain Software"
  },
  {
    "id": 368,
    "name": "Slope 2",
    "cover": `${COVER_URL}/slope-2.png`,
    "url": "slope-2.html",
    "author": "idfk"
  },
  {
    "id": 369,
    "name": "Slowroads",
    "cover": `${COVER_URL}/slowroads.png`,
    "url": "slowroads.html",
    "author": "Topograph Interactive"
  },
  {
    "id": 370,
    "name": "Smash Karts",
    "cover": `${COVER_URL}/smash-karts.png`,
    "url": "smash-karts.html",
    "author": "Tall Team"
  },
  {
    "id": 371,
    "name": "Stickman Fight Ragdoll",
    "cover": `${COVER_URL}/stickman-fight-ragdoll.png`,
    "url": "stickman-fight-ragdoll.html",
    "author": "Vanorium"
  },
  {
    "id": 372,
    "name": "Stickman Boost",
    "cover": `${COVER_URL}/stickman-boost.png`,
    "url": "stickman-boost.html",
    "author": "y8"
  },
  {
    "id": 373,
    "name": "Stickman Climb",
    "cover": `${COVER_URL}/stickman-climb.png`,
    "url": "stickman-climb.html",
    "author": "No Pressure Studios"
  },
  {
    "id": 374,
    "name": "Stickman Golf",
    "cover": `${COVER_URL}/stickman-golf.png`,
    "url": "stickman-golf.html",
    "author": "NoodleCake"
  },
  {
    "id": 375,
    "name": "2048 Merge Run",
    "cover": `${COVER_URL}/2048-merge-run.png`,
    "url": "2048-merge-run.html",
    "author": "Yandex"
  },
  {
    "id": 376,
    "name": "Build a Big Army",
    "cover": `${COVER_URL}/build-a-big-army.png`,
    "url": "build-a-big-army.html",
    "author": "Yandex"
  },
  {
    "id": 377,
    "name": "Build a Plane",
    "cover": `${COVER_URL}/build-a-plane.png`,
    "url": "build-a-plane.html",
    "author": "Yandex"
  },
  {
    "id": 378,
    "name": "Camouflage and Sniper",
    "cover": `${COVER_URL}/camouflage-and-sniper.png`,
    "url": "camouflage-and-sniper.html",
    "author": "Yandex"
  },
  {
    "id": 379,
    "name": "Car Survival 3D",
    "cover": `${COVER_URL}/car-survival-3d.png`,
    "url": "car-survival-3d.html",
    "author": "Yandex"
  },
  {
    "id": 380,
    "name": "City Defense",
    "cover": `${COVER_URL}/city-defense.png`,
    "url": "city-defense.html",
    "author": "Yandex"
  },
  {
    "id": 381,
    "name": "Clothing Shop 3D",
    "cover": `${COVER_URL}/clothing-shop-3d.png`,
    "url": "clothing-shop-3d.html",
    "author": "Yandex"
  },
  {
    "id": 382,
    "name": "Cool Cars Run 3D",
    "cover": `${COVER_URL}/cool-cars-run-3d.png`,
    "url": "cool-cars-run-3d.html",
    "author": "Yandex"
  },
  {
    "id": 383,
    "name": "Crush Cars 3D",
    "cover": `${COVER_URL}/crush-cars-3d.png`,
    "url": "crush-cars-3d.html",
    "author": "Yandex"
  },
  {
    "id": 384,
    "name": "Destiny Run 3D",
    "cover": `${COVER_URL}/destiny-run-3d.png`,
    "url": "destiny-run-3d.html",
    "author": "Yandex"
  },
  {
    "id": 385,
    "name": "Destroy The Car 3D",
    "cover": `${COVER_URL}/destroy-the-car-3d.png`,
    "url": "destroy-the-car-3d.html",
    "author": "Yandex"
  },
  {
    "id": 386,
    "name": "Diamond Seeker",
    "cover": `${COVER_URL}/diamond-seeker.png`,
    "url": "diamond-seeker.html",
    "author": "Yandex"
  },
  {
    "id": 387,
    "name": "Draw Joust",
    "cover": `${COVER_URL}/draw-joust.png`,
    "url": "draw-joust.html",
    "author": "Yandex"
  },
  {
    "id": 388,
    "name": "Evolving Bombs 3D",
    "cover": `${COVER_URL}/evolving-bombs-3d.png`,
    "url": "evolving-bombs-3d.html",
    "author": "Yandex"
  },
  {
    "id": 389,
    "name": "Fire and Frost Master",
    "cover": `${COVER_URL}/fire-and-frost-master.png`,
    "url": "fire-and-frost-master.html",
    "author": "Yandex"
  },
  {
    "id": 390,
    "name": "Fitness Empire",
    "cover": `${COVER_URL}/fitness-empire.png`,
    "url": "fitness-empire.html",
    "author": "Yandex"
  },
  {
    "id": 391,
    "name": "Flick Goal",
    "cover": `${COVER_URL}/flick-goal.png`,
    "url": "flick-goal.html",
    "author": "Yandex"
  },
  {
    "id": 392,
    "name": "Flip Master",
    "cover": `${COVER_URL}/flip-master.png`,
    "url": "flip-master.html",
    "author": "Yandex"
  },
  {
    "id": 393,
    "name": "Giant Wanted",
    "cover": `${COVER_URL}/giant-wanted.png`,
    "url": "giant-wanted.html",
    "author": "Yandex"
  },
  {
    "id": 394,
    "name": "Gun Clone",
    "cover": `${COVER_URL}/gun-clone.png`,
    "url": "gun-clone.html",
    "author": "Yandex"
  },
  {
    "id": 395,
    "name": "Gun Runner",
    "cover": `${COVER_URL}/gun-runner.png`,
    "url": "gun-runner.html",
    "author": "Yandex"
  },
  {
    "id": 396,
    "name": "Kaji Run",
    "cover": `${COVER_URL}/kaji-run.png`,
    "url": "kaji-run.html",
    "author": "Yandex"
  },
  {
    "id": 397,
    "name": "Make a SuperBoat",
    "cover": `${COVER_URL}/make-a-superboat.png`,
    "url": "make-a-superboat.html",
    "author": "Yandex"
  },
  {
    "id": 398,
    "name": "Makeover Run",
    "cover": `${COVER_URL}/makeover-run.png`,
    "url": "makeover-run.html",
    "author": "Yandex"
  },
  {
    "id": 399,
    "name": "Mega Car Jumps",
    "cover": `${COVER_URL}/mega-car-jumps.png`,
    "url": "mega-car-jumps.html",
    "author": "Yandex"
  },
  {
    "id": 400,
    "name": "Money Rush",
    "cover": `${COVER_URL}/money-rush.png`,
    "url": "money-rush.html",
    "author": "Yandex"
  },
  {
    "id": 401,
    "name": "Monster Box 3D",
    "cover": `${COVER_URL}/monster-box-3d.png`,
    "url": "monster-box-3d.html",
    "author": "Yandex"
  },
  {
    "id": 402,
    "name": "Office Fight",
    "cover": `${COVER_URL}/office-fight.png`,
    "url": "office-fight.html",
    "author": "Yandex"
  },
  {
    "id": 403,
    "name": "Robot Invasion",
    "cover": `${COVER_URL}/robot-invasion.png`,
    "url": "robot-invasion.html",
    "author": "Yandex"
  },
  {
    "id": 404,
    "name": "Seat Jam 3D",
    "cover": `${COVER_URL}/seat-jam-3d.png`,
    "url": "seat-jam-3d.html",
    "author": "Yandex"
  },
  {
    "id": 405,
    "name": "Shooting Master",
    "cover": `${COVER_URL}/shooting-master.png`,
    "url": "shooting-master.html",
    "author": "Yandex"
  },
  {
    "id": 406,
    "name": "Supermarket 3D",
    "cover": `${COVER_URL}/supermarket-3d.png`,
    "url": "supermarket-3d.html",
    "author": "Yandex"
  },
  {
    "id": 407,
    "name": "Survive to Victory",
    "cover": `${COVER_URL}/survive-to-victory.png`,
    "url": "survive-to-victory.html",
    "author": "Yandex"
  },
  {
    "id": 408,
    "name": "Telekinesis Attack",
    "cover": `${COVER_URL}/telekinesis-attack.png`,
    "url": "telekinesis-attack.html",
    "author": "Yandex"
  },
  {
    "id": 409,
    "name": "Telekinesis Car",
    "cover": `${COVER_URL}/telekinesis-car.png`,
    "url": "telekinesis-car.html",
    "author": "Yandex"
  },
  {
    "id": 410,
    "name": "Telekinesis Drive",
    "cover": `${COVER_URL}/telekinesis-drive.png`,
    "url": "telekinesis-drive.html",
    "author": "Yandex"
  },
  {
    "id": 411,
    "name": "Telekinesis",
    "cover": `${COVER_URL}/telekinesis.png`,
    "url": "telekinesis.html",
    "author": "Yandex"
  },
  {
    "id": 412,
    "name": "Triple Match 3D",
    "cover": `${COVER_URL}/triple-match-3d.png`,
    "url": "triple-match-3d.html",
    "author": "Yandex"
  },
  {
    "id": 413,
    "name": "Tug of War with Cars",
    "cover": `${COVER_URL}/tug-of-war-with-cars.png`,
    "url": "tug-of-war-with-cars.html",
    "author": "Yandex"
  },
  {
    "id": 414,
    "name": "Twerk Race 3D",
    "cover": `${COVER_URL}/twerk-race-3d.png`,
    "url": "twerk-race-3d.html",
    "author": "Yandex"
  },
  {
    "id": 415,
    "name": "Twisted Rope 3D",
    "cover": `${COVER_URL}/twisted-rope-3d.png`,
    "url": "twisted-rope-3d.html",
    "author": "Yandex"
  },
  {
    "id": 416,
    "name": "Wall Crawler",
    "cover": `${COVER_URL}/wall-crawler.png`,
    "url": "wall-crawler.html",
    "author": "Yandex"
  },
  {
    "id": 417,
    "name": "War Regions",
    "cover": `${COVER_URL}/war-regions.png`,
    "url": "war-regions.html",
    "author": "Yandex"
  },
  {
    "id": 418,
    "name": "Weapon Craft Run",
    "cover": `${COVER_URL}/weapon-craft-run.png`,
    "url": "weapon-craft-run.html",
    "author": "Yandex"
  },
  {
    "id": 419,
    "name": "Weapon Upgrade Rush",
    "cover": `${COVER_URL}/weapon-upgrade-rush.png`,
    "url": "weapon-upgrade-rush.html",
    "author": "Yandex"
  },
  {
    "id": 420,
    "name": "Weapon Scale",
    "cover": `${COVER_URL}/weapon-scale.png`,
    "url": "weapon-scale.html",
    "author": "Yandex"
  },
  {
    "id": 421,
    "name": "Rich Run 3D",
    "cover": `${COVER_URL}/rich-run-3d.png`,
    "url": "rich-run-3d.html",
    "author": "Yandex"
  },
  {
    "id": 422,
    "name": "High Heels",
    "cover": `${COVER_URL}/high-heels.png`,
    "url": "high-heels.html",
    "author": "Yandex"
  },
  {
    "id": 423,
    "name": "WebFishing",
    "cover": `${COVER_URL}/webfishing.png`,
    "url": "webfishing.html",
    "author": "LameDev",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 426,
    "name": "Andy's Apple Farm",
    "cover": `${COVER_URL}/andys-apple-farm.png`,
    "url": "andys-apple-farm.html",
    "author": "M36games",
    "special": ["port"]
  },
  {
    "id": 427,
    "name": "OMORI",
    "cover": `${COVER_URL}/omori.png`,
    "url": "omori.html",
    "author": "Omocat",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 428,
    "name": "Five Nights at Freddy's 4: Halloween",
    "cover": `${COVER_URL}/five-nights-at-freddys-4-halloween.png`,
    "url": "five-nights-at-freddys-4-halloween.html",
    "author": "Scott Cawthon",
    "special": ["port"]
  },
  {
    "id": 429,
    "name": "Code Editor",
    "cover": `${COVER_URL}/code-editor.png`,
    "url": "code-editor.html",
    "author": "gn-math",
    "special": ["tools"]
  },
  {
    "id": 430,
    "name": "10 Minutes Till Dawn",
    "cover": `${COVER_URL}/10-minutes-till-dawn.png`,
    "url": "10-minutes-till-dawn.html",
    "author": "flanne"
  },
  {
    "id": 431,
    "name": "99 Balls",
    "cover": `${COVER_URL}/99-balls.png`,
    "url": "99-balls.html",
    "author": "Diamond Games"
  },
  {
    "id": 432,
    "name": "Abandoned",
    "cover": `${COVER_URL}/abandoned.png`,
    "url": "abandoned.html",
    "author": "krutovig"
  },
  {
    "id": 433,
    "name": "Yume Nikki",
    "cover": `${COVER_URL}/yume-nikki.png`,
    "url": "yume-nikki.html",
    "author": "kikiyama",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 434,
    "name": "God's Flesh",
    "cover": `${COVER_URL}/gods-flesh.png`,
    "url": "gods-flesh.html",
    "author": "Glompyy"
  },
  {
    "id": 435,
    "name": "A Small World Cup",
    "cover": `${COVER_URL}/a-small-world-cup.png`,
    "url": "a-small-world-cup.html",
    "author": "rujogames"
  },
  {
    "id": 436,
    "name": "Awesome Tanks",
    "cover": `${COVER_URL}/awesome-tanks.png`,
    "url": "awesome-tanks.html",
    "author": "coolmathgames"
  },
  {
    "id": 437,
    "name": "Bouncemasters",
    "cover": `${COVER_URL}/bouncemasters.png`,
    "url": "bouncemasters.html",
    "author": "Azur Games, Playgendary"
  },
  {
    "id": 438,
    "name": "Awesome Tanks 2",
    "cover": `${COVER_URL}/awesome-tanks-2.png`,
    "url": "awesome-tanks-2.html",
    "author": "coolmathgames"
  },
  {
    "id": 439,
    "name": "Bank Robbery 2",
    "cover": `${COVER_URL}/bank-robbery-2.png`,
    "url": "bank-robbery-2.html",
    "author": "justaliendev"
  },
  {
    "id": 440,
    "name": "Celeste PICO",
    "cover": `${COVER_URL}/celeste-pico.png`,
    "url": "celeste-pico.html",
    "author": "Matt Thorson and Noel Berry"
  },
  {
    "id": 441,
    "name": "Kitty Toy",
    "cover": `${COVER_URL}/kitty-toy.png`,
    "url": "kitty-toy.html",
    "author": "Rakqoi"
  },
  {
    "id": 442,
    "name": "Infinimoes",
    "cover": `${COVER_URL}/infinimoes.png`,
    "url": "infinimoes.html",
    "author": "Werxzy"
  },
  {
    "id": 443,
    "name": "Adventure Drivers",
    "cover": `${COVER_URL}/adventure-drivers.png`,
    "url": "adventure-drivers.html",
    "author": "Domas Kazragis"
  },
  {
    "id": 444,
    "name": "Ages of Conflict",
    "cover": `${COVER_URL}/ages-of-conflict.png`,
    "url": "ages-of-conflict.html",
    "author": "JoySpark Games"
  },
  {
    "id": 445,
    "name": "Kindergarten",
    "cover": `${COVER_URL}/kindergarten.png`,
    "url": "kindergarten.html",
    "author": "Con Man Games, SmashGames and Sean Young",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 446,
    "name": "Kindergarten 2",
    "cover": `${COVER_URL}/kindergarten-2.png`,
    "url": "kindergarten-2.html",
    "author": "Con Man Games, SmashGames and Sean Young",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 447,
    "name": "Nijika's Ahoge",
    "cover": `${COVER_URL}/nijikas-ahoge.png`,
    "url": "nijikas-ahoge.html",
    "author": "TamaniDamani"
  },
  {
    "id": 448,
    "name": "Aquapark.io",
    "cover": `${COVER_URL}/aquaparkio.png`,
    "url": "aquaparkio.html",
    "author": "Voodoo"
  },
  {
    "id": 449,
    "name": "City Smash",
    "cover": `${COVER_URL}/city-smash.png`,
    "url": "city-smash.html",
    "author": "Paradyme Games"
  },
  {
    "id": 450,
    "name": "Amanda the Adventurer",
    "cover": `${COVER_URL}/amanda-the-adventurer.png`,
    "url": "amanda-the-adventurer.html",
    "author": "MANGLEDmaw Games, DreadXP",
    "special": ["port"]
  },
  {
    "id": 451,
    "name": "Slender: The 8 Pages",
    "cover": `${COVER_URL}/slender-the-8-pages.png`,
    "url": "slender-the-8-pages.html",
    "author": "Parsec Productions",
    "special": ["port"]
  },
  {
    "id": 452,
    "name": "Station 141",
    "cover": `${COVER_URL}/station-141.png`,
    "url": "station-141.html",
    "author": "Maksim Chmutov"
  },
  {
    "id": 453,
    "name": "Station Saturn",
    "cover": `${COVER_URL}/station-saturn.png`,
    "url": "station-saturn.html",
    "author": "Maksim Chmutov"
  },
  {
    "id": 454,
    "name": "BLOODMONEY!",
    "cover": `${COVER_URL}/bloodmoney.png`,
    "url": "bloodmoney.html",
    "author": "SHROOMYCHRIST-STUDIOS",
    "special": ["port"]
  },
  {
    "id": 455,
    "name": "BERGENTRUCK 201x",
    "cover": `${COVER_URL}/bergentruck-201x.png`,
    "url": "bergentruck-201x.html",
    "author": "Paledoptera",
    "special": ["port"]
  },
  {
    "id": 456,
    "name": "Undertale Yellow",
    "cover": `${COVER_URL}/undertale-yellow.png`,
    "url": "undertale-yellow.html",
    "author": "Team Undertale Yellow",
    "special": ["port"]
  },
  {
    "id": 457,
    "name": "Raft",
    "cover": `${COVER_URL}/raft.png`,
    "url": "raft.html",
    "author": "Redbeet Interactive, Axolot Games, Ashen Arrow",
    "special": ["port"]
  },
  {
    "id": 458,
    "name": "The Deadseat",
    "cover": `${COVER_URL}/the-deadseat.png`,
    "url": "the-deadseat.html",
    "author": "Curious Fox Sox",
    "special": ["port"]
  },
  {
    "id": 459,
    "name": "The Man In The Window",
    "cover": `${COVER_URL}/the-man-in-the-window.png`,
    "url": "the-man-in-the-window.html",
    "author": "Zed Technician",
    "special": ["port"]
  },
  {
    "id": 460,
    "name": "Fears to Fathom: Home Alone",
    "cover": `${COVER_URL}/fears-to-fathom-home-alone.png`,
    "url": "fears-to-fathom-home-alone.html",
    "author": "Rayll",
    "special": ["port"]
  },
  {
    "id": 461,
    "name": "Slither.io",
    "cover": `${COVER_URL}/slitherio.png`,
    "url": "slitherio.html",
    "author": "slither.io"
  },
  {
    "id": 462,
    "name": "DEAD PLATE",
    "cover": `${COVER_URL}/dead-plate.png`,
    "url": "dead-plate.html",
    "author": "racheldrawsthis",
    "special": ["port"]
  },
  {
    "id": 463,
    "name": "Lacey's Flash Games",
    "cover": `${COVER_URL}/laceys-flash-games.png`,
    "url": "laceys-flash-games.html",
    "author": "ghosttundra, Euroclipse, Brand New Groove",
    "special": ["port"]
  },
  {
    "id": 464,
    "name": "Choppy Orc",
    "cover": `${COVER_URL}/choppy-orc.png`,
    "url": "choppy-orc.html",
    "author": "eddynardo"
  },
  {
    "id": 465,
    "name": "Cuphead",
    "cover": `${COVER_URL}/cuphead.png`,
    "url": "cuphead.html",
    "author": "Studio MDHR Entertainment Inc",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 466,
    "name": "Baldi's Basics Classic Remastered",
    "cover": `${COVER_URL}/baldis-basics-classic-remastered.png`,
    "url": "baldis-basics-classic-remastered.html",
    "author": "Basically Games",
    "special": ["port"]
  },
  {
    "id": 467,
    "name": "Baldi's Basics Plus",
    "cover": `${COVER_URL}/baldis-basics-plus.png`,
    "url": "baldis-basics-plus.html",
    "author": "Basically Games",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 468,
    "name": "Hollow Knight",
    "cover": `${COVER_URL}/hollow-knight.png`,
    "url": "hollow-knight.html",
    "author": "Team Cherry",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 469,
    "name": "sandstone",
    "cover": `${COVER_URL}/sandstone.png`,
    "url": "sandstone.html",
    "author": "ading2210",
    "special": ["tools"]
  },
  {
    "id": 470,
    "name": "Doodle Jump",
    "cover": `${COVER_URL}/doodle-jump.png`,
    "url": "doodle-jump.html",
    "author": "Marko Pusenjak"
  },
  {
    "id": 471,
    "name": "Madness Combat: Project Nexus (classic)",
    "cover": `${COVER_URL}/madness-combat-project-nexus-classic.png`,
    "url": "madness-combat-project-nexus-classic.html",
    "author": "Krinkels, The-Swain, cheshyre, Luis, Rebel666",
    "special": ["flash"]
  },
  {
    "id": 472,
    "name": "Bad Time Simulator",
    "cover": `${COVER_URL}/bad-time-simulator.png`,
    "url": "bad-time-simulator.html",
    "author": "jcw87"
  },
  {
    "id": 473,
    "name": "Spacebar Clicker",
    "cover": `${COVER_URL}/spacebar-clicker.png`,
    "url": "spacebar-clicker.html",
    "author": "Bruno Croci"
  },
  {
    "id": 474,
    "name": "Friday Night Funkin': V.S. Whitty",
    "cover": `${COVER_URL}/friday-night-funkin-vs-whitty.png`,
    "url": "friday-night-funkin-vs-whitty.html",
    "author": "Nate Anim8"
  },
  {
    "id": 475,
    "name": "Friday Night Funkin': B-Sides",
    "cover": `${COVER_URL}/friday-night-funkin-b-sides.png`,
    "url": "friday-night-funkin-b-sides.html",
    "author": "Rozebud"
  },
  {
    "id": 476,
    "name": "Friday Night Funkin': Vs. Hex",
    "cover": `${COVER_URL}/friday-night-funkin-vs-hex.png`,
    "url": "friday-night-funkin-vs-hex.html",
    "author": "YingYang48 etc"
  },
  {
    "id": 477,
    "name": "Friday Night Funkin': Vs. Hatsune Miku",
    "cover": `${COVER_URL}/friday-night-funkin-vs-hatsune-miku.png`,
    "url": "friday-night-funkin-vs-hatsune-miku.html",
    "author": "evidal etc"
  },
  {
    "id": 478,
    "name": "Friday Night Funkin': Neo",
    "cover": `${COVER_URL}/friday-night-funkin-neo.png`,
    "url": "friday-night-funkin-neo.html",
    "author": "JellyFishedm etc"
  },
  {
    "id": 479,
    "name": "Steal A Brainrot",
    "cover": `${COVER_URL}/steal-a-brainrot.png`,
    "url": "steal-a-brainrot.html",
    "author": "nagami games"
  },
  {
    "id": 480,
    "name": "Friday Night Funkin': Sarvente's Mid-Fight Masses",
    "cover": `${COVER_URL}/friday-night-funkin-sarventes-mid-fight-masses.png`,
    "url": "friday-night-funkin-sarventes-mid-fight-masses.html",
    "author": "Dokki.doodlez etc"
  },
  {
    "id": 481,
    "name": "Friday Night Funkin': vs. Tricky",
    "cover": `${COVER_URL}/friday-night-funkin-vs-tricky.png`,
    "url": "friday-night-funkin-vs-tricky.html",
    "author": "Banbuds etc"
  },
  {
    "id": 482,
    "name": "Human Expenditure Program",
    "cover": `${COVER_URL}/human-expenditure-program.png`,
    "url": "human-expenditure-program.html",
    "author": "SHROOMYCHRIST-STUDIOS",
    "special": ["port"]
  },
  {
    "id": 483,
    "name": "Friday Night Funkin': Hit Single Real",
    "cover": `${COVER_URL}/friday-night-funkin-hit-single-real.png`,
    "url": "friday-night-funkin-hit-single-real.html",
    "author": "Sturm/Churgney Gurgney etc"
  },
  {
    "id": 484,
    "name": "Friday Night Funkin': Creepypasta JP",
    "cover": `${COVER_URL}/friday-night-funkin-creepypasta-jp.png`,
    "url": "friday-night-funkin-creepypasta-jp.html",
    "author": "CPJP Team"
  },
  {
    "id": 485,
    "name": "Friday Night Funkin': vs. Garcello",
    "cover": `${COVER_URL}/friday-night-funkin-vs-garcello.png`,
    "url": "friday-night-funkin-vs-garcello.html",
    "author": "atsuover etc"
  },
  {
    "id": 486,
    "name": "Friday Night Funkin': Sonic Legacy",
    "cover": `${COVER_URL}/friday-night-funkin-sonic-legacy.png`,
    "url": "friday-night-funkin-sonic-legacy.html",
    "author": "JoeDoughBoi etc"
  },
  {
    "id": 487,
    "name": "Friday Night Funkin': vs. QT",
    "cover": `${COVER_URL}/friday-night-funkin-vs-qt.png`,
    "url": "friday-night-funkin-vs-qt.html",
    "author": "Hazardous24 etc"
  },
  {
    "id": 488,
    "name": "Friday Night Funkin': Mistful Crimson Morning Reboot",
    "cover": `${COVER_URL}/friday-night-funkin-mistful-crimson-morning-reboot.png`,
    "url": "friday-night-funkin-mistful-crimson-morning-reboot.html",
    "author": "Stonesteve etc"
  },
  {
    "id": 489,
    "name": "Friday Night Funkin': Indie Cross",
    "cover": `${COVER_URL}/friday-night-funkin-indie-cross.png`,
    "url": "friday-night-funkin-indie-cross.html",
    "author": "MORØ etc"
  },
  {
    "id": 490,
    "name": "Rooftop Snipers 2",
    "cover": `${COVER_URL}/rooftop-snipers-2.png`,
    "url": "rooftop-snipers-2.html",
    "author": "Neweichgames"
  },
  {
    "id": 491,
    "name": "I woke up next to you again.",
    "cover": `${COVER_URL}/i-woke-up-next-to-you-again.png`,
    "url": "i-woke-up-next-to-you-again.html",
    "author": "angela he"
  },
  {
    "id": 492,
    "name": "UNDERWHEELS",
    "cover": `${COVER_URL}/underwheels.png`,
    "url": "underwheels.html",
    "author": "LakenDaCoda"
  },
  {
    "id": 493,
    "name": "RigBMX",
    "cover": `${COVER_URL}/rigbmx.png`,
    "url": "rigbmx.html",
    "author": "Cartoon Network"
  },
  {
    "id": 494,
    "name": "RigBMX 2",
    "cover": `${COVER_URL}/rigbmx-2.png`,
    "url": "rigbmx-2.html",
    "author": "Cartoon Network"
  },
  {
    "id": 495,
    "name": "groon groon, babey!",
    "cover": `${COVER_URL}/groon-groon-babey.png`,
    "url": "groon-groon-babey.html",
    "author": "tanner bananer"
  },
  {
    "id": 496,
    "name": "Friday Night Funkin': Jeffy's Endless Aethos",
    "cover": `${COVER_URL}/friday-night-funkin-jeffys-endless-aethos.png`,
    "url": "friday-night-funkin-jeffys-endless-aethos.html",
    "author": "jeffyfansml99 etc"
  },
  {
    "id": 497,
    "name": "Friday Night Funkin': vs. BOPCITY",
    "cover": `${COVER_URL}/friday-night-funkin-vs-bopcity.png`,
    "url": "friday-night-funkin-vs-bopcity.html",
    "author": "Daniel Hummus"
  },
  {
    "id": 498,
    "name": "Friday Night Funkin': 17 Bucks: Floor 1",
    "cover": `${COVER_URL}/friday-night-funkin-17-bucks-floor-1.png`,
    "url": "friday-night-funkin-17-bucks-floor-1.html",
    "author": "Peacocok6k"
  },
  {
    "id": 499,
    "name": "Friday Night Funkin': FIRE IN THE HOLE: Lobotomy Dash Funkin'",
    "cover": `${COVER_URL}/friday-night-funkin-fire-in-the-hole-lobotomy-dash.png`,
    "url": "friday-night-funkin-fire-in-the-hole-lobotomy-dash.html",
    "author": "CoolDudeCrafter"
  },
  {
    "id": 500,
    "name": "Friday Night Funkin': TWIDDLEFINGER",
    "cover": `${COVER_URL}/friday-night-funkin-twiddlefinger.png`,
    "url": "friday-night-funkin-twiddlefinger.html",
    "author": "MAXPROLOVER998"
  },
  {
    "id": 501,
    "name": "Kindergarten 3",
    "cover": `${COVER_URL}/kindergarten-3.png`,
    "url": "kindergarten-3.html",
    "author": "Con Man Games, SmashGames and Sean Young",
    "special": ["port"]
  },
  {
    "id": 502,
    "name": "Stick With It",
    "cover": `${COVER_URL}/stick-with-it.png`,
    "url": "stick-with-it.html",
    "author": "Sam Hogan",
    "special": ["port"]
  },
  {
    "id": 503,
    "name": "Five Nights at Candy's",
    "cover": `${COVER_URL}/five-nights-at-candys.png`,
    "url": "five-nights-at-candys.html",
    "author": "Emil \"Ace\" Macko",
    "special": ["port"]
  },
  {
    "id": 504,
    "name": "Five Nights at Candy's 2",
    "cover": `${COVER_URL}/five-nights-at-candys-2.png`,
    "url": "five-nights-at-candys-2.html",
    "author": "Emil \"Ace\" Macko",
    "special": ["port"]
  },
  {
    "id": 505,
    "name": "Pokemon Red",
    "cover": `${COVER_URL}/pokemon-red.png`,
    "url": "pokemon-red.html",
    "author": "Nintendo",
    "special": ["emulator"]
  },
  {
    "id": 506,
    "name": "Pokemon Emerald",
    "cover": `${COVER_URL}/pokemon-emerald.png`,
    "url": "pokemon-emerald.html",
    "author": "Nintendo",
    "special": ["emulator"]
  },
  {
    "id": 507,
    "name": "The Impossible Quiz",
    "cover": `${COVER_URL}/the-impossible-quiz.png`,
    "url": "the-impossible-quiz.html",
    "author": "SPLAPP-ME-DO",
    "special": ["flash"]
  },
  {
    "id": 508,
    "name": "Super Mario Bros",
    "cover": `${COVER_URL}/super-mario-bros.png`,
    "url": "super-mario-bros.html",
    "author": "Nintendo",
    "special": ["emulator"]
  },
  {
    "id": 509,
    "name": "Friday Night Funkin’ Soft",
    "cover": `${COVER_URL}/friday-night-funkin-soft.png`,
    "url": "friday-night-funkin-soft.html",
    "author": "ShiniTrexx etc"
  },
  {
    "id": 510,
    "name": "Tomodachi Collection",
    "cover": `${COVER_URL}/tomodachi-collection.png`,
    "url": "tomodachi-collection.html",
    "author": "Nintendo",
    "special": ["emulator"]
  },
  {
    "id": 511,
    "name": "Doge Miner",
    "cover": `${COVER_URL}/doge-miner.png`,
    "url": "doge-miner.html",
    "author": "rkn"
  },
  {
    "id": 512,
    "name": "Final Earth 2",
    "cover": `${COVER_URL}/final-earth-2.png`,
    "url": "final-earth-2.html",
    "author": "flori9"
  },
  {
    "id": 513,
    "name": "Swordfight!!",
    "cover": `${COVER_URL}/swordfight.png`,
    "url": "swordfight.html",
    "author": "Studio-19"
  },
  {
    "id": 514,
    "name": "PortaBoy+",
    "cover": `${COVER_URL}/portaboy.png`,
    "url": "portaboy.html",
    "author": "Enchae, Lumpy"
  },
  {
    "id": 515,
    "name": "PacMan (Horror)",
    "cover": `${COVER_URL}/pacman-horror.png`,
    "url": "pacman-horror.html",
    "author": "BerickCook"
  },
  {
    "id": 516,
    "name": "Oshi Oshi Punch!",
    "cover": `${COVER_URL}/oshi-oshi-punch.png`,
    "url": "oshi-oshi-punch.html",
    "author": "Empty House Games, Shuu"
  },
  {
    "id": 517,
    "name": "Nubby's Number Factory",
    "cover": `${COVER_URL}/nubbys-number-factory.png`,
    "url": "nubbys-number-factory.html",
    "author": "MogDogBlog Productions",
    "special": ["port"]
  },
  {
    "id": 518,
    "name": "Touhou: Luminous Strike",
    "cover": `${COVER_URL}/touhou-luminous-strike.png`,
    "url": "touhou-luminous-strike.html",
    "author": "NitNitori, LadyEbony"
  },
  {
    "id": 519,
    "name": "Generic Fighter Maybe",
    "cover": `${COVER_URL}/generic-fighter-maybe.png`,
    "url": "generic-fighter-maybe.html",
    "author": "Astrobard Games, Khao Mortadios"
  },
  {
    "id": 520,
    "name": "Dan The Man",
    "cover": `${COVER_URL}/dan-the-man.png`,
    "url": "dan-the-man.html",
    "author": "Halfbrick Studios"
  },
  {
    "id": 521,
    "name": "Bust a Loop",
    "cover": `${COVER_URL}/bust-a-loop.png`,
    "url": "bust-a-loop.html",
    "author": "PeachTreeOath"
  },
  {
    "id": 522,
    "name": "Bad Monday Simulator",
    "cover": `${COVER_URL}/bad-monday-simulator.png`,
    "url": "bad-monday-simulator.html",
    "author": "Lumpy, Spasco"
  },
  {
    "id": 523,
    "name": "Touhou Mother",
    "cover": `${COVER_URL}/touhou-mother.png`,
    "url": "touhou-mother.html",
    "author": "vgperson",
    "special": ["port"]
  },
  {
    "id": 524,
    "name": "Parappa The Rapper",
    "cover": `${COVER_URL}/parappa-the-rapper.png`,
    "url": "parappa-the-rapper.html",
    "author": "NanaOn-Sha",
    "special": ["emulator"]
  },
  {
    "id": 525,
    "name": "Friday Night Funkin': Darkness Takeover",
    "cover": `${COVER_URL}/friday-night-funkin-darkness-takeover.png`,
    "url": "friday-night-funkin-darkness-takeover.html",
    "author": "MiniSymba"
  },
  {
    "id": 526,
    "name": "SpongeBob SquarePants: Land Ho!",
    "cover": `${COVER_URL}/spongebob-squarepants-land-ho.png`,
    "url": "spongebob-squarepants-land-ho.html",
    "author": "Nickelodeon"
  },
  {
    "id": 527,
    "name": "SpongeBob SquarePants: SpongeBob Run",
    "cover": `${COVER_URL}/spongebob-squarepants-spongebob-run.png`,
    "url": "spongebob-squarepants-spongebob-run.html",
    "author": "Nickelodeon"
  },
  {
    "id": 528,
    "name": "SpongeBob SquarePants: Squidward's Sizzlin' Scare",
    "cover": `${COVER_URL}/spongebob-squarepants-squidwards-sizzlin-scare.png`,
    "url": "spongebob-squarepants-squidwards-sizzlin-scare.html",
    "author": "Nickelodeon"
  },
  {
    "id": 529,
    "name": "SpongeBob SquarePants: Sandy's Sponge Stacker",
    "cover": `${COVER_URL}/spongebob-squarepants-sandys-sponge-stacker.png`,
    "url": "spongebob-squarepants-sandys-sponge-stacker.html",
    "author": "Nickelodeon"
  },
  {
    "id": 530,
    "name": "SpongeBob SquarePants: Tasty Pastry Party",
    "cover": `${COVER_URL}/spongebob-squarepants-tasty-pastry-party.png`,
    "url": "spongebob-squarepants-tasty-pastry-party.html",
    "author": "Nickelodeon"
  },
  {
    "id": 531,
    "name": "SpongeBob SquarePants: The Kah-Ray-Tay Squid",
    "cover": `${COVER_URL}/spongebob-squarepants-the-kah-ray-tay-squid.png`,
    "url": "spongebob-squarepants-the-kah-ray-tay-squid.html",
    "author": "Nickelodeon"
  },
  {
    "id": 532,
    "name": "SpongeBob SquarePants: WereSquirrel",
    "cover": `${COVER_URL}/spongebob-squarepants-weresquirrel.png`,
    "url": "spongebob-squarepants-weresquirrel.html",
    "author": "Nickelodeon"
  },
  {
    "id": 533,
    "name": "SpongeBob SquarePants: Krabby Katch",
    "cover": `${COVER_URL}/spongebob-squarepants-krabby-katch.png`,
    "url": "spongebob-squarepants-krabby-katch.html",
    "author": "Nickelodeon"
  },
  {
    "id": 534,
    "name": "Teen Titans GO!: Jump Jousts",
    "cover": `${COVER_URL}/teen-titans-go-jump-jousts.png`,
    "url": "teen-titans-go-jump-jousts.html",
    "author": "Cartoon Network"
  },
  {
    "id": 535,
    "name": "Teen Titans GO!: Jump Jousts 2",
    "cover": `${COVER_URL}/teen-titans-go-jump-jousts-2.png`,
    "url": "teen-titans-go-jump-jousts-2.html",
    "author": "Cartoon Network"
  },
  {
    "id": 536,
    "name": "Cat Connection",
    "cover": `${COVER_URL}/cat-connection.png`,
    "url": "cat-connection.html",
    "author": "MOSTLY MAD PRODUCTIONS"
  },
  {
    "id": 537,
    "name": "Cat Gunner: Super Zombie Shoot",
    "cover": `${COVER_URL}/cat-gunner-super-zombie-shoot.png`,
    "url": "cat-gunner-super-zombie-shoot.html",
    "author": "Poki"
  },
  {
    "id": 538,
    "name": "Love Letters",
    "cover": `${COVER_URL}/love-letters.png`,
    "url": "love-letters.html",
    "author": "Nozomu Games"
  },
  {
    "id": 539,
    "name": "Chiikawa Puzzle",
    "cover": `${COVER_URL}/chiikawa-puzzle.png`,
    "url": "chiikawa-puzzle.html",
    "author": "emptygamer"
  },
  {
    "id": 540,
    "name": "myTeardrop",
    "cover": `${COVER_URL}/myteardrop.png`,
    "url": "myteardrop.html",
    "author": "VENDORMINT"
  },
  {
    "id": 541,
    "name": "Friday Night Funkin': Pibby: Apocalypse",
    "cover": `${COVER_URL}/friday-night-funkin-pibby-apocalypse.png`,
    "url": "friday-night-funkin-pibby-apocalypse.html",
    "author": "BAUDASlel etc."
  },
  {
    "id": 542,
    "name": "Karlson",
    "cover": `${COVER_URL}/karlson.png`,
    "url": "karlson.html",
    "author": "DaniDev",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 543,
    "name": "Jelly Drift",
    "cover": `${COVER_URL}/jelly-drift.png`,
    "url": "jelly-drift.html",
    "author": "DaniDev",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 544,
    "name": "Plinko",
    "cover": `${COVER_URL}/plinko.png`,
    "url": "plinko.html",
    "author": "Anson Heung"
  },
  {
    "id": 545,
    "name": "Clash Of Vikings",
    "cover": `${COVER_URL}/clash-of-vikings.png`,
    "url": "clash-of-vikings.html",
    "author": "unknown"
  },
  {
    "id": 546,
    "name": "Recoil",
    "cover": `${COVER_URL}/recoil.png`,
    "url": "recoil.html",
    "author": "Martin Magini"
  },
  {
    "id": 547,
    "name": "Baseball Bros",
    "cover": `${COVER_URL}/baseball-bros.png`,
    "url": "baseball-bros.html",
    "author": "Blue Wizard"
  },
  {
    "id": 548,
    "name": "Football Bros",
    "cover": `${COVER_URL}/football-bros.png`,
    "url": "football-bros.html",
    "author": "Blue Wizard"
  },
  {
    "id": 549,
    "name": "Sonic the Hedgehog 2: Community's Cut",
    "cover": `${COVER_URL}/sonic-the-hedgehog-2-communitys-cut.png`,
    "url": "sonic-the-hedgehog-2-communitys-cut.html",
    "author": "heyjoeway and SEGA"
  },
  {
    "id": 550,
    "name": "Sonic the Hedgehog 3: Angel Island Remastered",
    "cover": `${COVER_URL}/sonic-the-hedgehog-3-angel-island-remastered.png`,
    "url": "sonic-the-hedgehog-3-angel-island-remastered.html",
    "author": "Eukaryot3K and SEGA"
  },
  {
    "id": 551,
    "name": "Hypper Sandbox",
    "cover": `${COVER_URL}/hypper-sandbox.png`,
    "url": "hypper-sandbox.html",
    "author": "VobbyGames, weirdnessworld"
  },
  {
    "id": 552,
    "name": "Aviamasters",
    "cover": `${COVER_URL}/aviamasters.png`,
    "url": "aviamasters.html",
    "author": "BGaming"
  },
  {
    "id": 553,
    "name": "Rolling Sky",
    "cover": `${COVER_URL}/rolling-sky.png`,
    "url": "rolling-sky.html",
    "author": "Dream Playz"
  },
  {
    "id": 554,
    "name": "Yandere Simulator",
    "cover": `${COVER_URL}/yandere-simulator.png`,
    "url": "yandere-simulator.html",
    "author": "YandereDev",
    "special": ["port"]
  },
  {
    "id": 555,
    "name": "Friday Night Funkin VS. KAPI",
    "cover": `${COVER_URL}/friday-night-funkin-vs-kapi.png`,
    "url": "friday-night-funkin-vs-kapi.html",
    "author": "paperkitty etc"
  },
  {
    "id": 556,
    "name": "Friday Night Funkin VS. Sky",
    "cover": `${COVER_URL}/friday-night-funkin-vs-sky.png`,
    "url": "friday-night-funkin-vs-sky.html",
    "author": "Alexander0110 etc"
  },
  {
    "id": 557,
    "name": "Getting Over It with Bennett Foddy",
    "cover": `${COVER_URL}/getting-over-it-with-bennett-foddy.png`,
    "url": "getting-over-it-with-bennett-foddy.html",
    "author": "Bennett Foddy",
    "special": ["port"]
  },
  {
    "id": 558,
    "name": "Friday Night Funkin Vs. Cyber Sensation",
    "cover": `${COVER_URL}/friday-night-funkin-vs-cyber-sensation.png`,
    "url": "friday-night-funkin-vs-cyber-sensation.html",
    "author": "Taeyai"
  },
  {
    "id": 559,
    "name": "Friday Night Funkin vs Shaggy",
    "cover": `${COVER_URL}/friday-night-funkin-vs-shaggy.png`,
    "url": "friday-night-funkin-vs-shaggy.html",
    "author": "srPerez etc"
  },
  {
    "id": 560,
    "name": "Deltatraveler",
    "cover": `${COVER_URL}/deltatraveler.png`,
    "url": "deltatraveler.html",
    "author": "VyletBunni",
    "special": ["port"]
  },
  {
    "id": 561,
    "name": "BitGun.io",
    "cover": `${COVER_URL}/bitgunio.png`,
    "url": "bitgunio.html",
    "author": "Hazmob"
  },
  {
    "id": 562,
    "name": "Boom Slingers: Reboom",
    "cover": `${COVER_URL}/boom-slingers-reboom.png`,
    "url": "boom-slingers-reboom.html",
    "author": "Boom Corp"
  },
  {
    "id": 563,
    "name": "CG FC 25",
    "cover": `${COVER_URL}/cg-fc-25.png`,
    "url": "cg-fc-25.html",
    "author": "Finz Games"
  },
  {
    "id": 564,
    "name": "Count Masters: Stickman Games",
    "cover": `${COVER_URL}/count-masters-stickman-games.png`,
    "url": "count-masters-stickman-games.html",
    "author": "FreePlay LLC"
  },
  {
    "id": 565,
    "name": "Dalgona Candy Honeycomb Cookie",
    "cover": `${COVER_URL}/dalgona-candy-honeycomb-cookie.png`,
    "url": "dalgona-candy-honeycomb-cookie.html",
    "author": "CrazyGames"
  },
  {
    "id": 567,
    "name": "Highway Racer",
    "cover": `${COVER_URL}/highway-racer.png`,
    "url": "highway-racer.html",
    "author": "CrazyGames"
  },
  {
    "id": 568,
    "name": "Highway Racer 2 REMASTERED",
    "cover": `${COVER_URL}/highway-racer-2-remastered.png`,
    "url": "highway-racer-2-remastered.html",
    "author": "CrazyGames"
  },
  {
    "id": 569,
    "name": "Hula Hoop Race",
    "cover": `${COVER_URL}/hula-hoop-race.png`,
    "url": "hula-hoop-race.html",
    "author": "CrazyGames"
  },
  {
    "id": 570,
    "name": "Jelly Restaurant",
    "cover": `${COVER_URL}/jelly-restaurant.png`,
    "url": "jelly-restaurant.html",
    "author": "CrazyGames"
  },
  {
    "id": 571,
    "name": "Layers Roll",
    "cover": `${COVER_URL}/layers-roll.png`,
    "url": "layers-roll.html",
    "author": "CrazyGames"
  },
  {
    "id": 572,
    "name": "Lazy Jumper",
    "cover": `${COVER_URL}/lazy-jumper.png`,
    "url": "lazy-jumper.html",
    "author": "CrazyGames"
  },
  {
    "id": 573,
    "name": "Man Runner 2048",
    "cover": `${COVER_URL}/man-runner-2048.png`,
    "url": "man-runner-2048.html",
    "author": "CrazyGames"
  },
  {
    "id": 574,
    "name": "Pottery Master",
    "cover": `${COVER_URL}/pottery-master.png`,
    "url": "pottery-master.html",
    "author": "CrazyGames"
  },
  {
    "id": 575,
    "name": "Shovel 3D",
    "cover": `${COVER_URL}/shovel-3d.png`,
    "url": "shovel-3d.html",
    "author": "CrazyGames"
  },
  {
    "id": 576,
    "name": "Sky Riders",
    "cover": `${COVER_URL}/sky-riders.png`,
    "url": "sky-riders.html",
    "author": "CrazyGames"
  },
  {
    "id": 577,
    "name": "Steal Brainrot Online",
    "cover": `${COVER_URL}/steal-brainrot-online.png`,
    "url": "steal-brainrot-online.html",
    "author": "CrazyGames"
  },
  {
    "id": 578,
    "name": "Stickman and Guns",
    "cover": `${COVER_URL}/stickman-and-guns.png`,
    "url": "stickman-and-guns.html",
    "author": "CrazyGames"
  },
  {
    "id": 579,
    "name": "Super Star Car",
    "cover": `${COVER_URL}/super-star-car.png`,
    "url": "super-star-car.html",
    "author": "CrazyGames"
  },
  {
    "id": 580,
    "name": "Traffic Rider",
    "cover": `${COVER_URL}/traffic-rider.png`,
    "url": "traffic-rider.html",
    "author": "CrazyGames"
  },
  {
    "id": 581,
    "name": "BuildNow.gg",
    "cover": `${COVER_URL}/buildnowgg.png`,
    "url": "buildnowgg.html",
    "author": "CrazyGames"
  },
  {
    "id": 582,
    "name": "Friday Night Funkin': Mario's Madness",
    "cover": `${COVER_URL}/friday-night-funkin-marios-madness.png`,
    "url": "friday-night-funkin-marios-madness.html",
    "author": "Dewott2501 etc"
  },
  {
    "id": 583,
    "name": "Friday Night Funkin' vs Hypno Lullaby",
    "cover": `${COVER_URL}/friday-night-funkin-vs-hypno-lullaby.png`,
    "url": "friday-night-funkin-vs-hypno-lullaby.html",
    "author": "Hypno Lullaby Team"
  },
  {
    "id": 584,
    "name": "Stone Grass Mowing Simulator",
    "cover": `${COVER_URL}/stone-grass-mowing-simulator.png`,
    "url": "stone-grass-mowing-simulator.html",
    "author": "CrazyGames"
  },
  {
    "id": 585,
    "name": "Fallout",
    "cover": `${COVER_URL}/fallout.png`,
    "url": "fallout.html",
    "author": "Bethesda Softworks",
    "special": ["port"]
  },
  {
    "id": 586,
    "name": "The Oregon Trail",
    "cover": `${COVER_URL}/the-oregon-trail.png`,
    "url": "the-oregon-trail.html",
    "author": "MECC"
  },
  {
    "id": 587,
    "name": "Newgrounds Rumble",
    "cover": `${COVER_URL}/newgrounds-rumble.png`,
    "url": "newgrounds-rumble.html",
    "author": "NegativeONE, Luis, MindChamber",
    "special": ["flash"]
  },
  {
    "id": 588,
    "name": "Super Mario 64",
    "cover": `${COVER_URL}/super-mario-64.png`,
    "url": "super-mario-64.html",
    "author": "Nintendo",
    "special": ["port"]
  },
  {
    "id": 589,
    "name": "Sonic CD",
    "cover": `${COVER_URL}/sonic-cd.png`,
    "url": "sonic-cd.html",
    "author": "SEGA",
    "special": ["port"]
  },
  {
    "id": 590,
    "name": "Sonic Mania",
    "cover": `${COVER_URL}/sonic-mania.png`,
    "url": "sonic-mania.html",
    "author": "SEGA",
    "special": ["port"]
  },
  {
    "id": 591,
    "name": "Slime Rancher",
    "cover": `${COVER_URL}/slime-rancher.png`,
    "url": "slime-rancher.html",
    "author": "Monomi Park, Ported by Snubby.top",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 592,
    "name": "Pac Man World",
    "cover": `${COVER_URL}/pac-man-world.png`,
    "url": "pac-man-world.html",
    "author": "Full Fat Games",
    "special": ["emulator"]
  },
  {
    "id": 593,
    "name": "Pac Man World 2",
    "cover": `${COVER_URL}/pac-man-world-2.png`,
    "url": "pac-man-world-2.html",
    "author": "Full Fat Games",
    "special": ["emulator"]
  },
  {
    "id": 594,
    "name": "Waterworks!",
    "cover": `${COVER_URL}/waterworks.png`,
    "url": "waterworks.html",
    "author": "scriptwelder"
  },
  {
    "id": 595,
    "name": "Shapez.io",
    "cover": `${COVER_URL}/shapezio.png`,
    "url": "shapezio.html",
    "author": "scriptwelder"
  },
{
    "id": 596,
    "name": "",
    "cover": ``,
    "url": "",
    "author": "Gzh0821",      // ← Added comma
    "special": ["emulator"],   // ← Added comma
    "featured": true
},
  {
    "id": 597,
    "name": "Plants vs. Zombies 2 Gardenless",
    "cover": `${COVER_URL}/plants-vs-zombies-2-gardenless.png`,
    "url": "plants-vs-zombies-2-gardenless.html",
    "author": "Gzh0821"
  },
  {
    "id": 598,
    "name": "Sonic.EXE",
    "cover": `${COVER_URL}/sonicexe.png`,
    "url": "sonicexe.html",
    "author": " Cinossu",
    "special": ["emulator"]
  },
  {
    "id": 599,
    "name": "Metal Gear Solid",
    "cover": `${COVER_URL}/metal-gear-solid.png`,
    "url": "metal-gear-solid.html",
    "author": " Konami Computer Entertainment Japan",
    "special": ["emulator"]
  },
  {
    "id": 600,
    "name": "FNF Vs. Hypno's Lullaby v2",
    "cover": `${COVER_URL}/fnf-vs-hypnos-lullaby-v2.png`,
    "url": "fnf-vs-hypnos-lullaby-v2.html",
    "author": "Hypno's Lullaby Team",
    "special": ["fnf"]
  },
  {
    "id": 601,
    "name": "FNF Vs. Sonic.EXE 3.0/4.0",
    "cover": `${COVER_URL}/fnf-vs-sonicexe-3040.png`,
    "url": "fnf-vs-sonicexe-3040.html",
    "author": "FNF Vs. Sonic.EXE Team",
    "special": ["fnf"]
  },
  {
    "id": 602,
    "name": "Doom 2",
    "cover": `${COVER_URL}/doom-2.png`,
    "url": "doom-2.html",
    "author": "id Software",
    "special": ["emulator"]
  },
  {
    "id": 603,
    "name": "Growden.io",
    "cover": `${COVER_URL}/growdenio.png`,
    "url": "growdenio.html",
    "author": "growden.io"
  },
  {
    "id": 604,
    "name": "Minesweeper Plus",
    "cover": `${COVER_URL}/minesweeper-plus.png`,
    "url": "minesweeper-plus.html",
    "author": "Jorel Simpson",
    "special": ["port"]
  },
  {
    "id": 605,
    "name": "Schoolboy Runaway",
    "cover": `${COVER_URL}/schoolboy-runaway.png`,
    "url": "schoolboy-runaway.html",
    "author": "Linked Squad",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 606,
    "name": "Sonic.EXE (ORIGINAL)",
    "cover": `${COVER_URL}/sonicexe-original.png`,
    "url": "sonicexe-original.html",
    "author": "MY5TCrimson",
    "special": ["port"]
  },
  {
    "id": 607,
    "name": "Tattletail",
    "cover": `${COVER_URL}/tattletail.png`,
    "url": "tattletail.html",
    "author": "Waygetter Electronics, Ported by Snubby.top",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 608,
    "name": "Friday Night Funkin VS Impostor v4",
    "cover": `${COVER_URL}/friday-night-funkin-vs-impostor-v4.png`,
    "url": "friday-night-funkin-vs-impostor-v4.html",
    "author": "Imposter v4 team",
    "special": ["fnf"]
  },
  {
    "id": 609,
    "name": "Friday Night Funkin vs Sunday Remastered HD",
    "cover": `${COVER_URL}/friday-night-funkin-vs-sunday-remastered-hd.png`,
    "url": "friday-night-funkin-vs-sunday-remastered-hd.html",
    "author": "Sunday Remastered team",
    "special": ["fnf"]
  },
  {
    "id": 610,
    "name": "Friday Night Funkin vs Carol V2",
    "cover": `${COVER_URL}/friday-night-funkin-vs-carol-v2.png`,
    "url": "friday-night-funkin-vs-carol-v2.html",
    "author": "Carol V2 team",
    "special": ["fnf"]
  },
  {
    "id": 611,
    "name": "The Legend of Zelda Ocarina of Time",
    "cover": `${COVER_URL}/the-legend-of-zelda-ocarina-of-time.png`,
    "url": "the-legend-of-zelda-ocarina-of-time.html",
    "author": "Nintendo",
    "special": ["emulator","n64"]
  },
  {
    "id": 612,
    "name": "The Legend of Zelda Majora's Mask",
    "cover": `${COVER_URL}/the-legend-of-zelda-majoras-mask.png`,
    "url": "the-legend-of-zelda-majoras-mask.html",
    "author": "Nintendo",
    "special": ["emulator","n64"]
  },
  {
    "id": 613,
    "name": "Friday Night Funkin' Drop and Roll, but Playable",
    "cover": `${COVER_URL}/friday-night-funkin-drop-and-roll-but-playable.png`,
    "url": "friday-night-funkin-drop-and-roll-but-playable.html",
    "author": "Drop and roll team",
    "special": ["fnf"]
  },
  {
    "id": 614,
    "name": "Toy Rider",
    "cover": `${COVER_URL}/toy-rider.png`,
    "url": "toy-rider.html",
    "author": "CrazyGames"
  },
  {
    "id": 615,
    "name": "Friday Night Funkin Vs. Dave and Bambi v3",
    "cover": `${COVER_URL}/friday-night-funkin-vs-dave-and-bambi-v3.png`,
    "url": "friday-night-funkin-vs-dave-and-bambi-v3.html",
    "author": "Dave and Bambi team",
    "special": ["fnf"]
  },
  {
    "id": 616,
    "name": "Friday Night Funkin’ Wednesday's Infidelity",
    "cover": `${COVER_URL}/friday-night-funkin-wednesdays-infidelity.png`,
    "url": "friday-night-funkin-wednesdays-infidelity.html",
    "author": "Wednesday's Infidelity team",
    "special": ["fnf"]
  },
  {
    "id": 617,
    "name": "Postal",
    "cover": `${COVER_URL}/postal.png`,
    "url": "postal.html",
    "author": "Stinkalistic, Running With Scissors"
  },
  {
    "id": 618,
    "name": "FNF vs Bob v2.0 (Bob’s Onslaught)",
    "cover": `${COVER_URL}/fnf-vs-bob-v20-bobs-onslaught.png`,
    "url": "fnf-vs-bob-v20-bobs-onslaught.html",
    "author": "bob v2.0 team",
    "special": ["fnf"]
  },
  {
    "id": 619,
    "name": "Friday Night Funkin': Rev-Mixed",
    "cover": `${COVER_URL}/friday-night-funkin-rev-mixed.png`,
    "url": "friday-night-funkin-rev-mixed.html",
    "author": "Rev-Mixed team",
    "special": ["fnf"]
  },
  {
    "id": 620,
    "name": "Three Goblets",
    "cover": `${COVER_URL}/three-goblets.png`,
    "url": "three-goblets.html",
    "author": "Adventale"
  },
  {
    "id": 621,
    "name": "Friday Night Funkin': Gumballs",
    "cover": `${COVER_URL}/friday-night-funkin-gumballs.png`,
    "url": "friday-night-funkin-gumballs.html",
    "author": "Gumballs team",
    "special": ["fnf"]
  },
  {
    "id": 622,
    "name": "Oneshot (LEGACY)",
    "cover": `${COVER_URL}/oneshot-legacy.png`,
    "url": "oneshot-legacy.html",
    "author": "Future Cat LLC, ARandomPerson",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 623,
    "name": "Celeste",
    "cover": `${COVER_URL}/celeste.png`,
    "url": "celeste.html",
    "author": "MaddyMakesGames, Mercury Workshop",
    "special": ["port"],
    "featured": true
  },
  {
    "id": 624,
    "name": "Happy Wheels",
    "cover": `${COVER_URL}/happy-wheels.png`,
    "url": "happy-wheels.html",
    "author": "Jim Bonacci"
  },
  {
    "id": 625,
    "name": "Get Yoked",
    "cover": `${COVER_URL}/get-yoked.png`,
    "url": "get-yoked.html",
    "author": "gregs games"
  },
  {
    "id": 626,
    "name": "Doom 3",
    "cover": `${COVER_URL}/doom-3.png`,
    "url": "doom-3.html",
    "author": "id Software, 98corbins",
    "special": ["port"]
  },
  {
    "id": 627,
    "name": "Tag",
    "cover": `${COVER_URL}/tag.png`,
    "url": "tag.html",
    "author": "WeLoPlay"
  },
  {
    "id": 628,
    "name": "Pizza Tower: Scoutdigo",
    "cover": `${COVER_URL}/pizza-tower-scoutdigo.png`,
    "url": "pizza-tower-scoutdigo.html",
    "author": "only1indigo, burnedpopcorn",
    "special": ["port"]
  },
  {
    "id": 629,
    "name": "Off",
    "cover": `${COVER_URL}/off.png`,
    "url": "off.html",
    "author": "Mortis Ghost, Fangamer"
  },
  {
    "id": 630,
    "name": "Space Funeral",
    "cover": `${COVER_URL}/space-funeral.png`,
    "url": "space-funeral.html",
    "author": "Stephen Gillmurphy"
  },
  {
    "id": 631,
    "name": "Endroll",
    "cover": `${COVER_URL}/endroll.png`,
    "url": "endroll.html",
    "author": " Segawa"
  },
  {
    "id": 632,
    "name": "Cave Story",
    "cover": `${COVER_URL}/cave-story.png`,
    "url": "cave-story.html",
    "author": " Daisuke 'Pixel' Amaya"
  },
  {
    "id": 633,
    "name": "Friday Night Funkin': VS. Impostor: Alternated",
    "cover": `${COVER_URL}/friday-night-funkin-vs-impostor-alternated.png`,
    "url": "friday-night-funkin-vs-impostor-alternated.html",
    "author": "Alternated team",
    "special": ["fnf"]
  },
  {
    "id": 634,
    "name": "Friday Night Funkin': Chaos Nightmare - Sonic Vs. Fleetway",
    "cover": `${COVER_URL}/friday-night-funkin-chaos-nightmare---sonic-vs-fle.png`,
    "url": "friday-night-funkin-chaos-nightmare---sonic-vs-fle.html",
    "author": "Fleetway team",
    "special": ["fnf"]
  },
  {
    "id": 635,
    "name": "Spelunky Classic HD",
    "cover": `${COVER_URL}/spelunky-classic-hd.png`,
    "url": "spelunky-classic-hd.html",
    "author": " nkrapivin"
  },
  {
    "id": 636,
    "name": "Friday Night Funkin' D-Sides",
    "cover": `${COVER_URL}/friday-night-funkin-d-sides.png`,
    "url": "friday-night-funkin-d-sides.html",
    "author": "d-sides team",
    "special": ["fnf"]
  },
  {
    "id": 637,
    "name": "BFDIA 5b",
    "cover": `${COVER_URL}/bfdia-5b.png`,
    "url": "bfdia-5b.html",
    "author": "Cary Huang",
    "special": ["flash"]
  },
  {
    "id": 638,
    "name": "BFDIA 5b: 5*30",
    "cover": `${COVER_URL}/bfdia-5b-530.png`,
    "url": "bfdia-5b-530.html",
    "author": "Mawilite, Cary Huang",
    "special": ["flash"]
  },
  {
    "id": 639,
    "name": "Friday Night Funkin' VS Impostor B-Sides",
    "cover": `${COVER_URL}/friday-night-funkin-vs-impostor-b-sides.png`,
    "url": "friday-night-funkin-vs-impostor-b-sides.html",
    "author": "Imposter b-sides team",
    "special": ["fnf"]
  },
  {
    "id": 640,
    "name": "Mutilate a Doll 2",
    "cover": `${COVER_URL}/mutilate-a-doll-2.png`,
    "url": "mutilate-a-doll-2.html",
    "author": "SilverGames",
    "special": ["flash"]
  },
  {
    "id": 641,
    "name": "Godzilla Daikaiju Battle Royale",
    "cover": `${COVER_URL}/godzilla-daikaiju-battle-royale.png`,
    "url": "godzilla-daikaiju-battle-royale.html",
    "author": "AWM Studio Productions LLC",
    "special": ["flash"]
  },
 {
    "id": 642,
    "name": "Into Space 3",
    "cover": `${COVER_URL}/SPACE3.png`,
    "url": "Into Space 3.html",
    "author": "AWM Studio Productions LLC",
    "special": ["flash"]
  },
  {
    "id": 643,
    "name": "Into Space 2",
    "cover": `${COVER_URL}/SPACE2.jpg`,
    "url": "Into Space 2.html",
    "author": "AWM Studio Productions LLC",
    "special": ["flash"]
  },
  {
    "id": 644,
    "name": "Into Space",
    "cover": `${COVER_URL}/gointospace1.PNG`,
    "url": "Into Space.html",
    "author": "AWM Studio Productions LLC",
    "special": ["flash"]
  }
       
];


// ============================================
// IMAGE LOADING WITH FALLBACKS
// ============================================

function loadImageWithFallback(imgElement, coverFile, gameName) {
    const urls = CDN_CONFIG.getAllCoverURLs(coverFile);
    let currentIndex = 0;
    
    function tryNextURL() {
        if (currentIndex < urls.length) {
            imgElement.src = urls[currentIndex];
            currentIndex++;
        } else {
            // All URLs failed - show placeholder
            showPlaceholder(imgElement, gameName);
        }
    }
    
    function showPlaceholder(img, name) {
        // Create a canvas-based placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 160, 120);
        gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--accentDark') || '#cc0000');
        gradient.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#ff0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 160, 120);
        
        // Game name initial or emoji
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name ? name.charAt(0).toUpperCase() : '🎮', 80, 60);
        
        img.src = canvas.toDataURL();
        img.classList.add('placeholder-generated');
    }
    
    imgElement.onerror = tryNextURL;
    tryNextURL();
}

// ============================================
// GAME LOADING WITH CDN FALLBACKS
// ============================================

async function loadGameWithFallback(filename, title) {
    console.log('loadGame called with:', filename, title);
    
    const loader = document.getElementById('game-loader');
    const container = document.getElementById('game-container');
    const frame = document.getElementById('game-frame');
    const gameTitle = document.getElementById('currentGameTitle');
    
    // Show loading
    if (gameTitle) gameTitle.textContent = title;
    if (loader) loader.style.display = 'flex';
    if (container) container.style.display = 'none';
    
    // Get all possible URLs
    const urls = CDN_CONFIG.getAllContentURLs(filename);
    
    let htmlContent = null;
    let successUrl = null;
    
    // Try each CDN
    for (const url of urls) {
        try {
            console.log(`Trying to load game from: ${url}`);
            const response = await fetch(url);
            
            if (response.ok) {
                htmlContent = await response.text();
                successUrl = url;
                console.log(`✓ Game loaded from: ${url}`);
                break;
            }
        } catch (e) {
            console.warn(`✗ Failed to load from: ${url}`);
            continue;
        }
    }
    
    if (!htmlContent) {
        // All sources failed
        if (loader) loader.style.display = 'none';
        alert(`Unable to load "${title}". Your network may be blocking game content.\n\nTry:\n• Using mobile data\n• A different network\n• Asking IT to unblock cdn.jsdelivr.net`);
        return;
    }
    
    // Create blob and load
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    
    frame.onload = function() {
        console.log('Game loaded successfully');
        if (loader) loader.style.display = 'none';
        if (container) container.style.display = 'block';
    };
    
    frame.onerror = function(e) {
        console.error('Frame error:', e);
        if (loader) loader.style.display = 'none';
        if (container) container.style.display = 'block';
    };
    
    frame.src = blobUrl;
    
    // Fallback timeout
    setTimeout(function() {
        if (loader && loader.style.display !== 'none') {
            loader.style.display = 'none';
            if (container) container.style.display = 'block';
        }
    }, 8000);
}

// ============================================
// BACKGROUND TEMPLATES WITH FALLBACKS
// ============================================

async function fetchBackgroundTemplatesWithFallback() {
    // GitHub API endpoints to try
    const apiEndpoints = [
        'https://api.github.com/repos/ProjectApex1243/Backrounds/contents/',
        // Could add proxy endpoints here if needed
    ];
    
    for (const endpoint of apiEndpoints) {
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                // Get backgrounds with CDN fallback URLs
                return data
                    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
                    .map(file => ({
                        name: file.name.replace(/\.[^.]+$/, ''),
                        // Provide multiple URLs for fallback
                        urls: [
                            file.download_url,
                            `https://cdn.jsdelivr.net/gh/ProjectApex1243/Backrounds@master/${file.name}`,
                            `https://rawcdn.githack.com/ProjectApex1243/Backrounds/master/${file.name}`,
                            `https://cdn.statically.io/gh/ProjectApex1243/Backrounds@master/${file.name}`
                        ],
                        url: file.download_url,
                        fullName: file.name
                    }));
            }
        } catch (e) {
            console.warn(`Failed to fetch backgrounds from ${endpoint}:`, e);
            continue;
        }
    }
    
    console.error('All background API endpoints blocked');
    return [];
}

// Modified background template loader
async function populateBackgroundTemplatesWithFallback() {
    const container = document.getElementById('backgroundTemplates');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-text">Loading backgrounds...</div>';
    
    const backgrounds = await fetchBackgroundTemplatesWithFallback();
    
    if (backgrounds.length === 0) {
        container.innerHTML = `
            <p style="color: #ccc; text-align: center;">
                Unable to load backgrounds<br>
                <small>Network may be blocking GitHub API</small>
            </p>
        `;
        return;
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; width: 100%;">';
    
    backgrounds.forEach(bg => {
        // Store all URLs in data attribute for fallback
        const urlsJson = JSON.stringify(bg.urls).replace(/"/g, '&quot;');
        html += `
            <div class="bg-template-item" 
                 onclick="applyBackgroundWithFallback(${urlsJson}, '${bg.fullName}')" 
                 title="${bg.name}">
                <img src="${bg.url}" 
                     alt="${bg.name}" 
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='${bg.urls[1] || bg.url}'">
                <div class="bg-template-label">${bg.name}</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function applyBackgroundWithFallback(urls, fileName) {
    // Try each URL until one works
    let currentIndex = 0;
    
    function tryNextURL() {
        if (currentIndex >= urls.length) {
            showSaveNotification('Failed to load background - network restricted');
            return;
        }
        
        const img = new Image();
        img.onload = function() {
            document.body.style.backgroundImage = `url('${urls[currentIndex]}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
            localStorage.setItem('customBackground', urls[currentIndex]);
            localStorage.setItem('customBackgroundName', fileName);
            showSaveNotification(`Background applied: ${fileName}`);
        };
        img.onerror = function() {
            currentIndex++;
            tryNextURL();
        };
        img.src = urls[currentIndex];
    }
    
    tryNextURL();
}

// ============================================
// INITIALIZATION WITH CDN DETECTION
// ============================================

async function initializeWithCDNDetection() {
    console.log('=== School-Safe Initialization ===');
    
    // Test and find working CDNs
    await findWorkingCDN();
    await findWorkingCoverCDN();
    
    // Update game covers to use working CDN
    if (CDN_CONFIG.workingCoverCDN) {
        GAMES_JSON.forEach(game => {
            if (game.coverFile) {
                game.cover = getCoverWithFallback(game.coverFile);
            }
        });
    }
    
    console.log('CDN Detection complete:');
    console.log('  Content CDN:', CDN_CONFIG.workingCDN?.name || 'Using fallbacks');
    console.log('  Cover CDN:', CDN_CONFIG.workingCoverCDN?.name || 'Using fallbacks');
}

// ============================================
// EXPORT / GLOBAL ACCESS
// ============================================

// Make functions globally accessible
window.loadGameWithFallback = loadGameWithFallback;
window.loadImageWithFallback = loadImageWithFallback;
window.applyBackgroundWithFallback = applyBackgroundWithFallback;
window.populateBackgroundTemplatesWithFallback = populateBackgroundTemplatesWithFallback;
window.initializeWithCDNDetection = initializeWithCDNDetection;
window.CDN_CONFIG = CDN_CONFIG;

// Override the original loadGame if it exists
if (typeof window.loadGame === 'undefined') {
    window.loadGame = loadGameWithFallback;
}

// Run CDN detection on load
document.addEventListener('DOMContentLoaded', initializeWithCDNDetection);

console.log('✓ School-Safe loader initialized');
console.log('  Multiple CDN fallbacks enabled');
console.log('  Image fallback system ready');
