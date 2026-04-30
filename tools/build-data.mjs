import { access, mkdir, writeFile } from "node:fs/promises";

const API = "https://plantsvszombies.wiki.gg/api.php";
const WIKI_BASE = "https://plantsvszombies.wiki.gg/wiki/";
const USER_AGENT = "CodexPVZGuide/1.0 (fan guide data generator)";

const PLANT_MANUAL = [
  { title: "Peashooter (PvZ)", cn: "豌豆射手", role: "基础直线输出", tags: ["白天", "直线", "单体"], guide: "第一代最标准的远程火力，适合教学和前期过渡。单株输出不高，但便宜、冷却快，能快速铺满关键行。", tips: ["放在后排同一行稳定压血，前面配坚果或土豆雷争取时间。", "遇到高血量僵尸时要尽早升级火力，或让火炬树桩把豌豆变成火焰豌豆。"] },
  { title: "Sunflower (PvZ)", cn: "向日葵", role: "经济核心", tags: ["白天", "产阳光"], guide: "大多数非传送带关卡的节奏发动机。越早铺出两列左右，后续越容易补防线和爆发植物。", tips: ["开局优先种后排，前几只僵尸可用土豆雷、窝瓜或低费植物拖住。", "泳池和屋顶也要预留安全位置，别让蹦极或投石车直接拆经济。"] },
  { title: "Cherry Bomb (PvZ)", cn: "樱桃炸弹", role: "瞬间范围清场", tags: ["爆炸", "一次性"], guide: "三乘三区域高伤害炸弹，用来救场、处理密集波次或秒杀棘手目标。阳光成本不低，冷却也偏长。", tips: ["不要只炸一只普通僵尸，尽量等铁桶、橄榄球或舞王成群时使用。", "可作为巨人僵尸的削血手段，但通常要搭配辣椒、窝瓜或玉米加农炮。"] },
  { title: "Wall-nut (PvZ)", cn: "坚果墙", role: "低费阻挡", tags: ["防御", "前排"], guide: "早中期最常用的肉盾，能把僵尸固定在火力区里。适合保护后排射手和经济植物。", tips: ["放在火力覆盖的前方，而不是太靠右，否则输出时间会被浪费。", "遇到撑杆、海豚、跳跳等越过型敌人时，需要高坚果或磁力菇配合。"] },
  { title: "Potato Mine (PvZ)", cn: "土豆雷", role: "低费单点爆破", tags: ["爆炸", "延迟"], guide: "开局神器，花费极低但需要埋设时间。用它换掉第一只或第二只高威胁僵尸，可以省下大量阳光给经济。", tips: ["务必提前一段距离种下，临脸时不会立刻生效。", "在屋顶要种在花盆上，夜间墓碑多时注意不要被刷新点压缩空间。"] },
  { title: "Snow Pea (PvZ)", cn: "寒冰射手", role: "减速直线输出", tags: ["冰冻", "直线", "控制"], guide: "伤害接近豌豆射手，但附带减速，能显著延长火力窗口。适合对付血厚或移动快的单行压力。", tips: ["每行一株寒冰往往比堆更多普通豌豆更稳。", "火炬树桩会抵消冰冻效果，冰火体系不要放在同一路线上。"] },
  { title: "Chomper (PvZ)", cn: "大嘴花", role: "近战秒杀", tags: ["吞噬", "近战"], guide: "能一口吞掉大多数普通体型僵尸，但咀嚼期间很脆。适合放在坚果后或泳池边点杀高护甲单位。", tips: ["前面放坚果/南瓜头可以让大嘴花安全消化。", "面对成群僵尸不要单独依赖它，咀嚼空窗会让防线穿孔。"] },
  { title: "Repeater (PvZ)", cn: "双发射手", role: "中期直线主力", tags: ["白天", "直线", "输出"], guide: "一次射两颗豌豆，单位格火力高于豌豆射手，是机枪射手的升级底座。", tips: ["成排布置能快速建立稳定火力，适合白天和泳池前中期。", "配火炬树桩后爆发明显，但要注意成本和阵型纵深。"] },
  { title: "Puff-shroom (PvZ)", cn: "小喷菇", role: "夜间免费近程输出", tags: ["夜晚", "免费", "短程"], guide: "夜间开局的节奏核心，零阳光但射程短。它让玩家在缺少自然阳光时仍能铺出基础防线。", tips: ["先用多排小喷菇顶住，再逐步换成大喷菇、胆小菇或投手。", "白天必须用咖啡豆唤醒，通常不值得。"] },
  { title: "Sun-shroom (PvZ)", cn: "阳光菇", role: "夜间经济", tags: ["夜晚", "产阳光"], guide: "前期产小阳光，成长后产量提高，是夜间和雾夜最稳的经济来源。", tips: ["早种早成长，夜间优先保证两列左右。", "前排用小喷菇或墓碑吞噬者争取成长时间。"] },
  { title: "Fume-shroom (PvZ)", cn: "大喷菇", role: "穿透群伤", tags: ["夜晚", "穿透", "中程"], guide: "喷射能穿透门板等防具并伤害一条线上的多个目标，性价比极高。", tips: ["适合放在中后排形成多行穿透火力。", "它是忧郁菇升级底座，泳池和屋顶需要睡莲/花盆承载。"] },
  { title: "Grave Buster (PvZ)", cn: "墓碑吞噬者", role: "清理墓碑", tags: ["夜晚", "功能"], guide: "专门移除夜间草坪的墓碑，减少最终波刷怪点并释放格子。", tips: ["优先吃靠左或阻挡阵型的墓碑。", "吃墓碑期间无防御力，旁边要有火力保护。"] },
  { title: "Hypno-shroom (PvZ)", cn: "魅惑菇", role: "反制转化", tags: ["夜晚", "控制", "一次性"], guide: "被吃后会让僵尸倒戈，越强的僵尸被魅惑价值越高。", tips: ["用在橄榄球、铁桶、巨人前的小鬼等单位上收益更高。", "白天需咖啡豆唤醒，费用会变高，通常只在特殊局面使用。"] },
  { title: "Scaredy-shroom (PvZ)", cn: "胆小菇", role: "夜间远程输出", tags: ["夜晚", "远程"], guide: "低费远程蘑菇，敌人靠近时会缩起来停止攻击。需要前排阻挡保护。", tips: ["放在后两列，前方用坚果、南瓜头或大喷菇挡住近身。", "雾夜视野不足时，搭配路灯花避免被近身偷停火。"] },
  { title: "Ice-shroom (PvZ)", cn: "寒冰菇", role: "全屏冻结", tags: ["夜晚", "控制", "一次性"], guide: "全屏冰冻加短暂停滞，是对付大波次、巨人和首领技能的关键按钮。", tips: ["在巨人举小鬼或僵王低头时使用，可以争取巨大输出窗口。", "白天用咖啡豆唤醒后可以作为昂贵但可靠的全屏救场。"] },
  { title: "Doom-shroom (PvZ)", cn: "毁灭菇", role: "超大范围爆破", tags: ["夜晚", "爆炸", "一次性"], guide: "范围极大的高伤害爆炸，代价是在原地留下弹坑，短时间内不能种植。", tips: ["用来清最终波或巨人群，尽量放在不影响核心阵型的位置。", "泳池里需要睡莲承载，白天还要咖啡豆，成本要提前算好。"] },
  { title: "Lily Pad (PvZ)", cn: "睡莲", role: "水面承载", tags: ["泳池", "功能"], guide: "泳池关卡必备底座，让大多数陆地植物可以种在水路。", tips: ["先铺水路关键位，再补火力和防御。", "潜水、海豚等水路敌人出现时，睡莲上要尽快有攻击或阻挡。"] },
  { title: "Squash (PvZ)", cn: "窝瓜", role: "近距离秒杀", tags: ["一次性", "爆发"], guide: "低成本高伤害应急植物，会跳起压扁临近目标。开局、省钱和处理高血量单位都很好用。", tips: ["放在僵尸前方或同格附近，别离目标太远。", "可配合寒冰或坚果拖住目标，确保压到高价值单位。"] },
  { title: "Threepeater (PvZ)", cn: "三线射手", role: "三行覆盖输出", tags: ["直线", "多行"], guide: "同时攻击上中下三行，适合泳池中央或需要节省格子的阵型。", tips: ["放在第2/4行可覆盖三行，放中路能最大化价值。", "成本偏高，若只有单行压力，双发射手更经济。"] },
  { title: "Tangle Kelp (PvZ)", cn: "缠绕水草", role: "水路秒杀", tags: ["泳池", "一次性"], guide: "水路专用的单体秒杀，能安全处理潜水、海豚或高护甲水路敌人。", tips: ["优先留给潜水僵尸、海豚骑士或铁桶水路压力。", "不能种在陆地，最终波前要留好冷却。"] },
  { title: "Jalapeno (PvZ)", cn: "火爆辣椒", role: "整行清场", tags: ["爆炸", "整行"], guide: "清除整行僵尸并融化冰道，是对付冰车、雪橇队和临门危机的强力保险。", tips: ["冰车出现后可直接清车带冰道，避免雪橇队连续刷出。", "雾夜看不清时，整行效果能弥补视野不足。"] },
  { title: "Spikeweed (PvZ)", cn: "地刺", role: "地面持续伤害", tags: ["地面", "反车辆"], guide: "不能被普通啃食，持续伤害经过的地面敌人，并能扎爆冰车等车辆。", tips: ["放在前线道路上削血，后排继续用射手收割。", "车辆会摧毁地刺，重要位置可升级钢地刺提升耐久。"] },
  { title: "Torchwood (PvZ)", cn: "火炬树桩", role: "豌豆增幅", tags: ["增伤", "直线"], guide: "让穿过的豌豆变成火焰豌豆，显著提高豌豆系输出。", tips: ["放在豌豆射手前方一格或多格均可生效，避免挡住布局。", "不要和寒冰射手同线使用，冰冻会被火焰抵消。"] },
  { title: "Tall-nut (PvZ)", cn: "高坚果", role: "高级阻挡", tags: ["防御", "反越过"], guide: "比坚果更硬，还能阻挡撑杆、海豚、跳跳等跳跃单位。", tips: ["泳池边和跳跳僵尸多的关卡优先考虑。", "被梯子架上后防跳能力下降，磁力菇可吸走梯子。"] },
  { title: "Sea-shroom (PvZ)", cn: "海蘑菇", role: "免费水路输出", tags: ["泳池", "夜晚", "免费"], guide: "水路版小喷菇，夜间泳池和雾夜开局非常省阳光。", tips: ["在水路早铺，弥补阳光菇成长前的火力空窗。", "射程短，后续要用猫尾草、投手或水路主力替换补强。"] },
  { title: "Plantern (PvZ)", cn: "路灯花", role: "驱雾视野", tags: ["雾夜", "功能"], guide: "照亮周围雾区，让你提前看到水路和右侧僵尸。", tips: ["放在泳池中间附近可以照到更多关键行。", "与三叶草相比是持续视野，但占格且需要保护。"] },
  { title: "Cactus (PvZ)", cn: "仙人掌", role: "反气球输出", tags: ["直线", "防空"], guide: "平时像普通远程植物，遇到气球僵尸时会升高并击破气球。", tips: ["气球多的雾夜关卡至少带一个稳定防空方案。", "若只想临时解气球，三叶草更省阵型格。"] },
  { title: "Blover (PvZ)", cn: "三叶草", role: "瞬时驱雾/吹气球", tags: ["雾夜", "防空", "一次性"], guide: "一次性吹散雾并吹走气球僵尸，适合紧急视野和防空。", tips: ["气球快越过防线时立刻使用。", "它不会提供持续照明，后续仍要靠路灯花或阵型判断。"] },
  { title: "Split Pea (PvZ)", cn: "裂荚射手", role: "前后双向输出", tags: ["直线", "反矿工"], guide: "前方一颗、后方两颗豌豆，专门克制从左侧钻出的矿工僵尸。", tips: ["放在后排能在矿工出现后快速反杀。", "常规正面火力不如双发射手，主要在有矿工时上场。"] },
  { title: "Starfruit (PvZ)", cn: "杨桃", role: "五向散射", tags: ["多方向", "阵型"], guide: "向五个方向发射星星，适合密集布阵形成交叉火力。", tips: ["多株重叠时效果最好，单株价值不稳定。", "在泳池中线或雾夜可覆盖不规则来路。"] },
  { title: "Pumpkin (PvZ)", cn: "南瓜头", role: "套壳防御", tags: ["防御", "保护"], guide: "给植物套上额外护甲，是保护高价值后排、升级植物和水路底座的关键。", tips: ["优先套住经济、猫尾草、忧郁菇、玉米加农炮等核心。", "与大蒜、忧郁菇等组合能形成高强度近战防线。"] },
  { title: "Magnet-shroom (PvZ)", cn: "磁力菇", role: "吸金属装备", tags: ["夜晚", "控制"], guide: "吸走铁桶、门板、头盔、跳跳杆、梯子等金属装备，大幅降低特定僵尸威胁。", tips: ["遇到铁桶、橄榄球、门板、跳跳、扶梯时价值极高。", "吸取后有冷却，成群金属敌人需要多株或其他火力补足。"] },
  { title: "Cabbage-pult (PvZ)", cn: "卷心菜投手", role: "屋顶基础投手", tags: ["屋顶", "抛物线"], guide: "屋顶世界的基础远程输出，抛物线能越过坡面限制。", tips: ["屋顶早期优先替代豌豆系，后排安全种植。", "对高血量单位输出一般，后续要升级为玉米/西瓜体系。"] },
  { title: "Flower Pot (PvZ)", cn: "花盆", role: "屋顶承载", tags: ["屋顶", "功能"], guide: "屋顶种植的基础底座，没有花盆就无法在屋顶放大多数植物。", tips: ["先铺关键后排花盆，再补经济和投手。", "蹦极和投石车会威胁后排，核心花盆上的植物要保护好。"] },
  { title: "Kernel-pult (PvZ)", cn: "玉米投手", role: "控制投手", tags: ["屋顶", "减速", "抛物线"], guide: "玉米粒伤害较低，但黄油能定身目标，是屋顶控制链的重要来源。", tips: ["多株玉米投手能提高黄油覆盖率。", "它是玉米加农炮底座，布局时要预留两株相邻位置。"] },
  { title: "Coffee Bean (PvZ)", cn: "咖啡豆", role: "唤醒蘑菇", tags: ["功能", "一次性"], guide: "让睡眠蘑菇在白天或屋顶工作，解锁寒冰菇、毁灭菇、磁力菇等跨场景用法。", tips: ["用于关键功能蘑菇时价值很高，不必给所有蘑菇都喝。", "白天毁灭菇、寒冰菇救场前要额外计算咖啡豆费用和操作时间。"] },
  { title: "Garlic (PvZ)", cn: "大蒜", role: "换行引导", tags: ["防御", "路线控制"], guide: "让啃咬它的僵尸换到相邻行，可把敌人集中到火力更强的通道。", tips: ["与忧郁菇、地刺、南瓜头搭配能做经典压缩阵。", "遇到车辆、投石车等不正常啃食的敌人时效果有限。"] },
  { title: "Umbrella Leaf (PvZ)", cn: "叶子保护伞", role: "反空降/反投掷", tags: ["保护", "屋顶"], guide: "保护周围植物免受蹦极偷取和投石车篮球攻击。", tips: ["覆盖核心经济、玉米加农炮和后排投手。", "范围有限，屋顶大阵型通常需要多片分区保护。"] },
  { title: "Marigold (PvZ)", cn: "金盏花", role: "金币生产", tags: ["经济", "刷钱"], guide: "主要用于刷钱，而不是常规通关火力。会产金币或银币。", tips: ["适合生存或轻松关卡中放在安全后排。", "高压关卡不要为了钱牺牲必要火力。"] },
  { title: "Melon-pult (PvZ)", cn: "西瓜投手", role: "高伤害溅射投手", tags: ["屋顶", "溅射", "抛物线"], guide: "屋顶后期核心输出，伤害高且有范围溅射。", tips: ["优先铺在压力最大的行，成型后对密集波次非常强。", "可升级冰瓜，进一步获得减速和群控。"] },
  { title: "Gatling Pea (PvZ)", cn: "机枪射手", role: "豌豆系顶级火力", tags: ["升级", "直线"], guide: "双发射手升级而来，一次四发豌豆，配火炬树桩可形成极高单线输出。", tips: ["适合长期关卡，不适合阳光紧张的短关盲目升级。", "前方必须有坚果、南瓜头或其他阻挡保证持续输出。"] },
  { title: "Twin Sunflower (PvZ)", cn: "双子向日葵", role: "高级经济", tags: ["升级", "产阳光"], guide: "向日葵升级版，单位格产阳光更高，适合后期节省空间。", tips: ["先铺普通向日葵，经济稳定后再升级。", "升级时短暂占用阳光，别在防线缺口时贪经济。"] },
  { title: "Gloom-shroom (PvZ)", cn: "忧郁菇", role: "近身环形群伤", tags: ["升级", "穿透", "群伤"], guide: "大喷菇升级，攻击周围多格，配南瓜头和大蒜能处理大量近身敌人。", tips: ["经典用法是南瓜头保护忧郁菇，靠大蒜把僵尸导入杀伤区。", "射程短，不能替代后排远程火力。"] },
  { title: "Cattail (PvZ)", cn: "猫尾草", role: "全图追踪/防空", tags: ["升级", "泳池", "追踪"], guide: "睡莲升级而来，可攻击任意行目标并能打气球，是泳池关的万金油火力。", tips: ["放在水路安全位置并套南瓜头能长期输出。", "目标多时会分散火力，仍需主线防御。"] },
  { title: "Winter Melon (PvZ)", cn: "冰瓜", role: "群体减速溅射", tags: ["升级", "屋顶", "冰冻"], guide: "西瓜投手升级版，高伤害溅射附带减速，是后期最强控场输出之一。", tips: ["优先覆盖高压行，配合其他溅射可让大波次几乎走不动。", "成本很高，通常在经济成型后逐步升级。"] },
  { title: "Gold Magnet", cn: "吸金磁", role: "自动收钱", tags: ["升级", "刷钱"], guide: "磁力菇升级，用来自动吸金币、银币和钻石，主要提升刷钱舒适度。", tips: ["刷钱阵中放在安全区即可。", "它不再承担吸金属装备的战斗职责，别在高压关误替代磁力菇。"] },
  { title: "Spikerock (PvZ)", cn: "钢地刺", role: "高级地面陷阱", tags: ["升级", "反车辆", "耐久"], guide: "地刺升级版，伤害更高、能多次承受车辆或巨人碾压。", tips: ["适合铺在前线长期削血，尤其对冰车和巨人路线有效。", "成本较高，先确保后排输出再升级。"] },
  { title: "Cob Cannon (PvZ)", cn: "玉米加农炮", role: "手动超远程爆发", tags: ["升级", "手动", "爆炸"], guide: "由两株相邻玉米投手升级，手动发射玉米炮弹，范围伤害极高。", tips: ["需要玩家手动瞄准和管理冷却，适合生存和首领战。", "占两格且很贵，务必用南瓜头、保护伞和稳定前线保护。"] },
  { title: "Imitater (PvZ)", cn: "模仿者", role: "复制植物冷却", tags: ["功能", "复制"], guide: "复制一个植物，让关键植物拥有第二套冷却。常用于双辣椒、双樱桃、双南瓜或双经济。", tips: ["复制一次性救场植物时最直观，能显著提高容错。", "复制高费植物不等于更便宜，阳光压力仍要考虑。"] }
];

