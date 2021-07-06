import GameUI from "./user/UserUI";
import PetMono from "./user/PetMono";
import { HttpManager } from "../manager/HttpManager";
import { UserCtrl } from "./user/UserCtrl";
import { CustomWindow } from "../custom/ui/CustomWindow";
import GameConfig from "../GameConfig";
import { AppCtrl } from "./AppCtrl";
import { PublicNoticeMgr } from "./publicNotice/PublicNoticeMgr";
import { CustomDefine } from "../custom/CustomDefine";
import { Game } from "../Game";

/*
* 2019-06-12 andy
游戏控制
*/
export class GameCtrl {
	//3D场景
	public scene3D: Laya.Scene3D;
	/**摄像机 */
	public camera: Laya.Camera;
	/** 我的宠物 */
	public pet: Laya.Sprite3D;
	/** 我的宠物 */
	public petMono: PetMono;
	//底板坐标
	public gameUI: GameUI;


	private static _ins: GameCtrl;
	public static get ins(): GameCtrl {
		if (!this._ins)
			GameCtrl._ins = new GameCtrl();
		return this._ins;
	}
	constructor() {
		if (GameCtrl._ins != null)
			throw new Error("GameCtrl is single!");
	}


	public init(): void {
		this.initCamera();
		
		// UserCtrl.ins.getUser();
		// UserCtrl.ins.getBag();
	}

	public initCamera(): void {
		if (!this.scene3D) {
			this.scene3D = LayerManager.ins.addChild(new Laya.Scene3D(), LayerName.scene_king);
			//添加照相机
			var camera: Laya.Camera = (this.scene3D.addChild(new Laya.Camera(0, 0.1, 100))) as Laya.Camera;
			camera.name = "Main camera";
			camera.transform.translate(new Laya.Vector3(0, 0, 3));
			camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
			//2021-05-28 andy 不设置的画看不见2D背景图
			camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;
			// camera.orthographic = true;
			//正交垂直矩阵距离,控制3D物体远近与显示大小
			camera.orthographicVerticalSize = 3;
			this.camera = camera
			//添加方向光
			// var directionLight: Laya.DirectionLight = this.scene3D.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
			// directionLight.color = new Laya.Vector3((238/225), (214/225),(131/225));
			// directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
			// directionLight.intensity = 0.9

			// directionLight.transform.localPosition = new Laya.Vector3(3.025143, 2.002386, -0.9977947);
			// directionLight.transform.localPosition = new Laya.Vector3(61.356, -62.998, -12.517);

		}
	}
	/** 播放按钮声音 */
	public playBtnSound(): void {
		let sound_btn: Base64Type = new Base64Type("res/sound/btn.mp3", "sound_btn", "", "");
		SoundManager.ins.playSound(sound_btn);
	}
	private uui: Laya.Sprite = null;
	//---------------- UI辅助方法 ---------------
	/**
	 * 在背景上画一个黑色的遮罩
	 * @param ui 界面UI
	 * @param showPos 0.不做划出 1.从屏幕底下划出
	 * @returns 
	 */
	public addBlackBg(ui: Laya.Sprite, showPos: number = 0, alpha: number = 0.7, param: number = 0): void {
		let sp: Laya.Sprite = LayerManager.ins.getLayer(LayerName.ui_window).getChildByName("window_balck_bg") as Laya.Sprite;
		if (!ui) {
			if (sp) sp.removeSelf();
			EventManager.ins.event(CustomDefine.EVENT_OPENLED, this.uui)
			return;
		}
		if (!sp) {
			sp = new Laya.Sprite();
			sp.graphics.drawRect(0, 0, Define.canvasWidth, Define.DeviceH, "#000000");
			sp.x = (Define.DeviceW - Define.canvasWidth) >> 1;
			sp.name = "window_balck_bg";
		}
		//console.log(ui.parent.getChildIndex(ui));
		ui.parent.addChildAt(sp, ui.parent.getChildIndex(ui));
		sp.visible = true;
		sp.alpha = alpha;

		// PublicNoticeMgr.ins().isShowVidio(false);
		EventManager.ins.event(CustomDefine.EVENT_CLOSELED, ui)
		this.uui = ui;

		if (showPos == 1) {
			ui.y = 1000;
			let targetY: number = -AppCtrl.ins.appMenuBgHeight;
			Laya.Tween.to(ui, { y: targetY }, 200, null, Laya.Handler.create(this, () => {
				console.log("window_balck_bg tween finish");
			}));
		} else {
			//2021-06-18 andy 游戏采用等比例缩放
			if (param == 0) {
				//ui.y = (this.fillRateHeight - Define.DeviceH) >> 1;
			} else {
				//ui.y = (this.fillRateHeight - param) >> 1;
			}

		}

	}
	/**
	 * 游戏中显示遮罩Loading
	 * @param isShow 
	 */
	public showLoading(isShow: boolean = true): void {
		let sp: Laya.Sprite = LayerManager.ins.getLayer(LayerName.top).getChildByName("window_top_loading") as Laya.Sprite;
		if (!sp) {
			sp = new Laya.Sprite();
			sp.graphics.drawRect(0, 0, Define.DeviceW, Define.DeviceH, "#000000");
			sp.alpha = 0.9;
			sp.name = "window_top_loading";

			let lbl: Laya.Label = new Laya.Label();
			lbl.text = "加载中...";
			lbl.fontSize = 50;
			lbl.color = "#ffffff";
			lbl.anchorX = lbl.anchorY = 0.5;
			lbl.x = Define.DeviceW >> 1;
			lbl.y = Define.DeviceH >> 1;
			sp.addChild(lbl);

			LayerManager.ins.addChild(sp, LayerName.top);
		}
		sp.visible = isShow;
	}


