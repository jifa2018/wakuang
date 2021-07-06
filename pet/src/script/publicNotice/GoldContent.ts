import { CustomDefine } from "../../custom/CustomDefine";
import { MinData } from "../min/MinData";
import { BaseNotice, NOTICETYPE, PLAYBEFOREANITYPE, RUNTYPE } from "./BaseNotice";
import { PublicNoticeMgr } from "./PublicNoticeMgr";


export class GoldContent extends BaseNotice {
    //类型
    type: NOTICETYPE = NOTICETYPE.goldContent;
    //行走时间
    runTime: number = 0;
    //行走的方式
    runType: RUNTYPE = RUNTYPE.gradually;
    //停留时间
    stopTime: number = 2;
    constructor() {
        super();
        EventManager.ins.on(CustomDefine.EVENT_UPDATENOTICE, this, this.onUpdate);
    }

    onInto(data, parent: Laya.Sprite, callback?: Function) {
        // super.onInto(data, parent, callback);
        this.createPrefab(data, parent);
        // callback();
    }

    createPrefab(data, parent) {
        let self = this;
        Laya.loader.load("prefab/goldContent.json", Laya.Handler.create(this, function (pref: Laya.Prefab) {
            var playpre: Laya.Prefab = new Laya.Prefab()
            playpre.json = pref;
            var obj = Laya.Pool.getItemByCreateFun("goldContent", playpre.create, playpre) as Laya.Box;
            let _number = obj.getChildByName("goldNumber") as Laya.Label;
            let _fontStyle = obj.getChildByName("fontStyle") as Laya.Label;
            _number.text = MinData.ins.getsMinCion()+"";
            _number.font = "fzxs";
            _fontStyle.font = "fzxs";

            parent.addChild(obj);
            obj.y = -(obj.height - parent.height) / 2
            self.setUI(obj);
            PublicNoticeMgr.ins().getInitPosByParent(parent, self.runType, self)

            self.UI.x = self.initPos.x;
            self.UI.y = self.initPos.y;
        }))
    }

    onStart() {
        PublicNoticeMgr.ins().playAni(PLAYBEFOREANITYPE.caoxi, () => {
            super.onStart();
        });
    }

    onUpdate() {
        if (!this.UI) return
        let _number = this.UI.getChildByName("goldNumber") as Laya.Label;
        _number.text = MinData.ins.getsMinCion().toString();
    }

}