// ==========================================
// 异世界铁匠铺 Ver 0.126 - Part 1 (基础配置)
// ==========================================

let audioCtx = null;
document.addEventListener('click', () => { 
    if(!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    if(audioCtx.state === 'suspended') { audioCtx.resume(); }
}, { once: true });

function playSound(type) {
    if(!gameState.soundEnabled || !audioCtx || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'coin') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'craft') {
        osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'roll') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(300 + Math.random() * 500, now);
        gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'success') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(554.37, now + 0.1); osc.frequency.setValueAtTime(659.25, now + 0.2);
        gain.gain.setValueAtTime(0.15, now); gain.gain.linearRampToValueAtTime(0, now + 0.5); osc.start(now); osc.stop(now + 0.5);
    }
}

const EXP_REQ =[20, 50, 120, 250, 500, 9999]; 
const ELEMENTS =["无属性", "🔥火焰", "❄️寒冰", "⚡雷电", "✨神圣", "🌑暗影"];
const AFFIX_POOL =["✦ 力量+5", "✦ 敏捷+5", "✦ 智力+5", "✦ 吸血+5%", "✦ 暴击率+8%", "✦ 对魔物增伤+15%", "✦ 攻速+10%", "✦ 护甲穿透+10"];

const RAW_DB = {
    copper_ore: { name: '铜矿石', basePrice: 5, type: 'ingot', lv: 1 },
    iron_ore: { name: '铁矿石', basePrice: 15, type: 'ingot', lv: 5 },
    steel_ore: { name: '钢矿石', basePrice: 40, type: 'ingot', lv: 10 },
    mithril_ore: { name: '秘银矿', basePrice: 100, type: 'ingot', lv: 15 },
    adamantite_ore: { name: '精金矿', basePrice: 250, type: 'ingot', lv: 20 },
    
    wood: { name: '原木', basePrice: 5, type: 'handle', lv: 1 },
    ash_wood: { name: '白蜡木', basePrice: 20, type: 'handle', lv: 5 },
    oak_wood: { name: '橡木', basePrice: 50, type: 'handle', lv: 10 },
    ironwood: { name: '铁杉木', basePrice: 120, type: 'handle', lv: 15 },
    world_tree: { name: '世界树枝', basePrice: 300, type: 'handle', lv: 20 },
    
    coarse_cloth: { name: '粗布', basePrice: 8, type: 'fabric', lv: 1 },
    linen: { name: '亚麻布', basePrice: 25, type: 'fabric', lv: 5 },
    cotton: { name: '棉布', basePrice: 60, type: 'fabric', lv: 10 },
    elven_silk: { name: '精灵丝绸', basePrice: 150, type: 'fabric', lv: 15 },
    starweave: { name: '星辰纱', basePrice: 400, type: 'fabric', lv: 20 },
    
    rabbit_pelt: { name: '兔皮', basePrice: 10, type: 'leather', lv: 1 },
    sheep_pelt: { name: '羊皮', basePrice: 30, type: 'leather', lv: 5 },
    wolf_pelt: { name: '狼皮', basePrice: 80, type: 'leather', lv: 10 },
    drake_scale: { name: '亚龙皮', basePrice: 200, type: 'leather', lv: 15 },
    dragon_scale: { name: '巨龙鳞', basePrice: 500, type: 'leather', lv: 20 },
    
    fire_crystal: { name: '火之结晶', basePrice: 500, type: 'enchant', element: '🔥火焰' },
    ice_crystal: { name: '冰霜之心', basePrice: 500, type: 'enchant', element: '❄️寒冰' },
    holy_tear: { name: '天使之泪', basePrice: 1000, type: 'enchant', element: '✨神圣' }
};

const BP_DB = {
    iron_pan: { id: 'iron_pan', category: 'tool', name: "平底锅", req: { ingot: 1 }, time: 1, basePrice: 25, cost: 0 },
    iron_hoe: { id: 'iron_hoe', category: 'tool', name: "农用铁锄", req: { ingot: 1, handle: 1 }, time: 1, basePrice: 35, cost: 0 },
    hunting_trap: { id: 'hunting_trap', category: 'tool', name: "捕兽夹", req: { ingot: 2 }, time: 1, basePrice: 50, cost: 10 },
    leather_bag: { id: 'leather_bag', category: 'tool', name: "冒险行囊", req: { leather: 2 }, time: 2, basePrice: 80, cost: 15 },
    
    basic_sword: { id: 'basic_sword', category: 'weapon', lv: 1, name: "制式单手剑", req: { ingot: 4, handle: 2 }, time: 8, stats: {atk: 10, def: 0, spd: -2}, cost: 30, classes:['战士', '骑士'] },
    greatsword: { id: 'greatsword', category: 'weapon', lv: 5, name: "重型大剑", req: { ingot: 8, handle: 3 }, time: 16, stats: {atk: 25, def: 0, spd: -8}, cost: 80, classes:['战士'] },
    rapier: { id: 'rapier', category: 'weapon', lv: 4, name: "刺客细剑", req: { ingot: 3, handle: 1, leather: 1 }, time: 10, stats: {atk: 12, def: 0, spd: 15}, cost: 60, classes:['盗贼', '游侠'] },
    staff: { id: 'staff', category: 'weapon', lv: 1, name: "法师长杖", req: { handle: 4, fabric: 2 }, time: 12, stats: {atk: 5, def: 0, spd: 5}, cost: 50, classes:['法师', '牧师'] },
    
    light_armor: { id: 'light_armor', category: 'armor', lv: 1, name: "轻型皮甲", req: { leather: 5, ingot: 1 }, time: 14, stats: {atk: 0, def: 15, spd: 5}, cost: 60, classes:['盗贼', '游侠'] },
    robe: { id: 'robe', category: 'armor', lv: 2, name: "法师长袍", req: { fabric: 6 }, time: 12, stats: {atk: 0, def: 10, spd: 2}, cost: 50, classes:['法师', '牧师'] },
    heavy_shield: { id: 'heavy_shield', category: 'armor', lv: 1, name: "骑士塔盾", req: { ingot: 6, handle: 2 }, time: 18, stats: {atk: 0, def: 35, spd: -10}, cost: 100, classes:['骑士'] }
};

const P_NAMES = { ingot: '金属锭', handle: '木柄', fabric: '布料', leather: '熟皮', enchant: '灵能宝石' };
const Q_NAMES =['普通', '精良', '稀有', '传说'];
const NPC_NAMES =["镇长", "大妈", "农夫", "酒馆老板", "猎人"];

const ADV_TEMPLATES =[
    { name: "莱恩", class: "战士", race: "人类", emoji: "👱‍♂️", gold: 3000, level: 1, talent: 1.0 },
    { name: "格罗姆", class: "战士", race: "矮人", emoji: "🪓", gold: 4000, level: 2, talent: 1.3 },
    { name: "亚瑟", class: "骑士", race: "人类", emoji: "🛡️", gold: 5000, level: 2, talent: 1.1 },
    { name: "奥塔", class: "骑士", race: "兽人", emoji: "🐗", gold: 8000, level: 3, talent: 1.5 },
    { name: "影", class: "盗贼", race: "小人族", emoji: "🥷", gold: 6000, level: 1, talent: 1.1 },
    { name: "杰克", class: "盗贼", race: "人类", emoji: "🗡️", gold: 2000, level: 1, talent: 1.0 },
    { name: "琉", class: "游侠", race: "精灵", emoji: "🧝‍♀️", gold: 5000, level: 2, talent: 1.3 },
    { name: "阿妮亚", class: "游侠", race: "兽人", emoji: "🐱", gold: 3500, level: 1, talent: 1.2 },
    { name: "里维莉雅", class: "法师", race: "黑精灵", emoji: "🧙‍♀️", gold: 15000, level: 3, talent: 1.5 },
    { name: "伊兰", class: "法师", race: "人类", emoji: "👩‍🎓", gold: 12000, level: 1, talent: 1.6 },
    { name: "艾莉丝", class: "牧师", race: "人类", emoji: "👩‍⚕️", gold: 4500, level: 2, talent: 1.2 },
    { name: "卡尔", class: "牧师", race: "矮人", emoji: "🧔", gold: 7000, level: 3, talent: 1.0 }
];

const DUNGEONS =[
    { id: 1, level: 1, name: "第一层: 哥布林洞窟", reqCp: 250, isExplored: false, element: "🔥火焰", dropLv: 1, dropKeys:['copper_ore', 'wood', 'coarse_cloth', 'rabbit_pelt'], expCost: 2000 },
    { id: 2, level: 2, name: "第二层: 废弃矿坑", reqCp: 600, isExplored: false, element: "🌍大地", dropLv: 5, dropKeys:['iron_ore', 'ash_wood', 'linen', 'sheep_pelt'], expCost: 4000 },
    { id: 3, level: 3, name: "第三层: 幽暗密林", reqCp: 1200, isExplored: false, element: "⚡雷电", dropLv: 10, dropKeys:['steel_ore', 'oak_wood', 'cotton', 'wolf_pelt'], expCost: 8000 },
    { id: 4, level: 4, name: "第四层: 猩红修道院", reqCp: 2400, isExplored: false, element: "✨神圣", dropLv: 15, dropKeys:['mithril_ore', 'ironwood', 'elven_silk', 'drake_scale'], expCost: 20000 },
    { id: 5, level: 5, name: "第五层: 巨龙之巢", reqCp: 4000, isExplored: false, element: "🌑暗影", dropLv: 20, dropKeys:['adamantite_ore', 'world_tree', 'starweave', 'dragon_scale'], expCost: 50000 }
];

