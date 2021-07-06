import { CustomDefine } from "../../custom/CustomDefine";
import { CustomWindow } from "../../custom/ui/CustomWindow";
import { ui } from "../../ui/layaMaxUI";
import { AppCtrl } from "../AppCtrl";
import { PublicNoticeMgr } from "../publicNotice/PublicNoticeMgr";
import { GMUI } from "./GMUI";
import { ItemTreasuryScene } from "./ItemTreasuryScene";
import { bagContentGold } from "./MinbagContentGold";
import { bagContentGood, BAGCONTENTGOODTYPE } from "./MinbagContentGood";
import { MinCtrl } from "./MinCtrl";
import { MinDoorUI } from "./MinDoorUI";
import { MinProgressBar } from "./MinProgressBar";

const itemTreasuryScene_x = 0;
const itemTreasuryScene_y = 0;
export default class MinUI extends BaseWindow {
    public ui: ui.min.MinUI;
    ctrl: MinCtrl;
    name: string = null;
    itemTreasuryScene: ItemTreasuryScene;
    proBar: MinProgressBar;
    door: MinDoorUI;
    curSelectGood: Laya.Box = null;
    bagContentChild: Laya.Sprite = null;
    public _goldsTop: Laya.Image;
    constructor() {
        super(ui.min.MinUI);
        // this.onInit();
    }

    public onInit(): void {
        this.ui = this.view as ui.min.MinUI;
        this.name = "MinUI";
        this.ctrl = MinCtrl.ins;
        this.ctrl.view = this;
        this.ctrl.Init();
        this.ctrl.upDate();
        this.initList();
        this.bindOtherEvent();
        this.ui.notes.on(Laya.Event.CLICK, this, this.openNotes);
        this.ui.out.on(Laya.Event.CLICK, this, this.backDoor)
        this.ui.img_bg_crowd.on(Laya.Event.CLICK, this, this.openCrowd);
        this.proBar = new MinProgressBar();
        this.ui.addChild(this.proBar)
        this.ui.biankuang.bottom = AppCtrl.ins.appMenuBgHeight + 50;

        /**GM调试模式 */
        // if (Laya.Browser.onMobile) {
        // new GMUI();
        // }

        //电子屏开启先销毁
        EventManager.ins.event(CustomDefine.EVENT_CLOSELED)
        //2021-06-18 andy
        EventManager.ins.on(CustomDefine.EVENT_MIN_NOTICE, this, this.EVENT_MIN_NOTICE);
        //2021-06-23 andy App导航菜单模糊背景图
        AppCtrl.ins.changeAppMenuBg("mining/img_bg_menu.jpg");

        Laya.timer.once(50, this, () => {
            PublicNoticeMgr.ins().onInto(this.ui.panel, PublicNoticeMgr.ins().oData)
        })

        this.exentGoldUI();

        // this.ui.lblOnLine.fontSize = this.ui.lblOnLine.fontSize*1.5;
        // this.ui.lblOnLine.scale(2/3,2/3);

    }
    backDoor() {
        console.log("明天再来");
        this.ctrl.backDoor();
    }

    onDestory() {
        // this.ui.destroy();
        if (this.bagContentChild) {
            this.bagContentChild.removeSelf();
            this.bagContentChild.destroy();
        }
        this._goldsTop.destroy();
        this.proBar.destroy();

        this._goldsTop = null;
        this.proBar = null;
    }

    exentGoldUI() {
        this._goldsTop = new Laya.Image("mining/img_goldsTop.png");
        this._goldsTop.x = -92;
        this._goldsTop.y = 0;
        //LayerManager.ins.addChild(this._goldsTop, LayerName.top);
        this.ui.addChild(this._goldsTop);
    }

    activeUI(b: boolean) {
        this.ui.visible = b;
    }

    /**历史记录 */
    openNotes() {

        if (this.bagContentChild) {
            (this.curSelectGood.getChildByName("img_jb") as Laya.Image).visible = false;
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
        // this.itemTreasuryScene = new ItemTreasuryScene();
        // this.itemTreasuryScene.x = itemTreasuryScene_x;
        // this.itemTreasuryScene.y = itemTreasuryScene_y;
        // this.itemTreasuryScene.zOrder = -1;
        // this.ui.addChild(this.itemTreasuryScene);


        this.ui.list_bag.array = [];
        this.ui.list_bag.hScrollBarSkin = "";
        this.ui.list_bag.renderHandler = Laya.Handler.create(this, this.listBagRenderHandler, null, false);
        this.ui.list_bag.mouseHandler = Laya.Handler.create(this, this.listBagMouseHandler, null, false);

    }

    listBagMouseHandler(e: Laya.Event, i: number) {
        let _dataSource = (e.target as Laya.Box).dataSource;
        if (Object.keys(_dataSource).length <= 0) {
            return
        }

        if (e.type == Laya.Event.CLICK) {
            if (this.curSelectGood) {
                (this.curSelectGood.getChildByName("img_jb") as Laya.Image).visible = false;
            }

            this.curSelectGood = e.target as Laya.Box
            (this.curSelectGood.getChildByName("img_jb") as Laya.Image).visible = true;
            if (this.bagContentChild) {
                this.bagContentChild.removeSelf();
                this.bagContentChild.destroy();
                EventManager.ins.event(CustomDefine.EVENT_OPENLED, this.bagContentChild)
            }


            if (i == 0) {
                this.bagContentChild = new bagContentGold();
                this.ui.bagContent.addChild(this.bagContentChild)
                // LayerManager.ins.addChild(this.bagContentChild, LayerName.top)
            } else {
                let _dataSource = (e.target as Laya.Box).dataSource;
                if (Object.keys(_dataSource).length > 0) {
                    this.bagContentChild = new bagContentGood(BAGCONTENTGOODTYPE.bagType, this.ui.bagContent, (e.target as Laya.Box).dataSource);
                }

            }
            EventManager.ins.event(CustomDefine.EVENT_CLOSELED, this.bagContentChild)

            //隐藏掉独立处理的矿壁的UI图
            // this._goldsTop.visible = false;

        }
    }

    hideCurSelectGood(associate) {
        if (this.curSelectGood) {
            (this.curSelectGood.getChildByName("img_jb") as Laya.Image).visible = false;
        }
        // this._goldsTop.visible = true;;
        EventManager.ins.event(CustomDefine.EVENT_OPENLED, associate)
    }

    /**构建我的背包列表 */
    listBagRenderHandler(cell: Laya.Box) {
        let icon = cell.getChildByName("img_icon") as Laya.Image;
        let name = cell.getChildByName("lab_name") as Laya.Label;

        icon.skin = cell.dataSource.avatar ? cell.dataSource.avatar : "";
        name.text = cell.dataSource.desc ? cell.dataSource.desc : "";
    }


    viewClick(sp: Laya.Sprite) {
        switch (sp.name) {
            case "btn_back":
                this.ctrl.onBack();
                break;
            case "btn_bag":
                this.ctrl.openBag()
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

    //事件绑定
    bindOtherEvent() {

    }

    //2021-06-18 andy 挖矿中奖通知，隐藏“今日幸运宝藏”文字
    EVENT_MIN_NOTICE(evt: NoticeEvent): void {
        let isNotice: boolean = evt.data;
        this.itemTreasuryScene.txtTodayLucky.visible = !isNotice;
    }

}