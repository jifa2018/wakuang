/*
* name;
*/
export class CustomDefine {
    static NoticeEvent: any;
    constructor() {

    }
    /**配置数据HTTP地址 */
    static dataConfigUrl: string = "res/config/cfg_data.json";
    /** 环境  debug 开发环境   test 测试环境   pre 预发环境  release  正式环境*/
    static environment: string = "";
    /** App当前版本号 */
    static appVersion: string = "";

    /** 背景图最大宽端 */
    static maxBgWidth: number = 933;

    //自定义声音------------------
    /**主界面声音 */
    static SOUND_MAIN: string = "/sound/main.mp3";
    /**游戏内声音 */
    static SOUND_GAME: string = "/sound/game.mp3";
    /**按钮声音 */
    static SOUND_BTN: string = "/sound/btn.mp3";


    //自定义事件------------------
    /**事件： 从App获得信息*/
    public static EVENT_APP_INIT: string = "EVENT_APP_INIT";
    /**事件： 获得穿戴道具*/
    public static EVENT_EQUIP: string = "EVENT_EQUIP";
    /**事件： 获得背包道具*/
    public static EVENT_BAG: string = "EVENT_BAG";
    /**事件： 保存穿戴道具*/
    public static EVENT_SAVE_EQUIP: string = "EVENT_SAVE_EQUIP";
    /**事件： 获得道具详细信息*/
    public static EVENT_GET_PRODUCT: string = "EVENT_GET_PRODUCT";
    /**事件： 开始挖矿 */
    public static EVENT_STARTMINING: string = "EVENT_STARTMINING";
    /**事件： 换锄头 */
    public static EVENT_CHANGETOOL: string = "EVENT_CHANGETOOL";
    /**事件： 体力值 */
    public static EVENT_CHANGTILI: string = "EVENT_CHANGTILI";
    /**事件： 挖矿信息*/
    public static EVENT_MIN_RANK: string = "EVENT_MIN_RANK";
    /**事件： 挖矿记录*/
    public static EVENT_MIN_RECORD: string = "EVENT_MIN_RECORD";
    /**事件： 挖矿通知*/
    public static EVENT_MIN_NOTICE: string = "EVENT_MIN_NOTICE";
    /**事件： 换天 */
    public static EVENT_CHANGE_DAY: string = "EVENT_CHANGE_DAY";
    /**事件： 关闭电子屏通知*/
    public static EVENT_CLOSELED: string = "EVENT_CLOSELED";
    /**事件： 开启电子屏通知*/
    public static EVENT_OPENLED: string = "EVENT_OPENLED";
    /**事件： App宝藏兑换通知*/
    public static EVENT_APP_CONVERT: string = "EVENT_APP_CONVERT";

    //自定义动画------------------
    /**引导 */
    public static animGuide: string = "guide";

    /** 装备类型暂时5种 */
    public static PET_EQUIP_COUNT: Number = 5;


    /**事件： 行为事件*/
    public static EVENT_BEHAVIOUR: string = "EVENT_BEHAVIOUR";
    /**事件： 动画完成事件广播*/
    public static EVENT_PETANIFINISHEVENT: string = "EVENT_PETANIFINISHEVENT";
    /**事件： 动画请求数据完成事件广播*/
    public static EVENT_PETMINOVERUPDATEEVENT: string = "EVENT_PETMINOVERUPDATEEVENT";
    /** 事件： 数据更新完后的通知 */
    public static EVENT_UPDATENOTICE: string = "EVENT_UPDATENOTICE";
    /** 事件： 焦点通知 */
    public static EVENT_FOUCE: string = "EVENT_FOUCE";
    /** 事件： 服务端请求失败，例如断网 */
    public static HTTP_SEND_ERROR: string = "HTTP_SEND_ERROR";

}

class LocalKey {
    /**当前金币 */
    public static GOLD: string = "GOLD";
    /**当前等级 */
    public static LEVEL: string = "LEVEL";
    /**当前分数 */
    public static SCORE: string = "SCORE";
    /**最高分数 */
    public static SCORE_MAX: string = "SCORE_MAX";
    /**上一次缓存日期 20190101 */
    public static LAST_DAY: string = "LAST_DAY";
    /**播放视频广告次数 */
    public static PLAY_VIDEO_COUNT: string = "PLAY_VIDEO_COUNT";

    /**当前使用的小刀ID */
    public static KNIFE_ID: string = "KNIFE_ID";
}
export class Environment {
    /** 开发环境 */
    static DEBUG: string = "debug";
    /** 测试环境 */
    static TEST: string = "test";
    /** 预发环境 */
    static PRE: string = "pre";
    /** 正式环境 */
    static RELEASE: string = "release";
}
/** 功能模块 */
export class ModuleType {
    /** 换装 */
    static USER = "0";
    /** 挖矿 */
    static MIN = "1";
}
/** 字体类型 */
export class FontType {
    /** 2021-06-23 andy  fangzhengxiangsu12*/
    static fzxs = "fzxs";
}

export enum TYPETOOL {
    lv_0 = 0,   //普通锄头
    lv_1 = 1,   //金锄头
}