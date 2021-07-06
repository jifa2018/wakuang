(function () {
    'use strict';

    class CustomDefine {
        constructor() {
        }
    }
    CustomDefine.dataConfigUrl = "res/config/cfg_data.json";
    CustomDefine.environment = "";
    CustomDefine.appVersion = "";
    CustomDefine.maxBgWidth = 933;
    CustomDefine.SOUND_MAIN = "/sound/main.mp3";
    CustomDefine.SOUND_GAME = "/sound/game.mp3";
    CustomDefine.SOUND_BTN = "/sound/btn.mp3";
    CustomDefine.EVENT_APP_INIT = "EVENT_APP_INIT";
    CustomDefine.EVENT_EQUIP = "EVENT_EQUIP";
    CustomDefine.EVENT_BAG = "EVENT_BAG";
    CustomDefine.EVENT_SAVE_EQUIP = "EVENT_SAVE_EQUIP";
    CustomDefine.EVENT_GET_PRODUCT = "EVENT_GET_PRODUCT";
    CustomDefine.EVENT_STARTMINING = "EVENT_STARTMINING";
    CustomDefine.EVENT_CHANGETOOL = "EVENT_CHANGETOOL";
    CustomDefine.EVENT_CHANGTILI = "EVENT_CHANGTILI";
    CustomDefine.EVENT_MIN_RANK = "EVENT_MIN_RANK";
    CustomDefine.EVENT_MIN_RECORD = "EVENT_MIN_RECORD";
    CustomDefine.EVENT_MIN_NOTICE = "EVENT_MIN_NOTICE";
    CustomDefine.EVENT_CHANGE_DAY = "EVENT_CHANGE_DAY";
    CustomDefine.EVENT_CLOSELED = "EVENT_CLOSELED";
    CustomDefine.EVENT_OPENLED = "EVENT_OPENLED";
    CustomDefine.EVENT_APP_CONVERT = "EVENT_APP_CONVERT";
    CustomDefine.animGuide = "guide";
    CustomDefine.PET_EQUIP_COUNT = 5;
    CustomDefine.EVENT_BEHAVIOUR = "EVENT_BEHAVIOUR";
    CustomDefine.EVENT_PETANIFINISHEVENT = "EVENT_PETANIFINISHEVENT";
    CustomDefine.EVENT_PETMINOVERUPDATEEVENT = "EVENT_PETMINOVERUPDATEEVENT";
    CustomDefine.EVENT_UPDATENOTICE = "EVENT_UPDATENOTICE";
    CustomDefine.EVENT_FOUCE = "EVENT_FOUCE";
    CustomDefine.HTTP_SEND_ERROR = "HTTP_SEND_ERROR";
    class LocalKey {
    }
    LocalKey.GOLD = "GOLD";
    LocalKey.LEVEL = "LEVEL";
    LocalKey.SCORE = "SCORE";
    LocalKey.SCORE_MAX = "SCORE_MAX";
    LocalKey.LAST_DAY = "LAST_DAY";
    LocalKey.PLAY_VIDEO_COUNT = "PLAY_VIDEO_COUNT";
    LocalKey.KNIFE_ID = "KNIFE_ID";
    class Environment {
    }
    Environment.DEBUG = "debug";
    Environment.TEST = "test";
    Environment.PRE = "pre";
    Environment.RELEASE = "release";
    class ModuleType {
    }
    ModuleType.USER = "0";
    ModuleType.MIN = "1";
    class FontType {
    }
    FontType.fzxs = "fzxs";
    var TYPETOOL;
    (function (TYPETOOL) {
        TYPETOOL[TYPETOOL["lv_0"] = 0] = "lv_0";
        TYPETOOL[TYPETOOL["lv_1"] = 1] = "lv_1";
    })(TYPETOOL || (TYPETOOL = {}));

    class Struct_Equip {
        constructor() {
        }
    }
    class Struct_Bag {
        constructor() {
        }
    }
    class Struct_MinRank {
        constructor() {
        }
    }
    class Struct_MinRecord {
        constructor() {
        }
    }
    class Struct_MinRecordPrize {
        constructor() {
        }
    }
    class Cfg_Item {
        constructor() {
            this.sex = 0;
        }
    }
    class Cfg_Level {
        constructor() {
        }
    }
    class Cfg_Pass {
        constructor() {
        }
    }

    class UserData {
        constructor() {
            this.name = "";
            this.head = "";
            this.sex = 0;
            this.gold = 500000;
            this.level = 0;
            this.identity = "";
            this.appVersion = "";
            this.isMining = false;
            this.lastMinGetTime = 0;
            this.isGetRecordToday = false;
            this.todayGold = 0;
            if (UserData._ins != null)
                throw new Error("UserData is single!");
            this.arrMinRecordMonth = [];
            this.mapMinRecordMonth = new Map();
            EventManager.ins.on(CustomDefine.EVENT_CHANGE_DAY, this, this.EVENT_CHANGE_DAY);
        }
        static get ins() {
            if (!this._ins)
                UserData._ins = new UserData();
            return this._ins;
        }
        EVENT_CHANGE_DAY(evt) {
            this.isGetRecordToday = false;
            this.arrMinRank2 = null;
            this.arrMinRank3 = null;
        }
        initMinRank(obj) {
            let day = obj.data.day;
            let week = obj.data.week;
            let month = obj.data.month;
            if (day != null) {
                this.selfMinRank = null;
                this.lastMinGetTime = Laya.timer.currTimer;
                this.arrMinRank1 = [];
                this.arrMinRank1 = this.setRankData(day);
            }
            if (week != null) {
                this.arrMinRank2 = [];
                this.arrMinRank2 = this.setRankData(week, false);
            }
            if (month != null) {
                this.arrMinRank3 = [];
                this.arrMinRank3 = this.setRankData(month, false);
            }
            EventManager.ins.event(CustomDefine.EVENT_MIN_RANK, {});
        }
        setRankData(ranks, isDay = true) {
            let arrRank = [];
            if (ranks && ranks instanceof Array) {
                let index = 0;
                for (let rank of ranks) {
                    let struct = new Struct_MinRank();
                    struct.index = index++;
                    struct.id = rank.user_id;
                    struct.gold = Number(rank.reward);
                    if (isDay && rank.user_name == this.name) {
                        this.selfMinRank = struct;
                        struct.gold = UserData.ins.todayGold;
                    }
                    struct.name = rank.user_name;
                    struct.head = rank.user_avatar;
                    struct.arrPrize = [];
                    struct.boxCount = 0;
                    struct.boxValue = 0;
                    if (rank.treasure_avatars) {
                        for (let treasure of rank.treasure_avatars) {
                            let prize = new Struct_MinRecordPrize();
                            prize.icon = treasure.avatar;
                            prize.coinPrice = treasure.coin_value;
                            struct.arrPrize.push(prize);
                            struct.boxCount += 1;
                            struct.boxValue += prize.coinPrice;
                        }
                    }
                    arrRank.push(struct);
                }
                if (isDay && this.selfMinRank) {
                    arrRank.sort(this.sortByGold);
                }
                return arrRank;
            }
        }
        sortByGold(rank1, rank2) {
            if (rank1.gold > rank2.gold) {
                return -1;
            }
            return 1;
        }
        getMinRankByType(rankType) {
            return rankType == 1 ? this.arrMinRank1 : rankType == 2 ? this.arrMinRank2 : this.arrMinRank3;
        }
        initMinRecord(obj) {
            let month_list = obj.data.month_list;
            let day_list = obj.data.day_list;
            let month = obj.data.month;
            if (month == null || month == "") {
                if (month_list && month_list.length > 0) {
                    month = month_list[0].month;
                    this.minRecordYear = Number(month.substr(0, 4));
                }
                this.arrMinRecord = [];
                this.arrMinRecordPrize = [];
                this.arrMinRecordMonth = [];
                this.mapMinRecordMonth.clear();
                this.isGetRecordToday = true;
            }
            this.minRecordMonth = month;
            let arrDay = [];
            if (day_list && day_list instanceof Array) {
                for (let day of day_list) {
                    let record = new Struct_MinRecord();
                    record.id = 0;
                    record.count = day.count;
                    record.time = day.duration;
                    record.hp = day.expended;
                    record.gold = Number(day.reward);
                    record.day = day.day.substring(day.day.indexOf("月") + 1, day.day.indexOf("日"));
                    record.month_year = "";
                    record.month = Number(month.substr(4, 2));
                    record.arrPrize = [];
                    if (day.treasures) {
                        for (let treasure of day.treasures) {
                            let prize = new Struct_MinRecordPrize();
                            prize.icon = treasure.avatar;
                            prize.status = treasure.exchanged;
                            record.arrPrize.push(prize);
                        }
                    }
                    arrDay.push(record);
                }
                this.mapMinRecordMonth.set(month, arrDay);
            }
            if (month_list && month_list instanceof Array) {
                for (let record of month_list) {
                    let struct = new Struct_MinRecord();
                    struct.id = 0;
                    struct.month_year = record.month;
                    struct.year = record.month.substring(0, 4);
                    struct.month = Number(record.month.substr(4, 2));
                    struct.gold = Number(record.coin_count);
                    struct.count = Number(record.treasure_count);
                    struct.day = 0;
                    struct.time = 0;
                    struct.hp = 0;
                    this.arrMinRecordMonth.push(struct);
                }
            }
            let un_exchanges = obj.data.un_exchanges;
            if (un_exchanges && un_exchanges instanceof Array) {
                this.arrMinRecordPrize = [];
                for (let exchange of un_exchanges) {
                    let struct = new Struct_MinRecordPrize();
                    struct.id = exchange.id;
                    struct.desc = exchange.desc;
                    struct.price = exchange.price;
                    struct.icon = exchange.avatar;
                    this.arrMinRecordPrize.push(struct);
                }
            }
            EventManager.ins.event(CustomDefine.EVENT_MIN_RECORD);
        }
        isHaveMinRecordByMonth(month) {
            return this.mapMinRecordMonth.has(month);
        }
        getMinRecord() {
            this.minRecordMonthIndex = 0;
            let ret = [];
            for (let record of this.arrMinRecordMonth) {
                ret.push(record);
                if (this.minRecordMonth == record.month_year) {
                    this.minRecordMonthIndex = ret.length - 1;
                    let arrDay = this.mapMinRecordMonth.get(this.minRecordMonth);
                    ret = ret.concat(arrDay);
                }
            }
            return ret;
        }
        getMinRecordPrize() {
            let ret = this.arrMinRecordPrize;
            return ret;
        }
    }
    class EQUIP_TYPE {
    }
    EQUIP_TYPE.hat = 1;
    EQUIP_TYPE.hair = 2;
    EQUIP_TYPE.eye = 3;
    EQUIP_TYPE.ear = 4;
    EQUIP_TYPE.neck = 5;
    EQUIP_TYPE.body = 6;
    EQUIP_TYPE.arm = 7;
    EQUIP_TYPE.ring = 8;
    EQUIP_TYPE.belt = 9;
    EQUIP_TYPE.leg = 10;
    EQUIP_TYPE.foot = 11;
    class EQUIP_NAME {
    }
    EQUIP_NAME.hat = "帽子";
    EQUIP_NAME.hair = "发带";
    EQUIP_NAME.eye = "眼镜";
    EQUIP_NAME.ear = "耳饰";
    EQUIP_NAME.neck = "项链";
    EQUIP_NAME.body = "上衣";
    EQUIP_NAME.arm = "手镯 ";
    EQUIP_NAME.ring = "戒指";
    EQUIP_NAME.belt = "腰带";
    EQUIP_NAME.leg = "裤子";
    EQUIP_NAME.foot = "鞋";

    class DataConfig {
        constructor() {
            if (DataConfig._ins != null)
                throw new Error("DataConfig is single!");
        }
        static get ins() {
            if (!this._ins)
                DataConfig._ins = new DataConfig();
            return this._ins;
        }
        init(http) {
            if (!http)
                return;
            console.log("DataConfig:", http);
            let table = http.Items;
            FrameManager.ins.init(table.Cfg_Frame);
        }
        getItemById(ItemIndex) {
            return this.mapItem.get(ItemIndex);
        }
        getItems(type) {
            return this.arrItemType[type];
        }
        getLevel(lvl) {
            return this.arrLevel[lvl];
        }
    }

    var View = Laya.View;
    var Scene = Laya.Scene;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        class LoadingUI extends Scene {
            constructor() {
                super();
            }
            createChildren() {
                super.createChildren();
                this.createView(LoadingUI.uiView);
            }
        }
        LoadingUI.uiView = { "type": "Scene", "props": { "width": 750, "runtime": "script/LoadingUI.ts", "positionVariance_0": 100, "maxPartices": 100, "height": 1624 }, "compId": 1, "child": [{ "type": "Image", "props": { "y": 800, "x": 375, "skin": "loading/img_loading_desc.png", "anchorX": 0.5 }, "compId": 28 }, { "type": "Sprite", "props": { "y": 736, "x": 155, "width": 440, "var": "spScroll", "name": "spScroll", "height": 40 }, "compId": 30 }, { "type": "Label", "props": { "y": 600, "x": 375, "var": "txtCount", "text": "0%", "name": "txtCount", "fontSize": 40, "font": "SimHei", "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 31 }, { "type": "Button", "props": { "y": 98, "x": 46, "var": "btnCloseApp", "stateNum": 1, "skin": "loading/btn_close_loading.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 32 }, { "type": "Label", "props": { "y": 2000, "x": 532, "text": "Powered by LayaAir Engine", "name": "txtCount", "fontSize": 32, "font": "SimHei", "color": "#6c6464", "bold": false, "anchorX": 0.5 }, "compId": 33 }], "loadList": ["loading/img_loading_desc.png", "loading/btn_close_loading.png"], "loadList3D": [] };
        ui.LoadingUI = LoadingUI;
        REG("ui.LoadingUI", LoadingUI);
        class MsgUI extends Scene {
            constructor() {
                super();
            }
            createChildren() {
                super.createChildren();
                this.createView(MsgUI.uiView);
            }
        }
        MsgUI.uiView = { "type": "Scene", "props": { "width": 750, "runtime": "script/GameUI.ts", "positionVariance_0": 100, "maxPartices": 100, "height": 1624 }, "compId": 1, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "var": "spBg", "alpha": 0.7 }, "compId": 98, "child": [{ "type": "Rect", "props": { "x": 0, "width": 750, "height": 1624, "fillColor": "#000000" }, "compId": 99 }] }, { "type": "Image", "props": { "y": 500, "x": 375, "width": 660, "skin": "loading/img_msg_bg.png", "height": 540, "anchorX": 0.5, "sizeGrid": "110,60,40,62" }, "compId": 87, "child": [{ "type": "Image", "props": { "y": 40, "x": 335, "skin": "loading/img_msg_title.png", "anchorX": 0.5 }, "compId": 104 }] }, { "type": "Button", "props": { "y": 944, "x": 375, "width": 540, "var": "btnConfirm", "stateNum": 1, "skin": "loading/btn_confirm.png", "name": "btnConfirm", "labelStrokeColor": "#a13634", "labelStroke": 4, "labelSize": 36, "labelFont": "Microsoft YaHei", "labelColors": "#ffffff", "labelBold": true, "label": "确  定", "height": 96, "anchorY": 0.5, "anchorX": 0.5, "sizeGrid": "30,30,30,30" }, "compId": 56 }, { "type": "Label", "props": { "y": 643, "x": 375, "wordWrap": true, "width": 545, "var": "txtDesc", "valign": "top", "text": "欢迎来到凸物潮宠", "overflow": "hidden", "name": "txtDesc", "leading": 20, "height": 200, "fontSize": 24, "color": "#ffffff", "anchorX": 0.5, "align": "left" }, "compId": 91 }], "loadList": ["bg_main.jpg", "loading/img_msg_bg.png", "loading/img_msg_title.png", "loading/btn_confirm.png"], "loadList3D": [] };
        ui.MsgUI = MsgUI;
        REG("ui.MsgUI", MsgUI);
    })(ui || (ui = {}));
    (function (ui) {
        var min;
        (function (min) {
            class bagContentGoldUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(bagContentGoldUI.uiView);
                }
            }
            bagContentGoldUI.uiView = { "type": "Scene", "props": { "width": 750, "height": 1624 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": -92, "width": 933, "var": "bg", "skin": "mining/mohu2.jpg", "sizeGrid": "30,30,30,30", "height": 1624 }, "compId": 3 }, { "type": "Image", "props": { "y": 210, "x": 118, "width": 514, "skin": "mining/img_mohu.png", "height": 514 }, "compId": 4, "child": [{ "type": "Image", "props": { "y": 137, "x": 137, "width": 240, "skin": "game/img_gold_big.png", "height": 240 }, "compId": 5 }] }, { "type": "Image", "props": { "y": 796, "x": 113, "width": 32, "skin": "mining/img_tip.png", "height": 32 }, "compId": 6 }, { "type": "Label", "props": { "y": 801, "x": 155, "wordWrap": true, "width": 476, "text": "凸币作为凸物流通的唯一虚拟货币，通过多种方式获取，可用于购买凸币商城限量潮品。凸币商城潮品只能使用凸币购买！", "leading": 10, "height": 148, "fontSize": 28, "color": "#ffffff" }, "compId": 7 }, { "type": "HTMLDivElement", "props": { "y": 980, "x": 128, "width": "100", "var": "_html", "innerHTML": "htmlText", "height": "100", "runtime": "Laya.HTMLDivElement" }, "compId": 8 }, { "type": "Button", "props": { "width": 60, "var": "btn_close", "top": 88, "stateNum": 1, "skin": "mining/btn_close.png", "right": 48, "height": 60 }, "compId": 9 }], "loadList": ["mining/mohu2.jpg", "mining/img_mohu.png", "game/img_gold_big.png", "mining/img_tip.png", "mining/btn_close.png"], "loadList3D": [] };
            min.bagContentGoldUI = bagContentGoldUI;
            REG("ui.min.bagContentGoldUI", bagContentGoldUI);
            class bagContentGoodUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(bagContentGoodUI.uiView);
                }
            }
            bagContentGoodUI.uiView = { "type": "Scene", "props": { "width": 750, "height": 1624 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": -92, "width": 993, "var": "bg", "skin": "mining/mohu2.jpg", "sizeGrid": "30,30,30,30", "height": 1624 }, "compId": 3 }, { "type": "Image", "props": { "y": 210, "x": 118, "width": 514, "skin": "mining/img_mohu.png", "height": 514 }, "compId": 4, "child": [{ "type": "Image", "props": { "y": 39, "x": 39, "width": 436, "var": "img_good", "skin": "mining/img_xuezi.png", "pivotY": 0, "pivotX": 0, "height": 436 }, "compId": 9 }, { "type": "Panel", "props": { "y": 77, "x": 39, "width": 436, "visible": false, "var": "_panel", "height": 360 }, "compId": 20 }] }, { "type": "Button", "props": { "x": 10, "width": 60, "var": "btn_close", "top": 88, "stateNum": 1, "skin": "mining/btn_close.png", "right": 48, "height": 60 }, "compId": 8 }, { "type": "Image", "props": { "y": 758, "x": 118, "width": 60, "var": "logo", "skin": "mining/img_logo.png", "height": 60 }, "compId": 10, "child": [{ "type": "Sprite", "props": { "renderType": "mask" }, "compId": 18, "child": [{ "type": "Circle", "props": { "y": 30, "x": 30, "radius": 30, "lineWidth": 1, "fillColor": "#ff0000" }, "compId": 19 }] }] }, { "type": "Label", "props": { "y": 758, "x": 194, "width": 278, "var": "lab_logo", "valign": "middle", "text": "logo", "overflow": "hidden", "height": 60, "fontSize": 28, "color": "#ffffff" }, "compId": 11 }, { "type": "Label", "props": { "y": 839, "x": 124, "wordWrap": true, "width": 514, "var": "lab_good_m", "valign": "top", "text": "VANS范斯万斯SK8-HI高帮可裁剪DIY休闲板鞋男女情侣款 ", "overflow": "hidden", "leading": 20, "height": 39, "fontSize": 28, "color": "#ffffff", "align": "left" }, "compId": 12 }, { "type": "Label", "props": { "y": 915, "x": 124, "wordWrap": true, "width": 513, "var": "price", "valign": "top", "text": "价值￥658.00 ", "overflow": "hidden", "leading": 20, "height": 32, "fontSize": 28, "color": "#FDC001", "align": "left" }, "compId": 13 }, { "type": "Label", "props": { "y": 879, "x": 125, "wordWrap": true, "width": 347, "var": "chicun", "valign": "top", "text": "宝物尺码：US8", "overflow": "hidden", "leading": 20, "height": 30, "fontSize": 24, "color": "#ffffff", "align": "left" }, "compId": 15 }, { "type": "Label", "props": { "y": 970, "x": 124, "wordWrap": true, "width": 514, "var": "jieshao", "valign": "top", "text": "Vans通过引入ComfyCush技术，重新焕发了传奇的Sk8 Hi轮廓：一种柔软、缓震的新外底，赋予麂皮帆布ComfyCush Sk8 Hi一流贴合感，感觉就像在云中行走。", "overflow": "hidden", "leading": 10, "height": 98, "fontSize": 24, "color": "#ffffff", "align": "left" }, "compId": 16 }, { "type": "Button", "props": { "y": 1083, "x": 118, "width": 514, "var": "btn_ljdh", "stateNum": 1, "skin": "mining/btn_ljdh.png", "height": 80 }, "compId": 17 }], "loadList": ["mining/mohu2.jpg", "mining/img_mohu.png", "mining/img_xuezi.png", "mining/btn_close.png", "mining/img_logo.png", "mining/btn_ljdh.png"], "loadList3D": [] };
            min.bagContentGoodUI = bagContentGoodUI;
            REG("ui.min.bagContentGoodUI", bagContentGoodUI);
            class GMUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(GMUI.uiView);
                }
            }
            GMUI.uiView = { "type": "Scene", "props": { "width": 1125, "height": 200 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "width": 1125, "skin": "mining/img_item_bg_sel.png", "sizeGrid": "66,68,92,76", "right": 0, "left": 0, "height": 92 }, "compId": 5 }, { "type": "TextInput", "props": { "y": 0, "x": 0, "width": 1127, "var": "gm", "type": "text", "promptColor": "#fbf100", "prompt": "GM命令:{  type: 4, number: 0, treasure_id: \"1402811771965681664\" }", "height": 56, "fontSize": 30, "editable": true }, "compId": 3 }, { "type": "Button", "props": { "y": 92, "x": 930, "width": 195, "var": "btn_select", "stateNum": 1, "skin": "mining/btn_qr.png", "height": 99 }, "compId": 4 }], "loadList": ["mining/img_item_bg_sel.png", "mining/btn_qr.png"], "loadList3D": [] };
            min.GMUI = GMUI;
            REG("ui.min.GMUI", GMUI);
            class ItemMinExchangeUI extends View {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ItemMinExchangeUI.uiView);
                }
            }
            ItemMinExchangeUI.uiView = { "type": "View", "props": { "width": 646, "height": 140 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 646, "skin": "mining/img_bg_24_3.png", "name": "bg", "height": 140, "sizeGrid": "24,24,24,24" }, "compId": 49 }, { "type": "Image", "props": { "y": 81, "x": 72, "width": 96, "skin": "mining/img_icon_bg.png", "height": 96, "anchorY": 0.5, "anchorX": 0.5, "sizeGrid": "20,20,20,20" }, "compId": 50 }, { "type": "Image", "props": { "y": 60, "x": 516, "skin": "mining/img_go_exchange.png" }, "compId": 51 }, { "type": "Image", "props": { "y": 81, "x": 72, "width": 80, "var": "itemIcon", "height": 80, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 46 }, { "type": "Label", "props": { "y": 91, "x": 124, "width": 136, "var": "txtPrice", "valign": "middle", "text": "100", "height": 40, "fontSize": 24, "color": "#ffffff", "bold": true, "align": "left" }, "compId": 27 }, { "type": "Label", "props": { "y": 33, "x": 124, "width": 196, "var": "txtName", "valign": "middle", "text": "商品名字", "height": 40, "fontSize": 24, "font": "SimHei", "color": "#ffffff", "align": "left" }, "compId": 29 }], "loadList": ["mining/img_bg_24_3.png", "mining/img_icon_bg.png", "mining/img_go_exchange.png"], "loadList3D": [] };
            min.ItemMinExchangeUI = ItemMinExchangeUI;
            REG("ui.min.ItemMinExchangeUI", ItemMinExchangeUI);
            class ItemMinRankUI extends View {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ItemMinRankUI.uiView);
                }
            }
            ItemMinRankUI.uiView = { "type": "View", "props": { "width": 516, "height": 96 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "skin": "mining/img_rank_item_bg.png" }, "compId": 17 }, { "type": "Image", "props": { "y": 30, "x": 260, "var": "imgBox", "skin": "mining/img_rank_box2.png", "anchorY": 0.5 }, "compId": 8, "child": [{ "type": "Image", "props": { "y": 16, "x": 98, "var": "imgGe", "skin": "mining/img_number9.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 33 }, { "type": "Image", "props": { "y": 16, "x": 80, "var": "imgShi", "skin": "mining/img_number8.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 34 }] }, { "type": "Label", "props": { "y": 48, "x": 81, "width": 245, "var": "txtName", "valign": "middle", "text": "奥特曼", "height": 42, "fontSize": 24, "color": "#ffffff", "anchorY": 0.5, "align": "left" }, "compId": 7 }, { "type": "Label", "props": { "y": 30, "x": 502, "var": "txtGold", "valign": "middle", "text": "99999", "italic": true, "height": 35, "fontSize": 32, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 1, "align": "right" }, "compId": 11 }, { "type": "Image", "props": { "y": 30, "x": 381, "var": "imgGold", "skin": "game/img_gold.png", "anchorY": 0.5 }, "compId": 12 }, { "type": "Label", "props": { "y": 60, "x": 183, "width": 325, "var": "txtLucky", "text": "运气爆棚，挖到的实物奖品价值000凸币", "height": 24, "fontSize": 16, "font": "SimSun", "color": "#ffffff", "align": "right" }, "compId": 14 }, { "type": "Image", "props": { "y": 48, "x": 48, "width": 56, "var": "imgHead", "height": 56, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4, "child": [{ "type": "Sprite", "props": { "renderType": "mask" }, "compId": 15, "child": [{ "type": "Circle", "props": { "y": 28, "x": 28, "radius": 28, "fillColor": "#ff0000" }, "compId": 16 }] }] }, { "type": "Sprite", "props": { "y": 23, "x": 324, "width": 56, "var": "spPrize1", "height": 56 }, "compId": 40, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 56, "skin": "mining/img_icon_bg.png", "name": "bg", "height": 56, "sizeGrid": "20,20,20,20" }, "compId": 41 }, { "type": "Image", "props": { "y": 23, "x": 23, "width": 46, "var": "imgItem1", "skin": "mining/img_bg_12.png", "height": 46, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 42 }, { "type": "Image", "props": { "width": 56, "var": "imgStatus1", "skin": "mining/img_bg_12_2.png", "height": 56, "sizeGrid": "12,12,12,12" }, "compId": 43, "child": [{ "type": "Image", "props": { "y": 32, "x": 32, "skin": "mining/img_exchanged.png" }, "compId": 44 }] }] }, { "type": "Sprite", "props": { "y": 23, "x": 258, "width": 56, "var": "spPrize2", "height": 56 }, "compId": 35, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 56, "skin": "mining/img_icon_bg.png", "name": "bg", "height": 56, "sizeGrid": "20,20,20,20" }, "compId": 36 }, { "type": "Image", "props": { "y": 23, "x": 23, "width": 46, "var": "imgItem2", "skin": "mining/img_bg_12.png", "height": 46, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 37 }, { "type": "Image", "props": { "width": 56, "var": "imgStatus2", "skin": "mining/img_bg_12_2.png", "height": 56, "sizeGrid": "12,12,12,12" }, "compId": 38, "child": [{ "type": "Image", "props": { "y": 32, "x": 32, "skin": "mining/img_exchanged.png" }, "compId": 39 }] }] }, { "type": "Sprite", "props": { "y": 21, "x": 190, "width": 56, "var": "spPrize3", "height": 56 }, "compId": 18, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 56, "skin": "mining/img_icon_bg.png", "name": "bg", "height": 56, "sizeGrid": "20,20,20,20" }, "compId": 21 }, { "type": "Image", "props": { "y": 23, "x": 23, "width": 46, "var": "imgItem3", "skin": "mining/img_bg_12.png", "height": 46, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 22 }, { "type": "Image", "props": { "width": 56, "var": "imgStatus3", "skin": "mining/img_bg_12_2.png", "height": 56, "sizeGrid": "12,12,12,12" }, "compId": 23, "child": [{ "type": "Image", "props": { "y": 32, "x": 32, "skin": "mining/img_exchanged.png" }, "compId": 24 }] }] }], "loadList": ["mining/img_rank_item_bg.png", "mining/img_rank_box2.png", "mining/img_number9.png", "mining/img_number8.png", "game/img_gold.png", "mining/img_icon_bg.png", "mining/img_bg_12.png", "mining/img_bg_12_2.png", "mining/img_exchanged.png"], "loadList3D": [] };
            min.ItemMinRankUI = ItemMinRankUI;
            REG("ui.min.ItemMinRankUI", ItemMinRankUI);
            class ItemMinRecordUI extends View {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ItemMinRecordUI.uiView);
                }
            }
            ItemMinRecordUI.uiView = { "type": "View", "props": { "width": 646, "height": 140 }, "compId": 2, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "width": 646, "var": "spRecordMonth", "name": "spRecordMonth", "height": 140 }, "compId": 16, "child": [{ "type": "Label", "props": { "y": 35, "x": 2.3, "var": "txtMonth", "valign": "middle", "text": "5", "name": "txtMonth", "italic": true, "height": 64, "fontSize": 72, "font": "Arial", "color": "#ffffff", "bold": true, "align": "left" }, "compId": 18 }, { "type": "Label", "props": { "y": 25, "x": 414, "width": 136, "valign": "middle", "text": "收入凸币：", "height": 42, "fontSize": 20, "color": "#fff8f8", "align": "right" }, "compId": 19 }, { "type": "Label", "props": { "y": 65, "x": 95, "var": "txtYearWord", "valign": "middle", "text": "月         年", "height": 37, "fontSize": 28, "font": "Arial", "color": "#ffffff", "align": "left" }, "compId": 26 }, { "type": "Label", "props": { "y": 61, "x": 552, "width": 90, "var": "txtMonthBox", "valign": "middle", "text": "10", "name": "txtMonthBox", "height": 42, "fontSize": 20, "color": "#fff8f8", "align": "left" }, "compId": 27 }, { "type": "Label", "props": { "y": 61, "x": 414, "width": 136, "valign": "middle", "text": "挖掘宝藏：", "height": 42, "fontSize": 20, "color": "#fff8f8", "align": "right" }, "compId": 28 }, { "type": "Label", "props": { "y": 25, "x": 552, "width": 90, "var": "txtMonthGold", "valign": "middle", "text": "99999", "height": 42, "fontSize": 20, "color": "#fff8f8", "align": "left" }, "compId": 29 }, { "type": "Label", "props": { "y": 64, "x": 128, "width": 100, "var": "txtYear", "valign": "middle", "text": "2021", "italic": true, "height": 37, "fontSize": 28, "font": "Arial", "color": "#ffffff", "align": "left" }, "compId": 67 }, { "type": "Image", "props": { "y": 60, "x": 249, "var": "imgMenuStatus", "skin": "mining/img_menu_status.png" }, "compId": 72 }, { "type": "Image", "props": { "y": 114, "x": -24, "var": "imgMenuBottom", "skin": "mining/img_record_bottom.png" }, "compId": 73 }] }, { "type": "Sprite", "props": { "width": 646, "var": "spRecord", "name": "spRecord", "height": 140 }, "compId": 15, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 646, "var": "bg", "skin": "mining/img_record_item_bg.png", "height": 140 }, "compId": 48 }, { "type": "Sprite", "props": { "y": 22, "x": 300, "width": 56, "var": "spPrize3", "height": 56 }, "compId": 54, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 56, "skin": "mining/img_icon_bg_2.png", "name": "bg", "height": 56 }, "compId": 55 }, { "type": "Image", "props": { "y": 28, "x": 28, "width": 46, "var": "imgItem3", "skin": "mining/img_bg_12.png", "height": 46, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 56 }, { "type": "Image", "props": { "y": 28, "x": 28, "width": 56, "var": "imgStatus3", "skin": "mining/img_bg_12_2.png", "height": 56, "anchorY": 0.5, "anchorX": 0.5, "sizeGrid": "12,12,12,12" }, "compId": 59, "child": [{ "type": "Image", "props": { "y": 32, "x": 32, "skin": "mining/img_exchanged.png" }, "compId": 58 }] }] }, { "type": "Sprite", "props": { "y": 24, "x": 366, "width": 56, "var": "spPrize2", "height": 56 }, "compId": 79, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 56, "skin": "mining/img_icon_bg_2.png", "name": "bg", "height": 56 }, "compId": 80 }, { "type": "Image", "props": { "y": 28, "x": 28, "width": 46, "var": "imgItem2", "skin": "mining/img_bg_12.png", "height": 46, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 81 }, { "type": "Image", "props": { "y": 28, "x": 28, "width": 56, "var": "imgStatus2", "skin": "mining/img_bg_12_2.png", "height": 56, "anchorY": 0.5, "anchorX": 0.5, "sizeGrid": "12,12,12,12" }, "compId": 82, "child": [{ "type": "Image", "props": { "y": 32, "x": 32, "skin": "mining/img_exchanged.png" }, "compId": 83 }] }] }, { "type": "Sprite", "props": { "y": 22, "x": 431, "width": 56, "var": "spPrize1", "height": 56 }, "compId": 74, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 56, "skin": "mining/img_icon_bg_2.png", "name": "bg", "height": 56 }, "compId": 75 }, { "type": "Image", "props": { "y": 28, "x": 28, "width": 46, "var": "imgItem1", "skin": "mining/img_bg_12.png", "height": 46, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 76 }, { "type": "Image", "props": { "y": 28, "x": 28, "width": 56, "var": "imgStatus1", "skin": "mining/img_bg_12_2.png", "height": 56, "anchorY": 0.5, "anchorX": 0.5, "sizeGrid": "12,12,12,12" }, "compId": 77, "child": [{ "type": "Image", "props": { "y": 32, "x": 32, "skin": "mining/img_exchanged.png" }, "compId": 78 }] }] }, { "type": "Sprite", "props": { "y": 0, "x": 0, "var": "spDesc" }, "compId": 70, "child": [{ "type": "Label", "props": { "y": 90, "x": 27, "width": 95, "var": "txtName", "valign": "middle", "text": "挖矿时间：", "height": 35, "fontSize": 20, "color": "#ffffff", "align": "left" }, "compId": 7 }, { "type": "Label", "props": { "y": 90, "x": 118, "width": 116, "var": "txtTime", "valign": "middle", "text": "30分钟", "height": 35, "fontSize": 20, "color": "#ffffff", "align": "left" }, "compId": 13 }, { "type": "Label", "props": { "y": 90, "x": 217, "width": 97, "valign": "middle", "text": "挖矿次数：", "height": 35, "fontSize": 20, "color": "#ffffff", "align": "left" }, "compId": 36 }, { "type": "Label", "props": { "y": 90, "x": 308, "width": 54, "var": "txtCount", "valign": "middle", "text": "10", "height": 35, "fontSize": 20, "color": "#ffffff", "align": "left" }, "compId": 37 }, { "type": "Label", "props": { "y": 90, "x": 363, "width": 94, "valign": "middle", "text": "消耗体力：", "height": 35, "fontSize": 20, "color": "#ffffff", "align": "left" }, "compId": 38 }, { "type": "Label", "props": { "y": 90, "x": 459, "width": 137, "var": "txtHp", "valign": "middle", "text": "100", "height": 35, "fontSize": 20, "color": "#ffffff", "align": "left" }, "compId": 39 }] }, { "type": "Label", "props": { "y": 40, "x": 17, "var": "txtMon", "valign": "middle", "text": "10", "name": "txtMon", "italic": true, "height": 50, "fontSize": 32, "color": "#ffffff", "bold": true, "anchorY": 0.5, "align": "left" }, "compId": 30 }, { "type": "Label", "props": { "y": 34, "x": 545, "width": 91, "var": "txtGold", "valign": "middle", "text": "1000", "italic": true, "height": 34, "fontSize": 32, "color": "#ffffff", "bold": true, "align": "left" }, "compId": 40 }, { "type": "Label", "props": { "y": 16, "x": 136, "var": "txtDayWord", "valign": "middle", "text": "日", "italic": false, "height": 50, "fontSize": 32, "color": "#ffffff", "bold": false, "align": "left" }, "compId": 64 }, { "type": "Label", "props": { "y": 16, "x": 58, "var": "txtMonWord", "valign": "middle", "text": "月", "italic": false, "height": 50, "fontSize": 32, "color": "#ffffff", "bold": false, "align": "left" }, "compId": 65 }, { "type": "Label", "props": { "y": 40, "x": 90, "var": "txtDay", "valign": "middle", "text": "25", "name": "txtDay", "italic": true, "height": 50, "fontSize": 32, "color": "#ffffff", "bold": true, "anchorY": 0.5, "align": "left" }, "compId": 66 }, { "type": "Image", "props": { "y": 50, "x": 508, "skin": "game/img_gold.png", "anchorY": 0.5 }, "compId": 57 }] }], "loadList": ["mining/img_menu_status.png", "mining/img_record_bottom.png", "mining/img_record_item_bg.png", "mining/img_icon_bg_2.png", "mining/img_bg_12.png", "mining/img_bg_12_2.png", "mining/img_exchanged.png", "game/img_gold.png"], "loadList3D": [] };
            min.ItemMinRecordUI = ItemMinRecordUI;
            REG("ui.min.ItemMinRecordUI", ItemMinRecordUI);
            class ItemTreasuryUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ItemTreasuryUI.uiView);
                }
            }
            ItemTreasuryUI.uiView = { "type": "Scene", "props": { "width": 1125, "height": 711 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 9, "var": "img_bg_treasure", "skin": "mining/img_hdb.png", "sizeGrid": "141,0,0,68" }, "compId": 12, "child": [{ "type": "Panel", "props": { "y": 458, "x": 50, "width": 1009, "var": "panel", "height": 247 }, "compId": 25, "child": [{ "type": "View", "props": { "y": 0, "x": 0, "width": 957, "var": "view_p" }, "compId": 44 }] }, { "type": "Label", "props": { "y": 483, "x": 68, "visible": false, "var": "txtTodayLucky", "text": "今日幸运宝藏", "fontSize": 36, "color": "#FDC001" }, "compId": 47 }] }], "loadList": ["mining/img_hdb.png"], "loadList3D": [] };
            min.ItemTreasuryUI = ItemTreasuryUI;
            REG("ui.min.ItemTreasuryUI", ItemTreasuryUI);
            class MinUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MinUI.uiView);
                }
            }
            MinUI.uiView = { "type": "Scene", "props": { "width": 750, "height": 1624 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": -92, "width": 933, "visible": false, "top": 0, "skin": "mining/img_bg.jpg", "name": "bg", "height": 1624 }, "compId": 4 }, { "type": "Image", "props": { "y": 0, "x": -100, "width": 948, "skin": "mining/img_navbar.png", "height": 282 }, "compId": 131 }, { "type": "Image", "props": { "y": 0, "x": 32, "width": 686, "var": "img_bg_treasure", "skin": "mining/img_hdb.png", "sizeGrid": "0,0,0,0", "height": 474 }, "compId": 120, "child": [{ "type": "Panel", "props": { "y": 291, "x": 10, "width": 665, "var": "panel", "height": 171 }, "compId": 121, "child": [{ "type": "View", "props": { "y": 5, "x": 0, "width": 665, "var": "view_p" }, "compId": 122 }] }] }, { "type": "Image", "props": { "x": 37, "width": 28, "top": 232, "skin": "game/img_gold.png", "height": 28 }, "compId": 81 }, { "type": "HTMLDivElement", "props": { "y": 238, "x": 71, "width": null, "var": "minNumber", "height": null, "runtime": "Laya.HTMLDivElement" }, "compId": 5 }, { "type": "Label", "props": { "x": 39, "var": "lblOnLine", "top": 102, "text": "在线挖矿人数", "fontSize": 20, "color": "#FDC001" }, "compId": 80 }, { "type": "Image", "props": { "x": 37, "width": 300, "var": "img_bg_crowd", "top": 150, "skin": "mining/img_ydb.png", "sizeGrid": "0,0,0,0", "height": 59 }, "compId": 37, "child": [{ "type": "Label", "props": { "y": -1, "x": 180, "width": 120, "var": "crowdsCount", "valign": "middle", "text": "5641", "height": 60, "fontSize": 20, "color": "#ffffff", "alpha": 0.8, "align": "center" }, "compId": 38 }, { "type": "Image", "props": { "y": 0, "x": 1, "width": 59, "name": "img_crowdIcon", "height": 59 }, "compId": 39 }] }, { "type": "Button", "props": { "width": 68, "visible": false, "var": "btn_back", "top": 25, "stateNum": 1, "skin": "mining/btn_close.png", "right": 32, "name": "btn_back", "height": 71 }, "compId": 6 }, { "type": "Image", "props": { "y": 1204, "x": 622, "width": 192, "var": "kuangbao", "skin": "mining/img_bag.png", "scaleY": 1, "scaleX": 1, "rotation": 0, "pivotY": 185, "pivotX": 158, "height": 224 }, "compId": 83 }, { "type": "Box", "props": { "y": 0, "x": 0, "var": "bagContent" }, "compId": 114 }, { "type": "Image", "props": { "y": 1362, "x": 30, "width": 690, "visible": true, "var": "biankuang", "skin": "mining/img_bainkuang.png", "sizeGrid": "156,375,146,341", "height": 212, "bottom": 50 }, "compId": 90, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 690, "var": "bg_bag", "skin": "mining/img_dikaung_da.png", "sizeGrid": "0,0,0,0", "height": 212 }, "compId": 71 }, { "type": "Label", "props": { "y": 8, "x": -51, "width": 250, "valign": "middle", "text": "我的背包", "height": 60, "fontSize": 24, "color": "#FDC001", "align": "center" }, "compId": 72 }, { "type": "Label", "props": { "width": 250, "var": "notes", "valign": "middle", "top": 8, "text": "历史记录", "right": -51, "height": 60, "fontSize": 24, "color": "#FFFFFF", "alpha": 0.65, "align": "center" }, "compId": 74 }, { "type": "List", "props": { "y": 72, "x": 23, "width": 643, "var": "list_bag", "spaceX": 15, "selectEnable": true, "repeatY": 1, "repeatX": 5, "height": 119 }, "compId": 75, "child": [{ "type": "Box", "props": { "y": 0, "x": 1, "width": 116, "renderType": "render", "height": 116 }, "compId": 76, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 116, "skin": "mining/img_bugItem.png", "sizeGrid": "0,0,0,0", "name": "bg", "height": 116 }, "compId": 77 }, { "type": "Image", "props": { "y": 30, "x": 30, "width": 55, "skin": "mining/img_gold.png", "name": "img_icon", "height": 55 }, "compId": 78 }, { "type": "Image", "props": { "y": 0, "x": 0, "visible": false, "top": 0, "skin": "mining/img_jingbian.png", "right": 0, "name": "img_jb", "left": 0, "bottom": 0 }, "compId": 113 }, { "type": "Label", "props": { "y": 76, "x": 0, "wordWrap": false, "width": 117, "valign": "middle", "text": "时刻提防阿萨", "overflow": "hidden", "name": "lab_name", "height": 42, "fontSize": 18, "color": "#FFFFFF", "alpha": 0.65, "align": "center" }, "compId": 79 }] }] }] }, { "type": "Image", "props": { "y": 567, "x": 0, "visible": false, "skin": "mining/img_kuang1.png" }, "compId": 85 }, { "type": "Box", "props": { "y": 529, "x": 69, "width": 612, "visible": false, "var": "tip2", "height": 566 }, "compId": 124, "child": [{ "type": "Image", "props": { "y": -529, "x": -161, "width": 933, "skin": "mining/mohu2.jpg", "height": 1624 }, "compId": 130 }, { "type": "Image", "props": { "y": -529, "x": -161, "width": 933, "skin": "mining/img_heidi.png", "height": 1624, "alpha": 0.8 }, "compId": 128 }, { "type": "Image", "props": { "y": 0, "x": 0, "width": 612, "skin": "mining/img_tip_huise.png", "height": 566 }, "compId": 125 }, { "type": "Button", "props": { "y": 418, "x": 44, "width": 524, "var": "out", "stateNum": 1, "skin": "mining/btn_mingtianzailai.png", "height": 80 }, "compId": 126 }, { "type": "Label", "props": { "y": 221, "x": 46, "wordWrap": true, "width": 520, "text": "当前矿洞资源正在重生，更大宝藏等你发掘，明日请早哦！", "name": "content", "leading": 20, "height": 88, "fontSize": 30, "font": "Microsoft YaHei", "color": "#ffffff" }, "compId": 127 }] }], "loadList": ["mining/img_bg.jpg", "mining/img_navbar.png", "mining/img_hdb.png", "game/img_gold.png", "mining/img_ydb.png", "mining/btn_close.png", "mining/img_bag.png", "mining/img_bainkuang.png", "mining/img_dikaung_da.png", "mining/img_bugItem.png", "mining/img_gold.png", "mining/img_jingbian.png", "mining/img_kuang1.png", "mining/mohu2.jpg", "mining/img_heidi.png", "mining/img_tip_huise.png", "mining/btn_mingtianzailai.png"], "loadList3D": [] };
            min.MinUI = MinUI;
            REG("ui.min.MinUI", MinUI);
            class MinDoorUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MinDoorUI.uiView);
                }
            }
            MinDoorUI.uiView = { "type": "Scene", "props": { "width": 750, "height": 1624 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": -92, "width": 933, "var": "bg", "skin": "mining/img_door.jpg", "height": 1624 }, "compId": 3 }, { "type": "Image", "props": { "y": 480, "x": 90, "width": 540, "skin": "mining/img_bg45.png", "height": 158 }, "compId": 8, "child": [{ "type": "Label", "props": { "y": 66, "x": 75, "visible": false, "text": "今日幸运宝藏", "fontSize": 36, "font": "Microsoft YaHei", "color": "#FDC001" }, "compId": 10 }, { "type": "Panel", "props": { "y": 15, "x": 13, "width": 516, "var": "panel", "height": 131 }, "compId": 11, "child": [{ "type": "View", "props": { "y": 0, "x": 0, "width": 516, "var": "view_p", "height": 0 }, "compId": 12 }] }] }, { "type": "Button", "props": { "x": 81, "var": "come", "stateNum": 1, "skin": "mining/btn_come2.png", "bottom": 468 }, "compId": 4 }, { "type": "Box", "props": { "x": 116, "height": 300, "bottom": 255 }, "compId": 77, "child": [{ "type": "Label", "props": { "y": 161, "x": 132, "text": "*本程序仅限18岁及以上", "fontSize": 24, "color": "#F7BC64", "bottom": 115 }, "compId": 6 }, { "type": "Label", "props": { "y": 226, "x": 0, "text": "*实物奖励兑换有效期为30天，过期后将不可兑换", "fontSize": 24, "color": "#F7BC64", "bottom": 50 }, "compId": 76 }] }], "loadList": ["mining/img_door.jpg", "mining/img_bg45.png", "mining/btn_come2.png"], "loadList3D": [] };
            min.MinDoorUI = MinDoorUI;
            REG("ui.min.MinDoorUI", MinDoorUI);
            class MinDoorTipUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MinDoorTipUI.uiView);
                }
            }
            MinDoorTipUI.uiView = { "type": "Scene", "props": { "width": 750, "height": 1624 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": -92, "width": 933, "var": "bg", "skin": "mining/mohu1.jpg", "height": 1624 }, "compId": 14 }, { "type": "Image", "props": { "y": 455, "x": 51, "width": 648, "visible": false, "var": "tip1", "skin": "mining/img_bg3X.png", "height": 714 }, "compId": 3, "child": [{ "type": "Image", "props": { "x": 126, "width": 395, "top": 76, "skin": "mining/img_xiaoren.png", "height": 354 }, "compId": 5 }, { "type": "Button", "props": { "width": 264, "var": "btn_q", "stateNum": 1, "skin": "mining/btn_quxiao.png", "left": 60, "height": 96, "bottom": 48 }, "compId": 6 }, { "type": "Button", "props": { "width": 234, "var": "btn_s", "stateNum": 1, "skin": "mining/btn_qr.png", "right": 60, "bottom": 52 }, "compId": 8 }, { "type": "HTMLDivElement", "props": { "y": 484, "x": 96, "width": "100", "var": "_html", "innerHTML": "htmlText", "height": "100", "runtime": "Laya.HTMLDivElement" }, "compId": 9 }, { "type": "Label", "props": { "y": 475, "x": 45, "width": 558, "var": "goldTip", "text": "您的凸币余额不足，快去赚凸币吧", "height": 35, "fontSize": 30, "color": "#ffffff", "align": "center" }, "compId": 16 }] }, { "type": "Box", "props": { "y": 529, "x": 69, "width": 612, "visible": false, "var": "tip2", "height": 566 }, "compId": 12, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 612, "skin": "mining/img_tip_huise.png", "height": 566 }, "compId": 10 }, { "type": "Button", "props": { "var": "out", "stateNum": 1, "skin": "mining/btn_mingtianzailai.png", "left": 36, "bottom": 45 }, "compId": 11 }, { "type": "Label", "props": { "y": 230, "x": 46, "wordWrap": true, "width": 520, "text": "当前矿洞资源正在重生，更大宝藏等你发掘，明日请早哦！", "leading": 20, "height": 84, "fontSize": 30, "font": "Microsoft YaHei", "color": "#ffffff" }, "compId": 13 }] }], "loadList": ["mining/mohu1.jpg", "mining/img_bg3X.png", "mining/img_xiaoren.png", "mining/btn_quxiao.png", "mining/btn_qr.png", "mining/img_tip_huise.png", "mining/btn_mingtianzailai.png"], "loadList3D": [] };
            min.MinDoorTipUI = MinDoorTipUI;
            REG("ui.min.MinDoorTipUI", MinDoorTipUI);
            class MinNoticeUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MinNoticeUI.uiView);
                }
            }
            MinNoticeUI.uiView = { "type": "Scene", "props": { "width": 800, "runtime": "script/GameUI.ts", "positionVariance_0": 100, "maxPartices": 100, "height": 70 }, "compId": 1, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "width": 800, "var": "spContent", "height": 70 }, "compId": 117, "child": [{ "type": "Label", "props": { "y": 35, "x": 0, "text": "恭喜", "fontSize": 36, "font": "SimHei", "color": "#ffffff", "anchorY": 0.5 }, "compId": 107 }, { "type": "Label", "props": { "y": 35, "x": 292, "var": "txtItemName", "text": "VANS高帮裁切时尚风衣", "height": 36, "fontSize": 36, "font": "SimHei", "color": "#ffffff", "anchorY": 0.5, "align": "left" }, "compId": 108 }, { "type": "Image", "props": { "y": 35, "x": 111, "width": 60, "var": "imgHead", "height": 60, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 110, "child": [{ "type": "Sprite", "props": { "renderType": "mask" }, "compId": 121, "child": [{ "type": "Circle", "props": { "y": 30, "x": 30, "radius": 30, "fillColor": "#ff0000" }, "compId": 122 }] }] }, { "type": "Image", "props": { "y": 5, "x": 85, "skin": "mining/img_notice_circle.png" }, "compId": 124 }, { "type": "Label", "props": { "y": 35, "x": 156, "var": "txtUserName", "text": "凹凸曼", "overflow": "hidden", "height": 36, "fontSize": 36, "font": "SimHei", "color": "#fdc001", "anchorY": 0.5 }, "compId": 109 }] }, { "type": "Sprite", "props": { "y": 0, "x": 0, "width": 800, "var": "spMask", "renderType": "mask", "height": 70 }, "compId": 119, "child": [{ "type": "Rect", "props": { "y": 0, "x": 0, "width": 800, "height": 70, "fillColor": "#000000" }, "compId": 120 }] }], "loadList": ["mining/img_notice_circle.png"], "loadList3D": [] };
            min.MinNoticeUI = MinNoticeUI;
            REG("ui.min.MinNoticeUI", MinNoticeUI);
            class MinProgressBarUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MinProgressBarUI.uiView);
                }
            }
            MinProgressBarUI.uiView = { "type": "Scene", "props": { "width": 90, "height": 569 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 66, "x": 14, "width": 62, "var": "scroll_d", "skin": "mining/img_scroll_d.png", "height": 436 }, "compId": 3, "child": [{ "type": "Image", "props": { "y": 22, "x": 17, "width": 28, "var": "scroll_t", "skin": "mining/img_scroll_g.png", "height": 392 }, "compId": 4 }] }, { "type": "Label", "props": { "y": 52, "x": 31, "text": "HP", "fontSize": 20, "color": "#FFC921" }, "compId": 7 }, { "type": "Label", "props": { "x": 4, "width": 82, "var": "value", "valign": "middle", "height": 30, "fontSize": 20, "color": "#FFC921", "bottom": 38, "align": "center" }, "compId": 8 }, { "type": "Image", "props": { "y": 650, "x": 34.3916015625, "skin": "mining/vscroll.png", "height": 0 }, "compId": 12 }], "loadList": ["mining/img_scroll_d.png", "mining/img_scroll_g.png", "mining/vscroll.png"], "loadList3D": [] };
            min.MinProgressBarUI = MinProgressBarUI;
            REG("ui.min.MinProgressBarUI", MinProgressBarUI);
            class MinRankUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MinRankUI.uiView);
                }
            }
            MinRankUI.uiView = { "type": "Scene", "props": { "width": 750, "positionVariance_0": 100, "maxPartices": 100, "height": 1624 }, "compId": 1, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "var": "imgBg", "name": "imgBg" }, "compId": 71 }, { "type": "Button", "props": { "y": 1250, "x": 375, "var": "btnClose", "stateNum": 1, "skin": "mining/btn_close.png", "name": "btnClose", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 102 }, { "type": "Image", "props": { "y": 448, "x": 102, "width": 548, "var": "lstBg", "skin": "mining/img_bg_30_4.png", "height": 708, "sizeGrid": "30,30,30,30" }, "compId": 43 }, { "type": "Button", "props": { "y": 380, "x": 138, "stateNum": 1, "skin": "mining/btn_menu1_sel.png" }, "compId": 39 }, { "type": "Button", "props": { "y": 380, "x": 306, "stateNum": 1, "skin": "mining/btn_menu2_sel.png" }, "compId": 40 }, { "type": "Button", "props": { "y": 380, "x": 474, "stateNum": 1, "skin": "mining/btn_menu3_sel.png" }, "compId": 41 }, { "type": "Button", "props": { "y": 414, "x": 544, "var": "btn_menu3", "stateNum": 1, "skin": "mining/btn_menu3.png", "name": "btn_menu3", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 46 }, { "type": "Button", "props": { "y": 414, "x": 376, "var": "btn_menu2", "stateNum": 1, "skin": "mining/btn_menu2.png", "name": "btn_menu2", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 45 }, { "type": "Button", "props": { "y": 414, "x": 208, "var": "btn_menu1", "stateNum": 1, "skin": "mining/btn_menu1.png", "name": "btn_menu1", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 44 }, { "type": "List", "props": { "y": 468, "x": 119, "width": 516, "var": "lst", "spaceY": 10, "repeatX": 1, "name": "lst", "height": 592, "elasticEnabled": true }, "compId": 50, "child": [{ "type": "ItemMinRank", "props": { "name": "render", "runtime": "ui.min.ItemMinRankUI" }, "compId": 96 }] }, { "type": "Image", "props": { "y": 1052, "x": 102, "width": 548, "skin": "mining/img_bg_30_2.png", "height": 104, "sizeGrid": "30,30,30,30" }, "compId": 103 }, { "type": "Image", "props": { "y": 1068, "x": 142, "width": 72, "var": "imgHead", "height": 72 }, "compId": 97, "child": [{ "type": "Sprite", "props": { "renderType": "mask" }, "compId": 104, "child": [{ "type": "Circle", "props": { "y": 36, "x": 36, "radius": 36, "fillColor": "#ff0000" }, "compId": 105 }] }] }, { "type": "Label", "props": { "y": 1448, "x": 126, "width": 65, "var": "txtRank", "valign": "middle", "text": "未上榜", "name": "txtRank", "height": 42, "fontSize": 30, "color": "#000000", "align": "center" }, "compId": 98 }, { "type": "Label", "props": { "y": 1107, "x": 226, "width": 136, "var": "txtName", "valign": "middle", "text": "奥里给", "name": "txtName", "height": 42, "fontSize": 28, "color": "#ffffff", "anchorY": 0.5, "align": "left" }, "compId": 99 }, { "type": "Label", "props": { "y": 1113, "x": 620, "var": "txtGold", "valign": "top", "text": "99999", "name": "txtGold", "italic": true, "height": 38, "fontSize": 36, "color": "#ffa820", "bold": true, "anchorY": 0.5, "anchorX": 1, "align": "right" }, "compId": 100 }, { "type": "Image", "props": { "y": 1108, "x": 512, "var": "imgGold", "skin": "game/img_gold.png", "anchorY": 0.5, "anchorX": 1 }, "compId": 101 }], "loadList": ["bg_min_rank.png", "mining/btn_close.png", "mining/img_bg_30_4.png", "mining/btn_menu1_sel.png", "mining/btn_menu2_sel.png", "mining/btn_menu3_sel.png", "mining/btn_menu3.png", "mining/btn_menu2.png", "mining/btn_menu1.png", "mining/img_bg_30_2.png", "game/img_gold.png"], "loadList3D": [] };
            min.MinRankUI = MinRankUI;
            REG("ui.min.MinRankUI", MinRankUI);
            class MinRecordUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MinRecordUI.uiView);
                }
            }
            MinRecordUI.uiView = { "type": "Scene", "props": { "width": 750, "positionVariance_0": 100, "maxPartices": 100, "height": 1624 }, "compId": 1, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "var": "imgBg" }, "compId": 118 }, { "type": "Sprite", "props": { "y": 0, "x": 0, "width": 750, "var": "spClose", "height": 1624 }, "compId": 119, "child": [{ "type": "Rect", "props": { "width": 750, "lineWidth": 1, "height": 1624, "fillColor": "#000000" }, "compId": 120 }] }, { "type": "Sprite", "props": { "y": 515, "x": 28, "width": 694, "visible": true, "var": "spExchange", "height": 260 }, "compId": 110, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 694, "var": "imgExchangeBg", "skin": "mining/img_bg_60_4.png", "height": 260, "sizeGrid": "60,60,60,60" }, "compId": 111 }, { "type": "Label", "props": { "y": 32, "x": 24, "text": "实物奖励兑换有效期为30天，过期后将不可兑换", "fontSize": 24, "font": "SimHei", "color": "#ff9a09" }, "compId": 112 }, { "type": "List", "props": { "y": 86, "x": 24, "width": 646, "var": "lstExchange", "spaceY": 20, "repeatX": 1, "name": "lstExchange", "height": 140 }, "compId": 108, "child": [{ "type": "ItemMinExchange", "props": { "name": "render", "runtime": "ui.min.ItemMinExchangeUI" }, "compId": 109 }] }] }, { "type": "Sprite", "props": { "y": 816, "x": 28, "width": 694, "visible": true, "var": "spRecord", "height": 808 }, "compId": 113, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 694, "var": "maskRecord", "skin": "mining/img_bg_60_5.png", "renderType": "mask", "height": 808, "sizeGrid": "60,60,60,60" }, "compId": 128 }, { "type": "Image", "props": { "y": 0, "x": 0, "width": 694, "var": "imgRecordBg", "skin": "mining/img_bg_60_5.png", "height": 808, "sizeGrid": "60,60,60,60" }, "compId": 114 }, { "type": "List", "props": { "y": 4, "x": 0, "width": 694, "visible": true, "var": "lst", "spaceY": 10, "repeatX": 1, "name": "lst", "height": 808, "elasticEnabled": true }, "compId": 50, "child": [{ "type": "ItemMinRecord", "props": { "x": 36, "name": "render", "runtime": "ui.min.ItemMinRecordUI" }, "compId": 106 }] }] }, { "type": "Image", "props": { "y": 1200, "x": 375, "var": "imgNoRecord", "skin": "mining/img_record_no.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 129 }], "loadList": ["bg_min_record.png", "mining/img_bg_60_4.png", "mining/img_bg_60_5.png", "mining/img_record_no.png"], "loadList3D": [] };
            min.MinRecordUI = MinRecordUI;
            REG("ui.min.MinRecordUI", MinRecordUI);
            class MinTipInfoUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MinTipInfoUI.uiView);
                }
            }
            MinTipInfoUI.uiView = { "type": "Scene", "props": { "width": 750, "height": 1624 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": -92, "width": 933, "skin": "mining/mohu2.jpg", "name": "bg", "height": 1624 }, "compId": 4 }, { "type": "Panel", "props": { "y": 571, "x": 195, "width": 358, "height": 296 }, "compId": 9, "child": [{ "type": "Image", "props": { "y": 148, "x": 179, "var": "icon", "skin": "mining/img_xuezi.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 6 }] }, { "type": "Image", "props": { "y": 358, "x": 224, "skin": "mining/img_bzt.png" }, "compId": 5 }, { "type": "Image", "props": { "y": 740, "x": 14, "skin": "mining/img_bz.png" }, "compId": 7 }, { "type": "Button", "props": { "y": 1351, "x": 118, "width": 514, "var": "btn_kx", "stateNum": 1, "skin": "mining/btn_kx.png", "height": 80 }, "compId": 8 }], "loadList": ["mining/mohu2.jpg", "mining/img_xuezi.png", "mining/img_bzt.png", "mining/img_bz.png", "mining/btn_kx.png"], "loadList3D": [] };
            min.MinTipInfoUI = MinTipInfoUI;
            REG("ui.min.MinTipInfoUI", MinTipInfoUI);
        })(min = ui.min || (ui.min = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var user;
        (function (user) {
            class ItemBagUI extends View {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ItemBagUI.uiView);
                }
            }
            ItemBagUI.uiView = { "type": "View", "props": { "width": 210, "height": 210 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "skin": "user/img_item_bg.png" }, "compId": 3 }, { "type": "Image", "props": { "y": 87, "x": 105, "width": 180, "var": "imgIcon", "height": 160, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4 }, { "type": "Label", "props": { "y": 167, "x": 24, "width": 162, "var": "txtName", "valign": "middle", "text": "潮玩", "height": 42, "fontSize": 30, "color": "#44ACAD", "align": "center" }, "compId": 5 }], "loadList": ["user/img_item_bg.png"], "loadList3D": [] };
            user.ItemBagUI = ItemBagUI;
            REG("ui.user.ItemBagUI", ItemBagUI);
            class ItemEqiupUI extends View {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ItemEqiupUI.uiView);
                }
            }
            ItemEqiupUI.uiView = { "type": "View", "props": { "width": 180, "height": 180 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 180, "skin": "user/img_item_bg.png", "height": 180 }, "compId": 3 }, { "type": "Image", "props": { "y": 80, "x": 90, "width": 170, "var": "imgIcon", "scaleY": 0.85, "scaleX": 0.85, "height": 155, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4 }, { "type": "Label", "props": { "y": 140, "x": 90, "width": 162, "var": "txtName", "valign": "middle", "text": "潮玩", "height": 36, "fontSize": 28, "color": "#44ACAD", "anchorX": 0.5, "align": "center" }, "compId": 5 }], "loadList": ["user/img_item_bg.png"], "loadList3D": [] };
            user.ItemEqiupUI = ItemEqiupUI;
            REG("ui.user.ItemEqiupUI", ItemEqiupUI);
            class UserUI extends Scene {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren();
                    this.createView(UserUI.uiView);
                }
            }
            UserUI.uiView = { "type": "Scene", "props": { "width": 1125, "runtime": "script/GameUI.ts", "positionVariance_0": 100, "name": "render", "maxPartices": 100, "height": 2436 }, "compId": 1, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "var": "imgBg", "name": "imgBg" }, "compId": 71 }, { "type": "Button", "props": { "y": 1404, "x": 168, "var": "btnClear", "stateNum": 1, "skin": "user/btn_clear.png", "name": "btnClear", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 54 }, { "type": "Button", "props": { "y": 1345, "x": 730, "stateNum": 1, "skin": "user/btn_saved.png" }, "compId": 79 }, { "type": "Button", "props": { "y": 1405, "x": 901, "var": "btnSave", "stateNum": 1, "skin": "user/btn_save.png", "name": "btnSave", "labelFont": "SimSun", "labelColors": "#ffffff", "labelBold": true, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 56 }, { "type": "Sprite", "props": { "y": 440, "x": 48, "var": "spEquip", "name": "spEquip" }, "compId": 72, "child": [{ "type": "Image", "props": { "width": 240, "skin": "user/img_bg_30.png", "height": 816, "sizeGrid": "30,30,30,30" }, "compId": 73 }, { "type": "Image", "props": { "y": 4, "x": 792, "width": 237, "skin": "user/img_bg_30.png", "height": 222, "sizeGrid": "30,30,30,30" }, "compId": 85 }, { "type": "ItemEqiup", "props": { "y": 15, "x": 120, "var": "itemEquip1", "pivotX": 90, "name": "itemEquip1", "runtime": "ui.user.ItemEqiupUI" }, "compId": 81 }, { "type": "ItemEqiup", "props": { "y": 216, "x": 120, "var": "itemEquip2", "pivotX": 90, "name": "itemEquip2", "runtime": "ui.user.ItemEqiupUI" }, "compId": 82 }, { "type": "ItemEqiup", "props": { "y": 418, "x": 120, "var": "itemEquip3", "pivotX": 90, "name": "itemEquip3", "runtime": "ui.user.ItemEqiupUI" }, "compId": 83 }, { "type": "ItemEqiup", "props": { "y": 25, "x": 913, "var": "itemEquip5", "pivotX": 90, "name": "itemEquip5", "runtime": "ui.user.ItemEqiupUI" }, "compId": 86 }, { "type": "ItemEqiup", "props": { "y": 619, "x": 121, "var": "itemEquip4", "pivotX": 90, "name": "itemEquip4", "runtime": "ui.user.ItemEqiupUI" }, "compId": 84 }] }, { "type": "Sprite", "props": { "y": 0, "x": 0, "var": "spTip", "name": "spTip" }, "compId": 88, "child": [{ "type": "Image", "props": { "y": 765, "x": 693, "width": 384, "skin": "user/img_bg_30.png", "height": 495, "sizeGrid": "30,30,30,30" }, "compId": 87 }, { "type": "Label", "props": { "y": 801, "x": 729, "wordWrap": true, "width": 315, "var": "txtName", "valign": "top", "text": "凸物潮宠凸物潮宠凸", "name": "txtName", "leading": 10, "height": 102, "fontSize": 36, "font": "SimHei", "color": "#000000", "align": "left" }, "compId": 93 }, { "type": "Label", "props": { "y": 918, "x": 729, "wordWrap": true, "width": 315, "var": "txtDesc", "valign": "top", "text": "凸物潮宠凸物潮宠凸物潮宠凸物潮宠凸物潮宠凸物潮宠凸物潮宠凸物潮宠凸物潮宠", "overflow": "hidden", "name": "txtDesc", "leading": 10, "height": 216, "fontSize": 30, "font": "SimHei", "color": "#617d91", "align": "left" }, "compId": 91 }, { "type": "Button", "props": { "y": 1182, "x": 762, "var": "btnShop", "stateNum": 1, "skin": "user/btn_shop.png", "name": "btnShop" }, "compId": 89 }] }, { "type": "Sprite", "props": { "y": 456, "x": 273, "width": 560, "var": "spRotate", "name": "spRotate", "height": 800 }, "compId": 94 }, { "type": "Sprite", "props": { "y": 1530, "x": 48, "var": "spMenu", "name": "spMenu" }, "compId": 70, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "width": 1029, "skin": "user/img_bg_69.png", "height": 768, "sizeGrid": "69,69,69,69" }, "compId": 43 }, { "type": "Image", "props": { "y": 57, "x": 123, "var": "imgMenuSel", "skin": "user/img_menu_bg.png", "name": "imgMenuSel", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 77 }, { "type": "Button", "props": { "y": 22, "x": 87, "stateNum": 1, "skin": "user/btn_menu0_sel.png" }, "compId": 38 }, { "type": "Button", "props": { "y": 33, "x": 312, "stateNum": 1, "skin": "user/btn_menu1_sel.png" }, "compId": 39 }, { "type": "Button", "props": { "y": 27, "x": 549, "stateNum": 1, "skin": "user/btn_menu2_sel.png" }, "compId": 40 }, { "type": "Button", "props": { "y": 36, "x": 780, "stateNum": 1, "skin": "user/btn_menu3_sel.png" }, "compId": 41 }, { "type": "Button", "props": { "y": 57, "x": 123, "var": "btn_menu0", "stateNum": 1, "skin": "user/btn_menu0.png", "name": "btn_menu0", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 42 }, { "type": "Button", "props": { "y": 58, "x": 345, "var": "btn_menu1", "stateNum": 1, "skin": "user/btn_menu1.png", "name": "btn_menu1", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 44 }, { "type": "Button", "props": { "y": 57, "x": 573, "var": "btn_menu2", "stateNum": 1, "skin": "user/btn_menu2.png", "name": "btn_menu2", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 45 }, { "type": "Button", "props": { "y": 60, "x": 810, "var": "btn_menu3", "stateNum": 1, "skin": "user/btn_menu3.png", "name": "btn_menu3", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 46 }] }, { "type": "List", "props": { "y": 1701, "x": 105, "width": 912, "var": "lstBag", "spaceY": 24, "spaceX": 24, "repeatX": 4, "name": "lstBag", "height": 590, "elasticEnabled": true }, "compId": 50, "child": [{ "type": "ItemBag", "props": { "renderType": "render", "name": "render", "runtime": "ui.user.ItemBagUI" }, "compId": 76 }] }, { "type": "Image", "props": { "y": 338, "x": 393, "var": "imgBase64" }, "compId": 100 }, { "type": "Image", "props": { "y": 1375, "x": 349, "var": "imgBox", "skin": "user/img_box.png" }, "compId": 102 }], "loadList": ["bg_main.jpg", "user/btn_clear.png", "user/btn_saved.png", "user/btn_save.png", "user/img_bg_30.png", "user/btn_shop.png", "user/img_bg_69.png", "user/img_menu_bg.png", "user/btn_menu0_sel.png", "user/btn_menu1_sel.png", "user/btn_menu2_sel.png", "user/btn_menu3_sel.png", "user/btn_menu0.png", "user/btn_menu1.png", "user/btn_menu2.png", "user/btn_menu3.png", "user/img_box.png"], "loadList3D": [] };
            user.UserUI = UserUI;
            REG("ui.user.UserUI", UserUI);
        })(user = ui.user || (ui.user = {}));
    })(ui || (ui = {}));

    class MsgCtrl {
        constructor() {
            this.title = "";
            this.desc = "";
            this.callBack = null;
            this.callBackData = null;
            if (MsgCtrl._ins != null)
                throw new Error("MsgCtrl is single!");
            this.ui = new ui.MsgUI();
            LayerManager.ins.addChild(this.ui, LayerName.top);
            this.ui.visible = false;
            this.ui.spBg.graphics.clear();
            let x = (Define.DeviceW - Define.canvasWidth) >> 1;
            this.ui.spBg.graphics.drawRect(x, 0, Define.canvasWidth, Define.DeviceH, "#000000");
        }
        static get ins() {
            if (!this._ins)
                MsgCtrl._ins = new MsgCtrl();
            return this._ins;
        }
        init() {
            this.ui.btnConfirm.on(Laya.Event.CLICK, this, this.confirm);
        }
        showMsg(desc, btnWord = "确定", callBack = null, callBackData = null) {
            this.desc = desc;
            this.callBack = callBack;
            this.callBackData = callBackData;
            this.ui.btnConfirm.label = btnWord;
            this.ui.txtDesc.text = desc;
            this.ui.visible = true;
        }
        confirm() {
            if (this.callBack) {
                this.callBack(this.callBackData);
                this.callBackData = null;
                this.callBack = null;
            }
            this.ui.visible = false;
        }
    }

    var PETBEHAVIOURTYPE;
    (function (PETBEHAVIOURTYPE) {
        PETBEHAVIOURTYPE["mining"] = "wakuang";
        PETBEHAVIOURTYPE["huxi"] = "huxi";
        PETBEHAVIOURTYPE["shibai"] = "shibai";
        PETBEHAVIOURTYPE["chenggong"] = "chenggong";
        PETBEHAVIOURTYPE["goodCG"] = "goodCG";
    })(PETBEHAVIOURTYPE || (PETBEHAVIOURTYPE = {}));
    class BehaviourMgr {
        constructor() {
            this.curBehaviourType = null;
        }
        setBehaviour(t) {
            this.curBehaviourType = t;
            EventManager.ins.event(CustomDefine.EVENT_BEHAVIOUR, t);
        }
        clearBehaviour() {
            this.curBehaviourType = null;
        }
        getBehaviour() {
            return this.curBehaviourType;
        }
    }

    class basePet {
        constructor() {
            this.labour = 0;
        }
        onDestroy() { }
    }

    const TIMEOFFSET = 0.1;
    class PetAniMgr {
        constructor() {
            this.curAniName = null;
        }
        static get ins() {
            if (!this._ins)
                PetAniMgr._ins = new PetAniMgr();
            return this._ins;
        }
        play(ani, aniName, isAlways = true, callBack) {
            this.curAni = ani;
            this.curAniName = aniName;
            this.isAlways = isAlways;
            this.callBack = callBack;
            this.curAni.speed = 1;
            this.curAni.play(aniName, 0, 0);
            let onceAni = false;
            if (isAlways)
                return;
            Laya.timer.clear(this, this.playTime);
            Laya.timer.frameLoop(1, this, this.playTime);
        }
        playTime() {
            if (this.curAni.getControllerLayer().getCurrentPlayState().normalizedTime > 0.98) {
                this.stop();
            }
        }
        stop() {
            Laya.timer.clear(this, this.playTime);
            if (this.callBack) {
                this.callBack.run();
            }
        }
    }

    var LOCKSTORAGEKEY;
    (function (LOCKSTORAGEKEY) {
        LOCKSTORAGEKEY["haveGold"] = "haveGold";
        LOCKSTORAGEKEY["haveTreasure"] = "haveTreasure";
    })(LOCKSTORAGEKEY || (LOCKSTORAGEKEY = {}));
    class LocalStorage {
        constructor() {
        }
        static setItem(name, str) {
            Laya.LocalStorage.setItem(name, str);
        }
        static setJSON(name, param) {
            let _JSON = JSON.stringify(param);
            Laya.LocalStorage.setItem(name, _JSON);
        }
        static getItem(name) {
            return Laya.LocalStorage.getItem(name);
        }
        static getJSON(name) {
            let strJSON = Laya.LocalStorage.getJSON(name);
            return JSON.parse(strJSON);
        }
        static clearItem(name) {
            Laya.LocalStorage.removeItem(name);
        }
        static clearAll() {
            Laya.LocalStorage.clear();
        }
    }

    class MinData {
        constructor() {
            this.labour = 23;
            this.zMinCion = 0;
            this.sMinCion = 0;
            this.advert = "mining/bg.jpg";
            this.nTime = 0;
            this.nExpended = 0;
            this.nState = 0;
            this.nReward = 0;
            this.oTreasure_infos = [];
            this.ownTreasure_infos = [];
            this.frequency = 0;
            this.remaining_power = 0;
            this.minCrowd = {
                crowdsIcon: [],
                crowdsCount: 320
            };
            this.vipLv = 3;
        }
        static get ins() {
            if (!this._ins)
                MinData._ins = new MinData();
            return this._ins;
        }
        getData() {
        }
        upDate(e) {
            if (Object.keys(e.data).length <= 0)
                return;
            this.setzMinCion(e.data.total_coin);
            this.setsMinCion(e.data.balance);
            this.setLabour(e.data.total_power);
            this.setnTime(e.data.duration);
            this.setnExpended(e.data.expended);
            this.setRemainingPower(e.data.remaining_power);
            this.setnState(e.data.status);
            this.setMinCrowd({ crowdsIcon: e.data.users, crowdsCount: e.data.user_count });
            this.setnReward(e.data.reward);
            this.setoTreasure_infos(e.data.treasure_infos);
            this.setownTreasure_infos(e.data.treasure_infos);
            this.setFrequency(e.data.frequency);
        }
        clearData() {
            this.setzMinCion(0);
            this.setsMinCion(0);
            this.setLabour(0);
            this.setnTime(0);
            this.setnExpended(0);
            this.setRemainingPower(0);
            this.setnState(-999);
            this.setMinCrowd({});
            this.setnReward(0);
            this.setoTreasure_infos({});
            this.setownTreasure_infos([]);
            this.setFrequency(0);
        }
        setownTreasure_infos(arr) {
            this.ownTreasure_infos = [];
            if (!arr || arr.length <= 0)
                return;
            arr.forEach(element => {
                if (element.user_id == HttpManager.ins.uid) {
                    this.ownTreasure_infos.push(element);
                }
            });
        }
        setRemainingPower(n) {
            this.remaining_power = n;
        }
        getRemainingPower() {
            return this.remaining_power;
        }
        setFrequency(n) {
            this.frequency = n;
        }
        getFrequency() {
            return this.frequency;
        }
        getownTreasure_infos() {
            return this.ownTreasure_infos;
        }
        setoTreasure_infos(o) {
            this.oTreasure_infos = o;
        }
        getoTreasure_infos() {
            return this.oTreasure_infos;
        }
        setnReward(n) {
            this.nReward = n;
        }
        getnReward() {
            return this.nReward;
        }
        setnState(n) {
            this.nState = n;
        }
        getnState() {
            return this.nState;
        }
        setnExpended(n) {
            this.nExpended = n;
        }
        getnExpended() {
            return this.nExpended;
        }
        setnTime(n) {
            this.nTime = n;
        }
        getnTime() {
            return this.nTime;
        }
        setLabour(n) {
            this.labour = n;
        }
        getLabour() {
            return this.labour;
        }
        setzMinCion(n) {
            this.zMinCion = n;
        }
        getzMinCion() {
            return this.zMinCion;
        }
        setsMinCion(n) {
            this.sMinCion = n;
        }
        getsMinCion() {
            return this.sMinCion;
        }
        setAdvert(address) {
            this.advert = address;
        }
        getAdvert() {
            return this.advert;
        }
        setMinCrowd(obj) {
            this.minCrowd = obj;
        }
        getMinCrowd() {
            return this.minCrowd;
        }
        setVipLv(n) {
            this.vipLv = n;
        }
        getVipLv() {
            return this.vipLv;
        }
    }

    const CROWDSICONNUMBE = 3;
    class MinCtrl {
        constructor() {
            this.nextGetTreasure = null;
            this.arrCrowdsIcon = [];
            this.TILITIPTEXT = "您的体力耗空了，明日再来哦~";
            this.minData = MinData.ins;
            Laya.stage.on(Laya.Event.KEY_UP, this, this._onKeyDown);
        }
        static get ins() {
            if (!this._ins)
                MinCtrl._ins = new MinCtrl();
            return this._ins;
        }
        Init() {
            this.InitLabour();
        }
        onBack() {
        }
        openBag() {
        }
        startMining() {
            if (MinScene.ins.isSendError) {
                return;
            }
            if (this.minData.getnState() == 3) {
                UIManager.ins.closeWindow(CustomWindow.minRank);
                UIManager.ins.closeWindow(CustomWindow.minRecord);
                let _text = this.view.ui.tip2.getChildByName("content").text;
                if (_text == this.TILITIPTEXT)
                    return;
                EventManager.ins.event(CustomDefine.EVENT_CLOSELED);
                this.view.ui.tip2.visible = true;
                this.view.ui.tip2.getChildByName("content").text = this.TILITIPTEXT;
                return;
            }
            else if (this.minData.getnState() == 2 || this.minData.getnState() == 4 || this.minData.getnState() == 0) {
                UIManager.ins.closeWindow(CustomWindow.minRank);
                UIManager.ins.closeWindow(CustomWindow.minRecord);
                if (this.view.bagContentChild) {
                    this.view.curSelectGood.getChildByName("img_jb").visible = false;
                    this.view.bagContentChild.removeSelf();
                    this.view.bagContentChild.destroy();
                }
                EventManager.ins.event(CustomDefine.EVENT_CLOSELED);
                this.view.ui.tip2.visible = true;
                this.view.ui.tip2.getChildByName("content").text = "当前矿洞资源正在重生，更大宝藏等你发掘，明日请早哦！";
                return;
            }
            else if (this.minData.getnState() == 5) {
                this.onMinMaintain();
                return;
            }
            this.onMinRequest(MinScene.ins.curPetIns.speed * 1000);
            MinScene.ins.curPetIns.setBehaviourState(PETBEHAVIOURTYPE.mining);
        }
        onMinMaintain() {
            AppCtrl.ins.loadMaintain();
        }
        onExecRequsetInErr(n) {
            this.onMinRequest(n);
        }
        selectHoe() {
            if (MinScene.ins.curToolType == TYPETOOL.lv_1) {
                EventManager.ins.event(CustomDefine.EVENT_CHANGETOOL, { typeTool: TYPETOOL.lv_0 });
            }
            else {
                EventManager.ins.event(CustomDefine.EVENT_CHANGETOOL, { typeTool: TYPETOOL.lv_1 });
            }
        }
        InitLabour() {
        }
        setCrowdsInfo() {
            let nCount = this.minData.getMinCrowd().crowdsCount ? this.minData.getMinCrowd().crowdsCount : 0;
            let arrCrowds = this.minData.getMinCrowd().crowdsIcon ? this.minData.getMinCrowd().crowdsIcon : [];
            this.view.ui.crowdsCount.text = nCount.toString() + "人";
            this.setCrowdsIcon(arrCrowds);
        }
        upDate() {
            HttpManager.ins.sendMsg(HttpName.MININFO, null, HttpMethod.GET, this.onComplete);
        }
        upDateStorage() {
            let money = parseFloat(LocalStorage.getItem(LOCKSTORAGEKEY.haveGold));
            if (Number.isNaN(money)) {
                money = 0;
            }
            let strNumber = parseFloat(this.minData.getnReward().toString());
            let _m = Math.floor(strNumber * 100) / 100;
            LocalStorage.setItem(LOCKSTORAGEKEY.haveGold, _m.toString());
            let strTreasure = LocalStorage.getJSON(LOCKSTORAGEKEY.haveTreasure);
            let _json = {};
            if (strTreasure) {
                _json = strTreasure;
            }
            let ownTreasure_infos = this.minData.getownTreasure_infos();
            ownTreasure_infos.forEach(element => {
                if (element.user_id == HttpManager.ins.uid) {
                    _json[element.id] = true;
                    console.log("发现获取了宝藏id" + element.id);
                }
            });
            let strJSON = JSON.stringify(_json);
            LocalStorage.setJSON(LOCKSTORAGEKEY.haveTreasure, strJSON);
        }
        onMinRequest(time) {
            Laya.timer.once(time, this, () => {
                HttpManager.ins.sendMsg(HttpName.MINBEHAVIOUR, null, HttpMethod.POST, this.onComplete);
            });
        }
        onComplete(msg, method, e) {
            if (e.code == -1) {
                console.error("服务器返回:", e.msg);
                return;
            }
            MinScene.ins.isSendError = false;
            switch (msg) {
                case HttpName.MININFO:
                    break;
                case HttpName.MINBEHAVIOUR:
                    break;
                default:
                    break;
            }
            if (e.data.status == 0 || e.data.status == 2 || e.data.status == 4) {
                MinData.ins.upDate(e);
                MinCtrl.ins.minResult(e);
                return;
            }
            else if (e.data.status == 5) {
                MinCtrl.ins.onMinMaintain();
            }
            MinData.ins.upDate(e);
            MinCtrl.ins.setViewInfo();
            MinCtrl.ins.minResult(e);
            EventManager.ins.event(CustomDefine.EVENT_UPDATENOTICE);
        }
        minResult(e) {
            let _result = PETBEHAVIOURTYPE.huxi;
            let money = parseFloat(LocalStorage.getItem(LOCKSTORAGEKEY.haveGold));
            if (Number.isNaN(money)) {
                money = 0;
            }
            if (MinCtrl.ins.isNewTreasure()) {
                console.log("本地没有该宝藏，=================承认获取");
                _result = PETBEHAVIOURTYPE.goodCG;
            }
            else if (MinData.ins.getnReward() > money) {
                _result = PETBEHAVIOURTYPE.chenggong;
            }
            else {
                _result = PETBEHAVIOURTYPE.shibai;
            }
            if (e.data.status == 3) {
                this.onExecRequsetInErr(5000);
                if (MinScene.ins.curPetIns) {
                    MinScene.ins.curPetIns.setBehaviourState(PETBEHAVIOURTYPE.huxi);
                }
                return;
            }
            else if (e.data.status == 5) {
                MinCtrl.ins.onMinMaintain();
            }
            if (MinScene.ins.curPetIns) {
                MinScene.ins.curPetIns.stopPlayAni();
                MinScene.ins.curPetIns.setBehaviourState(_result);
            }
        }
        setViewInfo() {
            this.setMinCion();
            this.setLabour();
            this.setCrowdsInfo();
            this.bagList();
        }
        bagList() {
            this.view.ui.list_bag.array = this.ExtendGetOwnTreasureInfos();
        }
        ExtendGetOwnTreasureInfos() {
            let arr = [];
            this.minData.getownTreasure_infos().forEach(element => {
                arr.push(element);
            });
            let money = parseFloat(LocalStorage.getItem(LOCKSTORAGEKEY.haveGold));
            if (Number.isNaN(money)) {
                money = 0;
            }
            arr.unshift({ avatar: "game/img_gold.png", desc: money + "" });
            while (arr.length < 5) {
                arr.push({});
            }
            return arr;
        }
        setMinCion() {
            let html = "<p><span style='color:#FDC001'>今日矿币总量<span>&nbsp;</span></span><span>" + this.minData.getzMinCion() + " / " + this.minData.getsMinCion() + "</span></p>";
            if (!this.view.ui.minNumber.style)
                return;
            this.view.ui.minNumber.style.fontSize = 20;
            this.view.ui.minNumber.style.color = "#fff";
            this.view.ui.minNumber.style.wordWrap = false;
            this.view.ui.minNumber.innerHTML = html;
        }
        refreshList() {
            this.view.itemTreasuryScene.refresh(this.minData.getoTreasure_infos());
        }
        setCrowdsIcon(arr) {
            if (!arr || arr.length < 1)
                return;
            if (this.arrCrowdsIcon.length != arr.length) {
                this.view.ui.img_bg_crowd.removeChildren(2, this.view.ui.img_bg_crowd.numChildren);
                this.arrCrowdsIcon = [];
            }
            else {
                return;
            }
            let _img = this.view.ui.img_bg_crowd.getChildByName("img_crowdIcon");
            for (let index = 0; index < arr.length; index++) {
                const ele = arr[index];
                let rAvatar = GameCtrl.ins.onCompressImg(ele.avatar, _img.width);
                let img = new Laya.Image(rAvatar);
                if (this.arrCrowdsIcon.indexOf(ele.id) == -1 || this.arrCrowdsIcon.length < CROWDSICONNUMBE) {
                    this.arrCrowdsIcon.push(ele.id);
                }
                else {
                    continue;
                }
                img.width = _img.width;
                img.height = _img.height;
                img.x = (img.width * index) + (13 * index);
                img.y = -1;
                let img_bg = new Laya.Image("mining/img_icon_yuan.png");
                img_bg.width = 63;
                img_bg.height = 63;
                img_bg.x = -1.5;
                img_bg.y = -1;
                img.addChild(img_bg);
                this.view.ui.img_bg_crowd.addChild(img);
                let _sp = new Laya.Sprite();
                _sp.graphics.drawCircle(29.5, 29.5, 29.5, "#00ffff");
                img.mask = _sp;
            }
        }
        setLabour() {
            let n = this.minData.getRemainingPower() / this.minData.getLabour();
            let nLabour = Math.floor(n * 100) / 100;
            if (isNaN(nLabour)) {
                nLabour = 0;
            }
            this.view.proBar.onChangeStrength(nLabour);
            if (MinScene.ins.curPetIns) {
                MinScene.ins.curPetIns.setSpeed(nLabour * 100);
            }
        }
        TweenToBag() {
            Laya.Tween.clearAll(this);
            Laya.Tween.to(this.view.ui.kuangbao, {
                scaleX: 1.2,
                scaleY: 1.2,
            }, 600, null, Laya.Handler.create(this, this.onTweenToBagComplete));
        }
        onTweenToBagComplete() {
            Laya.Tween.to(this.view.ui.kuangbao, {
                scaleX: 1,
                scaleY: 1,
            }, 500, null);
        }
        isNewTreasure() {
            this.nextGetTreasure = null;
            let strTreasure = LocalStorage.getJSON(LOCKSTORAGEKEY.haveTreasure);
            let _json = {};
            if (strTreasure) {
                _json = strTreasure;
            }
            let _is = false;
            MinData.ins.getownTreasure_infos().forEach((item, index) => {
                if (item.user_id == HttpManager.ins.uid) {
                    if (_json[item.id] != true) {
                        this.nextGetTreasure = item;
                    }
                }
            });
            this.upDateStorage();
            return this.nextGetTreasure;
        }
        _onKeyDown(e) {
            if (this.gmui && e.keyCode == 96) {
                LocalStorage.clearAll();
            }
        }
        backDoor() {
            EventManager.ins.event(CustomDefine.EVENT_CLOSELED);
            if (this.view.ui) {
                this.view.ui.tip2.visible = false;
            }
            if (this.minData.getnState() == 3) {
                EventManager.ins.event(CustomDefine.EVENT_OPENLED);
                return;
            }
            this.minData.clearData();
            MinScene.ins.onDestory();
            LoadingCtrl.ins.enterGame();
        }
        hideGoldUI() {
            if (!this.view || !this.view._goldsTop)
                return;
            this.view._goldsTop.visible = false;
        }
        showGoldUI() {
            if (!this.view || !this.view._goldsTop)
                return;
            this.view._goldsTop.visible = true;
        }
    }

    var Sprite3D = Laya.Sprite3D;
    class Pet extends basePet {
        constructor() {
            super();
            this.MANRES = Define.CDN + "3d/pet_0.lh";
            this.WOMANRES = Define.CDN + "3d/pet_1.lh";
            this.speed = 0;
            this.sleep = 0;
            this.arrSpeed = [8, 4, 2];
            this.sex = 0;
            this._enormalizedTime = 0;
            this.HUOHUAANIURl = "res/atlas/huhua.atlas";
            this.behaviour = new BehaviourMgr();
        }
        setSex(n) {
            this.sex = n;
        }
        onLoaded() {
            if (this.sex == 2) {
                this.oPet = Laya.loader.getRes(this.WOMANRES);
                this.body1Name = "woman_body_1";
            }
            else {
                this.oPet = Laya.loader.getRes(this.MANRES);
                this.body1Name = "man_body_1";
            }
            MinScene.ins.findChild(this.oPet, this.body1Name).active = false;
            MinScene.ins.scene.addChild(this.oPet);
            this._ani = this.oPet.getComponent(Laya.Animator);
            this.oPet.transform.position = new Laya.Vector3(0, -0.8, 0);
            MinCtrl.ins.startMining();
        }
        setSpeed(n) {
            if (n >= 50) {
                this.speed = this.arrSpeed[0];
                this.sleep = this.arrSpeed[2];
            }
            else if (n >= 20) {
                this.speed = this.arrSpeed[1];
                this.sleep = this.arrSpeed[1];
            }
            else {
                this.speed = this.arrSpeed[2];
                this.sleep = this.arrSpeed[1];
            }
        }
        setLabour(n) {
            this.labour = n;
        }
        setBehaviourState(state) {
            if (this.behaviour.curBehaviourType == state)
                return;
            this.behaviour.setBehaviour(state);
        }
        startMining() {
            this.startAni(PETBEHAVIOURTYPE.mining, true);
            this.playAni();
            this.playSoundState = false;
            Laya.timer.frameLoop(5, this, this.playSound);
        }
        playSound() {
            if (PetAniMgr.ins.curAni && PetAniMgr.ins.curAniName == PETBEHAVIOURTYPE.mining) {
                let normalizedTime = PetAniMgr.ins.curAni.getControllerLayer().getCurrentPlayState().normalizedTime;
                if ((normalizedTime - this._enormalizedTime) > 0.12 && !this.playSoundState) {
                    this.playSoundState = false;
                }
                if (!this.playSoundState) {
                    this.playSoundState = true;
                    AppCtrl.ins.isMiningPage();
                    let _s = new Base64Type("res/sound/mining.mp3", "mining");
                    SoundManager.ins.playSound(_s);
                }
                if ((normalizedTime - this._enormalizedTime) >= 1) {
                    this.playSoundState = false;
                    this._enormalizedTime = Number(normalizedTime.toFixed(0));
                    AppCtrl.ins.isMiningPage();
                    let _s = new Base64Type("res/sound/drop.mp3", "drop");
                    SoundManager.ins.playSound(_s);
                }
            }
            else {
                this._enormalizedTime = 0;
                Laya.timer.clear(this, this.playSound);
            }
        }
        startSb() {
            this.startAni(PETBEHAVIOURTYPE.shibai);
        }
        startCg() {
            this.startAni(PETBEHAVIOURTYPE.chenggong);
        }
        startHx() {
            this.startAni(PETBEHAVIOURTYPE.huxi, true);
            this.stopPlayAni();
        }
        startAni(name, isAlways = false) {
            this._ani.speed = 1;
            PetAniMgr.ins.play(this._ani, name, isAlways, Laya.Handler.create(this, this.aniFinishCallBack, [name]));
        }
        aniFinishCallBack(aniType) {
            switch (aniType) {
                case PETBEHAVIOURTYPE.mining:
                    break;
                case PETBEHAVIOURTYPE.shibai:
                    this.behaviour.setBehaviour(PETBEHAVIOURTYPE.huxi);
                    break;
                case PETBEHAVIOURTYPE.chenggong:
                    this.behaviour.setBehaviour(PETBEHAVIOURTYPE.huxi);
                    EventManager.ins.event(CustomDefine.EVENT_PETANIFINISHEVENT);
                    break;
                case PETBEHAVIOURTYPE.huxi:
                    console.error("————————————————————————————————当前是待机呼吸状态");
                    break;
                default:
                    break;
            }
        }
        changeHoe(hoeUrl) {
            let tool = Laya.loader.getRes(hoeUrl);
            let oldTool = MinScene.ins.findChild(this.oPet, "Object015");
            let point = MinScene.ins.findChild(this.oPet, "Tool");
            point.destroyChildren();
            if (oldTool) {
                oldTool.active = false;
            }
            let oTool = Sprite3D.instantiate(tool, point);
            oTool.transform.localPosition = point.transform.localPosition;
            oTool.transform.localRotation = point.transform.localRotation;
            oTool.transform.localScale = new Laya.Vector3(100, 100, 100);
        }
        changeTool(type) { }
        playAni() {
            this.huohua = new Laya.Animation();
            MinCtrl.ins.view.ui.bagContent.addChild(this.huohua);
            this.huohua.zOrder = -1;
            Laya.timer.once(500, this, () => {
                if (this.huohua) {
                    this.huohua.loadAtlas(this.HUOHUAANIURl, Laya.Handler.create(this, this.aniPlay));
                }
            });
        }
        aniPlay() {
            if (!this.huohua)
                return;
            this.huohua.pos(80, 700);
            this.huohua.play(0, true);
        }
        stopPlayAni() {
            if (!this.huohua)
                return;
            this.huohua.removeSelf();
            this.huohua.destroy();
            this.huohua = null;
        }
        onDestroy() {
            this.oPet.destroy();
        }
    }

    var NOTICETYPE;
    (function (NOTICETYPE) {
        NOTICETYPE[NOTICETYPE["default"] = -1] = "default";
        NOTICETYPE[NOTICETYPE["video"] = 1] = "video";
        NOTICETYPE[NOTICETYPE["text"] = 2] = "text";
        NOTICETYPE[NOTICETYPE["imageText"] = 3] = "imageText";
        NOTICETYPE[NOTICETYPE["image"] = 4] = "image";
        NOTICETYPE[NOTICETYPE["noticeContnet"] = 6] = "noticeContnet";
        NOTICETYPE[NOTICETYPE["goldContent"] = 5] = "goldContent";
    })(NOTICETYPE || (NOTICETYPE = {}));
    var RUNTYPE;
    (function (RUNTYPE) {
        RUNTYPE[RUNTYPE["fault"] = 1] = "fault";
        RUNTYPE[RUNTYPE["come"] = 2] = "come";
        RUNTYPE[RUNTYPE["right"] = 3] = "right";
        RUNTYPE[RUNTYPE["lower"] = 4] = "lower";
        RUNTYPE[RUNTYPE["gradually"] = 5] = "gradually";
        RUNTYPE[RUNTYPE["noticeRight"] = 6] = "noticeRight";
    })(RUNTYPE || (RUNTYPE = {}));
    var PLAYBEFOREANITYPE;
    (function (PLAYBEFOREANITYPE) {
        PLAYBEFOREANITYPE[PLAYBEFOREANITYPE["snowflake"] = 0] = "snowflake";
        PLAYBEFOREANITYPE[PLAYBEFOREANITYPE["caoxi"] = 1] = "caoxi";
    })(PLAYBEFOREANITYPE || (PLAYBEFOREANITYPE = {}));
    class BaseNotice {
        constructor() {
            this.type = null;
            this.runTime = 0;
            this.runType = null;
            this.stopTime = 0;
            this.playBeforeAniType = -1;
            this.temporary = false;
            this.initPos = { x: 0, y: 0 };
            this.endPos = { x: 0, y: 0 };
            this.stopPos = { x: 0, y: 0 };
            this.initWH = { W: 0, H: 0 };
            this.UI = null;
            this.initAlpha = 1;
        }
        onInto(data, parent, callback = null) {
            this.type = data.type;
            this.runType = data.runType;
            this.runTime = data.runTime;
            this.stopTime = data.stopTime;
            this.temporary = data.temporary ? data.temporary : false;
        }
        onStop() { }
        onStart() {
            PublicNoticeMgr.ins().behaviorTween(this);
            this.UI.visible = true;
        }
        reset() {
            if (!this.UI)
                return;
            this.UI.x = this.initPos.x;
            this.UI.y = this.initPos.y;
            this.UI.visible = false;
        }
        setInitAlpha(n) {
            this.UI.alpha = n;
            this.initAlpha = n;
        }
        onDestory() {
            if (!this.UI)
                return;
            this.UI.removeSelf();
        }
        setInitPos(x, y) {
            this.initPos.x = x;
            this.initPos.y = y;
        }
        setEndtPos(x, y) {
            this.endPos.x = x;
            this.endPos.y = y;
        }
        setStopPos(x, y) {
            this.stopPos.x = x;
            this.stopPos.y = y;
        }
        setWH(w, h) {
            this.initWH.W = w;
            this.initWH.H = h;
        }
        setUI(ui) {
            this.UI = ui;
            this.UI.visible = false;
        }
        createBoxBG(parent) {
            let _box = new Laya.Box();
            _box.x = 0;
            _box.y = 0;
            _box.width = parent.width;
            _box.height = parent.height;
            return _box;
        }
    }

    class GoldContent extends BaseNotice {
        constructor() {
            super();
            this.type = NOTICETYPE.goldContent;
            this.runTime = 0;
            this.runType = RUNTYPE.gradually;
            this.stopTime = 2;
            EventManager.ins.on(CustomDefine.EVENT_UPDATENOTICE, this, this.onUpdate);
        }
        onInto(data, parent, callback) {
            this.createPrefab(data, parent);
        }
        createPrefab(data, parent) {
            let self = this;
            Laya.loader.load("prefab/goldContent.json", Laya.Handler.create(this, function (pref) {
                var playpre = new Laya.Prefab();
                playpre.json = pref;
                var obj = Laya.Pool.getItemByCreateFun("goldContent", playpre.create, playpre);
                let _number = obj.getChildByName("goldNumber");
                let _fontStyle = obj.getChildByName("fontStyle");
                _number.text = MinData.ins.getsMinCion() + "";
                _number.font = "fzxs";
                _fontStyle.font = "fzxs";
                parent.addChild(obj);
                obj.y = -(obj.height - parent.height) / 2;
                self.setUI(obj);
                PublicNoticeMgr.ins().getInitPosByParent(parent, self.runType, self);
                self.UI.x = self.initPos.x;
                self.UI.y = self.initPos.y;
            }));
        }
        onStart() {
            PublicNoticeMgr.ins().playAni(PLAYBEFOREANITYPE.caoxi, () => {
                super.onStart();
            });
        }
        onUpdate() {
            if (!this.UI)
                return;
            let _number = this.UI.getChildByName("goldNumber");
            _number.text = MinData.ins.getsMinCion().toString();
        }
    }

    class ImageNotice extends BaseNotice {
        constructor() {
            super();
        }
        onInto(data, parent, callback) {
            super.onInto(data, parent, callback);
            let _box = super.createBoxBG(parent);
            let _img = new Laya.Image(data.url);
            _img.width = _box.width;
            _img.height = _box.height;
            _box.addChild(_img);
            parent.addChild(_box);
            this.setUI(_box);
            PublicNoticeMgr.ins().getInitPosByParent(parent, this.runType, this);
            this.UI.x = this.initPos.x;
            this.UI.y = this.initPos.y;
            callback();
        }
        onDestory() {
            if (!this.UI)
                return;
            this.UI.removeSelf();
        }
        onStart() {
            PublicNoticeMgr.ins().playAni(PLAYBEFOREANITYPE.snowflake, () => {
                super.onStart();
            });
        }
        reset() {
            super.reset();
        }
        setInitAlpha(n) {
            this.UI.alpha = n;
            this.initAlpha = n;
        }
    }

    class ImageTextNotice extends BaseNotice {
        constructor() {
            super();
        }
        onInto(data, parent, callback) {
            super.onInto(data, parent, callback);
            let self = this;
            Laya.loader.load("prefab/img_text.json", Laya.Handler.create(this, function (pref) {
                var playpre = new Laya.Prefab();
                playpre.json = pref;
                var obj = Laya.Pool.getItemByCreateFun("img_text", playpre.create, playpre);
                let _img = obj.getChildByName("img");
                let _text = obj.getChildByName("text");
                let objH = obj.height;
                let objw = obj.width;
                parent.addChild(obj);
                self.setUI(obj);
                _img.skin = data.url;
                _text.text = data.content;
                for (let index = 0; index < obj.numChildren; index++) {
                    const element = obj.getChildAt(index);
                    if (element instanceof Laya.Label) {
                        element.font = "fzxs";
                    }
                }
                if (data.runType == RUNTYPE.lower) {
                    _text.wordWrap = true;
                    _text.align = "left";
                    _text.valign = "middle";
                    _text.leading = 20;
                    _text.width = 510;
                    obj.height = _text.y + _text.height;
                }
                else {
                    _text.wordWrap = false;
                    obj.width = _text.width + _text.x;
                    obj.y = -(obj.height - parent.height) / 2;
                }
                PublicNoticeMgr.ins().getInitPosByParent(parent, self.runType, self);
                self.UI.x = self.initPos.x;
                self.UI.y = self.initPos.y;
                callback();
            }));
        }
        onStart() {
            super.onStart();
        }
        onDestory() {
            if (!this.UI)
                return;
            this.UI.removeSelf();
        }
        reset() {
            super.reset();
        }
        setInitAlpha(n) {
            this.UI.alpha = n;
            this.initAlpha = n;
        }
    }

    class NoticeContent extends BaseNotice {
        constructor() {
            super();
        }
        onInto(data, parent, callback) {
            super.onInto(data, parent, callback);
            this.createPrefab(data, parent, callback);
        }
        createPrefab(data, parent, callback) {
            if (!parent)
                return;
            let self = this;
            let _profab = { poolItemName: "", url: '' };
            let _content;
            let _goodsUrl;
            if (data.icon > 0) {
                _profab["poolItemName"] = "noticeTubi";
                _profab["url"] = "prefab/notice_tubi.json";
                _content = data.icon;
                _goodsUrl = "mining/img_gold.png";
            }
            else {
                _profab["poolItemName"] = "noticeBaoz";
                _profab["url"] = "prefab/notice_baoz.json";
                _content = data.itemName;
                _goodsUrl = data.treasurer_avatar;
            }
            Laya.loader.load(_profab.url, Laya.Handler.create(this, function (pref) {
                var playpre = new Laya.Prefab();
                playpre.json = pref;
                var obj = Laya.Pool.getItemByCreateFun(_profab.poolItemName, playpre.create, playpre);
                let notice = obj.getChildByName("notice");
                let userIcon = obj.getChildByName("img_user_icon");
                let userName = obj.getChildByName("lab_user_name");
                let goods = obj.getChildByName("img_good");
                let content = obj.getChildByName("lab_content");
                userIcon.skin = data.head;
                userName.text = data.userName;
                goods.skin = _goodsUrl;
                content.text = _content;
                if (parent) {
                    parent.addChild(obj);
                    self.setUI(obj);
                    self.UI.width = content.x + content.width + 20;
                    obj.y = -(obj.height - parent.height) / 2;
                    PublicNoticeMgr.ins().getInitPosByParent(parent, self.runType, self);
                    self.UI.x = self.initPos.x;
                    self.UI.y = self.initPos.y;
                    for (let index = 0; index < obj.numChildren; index++) {
                        const element = obj.getChildAt(index);
                        if (element instanceof Laya.Label) {
                            element.font = "fzxs";
                        }
                    }
                }
                callback();
            }));
        }
        onStart() {
            super.onStart();
        }
        reset() {
            super.reset();
        }
        setInitAlpha(n) {
            this.UI.alpha = n;
            this.initAlpha = n;
        }
        onDestory() {
            if (!this.UI)
                return;
            this.UI.removeSelf();
        }
    }

    class TextNotice extends BaseNotice {
        constructor() {
            super();
        }
        onInto(data, parent, callback) {
            super.onInto(data, parent, callback);
            let _box = super.createBoxBG(parent);
            this.creteHtml(_box, data);
            parent.addChild(_box);
            this.setUI(_box);
            PublicNoticeMgr.ins().getInitPosByParent(parent, this.runType, this);
            this.UI.x = this.initPos.x;
            this.UI.y = this.initPos.y;
            callback();
        }
        creteHtml(_box, data) {
            this._label = new Laya.Label();
            let _boxH = _box.height;
            let _boxW = _box.width;
            _box.addChild(this._label);
            this._label.text = data.content;
            this._label.font = "fzxs";
            this._label.fontSize = 50;
            this._label.wordWrap = false;
            this._label.align = "center";
            this._label.valign = "middle";
            this._label.color = "#fff";
            if (data.runType == RUNTYPE.lower) {
                this._label.wordWrap = true;
                this._label.leading = 20;
                this._label.align = "center";
                this._label.valign = "middle";
                this._label.width = _boxW;
                _box.height = this._label.y + this._label.height;
            }
            else {
                this._label.height = _boxH;
                _box.width = this._label.x + this._label.width;
            }
        }
        onDestory() {
            if (!this.UI)
                return;
            this.UI.removeSelf();
        }
        onStart() {
            super.onStart();
        }
        reset() {
            super.reset();
        }
        setInitAlpha(n) {
            this.UI.alpha = n;
            this.initAlpha = n;
        }
    }

    class VidioNotice extends BaseNotice {
        constructor() {
            super();
        }
        onInto(data, parent, callback) {
            super.onInto(data, parent, callback);
            this.parent = parent;
            this.data = data;
            callback();
        }
        addVideo(sp, url, callback) {
            let divElement = Laya.Browser.createElement("div");
            divElement.className = "div";
            Laya.Browser.document.body.appendChild(divElement);
            Laya.Utils.fitDOMElementInArea(divElement, sp, 0, 0, sp.width, sp.height);
            this.divElement = divElement;
            let videoElement = Laya.Browser.createElement("video");
            videoElement.setAttribute("id", "myvideo");
            this.videoElement = videoElement;
            videoElement.controls = false;
            videoElement.autoPlay = true;
            videoElement.muted = true;
            videoElement.setAttribute("webkit-playsinline", true);
            videoElement.setAttribute("playsinline", true);
            videoElement.setAttribute("x5-video-player-type", 'h5');
            videoElement.setAttribute("x-webkit-airplay", true);
            videoElement.setAttribute("x5-video-orientation", "portrait");
            videoElement.setAttribute('preload', 'auto');
            videoElement.setAttribute('width', '100%');
            videoElement.setAttribute('height', '100%');
            videoElement.setAttribute('display', 'block');
            videoElement.setAttribute('object-fit', 'cover');
            videoElement.type = "vedio/mp4";
            videoElement.src = (url == "") ? "res/video/test.mp4" : url;
            this.divElement.appendChild(this.videoElement);
            this.divElement.style.display = "none";
            this.videoEvent();
            callback();
        }
        reset() {
        }
        onStart() {
            this.addVideo(this.parent, this.data.url, () => {
                PublicNoticeMgr.ins().playAni(PLAYBEFOREANITYPE.snowflake, () => {
                    if (!this.divElement)
                        return;
                    this.divElement.style.display = "";
                    this.videoElement.play();
                });
            });
        }
        onStop() {
            this.removeVideoElement();
            this.onDestory();
        }
        removeVideoElement() {
            if (this.divElement.children.length > 0) {
                this.divElement.removeChild(this.videoElement);
            }
        }
        onDestory() {
            this.removeEventListener();
            if (this.divElement) {
                Laya.Browser.removeElement(this.videoElement);
                Laya.Browser.removeElement(this.divElement);
                this.videoElement = null;
                this.divElement = null;
            }
        }
        loadstart() {
        }
        progress() {
        }
        play() {
        }
        pause() {
        }
        seeking() {
        }
        seeked() {
        }
        waiting() {
        }
        timeupdate() {
        }
        ended() {
            PublicNoticeMgr.ins().curBaseNotice.onStop();
            PublicNoticeMgr.ins().behaviorStart();
        }
        error() {
        }
        videoEvent() {
            if (!this.videoElement)
                return;
            let self = this;
            this.videoElement.addEventListener("loadstart", self.loadstart);
            this.videoElement.addEventListener("progress", self.progress);
            this.videoElement.addEventListener("play", self.play);
            this.videoElement.addEventListener("pause", self.pause);
            this.videoElement.addEventListener("seeking", self.seeking);
            this.videoElement.addEventListener("seeked", self.seeked);
            this.videoElement.addEventListener("waiting", self.waiting);
            this.videoElement.addEventListener("timeupdate", self.timeupdate);
            this.videoElement.addEventListener("ended", self.ended);
            this.videoElement.addEventListener("error", self.error);
        }
        removeEventListener() {
            if (!this.videoElement)
                return;
            let self = this;
            this.videoElement.removeEventListener("loadstart", self.loadstart);
            this.videoElement.removeEventListener("progress", self.progress);
            this.videoElement.removeEventListener("play", self.play);
            this.videoElement.removeEventListener("pause", self.pause);
            this.videoElement.removeEventListener("seeking", self.seeking);
            this.videoElement.removeEventListener("seeked", self.seeked);
            this.videoElement.removeEventListener("waiting", self.waiting);
            this.videoElement.removeEventListener("timeupdate", self.timeupdate);
            this.videoElement.removeEventListener("ended", self.ended);
            this.videoElement.removeEventListener("error", self.error);
        }
    }

    class PublicNoticeData {
        constructor() {
            this.runTime = 0;
            this.stopTime = 0;
        }
        onInit(data) {
            this.type = data.typ;
            this.runType = data.play_type;
            this.url = data.url;
            this.content = data.text;
            this.runTime = data.play_time;
            this.stopTime = data.static_time;
        }
    }

    class PublicNoticeMgr {
        constructor() {
            this.noticeQueue = [];
            this.behaviorIsStop = false;
            this.curQueueIndex = 0;
            this.aniCycle = false;
            this.curBaseNotice = null;
            this.oData = [];
            this.isFocus = true;
            this.queueChildNumber = 0;
            this._associate = null;
            EventManager.ins.on(CustomDefine.EVENT_CLOSELED, this, this.closeLED);
            EventManager.ins.on(CustomDefine.EVENT_OPENLED, this, this.openLED);
            EventManager.ins.on(CustomDefine.EVENT_FOUCE, this, this.onFouce);
        }
        onFouce(b) {
            if (!b.data) {
                this.closeLED();
            }
            else {
                Laya.timer.once(50, this, () => {
                    if (!this._parentUI && PublicNoticeMgr.ins().oData.length <= 0)
                        return;
                    console.log("onFouce开启openLED");
                    this.openLED();
                });
            }
        }
        static ins() {
            if (!this._ins) {
                this._ins = new PublicNoticeMgr();
            }
            return this._ins;
        }
        onInto(parent, data) {
            this.onDestory();
            this.clearAllQueue();
            this.queueChildNumber = 0;
            this._parentUI = parent;
            this.oData = data;
            let newArr = [];
            let goldContent = new GoldContent();
            goldContent.onInto({}, parent);
            this.addNoticeQueue(goldContent);
            this.queueChildNumber += 1;
            if (data && data.length > 0) {
                data.forEach(element => {
                    newArr.push(element);
                });
            }
            if (newArr.length <= 0) {
            }
            else {
                newArr.forEach((e, i) => {
                    let publicNoticeData = new PublicNoticeData();
                    publicNoticeData.onInit(e);
                    this.onCreateBaseNoticeItem(publicNoticeData, parent);
                });
            }
            Laya.timer.loop(200, this, this.isReady);
        }
        isReady() {
            if (this.queueChildNumber >= this.noticeQueue.length) {
                Laya.timer.clear(this, this.isReady);
                this.behaviorStart();
            }
        }
        onCreateBaseNoticeItem(e, parent) {
            if (!parent && this._parentUI) {
                parent = this._parentUI;
            }
            let _baseNotice = null;
            if (e.type == NOTICETYPE.video) {
                _baseNotice = new VidioNotice();
            }
            else if (e.type == NOTICETYPE.image) {
                _baseNotice = new ImageNotice();
            }
            else if (e.type == NOTICETYPE.imageText) {
                _baseNotice = new ImageTextNotice();
            }
            else if (e.type == NOTICETYPE.text) {
                _baseNotice = new TextNotice();
            }
            else if (e.type == NOTICETYPE.noticeContnet) {
                _baseNotice = new NoticeContent();
            }
            else if (e.type == NOTICETYPE.goldContent) {
                _baseNotice = new GoldContent();
            }
            if (!_baseNotice)
                return;
            _baseNotice.onInto(e, parent, () => {
                this.queueChildNumber += 1;
            });
            if (_baseNotice.temporary) {
                this.halfwayAddNoticeQueue(this.curQueueIndex, _baseNotice);
            }
            else {
                this.addNoticeQueue(_baseNotice);
            }
        }
        clearAllQueue() {
            if (this._TWEEN) {
                Laya.Tween.clear(this._TWEEN);
            }
            Laya.timer.clear(this, this.behaviorTween);
            this.noticeQueue.splice(0, this.noticeQueue.length);
            this.noticeQueue.length = 0;
        }
        onDestory() {
            if (this.curBaseNotice) {
                this.behaviorStop();
            }
            this.noticeQueue.forEach((e, i) => {
                if (e) {
                    e.reset();
                    e.onDestory();
                }
            });
        }
        getInitPosByParent(parent, n, _BaseNotice) {
            let _init = {};
            let _end = {};
            let nAlpha = 1;
            let _stop = { x: 0, y: 0 };
            let _bWidth = _BaseNotice.UI.width >= parent.width ? _BaseNotice.UI.width : parent.width;
            let _bHeight = _BaseNotice.UI.height >= parent.height ? _BaseNotice.UI.height : parent.height;
            switch (n) {
                case RUNTYPE.gradually:
                    _init["x"] = _BaseNotice.UI.x;
                    _init["y"] = _BaseNotice.UI.y;
                    _end["x"] = _BaseNotice.UI.x;
                    _end["y"] = _BaseNotice.UI.y;
                    nAlpha = 0;
                    break;
                case RUNTYPE.lower:
                    _init["x"] = _BaseNotice.UI.x;
                    _init["y"] = _bHeight;
                    _end["x"] = _BaseNotice.UI.x;
                    _end["y"] = -_bHeight;
                    _stop["x"] = _BaseNotice.UI.x;
                    _stop["y"] = 0;
                    break;
                case RUNTYPE.right:
                    _init["x"] = _bWidth;
                    _init["y"] = _BaseNotice.UI.y;
                    _end["x"] = -_bWidth;
                    _end["y"] = _BaseNotice.UI.y;
                    _stop["x"] = 0;
                    _stop["y"] = _BaseNotice.UI.y;
                    break;
                case RUNTYPE.noticeRight:
                    _init["x"] = 0;
                    _init["y"] = _BaseNotice.UI.y;
                    _end["x"] = -_bWidth;
                    _end["y"] = _BaseNotice.UI.y;
                    _stop["x"] = -_bWidth;
                    _stop["y"] = _BaseNotice.UI.y;
                    break;
                default:
                    break;
            }
            _init["width"] = _BaseNotice.UI.width;
            _init["height"] = _BaseNotice.UI.height;
            _BaseNotice.setInitAlpha(nAlpha);
            _BaseNotice.setInitPos(_init["x"], _init["y"]);
            _BaseNotice.setEndtPos(_end["x"], _end["y"]);
            _BaseNotice.setStopPos(_stop.x, _stop.y);
            _BaseNotice.setWH(_init["width"], _init["height"]);
        }
        addNoticeQueue(notice) {
            this.noticeQueue.push(notice);
            console.log("===================addNoticeQueue=============================", this.noticeQueue);
        }
        halfwayAddNoticeQueue(index, notice) {
            this.noticeQueue.splice(index, 0, notice);
            console.log("===================halfwayAddNoticeQueue=============================", this.noticeQueue, index);
        }
        deleteNoticeQueueItem(index) {
            this.noticeQueue.splice(index, 1);
            console.log("===================deleteNoticeQueueItem=============================", this.noticeQueue);
        }
        getNoticeQueueItem() {
            if (this.noticeQueue.length <= 0)
                return;
            let _notice = this.noticeQueue[this.curQueueIndex];
            this.curQueueIndex++;
            if (!_notice) {
                this.curQueueIndex = 0;
                return this.getNoticeQueueItem();
            }
            return _notice;
        }
        behaviorStart() {
            let _notice = this.getNoticeQueueItem();
            if (!_notice) {
                this.behaviorIsStop = true;
                return;
            }
            this.behaviorIsStop = false;
            this.curBaseNotice = _notice;
            this.aniCycle = false;
            _notice.onStart();
        }
        behaviorStop() {
            if (!this.curBaseNotice)
                return;
            this.curBaseNotice.reset();
            if (this.curBaseNotice.temporary) {
                this.deleteNoticeQueueItem(this.curQueueIndex - 1);
            }
            this.curBaseNotice = null;
        }
        behaviorTween(item) {
            let _pre = {};
            switch (item.runType) {
                case RUNTYPE.gradually:
                    let nAlpha = (item.UI.alpha > 0) ? 0 : 1;
                    _pre = { "alpha": nAlpha };
                    break;
                case RUNTYPE.lower:
                    if (item.UI.y == item.initPos.y) {
                        _pre = { "x": item.stopPos.x, "y": item.stopPos.y };
                    }
                    else if (item.UI.y == item.stopPos.y) {
                        _pre = { "x": item.endPos.x, "y": item.endPos.y };
                    }
                    break;
                case RUNTYPE.right:
                    if (item.UI.x == item.initPos.x) {
                        _pre = { "x": item.stopPos.x, "y": item.stopPos.y };
                    }
                    else if (item.UI.x == item.stopPos.x) {
                        _pre = { "x": item.endPos.x, "y": item.endPos.y };
                    }
                    break;
                case RUNTYPE.noticeRight:
                    if (item.UI.x == item.initPos.x) {
                        _pre = { "x": item.stopPos.x, "y": item.stopPos.y };
                    }
                    else if (item.UI.x == item.stopPos.x) {
                        _pre = null;
                    }
                    break;
                default:
                    break;
            }
            this.execBehaviorTween1(item, _pre);
        }
        execBehaviorTween1(item, _pre) {
            if (!_pre) {
                this.behaviorStop();
                this.behaviorStart();
                return;
            }
            this._TWEEN = Laya.Tween.to(item.UI, _pre, item.runTime * 1000, null, Laya.Handler.create(this, this.execBehaviorTween2, [item]));
        }
        execBehaviorTween2(item) {
            if (this.aniCycle) {
                this.behaviorStop();
                this.behaviorStart();
                return;
            }
            this.aniCycle = true;
            Laya.timer.once(item.stopTime * 1000, this, this.behaviorTween, [item]);
        }
        playAni(aniType, callback) {
            let url = "";
            switch (aniType) {
                case PLAYBEFOREANITYPE.caoxi:
                    url = "res/atlas/led/xuhua.atlas";
                    break;
                case PLAYBEFOREANITYPE.snowflake:
                    url = "res/atlas/led/chaoxi.atlas";
                    break;
                default:
                    break;
            }
            let anim = new Laya.Animation();
            this._parentUI.addChild(anim);
            anim.scale(2, 2);
            anim.loadAtlas(url, Laya.Handler.create(this, this.aniPlay, [anim]));
            anim.on(Laya.Event.COMPLETE, this, () => {
                anim.destroy();
                callback();
            });
        }
        aniPlay(anim) {
            anim.play(0, false);
        }
        closeLED(associate) {
            if (this._associate)
                return;
            this._associate = (associate && associate.data) ? associate.data : this._associate;
            this.onDestory();
            this.clearAllQueue();
            MinCtrl.ins.hideGoldUI();
            console.log("LED关联者==========关闭=============", this._associate);
        }
        openLED(associate) {
            let ass = (associate && associate.data) ? associate.data : null;
            if (this._associate && this._associate != ass)
                return;
            this.onInto(this._parentUI, PublicNoticeMgr.ins().oData);
            MinCtrl.ins.showGoldUI();
            console.log("LED关联者===========打开============", this._associate, ass);
            this._associate = null;
        }
        addVidio(arr) {
            let _rArr = [];
            if (arr.length <= 0)
                return;
            arr.forEach(element => {
                if (element.media && element.media != "") {
                    let vBaseNotice = new BaseNotice();
                    vBaseNotice.data.url = element.media;
                    vBaseNotice.parent = this._parentUI;
                    _rArr.unshift(vBaseNotice);
                }
            });
            return _rArr;
        }
    }
    PublicNoticeMgr._ins = null;

    class MinTipInfo extends ui.min.MinTipInfoUI {
        constructor(_data) {
            super();
            this.closeTime = 2000;
            this.data = {};
            this.data = _data;
            this.onInit();
        }
        onInit() {
            this.btn_kx.on(Laya.Event.CLICK, this, this.onBtnKX);
            this.icon.skin = this.data.avatar ? this.data.avatar : "";
            this.onStartTimer();
        }
        onBtnKX() {
            if (this) {
                this.removeSelf();
                this.destroy();
            }
            EventManager.ins.event(CustomDefine.EVENT_OPENLED);
        }
        setIcon(url) {
            this.icon.skin = url;
        }
        onStartTimer() {
            Laya.timer.once(this.closeTime, this, this.onBtnKX);
        }
    }

    var Handler = Laya.Handler;
    const MINBG = "mining/img_bg.jpg";
    class MinScene {
        constructor() {
            this.curToolType = null;
            this.curHttpIsError = false;
            this.isSendError = false;
            this.timeing = false;
            EventManager.ins.on(CustomDefine.EVENT_PETANIFINISHEVENT, this, this.petAniFinishUpData);
            EventManager.ins.on(CustomDefine.EVENT_PETMINOVERUPDATEEVENT, this, this.petMinFinishUpData);
            EventManager.ins.on(CustomDefine.HTTP_SEND_ERROR, this, this.sendError);
            Laya.timer.frameLoop(1, this, () => {
                if (this.curPetIns && GameCtrl.ins.camera && this.curPetIns.oPet) {
                    let _r = this.findChild(this.curPetIns.oPet, "Scapula_R");
                    let _position = this.worldToScreen(GameCtrl.ins.camera, _r.transform.position);
                    if (this.imgShadow) {
                        this.imgShadow.x = _position.x - 100;
                    }
                }
            });
        }
        static get ins() {
            if (!this._ins)
                this._ins = new MinScene();
            return this._ins;
        }
        sendError(e) {
            if (e.data == HttpName.MINBEHAVIOUR) {
                this.isSendError = true;
                this.curPetIns.setBehaviourState(PETBEHAVIOURTYPE.huxi);
                MinCtrl.ins.onExecRequsetInErr(5000);
            }
        }
        init() {
            console.log("==============MinScene=init=开始执行==================");
            this.CAMERA = Define.CDN + "3d/camera.lh";
            this.SCENE = Define.CDN + "3d/main.ls";
            this.GOLD = Define.CDN + "3d/jinbi.lh";
            this.MANRES = Define.CDN + "3d/pet_0.lh";
            this.WOMANRES = Define.CDN + "3d/pet_1.lh";
            this.DENGGUANG = Define.CDN + "3d/dengguang.lh";
            this.oGame = GameCtrl.ins;
            this.oGame.init();
            this.loadSceneBackgound();
            UIManager.ins.openWindow(CustomWindow.min);
            UIManager.ins.getWindow(CustomWindow.min).onInit();
            this.showScene();
            this.oGame.camera.orthographicVerticalSize = 10;
            EventManager.ins.on(CustomDefine.EVENT_CHANGETOOL, this, this.changeTool);
            EventManager.ins.on(CustomDefine.EVENT_BEHAVIOUR, this, this.onBehaviour);
            PublicNoticeMgr.ins()._associate = null;
        }
        showScene() {
            this.arrRes = [this.CAMERA, this.GOLD, this.MANRES, this.WOMANRES, this.DENGGUANG];
            Laya.loader.create(this.arrRes, Handler.create(this, this.onLoaded));
        }
        onLoaded(b) {
            if (!b) {
                console.error("资源加载失败");
            }
            else {
                console.log("资源加载成功", this.arrRes);
            }
            this.scene = GameCtrl.ins.scene3D;
            let camera = GameCtrl.ins.camera;
            this.curPetIns = new Pet();
            this.curPetIns.setSex(UserData.ins.sex);
            this.curPetIns.onLoaded();
            LayerManager.ins.addChild(this.scene, LayerName.scene);
            this.scene.addChild(camera);
            this.gold = Laya.loader.getRes(this.GOLD);
            this.gold.active = false;
            this.gold.transform.position = new Laya.Vector3(0, -0.5, 0);
            this.scene.addChild(this.gold);
            this._goldAni = this.gold.getComponent(Laya.Animator);
            this.setLight();
            Laya.loader.clearRes(this.CAMERA);
            Laya.loader.clearRes(this.GOLD);
            Laya.loader.clearRes(this.MANRES);
            Laya.loader.clearRes(this.WOMANRES);
            Laya.loader.clearRes(this.DENGGUANG);
        }
        setLight() {
            this.directionLight = this.scene.addChild(new Laya.DirectionLight());
            this.directionLight.color = new Laya.Vector3((238 / 225), (214 / 225), (131 / 225));
            this.directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
            this.directionLight.intensity = 0.9;
            this.directionLight.transform.localPosition = new Laya.Vector3(3.025143, 2.002386, -0.9977947);
            this.directionLight.transform.localPosition = new Laya.Vector3(61.356, -62.998, -12.517);
        }
        loadSceneBackgound() {
            if (!this.bgView) {
                this.bgView = new Laya.View();
                this.bgView.name = "bgView";
                LayerManager.ins.addChild(this.bgView, LayerName.scene);
                this.bgView.width = Laya.stage.width;
                this.bgView.height = Laya.stage.height;
                let _img = new Laya.Image(MINBG);
                _img.x = -(CustomDefine.maxBgWidth - Define.DeviceW) >> 1;
                this.bgView.addChild(_img);
                this.imgShadow = new Laya.Image("mining/img_shadow.png");
                _img.addChild(this.imgShadow);
                this.imgShadow.alpha = 0.8;
                this.imgShadow.width = 450;
                this.imgShadow.height = 150;
                this.imgShadow.x = 0;
                this.imgShadow.y = 1130;
                let arrPos = [[147, 913, 0.3, 0], [320, 920, 0.4, 0], [453, 893, 0.3, 180],
                    [320, 920, 0.4, 0], [393, 925, 0.4, 180], [240, 940, 0.4, 0],
                    [167, 960, 0.6, 0], [300, 947, 0.6, 0], [430, 925, 0.7, 180]];
                for (let i = 0; i < 9; i++) {
                    let frame = FrameManager.ins.getFrameBySkin("mining_frame/role" + (i < 3 ? 3 : i < 6 ? 2 : 1));
                    if (frame) {
                        frame.x = arrPos[i][0];
                        frame.y = arrPos[i][1];
                        frame.scale(arrPos[i][2], arrPos[i][2]);
                        frame.skewY = arrPos[i][3];
                        Laya.timer.once(200 * i, this, () => {
                            frame.playFrame(true, this.bgView);
                        });
                    }
                }
            }
        }
        onBehaviour(EVENT_BEHAVIOUR) {
            switch (EVENT_BEHAVIOUR.data) {
                case PETBEHAVIOURTYPE.mining:
                    this.curPetIns.startMining();
                    break;
                case PETBEHAVIOURTYPE.shibai:
                    this.curPetIns.startSb();
                    break;
                case PETBEHAVIOURTYPE.huxi:
                    Laya.timer.once((this.curPetIns.sleep * 1000), this, () => {
                        MinCtrl.ins.startMining();
                    });
                    this.curPetIns.startHx();
                    break;
                case PETBEHAVIOURTYPE.chenggong:
                    this.goldAni();
                    this.curPetIns.startCg();
                    MinCtrl.ins.TweenToBag();
                    break;
                case PETBEHAVIOURTYPE.goodCG:
                    this.curPetIns.startCg();
                    let _data = MinCtrl.ins.nextGetTreasure ? MinCtrl.ins.nextGetTreasure : {};
                    EventManager.ins.event(CustomDefine.EVENT_CLOSELED);
                    LayerManager.ins.addChild(new MinTipInfo(_data), LayerName.top);
                    break;
                default:
                    break;
            }
        }
        goldAni() {
            function ani() {
                if (this._goldAni.getCurrentAnimatorPlayState().normalizedTime >= 1) {
                    this.gold.active = false;
                    Laya.timer.clear(this, ani);
                }
            }
            this.gold.active = true;
            this._goldAni.play("gold", 0, 0.1);
            Laya.timer.frameLoop(1, this, ani);
        }
        changeTool(type) {
            this.curPetIns.changeTool(type);
        }
        setTimeing(b) {
            this.timeing = b;
        }
        onDestory() {
            this.curPetIns.onDestroy();
            this._goldAni.destroy();
            this.gold.destroy();
            this.directionLight.destroy();
            this.imgShadow.destroy();
            UIManager.ins.closeWindow(CustomWindow.min);
            UIManager.ins.getWindow(CustomWindow.min).onDestory();
            Laya.timer.clearAll(this);
        }
        petAniFinishUpData() {
            MinCtrl.ins.upDateStorage();
            MinCtrl.ins.bagList();
        }
        petMinFinishUpData() {
            PetAniMgr.ins.stop();
        }
        findChild(sp, name) {
            if (sp.name == name)
                return sp;
            else
                return this._findChild(sp._children, name);
        }
        _findChild(spArr, name) {
            var arr = [];
            for (var i = 0; i < spArr.length; i++) {
                var child = spArr[i];
                if (child.name == name) {
                    return child;
                }
                else if (child.numChildren) {
                    arr = arr.concat(child._children);
                }
            }
            if (!arr.length)
                return null;
            return this._findChild(arr, name);
        }
        worldToScreen(camera, pos) {
            var outPos = new Laya.Vector4();
            camera.viewport.project(pos, camera.projectionViewMatrix, outPos);
            return new Laya.Vector2(outPos.x / Laya.stage.clientScaleX, outPos.y / Laya.stage.clientScaleY);
        }
    }

    class LoadingCtrl {
        constructor() {
            if (LoadingCtrl._ins != null)
                throw new Error("LoadingCtrl is single!");
            this.arrRes = [];
        }
        static get ins() {
            if (!this._ins)
                LoadingCtrl._ins = new LoadingCtrl();
            return this._ins;
        }
        init() {
        }
        preLoad() {
            let arr = [{
                    url: "res/atlas/loading.atlas",
                    type: Laya.Loader.ATLAS
                }];
            ResManager.ins.preload(arr, Laya.Handler.create(this, this.preLoadFinish), null);
        }
        preLoadFinish() {
            this.initModuleLoadRes();
            MsgCtrl.ins.init();
            GameCtrl.ins.init();
            UIManager.ins.openWindow(CustomWindow.loading);
        }
        initModuleLoadRes() {
            this.arrRes.push({ url: "res/atlas/game.atlas", type: Laya.Loader.ATLAS });
            this.arrRes.push({ url: "res/font/" + FontType.fzxs + ".TTF", type: Laya.Loader.TTF });
            if (AppCtrl.ins.type == ModuleType.USER) {
                this.arrRes.push({ url: "res/atlas/user.atlas", type: Laya.Loader.ATLAS });
            }
            else if (AppCtrl.ins.type == ModuleType.MIN) {
                this.arrRes.push({ url: "res/atlas/mining.atlas", type: Laya.Loader.ATLAS });
                this.arrRes.push({ url: "res/atlas/mining_frame.atlas", type: Laya.Loader.ATLAS });
            }
            else {
            }
            console.log("加载资源：", this.arrRes);
        }
        enterGame() {
            Test.ins.init();
            UIManager.ins.closeWindow(CustomWindow.loading);
            Laya.Browser.window.hideHtmlLoading();
            AppCtrl.ins.loadSuccess();
            if (AppCtrl.ins.type == ModuleType.USER) {
                UIManager.ins.openWindow(CustomWindow.user);
            }
            else if (AppCtrl.ins.type == ModuleType.MIN) {
                HttpManager.ins.sendMsg(HttpName.TICKETINFO, null, HttpMethod.GET, (msg, method, e) => {
                    if (e && e.data) {
                        console.log("=============挖矿状态===============", JSON.stringify(e.data));
                        PublicNoticeMgr.ins().oData = e.data.led_infos;
                        MinData.ins.setsMinCion(e.data.balance);
                        if (e.data.status == 1 || e.data.status == 3) {
                            MinScene.ins.init();
                        }
                        else if (e.data.status == 5) {
                            MinCtrl.ins.onMinMaintain();
                            return;
                        }
                        else {
                            LocalStorage.clearAll();
                            PublicNoticeMgr.ins()._associate = null;
                            PublicNoticeMgr.ins().onDestory();
                            PublicNoticeMgr.ins().clearAllQueue();
                            LayerManager.ins.addChild(UIManager.ins.getWindow(CustomWindow.minDoor).ui, LayerName.scene);
                            UIManager.ins.getWindow(CustomWindow.minDoor)._data = e.data;
                            UIManager.ins.getWindow(CustomWindow.minDoor).onInit();
                        }
                    }
                    else {
                        AppCtrl.ins.loadError();
                    }
                });
            }
            else {
                LayerManager.ins.addChild(UIManager.ins.getWindow(CustomWindow.minDoor).ui, LayerName.scene);
                UIManager.ins.getWindow(CustomWindow.minDoor).onInit();
            }
            if (AppCtrl.ins.isHomePage) {
            }
        }
        preloadDataConfig(complete) {
            Laya.loader.load(CustomDefine.dataConfigUrl, Laya.Handler.create(this, () => {
                this.parseDataConfig(complete);
            }), null, Laya.Loader.JSON);
        }
        parseDataConfig(complete) {
            let data = Laya.loader.getRes(CustomDefine.dataConfigUrl);
            DataConfig.ins.init(data);
            complete.run();
        }
    }

    class LoadingUI extends BaseWindow {
        constructor() {
            super(ui.LoadingUI);
            this.loadIndex = 0;
            this.frame = 0;
        }
        init() {
            this.ui = this.view;
            this.arrScroll = [];
        }
        open() {
            Base64Manager.isUseBase64 = false;
            this.ui.btnCloseApp.on(Laya.Event.MOUSE_DOWN, this, () => {
                AppCtrl.ins.close();
            });
            this.progressHandler = Laya.Handler.create(this, this.HTTP_PROGRESS, null, false);
            EventManager.ins.on(NoticeEvent.HTTP_PROGRESS, this, this.HTTP_PROGRESS);
            this.arrLoad = [this.loadRes, this.loadDataConfig];
            this.loadIndex = 0;
            this.loadNext();
            let spMask = new Laya.Sprite();
            spMask.graphics.drawRect(0, 0, this.ui.spScroll.width, this.ui.spScroll.height, "");
            this.ui.spScroll.mask = spMask;
            for (let i = 0; i <= 20; i++) {
                let img = new Laya.Image("loading/img_loading_cell.png");
                img.x = i * 50;
                this.arrScroll.push(img);
                this.ui.spScroll.addChild(img);
            }
            Laya.timer.frameLoop(1, this, this.scroll);
            this.ui.visible = false;
        }
        close() {
            Laya.timer.clearAll(this);
        }
        scroll() {
            for (let i = 0; i <= 20; i++) {
                let img = this.arrScroll[i];
                img.x += 4;
                if (img.x > this.ui.width + 10) {
                    img.x = this.arrScroll[0].x - 50;
                    this.arrScroll.splice(i, 1);
                    this.arrScroll.unshift(img);
                }
            }
            this.frame++;
            if (this.frame % 3 == 0) {
                let a = this.frame / 150 * 100;
                if (a > 100) {
                    a = 100;
                    Laya.timer.clear(this, this.scroll);
                    EventManager.ins.event(NoticeEvent.GAME_RES_LOAD_FINISH);
                    Global.platform.login();
                }
                this.ui.txtCount.text = a.toFixed(0) + "%";
            }
        }
        loadNext() {
            if (this.loadIndex >= this.arrLoad.length) {
                console.log("资源加载结束。。");
                EventManager.ins.event(NoticeEvent.GAME_RES_LOAD_FINISH);
                Global.platform.login();
            }
            else {
                let func = this.arrLoad[this.loadIndex++];
                if (func) {
                    func.call(this);
                }
            }
        }
        loadDataConfig() {
            LoadingCtrl.ins.preloadDataConfig(Laya.Handler.create(this, this.loadNext));
        }
        loadRes() {
            ResManager.ins.preload(LoadingCtrl.ins.arrRes, Laya.Handler.create(this, this.loadNext), this.progressHandler);
        }
        loadSound() {
            let arr = [{
                    url: Define.CDN + CustomDefine.SOUND_MAIN,
                    type: Laya.Loader.SOUND
                }];
            SoundManager.ins.preload(arr, Laya.Handler.create(this, this.loadNext), this.progressHandler);
        }
        HTTP_PROGRESS(e) {
            let curProgress = Number(e.data);
            let progressValue = (this.loadIndex + curProgress) / this.arrLoad.length;
        }
    }

    class bagContentGold extends ui.min.bagContentGoldUI {
        constructor() {
            super();
            let html = "<p>凸币能买啥？<span style='color:#FDC001'><span>&nbsp;&nbsp;</span>点我去看看</span><span>&nbsp;&nbsp;</span>不耽误您挖矿哦~</p>";
            this._html.style.fontSize = 24;
            this._html.style.color = "#fff";
            this._html.style.wordWrap = false;
            this._html.x = 158;
            this._html.y = 1000;
            this._html.innerHTML = html;
            this._html.on(Laya.Event.CLICK, this, this.onHtml);
            this.btn_close.on(Laya.Event.CLICK, this, this.onClose);
        }
        onClose() {
            this.removeSelf();
            MinCtrl.ins.view.hideCurSelectGood(this);
        }
        onHtml() {
            AppCtrl.ins.tobBlock();
            this.onClose();
        }
        onCreateVagueBG() {
            var blurFilter = new Laya.BlurFilter();
            blurFilter.strength = 10;
            this.bg.filters = [blurFilter];
        }
    }

    var BAGCONTENTGOODTYPE;
    (function (BAGCONTENTGOODTYPE) {
        BAGCONTENTGOODTYPE[BAGCONTENTGOODTYPE["bagType"] = 0] = "bagType";
        BAGCONTENTGOODTYPE[BAGCONTENTGOODTYPE["treasure"] = 1] = "treasure";
    })(BAGCONTENTGOODTYPE || (BAGCONTENTGOODTYPE = {}));
    class bagContentGood extends ui.min.bagContentGoodUI {
        constructor(t, parent, param) {
            super();
            this.data = null;
            this.data = param;
            this.init(t, parent);
            this.bindEvent();
        }
        init(t, parent) {
            this.img_good.skin = this.data.avatar ? this.data.avatar : "";
            this.logo.skin = this.data.brand_avatar ? this.data.brand_avatar : "";
            this.lab_good_m.text = this.data.desc ? this.data.desc : "";
            this.price.text = "价值：" + (this.data.price ? this.data.price : "");
            this.jieshao.text = this.data.introduction ? this.data.introduction : "";
            this.chicun.text = "宝物尺码：" + (this.data.specification ? this.data.specification : "");
            this.lab_logo.text = this.data.brand_name ? this.data.brand_name : "";
            this.img_good.x = (this._panel.width - this.img_good.width) / 2;
            this.img_good.y = (this._panel.height - this.img_good.height) / 2;
            switch (t) {
                case BAGCONTENTGOODTYPE.bagType:
                    this.btn_ljdh.visible = true;
                    break;
                case BAGCONTENTGOODTYPE.treasure:
                    this.btn_ljdh.visible = false;
                    break;
                default:
                    break;
            }
            parent.addChild(this);
        }
        bindEvent() {
            this.btn_ljdh.on(Laya.Event.CLICK, this, this.onExchange);
            this.btn_close.on(Laya.Event.CLICK, this, this.onClose);
        }
        onExchange() {
            AppCtrl.ins.goExchange(this.data.id);
        }
        onClose() {
            this.removeSelf();
            if (MinCtrl.ins.view) {
                MinCtrl.ins.view.hideCurSelectGood(this);
            }
        }
        onCreateVagueBG() {
            var blurFilter = new Laya.BlurFilter();
            blurFilter.strength = 10;
            this.bg.filters = [blurFilter];
        }
    }

    const GREEN = "mining/img_scroll_g.png";
    const YELLOW = "mining/img_scroll_h.png";
    const RED = "mining/img_scroll_red.png";
    class MinProgressBar extends ui.min.MinProgressBarUI {
        constructor() {
            super();
            this.OFFSET_N = 14;
            this.OFFSET_Z = 28;
            this.OFFSET_F = 0;
            this.OFFSET_X = 636;
            this.OFFSET_Y = 600;
            this.nLast = -1;
            this.init();
        }
        init() {
            this.y = this.OFFSET_Y;
            this.x = this.OFFSET_X;
            this.zOrder = -1;
            this._sp = new Laya.Sprite();
            this._sp.graphics.drawRect(-25, 0, 100, 395, "#00ffff");
            this.scroll_t.mask = this._sp;
        }
        onChangeStrength(n) {
            this.onChangePic(n);
            this.setValue(n * 100);
            let _nn = 395 - (395 * n);
            Laya.Tween.to(this._sp, {
                y: _nn, update: Laya.Handler.create(this, () => {
                }, null, false)
            }, 1000, null, Laya.Handler.create(this, this.finishTween, [_nn]));
        }
        finishTween(n) {
            this._sp.y = n;
        }
        onChangePic(n) {
            if (n < 0.2) {
                this.scroll_t.skin = RED;
            }
            else if (n < 0.5) {
                this.scroll_t.skin = YELLOW;
            }
            else {
                this.scroll_t.skin = GREEN;
            }
        }
        setValue(n) {
            let _n = Math.floor(n);
            this.value.text = _n + "%";
        }
    }

    const itemTreasuryScene_x = 0;
    const itemTreasuryScene_y = 0;
    class MinUI extends BaseWindow {
        constructor() {
            super(ui.min.MinUI);
            this.name = null;
            this.curSelectGood = null;
            this.bagContentChild = null;
        }
        onInit() {
            this.ui = this.view;
            this.name = "MinUI";
            this.ctrl = MinCtrl.ins;
            this.ctrl.view = this;
            this.ctrl.Init();
            this.ctrl.upDate();
            this.initList();
            this.bindOtherEvent();
            this.ui.notes.on(Laya.Event.CLICK, this, this.openNotes);
            this.ui.out.on(Laya.Event.CLICK, this, this.backDoor);
            this.ui.img_bg_crowd.on(Laya.Event.CLICK, this, this.openCrowd);
            this.proBar = new MinProgressBar();
            this.ui.addChild(this.proBar);
            this.ui.biankuang.bottom = AppCtrl.ins.appMenuBgHeight + 50;
            EventManager.ins.event(CustomDefine.EVENT_CLOSELED);
            EventManager.ins.on(CustomDefine.EVENT_MIN_NOTICE, this, this.EVENT_MIN_NOTICE);
            AppCtrl.ins.changeAppMenuBg("mining/img_bg_menu.jpg");
            Laya.timer.once(50, this, () => {
                PublicNoticeMgr.ins().onInto(this.ui.panel, PublicNoticeMgr.ins().oData);
            });
            this.exentGoldUI();
        }
        backDoor() {
            console.log("明天再来");
            this.ctrl.backDoor();
        }
        onDestory() {
            if (this.bagContentChild) {
                this.bagContentChild.removeSelf();
                this.bagContentChild.destroy();
            }
            this.proBar.destroy();
        }
        exentGoldUI() {
            this._goldsTop = new Laya.Image("mining/img_goldsTop.png");
            this._goldsTop.x = -92;
            this._goldsTop.y = 0;
            this.ui.addChild(this._goldsTop);
        }
        activeUI(b) {
            this.ui.visible = b;
        }
        openNotes() {
            if (this.bagContentChild) {
                this.curSelectGood.getChildByName("img_jb").visible = false;
                this.bagContentChild.removeSelf();
                this.bagContentChild.destroy();
                PublicNoticeMgr.ins()._associate = null;
            }
            UIManager.ins.openWindow(CustomWindow.minRecord);
        }
        openCrowd() {
            UIManager.ins.openWindow(CustomWindow.minRank);
        }
        initList() {
            this.ui.list_bag.array = [];
            this.ui.list_bag.hScrollBarSkin = "";
            this.ui.list_bag.renderHandler = Laya.Handler.create(this, this.listBagRenderHandler, null, false);
            this.ui.list_bag.mouseHandler = Laya.Handler.create(this, this.listBagMouseHandler, null, false);
        }
        listBagMouseHandler(e, i) {
            let _dataSource = e.target.dataSource;
            if (Object.keys(_dataSource).length <= 0) {
                return;
            }
            if (e.type == Laya.Event.CLICK) {
                if (this.curSelectGood) {
                    this.curSelectGood.getChildByName("img_jb").visible = false;
                }
                this.curSelectGood = e.target;
                this.curSelectGood.getChildByName("img_jb").visible = true;
                if (this.bagContentChild) {
                    this.bagContentChild.removeSelf();
                    this.bagContentChild.destroy();
                    EventManager.ins.event(CustomDefine.EVENT_OPENLED, this.bagContentChild);
                }
                if (i == 0) {
                    this.bagContentChild = new bagContentGold();
                    this.ui.bagContent.addChild(this.bagContentChild);
                }
                else {
                    let _dataSource = e.target.dataSource;
                    if (Object.keys(_dataSource).length > 0) {
                        this.bagContentChild = new bagContentGood(BAGCONTENTGOODTYPE.bagType, this.ui.bagContent, e.target.dataSource);
                    }
                }
                EventManager.ins.event(CustomDefine.EVENT_CLOSELED, this.bagContentChild);
            }
        }
        hideCurSelectGood(associate) {
            if (this.curSelectGood) {
                this.curSelectGood.getChildByName("img_jb").visible = false;
            }
            EventManager.ins.event(CustomDefine.EVENT_OPENLED, associate);
        }
        listBagRenderHandler(cell) {
            let icon = cell.getChildByName("img_icon");
            let name = cell.getChildByName("lab_name");
            icon.skin = cell.dataSource.avatar ? cell.dataSource.avatar : "";
            name.text = cell.dataSource.desc ? cell.dataSource.desc : "";
        }
        viewClick(sp) {
            switch (sp.name) {
                case "btn_back":
                    this.ctrl.onBack();
                    break;
                case "btn_bag":
                    this.ctrl.openBag();
                    break;
                case "btn_mining":
                    this.ctrl.startMining();
                    break;
                case "btn_select_hoe":
                    this.ctrl.selectHoe();
                    break;
                default:
                    break;
            }
        }
        bindOtherEvent() {
        }
        EVENT_MIN_NOTICE(evt) {
            let isNotice = evt.data;
            this.itemTreasuryScene.txtTodayLucky.visible = !isNotice;
        }
    }

    class BagData {
        constructor() {
            if (BagData._ins != null)
                throw new Error("BagData is single!");
            this.arrEquipName = [];
            this.arrEquipName[EQUIP_TYPE$1.hat] = EQUIP_NAME$1.hat;
            this.arrEquipName[EQUIP_TYPE$1.hair] = EQUIP_NAME$1.hair;
            this.arrEquipName[EQUIP_TYPE$1.eye] = EQUIP_NAME$1.eye;
            this.arrEquipName[EQUIP_TYPE$1.ear] = EQUIP_NAME$1.ear;
            this.arrEquipName[EQUIP_TYPE$1.neck] = EQUIP_NAME$1.neck;
            this.arrEquipName[EQUIP_TYPE$1.body] = EQUIP_NAME$1.body;
            this.arrEquipName[EQUIP_TYPE$1.arm] = EQUIP_NAME$1.arm;
            this.arrEquipName[EQUIP_TYPE$1.ring] = EQUIP_NAME$1.ring;
            this.arrEquipName[EQUIP_TYPE$1.belt] = EQUIP_NAME$1.belt;
            this.arrEquipName[EQUIP_TYPE$1.leg] = EQUIP_NAME$1.leg;
            this.arrEquipName[EQUIP_TYPE$1.foot] = EQUIP_NAME$1.foot;
            this.arrEquipBone = [];
            this.arrEquipBone[EQUIP_TYPE$1.hat] = EQUIP_BONE.hat;
            this.arrEquipBone[EQUIP_TYPE$1.hair] = EQUIP_BONE.hair;
            this.arrEquipBone[EQUIP_TYPE$1.eye] = EQUIP_BONE.eye;
            this.arrEquipBone[EQUIP_TYPE$1.ear] = EQUIP_BONE.ear;
            this.arrEquipBone[EQUIP_TYPE$1.neck] = EQUIP_BONE.neck;
            this.arrEquipBone[EQUIP_TYPE$1.body] = EQUIP_BONE.body;
            this.arrEquipBone[EQUIP_TYPE$1.arm] = EQUIP_BONE.arm;
            this.arrEquipBone[EQUIP_TYPE$1.ring] = EQUIP_BONE.ring;
            this.arrEquipBone[EQUIP_TYPE$1.belt] = EQUIP_BONE.belt;
            this.arrEquipBone[EQUIP_TYPE$1.leg] = EQUIP_BONE.leg;
            this.arrEquipBone[EQUIP_TYPE$1.foot] = EQUIP_BONE.foot;
            this.arrEquip = [];
            this.arrBag = [];
        }
        static get ins() {
            if (!this._ins)
                BagData._ins = new BagData();
            return this._ins;
        }
        initEquip(obj) {
            console.log("得到装备穿戴信息：", obj);
            let equips = obj.data;
            if (equips) {
                for (let equip of equips) {
                    let struct = new Struct_Equip();
                    struct.id = equip.id;
                    struct.itemId = equip.itemId;
                    struct.cfg = DataConfig.ins.getItemById(equip.itemId);
                    this.arrEquip.push(struct);
                }
            }
            EventManager.ins.event(CustomDefine.EVENT_EQUIP);
        }
        initBag(obj) {
            let bags = obj.data;
            if (bags && bags instanceof Array) {
                for (let bag of bags) {
                    let struct = new Struct_Bag();
                    struct.id = bag.id;
                    struct.itemId = bag.itemId;
                    struct.cfg = DataConfig.ins.getItemById(bag.itemId);
                    this.arrBag.push(struct);
                }
            }
            EventManager.ins.event(CustomDefine.EVENT_BAG);
        }
        saveEquip(obj) {
            EventManager.ins.event(CustomDefine.EVENT_SAVE_EQUIP, { success: obj.data });
        }
        getProduct(obj) {
            EventManager.ins.event(CustomDefine.EVENT_GET_PRODUCT, obj.data);
        }
        getBagByType(type) {
            let arrType = [];
            for (let bag of this.arrBag) {
                if (!bag)
                    continue;
                if (type == 0 || bag.cfg.type_index == type) {
                    arrType.push(bag);
                }
            }
            return arrType;
        }
        getEquipByType(type) {
            let ret = null;
            for (let equip of this.arrEquip) {
                if (!equip)
                    continue;
                if (equip.cfg.type == type) {
                    ret = equip;
                    break;
                }
            }
            return ret;
        }
        getIconPath(id) {
            let cfg = DataConfig.ins.getItemById(id);
            return Define.CDN + "icon/item_" + cfg.sex + "_" + cfg.type + "_" + cfg.type_index + ".png";
        }
        getModelPath(id) {
            let cfg = DataConfig.ins.getItemById(id);
            return Define.CDN + "3d/user/pet_" + cfg.sex + "_" + cfg.type + "_" + cfg.type_index + ".lh";
        }
    }
    class EQUIP_TYPE$1 {
    }
    EQUIP_TYPE$1.hat = 1;
    EQUIP_TYPE$1.hair = 2;
    EQUIP_TYPE$1.eye = 3;
    EQUIP_TYPE$1.ear = 4;
    EQUIP_TYPE$1.neck = 5;
    EQUIP_TYPE$1.body = 6;
    EQUIP_TYPE$1.arm = 7;
    EQUIP_TYPE$1.ring = 8;
    EQUIP_TYPE$1.belt = 9;
    EQUIP_TYPE$1.leg = 10;
    EQUIP_TYPE$1.foot = 11;
    class EQUIP_NAME$1 {
    }
    EQUIP_NAME$1.hat = "帽子";
    EQUIP_NAME$1.hair = "发带";
    EQUIP_NAME$1.eye = "眼镜";
    EQUIP_NAME$1.ear = "耳饰";
    EQUIP_NAME$1.neck = "项链";
    EQUIP_NAME$1.body = "上衣";
    EQUIP_NAME$1.arm = "手镯 ";
    EQUIP_NAME$1.ring = "戒指";
    EQUIP_NAME$1.belt = "腰带";
    EQUIP_NAME$1.leg = "裤子";
    EQUIP_NAME$1.foot = "鞋";
    class EQUIP_BONE {
    }
    EQUIP_BONE.hat = "hat_point";
    EQUIP_BONE.hair = "hair_point";
    EQUIP_BONE.eye = "eye_point";
    EQUIP_BONE.ear = "ear_point";
    EQUIP_BONE.neck = "neck_point";
    EQUIP_BONE.body = "body_point";
    EQUIP_BONE.arm = "arm_point";
    EQUIP_BONE.ring = "ring_point";
    EQUIP_BONE.belt = "belt_point";
    EQUIP_BONE.leg = "leg_point";
    EQUIP_BONE.foot = "foot_point";

    class PetMono extends Laya.Script3D {
        constructor() {
            super(...arguments);
            this.transform = null;
            this.rigidbody = null;
        }
        onAwake() {
            this.transform = this.owner.transform;
            this.rigidbody = this.owner.getComponent(Laya.Rigidbody3D);
            this.animator = this.owner.getComponent(Laya.Animator);
            this.rotation = new Laya.Vector3(0, 0, 0);
        }
        onStart() {
            this.mapBoneEquip = new Map();
            this.arrBoneTrans = [];
            for (let i = 1; i < 12; i++) {
                let boneName = BagData.ins.arrEquipBone[i];
                let bone = this.findChild(this.owner, boneName);
                if (bone) {
                    this.arrBoneTrans[i] = bone.transform;
                    console.log(boneName, bone.transform);
                }
            }
        }
        onUpdate() {
        }
        setGameUI(v) {
            this.gameUI = v;
        }
        onCollisionEnter(collision) {
        }
        show() {
            this.animator.play("show");
            Laya.timer.once(4000, this, () => {
                this.animator.play("idle");
            });
        }
        rotate(value) {
            this.rotation.setValue(0, value, 0);
            this.transform.rotate(this.rotation);
        }
        changeEquip(equipType, itemId) {
            let path = BagData.ins.getModelPath(itemId);
            Laya.loader.create(path, Laya.Handler.create(this, (obj) => {
                this.loadEquipFinish(obj);
            }, [[equipType, path]]));
        }
        loadEquipFinish(obj) {
            let equipType = obj[0];
            let path = obj[1];
            let equip = Laya.loader.getRes(path);
            equip = equip.clone();
            let bone = this.arrBoneTrans[equipType];
            if (bone) {
                bone.owner.parent.addChild(equip);
                equip.transform.localPosition = bone.localPosition;
                equip.transform.localRotation = bone.localRotation;
                let oldEquip = this.mapBoneEquip.get(equipType);
                if (oldEquip) {
                    oldEquip.parent.removeChild(oldEquip);
                }
                this.mapBoneEquip.set(equipType, equip);
                let originName = BagData.ins.arrEquipBone[equipType];
                originName = originName.replace("_point", "");
                let head = this.owner.getChildByName(originName);
                if (head) {
                    head.removeSelf();
                }
            }
        }
        findChild(sp, name) {
            if (sp.name == name)
                return sp;
            else
                return this._findChild(sp._children, name);
        }
        _findChild(spArr, name) {
            var arr = [];
            for (var i = 0; i < spArr.length; i++) {
                var child = spArr[i];
                if (child.name == name) {
                    return child;
                }
                else if (child.numChildren) {
                    arr = arr.concat(child._children);
                }
            }
            if (!arr.length)
                return null;
            return this._findChild(arr, name);
        }
    }

    class UserCtrl {
        constructor() {
            if (UserCtrl._ins != null)
                throw new Error("UserCtrl is single!");
        }
        static get ins() {
            if (!this._ins)
                UserCtrl._ins = new UserCtrl();
            return this._ins;
        }
        init() {
        }
        getUser() {
            var data = {
                user_id: HttpManager.ins.uid
            };
            console.log("get user, data=" + JSON.stringify(data));
            HttpManager.ins.sendMsg(HttpName.user, data, HttpMethod.GET, this.onComplete);
        }
        getBag() {
            var data = {
                user_id: HttpManager.ins.uid
            };
            console.log("lge bag, data=" + JSON.stringify(data));
            HttpManager.ins.sendMsg(HttpName.bag, data, HttpMethod.GET, this.onComplete);
        }
        saveEquip() {
            var data = { backpack_ids: [], screenshot: "" };
            for (let item of BagData.ins.arrEquip) {
                data.backpack_ids.push(item.id + "");
            }
            console.log("save euqip, data=" + JSON.stringify(data));
            HttpManager.ins.sendMsg(HttpName.save_equip, data, HttpMethod.PUT, this.onComplete);
        }
        clearEquip(code) {
            var data = { backpack_ids: [] };
            console.log("clear equip, data=" + JSON.stringify(data));
            HttpManager.ins.sendMsg(HttpName.save_equip, data, HttpMethod.PUT, this.onComplete);
        }
        getProduct(src) {
            var data = {
                src: src
            };
            console.log("get product, data=" + JSON.stringify(data));
            HttpManager.ins.sendMsg(HttpName.get_product, data, HttpMethod.GET, this.onComplete);
        }
        getMinRecord(month = "") {
            var data = {
                month: month
            };
            console.log("get minrecord, data=" + JSON.stringify(data));
            HttpManager.ins.sendMsg(HttpName.get_minrecord, data, HttpMethod.GET, this.onComplete);
        }
        getMinRank(rankType) {
            var data = {
                day: rankType == 1 ? 1 : 0
            };
            if (rankType == 1) {
                UserData.ins.arrMinRank1 = [];
            }
            else {
                UserData.ins.arrMinRank2 = [];
                UserData.ins.arrMinRank3 = [];
            }
            console.log("get minrank, data=" + JSON.stringify(data));
            HttpManager.ins.sendMsg(HttpName.get_minrank, data, HttpMethod.GET, this.onComplete);
        }
        onComplete(msg, method, e) {
            console.log("http消息成功！" + msg + ",json=" + JSON.stringify(e));
            if (e.code == -1) {
                return;
            }
            switch (msg) {
                case HttpName.token:
                    console.log(e);
                    break;
                case HttpName.get_minrecord:
                    UserData.ins.initMinRecord(e);
                    break;
                case HttpName.get_minrank:
                    UserData.ins.initMinRank(e);
                    break;
                default:
                    console.log("未定义http消息" + msg);
                    break;
            }
        }
    }

    class VideoCtrl {
        constructor() {
            if (VideoCtrl._ins != null)
                throw new Error("VideoCtrl is single!");
        }
        static get ins() {
            if (!this._ins)
                VideoCtrl._ins = new VideoCtrl();
            return this._ins;
        }
        init() {
        }
        addVideo(sp) {
            let divElement = Laya.Browser.createElement("div");
            divElement.className = "div";
            Laya.Browser.document.body.appendChild(divElement);
            Laya.Utils.fitDOMElementInArea(divElement, sp, 162, 0, 800, 600);
            this.divElement = divElement;
            let videoElement = Laya.Browser.createElement("video");
            videoElement.setAttribute("id", "myvideo");
            this.videoElement = videoElement;
            videoElement.controls = false;
            videoElement.autoPlay = false;
            videoElement.setAttribute("webkit-playsinline", true);
            videoElement.setAttribute("playsinline", true);
            videoElement.setAttribute("x5-video-player-type", 'h5');
            videoElement.setAttribute("x-webkit-airplay", true);
            videoElement.setAttribute("x5-video-orientation", "portrait");
            videoElement.setAttribute('preload', 'auto');
            videoElement.setAttribute('width', '100%');
            videoElement.setAttribute('height', '100%');
            videoElement.type = "vedio/mp4";
            videoElement.src = Define.CDN + "mp4/ad.mp4";
            divElement.appendChild(videoElement);
        }
        showVideo(isShow = true) {
            if (isShow) {
                this.divElement.style.display = "";
                this.videoElement.play();
            }
            else {
                this.videoElement.pause();
                this.divElement.style.display = "none";
            }
        }
        videoEvent() {
            this.videoElement.addEventListener("loadstart", () => {
            });
            this.videoElement.addEventListener("progress", () => {
            });
            this.videoElement.addEventListener("play", () => {
            });
            this.videoElement.addEventListener("pause", () => {
            });
            this.videoElement.addEventListener("seeking", () => {
            });
            this.videoElement.addEventListener("seeked", () => {
            });
            this.videoElement.addEventListener("waiting", () => {
            });
            this.videoElement.addEventListener("timeupdate", () => {
            });
            this.videoElement.addEventListener("ended", () => {
            });
            this.videoElement.addEventListener("error", () => {
            });
        }
    }

    class UserUI extends BaseWindow {
        constructor() {
            super(ui.user.UserUI);
            this.lastX = 0;
            this.menuIndex = 0;
            this.productId = "";
            this.pet_model_url = "3d/user/pet_0.lh";
            this.i = 0;
        }
        init() {
            this.ui = this.view;
            let base64 = new Base64Type("res/atlas/not/bg_main.jpg", "bg_main", "", "");
            SceneManager.ins.setBackground(base64);
            Laya.loader.create(Define.CDN + this.pet_model_url, Laya.Handler.create(this, this.onComplete));
            this.ui.lstBag.vScrollBarSkin = "";
            this.ui.lstBag.selectEnable = true;
            this.ui.lstBag.selectHandler = new Laya.Handler(this, this.onSelect);
            this.ui.lstBag.renderHandler = new Laya.Handler(this, this.updateItem);
            this.ui.spTip.visible = false;
        }
        onComplete() {
            var pet = Laya.Loader.getRes(Define.CDN + this.pet_model_url);
            console.log("加载到的宠物：", pet);
            GameCtrl.ins.pet = GameCtrl.ins.scene3D.addChild(pet);
            GameCtrl.ins.petMono = GameCtrl.ins.pet.addComponent(PetMono);
            GameCtrl.ins.pet.transform.localRotation = new Laya.Quaternion(0, 0, 0);
            this.loadEquip();
        }
        loadEquip() {
            for (let equip of BagData.ins.arrEquip) {
                GameCtrl.ins.petMono.changeEquip(equip.cfg.type, equip.itemId);
            }
        }
        open() {
            this.ui.spRotate.on(Laya.Event.MOUSE_DOWN, this, this.MOUSE_DOWN);
            EventManager.ins.on(CustomDefine.EVENT_EQUIP, this, this.EVENT_EQUIP);
            this.EVENT_EQUIP();
            EventManager.ins.on(CustomDefine.EVENT_BAG, this, this.EVENT_BAG);
            this.EVENT_BAG();
            EventManager.ins.on(CustomDefine.EVENT_SAVE_EQUIP, this, this.EVENT_SAVE_EQUIP);
            EventManager.ins.on(CustomDefine.EVENT_GET_PRODUCT, this, this.EVENT_GET_PRODUCT);
            this.sp = new Sprite();
            this.ui.addChild(this.sp);
            VideoCtrl.ins.addVideo(this.sp);
            GameCtrl.ins.camera.transform.translate(new Laya.Vector3(0, 0, 3));
            GameCtrl.ins.camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
        }
        MOUSE_DOWN(me) {
            this.lastX = me.stageX;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.MOUSE_MOVE);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.MOUSE_UP);
        }
        MOUSE_MOVE(me) {
            if (this.lastX < me.stageX) {
                GameCtrl.ins.petMono.rotate(0.1);
            }
            else {
                GameCtrl.ins.petMono.rotate(-0.1);
            }
            this.lastX = me.stageX;
        }
        MOUSE_UP() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.MOUSE_MOVE);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.MOUSE_UP);
        }
        close() {
            Laya.stage.off(Laya.Event.CLICK, this, this.stageClick);
            Laya.timer.clearAll(this);
        }
        viewClick(sp) {
            super.viewClick(sp);
            let spName = sp.name;
            if (spName.indexOf("btn_menu") >= 0) {
                this.menuIndex = Number(spName.replace("btn_menu", ""));
                this.clickMenu(this.menuIndex);
                return;
            }
            switch (spName) {
                case "btnSave":
                    this.ui.btnSave.visible = false;
                    UserCtrl.ins.saveEquip();
                    break;
                case "btnGoBack":
                    AppCtrl.ins.goBack();
                    break;
                case "btnShop":
                    AppCtrl.ins.goShop(this.productId);
                    break;
                case "btnClear":
                    VideoCtrl.ins.showVideo((this.i++ % 2) == 0);
                    break;
                default:
                    break;
            }
        }
        stageClick() {
        }
        EVENT_EQUIP() {
            for (let i = 1; i <= CustomDefine.PET_EQUIP_COUNT; i++) {
                this.setEquip(i);
            }
        }
        setEquip(type) {
            let equipData = BagData.ins.getEquipByType(type);
            let itemEquip = this.ui["itemEquip" + type];
            if (equipData) {
                itemEquip.imgIcon.skin = BagData.ins.getIconPath(equipData.id);
                itemEquip.txtName.text = equipData.cfg.name;
                if (GameCtrl.ins.petMono)
                    GameCtrl.ins.petMono.changeEquip(equipData.cfg.type, equipData.itemId);
            }
            else {
                itemEquip.imgIcon.skin = null;
                itemEquip.txtName.text = BagData.ins.arrEquipName[type];
            }
        }
        EVENT_BAG() {
            this.clickMenu(this.menuIndex);
        }
        clickMenu(menuIndex) {
            this.ui.lstBag.array = BagData.ins.getBagByType(menuIndex);
            for (let i = 0; i < 4; i++) {
                this.ui["btn_menu" + i].visible = i != menuIndex;
            }
            this.ui.imgMenuSel.x = this.ui["btn_menu" + menuIndex].x;
        }
        updateItem(cell, index) {
            let bag = this.ui.lstBag.array[index];
            cell.imgIcon.skin = BagData.ins.getIconPath(bag.id);
            cell.txtName.text = bag.cfg.name;
        }
        onSelect(index) {
            console.log("当前选择的索引：" + index);
            let bag = this.ui.lstBag.array[index];
            let equipData = BagData.ins.getEquipByType(bag.cfg.type);
            if (!equipData) {
                equipData = new Struct_Equip();
                BagData.ins.arrEquip[bag.id] = equipData;
            }
            equipData.id = bag.id;
            equipData.itemId = bag.itemId;
            equipData.cfg = DataConfig.ins.getItemById(bag.itemId);
            this.setEquip(bag.cfg.type);
        }
        EVENT_SAVE_EQUIP() {
            GameCtrl.ins.petMono.show();
            Laya.timer.once(3000, this, () => {
                this.ui.btnSave.visible = true;
            });
        }
        EVENT_GET_PRODUCT(obj) {
            this.ui.spTip.visible = true;
            this.ui.txtName.text = obj.data.name && obj.data.name.substring(0, 5);
            this.ui.txtDesc.text = obj.data.desc && obj.data.desc;
            this.productId = obj.data.spu_id;
        }
    }

    class MinRankUI extends BaseWindow {
        constructor() {
            super(ui.min.MinRankUI);
            this.menuIndex = 1;
            this.productId = 0;
            this.todayGold = 0;
            this.gold = 0;
            this.refreshTime = 600000;
        }
        init() {
            this.ui = this.view;
            this.ui.imgBg.skin = "res/atlas/not/bg_min_rank.png";
            this.ui.imgBg.x = 61;
            this.ui.imgBg.y = 292;
            this.ui.lst.vScrollBarSkin = "";
            this.ui.lst.selectEnable = true;
            this.ui.lst.selectHandler = new Laya.Handler(this, this.onSelect);
            this.ui.lst.renderHandler = new Laya.Handler(this, this.updateItem);
            this.ui.lst.array = [];
        }
        open() {
            super.open();
            GameCtrl.ins.addBlackBg(this, 0);
            EventManager.ins.on(CustomDefine.EVENT_MIN_RANK, this, this.EVENT_MIN_RANK);
            this.ui.txtName.text = UserData.ins.name;
            this.ui.imgHead.skin = UserData.ins.head;
            let localGold = LocalStorage.getItem(LOCKSTORAGEKEY.haveGold);
            this.todayGold = UserData.ins.todayGold = localGold ? parseFloat(localGold) : 0;
            this.showSelfGold(this.todayGold);
            this.ui.txtRank.visible = false;
            this.clickMenu(1);
        }
        close() {
            Laya.stage.off(Laya.Event.CLICK, this, this.stageClick);
            Laya.timer.clearAll(this);
            GameCtrl.ins.addBlackBg(null);
        }
        viewClick(sp) {
            super.viewClick(sp);
            let spName = sp.name;
            if (spName.indexOf("btn_menu") >= 0) {
                let mindex = Number(spName.replace("btn_menu", ""));
                this.clickMenu(mindex);
                GameCtrl.ins.playBtnSound();
                return;
            }
            switch (spName) {
                case "":
                    break;
                default:
                    break;
            }
        }
        stageClick() {
        }
        EVENT_MIN_RANK() {
            this.showSelfGold(0);
            let arrRank = UserData.ins.getMinRankByType(this.menuIndex);
            for (let i = 1; i < 4; i++) {
                this.ui["btn_menu" + i].visible = i != this.menuIndex;
            }
            this.ui.lst.array = arrRank;
            if (this.menuIndex == 1) {
                this.showSelfGold(this.todayGold);
            }
        }
        clickMenu(menuIndex) {
            this.menuIndex = menuIndex;
            this.ui.imgHead.visible = this.ui.txtName.visible = this.ui.imgGold.visible = this.ui.txtGold.visible = menuIndex == 1;
            if (menuIndex == 1) {
                UserCtrl.ins.getMinRank(1);
            }
            else {
                let arrRank = UserData.ins.getMinRankByType(menuIndex);
                if (arrRank) {
                    this.EVENT_MIN_RANK();
                }
                else {
                    UserCtrl.ins.getMinRank(menuIndex);
                }
            }
        }
        updateItem(cell, index) {
            let rank = this.ui.lst.array[index];
            cell.imgHead.skin = rank.head;
            cell.txtName.text = rank.name.length > 5 ? rank.name.substring(0, 5) + "..." : rank.name;
            cell.spPrize1.visible = false;
            cell.spPrize2.visible = false;
            cell.spPrize3.visible = false;
            cell.imgBox.visible = false;
            cell.txtLucky.visible = false;
            if (this.menuIndex > 1) {
                cell.imgBox.visible = cell.txtLucky.visible = rank.boxCount > 0;
                if (cell.imgBox.visible) {
                    if (rank.boxCount >= 10) {
                        cell.imgBox.skin = "mining/img_rank_box2.png";
                        cell.imgGe.visible = true;
                        cell.imgShi.skin = "mining/img_number" + (Math.floor(rank.boxCount / 10)) + ".png";
                        cell.imgGe.skin = "mining/img_number" + (rank.boxCount % 10) + ".png";
                    }
                    else {
                        cell.imgBox.skin = "mining/img_rank_box1.png";
                        cell.imgShi.skin = "mining/img_number" + rank.boxCount + ".png";
                        cell.imgGe.visible = false;
                    }
                    cell.txtLucky.text = "运气爆棚，挖到的实物奖品价值" + rank.boxValue + "凸币";
                }
                cell.txtGold.y = cell.imgGold.y = 30;
                cell.txtName.y = cell.height >> 1;
                if (rank.id == HttpManager.ins.uid) {
                    this.showSelfGold(rank.gold);
                }
            }
            else {
                let i = 0;
                for (let prize of rank.arrPrize) {
                    i++;
                    cell["spPrize" + i].visible = true;
                    cell["imgItem" + i].skin = prize.icon;
                    cell["imgStatus" + i].visible = false;
                }
                cell.txtName.y = cell.txtGold.y = cell.imgGold.y = cell.height >> 1;
            }
            cell.txtGold.text = rank.gold + "";
            this.sortX(cell);
        }
        sortX(cell) {
            let txtGoldX = cell.txtGold.x - cell.txtGold.displayWidth;
            cell.imgGold.x = txtGoldX - 34;
            cell.imgBox.x = cell.imgGold.x - cell.imgBox.width - 8;
            cell.spPrize1.x = cell.imgGold.x - cell.spPrize1.width - 4;
            cell.spPrize2.x = cell.spPrize1.x - cell.spPrize1.width - 4;
            cell.spPrize3.x = cell.spPrize2.x - cell.spPrize1.width - 4;
        }
        showSelfGold(gold) {
            this.ui.txtGold.text = gold + "";
            this.ui.imgGold.x = this.ui.txtGold.x - this.ui.txtGold.displayWidth - 5;
        }
        onSelect(index) {
            console.log("当前选择的索引：" + index);
            let rank = this.ui.lst.array[index];
        }
        refreshToday() {
            if (this.menuIndex == 1) {
                if (UserData.ins.selfMinRank && UserData.ins.selfMinRank.index > 1) {
                    let prevRank = UserData.ins.arrMinRank1[UserData.ins.selfMinRank.index - 2];
                    if (this.todayGold > prevRank.gold) {
                        UserData.ins.arrMinRank1 = null;
                        console.log("挖矿今日排行超越刷新", this.todayGold, prevRank.gold);
                    }
                }
                if (Laya.timer.currTimer - UserData.ins.lastMinGetTime > this.refreshTime) {
                    UserData.ins.arrMinRank1 = null;
                    UserData.ins.lastMinGetTime = Laya.timer.currTimer;
                    console.log("挖矿今日排行定时刷新");
                }
            }
        }
    }

    class MinRecordUI extends BaseWindow {
        constructor() {
            super(ui.min.MinRecordUI);
            this.menuIndex = 1;
            this.productId = "";
            this.lstHeight = 0;
            this.lstMargin = 0;
            this.lstExchangeOff = 0;
            this.lstRecordOff = 0;
        }
        init() {
            this.ui = this.view;
            this.ui.imgBg.skin = "res/atlas/not/bg_min_record.png";
            this.ui.imgBg.y = Define.DeviceH - 1340;
            this.ui.mask = null;
            this.lstHeight = this.ui.spRecord.y + this.ui.spRecord.height - this.ui.spExchange.y;
            this.lstMargin = this.ui.spRecord.y - this.ui.spExchange.y - this.ui.spExchange.height;
            this.lstExchangeOff = this.ui.imgExchangeBg.height - this.ui.lstExchange.height;
            this.lstRecordOff = this.ui.imgRecordBg.height - this.ui.lst.height;
            this.ui.lstExchange.selectEnable = true;
            this.ui.lstExchange.selectHandler = new Laya.Handler(this, this.onSelectExchange);
            this.ui.lstExchange.renderHandler = new Laya.Handler(this, this.updateItemExchange);
            this.ui.lst.vScrollBarSkin = "";
            this.ui.lst.selectEnable = true;
            this.ui.lst.selectHandler = new Laya.Handler(this, this.onSelect);
            this.ui.lst.renderHandler = new Laya.Handler(this, this.updateItem);
            this.ui.lst.array = [];
        }
        open() {
            super.open();
            GameCtrl.ins.addBlackBg(this, 1);
            EventManager.ins.on(CustomDefine.EVENT_MIN_RECORD, this, this.EVENT_MIN_RECORD);
            EventManager.ins.on(CustomDefine.EVENT_APP_CONVERT, this, this.EVENT_APP_CONVERT);
            this.ui.spClose.alpha = 0;
            this.ui.spClose.on(Laya.Event.CLICK, this, () => {
                UIManager.ins.closeWindow(CustomWindow.minRecord);
            });
            if (UserData.ins.isGetRecordToday) {
                this.EVENT_MIN_RECORD();
            }
            else {
                UserCtrl.ins.getMinRecord();
            }
        }
        close() {
            Laya.stage.off(Laya.Event.CLICK, this, this.stageClick);
            Laya.timer.clearAll(this);
            GameCtrl.ins.addBlackBg(null);
        }
        viewClick(sp) {
            super.viewClick(sp);
            let spName = sp.name;
            switch (spName) {
                case "btnShop":
                    AppCtrl.ins.goExchange(this.productId);
                    break;
                default:
                    break;
            }
        }
        stageClick() {
        }
        EVENT_APP_CONVERT(evt) {
            UserData.ins.isGetRecordToday = false;
            UserCtrl.ins.getMinRecord();
        }
        EVENT_MIN_RECORD(evt = null) {
            let arrPrize = UserData.ins.getMinRecordPrize();
            if (arrPrize && arrPrize.length > 0) {
                this.ui.lstExchange.height = arrPrize.length * 140 + (arrPrize.length - 1) * this.ui.lstExchange.spaceY;
                this.ui.imgExchangeBg.height = this.ui.lstExchange.height + this.lstExchangeOff;
                this.ui.spExchange.height = this.ui.imgExchangeBg.height;
                this.ui.lstExchange.array = arrPrize;
                this.ui.spExchange.visible = true;
                this.ui.spRecord.y = this.ui.spExchange.y + this.ui.spExchange.height + this.lstMargin;
                this.ui.spRecord.height = this.lstHeight - this.ui.spExchange.height - this.lstMargin;
                this.ui.imgRecordBg.height = this.ui.spRecord.height;
                this.ui.lst.height = this.ui.spRecord.height - this.lstRecordOff;
            }
            else {
                this.ui.spExchange.visible = false;
                this.ui.spRecord.y = this.ui.spExchange.y;
                this.ui.imgRecordBg.height = this.lstHeight;
                this.ui.maskRecord.height = this.lstHeight;
                this.ui.lst.height = this.lstHeight - this.lstRecordOff;
            }
            let arrMinRecord = UserData.ins.getMinRecord();
            if (arrMinRecord) {
                this.ui.lst.array = arrMinRecord;
                this.ui.lst.tweenTo(UserData.ins.minRecordMonthIndex, 200);
            }
            else {
                UserCtrl.ins.getMinRecord();
            }
            if (arrMinRecord && arrMinRecord.length > 0) {
                this.ui.imgNoRecord.visible = false;
            }
            else {
                this.ui.imgNoRecord.visible = true;
            }
            this.ui.imgNoRecord.y = this.ui.spRecord.y + (this.ui.imgRecordBg.height >> 1);
        }
        updateItem(cell, index) {
            let record = this.ui.lst.array[index];
            if (record.month_year != "") {
                cell.spRecordMonth.visible = true;
                cell.spRecord.visible = false;
                cell.txtMonth.text = record.month + "";
                if (UserData.ins.minRecordYear != record.year) {
                    cell.txtYear.text = record.year + "";
                    cell.txtYearWord.text = "月           年";
                }
                else {
                    cell.txtYear.text = "";
                    cell.txtYearWord.text = "月";
                }
                cell.txtYearWord.x = cell.txtMonth.displayWidth + 16;
                cell.txtYear.x = cell.txtYearWord.x + 44;
                cell.imgMenuStatus.x = cell.txtYearWord.x + cell.txtYearWord.displayWidth + 6.5;
                cell.imgMenuStatus.visible = cell.imgMenuBottom.visible = UserData.ins.minRecordMonth != record.month_year;
                cell.txtMonthGold.text = record.gold + "";
                cell.txtMonthBox.text = record.count + "";
            }
            else {
                cell.spRecordMonth.visible = false;
                cell.spRecord.visible = true;
                cell.txtMon.text = record.month + "";
                cell.txtDay.text = record.day + "";
                cell.txtMonWord.x = cell.txtMon.x + cell.txtMon.displayWidth + 7;
                cell.txtDay.x = cell.txtMonWord.x + cell.txtMonWord.displayWidth;
                cell.txtDayWord.x = cell.txtDay.x + cell.txtDay.displayWidth + 7;
                cell.txtTime.text = this.formatDate(record.time) + "";
                cell.txtCount.text = record.count + "";
                cell.txtHp.text = record.hp + "";
                cell.txtGold.text = record.gold + "";
                cell.spDesc.alpha = 0.6;
                cell.spPrize1.visible = false;
                cell.spPrize2.visible = false;
                cell.spPrize3.visible = false;
                let i = 0;
                if (record.arrPrize) {
                    for (let prize of record.arrPrize) {
                        i++;
                        cell["imgItem" + i].skin = prize.icon;
                        cell["imgStatus" + i].visible = prize.status == 2;
                        cell["spPrize" + i].visible = true;
                        if (prize.status == 1) {
                            cell["imgStatus" + i].visible = true;
                            cell["imgStatus" + i].getChildAt(0).visible = false;
                        }
                        else {
                            cell["imgStatus" + i].visible = false;
                        }
                    }
                }
            }
        }
        onSelect(index) {
            console.log("当前选择的索引：" + index);
            let record = this.ui.lst.array[index];
            if (record.month_year != "" && record.month_year != UserData.ins.minRecordMonth) {
                GameCtrl.ins.playBtnSound();
                UserData.ins.minRecordMonth = record.month_year;
                if (UserData.ins.isHaveMinRecordByMonth(record.month_year)) {
                    this.EVENT_MIN_RECORD();
                }
                else {
                    UserCtrl.ins.getMinRecord(record.month_year);
                }
            }
        }
        formatDate(time) {
            let timeStr = "";
            if (time >= 60) {
                timeStr = Math.floor(time / 60).toFixed(0) + "时";
            }
            timeStr += time % 60 + "分";
            return timeStr;
        }
        updateItemExchange(cell, index) {
            let prize = this.ui.lstExchange.array[index];
            cell.itemIcon.skin = prize.icon;
            cell.txtName.text = prize.desc.length > 18 ? prize.desc.substring(0, 18) + "..." : prize.desc;
            cell.txtPrice.text = "" + prize.price;
        }
        onSelectExchange(index) {
            console.log("当前选择的索引：" + index);
            if (index != -1) {
                let prize = this.ui.lstExchange.array[index];
                AppCtrl.ins.goExchange(prize.id + "");
                this.ui.lstExchange.selectedIndex = -1;
            }
        }
    }

    class MinDoorUI extends BaseWindow {
        constructor() {
            super(ui.min.MinDoorUI);
            this.list = [];
            this.scroolState = false;
            this.BOXOFFSET_X = 0;
            this.BOXOFFSET_Y = 5;
            this.BOXOFFSET_W = 757;
            this.BOXOFFSET_H = 105;
            this.ui = this.view;
            this.ui.come.on(Laya.Event.CLICK, this, this.onCome);
            EventManager.ins.on(CustomDefine.EVENT_MIN_NOTICE, this, this.EVENT_MIN_NOTICE);
        }
        onInit() {
            AppCtrl.ins.changeAppMenuBg("mining/img_door_menu.jpg");
            Laya.timer.once(500, this, () => {
                PublicNoticeMgr.ins().onInto(this.ui.panel, PublicNoticeMgr.ins().oData);
            });
        }
        onCome() {
            HttpManager.ins.sendMsg(HttpName.TICKETINFO, null, HttpMethod.GET, (msg, method, e) => {
                if (e.data.status == 2 || e.data.status == 4 || e.data.status == 0) {
                    this._data = e.data;
                    LayerManager.ins.addChild(UIManager.ins.getWindow(CustomWindow.minDoorTip).ui, LayerName.ui);
                    UIManager.ins.getWindow(CustomWindow.minDoorTip).sendData(this._data);
                }
            });
        }
        onOut() {
            MinScene.ins.onDestory();
            UIManager.ins.closeWindow(CustomWindow.minDoor);
            AppCtrl.ins.close();
        }
        refresh(data) {
            if (!data || data.length <= 0)
                return;
            let _i = 0;
            data.forEach((element, i) => {
                if (this.list.indexOf(element.id) == -1) {
                    this.createUI(element, i);
                    _i = i;
                }
            });
            data.forEach((element, i) => {
                if (this.list.indexOf(element.id) == -1) {
                    _i += 1;
                    this.createUI(element, _i);
                    this.list.push(element.id);
                }
            });
            if (this.scroolState)
                return;
            Laya.timer.frameLoop(1, this, () => {
                if (this.ui.view_p.height > 0) {
                    this.startScroll();
                    this.scroolState = true;
                    Laya.timer.clearAll(this);
                }
            });
        }
        createUI(data, index) {
            Laya.loader.load("prefab/Box1.json", Laya.Handler.create(this, function (pref) {
                var playpre = new Laya.Prefab();
                playpre.json = pref;
                var obj = Laya.Pool.getItemByCreateFun("box2Item", playpre.create, playpre);
                let t = obj.getChildByName("lb_treasure");
                let p = obj.getChildByName("lb_price");
                let i = obj.getChildByName("img_treasure");
                let l = obj.getChildByName("img_logo");
                let off = obj.getChildByName("img_off");
                let userID = parseInt(data.user_id);
                i.skin = data.avatar;
                p.text = data.price;
                t.text = data.desc;
                t.alpha = 0.85;
                p.alpha = 0.85;
                l.skin = data.brand_avatar;
                if (userID > 0) {
                    off.skin = "mining/img_take_off.png";
                }
                obj.width = this.BOXOFFSET_W;
                obj.height = this.BOXOFFSET_H;
                obj.x = this.BOXOFFSET_X;
                obj.y = this.BOXOFFSET_Y + this.BOXOFFSET_H * index + (index * 40);
                this.ui.view_p.addChild(obj);
                obj.offAll();
                obj.on(Laya.Event.CLICK, this, this.onSelect, [data]);
            }));
        }
        startScroll() {
            Laya.Tween.clearAll(this);
            Laya.Tween.to(this.ui.view_p, { y: -(this.ui.view_p.height / 2) }, (this.ui.view_p.height * 15 * 0.9), null, Laya.Handler.create(this, this.complete));
        }
        complete() {
            Laya.Tween.clearAll(this);
            this.ui.view_p.y = 16;
            this.startScroll();
        }
        onCreateVagueBG() {
            var blurFilter = new Laya.BlurFilter();
            blurFilter.strength = 10;
            this.ui.bg.filters = [blurFilter];
        }
        onSelect(data) {
            new bagContentGood(BAGCONTENTGOODTYPE.treasure, this.ui, data);
        }
        EVENT_MIN_NOTICE(evt) {
            let isNotice = evt.data;
        }
    }

    class MinDoorTip extends BaseWindow {
        constructor() {
            super(ui.min.MinDoorTipUI);
            this.ui = this.view;
            this.onInit();
        }
        onInit() {
            this.ui.btn_q.on(Laya.Event.CLICK, this, this.onBtnq);
            this.ui.btn_s.on(Laya.Event.CLICK, this, this.onBtns);
            this.ui.out.on(Laya.Event.CLICK, this, this.onTomorrow);
        }
        onDestroy() {
        }
        onBtnq() {
            LayerManager.ins.removeChild(CustomWindow.minDoor, LayerName.scene);
            LayerManager.ins.removeChild(this.ui, LayerName.ui);
            EventManager.ins.event(CustomDefine.EVENT_OPENLED, this.ui);
        }
        onBtns() {
            if (this._data.status == 3) {
                LayerManager.ins.removeChild(this.ui, LayerName.ui);
                EventManager.ins.event(CustomDefine.EVENT_CLOSELED, this.ui);
                return;
            }
            HttpManager.ins.sendMsg(HttpName.BUYTICKET, null, HttpMethod.POST, (msg, method, e) => {
                if (e.code == 0) {
                    LayerManager.ins.removeChild(UIManager.ins.getWindow(CustomWindow.minDoor).ui, LayerName.scene);
                    LayerManager.ins.removeChild(this.ui, LayerName.ui);
                    MinScene.ins.init();
                }
                else {
                    this.ui._html.visible = false;
                    this.ui.goldTip.text = e.msg;
                    this.ui.goldTip.visible = true;
                }
            });
        }
        onTomorrow() {
            LayerManager.ins.removeChild(this.ui, LayerName.ui);
            EventManager.ins.event(CustomDefine.EVENT_OPENLED, this.ui);
        }
        sendData(data) {
            this._data = data;
            EventManager.ins.event(CustomDefine.EVENT_CLOSELED, this.ui);
            if (data.status == 2 || data.status == 4) {
                this.ui.tip2.visible = true;
            }
            else if (data.status == 0) {
                this.ui.tip1.visible = true;
                let html = "<p>您是否花费<span>&nbsp;</span><span style='color:#FDC001'>" + data.fare + "凸币<span>&nbsp;</span></span> 进入矿洞挖矿</p>";
                this.ui._html.style.fontSize = 30;
                this.ui._html.style.color = "#fff";
                this.ui._html.style.wordWrap = false;
                this.ui._html.x = 96;
                this.ui._html.y = 484;
                this.ui._html.innerHTML = html;
                this.ui._html.visible = true;
                this.ui.goldTip.visible = false;
            }
            else if (data.status == 3) {
                this.ui.goldTip.text = "没有体力值了";
                this.ui.tip1.visible = true;
            }
        }
        onCreateVagueBG() {
            var blurFilter = new Laya.BlurFilter();
            blurFilter.strength = 10;
            this.ui.bg.filters = [blurFilter];
        }
    }

    class CustomWindow {
        constructor() {
        }
    }
    CustomWindow.loading = new UIType("loading", LoadingUI);
    CustomWindow.game = new UIType("game", UserUI);
    CustomWindow.user = new UIType("user", UserUI);
    CustomWindow.min = new UIType("min", MinUI);
    CustomWindow.minRank = new UIType("minRank", MinRankUI);
    CustomWindow.minRecord = new UIType("minRecord", MinRecordUI);
    CustomWindow.minDoor = new UIType("minDoor", MinDoorUI);
    CustomWindow.minDoorTip = new UIType("minDoorTip", MinDoorTip);

    class Test {
        constructor() {
            this.isDebug = false;
            if (Test._ins != null)
                throw new Error("Test is single!");
        }
        static get ins() {
            if (!this._ins)
                Test._ins = new Test();
            return this._ins;
        }
        init() {
            if (CustomDefine.environment == Environment.DEBUG || CustomDefine.environment == Environment.TEST || this.isDebug) {
                this.addVersionWord();
            }
            Laya.Stat.show(0, 0);
            if (!this.isDebug) {
                return;
            }
            Laya.Stat.show(0, 0);
            Laya.SoundManager.autoStopMusic = true;
            Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
            Laya.timer.once(2000, this, () => {
                this.initMinNotice();
            });
            Laya.timer.once(10000, this, () => {
            });
        }
        onKeyDown(e) {
            if (e.keyCode == 49) {
                HttpManager.ins.sendMsg(HttpName.MININIT, { user_id: HttpManager.ins.uid }, HttpMethod.POST, (msg, method, e) => {
                    console.log("初始化矿洞", JSON.stringify(e));
                    HttpManager.ins.sendMsg("/mining/v2/white/model/run", { time: 5 }, HttpMethod.POST, (msg, method, e) => {
                        console.log("初始化模型", JSON.stringify(e));
                    });
                });
            }
            if (e.keyCode == 98) {
                HttpManager.ins.sendMsg(HttpName.MININIT, { user_id: HttpManager.ins.uid }, HttpMethod.POST, (msg, method, e) => {
                    console.log("仅仅初始化矿洞", JSON.stringify(e));
                });
            }
            if (e.keyCode == 99) {
                UIManager.ins.openWindow(CustomWindow.minRank);
            }
        }
        addVersionWord() {
            let a = new Laya.Label();
            a.y = 700;
            a.text = "751831";
            a.fontSize = 60;
            a.color = "#ffff00";
            Laya.stage.addChild(a);
        }
        getToken() {
            var data = {
                phone: "15649868888",
                password: "tw123456"
            };
            HttpManager.ins.keyHeaders = null;
            console.log("get token, data=" + JSON.stringify(data));
            HttpManager.ins.sendMsg(HttpName.token, data, HttpMethod.POST, (msg, method, e) => {
                console.log("http消息成功！" + msg + ",json=" + JSON.stringify(e));
            });
        }
        initBagData() {
            let tb = { table: { Cfg_Item: [] } };
            let cfg = new Cfg_Item();
            cfg = new Cfg_Item();
            cfg.id = 1;
            cfg.name = "帽子1";
            cfg.type = 1;
            cfg.type_index = 1;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 2;
            cfg.name = "帽子2";
            cfg.type = 1;
            cfg.type_index = 2;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 3;
            cfg.name = "帽子3";
            cfg.type = 1;
            cfg.type_index = 3;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 4;
            cfg.name = "手镯1";
            cfg.type = 2;
            cfg.type_index = 1;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 5;
            cfg.name = "手镯2";
            cfg.type = 2;
            cfg.type_index = 2;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 6;
            cfg.name = "手镯3";
            cfg.type = 2;
            cfg.type_index = 3;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 7;
            cfg.name = "上衣1";
            cfg.type = 3;
            cfg.type_index = 1;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 8;
            cfg.name = "上衣2";
            cfg.type = 3;
            cfg.type_index = 2;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 9;
            cfg.name = "上衣3";
            cfg.type = 3;
            cfg.type_index = 3;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 10;
            cfg.name = "裤子1";
            cfg.type = 4;
            cfg.type_index = 1;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 11;
            cfg.name = "裤子2";
            cfg.type = 4;
            cfg.type_index = 2;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            cfg = new Cfg_Item();
            cfg.id = 12;
            cfg.name = "裤子3";
            cfg.type = 4;
            cfg.type_index = 3;
            cfg.spuid = 0;
            tb.table.Cfg_Item.push(cfg);
            DataConfig.ins.init(tb);
            let json = { data: [] };
            let bag = new Struct_Bag();
            for (let i = 1; i <= 12; i++) {
                bag = new Struct_Bag();
                bag.id = i;
                bag.itemId = i;
                json.data.push(bag);
            }
            BagData.ins.initBag(json);
            json = { data: [] };
            let equip = new Struct_Equip();
            equip = new Struct_Equip();
            equip.id = 1;
            equip.itemId = 3;
            json.data.push(equip);
            equip = new Struct_Equip();
            equip.id = 2;
            equip.itemId = 4;
            json.data.push(equip);
            BagData.ins.initEquip(json);
        }
        initMiningRecord() {
            let json = { data: [] };
            let month_list = [];
            json.data.month_list = month_list;
            month_list.push({ month: "202105", coin_count: 500, treasure_count: 0 });
            month_list.push({ month: "202104", coin_count: 400, treasure_count: 1 });
            month_list.push({ month: "202103", coin_count: 300, treasure_count: 3 });
            month_list.push({ month: "202102", coin_count: 300, treasure_count: 3 });
            month_list.push({ month: "202101", coin_count: 300, treasure_count: 3 });
            month_list.push({ month: "202012", coin_count: 300, treasure_count: 3 });
            month_list.push({ month: "202011", coin_count: 300, treasure_count: 3 });
            month_list.push({ month: "202010", coin_count: 300, treasure_count: 3 });
            month_list.push({ month: "202009", coin_count: 300, treasure_count: 3 });
            month_list.push({ month: "202008", coin_count: 300, treasure_count: 3 });
            month_list.push({ month: "202007", coin_count: 300, treasure_count: 3 });
            let day_list = [];
            json.data.day_list = day_list;
            for (let i = 1; i <= 10; i++) {
                let struct = new Object();
                struct.id = i;
                struct.month = "202105";
                struct.day = 11 - i;
                let rand = Math.random();
                struct.count = rand < 0.03 ? 3 : rand < 0.1 ? 2 : rand < 0.3 ? 1 : 0;
                struct.reward = (31 - i) * 100;
                struct.duration = i * 200;
                struct.expended = 100;
                let treasures = [];
                struct.treasures = treasures;
                if (i == 1) {
                    let prize = new Object();
                    prize.id = 1;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.exchanged = 0;
                    treasures.push(prize);
                    prize = new Object();
                    prize.id = 2;
                    prize.avatar = Define.CDN + "min/box.png";
                    prize.exchanged = 1;
                    treasures.push(prize);
                }
                else if (i == 2) {
                }
                day_list.push(struct);
            }
            let un_exchanges = [];
            json.data.un_exchanges = un_exchanges;
            let exchanges;
            exchanges = new Object();
            exchanges.id = 2;
            exchanges.avatar = Define.CDN + "min/box.png";
            exchanges.status = 0;
            exchanges.desc = "天下无敌冲锋衣";
            exchanges.price = 999;
            un_exchanges.push(exchanges);
            exchanges = new Object();
            exchanges.id = 3;
            exchanges.avatar = Define.CDN + "min/box.png";
            exchanges.status = 0;
            exchanges.desc = "天下无敌";
            exchanges.price = 888;
            un_exchanges.push(exchanges);
            UserData.ins.initMinRecord(json);
        }
        initMiningRank() {
            let json = { data: { day: [], week: [], month: [] }, rankType: 1 };
            for (let i = 1; i <= 30; i++) {
                let struct = new Object();
                struct.user_id = i;
                struct.user_name = "andy" + i;
                struct.user_avatar = Define.CDN + "min/head1.jpg";
                struct.reward = (31 - i) * 100;
                let treasures = [];
                struct.treasure_avatars = treasures;
                if (i % 4 == 1) {
                    let prize = new Object();
                    prize.id = 1;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.coin_value = 100;
                    treasures.push(prize);
                    prize = new Object();
                    prize.id = 2;
                    prize.avatar = Define.CDN + "min/box.png";
                    prize.coin_value = 200;
                    treasures.push(prize);
                }
                else if (i % 4 == 2) {
                    let prize = new Object();
                    prize.id = 1;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.coin_value = 100;
                    treasures.push(prize);
                    prize = new Object();
                    prize.id = 2;
                    prize.avatar = Define.CDN + "min/box.png";
                    prize.coin_value = 200;
                    treasures.push(prize);
                    prize.id = 3;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.coin_value = 100;
                    treasures.push(prize);
                }
                else if (i % 4 == 3) {
                    let prize = new Object();
                    prize.id = 1;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.coin_value = 100;
                    treasures.push(prize);
                }
                else {
                }
                json.data.day.push(struct);
            }
            for (let i = 1; i <= 5; i++) {
                let struct = new Object();
                struct.user_id = i;
                struct.user_name = "andy" + i;
                struct.user_avatar = Define.CDN + "min/head1.jpg";
                struct.reward = (31 - i) * 100;
                let treasures = [];
                struct.treasure_avatars = treasures;
                if (i % 4 == 1) {
                    let prize = new Object();
                    prize.id = 1;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.coin_value = 100;
                    treasures.push(prize);
                    prize = new Object();
                    prize.id = 2;
                    prize.avatar = Define.CDN + "min/box.png";
                    prize.coin_value = 200;
                    treasures.push(prize);
                }
                else if (i % 4 == 2) {
                    let prize = new Object();
                    prize.id = 1;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.coin_value = 100;
                    treasures.push(prize);
                    prize = new Object();
                    prize.id = 2;
                    prize.avatar = Define.CDN + "min/box.png";
                    prize.coin_value = 200;
                    treasures.push(prize);
                    prize.id = 3;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.coin_value = 100;
                    treasures.push(prize);
                }
                else if (i % 4 == 3) {
                    let prize = new Object();
                    prize.id = 1;
                    prize.avatar = Define.CDN + "min/clothes1.png";
                    prize.coin_value = 100;
                    treasures.push(prize);
                }
                else {
                }
                json.data.week.push(struct);
            }
            UserData.ins.initMinRank(json);
        }
        initMinNotice() {
            let json = { type: "mining", data: {} };
            let data = {};
            data.user_id = "1001";
            data.user_name = "天道酬勤";
            data.user_avatar = "game/head.png";
            data.treasure_id = "100001";
            data.treasure_avatar = "game/head.png";
            data.treasure_desc = "FAVS2案发时大幅度发大水发声法时发断";
            data.coin = 100;
            AppCtrl.ins.appNotice("mining", JSON.stringify(data));
        }
    }

    class HttpMethod {
    }
    HttpMethod.POST = "post";
    HttpMethod.PUT = "put";
    HttpMethod.GET = "get";
    class HttpManager {
        constructor() {
            this.token = "";
            this.uid = "";
            if (HttpManager._ins != null)
                throw new Error("HttpManager is single!");
        }
        static get ins() {
            if (!this._ins)
                HttpManager._ins = new HttpManager();
            return this._ins;
        }
        init() {
            if (Test.ins.isDebug) {
                console.log("调试环境");
                this.token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNDExNjE5MzY0Mjk3MjY5MjQ4In0.eLRHb-NLqAAzfrH0Aw1UeJ3W1Pwu760-hXYs8naKnK5vnxWYkhQ8wXS2UreYzDW9Ns8xNcaZ304n_NGGcfFcmDQQfV5RGpxzcguor9COlkzWtrAj5ML8L_12mZO8DC5YBVs03Zxq3Q0gj4kItObNzXgbHSyMViaxkbAP7-dVdcM";
                this.uid = "1411619364297269248";
                AppCtrl.ins.type = "1";
                Define.CDN = "res/";
                Define.serverHttp = "http://dev.api.toowow.cn:30008";
                UserData.ins.head = "game/head.png";
                UserData.ins.sex = 0;
                UserData.ins.name = "Andy";
                "奥里给";
                UserData.ins.gold = 100000;
            }
            else {
                console.log("APP环境");
                if (CustomDefine.environment == Environment.RELEASE) {
                    Define.CDN = "http://prod.static-webgame.toowow.cn";
                    Define.serverHttp = "https://api.toowow.cn";
                }
                else if (CustomDefine.environment == Environment.PRE) {
                    Define.CDN = "res/",
                        Define.serverHttp = "http://pre.api.toowow.cn";
                }
                else if (CustomDefine.environment == Environment.TEST) {
                    Define.CDN = "res/";
                    Define.serverHttp = "http://test.api.toowow.cn:30010";
                }
                else {
                    Define.CDN = "http://dev.newpet.toowow.cn:8808/pet/res/";
                    Define.serverHttp = "http://dev.api.toowow.cn:30008";
                }
            }
            console.log("res cdn:", Define.CDN, "server:", Define.serverHttp);
            this.keyHeaders = [
                "Content-Type", "application/json;charset=utf8;",
                "token", this.token
            ];
        }
        sendMsg(msg, data, method = HttpMethod.GET, callBack = null) {
            var xhr = new Laya.HttpRequest();
            xhr.http.timeout = 10000;
            xhr.once(Laya.Event.COMPLETE, this, callBack, [msg, method]);
            xhr.once(Laya.Event.ERROR, this, this.onError, [msg, method]);
            if (method == HttpMethod.GET) {
                let param = "";
                if (data) {
                    for (let key of Object.keys(data)) {
                        param += key + "=" + data[key];
                    }
                }
                msg += "?" + param;
            }
            data = JSON.stringify(data);
            xhr.send(Define.serverHttp + msg, data, method, "json", this.keyHeaders);
        }
        onError(msg, e) {
            console.log("http消息失败！" + msg + ",json=" + JSON.stringify(e));
            EventManager.ins.event(CustomDefine.HTTP_SEND_ERROR, msg);
            if (msg == HttpName.TICKETINFO) {
                AppCtrl.ins.loadError();
            }
            else {
                MsgCtrl.ins.showMsg("矿洞太火爆了，请稍后再试", "确   定", () => {
                });
            }
        }
        getQueryVariable(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
            return "";
        }
    }
    class HttpName {
    }
    HttpName.token = "/account/v2/white/login/password";
    HttpName.bag = "/pet/v2/backpack";
    HttpName.user = "/pet/v2/user";
    HttpName.save_equip = "/pet/v2/user";
    HttpName.get_product = "/pet/v2/spu";
    HttpName.get_minrank = "/mining/v2/white/leaderboard";
    HttpName.get_minrecord = "/mining/v2/reward";
    HttpName.mine_addup = "/mining/v2/white/mine/add_up";
    HttpName.ASSIGN = "/mining/v2/white/assign";
    HttpName.MININIT = "/mining/v2/white/mine/init";
    HttpName.BUYTICKET = "/mining/v2/ticket";
    HttpName.MININFO = "/mining/v2/info";
    HttpName.MINBEHAVIOUR = "/mining/v2/mining";
    HttpName.TICKETINFO = "/mining/v2/white/ticket";

    class LogCtrl {
        constructor() {
            this.btnW = 150;
            this.btmH = 50;
            this.prevY = 0;
            this.msg = "";
            this.msgAll = "";
            this.msgCount = 0;
            this.isAll = false;
            if (LogCtrl._ins != null)
                throw new Error("LogCtrl is single!");
            this.arrMsg = [];
        }
        static get ins() {
            if (!this._ins)
                LogCtrl._ins = new LogCtrl();
            return this._ins;
        }
        resetLog() {
            if (!this.isCanLog())
                return;
            console.log = (...data) => {
                this.log(data);
            };
        }
        init() {
            if (!this.isCanLog())
                return;
            this.btnSkin = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAASAAD/4QNOaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjlBREM0MzY3RDk5NzExRUJBNDQ4RDE0Q0Y3OENEQTI0IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjlBREM0MzY2RDk5NzExRUJBNDQ4RDE0Q0Y3OENEQTI0IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhjMmE1ODQ4LTEzYWMtMmE0Ny05YTZjLWI3YWNiYTFlMDRkZCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhjMmE1ODQ4LTEzYWMtMmE0Ny05YTZjLWI3YWNiYTFlMDRkZCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABMPDxcQFyQVFSQtIxwjLSojIiIjKjgwMDAwMDhCOzs7Ozs7QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkIBFBcXHRkdIxgYIzEjHSMxQDEnJzFAQkA8MDxAQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQv/AABEIAAUABQMBIgACEQEDEQH/xABMAAEBAAAAAAAAAAAAAAAAAAAAAwEBAQAAAAAAAAAAAAAAAAAAAQIQAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJgBT//Z";
            this.btn = this.createBtn("日志", Define.canvasWidth - this.btnW, Define.DeviceH - 300, this.showConsole, [true]);
            Global.root_top.addChild(this.btn);
            this.ui = new Laya.Sprite();
            this.ui.graphics.drawRect(0, 0, Define.canvasWidth, Define.DeviceH, "#ffffff");
            Global.root_top.addChild(this.ui);
            this.ui.visible = false;
            let btnY = Define.DeviceH - 300;
            this.btnMsgAll = this.createBtn("所有", 0, btnY, this.showLog, ["btnMsgAll"]);
            this.ui.addChild(this.btnMsgAll);
            this.btnMsg = this.createBtn("部分", this.btnMsgAll.x + this.btnW + 10, btnY, this.showLog, ["btnMsg"]);
            this.ui.addChild(this.btnMsg);
            this.btnClear = this.createBtn("清理", this.btnMsg.x + this.btnW + 10, btnY, this.showLog, ["btnClear"]);
            this.ui.addChild(this.btnClear);
            this.btnHide = this.createBtn("隐藏", this.btnClear.x + this.btnW + 10, btnY, this.showConsole, [false]);
            this.ui.addChild(this.btnHide);
            this.txt = new Laya.Text();
            this.txt.color = "#000000";
            this.txt.font = "SimHei";
            this.txt.fontSize = 40;
            this.txt.wordWrap = true;
            this.txt.mouseEnabled = true;
            this.txt.overflow = Laya.Text.SCROLL;
            this.txt.x = 50;
            this.txt.size(Define.canvasWidth - this.txt.x * 2, this.btnClear.y - 50);
            this.txt.on(Laya.Event.MOUSE_DOWN, this, this.startScrollText);
            this.ui.addChild(this.txt);
        }
        createBtn(lbl, x, y, func, funcParam = null) {
            let btn = new Laya.Button(this.btnSkin, lbl);
            btn.width = this.btnW;
            btn.height = this.btmH;
            btn.labelSize = 40;
            btn.x = x;
            btn.y = y;
            btn.on(Laya.Event.CLICK, this, func, funcParam);
            return btn;
        }
        showConsole(v) {
            this.ui.visible = v;
        }
        showLog(name, evt) {
            let msg = name == "btnMsgAll" ? this.msgAll : name == "btnMsg" ? this.msg : "";
            this.txt.text = msg;
        }
        log(...data) {
            if (this.isCanLog()) {
                let msg = data.toString();
                this.msgAll += msg;
                this.arrMsg.push(msg);
                if (this.arrMsg.length > 20) {
                    this.arrMsg.shift();
                }
                this.msg = this.arrMsg.toString();
                if (this.txt)
                    this.txt.text += msg + "\n\n";
            }
        }
        startScrollText() {
            this.prevY = this.txt.mouseY;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.scrollText);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.finishScroll);
        }
        finishScroll() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.scrollText);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.finishScroll);
        }
        scrollText() {
            var nowY = this.txt.mouseY;
            this.txt.scrollY += this.prevY - nowY;
            this.prevY = nowY;
        }
        isCanLog() {
            return false;
            if (CustomDefine.environment == Environment.DEBUG || CustomDefine.environment == Environment.TEST) {
                return true;
            }
            return false;
        }
    }

    class AppCtrl {
        constructor() {
            this.type = "";
            this.appMenuBgHeightMax = 166;
            this.appPixelRatio = 0;
            this.appMenuBgHeight = 166;
            this.isHomePage = false;
            if (AppCtrl._ins != null)
                throw new Error("AppCtrl is single!");
            this.init();
        }
        static get ins() {
            if (!this._ins)
                AppCtrl._ins = new AppCtrl();
            return this._ins;
        }
        init() {
            Laya.Browser.window.openGameSound = (open) => {
                this.openGameSound(open);
            };
            Laya.Browser.window.appNotice = (type, param) => {
                this.appNotice(type, param);
            };
            Laya.Browser.window.appConvert = (spuId) => {
                this.appConvert(spuId);
            };
            Laya.Browser.window.isAlive = () => {
                return true;
            };
        }
        openGameSound(open) {
            console.log("App主动调用 openGameSound:", open);
            SoundManager.ins.setOn(open);
            if (open) {
                Laya.stage.frameRate = Stage.FRAME_SLOW;
                Laya.stage.timer.once(200, this, () => {
                });
                EventManager.ins.event(CustomDefine.EVENT_FOUCE, true);
            }
            else {
                EventManager.ins.event(CustomDefine.EVENT_FOUCE, false);
                Laya.stage.frameRate = Stage.FRAME_SLEEP;
            }
        }
        appNotice(type, param) {
            console.log("App主动调用 appNotice:", type, param);
            if (type) {
                let data = JSON.parse(param);
                switch (type) {
                    case "mining":
                        this.temporaryNotice(data);
                        break;
                    default:
                        break;
                }
            }
        }
        temporaryNotice(param) {
            if (!param)
                return;
            let e = {
                type: NOTICETYPE.noticeContnet,
                runTime: 4,
                runType: RUNTYPE.right,
                stopTime: 0,
                temporary: true,
                head: param.user_avatar,
                userName: param.user_name,
                icon: param.coin,
                treasurer_avatar: param.treasure_avatar,
                itemName: param.treasure_desc
            };
            console.log("添加新的消息", e);
            PublicNoticeMgr.ins().onCreateBaseNoticeItem(e, null);
        }
        appConvert(spuId) {
            console.log("App主动调用 appConvert:", spuId);
            EventManager.ins.event(CustomDefine.EVENT_APP_CONVERT, spuId);
        }
        isInApp(isShowWord = true) {
            if (!Laya.Browser.window.flutter_inappwebview) {
                if (isShowWord)
                    TipManager.ins.showWord("请在凸物App端关闭！");
                return false;
            }
            return true;
        }
        checkFlutterReady(callBack) {
            Laya.Browser.window.addEventListener("flutterInAppWebViewPlatformReady", (event) => {
                this.flutterReady(callBack);
            });
            this.flutterReady(callBack);
            Laya.timer.once(500, this, () => {
                if (!this.isInApp(false)) {
                    Test.ins.isDebug = true;
                    Define.width = Laya.Browser.width;
                    Define.height = Laya.Browser.height;
                    callBack();
                    return;
                }
            });
        }
        flutterReady(callBack) {
            if (!this.isInApp(false))
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('systemInfo').then((result) => {
                this.appSystemInfo = result;
                this.appPixelRatio = result.pixelRatio;
                Define.width = result.width * this.appPixelRatio;
                Define.height = result.height * this.appPixelRatio;
                let appBar = result.appBar;
                let navigationBar = result.navigationBar * this.appPixelRatio;
                navigationBar = navigationBar / (Define.height / Define.DeviceH);
                this.appMenuBgHeight = navigationBar > this.appMenuBgHeightMax ? this.appMenuBgHeightMax : navigationBar;
                this.isHomePage = result.isHomePage;
            });
            Laya.Browser.window.flutter_inappwebview.callHandler('userInfo').then((result) => {
                this.setUserInfo(result);
                console.log("调用systemInfo：", JSON.stringify(this.appSystemInfo), "App导航菜单高度：", this.appMenuBgHeight);
                callBack();
            });
        }
        setUserInfo(obj) {
            console.log(JSON.stringify(obj));
            HttpManager.ins.token = obj.userToken;
            HttpManager.ins.uid = obj.userId;
            UserData.ins.name = obj.userName;
            UserData.ins.head = obj.userAvatar;
            UserData.ins.sex = Number(obj.userSex);
            UserData.ins.identity = obj.userIdentity;
            CustomDefine.appVersion = obj.appVersion;
            CustomDefine.environment = obj.environment.replace("Environment.", "");
            LogCtrl.ins.resetLog();
            this.type = ModuleType.MIN;
            if (CustomDefine.environment == Environment.DEBUG) {
            }
            console.log("App传入uid：", obj.userId, "sex:", obj.userSex, "type", this.type, "environment:", CustomDefine.environment, "token：", HttpManager.ins.token);
        }
        addTopCloseButton() {
            let btnClose = new Laya.Button("loading/btn_goback.png");
            btnClose.x = Define.DeviceW - 70;
            btnClose.y = 10;
            btnClose.label = "";
            btnClose.stateNum = 1;
            LayerManager.ins.addChild(btnClose, LayerName.top);
            btnClose.on(Laya.Event.MOUSE_DOWN, this, () => {
                AppCtrl.ins.goBack();
            });
        }
        goBack() {
            console.log("调用flutter_inappwebview.goBack");
            if (!this.isInApp())
                return;
            SoundManager.ins.setOn(false);
            Laya.Browser.window.flutter_inappwebview.callHandler('goBack');
        }
        close() {
            console.log("调用flutter_inappwebview.close");
            if (!this.isInApp())
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('close');
        }
        goShop(productId) {
            console.log("调用flutter_inappwebview.productDetail", productId);
            if (!this.isInApp())
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('productDetail', { spuId: productId });
        }
        goExchange(productId) {
            console.log("调用flutter_inappwebview.exchangeTreasure", productId);
            if (!this.isInApp())
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('exchangeTreasure', { spuId: productId });
        }
        changeSysBarColor(color) {
            console.log("调用flutter_inappwebview.brightness", color);
            if (!this.isInApp())
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('brightness', color);
        }
        openAppWindow(isWindow) {
            console.log("调用flutter_inappwebview.window", isWindow);
            if (!this.isInApp())
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('window', { isWindow: isWindow });
        }
        tobBlock() {
            console.log("调用flutter_inappwebview.tobBlock");
            if (!this.isInApp())
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('tobBlock');
        }
        loadSuccess() {
            console.log("调用flutter_inappwebview.loadSuccess");
            if (!this.isInApp(false))
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('loadSuccess');
        }
        loadError() {
            console.log("调用flutter_inappwebview.loadError");
            if (!this.isInApp(false))
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('loadError');
        }
        changeAppMenuBg(path) {
            let appMenuBg = Global.root_top.getChildByName("appMenuBg");
            if (!appMenuBg) {
                appMenuBg = new Laya.Sprite();
                appMenuBg.name = "appMenuBg";
                appMenuBg.y = Define.DeviceH - this.appMenuBgHeightMax;
                Global.root_top.addChild(appMenuBg);
                let img = new Laya.Image();
                appMenuBg.addChild(img);
                img.anchorX = 0.5;
                img.x = Define.canvasWidth >> 1;
                let mask = new Laya.Sprite();
                mask.graphics.drawRect(0, this.appMenuBgHeightMax - this.appMenuBgHeight, Define.canvasWidth, this.appMenuBgHeight, "#000000");
                appMenuBg.mask = mask;
            }
            appMenuBg.getChildAt(0).skin = path;
        }
        loadMaintain() {
            console.log("调用flutter_inappwebview.loadMaintain");
            if (!this.isInApp(false))
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('loadMaintain');
        }
        isMiningPage() {
            if (!this.isInApp(false))
                return;
            Laya.Browser.window.flutter_inappwebview.callHandler('isMiningPage').then((result) => {
                console.log("调用flutter_inappwebview.isMiningPage", result);
                this.isHomePage = result;
                SoundManager.ins.setOn(result);
            });
        }
    }

    class GameCtrl {
        constructor() {
            this.uui = null;
            if (GameCtrl._ins != null)
                throw new Error("GameCtrl is single!");
        }
        static get ins() {
            if (!this._ins)
                GameCtrl._ins = new GameCtrl();
            return this._ins;
        }
        init() {
            this.initCamera();
        }
        initCamera() {
            if (!this.scene3D) {
                this.scene3D = LayerManager.ins.addChild(new Laya.Scene3D(), LayerName.scene_king);
                var camera = (this.scene3D.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.name = "Main camera";
                camera.transform.translate(new Laya.Vector3(0, 0, 3));
                camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
                camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
                camera.orthographicVerticalSize = 3;
                this.camera = camera;
            }
        }
        playBtnSound() {
            let sound_btn = new Base64Type("res/sound/btn.mp3", "sound_btn", "", "");
            SoundManager.ins.playSound(sound_btn);
        }
        addBlackBg(ui, showPos = 0, alpha = 0.7, param = 0) {
            let sp = LayerManager.ins.getLayer(LayerName.ui_window).getChildByName("window_balck_bg");
            if (!ui) {
                if (sp)
                    sp.removeSelf();
                EventManager.ins.event(CustomDefine.EVENT_OPENLED, this.uui);
                return;
            }
            if (!sp) {
                sp = new Laya.Sprite();
                sp.graphics.drawRect(0, 0, Define.canvasWidth, Define.DeviceH, "#000000");
                sp.x = (Define.DeviceW - Define.canvasWidth) >> 1;
                sp.name = "window_balck_bg";
            }
            ui.parent.addChildAt(sp, ui.parent.getChildIndex(ui));
            sp.visible = true;
            sp.alpha = alpha;
            EventManager.ins.event(CustomDefine.EVENT_CLOSELED, ui);
            this.uui = ui;
            if (showPos == 1) {
                ui.y = 1000;
                let targetY = -AppCtrl.ins.appMenuBgHeight;
                Laya.Tween.to(ui, { y: targetY }, 200, null, Laya.Handler.create(this, () => {
                    console.log("window_balck_bg tween finish");
                }));
            }
            else {
                if (param == 0) {
                }
                else {
                }
            }
        }
        showLoading(isShow = true) {
            let sp = LayerManager.ins.getLayer(LayerName.top).getChildByName("window_top_loading");
            if (!sp) {
                sp = new Laya.Sprite();
                sp.graphics.drawRect(0, 0, Define.DeviceW, Define.DeviceH, "#000000");
                sp.alpha = 0.9;
                sp.name = "window_top_loading";
                let lbl = new Laya.Label();
                lbl.text = "加载中...";
                lbl.fontSize = 50;
                lbl.color = "#ffffff";
                lbl.anchorX = lbl.anchorY = 0.5;
                lbl.x = Define.DeviceW >> 1;
                lbl.y = Define.DeviceH >> 1;
                sp.addChild(lbl);
                LayerManager.ins.addChild(sp, LayerName.top);
            }
            sp.visible = isShow;
        }
        canvasCutImg(obj, ui) {
            let base64Data = "";
            if (obj instanceof Laya.Image) {
            }
            else if (obj instanceof Laya.Sprite3D) {
            }
            console.log(base64Data);
            ui.skin = base64Data;
        }
        getScreenTexture() {
            try {
                let _texture = null;
                let gl = Laya.WebGLContext.mainContext;
                let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
                gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                let w = gl.drawingBufferWidth;
                let h = gl.drawingBufferHeight;
                console.log(w, h);
                let texture2d = new Laya.Texture2D(w, h, Laya.TextureFormat.R8G8B8A8, false, false);
                texture2d.setPixels(pixels);
                _texture = new Laya.Texture(texture2d);
                let sp = new Laya.Sprite();
                sp.texture = _texture;
                Laya.stage.addChild(sp);
                return _texture;
            }
            catch (error) {
            }
            return null;
        }
        onCompressImg(str, w) {
            let rStr = str;
            if (str.indexOf("pic.toowow.cn") == -1) {
                str + "?imageView2/2/w/" + w;
            }
            return rStr;
        }
    }

    class Game {
        constructor() {
            if (Game._ins != null)
                throw new Error("Game is single!");
        }
        static get ins() {
            if (!this._ins)
                Game._ins = new Game();
            return this._ins;
        }
        init() {
            Define.DOWNLOAD_URL = "";
            Define.isSameScale = false;
            Define.isSameBackgroundScale = false;
            Define.screenFillType = ScreenFillType.default;
            Define.BACKGROUND_COLOR = "#000000";
            Define.isVertitalGame = true;
            Config.isAntialias = true;
            Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_HEIGHT;
            Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
            Define.canvasHeight = game.Define.DeviceW * Define.height / Define.width;
            Define.canvasWidth = game.Define.DeviceH * Define.width / Define.height;
            console.log("设备可视宽高", Laya.Browser.clientWidth, Laya.Browser.clientHeight, "设备物理宽高：", Define.width, Define.height, "像素比:", Laya.Browser.pixelRatio, "画布宽高", Define.canvasWidth, Define.canvasHeight);
            GameCtrl.ins;
            this.date = new Date();
            this.today = this.date.getDate();
            Laya.timer.loop(2000, this, this.update);
            console.log("当前客户端是：", this.today + "号");
        }
        update() {
            this.date.setTime(Date.now());
            if (this.today != this.date.getDate()) {
                this.today = this.date.getDate();
                console.log("客户端变更日期：", this.today);
                EventManager.ins.event(CustomDefine.EVENT_CHANGE_DAY);
            }
        }
    }

    class Main {
        constructor() {
            Define.DeviceW = 750;
            Define.DeviceH = 1624;
            if (window["Laya3D"]) {
                console.log("Laya3D...");
                Laya3D.init(Define.DeviceW, Define.DeviceH);
            }
            else {
                console.log("Laya2D");
                Laya.init(Define.DeviceW, Define.DeviceH, Laya["WebGL"]);
            }
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.bgColor = "#000000";
            Laya.stage.frameRate = Stage.FRAME_SLOW;
            AppCtrl.ins.checkFlutterReady(() => {
                this.appInitFinish();
            });
        }
        appInitFinish() {
            HttpManager.ins.init();
            Game.ins.init();
            LayerManager.ins.init();
            SceneManager.ins.init();
            LayerManager.ins.getLayer(LayerName.root).x = (Define.canvasWidth - Define.DeviceW) >> 1;
            UIManager.ins.init();
            LogCtrl.ins.init();
            EventManager.ins.once(NoticeEvent.PLATFORM_INIT_OVER, this, this.PLATFORM_INIT_OVER);
            EventManager.ins.once(NoticeEvent.PLATFORM_LOGIN_SUCCESS, this, this.PLATFORM_LOGIN_SUCCESS);
            PlatformManager.ins.init(null);
        }
        PLATFORM_INIT_OVER(e) {
            LoadingCtrl.ins.preLoad();
        }
        PLATFORM_LOGIN_SUCCESS(e) {
            LoadingCtrl.ins.enterGame();
        }
    }
    setTimeout(() => { new Main(); }, 500);

}());