const ZOMBIE_MANUAL = [
  { title: "Zombie (PvZ)", cn: "普通僵尸", role: "基础步兵", guide: "最基础的敌人，血量低、没有特殊能力，用来测试当前行火力是否合格。", counters: ["一株豌豆射手配足距离即可处理。", "开局可用土豆雷或小喷菇省阳光。"] },
  { title: "Flag Zombie (PvZ)", cn: "旗帜僵尸", role: "波次提示", guide: "属性接近普通僵尸，主要代表一大波僵尸即将到来。", counters: ["看到旗帜意味着要补前排和救场冷却。", "不要把关键爆发浪费在它单独出现时。"] },
  { title: "Conehead Zombie", cn: "路障僵尸", role: "轻护甲步兵", guide: "比普通僵尸更耐打，是早期第一种明显考验火力的单位。", counters: ["双豌豆、寒冰减速或提前埋土豆雷都很稳。", "同一路只有单株豌豆时要加阻挡。"], statOverrides: [
    { label: "生命值", value: "640（路障约 370 + 本体 270）" },
    { label: "耐久/韧性", value: "中等" },
    { label: "首次出现", value: "Level 1-3" }
  ] },
  { title: "Pole Vaulting Zombie", cn: "撑杆僵尸", role: "越过首个植物", guide: "移动快，会跳过遇到的第一株植物，跳后速度下降。", counters: ["用低价值植物骗跳，后方再放坚果。", "高坚果可以阻止跳跃。"] },
  { title: "Buckethead Zombie (PvZ)", cn: "铁桶僵尸", role: "重护甲步兵", guide: "高血量早中期威胁，单线普通火力需要很久才能击杀。", counters: ["磁力菇可直接吸走铁桶。", "寒冰、窝瓜、樱桃炸弹可处理紧急铁桶。"] },
  { title: "Newspaper Zombie (PvZ)", cn: "读报僵尸", role: "破报后加速", guide: "报纸被打掉后会愤怒加速，若前排太薄容易突然突破。", counters: ["用寒冰或坚果拖住破报后的冲刺。", "集中火力一次打穿，避免它在近处爆发。"] },
  { title: "Screen Door Zombie (PvZ)", cn: "铁栅门僵尸", role: "门板护甲", guide: "门板能挡大量正面投射物，但大喷菇等穿透攻击可以绕过。", counters: ["磁力菇吸门板最省事。", "大喷菇、忧郁菇、投手和爆炸植物都很有效。"] },
  { title: "Football Zombie", cn: "橄榄球僵尸", role: "高速重甲", guide: "移动快、血量高，是草坪阶段最危险的正面冲锋者之一。", counters: ["磁力菇吸头盔能显著降低威胁。", "寒冰减速加高火力，或用窝瓜/樱桃直接处理。"] },
  { title: "Dancing Zombie", cn: "舞王僵尸", role: "召唤伴舞", guide: "会召唤伴舞僵尸形成横向压力，拖久了会不断补人。", counters: ["尽早用高火力或爆炸秒掉本体。", "整行辣椒和范围植物能同时清伴舞。"] },
  { title: "Backup Dancer (PvZ)", cn: "伴舞僵尸", role: "召唤随从", guide: "由舞王僵尸召唤，本身不强，但会分散多行防守注意力。", counters: ["优先击杀舞王，伴舞自然不会继续补。", "范围溅射和穿透植物清理效率高。"] },
  { title: "Ducky Tube Zombie (PvZ)", cn: "鸭子救生圈僵尸", role: "水路普通单位", guide: "泳池里的基础僵尸，路线在水道，需要水路火力或睡莲承载植物处理。", counters: ["尽快在水路铺睡莲和输出。", "缠绕水草可救急。"] },
  { title: "Snorkel Zombie (PvZ)", cn: "潜水僵尸", role: "潜行水路", guide: "多数时间潜在水下，接近植物才浮出啃食，容易偷掉水路后排。", counters: ["缠绕水草、猫尾草和范围攻击很可靠。", "在水路前端放坚果/高坚果拦截浮出后的啃食。"] },
  { title: "Zomboni", cn: "冰车僵尸", role: "碾压并铺冰道", guide: "会直接压毁植物并留下冰道，冰道会引出雪橇队。", counters: ["地刺/钢地刺能扎爆车辆。", "火爆辣椒可同时清车和冰道。"] },
  { title: "Zombie Bobsled Team", cn: "雪橇车僵尸小队", role: "冰道集群", guide: "依赖冰道出现，四只一组推进，数量压力很高。", counters: ["优先用辣椒清掉冰道源头。", "没有冰道时它们无法正常发挥。"] },
  { title: "Dolphin Rider Zombie", cn: "海豚骑士僵尸", role: "水路跳跃", guide: "高速水路单位，会跳过第一个阻挡植物。", counters: ["高坚果能拦跳。", "缠绕水草、寒冰和高火力可在跳后处理。"] },
  { title: "Jack-in-the-Box Zombie", cn: "玩偶匣僵尸", role: "随机爆炸", guide: "携带玩偶匣，可能爆炸摧毁周围植物，威胁密集阵型。", counters: ["尽快远程击杀，别让它靠近核心植物。", "磁力菇可吸走盒子，降低爆炸风险。"] },
  { title: "Balloon Zombie (PvZ)", cn: "气球僵尸", role: "飞行越线", guide: "漂浮越过大多数地面防线，若没有防空会直接进家。", counters: ["仙人掌和猫尾草能持续防空。", "三叶草可以一次性吹走全屏气球。"] },
  { title: "Digger Zombie (PvZ)", cn: "矿工僵尸", role: "后排偷袭", guide: "从地下钻到最左侧，再从后排往右啃，专门攻击经济和后排输出。", counters: ["裂荚射手后向火力是标准反制。", "磁力菇可吸走镐子，让它提前钻出。"] },
  { title: "Pogo Zombie", cn: "跳跳僵尸", role: "连续越过植物", guide: "能连续跳过多株植物，若没有反制会越过整条防线。", counters: ["高坚果能拦住跳跃。", "磁力菇吸走跳杆后就变成普通推进。"] },
  { title: "Zombie Yeti (PvZ)", cn: "雪人僵尸", role: "稀有奖励敌人", guide: "稀有出现，受到伤害后会逃跑，击杀可获得奖励。", counters: ["看到后立刻集中火力或用爆发植物。", "寒冰减速能延长击杀窗口。"] },
  { title: "Bungee Zombie", cn: "蹦极僵尸", role: "空降偷植物", guide: "从天而降偷走植物或投放僵尸，屋顶和后期关卡很烦人。", counters: ["叶子保护伞覆盖范围内可反制。", "核心植物尽量放在保护伞覆盖区。"] },
  { title: "Ladder Zombie", cn: "扶梯僵尸", role: "架梯越防", guide: "会把梯子架在坚果类防御上，后续僵尸可越过该防御。", counters: ["磁力菇吸梯子。", "避免让关键高坚果长期带梯子，必要时铲掉重放。"] },
  { title: "Catapult Zombie", cn: "投石车僵尸", role: "后排投掷/碾压", guide: "会向后排投篮球，还能压毁靠前植物，专门破坏屋顶阵型。", counters: ["叶子保护伞可挡篮球。", "地刺、爆发植物和快速集火可处理本体。"] },
  { title: "Gargantuar (PvZ)", cn: "巨人僵尸", role: "超高血量精英", guide: "血量极高，会砸毁植物，半血后投掷小鬼越过防线。", counters: ["多次爆发、冰冻控制、玉米加农炮和钢地刺削血都很重要。", "注意小鬼落点，后排要有补救火力。"] },
  { title: "Imp (PvZ)", cn: "小鬼僵尸", role: "投掷突袭", guide: "通常由巨人投掷到防线后方，血量低但落点危险。", counters: ["后排留一点范围火力或南瓜头保护。", "巨人半血前准备冰冻或爆发可减少投掷压力。"] },
  { title: "Dr. Zomboss (PvZ)", cn: "僵王博士", role: "最终首领", guide: "驾驶巨型机器人，召唤僵尸并用冰球、火球等技能压迫屋顶阵型。", counters: ["保存寒冰菇和火爆辣椒，用对应元素清球并在低头时爆发。", "花盆和投手被破坏后要快速补位。"] },
  { title: "Giga-gargantuar", cn: "红眼巨人僵尸", role: "隐藏超高血量精英", guide: "比普通巨人更耐打，常见于无尽等高压模式，是阵型上限测试。", counters: ["需要玉米加农炮、冰瓜控制和多重爆发轮换。", "用钢地刺和南瓜头拖延，避免核心输出被连续砸穿。"] }
];

