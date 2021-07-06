import { BaseNotice, PLAYBEFOREANITYPE } from "./BaseNotice";
import { PublicNoticeMgr } from "./PublicNoticeMgr";

/**图片 */
export class ImageNotice extends BaseNotice {
    constructor() {
        super()
    }
    onInto(data, parent: Laya.Sprite, callback: Function) {
        super.onInto(data, parent, callback);
        let _box = super.createBoxBG(parent);
        let _img = new Laya.Image(data.url);
        _img.width = _box.width;
        _img.height = _box.height;
        _box.addChild(_img);
        parent.addChild(_box);
        this.setUI(_box)
        PublicNoticeMgr.ins().getInitPosByParent(parent, this.runType, this)
        this.UI.x = this.initPos.x;
        this.UI.y = this.initPos.y;
        callback()
    }

    onDestory() {
        if(!this.UI) return
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

    setInitAlpha(n: number) {
        this.UI.alpha = n;
        this.initAlpha = n;
    }
}