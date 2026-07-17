# ⚖️ ASTLIBRA 天平配平优化器

纯前端工具，为 [ASTLIBRA（神之天平）](https://store.steampowered.com/app/1718570/ASTLIBRA_Revision/) 的天秤（LIBRA）系统提供智能配平方案。

## 功能

- 📂 **存档导入**：直接读取 `SAVE_XXXX.DAT`，自动提取饰品、背包道具、槽位配置
- ⚖️ **三策略配平**：
  - 配平不重复 — 100% 平衡 + 零重复词条
  - 配平可重复 — 100% 平衡（允许重复）
  - 非配平不重复 — 重量差 ≤3 + 零重复
- 📋 **词条效果对照表**：左右盘效果并排对比，冲突词条高亮
- 💍 **饰品配装**：独立模块，遗传算法寻优
- 🎮 **本篇 / 外伝 双模式**：一键切换数据库
- 🔍 **自动速度配平**：组合枚举 + 按需扫描，毫秒级出结果

## 技术栈

- React 18 + TypeScript
- Ant Design 5（深色主题）
- ECharts（雷达图）
- Web Worker（后台计算）
- File System Access API（快捷存档目录）

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## 数据来源

- [ASTLIBRA @ ウィキ](https://w.atwiki.jp/astlibra/)
- 游戏存档逆向分析

## 作者

[Bilibili](https://space.bilibili.com/199190474)

## License

[MIT](LICENSE)