let gameState = {
    gold: 1500, reputation: 0, time: { week: 1, day: 1, hour: 8 }, luck: 1.0, soundEnabled: true,
    town: { level: 1, toolsSold: 0, bounties: 0, daysPassed: 0 },
    inventory: { raw: {}, parts:[] }, market: [], adventurers:[], toolShelf: {}, shelf:[null, null, null, null], acquisitionSlots: [null, null], guildOrders: [],
    unlockedBPs:['iron_pan', 'iron_hoe', 'basic_sword', 'staff'], 
    workbench: { targetBP: 'iron_pan', partsHeld:[], enchantHeld: null },
    expedition: { active: false, status: null, targetId: null, sponsorGold: 0, members:[], reqMembers: 2, timer: 0 }, 
    isPaused: true, autoPauseOnTaskEnd: false, selectingOrderIndex: null,
    workState: { isWorking: false, task: null, bpId: null, timeReq: 0, timePassed: 0, partsUsed:[], enchantUsed: null, rawKey: null },
    player: { name: "主角", skills: { ingot:{lv:0,exp:0}, handle:{lv:0,exp:0}, fabric:{lv:0,exp:0}, leather:{lv:0,exp:0}, assemble:{lv:0,exp:0} } },
    apprentices:[], apprenticeCost: 1000, partCounter: 0, weaponCounter: 0, minigame: { active: false, intervalId: null }
};

function safeRender(id, func) { try { let el = document.getElementById(id); if (el) func(el); } catch (e) { console.error(`Render Error [${id}]:`, e); } }
function toggleSound() { gameState.soundEnabled = !gameState.soundEnabled; updateUI(); }
function log(msg, type = 'internal') {
    const box = document.getElementById(`log-${type}`); if (!box) return;
    box.insertAdjacentHTML('afterbegin', `<div><span style="color:#555">[第${gameState.time.week}周 ${gameState.time.day}日 ${gameState.time.hour}:00]</span> ${msg}</div>`);
    if (box.childElementCount > 50) box.removeChild(box.lastChild);
}
function showEventModal(title, desc, rewardsHtml) {
    gameState.isPaused = true; 
    let tEl = document.getElementById('event-title'); let dEl = document.getElementById('event-desc'); let rDiv = document.getElementById('event-rewards'); let mEl = document.getElementById('event-modal');
    if(tEl) tEl.innerText = title; if(dEl) dEl.innerHTML = desc;
    if(rDiv) { if (rewardsHtml) { rDiv.style.display = 'block'; rDiv.innerHTML = rewardsHtml; } else { rDiv.style.display = 'none'; } }
    if(mEl) mEl.style.display = 'flex'; updateUI();
}
function closeEventModal() { let mEl = document.getElementById('event-modal'); if(mEl) mEl.style.display = 'none'; }
function gainExp(entity, skillType) {
    let sk = entity.skills[skillType];
    if (sk && sk.lv < 5) { sk.exp++; if (sk.exp >= EXP_REQ[sk.lv]) { sk.exp -= EXP_REQ[sk.lv]; sk.lv++; log(`🎉 升级！[${P_NAMES[skillType] || '组装'}] 达到 Lv.${sk.lv}`, 'internal'); } }
}
function rollQuality(skillLv) {
    let rates = [[0.70, 0.85, 0.95],[0.66, 0.83, 0.95],[0.60, 0.80, 0.95],[0.58, 0.78, 0.93],[0.55, 0.73, 0.90],[0.53, 0.71, 0.88]][skillLv] ||[0.70, 0.85, 0.95];
    let roll = Math.random(); if (roll < rates[0]) return 1; if (roll < rates[1]) return 2; if (roll < rates[2]) return 3; return 4;
}
function calcAdvCP(adv) { return Math.floor(adv.level * 20 * adv.talent) + (adv.gear.weapon ? adv.gear.weapon.cp : 0) + (adv.gear.armor ? adv.gear.armor.cp : 0); }
function updateTownLevel() {
    let totalCp = gameState.adventurers.reduce((sum, adv) => sum + calcAdvCP(adv), 0);
    let score = (gameState.town.toolsSold * 3) + (gameState.town.bounties * 20) + (totalCp * 0.05) + (gameState.town.daysPassed * 8);
    let newLv = 1 + Math.floor(score / 250); 
    if (newLv > 10) newLv = 10;
    if (newLv > gameState.town.level) {
        let oldLv = gameState.town.level; gameState.town.level = newLv; playSound('success');
        let addedCount = (newLv - oldLv) * 2; let newNames =[];
        for(let i=0; i<addedCount; i++){
            if(gameState.adventurers.length < ADV_TEMPLATES.length) {
                let newAdv = ADV_TEMPLATES[gameState.adventurers.length];
                gameState.adventurers.push({ ...newAdv, gear:{weapon:null, armor:null}, status:'idle', timer:0, exp:0 });
                newNames.push(newAdv.name);
            }
        }
        let advText = newNames.length > 0 ? `<br>新冒险者 ${newNames.join(', ')} 加入了酒馆！` : '';
        showEventModal("🎊 城镇繁荣度提升！", `城镇繁荣度已提升至 <b>Lv.${newLv}</b>！<br>更高阶的材料将流入市场。${advText}`, null);
    }
}
function toggleTime() { gameState.isPaused = !gameState.isPaused; gameState.autoPauseOnTaskEnd = false; updateUI(); }// ==========================================
// 异世界铁匠铺 Ver 0.126 - Part 2 (核心引擎)
// ==========================================

setInterval(() => {
    if (gameState.isPaused || gameState.minigame.active) return;
    gameState.time.hour += 1;
    
    // 自动售卖工具
    if (Math.random() < 0.1) {
        let keys = Object.keys(gameState.toolShelf);
        if (keys.length > 0) {
            let k = keys[Math.floor(Math.random() * keys.length)];
            if (gameState.toolShelf[k] > 0) {
                gameState.toolShelf[k]--;
                let parts = k.split('|'); 
                if (parts.length === 2) {
                    let bpId = parts[0]; let qual = parseInt(parts[1]); let bp = BP_DB[bpId];
                    if (bp) {
                        let price = Math.floor(bp.basePrice * ([1, 1.2, 1.5, 2][qual - 1] || 1));
                        gameState.gold += price; gameState.town.toolsSold++; updateTownLevel(); playSound('coin'); 
                        log(`💰 镇民买走[${Q_NAMES[qual-1]}] ${bp.name}，进账 ${price}G`, 'internal');
                    }
                }
                if (gameState.toolShelf[k] <= 0) delete gameState.toolShelf[k];
            }
        }
    }

    processAdventurersAI(); processExpedition();

    // 跨天结算
    if (gameState.time.hour >= 24) {
        gameState.time.hour = 0; gameState.time.day += 1; gameState.luck = 0.8 + Math.random() * 0.4; 
        gameState.town.daysPassed++; updateTownLevel(); generateGuildOrder();
        
        // 加入每日自动静默存档机制
        saveGame(true);
        
        // 跨周结算
        if (gameState.time.day > 7) { 
            gameState.time.day = 1; gameState.time.week += 1; 
            let salary = gameState.apprentices.length * 150;
            gameState.gold -= (500 + salary); 
            generateMarket(); 
            showEventModal("📅 每周报表", `新的一周开始了。<br>扣除房租/学徒薪水: <b>${500 + salary}G</b><br>商队已将新材料运达市场。`, null);
            
            // 泛用路人生成器
            if (Math.random() < (gameState.town.level * 0.15)) {
                const classes =["战士", "骑士", "盗贼", "游侠", "法师", "牧师"];
                let randomClass = classes[Math.floor(Math.random() * classes.length)];
                let availableTemplates = ADV_TEMPLATES.filter(t => t.class === randomClass && !gameState.adventurers.some(a => a.id === t.name));
                let newAdv;
                if (availableTemplates.length > 0) {
                    let t = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
                    newAdv = { id: t.name, name: t.name, class: t.class, race: t.race, bg: t.bg, emoji: t.emoji, level: t.level, talent: t.talent, exp: 0, gold: t.gold, gear: {weapon: null, armor: null}, status: 'idle', timer: 0 };
                } else {
                    let genericNames =["流浪者", "寻宝客", "异乡人", "探险家", "破产佣兵"];
                    let rName = genericNames[Math.floor(Math.random() * genericNames.length)] + Math.floor(Math.random() * 1000);
                    let emojis = { "战士":"⚔️", "骑士":"🛡️", "盗贼":"🗡️", "游侠":"🏹", "法师":"🔮", "牧师":"✨" };
                    let races =["人类", "精灵", "矮人", "小人族", "亚马逊", "兽人"];
                    newAdv = { id: rName, name: rName, class: randomClass, race: races[Math.floor(Math.random() * races.length)], bg: "无名之辈", emoji: emojis[randomClass], level: Math.floor(Math.random() * 3) + 1, talent: 1.0 + (Math.random() * 0.5), exp: 0, gold: 3000 + Math.floor(Math.random() * 5000), gear: {weapon: null, armor: null}, status: 'idle', timer: 0 };
                }
                gameState.adventurers.push(newAdv);
                log(`🍻 城镇名气扩散，新冒险者【${newAdv.name}】(${newAdv.race}·${newAdv.class}) 慕名来到了酒馆！`, 'external');
            }
        }
    }

    if (gameState.workState.isWorking) {
        gameState.workState.timePassed += 1;
        let pBar = document.getElementById('progress-bar');
        if(pBar) pBar.style.width = ((gameState.workState.timePassed / gameState.workState.timeReq) * 100) + '%';
        if (gameState.workState.timePassed >= gameState.workState.timeReq) finishWork();
    }
    processApprentices(); updateUI();
}, 1000);

