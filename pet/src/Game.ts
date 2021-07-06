import { CustomDefine } from "./custom/CustomDefine";
import { GameCtrl } from "./script/GameCtrl";
import { LogCtrl } from "./script/LogCtrl";

/*
* name;
*/
export class Game {
    private date:Date;
    private today:number;

    private static _ins: Game;
    public static get ins(): Game {
        if (!this._ins)
            Game._ins = new Game();
        return this._ins;
    }
    constructor() {
        if (Game._ins != null)
            throw new Error("Game is single!");
    }

    /**
     *初始化游戏配置
     */
    public init(): void {
        Define.DOWNLOAD_URL = "";
        Define.isSameScale = false;
        Define.isSameBackgroundScale = false;
        Define.screenFillType = ScreenFillType.default;
        Define.BACKGROUND_COLOR = "#000000";
        // /UIScaleManager.ins.init();
        Define.isVertitalGame = true;

        Config.isAntialias = true;
        //Config.preserveDrawingBuffer = true;
        Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_HEIGHT;//Laya.Stage.SCALE_SHOWALL;
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        //调用DebugPanel调试面板
        //Laya.enableDebugPanel();
        //Laya.stage.cacheAs="bitmap";
        
        Define.canvasHeight = game.Define.DeviceW * Define.height / Define.width;
		Define.canvasWidth = game.Define.DeviceH * Define.width / Define.height;

		console.log("设备可视宽高", Laya.Browser.clientWidth, Laya.Browser.clientHeight, "设备物理宽高：", Define.width, Define.height, "像素比:", Laya.Browser.pixelRatio, "画布宽高", Define.canvasWidth, Define.canvasHeight);
        GameCtrl.ins;

        //2021-06-30 andy APP如果一直没有关掉，存在换天问题，换天时按需重置某些数据
        this.date = new Date();
        this.today = this.date.getDate();
        Laya.timer.loop(2000,this,this.update);
        console.log("当前客户端是：",this.today+"号");
    }

    private update():void{
        this.date.setTime(Date.now());
        if(this.today != this.date.getDate()){
            this.today = this.date.getDate();
            console.log("客户端变更日期：",this.today);
            EventManager.ins.event(CustomDefine.EVENT_CHANGE_DAY);
        }
    }

}