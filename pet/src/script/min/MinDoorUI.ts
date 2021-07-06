import { CustomDefine } from "../../custom/CustomDefine";
import { CustomWindow } from "../../custom/ui/CustomWindow";
import { HttpManager, HttpMethod, HttpName } from "../../manager/HttpManager";
import { ui } from "../../ui/layaMaxUI";
import { AppCtrl } from "../AppCtrl";
import { LoadingCtrl } from "../LoadingCtrl";
import { PublicNoticeData } from "../publicNotice/PublicNoticeData";
import { PublicNoticeMgr } from "../publicNotice/PublicNoticeMgr";
import { CreateBg } from "./CreateBg";
import { bagContentGold } from "./MinbagContentGold";
import { bagContentGood, BAGCONTENTGOODTYPE } from "./MinbagContentGood";
import { MinCtrl } from "./MinCtrl";
import { MinData } from "./MinData";
import { MinScene } from "./MinScene";


export class MinDoorUI extends BaseWindow {
    private list = [];
    private scroolState: boolean = false;
    ui: ui.min.MinDoorUI;
    ticketInfo: any;
    _data: any;
    constructor() {
        super(ui.min.MinDoorUI);
        this.ui = this.view as ui.min.MinDoorUI;
        this.ui.come.on(Laya.Event.CLICK, this, this.onCome)
        //2021-06-18 andy
        EventManager.ins.on(CustomDefine.EVENT_MIN_NOTICE, this, this.EVENT_MIN_NOTICE);

    }

    //开始初始化
    onInit() {
        //2021-06-23 andy App导航菜单模糊背景图
        AppCtrl.ins.changeAppMenuBg("mining/img_door_menu.jpg");
        Laya.timer.once(50, this, () => {
            PublicNoticeMgr.ins().onInto(this.ui.panel, PublicNoticeMgr.ins().oData)
        })
    }

    onCome() {

        //打开重新请求数据查看当前状体，如果玩家静默在入口页。不请求数据不更新
        HttpManager.ins.sendMsg(HttpName.TICKETINFO, null, HttpMethod.GET, (msg: string, method: string, e) => {
            if (e.data.status == 2 || e.data.status == 4 || e.data.status == 0) {
                this._data = e.data;
                LayerManager.ins.addChild(UIManager.ins.getWindow(CustomWindow.minDoorTip).ui, LayerName.ui)
                UIManager.ins.getWindow(CustomWindow.minDoorTip).sendData(this._data);
            } else {
                console.log("状态为 已进入矿洞 / 没有体力")
            }
        })
    }

    onOut() {
        MinScene.ins.onDestory();
        UIManager.ins.closeWindow(CustomWindow.minDoor);
        AppCtrl.ins.close();
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
            if (this.ui.view_p.height > 0) {
                this.startScroll();
                this.scroolState = true;
                Laya.timer.clearAll(this);
            }
        })
    }

    BOXOFFSET_X = 0;
    BOXOFFSET_Y = 5;
    BOXOFFSET_W = 757;
    BOXOFFSET_H = 105;
    /**
     * 和ItemTreasuryScene 重复代码，待优化
     * @param data 
     * @param index 
     */
    createUI(data, index) {
        Laya.loader.load("prefab/Box1.json", Laya.Handler.create(this, function (pref: Laya.Prefab) {
            var playpre: Laya.Prefab = new Laya.Prefab()
            playpre.json = pref;
            var obj = Laya.Pool.getItemByCreateFun("box2Item", playpre.create, playpre) as Laya.Box;
            let t = obj.getChildByName("lb_treasure") as Laya.Label;
            let p = obj.getChildByName("lb_price") as Laya.Label;
            let i = obj.getChildByName("img_treasure") as Laya.Image;
            let l = obj.getChildByName("img_logo") as Laya.Image;
            let off = obj.getChildByName("img_off") as Laya.Image;

            let userID = parseInt(data.user_id);

            i.skin = data.avatar;
            p.text = data.price;
            t.text = data.desc;
            t.alpha = 0.85;
            p.alpha = 0.85;
            l.skin = data.brand_avatar
            if (userID > 0) {
                off.skin = "mining/img_take_off.png"
            }

            obj.width = this.BOXOFFSET_W;
            obj.height = this.BOXOFFSET_H;
            obj.x = this.BOXOFFSET_X;
            obj.y = this.BOXOFFSET_Y + this.BOXOFFSET_H * index + (index * 40)
            this.ui.view_p.addChild(obj);

            obj.offAll()
            obj.on(Laya.Event.CLICK, this, this.onSelect, [data])
        }))
    }

    startScroll() {
        Laya.Tween.clearAll(this);
        Laya.Tween.to(this.ui.view_p,
            { y: -(this.ui.view_p.height / 2) }, (this.ui.view_p.height * 15 * 0.9), null, Laya.Handler.create(this, this.complete)
        )
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

    //2021-06-18 andy 挖矿中奖通知，隐藏“今日幸运宝藏”文字
    EVENT_MIN_NOTICE(evt: NoticeEvent): void {
        let isNotice: boolean = evt.data;
        // this.ui.txtTodayLucky.visible = !isNotice;
    }

}