function startWork(partType, rawKey, hours) {
    if (gameState.workState.isWorking) return; 
    if (!gameState.inventory.raw[rawKey] || gameState.inventory.raw[rawKey] < 1) return;
    gameState.inventory.raw[rawKey]--;
    gameState.workState = { isWorking: true, task: partType, timeReq: hours, timePassed: 0, rawKey: rawKey };
    let wt = document.getElementById('work-text'); if(wt) wt.innerText = `加工中...`; playSound('craft');
    if (gameState.isPaused) { gameState.isPaused = false; gameState.autoPauseOnTaskEnd = true; } updateUI();
}

function startAssemblyProgress() {
    if (gameState.workState.isWorking) return; 
    let bpId = gameState.workbench.targetBP; let bp = BP_DB[bpId]; if (!bp) return;
    if (bp.category !== 'tool') {
        let emptyIdx = gameState.shelf.findIndex(s => s === null);
        if (emptyIdx === -1) return alert("装备区货架已满！");
        gameState.shelf[emptyIdx] = 'crafting'; 
    }
    let partsUsed =[...gameState.workbench.partsHeld]; let enchantUsed = gameState.workbench.enchantHeld;
    gameState.workbench.partsHeld =[]; gameState.workbench.enchantHeld = null;
    gameState.workState = { isWorking: true, task: 'assemble', bpId: bpId, timeReq: bp.time, timePassed: 0, partsUsed: partsUsed, enchantUsed: enchantUsed };
    let wt = document.getElementById('work-text'); if(wt) wt.innerText = `组装中 (${bp.time}h)...`; playSound('craft');
    if (gameState.isPaused) { gameState.isPaused = false; gameState.autoPauseOnTaskEnd = true; } updateUI();
}

function finishWork() {
    let task = gameState.workState.task; let partsUsed = gameState.workState.partsUsed; let bpId = gameState.workState.bpId; let encUsed = gameState.workState.enchantUsed; let rawKey = gameState.workState.rawKey;
    gameState.workState = { isWorking: false, task: null, bpId: null, timeReq: 0, timePassed: 0, partsUsed:[], enchantUsed: null, rawKey: null };
    let pBar = document.getElementById('progress-bar'); let wText = document.getElementById('work-text');
    if(pBar) pBar.style.width = '0%'; if(wText) wText.innerText = `空闲中`;

    if (task === 'assemble') {
        let bp = BP_DB[bpId]; if (!bp) return;
        gainExp(gameState.player, 'assemble');
        if (bp.category === 'tool') {
            let qual = rollQuality(gameState.player.skills.assemble.lv); let key = bpId + '|' + qual;
            gameState.toolShelf[key] = (gameState.toolShelf[key] || 0) + 1;
            log(`🔨 制作完成:[${Q_NAMES[qual-1]}] ${bp.name}`, 'internal');
        } else {
            let avgQ = partsUsed.length > 0 ? partsUsed.reduce((s, p) => s + p.quality, 0) / partsUsed.length : 1;
            let avgLv = partsUsed.length > 0 ? Math.floor(partsUsed.reduce((s, p) => s + (p.lv||1), 0) / partsUsed.length) : 1;
            startPlayerAssemblyMinigame(bpId, avgQ, avgLv, encUsed); return; 
        }
    } else {
        let qual = rollQuality(gameState.player.skills[task].lv); gameState.partCounter++;
        let pLv = RAW_DB[rawKey] ? (RAW_DB[rawKey].lv || 1) : 1; 
        gameState.inventory.parts.push({ id: gameState.partCounter, type: task, quality: qual, lv: pLv, rawKey: rawKey });
        gainExp(gameState.player, task);
    }
    if (gameState.autoPauseOnTaskEnd) { gameState.isPaused = true; gameState.autoPauseOnTaskEnd = false; } updateUI();
}

function generateEquipmentStats(bpId, avgPartQuality, equipLv, assemblerSkillLv, enchantItem) {
    let bp = BP_DB[bpId];
    let lvMult = 1 + (equipLv * 0.2);
    let statMult = 1 + (assemblerSkillLv * 0.1) + Math.random() * (assemblerSkillLv * 0.2 + 0.5);
    let fAtk = Math.floor(bp.stats.atk * statMult * lvMult); let fDef = Math.floor(bp.stats.def * statMult * lvMult); let fSpd = Math.floor(bp.stats.spd * statMult * lvMult);

    let starFactor = (1 + assemblerSkillLv * 0.1) * avgPartQuality * gameState.luck; 
    let stars = Math.min(5, Math.max(1, Math.round(starFactor)));
    let rarity = 1; if (starFactor >= 3.5) rarity = 4; else if (starFactor >= 2.5) rarity = 3; else if (starFactor >= 1.5) rarity = 2;

    let ele = "无属性";
    if (enchantItem && RAW_DB[enchantItem.rawKey]) { ele = RAW_DB[enchantItem.rawKey].element; } 
    else if (Math.random() <[0.05, 0.1, 0.2, 0.4][rarity - 1]) { ele = ELEMENTS[Math.floor(Math.random() * (ELEMENTS.length - 1)) + 1]; }

    let affixCount = 0; if (rarity === 2) affixCount = Math.floor(Math.random() * 2) + 1; else if (rarity === 3) affixCount = Math.floor(Math.random() * 2) + 3; else if (rarity === 4) affixCount = Math.floor(Math.random() * 2) + 5;
    let myAffixes =[]; let pool = [...AFFIX_POOL];
    for (let i = 0; i < Math.min(affixCount, pool.length); i++) myAffixes.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);

    let cp = Math.floor(((fAtk * 2) + (fDef * 2) + (fSpd * 1.5)) * (1 + myAffixes.length * 0.15) * (ele !== "无属性" ? 1.2 : 1.0));
    let basePrice = Math.floor(cp * 5 *[1, 2, 4, 8][rarity - 1]); 
    gameState.weaponCounter++;
    return { id: gameState.weaponCounter, bpId: bpId, category: bp.category, name: bp.name, lv: equipLv, stars: stars, rarity: rarity, stats: { atk: fAtk, def: fDef, spd: fSpd }, element: ele, affixes: myAffixes, cp: cp, basePrice: basePrice, offers:[] };
}

function startPlayerAssemblyMinigame(bpId, avgQ, equipLv, encUsed) {
    gameState.minigame.weapon = generateEquipmentStats(bpId, avgQ, equipLv, gameState.player.skills.assemble.lv, encUsed);
    gameState.minigame.active = true;
    if (!gameState.isPaused) toggleTime(); 
    
    let mModal = document.getElementById('minigame-modal'); let btnClose = document.getElementById('btn-close-modal');
    if(mModal) mModal.style.display = 'flex'; if(btnClose) btnClose.style.display = 'none';
    
    let w = gameState.minigame.weapon; let tick = 0;
    let eBase = document.getElementById('r-val-cp'); let eEle = document.getElementById('r-val-element'); let eAffix = document.getElementById('r-val-affix'); let eFinal = document.getElementById('r-val-final');
    if(eBase) eBase.className = 'roll-text'; if(eEle) eEle.className = 'roll-text'; if(eAffix) eAffix.className = 'roll-text'; if(eFinal) eFinal.className = 'roll-text';
    ['1', '2', '3', '4'].forEach(i => { let el = document.getElementById(`r-step-${i}`); if(el) el.className = 'r-step'; });

    gameState.minigame.intervalId = setInterval(() => {
        tick++; playSound('roll');
        if (tick < 20) { if(eBase) eBase.innerText = `LV.? CP:${Math.floor(Math.random() * 1000)}`; } 
        else if (tick === 20) { if(eBase) eBase.innerText = `Lv.${w.lv} | CP: ${w.cp}`; let el = document.getElementById('r-step-1'); if(el) el.className = 'r-step r-done'; }
        if (tick > 20 && tick < 40) { if(eEle) eEle.innerText = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)]; } 
        else if (tick === 40) { if(eEle) eEle.innerText = w.element; let el = document.getElementById('r-step-2'); if(el) el.className = 'r-step r-done'; }
        if (tick > 40 && tick < 60) { if(eAffix) eAffix.innerText = AFFIX_POOL[Math.floor(Math.random() * AFFIX_POOL.length)]; } 
        else if (tick === 60) { if(eAffix) eAffix.innerText = w.affixes.length + "条附加词条"; let el = document.getElementById('r-step-3'); if(el) el.className = 'r-step r-done'; }
        if (tick > 60 && tick < 80) { if(eFinal) eFinal.innerText = "⭐".repeat(Math.ceil(Math.random() * 5)) + Q_NAMES[Math.floor(Math.random() * 4)]; } 
        else if (tick === 80) { 
            clearInterval(gameState.minigame.intervalId); playSound('success');
            if(eFinal) { eFinal.innerText = `${"⭐".repeat(w.stars)} ${Q_NAMES[w.rarity-1]}`; eFinal.className = `roll-text q-${w.rarity}`; }
            let el = document.getElementById('r-step-4'); if(el) el.className = 'r-step r-done';
            if(btnClose) btnClose.style.display = 'block';
        }
    }, 40); 
}

function closeMinigame() {
    let mModal = document.getElementById('minigame-modal'); if(mModal) mModal.style.display = 'none'; 
    gameState.minigame.active = false;
    let slotIdx = gameState.shelf.findIndex(s => s === 'crafting');
    if (slotIdx !== -1) { gameState.shelf[slotIdx] = gameState.minigame.weapon; } 
    else { let ei = gameState.shelf.findIndex(s => s === null); if (ei !== -1) gameState.shelf[ei] = gameState.minigame.weapon; }
    gameState.minigame.weapon = null; 
    if (gameState.autoPauseOnTaskEnd) { gameState.isPaused = true; gameState.autoPauseOnTaskEnd = false; } 
    updateUI();
}// ==========================================
// 异世界铁匠铺 Ver 0.126 - Part 3 (交互与UI渲染)
// ==========================================