const STAT_LABELS = {
  sun: "阳光",
  cost: "阳光",
  recharge: "冷却",
  damage: "伤害",
  "shot damage": "单次/射击伤害",
  toughness: "耐久/韧性",
  health: "生命值",
  range: "范围",
  usage: "使用方式",
  "sun production": "阳光产出",
  special: "特殊能力",
  "other special": "其他特性",
  weakness: "弱点",
  "other weakness": "其他弱点",
  speed: "速度",
  "first seen": "首次出现",
  "planted on": "可种植位置",
  upgrade: "升级/底座",
  unlocked: "解锁",
  unlock: "解锁",
  brain: "砸罐/我是僵尸脑量",
  Loc: "场景",
  Type: "类型",
  Flag: "旗帜",
  Plant: "可用植物",
  Zombie: "出现僵尸",
  FR: "通关奖励"
};

const ENTITY_TRANSLATIONS = [
  ...PLANT_MANUAL.map((item) => [item.title.replace(" (PvZ)", ""), item.cn]),
  ...ZOMBIE_MANUAL.map((item) => [item.title.replace(" (PvZ)", ""), item.cn]),
  ["Zombie", "普通僵尸"],
  ["Explode-o-nut", "爆炸坚果"],
  ["Watering Can", "浇水壶"],
  ["Bacon", "培根"],
  ["Silver Sunflower Trophy", "银向日葵奖杯"],
  ["Crazy Dave's Car Key", "疯狂戴夫的车钥匙"],
  ["Suburban Almanac", "图鉴"],
  ["Empty Seed packet", "空白卡槽"],
  ["A note from the zombies", "僵尸留下的纸条"],
  ["A note from Dr. Zomboss", "僵王博士留下的纸条"],
  ["Shovel", "铲子"],
  ["Taco", "玉米卷"],
  ["Note", "纸条"],
  ["diamond", "钻石"],
  ["diamonds", "钻石"],
  ["money bag", "钱袋"]
].sort((a, b) => b[0].length - a[0].length);

