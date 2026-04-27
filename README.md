# PVZ 一代图鉴攻略

一个静态网页版本的《植物大战僵尸》一代图鉴攻略，覆盖：

- 49 种植物：阳光、冷却、伤害、耐久、解锁方式和攻略要点
- 27 种僵尸：生命/韧性、特殊能力、首次出现和反制思路
- 50 个冒险模式关卡：场景、类型、旗帜、可用植物、出现僵尸、通关奖励和关卡提示

## 使用

直接打开 `index.html` 即可浏览，不需要安装依赖或启动构建工具。

## 更新数据

数据生成脚本会从 Plants vs. Zombies Wiki.gg 的页面 infobox 抓取结构化属性，并合并本仓库里的中文攻略说明：

```bash
node tools/build-data.mjs
```

生成结果写入 `src/data.generated.js`。

## 资料来源

- [Plants vs. Zombies Wiki.gg - Plants](https://plantsvszombies.wiki.gg/wiki/Plants_(PvZ))
- [Plants vs. Zombies Wiki.gg - Zombies](https://plantsvszombies.wiki.gg/wiki/Zombies_(PvZ))
- [Plants vs. Zombies Wiki.gg - Adventure Mode](https://plantsvszombies.wiki.gg/wiki/Adventure_Mode)
- [StrategyWiki - Plants vs. Zombies](https://strategywiki.org/wiki/Plants_vs._Zombies)

本项目是粉丝向资料整理。Plants vs. Zombies、相关角色和图像版权归 PopCap / EA 所有。