function initAdventurers() {
    const targetClasses =["战士", "骑士", "盗贼", "游侠", "法师", "牧师"];
    targetClasses.forEach(cls => {
        let template = ADV_TEMPLATES.find(t => t.class === cls && !gameState.adventurers.some(a => a.id === t.name));
        if (template) {
            gameState.adventurers.push({ 
                id: template.name, name: template.name, class: template.class, race: template.race, 
                bg: template.bg, emoji: template.emoji, level: template.level, talent: template.talent, 
                exp: 0, gold: template.gold, gear: { weapon: null, armor: null }, status: 'idle', timer: 0 
            });
        }
    });
}

function processAdventurersAI() {
    gameState.adventurers.forEach(adv => {
        let totalCp = calcAdvCP(adv);
        if (adv.status === 'idle') {
            let bought = false;
            if (gameState.expedition.active && gameState.expedition.status === 'recruiting' && gameState.expedition.members.length < gameState.expedition.reqMembers && !gameState.expedition.members.includes(adv.id)) {
                let targetDun = DUNGEONS.find(d => d.id === gameState.expedition.targetId);
                if (targetDun && totalCp >= targetDun.reqCp * 0.2) {
                    gameState.expedition.members.push(adv.id); adv.status = 'expedition'; log(`🗺️ ${adv.name} 加入了远征队！`, 'external'); return;
                }
            }

            gameState.shelf.forEach((w, idx) => {
                if (w && w.offers && w.offers.length > 0 && w.offers[0].advId === adv.id) { bought = true; }
                
                if (w && w !== 'crafting' && !w.offers.length && BP_DB[w.bpId].classes.some(c => adv.class.includes(c))) {
                    let offerPrice = Math.floor(w.basePrice * (0.8 + Math.random() * 0.5)); 
                    if (adv.gold >= offerPrice) {
                        if (w.category === 'weapon' && (!adv.gear.weapon || w.cp > adv.gear.weapon.cp)) { w.offers =[{ npc: adv.name, price: offerPrice, isAdventurer: true, advId: adv.id, slot: 'weapon' }]; bought = true; } 
                        else if (w.category === 'armor' && (!adv.gear.armor || w.cp > adv.gear.armor.cp)) { w.offers =[{ npc: adv.name, price: offerPrice, isAdventurer: true, advId: adv.id, slot: 'armor' }]; bought = true; }
                    }
                }
            });
            
            if (!bought) { 
                let suitableDungeons = DUNGEONS.filter(d => d.reqCp <= totalCp * 1.5 && (d.level === 1 || DUNGEONS[d.level-2].isExplored));
                let targetDun = suitableDungeons.length > 0 ? suitableDungeons[suitableDungeons.length - 1] : DUNGEONS[0];
                adv.targetDungeonId = targetDun.id;
                adv.status = 'dungeon'; adv.timer = 6 + Math.floor(Math.random() * 6); 
                if (!adv.gear.weapon) log(`⚔️ ${adv.name} 赤手空拳去了【${targetDun.name}】...`, 'external');
            }
        } 
        else if (adv.status === 'dungeon') {
            adv.timer--;
            if (adv.timer <= 0) {
                adv.status = 'idle'; 
                let targetDun = DUNGEONS.find(d => d.id === adv.targetDungeonId) || DUNGEONS[0];
                let winChance = adv.gear.weapon ? Math.min(0.95, totalCp / targetDun.reqCp) : 0.1; 
                
                if (Math.random() < winChance) {
                    let goldEarned = Math.floor((adv.level * 150) * adv.talent + (totalCp * 0.5) + Math.random() * 200);
                    adv.gold += goldEarned; adv.exp += 30;
                    if (Math.random() < 0.5) {
                        let emptySlotIdx = gameState.acquisitionSlots.findIndex(s => s === null);
                        if (emptySlotIdx !== -1 && targetDun.dropKeys.length > 0) {
                            let dropKey = targetDun.dropKeys[Math.floor(Math.random() * targetDun.dropKeys.length)];
                            if (RAW_DB[dropKey]) {
                                let amt = 5 + Math.floor(Math.random() * 10);
                                let cost = Math.floor(RAW_DB[dropKey].basePrice * amt * 0.7); 
                                gameState.acquisitionSlots[emptySlotIdx] = { npc: adv.name, rawKey: dropKey, amount: amt, price: cost };
                                log(`🤝 ${adv.name} 从地下城带回了特产兜售！`, 'external');
                            }
                        }
                    }
                } else {
                    adv.gold += Math.floor(Math.random() * 30); 
                    let breakChanceW = adv.gear.weapon ? Math.max(0.01, (adv.gear.armor ? 0.10 : 0.25) - (adv.gear.weapon.rarity * 0.03)) : 0;
                    let breakChanceA = adv.gear.armor ? Math.max(0.01, 0.2 - (adv.gear.armor.rarity * 0.03)) : 0;
                    if (adv.gear.weapon && Math.random() < breakChanceW) { let n = adv.gear.weapon.name; adv.gear.weapon = null; log(`💔 战败！${adv.name}的【${n}】碎了！`, 'external'); }
                    if (adv.gear.armor && Math.random() < breakChanceA) { adv.gear.armor = null; log(`💔 战败！${adv.name}的防具毁了！`, 'external'); }
                }
                if (adv.level < 10 && adv.exp >= adv.level * 80) { adv.level++; adv.exp = 0; updateTownLevel(); }
            }
        }
    });
}

function processApprentices() {
    gameState.apprentices.forEach(app => {
        if (app.task === 'idle') return;
        if (app.task.startsWith('proc_')) {
            let rawKey = app.task.replace('proc_', ''); let reqRaw = RAW_DB[rawKey]; if (!reqRaw) return;
            if (app.progress === 0) {
                if (gameState.inventory.raw[rawKey] >= 1) { gameState.inventory.raw[rawKey]--; app.progress = 1; app.status = '🔨 加工中'; } 
                else { app.status = `⚠️ 缺原料`; }
            } else {
                app.progress++;
                if (app.progress >= app.maxProgress) {
                    let quality = rollQuality(app.skills[reqRaw.type].lv); gameState.partCounter++;
                    gameState.inventory.parts.push({ id: gameState.partCounter, type: reqRaw.type, quality: quality, lv: reqRaw.lv || 1, rawKey: rawKey });
                    gainExp(app, reqRaw.type); app.progress = 0;
                }
            }
        } 
        else if (app.task.startsWith('assemble_')) {
            let bpId = app.task.replace('assemble_', ''); let bp = BP_DB[bpId]; if (!bp) return;
            if (app.progress === 0) {
                if (bp.category !== 'tool' && gameState.shelf.findIndex(s => s === null) === -1) { app.status = '⚠️ 货架满'; return; }
                let canCraft = true; let partsToTake =[];
                for (let reqType in bp.req) {
                    let needed = bp.req[reqType]; let available = gameState.inventory.parts.filter(p => p.type === reqType);
                    if (available.length < needed) { canCraft = false; break; }
                    partsToTake.push(...available.slice(0, needed)); 
                }
                if (canCraft) { partsToTake.forEach(pt => { let idx = gameState.inventory.parts.findIndex(p => p.id === pt.id); app.heldParts.push(gameState.inventory.parts.splice(idx, 1)[0]); }); app.progress = 1; app.status = '🛠️ 拼装中'; } 
                else { app.status = '⚠️ 缺零件'; }
            } else {
                app.progress++;
                if (app.progress >= app.maxProgress) {
                    let avgQ = app.heldParts.length > 0 ? app.heldParts.reduce((s, p) => s + p.quality, 0) / app.heldParts.length : 1;
                    if (bp.category === 'tool') {
                        let qual = rollQuality(app.skills.assemble.lv); let key = bpId + '|' + qual;
                        gameState.toolShelf[key] = (gameState.toolShelf[key] || 0) + 1;
                    } else {
                        let avgLv = app.heldParts.length > 0 ? Math.floor(app.heldParts.reduce((s, p) => s + (p.lv || 1), 0) / app.heldParts.length) : 1;
                        let weapon = generateEquipmentStats(bpId, avgQ, avgLv, app.skills.assemble.lv, null);
                        let emptyIdx = gameState.shelf.findIndex(s => s === null);
                        if (emptyIdx !== -1) gameState.shelf[emptyIdx] = weapon;
                    }
                    app.heldParts =[]; app.progress = 0; gainExp(app, 'assemble');
                }
            }
        }
    });
}

function publishExpedition(dunId) {
    if (gameState.expedition.active) return alert("已有远征队伍在招募或探索中！");
    let targetDun = DUNGEONS.find(d => d.id === dunId); 
    if (!targetDun) return;
    
    let cost = targetDun.expCost || (targetDun.level * 1000); 
    if (gameState.gold < cost) return alert(`至少需要 ${cost}G 赞助费！`);
    
    // 核心修改：根据地下城层数精准决定需求人数
    let reqMem = 2;
    if (targetDun.level === 3) reqMem = 3;
    else if (targetDun.level === 4) reqMem = 4;
    else if (targetDun.level >= 5) reqMem = 5;

    gameState.gold -= cost;
    gameState.expedition = { active: true, status: 'recruiting', targetId: dunId, sponsorGold: cost, members:[], reqMembers: reqMem, timer: 10 };
    log(`📢 发布【${targetDun.name}】远征悬赏，急需 ${reqMem} 名精英冒险者！`, 'external'); 
    updateUI();
}

