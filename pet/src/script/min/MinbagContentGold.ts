import { ui } from "../../ui/layaMaxUI";
import { AppCtrl } from "../AppCtrl";
import { PublicNoticeMgr } from "../publicNotice/PublicNoticeMgr";
import { MinCtrl } from "./MinCtrl";


export class bagContentGold extends ui.min.bagContentGoldUI {

    constructor() {
        super()

        let html = "<p>凸币能买啥？<span style='color:#FDC001'><span>&nbsp;&nbsp;</span>点我去看看</span><span>&nbsp;&nbsp;</span>不耽误您挖矿哦~</p>";
        this._html.style.fontSize = 24;
        this._html.style.color = "#fff"
        this._html.style.wordWrap = false;
        this._html.x = 158;
        this._html.y = 1000;
        this._html.innerHTML = html
        this._html.on(Laya.Event.CLICK, this, this.onHtml)

        this.btn_close.on(Laya.Event.CLICK, this, this.onClose)
        // this.onCreateVagueBG();

    }

    onClose() {
        // this.destroy();
        this.removeSelf()
        MinCtrl.ins.view.hideCurSelectGood(this);
    }

    onHtml() {
        AppCtrl.ins.tobBlock()
        this.onClose();
    }
    onCreateVagueBG() {
        var blurFilter = new Laya.BlurFilter();
        blurFilter.strength = 10;
        this.bg.filters = [blurFilter];
    }




}