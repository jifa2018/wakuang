

export class CreateBg extends Laya.Sprite {

    static ape: Laya.Sprite = null;
    constructor() {
        super()

    }

    static onCreate() {
        this.ape = new Laya.Sprite();
        this.ape.name = "ape"
        this.ape.loadImage("mining/img_dikaung_da.png");
        this.ape.pos(0, 0);
        this.ape.width = Laya.Browser.width
        this.ape.height = Laya.Browser.height
        LayerManager.ins.addChild(this.ape, LayerName.ui)

        var blurFilter = new Laya.BlurFilter();
        blurFilter.strength = 10;
        this.ape.filters = [blurFilter];
    }

    static onDestroy() {
        CreateBg.ape.removeSelf();
    }


    


}