function processExpedition() {
    if (!gameState.expedition.active) return;
    let exp = gameState.expedition;
    
    if (exp.status === 'recruiting') {
        exp.timer--;
        if (exp.members.length >= exp.reqMembers || exp.timer <= 0) {
            if (exp.members.length >= exp.reqMembers) {
                exp.status = 'exploring'; 
                exp.timer = 15; 
                log(`🚀 远征队(${exp.members.length}人)集结完毕，向着目标出发！`, 'external');
            } else {
                exp.active = false; 
                gameState.gold += exp.sponsorGold; 
                exp.members.forEach(id => { 
                    let a = gameState.adventurers.find(adv => adv.id === id); 
                    if (a) a.status = 'idle'; 
                });
                showEventModal("远征取消", "响应招募的冒险者人数不足，队伍解散，赞助金已退回。", null);
            }
        }
    } else if (exp.status === 'exploring') {
        exp.timer--;
        if (exp.timer <= 0) {
            let targetDun = DUNGEONS.find(d => d.id === exp.targetId);
            if(!targetDun) { exp.active = false; return; }
            
            let partyCp = 0; 
            exp.members.forEach(id => { 
                let a = gameState.adventurers.find(adv => adv.id === id); 
                if (a) { 
                    let cp = calcAdvCP(a); 
                    if (a.gear.weapon && a.gear.weapon.element === targetDun.element) cp *= 1.5; 
                    partyCp += cp; 
                }
            });

            if (partyCp >= targetDun.reqCp) {
                targetDun.isExplored = true; 
                let rewardsHtml = "";
                let availableRaw = Object.keys(RAW_DB).filter(k => RAW_DB[k].type !== 'enchant' && (!RAW_DB[k].lv || RAW_DB[k].lv <= targetDun.dropLv));
                
                // 核心修改：高层地下城掉落种类更多，数量呈倍数暴增！
                if (availableRaw.length > 0) {
                    let typesToDrop = 2 + targetDun.level; // 层数越高，拉回来的材料种类越多
                    for(let i=0; i < typesToDrop; i++) {
                        let d = availableRaw[Math.floor(Math.random() * availableRaw.length)];
                        if(RAW_DB[d]) {
                            // 数量基础 30~80，直接乘以层数！第5层就是几百个材料！
                            let amt = (30 + Math.floor(Math.random() * 50)) * targetDun.level;
                            gameState.inventory.raw[d] = (gameState.inventory.raw[d] || 0) + amt;
                            rewardsHtml += `<div style="margin-bottom:4px;">📦 ${RAW_DB[d].name} x${amt}</div>`;
                        }
                    }
                }
                
                // 核心修改：高层地下城掉落极品宝石数量增加！(1~2层1颗，3~4层2颗，5层3颗)
                let gemCount = Math.floor((targetDun.level - 1) / 2) + 1;
                for(let i=0; i < gemCount; i++) {
                    let gem =['fire_crystal', 'ice_crystal', 'holy_tear'][Math.floor(Math.random() * 3)];
                    gameState.inventory.parts.push({ id: ++gameState.partCounter, type: 'enchant', rawKey: gem, quality: 4, lv: 1 });
                    rewardsHtml += `<div style="margin-bottom:4px; color:#9b59b6;">💎 极品宝石 [${RAW_DB[gem].name}] x1</div>`;
                }
                
                // 参与的NPC分红与经验也按层数暴涨，迅速催生神级冒险者
                exp.members.forEach(id => { 
                    let a = gameState.adventurers.find(adv => adv.id === id); 
                    if (a) { 
                        a.gold += 1500 * targetDun.level; 
                        a.exp += 100 * targetDun.level; 
                        a.status = 'idle'; 
                    } 
                });
                showEventModal(`🏆 远征大捷: ${targetDun.name}`, "队伍凭借强大的战力彻底碾压了地下城首领！满载而归！", rewardsHtml);
            } else {
                exp.members.forEach(id => { 
                    let a = gameState.adventurers.find(adv => adv.id === id); 
                    if (a) { 
                        a.status = 'idle'; 
                        if (a.gear.weapon && Math.random() < 0.4) a.gear.weapon = null; 
                    } 
                });
                showEventModal(`💀 远征惨败: ${targetDun.name}`, "队伍战力不足，在首领面前溃败而逃，多名队员武器碎裂。没有带回任何物资。", null);
            }
            exp.active = false; 
            updateTownLevel();
        }
    }
}

function generateMarket() {
    gameState.market =[]; 
    let maxMaterialLv = gameState.town.level === 1 ? 1 : (gameState.town.level - 1) * 5;
    let availableKeys = Object.keys(RAW_DB).filter(k => {
        let item = RAW_DB[k];
        if(item.type === 'enchant') return false; 
        return (!item.lv || item.lv <= maxMaterialLv);
    });
    
    if (availableKeys.length === 0) availableKeys =['copper_ore', 'wood']; 
    let typeCount = Math.min(availableKeys.length, 3 + Math.floor(gameState.town.level / 2));
    let chosenKeys = new Set();
    while (chosenKeys.size < typeCount) { chosenKeys.add(availableKeys[Math.floor(Math.random() * availableKeys.length)]); }

    chosenKeys.forEach(key => {
        let qty = Math.floor((20 + Math.random() * 30) * (1 + gameState.town.level * 0.2));
        gameState.market.push({ id: key, stock: qty, price: RAW_DB[key].basePrice });
    });
}

function buyFromMarket(marketIdx, amount) {
    let item = gameState.market[marketIdx]; if (!item || item.stock < amount) return alert("库存不足！");
    if (gameState.gold >= item.price * amount) {
        gameState.gold -= item.price * amount; item.stock -= amount; playSound('coin');
        if (RAW_DB[item.id].type === 'enchant') { gameState.inventory.parts.push({ id: ++gameState.partCounter, type: 'enchant', rawKey: item.id, quality: 3, lv: 1 }); } 
        else { gameState.inventory.raw[item.id] = (gameState.inventory.raw[item.id] || 0) + amount; }
        updateUI();
    } else alert("金币不足！");
}

function acceptAcquisition(idx) { let offer = gameState.acquisitionSlots[idx]; if (!offer) return; if (gameState.gold >= offer.price) { gameState.gold -= offer.price; playSound('coin'); gameState.inventory.raw[offer.rawKey] = (gameState.inventory.raw[offer.rawKey] || 0) + offer.amount; gameState.acquisitionSlots[idx] = null; log(`🛒 收购了 ${offer.npc} 的材料。`, 'external'); updateUI(); } else alert("金币不足！"); }
function rejectAcquisition(idx) { gameState.acquisitionSlots[idx] = null; updateUI(); }
function sellPart(e, id) { e.preventDefault(); let idx = gameState.inventory.parts.findIndex(p => p.id === id); if (idx !== -1) { let p = gameState.inventory.parts[idx]; let raw = RAW_DB[p.rawKey]; let price = p.type === 'enchant' ? (raw ? raw.basePrice : 50) : p.quality * 10 * (p.lv || 1); gameState.gold += price; gameState.inventory.parts.splice(idx, 1); playSound('coin'); updateUI(); } }
function moveToWorkbench(id) { let idx = gameState.inventory.parts.findIndex(p => p.id === id); if (idx === -1) return; let part = gameState.inventory.parts[idx]; if (part.type === 'enchant') { if (!gameState.workbench.enchantHeld) { gameState.inventory.parts.splice(idx, 1); gameState.workbench.enchantHeld = part; updateUI(); } return; } let bp = BP_DB[gameState.workbench.targetBP]; if (!bp) return; let reqs = bp.req; if (reqs[part.type] && gameState.workbench.partsHeld.filter(p => p.type === part.type).length < reqs[part.type]) { gameState.inventory.parts.splice(idx, 1); gameState.workbench.partsHeld.push(part); updateUI(); } }
function moveToInventory(id, isEnchant = false) { if (isEnchant) { if (gameState.workbench.enchantHeld) { gameState.inventory.parts.push(gameState.workbench.enchantHeld); gameState.workbench.enchantHeld = null; updateUI(); } return; } let idx = gameState.workbench.partsHeld.findIndex(p => p.id === id); if (idx !== -1) { let part = gameState.workbench.partsHeld[idx]; gameState.workbench.partsHeld.splice(idx, 1); gameState.inventory.parts.push(part); updateUI(); } }
function trashPart(e, id, loc) { e.stopPropagation(); if (loc === 'wb') gameState.workbench.partsHeld = gameState.workbench.partsHeld.filter(p => p.id !== id); else gameState.inventory.parts = gameState.inventory.parts.filter(p => p.id !== id); updateUI(); }
function trashWeapon(e, idx) { e.stopPropagation(); gameState.shelf[idx] = null; updateUI(); }
function acceptOffer(e, idx) { e.stopPropagation(); if (gameState.shelf[idx] && gameState.shelf[idx].offers.length > 0) { gameState.gold += gameState.shelf[idx].offers[0].price; gameState.shelf[idx] = null; playSound('coin'); updateUI(); } }
function rejectOffer(e, idx) { e.stopPropagation(); if (gameState.shelf[idx]) { gameState.shelf[idx].offers =[]; updateUI(); } }
function acceptAdvOffer(e, shelfIdx, advId) {
    e.stopPropagation(); let w = gameState.shelf[shelfIdx]; if (!w || !w.offers || w.offers.length === 0) return;
    let off = w.offers[0]; let adv = gameState.adventurers.find(a => a.id === advId || a.name === off.npc); 
    gameState.gold += off.price; gameState.shelf[shelfIdx] = null; playSound('coin'); 
    if (adv) { adv.gold -= off.price; adv.gear[off.slot] = w; log(`🤝 交易成功！${adv.name} 花费 ${off.price}G 买走了 ${w.name}！`, 'external'); updateTownLevel(); } 
    else { log(`🤝 交易成功！神秘人买走了 ${w.name}。`, 'external'); } updateUI();
}

