# ⚖️ ASTLIBRA 天平配平优化器

纯前端工具，为 [ASTLIBRA（神之天平）](https://store.steampowered.com/app/1718570/ASTLIBRA_Revision/) 的天秤（LIBRA）系统提供智能配平方案。

## 功能

- 📂 **存档导入**：直接读取 `SAVE_XXXX.DAT`，自动提取饰品、增益道具（共 202 种）、槽位配置
- ⚖️ **三策略配平**：
  - 配平不重复 — 100% 平衡 + 零重复词条
  - 配平可重复 — 100% 平衡（允许重复）
  - 非配平不重复 — 重量差 ≤3 + 零重复
- 📋 **词条效果对照表**：左右盘效果并排对比，冲突词条高亮
- 💍 **饰品配装**：独立模块，遗传算法得到最优配装方案
- 🎮 **本篇 / 外伝 双模式**：一键切换数据库
- 🔍 **自动重算**：配置变更后自动防抖 500ms 重新计算
- 📊 **多维雷达图**：所有维度统一上限，强弱差异直观可见

## 技术栈

- React 18 + TypeScript
- Ant Design 5（深色主题）
- ECharts（雷达图）
- Web Worker（后台计算，不阻塞界面）
- Vite 5

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

也可直接双击 `start.bat` 一键启动。

## 数据说明

- 道具库仅收录**有天平增益效果**的道具（共 202 种），无增益的特殊道具（宝石、金票等）不计入
- 饰品库完整收录 68 件

## 数据来源

- [ASTLIBRA @ ウィキ](https://w.atwiki.jp/astlibra/)
- [小黑盒 - 全物品数据](https://xiaoheihe.cn/app/bbs/link/118094612)
- 游戏存档逆向分析

## 程序作者

[Bilibili](https://space.bilibili.com/199190474)

## 开源仓库

[GitHub - CloakGloom/ASTLIBRA-libra](https://github.com/CloakGloom/ASTLIBRA-libra)

> 本程序完全免费，仅供学习交流使用。

## License

[MIT](LICENSE)

## 打赏...如果有闲钱的话...谢谢！！！