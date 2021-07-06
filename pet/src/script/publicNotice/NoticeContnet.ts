import { CustomDefine } from "../../custom/CustomDefine";
import { BaseNotice } from "./BaseNotice";
import { PublicNoticeMgr } from "./PublicNoticeMgr";


export class NoticeContent extends BaseNotice {
    constructor() {
        super();
    }

    onInto(data, parent: Laya.Sprite, callback: Function) {
        super.onInto(data, parent, callback);
        this.createPrefab(data, parent, callback);
    }

    createPrefab(data, parent, callback: Function) {

        if (!parent) return

        let self = this;
        let _profab = { poolItemName: "", url: '' };
        let _content;
        let _goodsUrl;
        // console.log("===============NoticeContent===============", data)
        if (data.icon > 0) {
            _profab["poolItemName"] = "noticeTubi";
            _profab["url"] = "prefab/notice_tubi.json";
            _content = data.icon
            _goodsUrl = "mining/img_gold.png"
        } else {
            _profab["poolItemName"] = "noticeBaoz";
            _profab["url"] = "prefab/notice_baoz.json";
            _content = data.itemName
            _goodsUrl = data.treasurer_avatar;
        }
        Laya.loader.load(_profab.url, Laya.Handler.create(this, function (pref: Laya.Prefab) {
            var playpre: Laya.Prefab = new Laya.Prefab()
            playpre.json = pref;
            var obj = Laya.Pool.getItemByCreateFun(_profab.poolItemName, playpre.create, playpre) as Laya.Box;
            let notice = obj.getChildByName("notice") as Laya.Box;
            let userIcon = obj.getChildByName("img_user_icon") as Laya.Image;
            let userName = obj.getChildByName("lab_user_name") as Laya.Label;
            let goods = obj.getChildByName("img_good") as Laya.Image;
            let content = obj.getChildByName("lab_content") as Laya.Label;
            //头像
            userIcon.skin = data.head;
            //用户名
            userName.text = data.userName;
            goods.skin = _goodsUrl
            //说明
            content.text = _content
            //2021-07-05 andy AppCtrl.ins.temporaryNotice ,这个方法调用传进来的parent为null
            if (parent) {
                parent.addChild(obj);
                self.setUI(obj);
                self.UI.width = content.x + content.width + 20;
                obj.y = -(obj.height - parent.height) / 2
                PublicNoticeMgr.ins().getInitPosByParent(parent, self.runType, self)
                self.UI.x = self.initPos.x;
                self.UI.y = self.initPos.y;
                //修改子元素的字体
                for (let index = 0; index < obj.numChildren; index++) {
                    const element = obj.getChildAt(index);
                    if (element instanceof Laya.Label) {
                        element.font = "fzxs"
                    }
                }
            }

            callback();
        }))
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

    onDestory() {
        if (!this.UI) return
        this.UI.removeSelf();
        this.UI.destroy();
    }


}