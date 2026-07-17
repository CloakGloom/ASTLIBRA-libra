import { Accessory, AccessoryCategory, AccessoryEffect, AccessoryWeights } from '../types'

// 词条构造助手
function ae(id: string, name: string, category: AccessoryCategory, value: number): AccessoryEffect {
  return { id, name, category, value }
}
// 饰品构造助手（special 为特殊效果描述）
function acc(id: string, name: string, effects: AccessoryEffect[], special?: string): Accessory {
  return { id, name, effects, special }
}

// 内置真实饰品库（68 件，来自游戏全饰品表；属性已映射为数值维度）
export const ACC_ACCESSORIES: Accessory[] = [
  acc('acc_01', '木戒指', [ae('spd', '敏捷', 'SPD', 15)]),
  acc('acc_02', '漂亮的戒指', [ae('atk', '攻击力', 'ATK', 2)]),
  acc('acc_03', '碎骨项链', [ae('def', '防御力', 'DEF', 2), ae('blk', '格挡', 'BLK', 2), ae('spd', '敏捷', 'SPD', 6)]),
  acc('acc_04', '牙齿护身符', [ae('foc', '最大精力', 'FOC', 5), ae('atk', '攻击力', 'ATK', 3), ae('blk', '格挡', 'BLK', 5)]),
  acc('acc_05', '龙酒杯', [ae('spd', '敏捷', 'SPD', 5), ae('lck', '幸运', 'LCK', 2), ae('adp', '适应力', 'ADP', 5)], '增加精力持续时间'),
  acc('acc_06', '铁戒', [ae('sta', '最大体力', 'STA', 10), ae('def', '防御力', 'DEF', 4), ae('blk', '格挡', 'BLK', 5), ae('spd', '敏捷', 'SPD', -5)]),
  acc('acc_07', '脚镣', [ae('def', '防御力', 'DEF', 6), ae('blk', '格挡', 'BLK', 30), ae('spd', '敏捷', 'SPD', -30), ae('adp', '适应力', 'ADP', 10)]),
  acc('acc_08', '火焰戒指', [ae('sta', '最大体力', 'STA', 20), ae('mag', '魔导力', 'MAG', 6)]),
  acc('acc_09', '印第安饰品', [ae('spd', '敏捷', 'SPD', 2), ae('res', '抗性', 'RES', 40), ae('lck', '幸运', 'LCK', 5)]),
  acc('acc_10', '龙竖琴', [ae('spd', '敏捷', 'SPD', 5), ae('lck', '幸运', 'LCK', 5), ae('adp', '适应力', 'ADP', 2)], '增加连击持续时间'),
  acc('acc_11', '纯白羽翼', [ae('foc', '最大精力', 'FOC', 10), ae('mag', '魔导力', 'MAG', 8), ae('res', '抗性', 'RES', 20)]),
  acc('acc_12', '螺旋戒', [ae('sta', '最大体力', 'STA', 20), ae('def', '防御力', 'DEF', 5), ae('blk', '格挡', 'BLK', 10)]),
  acc('acc_13', '苍宝石耳坠', [ae('def', '防御力', 'DEF', 8), ae('res', '抗性', 'RES', 20), ae('res', '抗性', 'RES', 20), ae('res', '抗性', 'RES', 20)]),
  acc('acc_14', '力量戒', [ae('atk', '攻击力', 'ATK', 15), ae('def', '防御力', 'DEF', -5)]),
  acc('acc_15', '龙戒', [ae('spd', '敏捷', 'SPD', 5), ae('lck', '幸运', 'LCK', 2), ae('adp', '适应力', 'ADP', 2)], '增加远程攻击力'),
  acc('acc_16', '金项链', [ae('sta', '最大体力', 'STA', 60)]),
  acc('acc_17', '龙法杖', [ae('spd', '敏捷', 'SPD', 2), ae('lck', '幸运', 'LCK', 2), ae('adp', '适应力', 'ADP', 2)], '增加远程攻击防御'),
  acc('acc_18', '祈祷戒', [ae('foc', '最大精力', 'FOC', 20), ae('mag', '魔导力', 'MAG', 15)]),
  acc('acc_19', '蛇神戒', [ae('def', '防御力', 'DEF', 8), ae('blk', '格挡', 'BLK', 10), ae('adp', '适应力', 'ADP', 20)]),
  acc('acc_20', '祖母绿耳环', [ae('spd', '敏捷', 'SPD', 6), ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30)]),
  acc('acc_21', '花环', [ae('sta', '最大体力', 'STA', 50), ae('foc', '最大精力', 'FOC', 20)]),
  acc('acc_22', '十字架', [ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30)]),
  acc('acc_23', '不死鸟羽毛', [ae('foc', '最大精力', 'FOC', 40), ae('mag', '魔导力', 'MAG', 20)]),
  acc('acc_24', '龙皮靴', [ae('spd', '敏捷', 'SPD', 10), ae('lck', '幸运', 'LCK', 2), ae('adp', '适应力', 'ADP', 2)], '增加一次跳跃'),
  acc('acc_25', '守护戒', [ae('sta', '最大体力', 'STA', 50), ae('atk', '攻击力', 'ATK', -20), ae('def', '防御力', 'DEF', 20), ae('blk', '格挡', 'BLK', 20)]),
  acc('acc_26', '金色假发', [ae('blk', '格挡', 'BLK', 10), ae('spd', '敏捷', 'SPD', 10), ae('lck', '幸运', 'LCK', 10)]),
  acc('acc_27', '泪珠项链', [ae('spd', '敏捷', 'SPD', 5), ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30), ae('adp', '适应力', 'ADP', 10)]),
  acc('acc_28', '金手镯', [ae('sta', '最大体力', 'STA', 100), ae('lck', '幸运', 'LCK', 20)]),
  acc('acc_29', '古代戒', [ae('foc', '最大精力', 'FOC', 20), ae('blk', '格挡', 'BLK', 20), ae('res', '抗性', 'RES', 20)]),
  acc('acc_30', '古代项链', [ae('def', '防御力', 'DEF', 20), ae('mag', '魔导力', 'MAG', 25), ae('res', '抗性', 'RES', 20)]),
  acc('acc_31', '花戒', [ae('atk', '攻击力', 'ATK', 25), ae('spd', '敏捷', 'SPD', 10), ae('lck', '幸运', 'LCK', 10)]),
  acc('acc_32', '坦桑石戒', [ae('foc', '最大精力', 'FOC', 10), ae('mag', '魔导力', 'MAG', 10), ae('adp', '适应力', 'ADP', 30)]),
  acc('acc_33', '力量手套', [ae('atk', '攻击力', 'ATK', 35), ae('res', '抗性', 'RES', 20), ae('res', '抗性', 'RES', 10)]),
  acc('acc_34', '元素披风', [ae('res', '抗性', 'RES', 40), ae('res', '抗性', 'RES', 40), ae('res', '抗性', 'RES', 40), ae('res', '抗性', 'RES', 40)]),
  acc('acc_35', '恶魔戒', [ae('sta', '最大体力', 'STA', 100), ae('foc', '最大精力', 'FOC', 20), ae('res', '抗性', 'RES', 10)]),
  acc('acc_36', '龙女戒', [ae('sta', '最大体力', 'STA', 100), ae('atk', '攻击力', 'ATK', 15), ae('def', '防御力', 'DEF', 15), ae('blk', '格挡', 'BLK', 10)]),
  acc('acc_37', '万圣节腰带', [ae('sta', '最大体力', 'STA', 100), ae('atk', '攻击力', 'ATK', 20), ae('res', '抗性', 'RES', 40), ae('res', '抗性', 'RES', 40)]),
  acc('acc_38', '魔法手套', [ae('mag', '魔导力', 'MAG', 50)]),
  acc('acc_39', '金怀表', [ae('foc', '最大精力', 'FOC', 30), ae('spd', '敏捷', 'SPD', 20), ae('res', '抗性', 'RES', 40), ae('lck', '幸运', 'LCK', 10)]),
  acc('acc_40', '魔矿石戒', [ae('sta', '最大体力', 'STA', 50), ae('def', '防御力', 'DEF', 20), ae('mag', '魔导力', 'MAG', 10), ae('res', '抗性', 'RES', 40)]),
  acc('acc_41', '魔法壳', [ae('sta', '最大体力', 'STA', 200), ae('def', '防御力', 'DEF', 30), ae('blk', '格挡', 'BLK', 20), ae('lck', '幸运', 'LCK', 5)]),
  acc('acc_42', '英雄的发饰', [ae('atk', '攻击力', 'ATK', 50), ae('def', '防御力', 'DEF', 50), ae('spd', '敏捷', 'SPD', 10)]),
  acc('acc_43', '暗物质宝珠', [ae('foc', '最大精力', 'FOC', 50), ae('mag', '魔导力', 'MAG', 30), ae('lck', '幸运', 'LCK', 10)]),
  acc('acc_44', '荣耀宝珠', [ae('sta', '最大体力', 'STA', 300), ae('def', '防御力', 'DEF', 50), ae('blk', '格挡', 'BLK', 30), ae('mag', '魔导力', 'MAG', 10)]),
  acc('acc_45', '能力护目镜', [], '增加掉落+能力的装备盘'),
  acc('acc_46', '特殊护目镜', [], '增加掉落+特殊的装备盘'),
  acc('acc_47', '排斥石板', [], '减少掉落装备盘概率'),
  acc('acc_48', '探知石板', [], '增加掉落装备盘概率'),
  acc('acc_49', '盗贼手套', [ae('lck', '幸运', 'LCK', 20)], '大幅提升敌人的掉落率'),
  acc('acc_50', '荆棘徽章', [ae('sta', '最大体力', 'STA', 200), ae('spd', '敏捷', 'SPD', 20), ae('res', '抗性', 'RES', 30)], '增加突刺伤害'),
  acc('acc_51', '石块徽章', [ae('sta', '最大体力', 'STA', 200), ae('def', '防御力', 'DEF', 50), ae('res', '抗性', 'RES', 30)], '增加打击伤害'),
  acc('acc_52', '菖蒲徽章', [ae('mag', '魔导力', 'MAG', 50), ae('spd', '敏捷', 'SPD', 10), ae('res', '抗性', 'RES', 30)], '法杖的魔法速度上升'),
  acc('acc_53', '月桂徽章', [ae('sta', '最大体力', 'STA', 300), ae('res', '抗性', 'RES', 30)], '增加体力回复量'),
  acc('acc_54', '鹰戒', [ae('spd', '敏捷', 'SPD', 40)], '后撤变为前冲'),
  acc('acc_55', '纯金锚', [ae('spd', '敏捷', 'SPD', -9999), ae('res', '抗性', 'RES', 50), ae('lck', '幸运', 'LCK', 20)]),
  acc('acc_56', '龟壳', [ae('def', '防御力', 'DEF', 50), ae('spd', '敏捷', 'SPD', -50), ae('res', '抗性', 'RES', 50)], '外表变化'),
  acc('acc_57', '精金盾', [ae('sta', '最大体力', 'STA', 800), ae('def', '防御力', 'DEF', 50), ae('blk', '格挡', 'BLK', 80), ae('spd', '敏捷', 'SPD', -100)], '外观变化'),
  acc('acc_58', '勇气八音盒', [ae('lck', '幸运', 'LCK', 30)], '无法获得经验'),
  acc('acc_59', '狮子头', [ae('atk', '攻击力', 'ATK', 100), ae('spd', '敏捷', 'SPD', 20)], '外观变化'),
  acc('acc_60', '舔舔糖果', [ae('sta', '最大体力', 'STA', 200), ae('def', '防御力', 'DEF', 30), ae('res', '抗性', 'RES', 50)], '击败敌人时恢复体力'),
  acc('acc_61', '反射戒', [ae('sta', '最大体力', 'STA', 500), ae('blk', '格挡', 'BLK', 20)], '增大反射子弹的伤害'),
  acc('acc_62', '天马的羽毛靴', [ae('atk', '攻击力', 'ATK', 5), ae('def', '防御力', 'DEF', 5), ae('spd', '敏捷', 'SPD', 5)], '地形伤害无效'),
  acc('acc_63', '悠久的高卢申', [ae('sta', '最大体力', 'STA', 100), ae('blk', '格挡', 'BLK', 20), ae('spd', '敏捷', 'SPD', 15)], '持续保持奔跑状态'),
  acc('acc_64', '凯撒戒', [ae('atk', '攻击力', 'ATK', 200)], '增加追加攻击伤害'),
  acc('acc_65', '硬币勋章', [ae('lck', '幸运', 'LCK', 20)], '获得金币1.3倍'),
  acc('acc_66', '力量晶体勋章', [ae('lck', '幸运', 'LCK', 20)], '获得力量晶体1.3倍'),
  acc('acc_67', '等级勋章', [ae('lck', '幸运', 'LCK', 20)], '获得经验值1.3倍'),
  acc('acc_68', 'KEIZO徽章', [ae('sta', '最大体力', 'STA', 7), ae('atk', '攻击力', 'ATK', 7), ae('mag', '魔导力', 'MAG', 7)], '更容易掉落正在装备中的装备盘'),
]

