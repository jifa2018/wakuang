import { ui } from "../../ui/layaMaxUI";
import { AppCtrl } from "../AppCtrl";
import { MinCtrl } from "./MinCtrl";


export enum BAGCONTENTGOODTYPE {
    bagType = 0,
    treasure = 1,
}
export class bagContentGood extends ui.min.bagContentGoodUI {
    private data: any = null; //数据包
    constructor(t: BAGCONTENTGOODTYPE, parent: any, param: any) {
        super()
        this.data = param;
        this.init(t, parent)
        this.bindEvent();
        // this.onCreateVagueBG();
    }
    init(t: BAGCONTENTGOODTYPE, parent: any) {

        this.img_good.skin = this.data.avatar ? this.data.avatar : "";
        this.logo.skin = this.data.brand_avatar ? this.data.brand_avatar : "";
        this.lab_good_m.text = this.data.desc ? this.data.desc : "";
        this.price.text = "价值：" + (this.data.price ? this.data.price : "");
        this.jieshao.text = this.data.introduction ? this.data.introduction : "";
        this.chicun.text = "宝物尺码：" + (this.data.specification ? this.data.specification : "")
        this.lab_logo.text = this.data.brand_name ? this.data.brand_name : "";

        // this._panel
        this.img_good.x = (this._panel.width - this.img_good.width) / 2
        this.img_good.y = (this._panel.height - this.img_good.height) / 2
        switch (t) {
            case BAGCONTENTGOODTYPE.bagType:
                this.btn_ljdh.visible = true
                break;
            case BAGCONTENTGOODTYPE.treasure:
                this.btn_ljdh.visible = false
                break;

            default:
                break;
        }
        parent.addChild(this)
        // LayerManager.ins.addChild(this, LayerName.top)

    }

    bindEvent() {
        this.btn_ljdh.on(Laya.Event.CLICK, this, this.onExchange)
        this.btn_close.on(Laya.Event.CLICK, this, this.onClose)
    }

    onExchange() {
        AppCtrl.ins.goExchange(this.data.id);

    }
    onClose() {
        this.removeSelf();
        if (MinCtrl.ins.view) {
            MinCtrl.ins.view.hideCurSelectGood(this);
        }

    }
    onCreateVagueBG() {
        var blurFilter = new Laya.BlurFilter();
        blurFilter.strength = 10;
        this.bg.filters = [blurFilter];
    }





}