import { BaseNotice, RUNTYPE } from "./BaseNotice";
import { PublicNoticeData } from "./PublicNoticeData";
import { PublicNoticeMgr } from "./PublicNoticeMgr";

/**文字 */
export class TextNotice extends BaseNotice {
    private _label: any;
    constructor() {
        super()
    }
    onInto(data: PublicNoticeData, parent: Laya.Sprite, callback: Function) {
        super.onInto(data, parent, callback);
        let _box = super.createBoxBG(parent);
        this.creteHtml(_box, data)
        parent.addChild(_box);
        this.setUI(_box)

        // this.UI.width = this._label.width + 20;
        PublicNoticeMgr.ins().getInitPosByParent(parent, this.runType, this)
        this.UI.x = this.initPos.x;
        this.UI.y = this.initPos.y;
        callback();
    }

    creteHtml(_box: Laya.Box, data) {
        this._label = new Laya.Label();
        let _boxH = _box.height;
        let _boxW = _box.width;
        _box.addChild(this._label);
        this._label.text = data.content;
        this._label.font = "fzxs"
        this._label.fontSize = 50
        this._label.wordWrap = false;
        this._label.align = "center";
        this._label.valign = "middle";
        this._label.color = "#fff"


        if (data.runType == RUNTYPE.lower) {
            this._label.wordWrap = true;
            this._label.leading = 20;
            this._label.align = "center";
            this._label.valign = "middle"
            this._label.width = _boxW
            _box.height = this._label.y + this._label.height;
        } else {
            this._label.height = _boxH;
            _box.width = this._label.x + this._label.width;
        }

    }

    onDestory() {
        if(!this.UI) return
        this.UI.removeSelf();
    }

    onStart() {
        super.onStart();
    }

    reset() {
        super.reset();
    }

    setInitAlpha(n: number) {
        this.UI.alpha = n;
        this.initAlpha = n;
    }
}