// 流派一键模板
export interface AccSchoolPreset {
  key: string
  name: string
  weights: AccessoryWeights
}

export const ACC_SCHOOL_PRESETS: AccSchoolPreset[] = [
  {
    key: 'dps',
    name: '暴力输出',
    weights: { attack: 10, defense: 3, agility: 5, stamina: 4, focus: 4, magic: 8, block: 2, luck: 3, adapt: 2, resist: 2 },
  },
  {
    key: 'tank',
    name: '坚盾坦克',
    weights: { attack: 3, defense: 10, agility: 2, stamina: 8, focus: 4, magic: 2, block: 10, luck: 3, adapt: 5, resist: 10 },
  },
  {
    key: 'agile',
    name: '灵敏闪避',
    weights: { attack: 5, defense: 4, agility: 10, stamina: 5, focus: 8, magic: 2, block: 3, luck: 4, adapt: 8, resist: 4 },
  },
  {
    key: 'loot',
    name: '欧皇刷宝',
    weights: { attack: 4, defense: 4, agility: 4, stamina: 4, focus: 4, magic: 4, block: 3, luck: 10, adapt: 4, resist: 4 },
  },
]

export const DEFAULT_ACCESSORY_WEIGHTS: AccessoryWeights = {
  attack: 5,
  defense: 5,
  agility: 5,
  stamina: 5,
  focus: 5,
  magic: 5,
  block: 5,
  luck: 5,
  adapt: 5,
  resist: 5,
}