const TEXT_TRANSLATIONS = [
  [/\btwo after first time\b/gi, "首次通关后为两面"],
  [/\bthree after first time\b/gi, "首次通关后为三面"],
  [/\bfour after first time\b/gi, "首次通关后为四面"],
  [/\bthree\s+钻石/gi, "三颗钻石"],
  [/\bA\s+钱袋/g, "一个钱袋"],
  [/\biOS version\b/gi, "iOS 版"],
  [/\bReplaying:?\b/g, "重玩时："],
  [/\bSingle use\b/gi, "一次性使用"],
  [/\bSingle-use\b/gi, "一次性使用"],
  [/\binstant\b/gi, "立即生效"],
  [/\bdelayed activation\b/gi, "延迟生效"],
  [/\bon contact\b/gi, "接触时"],
  [/\bmust be planted on graves\b/gi, "必须种在墓碑上"],
  [/\bAll zombies in a small area\b/gi, "小范围内所有僵尸"],
  [/\bAll zombies in a 1x4 area\b/gi, "前方 1x4 范围内所有僵尸"],
  [/\bAll zombies that walk over it\b/gi, "所有经过它的僵尸"],
  [/\bto each affected enemy\b/gi, "对每个受影响敌人"],
  [/\beach affected enemy\b/gi, "每个受影响敌人"],
  [/\bVersus Mode\b/gi, "对战模式"],
  [/\bHeavy Weapon\b/gi, "重型武器"],
  [/\bJava version\b/gi, "Java 版"],
  [/\bJava edition only\b/gi, "Java 版限定"],
  [/\bDSiWare\b/g, "DSiWare 版"],
  [/\bBeghouled\b/g, "宝石迷阵模式"],
  [/\bGravestones\b/g, "墓碑"],
  [/\bGraves\b/g, "墓碑"],
  [/\bMobile\b/g, "移动版"],
  [/\bnon-mobile\b/g, "非移动版"],
  [/\bmobile\b/g, "移动版"],
  [/\bfirst playthrough\b/gi, "首次通关"],
  [/\bevery other playthrough\b/gi, "之后每次游玩"],
  [/\bcan disappear\b/gi, "可能不出现"],
  [/\bFuture Star\b/g, "未来之星"],
  [/\bin Great Wall Edition\b/gi, "长城版中"],
  [/\bAir Raid only\b/gi, "仅空袭模式"],
  [/\bpurchase for\b/gi, "购买价格"],
  [/\bbuy it for\b/gi, "购买价格"],
  [/\bfor \$/gi, "价格 $"],
  [/\bBetween playing Levels 4-4 and 4-5\b/gi, "第 4-4 关后、第 4-5 关前"],
  [/\bBeat Adventure Mode\b/gi, "通关冒险模式"],
  [/\bAdventure Mode\b/gi, "冒险模式"],
  [/\bTap to arm\b/gi, "点击装填"],
  [/\btarget area to fire\b/gi, "选择目标区域发射"],
  [/\bAs the imitated plant\b/gi, "与被模仿植物相同"],
  [/\bDepends on the imitated plant\b/gi, "取决于被模仿植物"],
  [/\btransforming\b/gi, "变身中"],
  [/\btransformation\b/gi, "变身后"],
  [/\bProduces\b/g, "产生"],
  [/\blarge\b/gi, "大形态"],
  [/\bsmall\b/gi, "小形态"],
  [/\btiles\b/gi, "格"],
  [/\btile\b/gi, "格"],
  [/\bagainst\b/gi, "对"],
  [/\band\b/gi, "和"],
  [/\bShort range\b/gi, "近距离"],
  [/\bShort\b/g, "短"],
  [/\bSingle lane\b/gi, "整行"],
  [/\bGround only\b/gi, "仅地面"],
  [/\bground and air\b/gi, "地面和空中"],
  [/\bGround and air\b/g, "地面和空中"],
  [/\bground and roof\b/gi, "地面和屋顶"],
  [/\bair\b/gi, "空中"],
  [/\broof\b/gi, "屋顶"],
  [/\bForward and backwards\b/gi, "前后方向"],
  [/\bbackwards\b/gi, "向后"],
  [/\b5 directions\b/gi, "五个方向"],
  [/\blanes\b/gi, "行"],
  [/\blane\b/gi, "行"],
  [/\barea\b/gi, "范围"],
  [/\bhits all zombies that it lands on\b/gi, "压到的所有僵尸"],
  [/\bNearby zombies\b/gi, "附近僵尸"],
  [/\bAnywhere on lawn\b/gi, "草坪任意位置"],
  [/\bNocturnal plants during the day\b/gi, "白天的夜间植物"],
  [/\bLobbed\b/gi, "抛物线"],
  [/\bLight\b/g, "轻微"],
  [/\bHeavy\b/g, "高"],
  [/\bVery heavy\b/gi, "很高"],
  [/\bkernel\b/gi, "玉米粒"],
  [/\bbutter\b/gi, "黄油"],
  [/\bfor each star\b/gi, "每颗星星"],
  [/\bfor each spike\b/gi, "每根尖刺"],
  [/\bfor each pea\b/gi, "每颗豌豆"],
  [/\bforward\b/gi, "向前"],
  [/\bbackward\b/gi, "向后"],
  [/\bonly\b/gi, "限定"],
  [/\bin\b/gi, "在"],
  [/\bExtremely High\b/g, "极高"],
  [/\bVery high\b/gi, "很高"],
  [/\bHigh\b/g, "高"],
  [/\bMedium\b/g, "中等"],
  [/\bLow\b/g, "低"],
  [/\bNormal\b/g, "普通"],
  [/\bnormal\b/g, "普通"],
  [/\bMassive\b/g, "巨大"],
  [/\bFast\b/g, "快"],
  [/\bVery slow\b/gi, "很慢"],
  [/\bSlow\b/g, "慢"],
  [/\bExtreme\b/g, "极高"],
  [/\bFlying\b/g, "飞行"],
  [/\bStraight\b/g, "直线"],
  [/\bGround\b/g, "地面"],
  [/\bRoof\b/g, "屋顶"],
  [/\bPool\b/g, "泳池"],
  [/\bDay\b/g, "白天"],
  [/\bNight\b/g, "夜晚"],
  [/\bFog\b/g, "雾夜"],
  [/\bRegular\b/g, "常规"],
  [/\bTutorial\b/g, "教学"],
  [/\bConveyor-belt level\b/g, "传送带关卡"],
  [/\bConveyor-belt\b/g, "传送带"],
  [/\bWall-nut Bowling\b/g, "坚果保龄球"],
  [/\bBoss battle\b/g, "首领战"],
  [/\bNone\b/g, "无"],
  [/\bnone\b/g, "无"],
  [/\bOne\b/g, "一面"],
  [/\bone\b/g, "一面"],
  [/\bTwo\b/g, "两面"],
  [/\btwo\b/g, "两面"],
  [/\bThree\b/g, "三面"],
  [/\bthree\b/g, "三面"],
  [/\bFour\b/g, "四面"],
  [/\bfour\b/g, "四面"],
  [/\bChoice\b/g, "自选"],
  [/\breplaying\b/gi, "重玩时"],
  [/\bmost versions\b/g, "多数版本"],
  [/\bonline\b/g, "网页版"],
  [/\bSummoned:/g, "召唤："],
  [/\bAvailable from the start\b/g, "初始可用"],
  [/\bAfter beating\b/g, "通关后解锁"],
  [/\bBeating\b/g, "通关"],
  [/\bAfter completing Adventure Mode\b/g, "完成冒险模式后"],
  [/\bEndless levels\b/g, "无尽模式"],
  [/\bfor each pea\b/g, "每颗豌豆"],
  [/\bpenetrates shields\b/g, "穿透护具"],
  [/\bimmobilizes zombies\b/g, "定住僵尸"],
  [/\bslows enemies\b/g, "减速敌人"],
  [/\bthen\b/g, "随后"],
  [/\bevery\b/g, "每"],
  [/\bafter\b/g, "后"],
  [/\bAfter\b/g, "后"],
  [/\bseconds\b/g, "秒"],
  [/\bsecond\b/g, "秒"],
  [/\bsec\b/g, "秒"],
  [/\bFirst\b/g, "首次"],
  [/\bsun\b/g, "阳光"],
  [/\bshoots\b/g, "发射"],
  [/\bdamage\b/g, "伤害"]
];

