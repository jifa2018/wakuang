import { CustomDefine } from "../../custom/CustomDefine";
import { ui } from "../../ui/layaMaxUI";
import { PublicNoticeMgr } from "../publicNotice/PublicNoticeMgr";

export class MinTipInfo extends ui.min.MinTipInfoUI {
    private closeTime: number = 2000;//关闭时间
    data: any = {};
    constructor(_data) {
        super();
        this.data = _data
        this.onInit();
    }

    onInit() {
        this.btn_kx.on(Laya.Event.CLICK, this, this.onBtnKX)
        this.icon.skin = this.data.avatar ? this.data.avatar : ""
        this.onStartTimer();
    }

    onBtnKX() {

        if (this) {
            this.removeSelf();
            this.destroy();
        }
        EventManager.ins.event(CustomDefine.EVENT_OPENLED)
    }

    setIcon(url: string) {
        this.icon.skin = url;
    }

    onStartTimer() {
        Laya.timer.once(this.closeTime, this, this.onBtnKX)
    }

}