	public canvasCutImg(obj: any, ui: Laya.Image): void {
		let base64Data = "";
		if (obj instanceof Laya.Image) {
			// let p:Laya.Point =new Laya.Point(obj.x,obj.y);
			// (obj.parent as Laya.Sprite).localToGlobal(p);
			// let htmlCanvas:Laya.HTMLCanvas=Laya.stage.drawToCanvas(obj.width,obj.height,-p.x,-p.y);
			// base64Data=htmlCanvas.toBase64("img/png",1);

			// let htmlCanvas:Laya.HTMLCanvas=obj.drawToCanvas(obj.width,obj.height,obj.width,obj.height);
			// base64Data=htmlCanvas.toBase64("img/png",1);


		} else if (obj instanceof Laya.Sprite3D) {
			// let text:any = new Laya.Texture2D();
			// GameCtrl.ins.scene3D.drawToTexture3D(0,0,text);
			//this.getScreenTexture()

		}
		console.log(base64Data);
		ui.skin = base64Data;
	}

	public getScreenTexture(): Laya.Texture {
		try {
			let _texture: any = null;
			let gl: WebGL2RenderingContext = (Laya.WebGLContext as any).mainContext;//WebGL2RenderingContext
			let pixels: Uint8Array = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
			gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

			let w: number = gl.drawingBufferWidth;
			let h: number = gl.drawingBufferHeight; console.log(w, h);
			let texture2d: Laya.Texture2D = new Laya.Texture2D(w, h, Laya.TextureFormat.R8G8B8A8, false, false);
			texture2d.setPixels(pixels);
			_texture = new Laya.Texture(texture2d);//这里是上下颠倒的图片

			//_texture =Laya.stage.drawToTexture(550,800,-273,-456);//这个原生API只能截2D图，3D场景的无法截图

			let sp: Laya.Sprite = new Laya.Sprite(); sp.texture = _texture;
			Laya.stage.addChild(sp);

			return _texture;

		} catch (error) {

		}
		return null;
	}

	/**图片压缩处理 */
	public onCompressImg(str:string,w:number){
		let rStr:string = str;
		if(str.indexOf("pic.toowow.cn") == -1){
			str + "?imageView2/2/w/" + w;
		}
		return rStr;
	}

}