function changeTargetBlueprint(bpId) { if (gameState.workbench.partsHeld.length > 0) { gameState.inventory.parts.push(...gameState.workbench.partsHeld); gameState.workbench.partsHeld =[]; } gameState.workbench.targetBP = bpId; updateUI(); }
function unlockBP(bpId) { let bp = BP_DB[bpId]; if (bp && gameState.reputation >= bp.cost) { gameState.reputation -= bp.cost; gameState.unlockedBPs.push(bpId); updateUI(); } }
function hireApprentice() { let names =["哥布林苦工", "矮人工匠", "精灵学徒", "半兽人小弟"]; if (gameState.gold >= gameState.apprenticeCost && gameState.apprentices.length < 4) { gameState.gold -= gameState.apprenticeCost; playSound('coin'); gameState.apprentices.push({ id: gameState.apprentices.length, name: names[gameState.apprentices.length], task: 'idle', progress: 0, maxProgress: 2, status: '💤', heldParts:[], skills: { ingot:{lv:0,exp:0}, handle:{lv:0,exp:0}, fabric:{lv:0,exp:0}, leather:{lv:0,exp:0}, assemble:{lv:0,exp:0} } }); gameState.apprenticeCost += 500; updateUI(); } else alert("金币不足或学徒已满！"); }
function changeApprenticeTask(id, newTask) { let app = gameState.apprentices.find(a => a.id === id); if (!app) return; app.task = newTask; app.progress = 0; if (newTask.startsWith('assemble_')) { let bpId = newTask.replace('assemble_', ''); app.maxProgress = BP_DB[bpId] ? BP_DB[bpId].time : 2; } else { app.maxProgress = 2; } app.status = '🟢 就绪'; if (app.heldParts.length > 0) { gameState.inventory.parts.push(...app.heldParts); app.heldParts =[]; } updateUI(); }

function generateGuildOrder() {
    if (gameState.guildOrders.length >= 4) return;
    let pool = gameState.unlockedBPs; if (!pool || pool.length === 0) return;
    let reqBP = BP_DB[pool[Math.floor(Math.random() * pool.length)]]; if (!reqBP) return;
    if (reqBP.category === 'tool') {
        let count = 2 + Math.floor(Math.random() * 4);
        gameState.guildOrders.push({ type: 'tool', reqId: reqBP.id, reqName: reqBP.name, reqAmount: count, rewardGold: Math.floor(reqBP.basePrice * count * 2), rewardRep: 5 });
    } else {
        let reqRarity = Math.floor(Math.random() * 3) + 1; let reqLv = reqBP.lv || 1;
        gameState.guildOrders.push({ type: 'weapon', reqId: reqBP.id, reqName: reqBP.name, reqLv: reqLv, reqRarity: reqRarity, reqAmount: 1, rewardGold: Math.floor((reqBP.stats.atk + reqBP.stats.def + reqBP.stats.spd) * 5 * Math.pow(2.5, reqRarity-1) * (1 + reqLv * 0.2) * 2), rewardRep: reqRarity * 10 });
    }
}
function submitToolOrder(idx) { let order = gameState.guildOrders[idx]; if (!order) return; let countOwned = 0; let keysToDeduct =[]; for (let k in gameState.toolShelf) { if (k.startsWith(order.reqId + '|')) { countOwned += gameState.toolShelf[k]; keysToDeduct.push(k); } } if (countOwned >= order.reqAmount) { let remaining = order.reqAmount; for (let k of keysToDeduct) { if (gameState.toolShelf[k] >= remaining) { gameState.toolShelf[k] -= remaining; if (gameState.toolShelf[k] === 0) delete gameState.toolShelf[k]; break; } else { remaining -= gameState.toolShelf[k]; delete gameState.toolShelf[k]; } } gameState.gold += order.rewardGold; gameState.reputation += order.rewardRep; gameState.guildOrders.splice(idx, 1); gameState.town.bounties++; playSound('coin'); updateTownLevel(); updateUI(); } else alert("工具数量不足！"); }
function startOrderSelect(idx) { gameState.selectingOrderIndex = idx; updateUI(); }
function cancelOrderSelect() { gameState.selectingOrderIndex = null; updateUI(); }
function fulfillOrderWithItem(idx) { let order = gameState.guildOrders[gameState.selectingOrderIndex]; if (!order) return; gameState.gold += order.rewardGold; gameState.reputation += order.rewardRep; gameState.shelf[idx] = null; gameState.guildOrders.splice(gameState.selectingOrderIndex, 1); gameState.selectingOrderIndex = null; gameState.town.bounties++; playSound('coin'); updateTownLevel(); updateUI(); }

function switchTab(type, btn) { document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); document.querySelectorAll('.log-box').forEach(b => b.classList.remove('active-log')); btn.classList.add('active'); let target = document.getElementById(`log-${type}`); if (target) target.classList.add('active-log'); }
function switchPanelTab(prefix, tabName, btn) { let p = btn.parentElement.parentElement; p.querySelectorAll('.ptab-btn').forEach(b => b.classList.remove('active')); p.querySelectorAll('.ptab-content').forEach(c => c.classList.remove('active-ptab')); btn.classList.add('active'); let target = document.getElementById(`${prefix}-${tabName}`); if (target) target.classList.add('active-ptab'); }

