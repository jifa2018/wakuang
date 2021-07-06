import { PublicNoticeMgr } from "./PublicNoticeMgr";



/**广告的类型 */
export enum NOTICETYPE {
    default = -1,
    video = 1,//视频
    text = 2,//文字
    imageText = 3,//图文
    image = 4,//图片
    noticeContnet = 6,//通知文
    goldContent = 5,//凸币独立
}

/**行走类型
 * 1：故障艺术，2：潮宠来袭，3：由左滚入，4：由下滚入，5：渐显渐隐
 */
export enum RUNTYPE {
    fault = 1,
    come = 2,
    right = 3,//右侧开始
    lower = 4,//下面开始
    gradually = 5,//渐显
    noticeRight = 6,//通知独立处理
}

/**播放帧动画类型 */
export enum PLAYBEFOREANITYPE {
    snowflake = 0,//雪花
    caoxi = 1//潮汐
}
/**基类 */
export class BaseNotice {
    //类型
    type: NOTICETYPE = null;
    //行走时间
    runTime: number = 0;
    //行走的方式
    runType: RUNTYPE = null;
    //停留时间
    stopTime: number = 0;
    //执行行为前动画类型 默认-1 没有
    playBeforeAniType: PLAYBEFOREANITYPE = -1;
    //临时,可以从队列删除
    temporary: boolean = false
    //初始数据
    initPos: any = { x: 0, y: 0 }
    //结束坐标
    endPos: any = { x: 0, y: 0 }
    //停留的坐标
    stopPos: any = { x: 0, y: 0 }
    //设置宽高
    initWH: any = { W: 0, H: 0 }
    //UI 元素
    UI: Laya.Sprite = null;
    //UI 初始透明度
    initAlpha: number = 1;


    /*======================================================== */

    onInto(data: any, parent: Laya.Sprite, callback: Function = null) {
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
        if (!this.UI) return
        this.UI.x = this.initPos.x;
        this.UI.y = this.initPos.y;
        this.UI.visible = false;
    }

    setInitAlpha(n: number) {
        this.UI.alpha = n;
        this.initAlpha = n;
    }

    onDestory() {
        if (!this.UI) return
        this.UI.removeSelf();
    }

    setInitPos(x: number, y: number) {
        this.initPos.x = x;
        this.initPos.y = y;
    }

    setEndtPos(x: number, y: number) {
        this.endPos.x = x;
        this.endPos.y = y;
    }

    setStopPos(x: number, y: number) {
        this.stopPos.x = x;
        this.stopPos.y = y;
    }

    setWH(w: number, h: number) {
        this.initWH.W = w;
        this.initWH.H = h;
    }

    setUI(ui: Laya.Sprite) {
        this.UI = ui;
        this.UI.visible = false
    }

    createBoxBG(parent: Laya.Sprite) {
        let _box = new Laya.Box();
        _box.x = 0;
        _box.y = 0;
        _box.width = parent.width;
        _box.height = parent.height;
        return _box;
    }

}