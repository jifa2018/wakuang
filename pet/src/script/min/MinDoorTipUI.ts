import { CustomDefine } from "../../custom/CustomDefine";
import { CustomWindow } from "../../custom/ui/CustomWindow";
import { HttpManager, HttpMethod, HttpName } from "../../manager/HttpManager";
import { ui } from "../../ui/layaMaxUI";
import { LoadingCtrl } from "../LoadingCtrl";
import { PublicNoticeMgr } from "../publicNotice/PublicNoticeMgr";
import { UserData } from "../user/UserData";
import { MinScene } from "./MinScene";


export class MinDoorTip extends BaseWindow {
    ui: ui.min.MinDoorTipUI;
    private _data: any;

    constructor() {
        super(ui.min.MinDoorTipUI);
        this.ui = this.view as ui.min.MinDoorTipUI;
        this.onInit();
    }

    onInit() {
        this.ui.btn_q.off(Laya.Event.CLICK, this, this.onBtnq)
        this.ui.btn_s.off(Laya.Event.CLICK, this, this.onBtns)
        this.ui.out.off(Laya.Event.CLICK, this, this.onTomorrow)

        this.ui.btn_q.on(Laya.Event.CLICK, this, this.onBtnq)
        this.ui.btn_s.on(Laya.Event.CLICK, this, this.onBtns)
        this.ui.out.on(Laya.Event.CLICK, this, this.onTomorrow)
        // this.onCreateVagueBG();

    }

    onDestroy() {
        // this.ui.removeSelf();
        // this.ui.destroy();
    }

    onBtnq() {

        LayerManager.ins.removeChild(CustomWindow.minDoor, LayerName.scene)


        LayerManager.ins.removeChild(this.ui, LayerName.ui);
        EventManager.ins.event(CustomDefine.EVENT_OPENLED, this.ui)
    }

    //确定进入
    onBtns() {

        if (this._data.status == 3) {
            LayerManager.ins.removeChild(this.ui, LayerName.ui);
            EventManager.ins.event(CustomDefine.EVENT_CLOSELED, this.ui)
            return
        }


        HttpManager.ins.sendMsg(HttpName.BUYTICKET, null, HttpMethod.POST, (msg: string, method: string, e) => {
            //debug 
            // e.code = 1
            if (e.code == 0) {
                // UIManager.ins.closeWindow(CustomWindow.minDoor);
                LayerManager.ins.removeChild(UIManager.ins.getWindow(CustomWindow.minDoor).ui, LayerName.scene)
                LayerManager.ins.removeChild(this.ui, LayerName.ui);
                MinScene.ins.init();
            } else {
                this.ui._html.visible = false;
                this.ui.goldTip.text = e.msg;
                this.ui.goldTip.visible = true;
            }

        });
    }


    /** */
    onTomorrow() {
        LayerManager.ins.removeChild(this.ui, LayerName.ui)
        EventManager.ins.event(CustomDefine.EVENT_OPENLED, this.ui)
    }

    //0：没进入矿洞，1：正常， 2：矿洞结束， 3：没体力，4：挖空
    sendData(data) {
        this._data = data
        EventManager.ins.event(CustomDefine.EVENT_CLOSELED, this.ui)
        //debug
        // data.status = 3
        if (data.status == 2 || data.status == 4) {
            this.ui.tip2.visible = true;
        } else if (data.status == 0) {
            this.ui.tip1.visible = true;
            let html = "<p>您是否花费<span>&nbsp;</span><span style='color:#FDC001'>" + data.fare + "凸币<span>&nbsp;</span></span> 进入矿洞挖矿</p>";
            this.ui._html.style.fontSize = 30;
            this.ui._html.style.color = "#fff"
            this.ui._html.style.wordWrap = false;
            this.ui._html.x = 96;
            this.ui._html.y = 484;
            this.ui._html.innerHTML = html
            this.ui._html.visible = true;
            this.ui.goldTip.visible = false;
        } else if (data.status == 3) {
            this.ui.goldTip.text = "没有体力值了"
            this.ui.tip1.visible = true;
            // this.ui.btn_s.disabled = true;
        }


    }
    onCreateVagueBG() {
        var blurFilter = new Laya.BlurFilter();
        blurFilter.strength = 10;
        this.ui.bg.filters = [blurFilter];
    }

}