function updateUI() {
    safeRender('gold', el => el.innerText = Math.floor(gameState.gold));
    safeRender('reputation', el => el.innerText = gameState.reputation);
    safeRender('week', el => el.innerText = gameState.time.week);
    safeRender('day', el => el.innerText = gameState.time.day);
    safeRender('hour', el => el.innerText = gameState.time.hour);
    safeRender('luck', el => el.innerText = gameState.luck.toFixed(2));
    safeRender('town-level', el => el.innerText = gameState.town.level);
    
    safeRender('btn-sound-toggle', el => { el.innerText = gameState.soundEnabled ? '🔊 音效: 开' : '🔇 音效: 关'; el.style.background = gameState.soundEnabled ? '#34495e' : '#c0392b'; });
    
    safeRender('player-skills-detail', pSkillDiv => {
        pSkillDiv.innerHTML = '';
        for(let k in gameState.player.skills) {
            let sk = gameState.player.skills[k]; let mExp = EXP_REQ[sk.lv] || 'MAX'; let percent = sk.lv >= 5 ? 100 : (sk.exp / mExp) * 100;
            pSkillDiv.innerHTML += `<div style="margin-bottom:8px; background:rgba(0,0,0,0.3); padding:8px; border-radius:4px; border:1px solid #3a322a;"><div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>${k==='assemble'?'装备组装':(P_NAMES[k]||k)} Lv.${sk.lv}</span> <span style="color:#888;">${sk.lv>=5?'已满级':sk.exp+'/'+mExp}</span></div><div class="progress-bg"><div class="progress-fill" style="width:${percent}%"></div></div></div>`;
        }
    });

    safeRender('market-list', marketDiv => {
        marketDiv.innerHTML = '';
        gameState.market.forEach((m, idx) => { 
            let rData = RAW_DB[m.id]; 
            if(rData) {
                let color = rData.type === 'enchant' ? '#9b59b6' : '#fff'; 
                marketDiv.innerHTML += `<div class="market-item"><div><strong style="color:${color}">${rData.name}</strong><br><span style="color:#aaa; font-size:0.85em;">单价: ${m.price}G | 库存: ${m.stock}</span></div><div><button onclick="buyFromMarket(${idx}, 1)" ${m.stock<1?'disabled':''}>买1</button> <button onclick="buyFromMarket(${idx}, 10)" ${m.stock<10?'disabled':''}>买10</button></div></div>`; 
            }
        });
    });
    
    safeRender('inventory-raw-list', invRawDiv => {
        invRawDiv.innerHTML = '';
        for(let k in gameState.inventory.raw) { if (gameState.inventory.raw[k] > 0 && RAW_DB[k]) { invRawDiv.innerHTML += `<span style="margin-right:10px;">${RAW_DB[k].name}: <strong style="color:#f4d03f">${gameState.inventory.raw[k]}</strong></span>`; } }
    });
    
    safeRender('process-buttons', div => {
        div.innerHTML = ''; let dAttr = gameState.workState.isWorking ? 'disabled' : '';
        for (let key in gameState.inventory.raw) { if (gameState.inventory.raw[key] > 0) { let rData = RAW_DB[key]; if (rData) div.innerHTML += `<button onclick="startWork('${rData.type}', '${key}', 2)" ${dAttr}>加工 ${rData.name}</button>`; } }
        if (div.innerHTML === '') div.innerHTML = '<span style="color:#666; font-size:0.9em;">(无原料可加工)</span>';
    });

    let divs = { ingot: document.getElementById('inv-ingot'), handle: document.getElementById('inv-handle'), fabric: document.getElementById('inv-fabric'), leather: document.getElementById('inv-leather'), enchant: document.getElementById('inv-enchant') };
    for (let k in divs) if (divs[k]) divs[k].innerHTML = '';
    let groupedParts = {};
    gameState.inventory.parts.forEach(p => { 
        if (p.type === 'enchant') { if (divs.enchant && RAW_DB[p.rawKey]) { divs.enchant.innerHTML += `<div class="part-item" style="border:1px solid #9b59b6; box-shadow:0 0 5px #9b59b6;" onclick="moveToWorkbench(${p.id})" oncontextmenu="sellPart(event, ${p.id})"><span style="color:#9b59b6;font-weight:bold;">${RAW_DB[p.rawKey].name}</span></div>`; } } 
        else { let k = p.type + '_' + (p.lv||1) + '_' + p.quality; if (!groupedParts[k]) groupedParts[k] = { type: p.type, quality: p.quality, lv: (p.lv||1), ids: [] }; groupedParts[k].ids.push(p.id); }
    });
    for (let k in groupedParts) { let g = groupedParts[k]; if (divs[g.type]) divs[g.type].innerHTML += `<div class="part-item border-q-${g.quality}" onclick="moveToWorkbench(${g.ids[0]})" oncontextmenu="sellPart(event, ${g.ids[0]})"><div class="badge-count">${g.ids.length}</div><span class="q-${g.quality}">Lv.${g.lv}<br>${P_NAMES[g.type]}</span></div>`; }

    safeRender('bp-selector', bpSel => {
        bpSel.innerHTML = ''; gameState.unlockedBPs.forEach(id => { if(BP_DB[id]) bpSel.innerHTML += `<option value="${id}" ${gameState.workbench.targetBP === id ? 'selected' : ''}>📜 ${BP_DB[id].name}</option>`; });
    });
    
    safeRender('workbench-slots', slotsDiv => {
        slotsDiv.innerHTML = ''; let targetBP = BP_DB[gameState.workbench.targetBP]; let isReady = true;
        if(targetBP) {
            for (let reqType in targetBP.req) {
                let placed = gameState.workbench.partsHeld.filter(p => p.type === reqType);
                for(let i=0; i < targetBP.req[reqType]; i++) {
                    if (placed[i]) { slotsDiv.innerHTML += `<div class="part-item border-q-${placed[i].quality}" onclick="moveToInventory(${placed[i].id})"><button class="btn-trash" style="position:absolute; top:-8px; right:-8px;" onclick="trashPart(event, ${placed[i].id}, 'wb')">🗑️</button><span class="q-${placed[i].quality}">Lv.${placed[i].lv}<br>${P_NAMES[reqType]}</span></div>`; } 
                    else { slotsDiv.innerHTML += `<div class="part-item empty">缺<br>${P_NAMES[reqType]}</div>`; isReady = false; }
                }
            }
        }
        let btnAssemble = document.getElementById('btn-assemble'); if(btnAssemble) btnAssemble.disabled = !isReady || gameState.workState.isWorking;
    });
    
    safeRender('enchant-slot', encSlot => {
        if (gameState.workbench.enchantHeld && RAW_DB[gameState.workbench.enchantHeld.rawKey]) {
            let enc = gameState.workbench.enchantHeld; encSlot.innerHTML = `<div onclick="moveToInventory(${enc.id}, true)" style="cursor:pointer;"><span style="color:#9b59b6; font-weight:bold;">${RAW_DB[enc.rawKey].name}</span></div>`; encSlot.className = "part-item"; encSlot.style.borderColor = "#9b59b6"; encSlot.style.boxShadow = "0 0 10px #9b59b6";
        } else { encSlot.innerHTML = "副材料<br>(可选)"; encSlot.className = "part-item empty"; encSlot.style.boxShadow = "none"; }
    });

    safeRender('apprentice-list', appList => {
        appList.innerHTML = ''; let btnHire = document.getElementById('btn-hire'); if(btnHire) { btnHire.innerText = `招募学徒 (${gameState.apprenticeCost}G)`; btnHire.disabled = (gameState.apprentices.length >= 4); }
        gameState.apprentices.forEach(app => {
            let bpOpts = ''; gameState.unlockedBPs.forEach(id => { if(BP_DB[id]) bpOpts += `<option value="assemble_${id}" ${app.task === 'assemble_'+id ? 'selected' : ''}>🛠️ 组装: ${BP_DB[id].name}</option>`; });
            let personalRawOpts = ''; Object.keys(RAW_DB).forEach(k => { if (RAW_DB[k].type !== 'enchant') { personalRawOpts += `<option value="proc_${k}" ${app.task === 'proc_'+k ? 'selected' : ''}>🔨 加工: ${RAW_DB[k].name}</option>`; } });
            appList.innerHTML += `<div class="apprentice-card"><div style="display:flex; justify-content:space-between; margin-bottom:5px;"><strong>👦 ${app.name}</strong> <span style="color:#aaa; font-size:0.85em;">[${app.status}]</span></div><select onchange="changeApprenticeTask(${app.id}, this.value)"><option value="idle" ${app.task === 'idle' ? 'selected' : ''}>💤 休息发呆</option><optgroup label="指定加工材料">${personalRawOpts}</optgroup><optgroup label="自动生产装备">${bpOpts}</optgroup></select><div class="progress-bg" style="margin-top:8px;"><div class="progress-fill" style="width:${(app.progress / app.maxProgress) * 100}%"></div></div></div>`;
        });
    });

    safeRender('blueprint-store', store => {
        store.innerHTML = '';
        for(let key in BP_DB) { if (!gameState.unlockedBPs.includes(key)) { store.innerHTML += `<div style="background:rgba(0,0,0,0.3); padding:10px; border:1px solid #4a3f35; margin-bottom:10px; border-radius:4px;"><strong>${BP_DB[key].name}</strong><br><span style="color:#aaa; font-size:0.85em;">解锁需: <span style="color:#3498db">🏅${BP_DB[key].cost}</span> 声望</span><br><button onclick="unlockBP('${key}')" ${gameState.reputation >= BP_DB[key].cost ? '' : 'disabled'} style="margin-top:5px; background:#2980b9;">研究解锁</button></div>`; } }
    });

    safeRender('tool-shelf', tShelf => {
        tShelf.innerHTML = '';
        for(let k in gameState.toolShelf) {
            let [bId, qual] = k.split('|'); let bp = BP_DB[bId]; 
            if(bp) { let price = Math.floor(bp.basePrice *[1, 1.2, 1.5, 2][parseInt(qual)-1] || 1); tShelf.innerHTML += `<div class="tool-card border-q-${qual}"><div class="badge-count">${gameState.toolShelf[k]}</div><span class="q-${qual}" style="font-weight:bold; font-size:0.9em; text-align:center;">${bp.name}</span><span class="tool-price">${price}G</span></div>`; }
        }
    });

    safeRender('shelf', shelfDiv => {
        shelfDiv.innerHTML = ''; let targetOrder = gameState.selectingOrderIndex !== null ? gameState.guildOrders[gameState.selectingOrderIndex] : null;
        gameState.shelf.forEach((w, index) => {
            if (w === 'crafting') { shelfDiv.innerHTML += `<div class="rpg-card" style="align-items:center; justify-content:center; color:#e67e22; border-top-color:#e67e22; animation: pulse 2s infinite;">🔨 锻造进行中...</div>`; return; }
            if (!w) { shelfDiv.innerHTML += `<div class="rpg-card" style="border-top-color:#333; align-items:center; justify-content:center; color:#555;">[空货架槽位]</div>`; return; }
            let isEligible = targetOrder && targetOrder.type === 'weapon' && w.name === targetOrder.reqName && w.rarity >= targetOrder.reqRarity && w.lv >= targetOrder.reqLv;
            let html = `<div class="rpg-card border-q-${w.rarity} ${isEligible ? 'selectable' : ''}" ${isEligible ? `onclick="fulfillOrderWithItem(${index})"` : ''}>
                <button class="btn-trash" onclick="trashWeapon(event, ${index})" style="position:absolute; top:8px; right:8px;">🗑️</button>
                <div class="r-header"><div class="r-title q-${w.rarity}">${"⭐".repeat(w.stars)} Lv.${w.lv} ${w.name}</div><div class="r-cp-badge">战力 ${w.cp}</div>
                <div class="r-subtitle">适用: ${BP_DB[w.bpId] ? BP_DB[w.bpId].classes.join('/') : ''} | <span style="color:${w.element === '无属性' ? '#888' : '#e74c3c'}">${w.element}</span></div></div>
                <div class="r-main-stats"><div class="r-stat"><span class="r-stat-val">${w.stats.atk}</span><span class="r-stat-label">ATK</span></div><div class="r-stat"><span class="r-stat-val">${w.stats.def}</span><span class="r-stat-label">DEF</span></div><div class="r-stat"><span class="r-stat-val">${w.stats.spd}</span><span class="r-stat-label">SPD</span></div></div>
                <div class="r-affixes">${w.affixes.map(a => `<div class="r-affix-item">${a}</div>`).join('')}</div>
                <div class="r-footer"><span>市场估价</span><span class="r-price">${w.basePrice} G</span></div>`;
            if (isEligible) { html += `<div style="text-align:center; margin-top:10px; color:#f1c40f; font-weight:bold; background:rgba(241,196,15,0.2); padding:5px; border-radius:4px;">👉 点击上交悬赏</div>`; } 
            else if (w.offers && w.offers.length > 0) {
                let off = w.offers[0]; let color = off.price > w.basePrice ? '#2ecc71' : '#e74c3c';
                html += `<div class="offer-box"><span>${off.isAdventurer ? '⚔️' : '🧑‍🌾'} ${off.npc}出价: <strong style="color:${color};">${off.price}G</strong></span><div style="display:flex; gap:5px;"><button style="background:#27ae60;border:none;" onclick="acceptAdvOffer(event, ${index}, '${off.advId}')">卖</button> <button style="background:#c0392b;border:none;" onclick="rejectOffer(event, ${index})">拒</button></div></div>`;
            }
            shelfDiv.innerHTML += html + `</div>`;
        });
    });

    safeRender('acquisition-shelf', acqDiv => {
        acqDiv.innerHTML = '';
        gameState.acquisitionSlots.forEach((offer, idx) => {
            if (!offer) { acqDiv.innerHTML += `<div class="rpg-card" style="border-top-color:#333; align-items:center; justify-content:center; color:#555; height:60px;">[空位]</div>`; return; }
            acqDiv.innerHTML += `<div class="rpg-card border-q-3" style="padding:8px;"><div style="font-size:0.9em; margin-bottom:5px;"><strong>${offer.npc}</strong> 兜售战利品：</div><div style="color:#f4d03f; font-weight:bold; margin-bottom:10px;">${RAW_DB[offer.rawKey]?RAW_DB[offer.rawKey].name:'未知材料'} x${offer.amount}</div><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#e74c3c;">索要: ${offer.price}G</span><div><button style="background:#27ae60;border:none;padding:4px 8px;" onclick="acceptAcquisition(${idx})">收购</button> <button style="background:#c0392b;border:none;padding:4px 8px;" onclick="rejectAcquisition(${idx})">拒绝</button></div></div></div>`;
        });
    });

    safeRender('adventurer-list', advDiv => {
        advDiv.innerHTML = '';
        gameState.adventurers.forEach(adv => {
            let totalCp = calcAdvCP(adv);
            let statusHtml = adv.status === 'idle' ? `<div class="adv-status status-idle">🍻 寻找装备中</div>` : (adv.status === 'expedition' ? `<div class="adv-status" style="background:rgba(52,152,219,0.2);color:#3498db;">🚀 响应远征中</div>` : `<div class="adv-status status-dungeon">⚔️ 地下城奋战 (${adv.timer}h)</div>`);
            let wHtml = adv.gear.weapon ? `<span class="q-${adv.gear.weapon.rarity}">Lv.${adv.gear.weapon.lv} ${adv.gear.weapon.name}</span>` : '空手(胜率低)';
            let aHtml = adv.gear.armor ? `<span class="q-${adv.gear.armor.rarity}">Lv.${adv.gear.armor.lv} ${adv.gear.armor.name}</span>` : '便装';
            advDiv.innerHTML += `<div class="adv-card"><div class="adv-avatar">${adv.emoji}</div><div class="adv-info"><div><span class="adv-name">${adv.name}</span> <span class="adv-bg">${adv.bg}</span> <span class="adv-class">${adv.class} Lv.${adv.level}</span> <span style="float:right; color:#f1c40f;">💰${adv.gold}G</span></div><div class="adv-cp">战力: ${totalCp}</div><div class="adv-gear">⚔️ ${wHtml} | 🛡️ ${aHtml}</div>${statusHtml}</div></div>`;
        });
    });

// 采用通用渲染逻辑，兼容 dungeon-list 和 dungeon-view 两种 HTML ID
    let renderDungeonUI = (dunDiv) => {
        dunDiv.innerHTML = '';
        DUNGEONS.forEach((d, index) => {
            if(index > 0 && !DUNGEONS[index-1].isExplored) {
                dunDiv.innerHTML += `<div class="dungeon-card dun-locked"><div class="dun-info"><div class="dun-title">第 ${d.level} 层: ???</div><div class="dun-detail">推荐战力: ??? | 优势元素: ???<br>必须先通关上一层！</div></div></div>`;
            } else {
                let explorers = gameState.adventurers.filter(a => a.status === 'dungeon' && a.targetDungeonId === d.id);
                let exHtml = explorers.map(a => a.emoji).join(' ');
                let cost = d.expCost || (d.level * 1000);
                let btn = gameState.expedition.active ? `<button disabled>已有远征进行中</button>` : `<button style="background:#c0392b; border-color:#e74c3c;" onclick="publishExpedition(${d.id})">招募远征(${cost}G)</button>`;
                dunDiv.innerHTML += `<div class="dungeon-card"><div class="dun-info"><div class="dun-title">第 ${d.level} 层: ${d.name} ${d.isExplored ? '(已通关)' : '(未首通)'}</div><div class="dun-detail">推荐战力: <span style="color:#e74c3c">${d.reqCp}</span> | 优势元素: <span style="color:#3498db">${d.element}</span></div><div style="margin-top:5px; font-size:0.85em; color:#aaa;">当前散客: ${exHtml || '无'}</div></div><div class="dun-action">${btn}</div></div>`;
            }
        });
    };
    safeRender('dungeon-list', renderDungeonUI);
    safeRender('dungeon-view', renderDungeonUI);


    safeRender('active-expedition-status', expSt => {
        if (gameState.expedition.active) {
            let nStr = gameState.expedition.members.map(id => { let a = gameState.adventurers.find(adv => adv.id === id); return a ? a.emoji : ''; }).join(' ');
            if (gameState.expedition.status === 'recruiting') { expSt.innerHTML = `<span style="color:#f1c40f;">📢 招募队员 (${gameState.expedition.members.length}/${gameState.expedition.reqMembers}) (剩余 ${gameState.expedition.timer}h)<br>已入队: ${nStr || '无'}</span>`; } 
            else { expSt.innerHTML = `<span style="color:#e74c3c; animation: pulse 2s infinite;">⚔️ 激战首领中... (倒计时 ${gameState.expedition.timer}h)<br>参战: ${nStr}</span>`; }
        } else { expSt.innerHTML = '暂无队伍。发布远征悬赏以获取宝石！'; }
    });

    safeRender('guild-orders', ordersDiv => {
        ordersDiv.innerHTML = '';
        gameState.guildOrders.forEach((order, index) => {
            if (order.type === 'tool') {
                let countOwned = 0; for (let k in gameState.toolShelf) { if (k.startsWith(order.reqId + '|')) countOwned += gameState.toolShelf[k]; }
                let isReady = countOwned >= order.reqAmount;
                ordersDiv.innerHTML += `<div class="order-card"><strong>悬赏: ${order.reqAmount}把【${order.reqName}】</strong><br>奖励: <span style="color:#f1c40f">${order.rewardGold}G</span> + 🏅${order.rewardRep}<br><button style="margin-top:5px; width:100%;" onclick="submitToolOrder(${index})" ${isReady ? '' : 'disabled'}>${isReady ? '📦 上交 (自动扣除百货)' : '❌ 数量不足'}</button></div>`;
            } else {
                let hasItem = gameState.shelf.some(i => i && i !== 'crafting' && i.name === order.reqName && i.rarity >= order.reqRarity && i.lv >= order.reqLv);
                ordersDiv.innerHTML += `<div class="order-card" style="${gameState.selectingOrderIndex === index ? 'border-color:#e74c3c; background:rgba(44,62,80,0.9);' : ''}"><strong>悬赏: <span class="q-${order.reqRarity}">${order.reqName} (Lv.${order.reqLv}+ / ${Q_NAMES[order.reqRarity-1]}+)</span></strong><br>奖励: <span style="color:#f1c40f">${order.rewardGold}G</span> + 🏅${order.rewardRep}<br>${gameState.selectingOrderIndex === index ? `<button style="background:#e74c3c; margin-top:5px; width:100%;" onclick="cancelOrderSelect()">❌ 取消选择</button>` : `<button style="margin-top:5px; width:100%;" onclick="startOrderSelect(${index})" ${hasItem ? '' : 'disabled'}>${hasItem ? '📦 去货架选一把交货' : '❌ 无符合装备'}</button>`}</div>`;
            }
        });
    });

    let btnTime = document.getElementById('btn-time-toggle');
    if (btnTime) {
        if (gameState.isPaused) { btnTime.className = "btn-time paused"; btnTime.innerText = "⏸️ 时间静止 (点击启动)"; } 
        else { btnTime.className = "btn-time playing"; btnTime.innerText = "▶️ 时间流逝 (点击暂停)"; }
    }
}

