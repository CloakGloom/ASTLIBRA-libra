import { Accessory, AccessoryCategory, AccessoryEffect, AccessoryWeights } from '../types'
import { AccSchoolPreset } from './accessories'

// 词条构造助手
function ae(id: string, name: string, category: AccessoryCategory, value: number): AccessoryEffect {
  return { id, name, category, value }
}
// 饰品构造助手
function acc(id: string, name: string, effects: AccessoryEffect[], special?: string): Accessory {
  return { id, name, effects, special }
}

// 外传饰品数据库（59 件，属性与特效和本篇有差异）
export const GAIDEN_ACCESSORIES: Accessory[] = [
  acc('acc_01', '木制环', [ae('spd', '敏捷', 'SPD', 5)]),
  acc('acc_02', '漂亮的戒指', [ae('atk', '攻击力', 'ATK', 5)]),
  acc('acc_03', '骨项链', [ae('def', '防御力', 'DEF', 3), ae('blk', '格挡', 'BLK', 5), ae('spd', '敏捷', 'SPD', 6)]),
  acc('acc_04', '牙符', [ae('foc', '最大精力', 'FOC', 5), ae('atk', '攻击力', 'ATK', 3), ae('def', '防御力', 'DEF', 5)]),
  acc('acc_05', '龙杯', [ae('spd', '敏捷', 'SPD', 5), ae('lck', '幸运', 'LCK', 2), ae('adp', '适应力', 'ADP', 5)], 'ST持续时间延长'),
  acc('acc_06', '铁环', [ae('sta', '最大体力', 'STA', 10), ae('def', '防御力', 'DEF', 5), ae('blk', '格挡', 'BLK', 5), ae('spd', '敏捷', 'SPD', -5)]),
  acc('acc_07', '脚镣', [ae('def', '防御力', 'DEF', 6), ae('blk', '格挡', 'BLK', 30), ae('spd', '敏捷', 'SPD', -30), ae('adp', '适应力', 'ADP', 10)]),
  acc('acc_08', '火焰戒指', [ae('sta', '最大体力', 'STA', 20), ae('mag', '魔导力', 'MAG', 6)]),
  acc('acc_09', '本土勋章', [ae('spd', '敏捷', 'SPD', 2), ae('res', '抗性', 'RES', 40), ae('lck', '幸运', 'LCK', 5)]),
  acc('acc_10', '龙之琴', [ae('spd', '敏捷', 'SPD', 5), ae('lck', '幸运', 'LCK', 5), ae('adp', '适应力', 'ADP', 2)], '连击持续时间延长'),
  acc('acc_11', '纯白的羽毛', [ae('foc', '最大精力', 'FOC', 10), ae('mag', '魔导力', 'MAG', 8), ae('res', '抗性', 'RES', 20)]),
  acc('acc_12', '螺旋环', [ae('sta', '最大体力', 'STA', 20), ae('def', '防御力', 'DEF', 5), ae('blk', '格挡', 'BLK', 10)]),
  acc('acc_13', '蓝色宝石吊坠', [ae('def', '防御力', 'DEF', 8), ae('res', '抗性', 'RES', 20), ae('res', '抗性', 'RES', 20), ae('res', '抗性', 'RES', 20)]),
  acc('acc_14', '力量戒指', [ae('atk', '攻击力', 'ATK', 15), ae('def', '防御力', 'DEF', 5)]),
  acc('acc_15', '龙环', [ae('spd', '敏捷', 'SPD', 5), ae('lck', '幸运', 'LCK', 2), ae('adp', '适应力', 'ADP', 2)], '远程攻击伤害也会影响'),
  acc('acc_16', '金项链', [ae('sta', '最大体力', 'STA', 60)]),
  acc('acc_17', '龙杖', [ae('spd', '敏捷', 'SPD', 5), ae('lck', '幸运', 'LCK', 2), ae('adp', '适应力', 'ADP', 2)], '远程攻击伤害减少'),
  acc('acc_18', '伊诺里戒指', [ae('foc', '最大精力', 'FOC', 20), ae('mag', '魔导力', 'MAG', 15)]),
  acc('acc_19', '蛇神戒', [ae('def', '防御力', 'DEF', 8), ae('blk', '格挡', 'BLK', 10), ae('adp', '适应力', 'ADP', 20)]),
  acc('acc_20', '隐形穿刺', [ae('spd', '敏捷', 'SPD', 6), ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30)]),
  acc('acc_21', '花环', [ae('sta', '最大体力', 'STA', 50), ae('foc', '最大精力', 'FOC', 20)]),
  acc('acc_22', '十字架', [ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30), ae('res', '抗性', 'RES', 30)]),
  acc('acc_23', '凤凰羽毛', [ae('foc', '最大精力', 'FOC', 40), ae('mag', '魔导力', 'MAG', 20)]),
  acc('acc_24', '龙皮鞋', [ae('spd', '敏捷', 'SPD', 10), ae('lck', '幸运', 'LCK', 2), ae('adp', '适应力', 'ADP', 2)], '空中跳跃次数+1'),
  acc('acc_25', '守护戒', [ae('sta', '最大体力', 'STA', 50), ae('atk', '攻击力', 'ATK', -20), ae('def', '防御力', 'DEF', 20), ae('blk', '格挡', 'BLK', 20)]),
  acc('acc_26', '金手链', [ae('sta', '最大体力', 'STA', 100), ae('lck', '幸运', 'LCK', 20)]),
  acc('acc_27', '古代环', [ae('foc', '最大精力', 'FOC', 20), ae('blk', '格挡', 'BLK', 20), ae('res', '抗性', 'RES', 20)]),
  acc('acc_28', '古代项链', [ae('def', '防御力', 'DEF', 20), ae('mag', '魔导力', 'MAG', 25), ae('res', '抗性', 'RES', 20)]),
  acc('acc_29', '花戒', [ae('atk', '攻击力', 'ATK', 25), ae('spd', '敏捷', 'SPD', 10), ae('lck', '幸运', 'LCK', 10)]),
  acc('acc_30', '坦桑石戒', [ae('foc', '最大精力', 'FOC', 10), ae('mag', '魔导力', 'MAG', 10), ae('adp', '适应力', 'ADP', 30)]),
  acc('acc_31', '力量手套', [ae('atk', '攻击力', 'ATK', 35), ae('res', '抗性', 'RES', 20), ae('res', '抗性', 'RES', 10)]),
  acc('acc_32', '元素披风', [ae('res', '抗性', 'RES', 40), ae('res', '抗性', 'RES', 40), ae('res', '抗性', 'RES', 40), ae('res', '抗性', 'RES', 40)]),
  acc('acc_33', '恶魔戒', [ae('sta', '最大体力', 'STA', 100), ae('foc', '最大精力', 'FOC', 20), ae('res', '抗性', 'RES', 10)]),
  acc('acc_34', '龙女戒', [ae('sta', '最大体力', 'STA', 100), ae('atk', '攻击力', 'ATK', 15), ae('def', '防御力', 'DEF', 15), ae('blk', '格挡', 'BLK', 10)]),
  acc('acc_35', '万圣节腰带', [ae('sta', '最大体力', 'STA', 100), ae('atk', '攻击力', 'ATK', 20), ae('res', '抗性', 'RES', 40), ae('res', '抗性', 'RES', 40)]),
  acc('acc_36', '魔法手套', [ae('mag', '魔导力', 'MAG', 50)]),
  acc('acc_37', '魔矿石戒', [ae('sta', '最大体力', 'STA', 50), ae('def', '防御力', 'DEF', 20), ae('mag', '魔导力', 'MAG', 10), ae('res', '抗性', 'RES', 40)]),
  acc('acc_38', '魔法壳', [ae('sta', '最大体力', 'STA', 200), ae('def', '防御力', 'DEF', 30), ae('blk', '格挡', 'BLK', 20), ae('lck', '幸运', 'LCK', 5)]),
  acc('acc_39', '英雄的发饰', [ae('atk', '攻击力', 'ATK', 50), ae('def', '防御力', 'DEF', 50), ae('spd', '敏捷', 'SPD', 10)]),
  acc('acc_40', '暗物质', [ae('foc', '最大精力', 'FOC', 50), ae('mag', '魔导力', 'MAG', 30), ae('lck', '幸运', 'LCK', 10)]),
  acc('acc_41', '能力护目镜', [], '盘附加能力概率上升'),
  acc('acc_42', '特殊护目镜', [], '盘附加特殊概率上升'),
  acc('acc_43', '稀有石板', [], '稀有盘更容易出'),
  acc('acc_44', '探知石板', [], '盘更容易出'),
  acc('acc_45', '盗贼手套', [ae('lck', '幸运', 'LCK', 20)], '敌人物品掉落率大幅增加'),
  acc('acc_46', '茨之徽章', [ae('spd', '敏捷', 'SPD', 10), ae('res', '抗性', 'RES', 30)], '突刺伤害增加'),
  acc('acc_47', '石之徽章', [ae('def', '防御力', 'DEF', 10), ae('res', '抗性', 'RES', 30)], '打击伤害增加'),
  acc('acc_48', '月桂徽章', [ae('sta', '最大体力', 'STA', 50), ae('mag', '魔导力', 'MAG', 10), ae('res', '抗性', 'RES', 30)], 'HP回复量增加'),
  acc('acc_49', '勇气音乐盒', [ae('mag', '魔导力', 'MAG', 30), ae('spd', '敏捷', 'SPD', 30), ae('lck', '幸运', 'LCK', 30)], '无法获得经验'),
  acc('acc_50', '黄金齿轮', [ae('sta', '最大体力', 'STA', 200), ae('lck', '幸运', 'LCK', 30)], '当前装备风格的盘更容易出'),
  acc('acc_51', '舔糖果', [ae('sta', '最大体力', 'STA', 100), ae('def', '防御力', 'DEF', 30), ae('res', '抗性', 'RES', 50)], '击败敌人时恢复生命'),
  acc('acc_52', '反射环', [ae('sta', '最大体力', 'STA', 300), ae('blk', '格挡', 'BLK', 20)], '反弹子弹威力大幅提升'),
  acc('acc_53', '飞马羽毛靴', [ae('atk', '攻击力', 'ATK', 5), ae('def', '防御力', 'DEF', 5), ae('spd', '敏捷', 'SPD', 5)], '地形伤害无效'),
  acc('acc_54', '永恒的加利亚罪', [ae('sta', '最大体力', 'STA', 50), ae('def', '防御力', 'DEF', 20), ae('spd', '敏捷', 'SPD', 10)], '持续保持奔跑状态'),
  acc('acc_55', '凯撒幼子', [ae('foc', '最大精力', 'FOC', 20), ae('atk', '攻击力', 'ATK', 20), ae('spd', '敏捷', 'SPD', 10)], '追加攻击伤害大幅提升'),
  acc('acc_56', '硬币奖章', [ae('lck', '幸运', 'LCK', 20)], '硬币获得量1.3倍'),
  acc('acc_57', '部队勋章', [ae('lck', '幸运', 'LCK', 20)], '力量晶体获得量1.3倍'),
  acc('acc_58', '级别奖章', [ae('lck', '幸运', 'LCK', 20)], '经验获得1.3倍'),
  acc('acc_59', 'KEIZO徽章', [ae('sta', '最大体力', 'STA', 7), ae('atk', '攻击力', 'ATK', 7), ae('mag', '魔导力', 'MAG', 7)], '更容易获得稀有装备'),
]

// 流派一键模板（同本篇）
export const GAIDEN_SCHOOL_PRESETS: AccSchoolPreset[] = [
  { key: 'dps', name: '暴力输出', weights: { attack: 10, defense: 3, agility: 5, stamina: 4, focus: 4, magic: 8, block: 2, luck: 3, adapt: 2, resist: 2 } },
  { key: 'tank', name: '坚盾坦克', weights: { attack: 3, defense: 10, agility: 2, stamina: 8, focus: 4, magic: 2, block: 10, luck: 3, adapt: 5, resist: 10 } },
  { key: 'agile', name: '灵敏闪避', weights: { attack: 5, defense: 4, agility: 10, stamina: 5, focus: 8, magic: 2, block: 3, luck: 4, adapt: 8, resist: 4 } },
  { key: 'loot', name: '欧皇刷宝', weights: { attack: 4, defense: 4, agility: 4, stamina: 4, focus: 4, magic: 4, block: 3, luck: 10, adapt: 4, resist: 4 } },
]

export const GAIDEN_DEFAULT_WEIGHTS: AccessoryWeights = {
  attack: 5, defense: 5, agility: 5, stamina: 5, focus: 5,
  magic: 5, block: 5, luck: 5, adapt: 5, resist: 5,
}