const ZOMBIE_CORRECTIONS = {
  "Zombie (PvZ)": { health: "270", toughness: "低", speed: "普通", firstSeen: "第 1-1 关", damage: "普通啃咬：持续啃食植物", special: "无特殊能力", weakness: "基础直线火力即可处理" },
  "Flag Zombie (PvZ)": { health: "200", toughness: "低", speed: "普通", firstSeen: "第 1-2 关", damage: "普通啃咬：持续啃食植物", special: "波次提示，本体威胁接近普通僵尸", weakness: "按普通僵尸处理，重点准备后续大波" },
  "Conehead Zombie": { health: "640（路障约 370 + 本体 270）", toughness: "中等", speed: "普通", firstSeen: "第 1-3 关", damage: "普通啃咬：持续啃食植物", special: "路障提供额外护甲", weakness: "提高单行火力，或用土豆雷、窝瓜快速处理" },
  "Pole Vaulting Zombie": { health: "500", toughness: "中等", speed: "快，跳跃后变普通", firstSeen: "第 1-6 关", damage: "普通啃咬：持续啃食植物", special: "会跳过遇到的第一株植物", weakness: "用低价值植物骗跳，或用高坚果阻挡" },
  "Buckethead Zombie (PvZ)": { health: "1370（铁桶约 1100 + 本体 270）", toughness: "高", speed: "普通", firstSeen: "第 1-8 关", damage: "普通啃咬：持续啃食植物", special: "铁桶提供大量护甲", weakness: "磁力菇可吸走铁桶；爆炸植物可救急" },
  "Newspaper Zombie (PvZ)": { health: "420（报纸约 150 + 本体 270）", toughness: "低", speed: "普通，报纸破后加速", firstSeen: "第 2-1 关", damage: "普通啃咬：持续啃食植物", special: "报纸被打掉后会愤怒加速", weakness: "提前集火，配合寒冰或坚果拖住破报后的冲刺" },
  "Screen Door Zombie (PvZ)": { health: "1370（门板约 1100 + 本体 270）", toughness: "高", speed: "普通", firstSeen: "第 2-3 关", damage: "普通啃咬：持续啃食植物", special: "门板抵挡多数正面投射物", weakness: "磁力菇吸门板；大喷菇、投手、地刺可绕过门板" },
  "Football Zombie": { health: "1670（头盔约 1400 + 本体 270）", toughness: "很高", speed: "快", firstSeen: "第 2-6 关", damage: "普通啃咬：持续啃食植物", special: "高速重甲冲锋", weakness: "磁力菇吸头盔；寒冰减速后集中火力" },
  "Dancing Zombie": { health: "500", toughness: "中等", speed: "普通", firstSeen: "第 2-8 关", damage: "普通啃咬：持续啃食植物", special: "召唤伴舞僵尸形成多行压力", weakness: "优先击杀本体，范围伤害能同时清伴舞" },
  "Backup Dancer (PvZ)": { health: "270", toughness: "低", speed: "普通", firstSeen: "第 2-8 关", damage: "普通啃咬：持续啃食植物", special: "由舞王僵尸召唤", weakness: "处理舞王本体后压力会明显下降" },
  "Ducky Tube Zombie (PvZ)": { health: "随变体而定；普通鸭子 270，路障/铁桶鸭子按对应护甲计算", toughness: "低到高", speed: "普通", firstSeen: "第 3-1 关", damage: "普通啃咬：持续啃食水路植物", special: "水路单位，可能带路障或铁桶变体", weakness: "水路提前铺输出，缠绕水草可救急" },
  "Snorkel Zombie (PvZ)": { health: "270", toughness: "低", speed: "普通", firstSeen: "第 3-3 关", damage: "普通啃咬：浮出后啃食植物", special: "潜水时避开多数直线攻击", weakness: "缠绕水草、窝瓜、投手和猫尾草都能有效处理" },
  "Zomboni": { health: "1160", toughness: "高", speed: "普通", firstSeen: "第 3-6 关", damage: "接触植物时直接碾碎，并留下冰道", special: "制造冰道，冰道会引出雪橇车僵尸小队", weakness: "地刺/钢地刺扎爆车辆；火爆辣椒清车并融化冰道" },
  "Zombie Bobsled Team": { health: "每名 270，四人合计 1080", toughness: "低", speed: "冰道上快，离开雪橇后变慢", firstSeen: "第 3-6 关", damage: "下车后普通啃咬：持续啃食植物", special: "只会在冰道上成队出现", weakness: "优先用火爆辣椒清冰道，大喷菇可穿透多人" },
  "Dolphin Rider Zombie": { health: "500", toughness: "中等", speed: "快，跳跃后变慢", firstSeen: "第 3-8 关", damage: "普通啃咬：持续啃食水路植物", special: "跳过水路遇到的第一株阻挡植物", weakness: "高坚果阻止跳跃；缠绕水草可直接拖下水" },
  "Jack-in-the-Box Zombie": { health: "500", toughness: "中等", speed: "快", firstSeen: "第 4-1 关", damage: "玩偶匣爆炸会直接摧毁附近植物；对被魅惑僵尸约 1800 伤害", special: "玩偶匣可能随机爆炸", weakness: "磁力菇吸走盒子；尽量在远处击杀" },
  "Balloon Zombie (PvZ)": { health: "290", toughness: "低", speed: "飞行推进", firstSeen: "第 4-3 关", damage: "落地后普通啃咬；若未被击落会直接越过防线", special: "飞行时多数地面攻击无法命中", weakness: "仙人掌、猫尾草可攻击；三叶草可一次性吹走" },
  "Digger Zombie (PvZ)": { health: "370", toughness: "中等", speed: "地下快，出土后慢", firstSeen: "第 4-6 关", damage: "从后排啃食植物", special: "从地下钻到最左侧再反向进攻", weakness: "裂荚射手、杨桃、忧郁菇可反打后排；磁力菇吸镐" },
  "Pogo Zombie": { health: "340", toughness: "中等", speed: "跳跃推进", firstSeen: "第 4-8 关", damage: "普通啃咬：持续啃食植物", special: "连续跳过普通植物", weakness: "高坚果阻止跳跃；磁力菇吸走跳杆" },
  "Zombie Yeti (PvZ)": { health: "1350", toughness: "高", speed: "受伤后逃跑", firstSeen: "第 4-10 关（完成冒险模式后）", damage: "普通啃咬：持续啃食植物", special: "稀有出现，受伤一段时间后会逃跑", weakness: "发现后立刻集中火力，寒冰减速能延长击杀窗口" },
  "Bungee Zombie": { health: "450", toughness: "中等", speed: "空降", firstSeen: "第 5-1 关", damage: "不啃咬，主要威胁是偷走植物或空投僵尸", special: "从空中偷植物/投放僵尸", weakness: "叶子保护伞保护周围植物；玉米加农炮不会被偷" },
  "Ladder Zombie": { health: "1000（梯子约 500 + 本体 500）", toughness: "中等", speed: "持梯时快，架梯后变普通", firstSeen: "第 5-3 关", damage: "普通啃咬：持续啃食植物", special: "给坚果类植物架梯，让后续僵尸越过", weakness: "磁力菇吸梯子；投手、大喷菇、地刺可绕过梯子" },
  "Catapult Zombie": { health: "660", toughness: "中等", speed: "慢", firstSeen: "第 5-6 关", damage: "篮球每次约 75 伤害；车辆接触植物时碾碎", special: "从后方投篮球攻击后排植物", weakness: "叶子保护伞挡篮球；地刺/钢地刺扎爆车辆" },
  "Gargantuar (PvZ)": { health: "3000", toughness: "极高", speed: "慢", firstSeen: "第 5-8 关", damage: "棒击会直接砸毁前方植物；半血后投掷小鬼", special: "超高血量精英，能越过前排投小鬼", weakness: "多次爆炸、寒冰控制、玉米加农炮、钢地刺轮换处理" },
  "Imp (PvZ)": { health: "200", toughness: "低", speed: "普通", firstSeen: "第 5-8 关", damage: "普通啃咬：持续啃食植物", special: "常由巨人投到防线后方", weakness: "后排留范围火力或南瓜头保护；提前压低巨人血量窗口" },
  "Dr. Zomboss (PvZ)": { health: "首次 40000；重玩 60000", toughness: "极高", speed: "首领", firstSeen: "第 5-10 关", damage: "踩踏直接摧毁植物；火球/冰球造成整行威胁", special: "召唤僵尸、投放蹦极、踩踏并发射火球/冰球", weakness: "寒冰菇灭火球，火爆辣椒灭冰球；低头时集中输出" },
  "Giga-gargantuar": { health: "6000", toughness: "极高", speed: "慢", firstSeen: "无尽模式", damage: "棒击会直接砸毁前方植物；半血后投掷小鬼", special: "红眼巨人，生命值约为普通巨人的两倍", weakness: "玉米加农炮、冰瓜控制、钢地刺和爆炸轮换" }
};

