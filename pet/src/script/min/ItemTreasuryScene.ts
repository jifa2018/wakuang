import { ui } from "../../ui/layaMaxUI";
import { bagContentGood, BAGCONTENTGOODTYPE } from "./MinbagContentGood";
import { MinCtrl } from "./MinCtrl";


export class ItemTreasuryScene extends ui.min.ItemTreasuryUI {

    private list = [];
    private scroolState: boolean = false;
    constructor() {
        super()
    }

    refresh(data) {

        if (!data || data.length <= 0) return
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
                this.list.push(element.id)
            }
        });

        if (this.scroolState) return;
        Laya.timer.frameLoop(1, this, () => {
            if (this.view_p.height > 0) {
                this.startScroll();
                this.scroolState = true;
                Laya.timer.clearAll(this);
            }
        })
    }

    BOXOFFSET_X = 0;
    BOXOFFSET_Y = 5;
    BOXOFFSET_W = 1029;
    BOXOFFSET_H = 150;
    createUI(data, index) {
        Laya.loader.load("prefab/Box.json", Laya.Handler.create(this, function (pref: Laya.Prefab) {
            var playpre: Laya.Prefab = new Laya.Prefab()
            playpre.json = pref;
            var obj = Laya.Pool.getItemByCreateFun("ItemTreasurySceneBox", playpre.create, playpre) as Laya.Box;
            let t = obj.getChildByName("lb_treasure") as Laya.Label;
            let p = obj.getChildByName("lb_price") as Laya.Label;
            let i = obj.getChildByName("img_treasure") as Laya.Image;
            let l = obj.getChildByName("img_logo") as Laya.Image;
            let off = obj.getChildByName("img_off") as Laya.Image;

            let userID = parseInt(data.user_id);

            i.skin = data.avatar;
            l.skin = data.shop_avatar;
            p.text = data.price;

            if (userID > 0) {
                off.skin = "mining/img_take_off.png"
            }

            t.text = data.desc;
            t.alpha = 0.85;
            p.alpha = 0.85;
            obj.width = this.BOXOFFSET_W;
            obj.height = this.BOXOFFSET_H;
            obj.x = this.BOXOFFSET_X;
            obj.y = this.BOXOFFSET_Y + this.BOXOFFSET_H * (index);
            this.view_p.addChild(obj);

            obj.offAll()
            obj.on(Laya.Event.CLICK, this, this.onSelect, [data])


        }))
    }

    startScroll() {
        Laya.Tween.clearAll(this);
        Laya.Tween.to(this.view_p,
            { y: -this.view_p.height / 2 }, (this.view_p.height * 15), null, Laya.Handler.create(this, this.complete)
        )
    }
    complete() {
        Laya.Tween.clearAll(this);
        this.view_p.y = -3;
        this.startScroll();
    }

    onSelect(data) {
        new bagContentGood(BAGCONTENTGOODTYPE.treasure, MinCtrl.ins.view.ui, data);
    }



}








