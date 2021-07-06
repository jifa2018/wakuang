import { ui } from "../../ui/layaMaxUI";

const GREEN = "mining/img_scroll_g.png";
const YELLOW = "mining/img_scroll_h.png";
const RED = "mining/img_scroll_red.png"
export class MinProgressBar extends ui.min.MinProgressBarUI {
    OFFSET_N = 14;   //每格的值差
    OFFSET_Z = 28;   //共28个格子 
    OFFSET_F = 0;
    OFFSET_X = 636;
    OFFSET_Y = 600;
    nLast = -1; //之前的体力
    _sp: Sprite;
    _spp: any;
    constructor() {
        super();
        this.init();
    }
    init() {
        this.y = this.OFFSET_Y;
        this.x = this.OFFSET_X;
        this.zOrder = -1;
        this._sp = new Laya.Sprite();
        this._sp.graphics.drawRect(-25, 0, 100, 395, "#00ffff");
        this.scroll_t.mask = this._sp;

    }

    //改变体力
    onChangeStrength(n: number) {
        this.onChangePic(n);
        this.setValue(n * 100)
        let _nn = 395 - (395 * n)
        Laya.Tween.to(this._sp, {
            y: _nn, update: Laya.Handler.create(this, () => {
            }, null, false)
        }, 1000, null, Laya.Handler.create(this, this.finishTween, [_nn]))
    }

    finishTween(n: number) {
        this._sp.y = n
    }

    //切换图片
    onChangePic(n: number) {
        if (n < 0.2) {
            this.scroll_t.skin = RED;
        } else if (n < 0.5) {
            this.scroll_t.skin = YELLOW;
        } else {
            this.scroll_t.skin = GREEN;
        }
    }

    setValue(n: number) {
        let _n = Math.floor(n)
        this.value.text = _n + "%"
    }

}