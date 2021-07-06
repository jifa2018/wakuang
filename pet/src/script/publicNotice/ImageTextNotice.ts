import { BaseNotice, RUNTYPE } from "./BaseNotice";
import { PublicNoticeData } from "./PublicNoticeData";
import { PublicNoticeMgr } from "./PublicNoticeMgr";

/**图文 */
export class ImageTextNotice extends BaseNotice {
    constructor() {
        super()
    }
    onInto(data: PublicNoticeData, parent: Laya.Sprite, callback: Function) {
        super.onInto(data, parent, callback);
        let self = this;
        // let _box = super.createBoxBG(parent);
        Laya.loader.load("prefab/img_text.json", Laya.Handler.create(this, function (pref: Laya.Prefab) {
            var playpre: Laya.Prefab = new Laya.Prefab()
            playpre.json = pref;
            var obj = Laya.Pool.getItemByCreateFun("img_text", playpre.create, playpre) as Laya.Box;
            let _img = obj.getChildByName("img") as Laya.Image;
            let _text = obj.getChildByName("text") as Laya.Label;
            let objH = obj.height;
            let objw = obj.width


            parent.addChild(obj);
            self.setUI(obj);

            _img.skin = data.url;
            _text.text = data.content;
            //修改子元素的字体
            for (let index = 0; index < obj.numChildren; index++) {
                const element = obj.getChildAt(index);
                if (element instanceof Laya.Label) {
                    element.font = "fzxs"
                }
            }


            if (data.runType == RUNTYPE.lower) {
                _text.wordWrap = true;
                _text.align = "left";
                _text.valign = "middle";
                _text.leading = 20;
                _text.width = 510
                obj.height = _text.y + _text.height;
            } else {
                _text.wordWrap = false;
                obj.width = _text.width + _text.x
                obj.y = -(obj.height - parent.height) / 2
            }

            
            // self.UI.width = _text.x + _text.width + 20;
            PublicNoticeMgr.ins().getInitPosByParent(parent, self.runType, self)
            self.UI.x = self.initPos.x;
            self.UI.y = self.initPos.y;
            callback();
        }))
    }


    onStart() {
        super.onStart();
    }

    onDestory() {
        if(!this.UI) return
        this.UI.removeSelf();
    }

    reset() {
        super.reset();
    }

    setInitAlpha(n: number) {
        this.UI.alpha = n;
        this.initAlpha = n;
    }

}