const DROP_KEYS = new Set([
  "Game", "game", "image", "caption", "desc", "description", "flavor text",
  "next", "before", "after", "box title", "title"
]);

const WORLD_COPY = {
  Day: {
    cn: "白天草坪",
    terrain: "5 行普通草坪，自然阳光会从天上掉落。",
    advice: "核心节奏是先立经济，再用直线火力和坚果拉开输出距离。"
  },
  Night: {
    cn: "夜晚草坪",
    terrain: "夜晚自然阳光稀少，草坪上有墓碑。",
    advice: "蘑菇体系性价比很高，墓碑吞噬者要尽早清掉影响阵型的墓碑。"
  },
  Pool: {
    cn: "白天泳池",
    terrain: "中间两行为水路，陆地植物需要睡莲才能种在水面。",
    advice: "陆地和水路要同步建防，水路第一波常用睡莲、缠绕水草或猫尾草稳住。"
  },
  Fog: {
    cn: "雾夜泳池",
    terrain: "夜晚泳池叠加浓雾，右侧视野受限。",
    advice: "路灯花提供持续视野，三叶草适合临时驱雾和吹走气球。"
  },
  Roof: {
    cn: "白天屋顶",
    terrain: "屋顶有坡面，大多数植物必须种在花盆上，抛物线投手更可靠。",
    advice: "优先建立投手体系，保护伞用于防蹦极和投石车，后期靠西瓜/冰瓜压制波次。"
  },
  "Night Roof": {
    cn: "夜晚屋顶",
    terrain: "最终首领屋顶战，传送带供给固定植物。",
    advice: "根据僵王博士动作保存寒冰菇和火爆辣椒，低头时集中火力输出。"
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(params, attempt = 1) {
  const url = `${API}?${new URLSearchParams(params)}`;
  try {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) {
      if (response.status === 429 && attempt < 6) {
        const retryAfter = Number(response.headers.get("retry-after") || 0);
        await sleep((retryAfter || attempt * 2) * 1000);
        return api(params, attempt + 1);
      }
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (attempt < 4) {
      await sleep(450 * attempt);
      return api(params, attempt + 1);
    }
    throw error;
  }
}

function wikiUrl(title) {
  return `${WIKI_BASE}${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

function fileUrl(file) {
  if (!file) return "";
  const normalized = file.replace(/^File:/i, "").replaceAll(" ", "_");
  return `${WIKI_BASE}Special:Redirect/file/${encodeURIComponent(normalized)}`;
}

const IMAGE_CACHE = new Map();

async function resolveImageUrl(file, fallback = "") {
  if (!file) return fallback;
  const normalized = file.replace(/^File:/i, "").trim();
  if (IMAGE_CACHE.has(normalized)) return IMAGE_CACHE.get(normalized);
  try {
    const data = await api({
      action: "query",
      titles: `File:${normalized}`,
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "180",
      format: "json"
    });
    const page = Object.values(data.query.pages || {})[0];
    const info = page?.imageinfo?.[0];
    const url = info?.thumburl || info?.url || fileUrl(normalized) || fallback;
    IMAGE_CACHE.set(normalized, url);
    return url;
  } catch {
    const url = fileUrl(normalized) || fallback;
    IMAGE_CACHE.set(normalized, url);
    return url;
  }
}

function extractFirstInfobox(text) {
  const start = text.search(/\{\{Infobox/i);
  if (start < 0) return "";
  let depth = 0;
  for (let i = start; i < text.length - 1; i += 1) {
    const pair = text.slice(i, i + 2);
    if (pair === "{{") {
      depth += 1;
      i += 1;
    } else if (pair === "}}") {
      depth -= 1;
      i += 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return "";
}

function parseFields(template) {
  const body = template.replace(/\}\}\s*$/, "");
  const lines = body.split(/\r?\n/);
  const fields = {};
  let current = null;
  for (const line of lines) {
    if (line.startsWith("|")) {
      const index = line.indexOf("=");
      if (index !== -1) {
        current = line.slice(1, index).trim();
        fields[current] = line.slice(index + 1).trim();
      }
    } else if (current && line.trim()) {
      fields[current] += ` ${line.trim()}`;
    }
  }
  return fields;
}

function stripHtml(value) {
  return value
    .replace(/<br\s*\/?>/gi, ", ")
    .replace(/<\/?small[^>]*>/gi, "")
    .replace(/<\/?gallery[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ");
}

function cleanWiki(value = "") {
  let text = String(value);
  text = stripHtml(text);
  text = text.replace(/\{\{(?:S|S2|M|PvZ|Plants vs\. Zombies)\|([^|}]+)(?:\|[^}]*)?\}\}/g, "$1, ");
  text = text.replace(/\{\{Tt\|([^|}]+)(?:\|[^}]*)?\}\}/g, "$1");
  text = text.replace(/\{\{SB\|([^}]*)\}\}/g, "($1)");
  text = text.replace(/\{\{[^|{}]+\|([^{}]+)\}\}/g, "$1");
  text = text.replace(/\{\{([^{}|]+)\}\}/g, "$1");
  text = text.replace(/\[\[File:[^\]]+\]\]/gi, "");
  text = text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2");
  text = text.replace(/\[\[([^\]]+)\]\]/g, "$1");
  text = text.replace(/'''?/g, "");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/\s+,/g, ",");
  text = text.replace(/,\s*,/g, ",");
  text = text.replace(/,\s*(\)|$)/g, "$1");
  text = text.replace(/\s{2,}/g, " ");
  return text.trim();
}

function replaceEntityNames(text) {
  let output = text;
  for (const [en, cn] of ENTITY_TRANSLATIONS) {
    output = output.replace(new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), cn);
  }
  return output;
}

function localizeText(value = "") {
  let text = cleanWiki(value);
  text = replaceEntityNames(text);
  text = text.replace(/\bLevel ([1-5]-[1-9]0?)\b/g, "第 $1 关");
  text = text.replace(/\b(\d+(?:\.\d+)?) seconds?\b/g, "$1 秒");
  text = text.replace(/\b(\d+(?:\.\d+)?) sec\b/g, "$1 秒");
  text = text.replace(/\(([^)]*)\)/g, (match, inner) => `（${inner}）`);
  for (const [pattern, replacement] of TEXT_TRANSLATIONS) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/坚果墙 Bowling/g, "坚果保龄球");
  text = text.replace(/Whack a 普通僵尸/g, "锤僵尸");
  text = text.replace(/Big Trouble Little 普通僵尸/g, "小僵尸大麻烦");
  text = text.replace(/Vasebreaker/g, "砸罐子");
  text = text.replace(/重玩时：\s*:/g, "重玩时：");
  text = text.replace(/重玩时：，/g, "重玩时：");
  text = text.replace(/三面\s+钻石/g, "三颗钻石");
  text = text.replace(/A\s+钱袋/g, "一个钱袋");
  text = text.replace(/召唤：\s+/g, "召唤：");
  text = text.replace(/Boss/g, "首领");
  text = text.replace(/\$\s*/g, "$");
  text = text.replace(/to 每 affected enemy/g, "对每个受影响敌人");
  text = text.replace(/首次通关 和 移动版/g, "首次通关及移动版");
  text = text.replace(/之后每次游玩 on non-移动版/g, "非移动版重玩时");
  text = text.replace(/on 非移动版/g, "非移动版");
  text = text.replace(/之后每次游玩 非移动版/g, "非移动版重玩时");
  text = text.replace(/通关后解锁 第 ([1-5]-[0-9]+) 关/g, "通关第 $1 关后解锁");
  text = text.replace(/后 第 ([1-5]-[0-9]+) 关/g, "第 $1 关后");
  text = text.replace(/后 第 ([1-5]-[0-9]+)/g, "第 $1 关后");
  text = text.replace(/通关 第/g, "通关第");
  text = text.replace(/通关 冒险模式/g, "通关冒险模式");
  text = text.replace(/通关冒险模式，随后购买价格/g, "通关冒险模式后可购买，价格");
  text = text.replace(/通关冒险模式，价格/g, "通关冒险模式后可购买，价格");
  text = text.replace(/通关冒险模式，\$/g, "通关冒险模式后可购买，价格 $");
  text = text.replace(/第 ([1-5]-[0-9]+) 关后、第 ([1-5]-[0-9]+) 关前 价格/g, "第 $1 关后至第 $2 关前可购买，价格");
  text = text.replace(/通关第 ([1-5]-[0-9]+) 关 价格/g, "通关第 $1 关后可购买，价格");
  text = text.replace(/通关第 ([1-5]-[0-9]+) 关，\$/g, "通关第 $1 关后可购买，价格 $");
  text = text.replace(/第 ([1-5]-[0-9]+) 关后，\$/g, "第 $1 关后可购买，价格 $");
  text = text.replace(/随后 购买价格/g, "随后购买价格");
  text = text.replace(/ 和 /g, "和");
  text = text.replace(/伤害 对每个受影响敌人/g, "伤害，作用于每个受影响敌人");
  text = text.replace(/后 变身后/g, "变身后");
  text = text.replace(/,\s*/g, "，");
  text = text.replace(/\s*，\s*/g, "，");
  text = text.replace(/，or\s+/gi, "，或");
  text = text.replace(/（or\s+/gi, "（或");
  text = text.replace(/\bor\b/gi, "或");
  text = text.replace(/(\d)\s*x\s*(\d)/gi, "$1×$2");
  text = text.replace(/\bx(\d)/gi, "×$1");
  text = text.replace(/，(?=（)/g, "");
  text = text.replace(/\$(\d+)，(\d{3})/g, (_match, major, minor) => `$${major},${minor}`);
  text = text.replace(/通关冒险模式，随后购买价格/g, "通关冒险模式后可购买，价格");
  text = text.replace(/通关冒险模式，价格/g, "通关冒险模式后可购买，价格");
  text = text.replace(/通关冒险模式，\$/g, "通关冒险模式后可购买，价格 $");
  text = text.replace(/通关第 ([1-5]-[0-9]+) 关，\$/g, "通关第 $1 关后可购买，价格 $");
  text = text.replace(/第 ([1-5]-[0-9]+) 关后，\$/g, "第 $1 关后可购买，价格 $");
  text = text.replace(/（首次通关及移动版），寒冰菇，（非移动版重玩时）（移动版）自选/g, "（首次通关及移动版）；寒冰菇（非移动版重玩时）；移动版可自选");
  text = text.replace(/\s+（/g, "（");
  text = text.replace(/）\s+/g, "）");
  text = text.replace(/\s{2,}/g, " ");
  return text.trim();
}

function imageFromField(value = "") {
  const text = String(value);
  const galleryMatch = text.match(/([A-Za-z0-9_ .:'()!&-]+\.(?:png|gif|jpe?g|webp))/i);
  if (galleryMatch) return galleryMatch[1].trim();
  return text.replace(/^File:/i, "").trim();
}

function buildStats(fields, allowedKeys = null) {
  return Object.entries(fields)
    .filter(([key]) => !DROP_KEYS.has(key))
    .filter(([key]) => !allowedKeys || allowedKeys.includes(key))
    .map(([key, raw]) => ({ label: STAT_LABELS[key] || key, value: localizeText(raw) }))
    .filter((item) => item.value && item.value !== "-");
}

function buildZombieStats(correction) {
  return [
    { label: "生命值", value: correction.health },
    { label: "耐久/韧性", value: correction.toughness },
    { label: "移动速度", value: correction.speed },
    { label: "主要伤害", value: correction.damage },
    { label: "特殊能力", value: correction.special },
    { label: "首次出现", value: correction.firstSeen },
    { label: "克制要点", value: correction.weakness }
  ].filter((item) => item.value);
}

const PAGE_CACHE = new Map();

async function fetchPages(titles) {
  const unique = [...new Set(titles)];
  for (let index = 0; index < unique.length; index += 45) {
    const chunk = unique.slice(index, index + 45);
    const data = await api({
      action: "query",
      prop: "revisions|pageimages",
      rvprop: "content",
      rvslots: "main",
      pithumbsize: "180",
      titles: chunk.join("|"),
      redirects: "1",
      format: "json"
    });
    const redirects = new Map((data.query.redirects || []).map((item) => [item.from, item.to]));
    const pages = Object.values(data.query.pages || {});
    for (const requested of chunk) {
      const finalTitle = redirects.get(requested) || requested;
      const page = pages.find((candidate) => candidate.title === finalTitle);
      if (!page || page.missing) throw new Error(`Missing wiki page: ${requested}`);
      const text = page.revisions?.[0]?.slots?.main?.["*"] || "";
      const parsed = {
        title: page.title,
        fields: parseFields(extractFirstInfobox(text)),
        thumbnail: page.thumbnail?.source || ""
      };
      PAGE_CACHE.set(requested, parsed);
      PAGE_CACHE.set(page.title, parsed);
    }
    await sleep(300);
  }
}

async function fetchPage(title) {
  if (PAGE_CACHE.has(title)) return PAGE_CACHE.get(title);
  const data = await api({
    action: "query",
    prop: "revisions|pageimages",
    rvprop: "content",
    rvslots: "main",
    pithumbsize: "180",
    titles: title,
    redirects: "1",
    format: "json"
  });
  const page = Object.values(data.query.pages)[0];
  if (!page || page.missing) throw new Error(`Missing wiki page: ${title}`);
  const text = page.revisions?.[0]?.slots?.main?.["*"] || "";
  const fields = parseFields(extractFirstInfobox(text));
  const parsed = { title: page.title, fields, thumbnail: page.thumbnail?.source || "" };
  PAGE_CACHE.set(title, parsed);
  PAGE_CACHE.set(page.title, parsed);
  return parsed;
}

function statValue(stats, label) {
  return stats.find((item) => item.label === label)?.value || "";
}

function extensionFrom(url, contentType = "") {
  const pathname = new URL(url).pathname.toLowerCase();
  const match = pathname.match(/\.(png|gif|jpe?g|webp)$/i);
  if (match) return match[1] === "jpeg" ? "jpg" : match[1];
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg")) return "jpg";
  return "png";
}

async function downloadIcon(url, pathBase) {
  for (const ext of ["png", "gif", "jpg", "jpeg", "webp"]) {
    const existing = `${pathBase}.${ext}`;
    try {
      await access(existing);
      return existing.replaceAll("\\", "/");
    } catch {
      // Keep looking for an already downloaded variant before hitting the network.
    }
  }
  const candidates = [url];
  if (url.includes("/images/thumb/")) {
    candidates.push(url.replace("/images/thumb/", "/images/").replace(/\/\d+px-[^/?]+(?=\?)/, ""));
  }
  let lastError = null;
  for (const candidate of candidates) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(candidate, { headers: { "User-Agent": USER_AGENT } });
        if (!response.ok) throw new Error(`Image HTTP ${response.status}: ${candidate}`);
        const contentType = response.headers.get("content-type") || "";
        const ext = extensionFrom(response.url || candidate, contentType);
        const relativePath = `${pathBase}.${ext}`;
        const bytes = new Uint8Array(await response.arrayBuffer());
        await writeFile(relativePath, bytes);
        return relativePath.replaceAll("\\", "/");
      } catch (error) {
        lastError = error;
        await sleep(350 * attempt);
      }
    }
  }
  throw lastError;
}

async function localizeIcons(data) {
  await mkdir("assets/images", { recursive: true });
  const tasks = [
    ...data.plants.map((item) => ["plant", item]),
    ...data.zombies.map((item) => ["zombie", item]),
    ...data.levels.map((item) => ["level", item])
  ].filter(([, item]) => item.iconRemote);
  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const [prefix, item] = tasks[cursor];
      cursor += 1;
      item.icon = await downloadIcon(item.iconRemote, `assets/images/${prefix}-${item.id}`);
      delete item.iconRemote;
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
}

async function buildPlants() {
  const plantKeys = ["sun", "cost", "recharge", "damage", "shot damage", "toughness", "range", "usage", "sun production", "planted on", "upgrade", "unlocked", "unlock"];
  const rows = [];
  for (const entry of PLANT_MANUAL) {
    const page = await fetchPage(entry.title);
    const stats = buildStats(page.fields, plantKeys);
    const imageFile = imageFromField(page.fields.image);
    const iconRemote = await resolveImageUrl(imageFile, page.thumbnail);
    rows.push({
      id: page.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      en: cleanWiki(page.fields["box title"] || page.fields.title || page.title.replace(" (PvZ)", "")),
      cn: entry.cn,
      role: entry.role,
      tags: entry.tags,
      icon: "",
      iconRemote,
      wiki: wikiUrl(page.title),
      summary: entry.guide,
      tips: entry.tips,
      quick: {
        sun: statValue(stats, "阳光") || "见详情",
        recharge: statValue(stats, "冷却") || "见详情",
        damage: statValue(stats, "伤害") || statValue(stats, "单次/射击伤害") || "功能型",
        toughness: statValue(stats, "耐久/韧性") || "见详情"
      },
      stats
    });
  }
  return rows;
}

async function buildZombies() {
  const zombieKeys = ["health", "toughness", "speed", "special", "other special", "damage", "weakness", "other weakness", "first seen"];
  const rows = [];
  for (const entry of ZOMBIE_MANUAL) {
    const page = await fetchPage(entry.title);
    const correction = ZOMBIE_CORRECTIONS[entry.title] || ZOMBIE_CORRECTIONS[page.title];
    const stats = correction ? buildZombieStats(correction) : [...buildStats(page.fields, zombieKeys), ...(entry.statOverrides || [])];
    const imageFile = imageFromField(page.fields.image);
    const iconRemote = await resolveImageUrl(imageFile, page.thumbnail);
    rows.push({
      id: page.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      en: cleanWiki(page.fields["box title"] || page.fields.title || page.title.replace(" (PvZ)", "")),
      cn: entry.cn,
      role: entry.role,
      icon: "",
      iconRemote,
      wiki: wikiUrl(page.title),
      summary: entry.guide,
      counters: entry.counters,
      quick: {
        health: statValue(stats, "生命值") || "见详情",
        toughness: statValue(stats, "耐久/韧性") || "见详情",
        firstSeen: statValue(stats, "首次出现") || "特殊模式",
        weakness: statValue(stats, "克制要点") || statValue(stats, "弱点") || statValue(stats, "其他弱点") || "集火/控制"
      },
      stats
    });
  }
  return rows;
}

function namesFromField(value = "") {
  const text = localizeText(value)
    .replace(/\(replaying\)/gi, " replaying")
    .replace(/Summoned:/gi, "Summoned:");
  return text
    .split(/,\s*|\s{2,}|<br\s*\/?>/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function levelCounterTips(zombieText) {
  const tips = [];
  const checks = [
    [/Buckethead|Football|Screen Door|Ladder|Pogo/i, "金属装备多时，磁力菇能显著降低铁桶、门板、头盔、跳杆或梯子的压力。"],
    [/Zomboni|Bobsled/i, "出现冰车/雪橇时，地刺和火爆辣椒要留给车辆与冰道。"],
    [/Balloon/i, "有气球僵尸时必须准备仙人掌、猫尾草或三叶草。"],
    [/Digger/i, "有矿工僵尸时，后排放裂荚射手或用磁力菇提前处理镐子。"],
    [/Dolphin|Snorkel|Ducky/i, "水路敌人多时，睡莲上的输出、缠绕水草和高坚果都要提前布置。"],
    [/Bungee|Catapult/i, "蹦极和投石车会打后排，叶子保护伞应覆盖核心植物。"],
    [/Gargantuar|Imp/i, "巨人出现时要保存冰冻、爆炸或玉米加农炮，半血后注意小鬼落点。"],
    [/Dr\. Zomboss/i, "僵王博士低头时集中输出；冰球用辣椒，火球用寒冰菇处理。"]
  ];
  for (const [pattern, tip] of checks) {
    if (pattern.test(zombieText)) tips.push(tip);
  }
  return tips.slice(0, 4);
}

function typeTip(type) {
  if (/Conveyor|传送带/i.test(type)) return "传送带关卡不能自选卡牌，重点是不要囤太多植物，及时把免费资源转成场上防线。";
  if (/Tutorial|教学/i.test(type)) return "教学关压力较低，重点是理解新机制并保持每行至少有基础火力。";
  if (/Bowling|保龄球/i.test(type)) return "保龄球式关卡要利用反弹和爆炸坚果清群，优先瞄准密集行。";
  if (/Last Stand|坚不可摧/i.test(type)) return "固定阳光布阵关要先想好整局阵型，开局布置比临场操作更重要。";
  if (/Boss|首领|战/i.test(type)) return "首领关的关键是留技能、补花盆，并在僵王博士低头时打出爆发。";
  return "常规选卡关要平衡经济、主火力、前排和至少一个救场植物。";
}

async function buildLevels() {
  const rows = [];
  for (let world = 1; world <= 5; world += 1) {
    for (let stage = 1; stage <= 10; stage += 1) {
      const code = `${world}-${stage}`;
      const page = await fetchPage(`Level ${code}`);
      const loc = cleanWiki(page.fields.Loc || "");
      const worldInfo = WORLD_COPY[loc] || { cn: loc || "未知场景", terrain: "详见关卡页。", advice: "根据本关僵尸组合调整火力和救场植物。" };
      const type = localizeText(page.fields.Type || "常规");
      const flag = localizeText(page.fields.Flag || "未标注");
      const reward = localizeText(page.fields.FR || "无新奖励");
      const plantsText = localizeText(page.fields.Plant || "");
      const zombiesRaw = cleanWiki(page.fields.Zombie || "");
      const zombiesText = localizeText(page.fields.Zombie || "");
      const imageFile = imageFromField(page.fields.image);
      const iconRemote = await resolveImageUrl(imageFile, page.thumbnail);
      const tips = [
        worldInfo.advice,
        typeTip(type),
        reward && reward !== "无新奖励" ? `通关奖励/解锁：${reward}。围绕新植物复盘前一关，会更容易理解下一关设计。` : "",
        ...levelCounterTips(zombiesRaw)
      ].filter(Boolean);
      rows.push({
        id: code,
        title: `${worldInfo.cn} ${code}`,
        cn: `第 ${world}-${stage} 关`,
        world: worldInfo.cn,
        terrain: worldInfo.terrain,
        type,
        flags: flag,
        reward,
        plants: plantsText,
        zombies: zombiesText,
        plantList: namesFromField(page.fields.Plant),
        zombieList: namesFromField(page.fields.Zombie),
        icon: "",
        iconRemote,
        wiki: wikiUrl(page.title),
        overview: `${worldInfo.cn}的${type}关卡。旗帜数：${flag}。本关的核心是根据场景限制建立稳定阵型，并针对出现僵尸保留合适的救场手段。`,
        tips
      });
    }
  }
  return rows;
}

const levelTitles = [];
for (let world = 1; world <= 5; world += 1) {
  for (let stage = 1; stage <= 10; stage += 1) {
    levelTitles.push(`Level ${world}-${stage}`);
  }
}

await fetchPages([
  ...PLANT_MANUAL.map((item) => item.title),
  ...ZOMBIE_MANUAL.map((item) => item.title),
  ...levelTitles
]);

const data = {
  generatedAt: new Date().toISOString(),
  sources: [
    { name: "Plants vs. Zombies Wiki.gg - Plants", url: "https://plantsvszombies.wiki.gg/wiki/Plants_(PvZ)" },
    { name: "Plants vs. Zombies Wiki.gg - Zombies", url: "https://plantsvszombies.wiki.gg/wiki/Zombies_(PvZ)" },
    { name: "Plants vs. Zombies Wiki.gg - Adventure Mode", url: "https://plantsvszombies.wiki.gg/wiki/Adventure_Mode" },
    { name: "StrategyWiki - Plants vs. Zombies", url: "https://strategywiki.org/wiki/Plants_vs._Zombies" }
  ],
  plants: await buildPlants(),
  zombies: await buildZombies(),
  levels: await buildLevels()
};

await localizeIcons(data);

await writeFile(
  "src/data.generated.js",
  `// Generated by tools/build-data.mjs. Do not edit by hand.\nwindow.PVZ_DATA = ${JSON.stringify(data, null, 2)};\n`,
  "utf8"
);

console.log(`Generated ${data.plants.length} plants, ${data.zombies.length} zombies, ${data.levels.length} levels.`);