// 强制启动入口，杜绝白板！
// ==========================================
// 存档系统与生命周期管理
// ==========================================

function saveGame(isAuto = false) {
    // 将整个游戏状态转化为字符串，存入浏览器本地缓存
    localStorage.setItem('isekai_blacksmith_save', JSON.stringify(gameState));
    if (!isAuto) {
        playSound('success');
        showEventModal("💾 保存成功", "游戏进度已成功保存在浏览器缓存中！<br>即便关闭页面或刷新，进度也不会丢失。", null);
    }
}

function loadGame() {
    let savedData = localStorage.getItem('isekai_blacksmith_save');
    if (savedData) {
        gameState = JSON.parse(savedData);
        playSound('coin');
        updateUI();
        showEventModal("📂 读取成功", "欢迎回到异世界，铁匠老板！您的游戏进度已恢复。", null);
    } else {
        alert("没有找到本地存档记录！");
    }
}

function resetGame() {
    if (confirm("⚠️ 警告：这会清空您的所有进度、金币和装备，并且无法恢复！\n您确定要重新开始创业吗？")) {
        localStorage.removeItem('isekai_blacksmith_save');
        location.reload(); // 强制刷新网页，一切从零开始
    }
}

// 强制启动入口：优先读取存档，如果没有存档再进行新生初始化
window.onload = function() {
    let savedData = localStorage.getItem('isekai_blacksmith_save');
    if (savedData) {
        // 如果有存档，直接反序列化覆盖
        gameState = JSON.parse(savedData);
        log(`💾 已自动读取本地存档记录！`, 'internal');
    } else {
        // 如果是纯新玩家，初始化第一天的生态
        if (gameState.adventurers.length === 0) initAdventurers();
        if (gameState.market.length === 0) generateMarket();
        if (gameState.guildOrders.length === 0) { 
            generateGuildOrder(); generateGuildOrder(); 
        }
        log(`✨ 欢迎来到异世界！你的铁匠铺开业了！`, 'internal');
    }
    updateUI();
};