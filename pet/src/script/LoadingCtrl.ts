import { CustomDefine, FontType, ModuleType } from "./../custom/CustomDefine";
import { DataConfig } from "./../custom/config/DataConfig";
import { AppCtrl } from "./AppCtrl";
import { CustomWindow } from "../custom/ui/CustomWindow";
import { MsgCtrl } from "./MsgCtrl";
import { Test } from "./Test";
import { GameCtrl } from "./GameCtrl";
import { HttpManager, HttpMethod, HttpName } from "../manager/HttpManager";
import { MinScene } from "./min/MinScene";
import { PublicNoticeMgr } from "./publicNotice/PublicNoticeMgr";
import { LocalStorage } from "./LocalStorage";
import { MinData } from "./min/MinData";
import { MinCtrl } from "./min/MinCtrl";

/*
* 2019-03-08 andy
	加载控制
*/
export class LoadingCtrl {
	public arrRes: Array<any>;

	private static _ins: LoadingCtrl;
	public static get ins(): LoadingCtrl {
		if (!this._ins)
			LoadingCtrl._ins = new LoadingCtrl();
		return this._ins;
	}
	constructor() {
		if (LoadingCtrl._ins != null)
			throw new Error("LoadingCtrl is single!");
		this.arrRes = [];
	}
	/** 初始化功能加载资源 */
	public init(): void {

	}

	/**
	 * 预加载loading资源
	 */
	public preLoad(): void {
		let arr = [{
			url: "res/atlas/loading.atlas",
			type: Laya.Loader.ATLAS
		}];
		ResManager.ins.preload(arr, Laya.Handler.create(this, this.preLoadFinish), null);
	}

	//Loading资源加载完成，打开LoadingUI
	private preLoadFinish(): void {
		this.initModuleLoadRes();
		//增加全局顶级关闭按钮 2021-06-10 产品说暂时不用
		//AppCtrl.ins.addTopCloseButton();
		//2021-06-08 andy 初始化消息面板
		MsgCtrl.ins.init();

		GameCtrl.ins.init();

		//==================字体加载=======================
		// let ttfloader: Laya.TTFLoader = new Laya.TTFLoader()
		// ttfloader.fontName = "fzxs";
		// ttfloader.load("font/fzxs.ttf");

		UIManager.ins.openWindow(CustomWindow.loading);

	}

	//2021-06-11 andy 初始化模块加载资源，按需加载
	private initModuleLoadRes(): void {
		//2021-06-11 andy 公共UI资源
		this.arrRes.push({ url: "res/atlas/game.atlas", type: Laya.Loader.ATLAS });
		//2021-06-11 andy 序列帧资源
		//this.arrRes.push({url:"res/atlas/frame.atlas",type:Laya.Loader.ATLAS});
		//2021-06-22 andy 公共字体资源 方正像素12
		this.arrRes.push({ url: "res/font/" + FontType.fzxs + ".TTF", type: Laya.Loader.TTF });

		if (AppCtrl.ins.type == ModuleType.USER) {
			this.arrRes.push({ url: "res/atlas/user.atlas", type: Laya.Loader.ATLAS });
		} else if (AppCtrl.ins.type == ModuleType.MIN) {
			this.arrRes.push({ url: "res/atlas/mining.atlas", type: Laya.Loader.ATLAS });
			//2021-06-11 andy 序列帧资源
			this.arrRes.push({ url: "res/atlas/mining_frame.atlas", type: Laya.Loader.ATLAS });
			//this.arrRes.push({url:Define.CDN+"3d/pet_0.lh",type:Laya.Loader.AVATAR});
		} else {

		}
		console.log("加载资源：", this.arrRes);
	}

	public enterGame(): void {
		Test.ins.init();

		UIManager.ins.closeWindow(CustomWindow.loading);

		Laya.Browser.window.hideHtmlLoading();
		AppCtrl.ins.loadSuccess();


		if (AppCtrl.ins.type == ModuleType.USER) {
			UIManager.ins.openWindow(CustomWindow.user);
		} else if (AppCtrl.ins.type == ModuleType.MIN) {
			HttpManager.ins.sendMsg(HttpName.TICKETINFO, null, HttpMethod.GET, (msg: string, method: string, e) => {
				if (e && e.data) {

					//debug
					// e.data.status = 0
					console.log("=============挖矿状态===============", JSON.stringify(e.data))
					// PublicNoticeMgr.ins().addVidio(e.data.treasure_infos);
					PublicNoticeMgr.ins().oData = e.data.led_infos;
					MinData.ins.setsMinCion(e.data.balance)
					if (e.data.status == 1 || e.data.status == 3) {
						MinScene.ins.init();
					} else if (e.data.status == 5) {
						MinCtrl.ins.onMinMaintain();
						return
					}
					else {

						//清理缓存
						LocalStorage.clearAll();
						PublicNoticeMgr.ins()._associate = null;
						PublicNoticeMgr.ins().onDestory();
						PublicNoticeMgr.ins().clearAllQueue()
						LayerManager.ins.addChild(UIManager.ins.getWindow(CustomWindow.minDoor).ui, LayerName.scene)
						UIManager.ins.getWindow(CustomWindow.minDoor)._data = e.data;
						UIManager.ins.getWindow(CustomWindow.minDoor).onInit()
					}

				} else {
					//2021-06-30 andy 没有门票信息
					AppCtrl.ins.loadError();
				}
			});
		} else {
			LayerManager.ins.addChild(UIManager.ins.getWindow(CustomWindow.minDoor).ui, LayerName.scene)
			UIManager.ins.getWindow(CustomWindow.minDoor).onInit()
		}
		//播放游戏声音
		//Define.SOUND_MAIN = new Base64Type("res/sound/main.mp3", "sound_main", "", "");
		//2021-06-24 andy APP启动，也会初始化webview，第一次不要声音
		if (AppCtrl.ins.isHomePage) {
			//SoundManager.ins.playMusic(Define.SOUND_MAIN);
		}

	}

	public preloadDataConfig(complete: Laya.Handler): void {
		Laya.loader.load(CustomDefine.dataConfigUrl, Laya.Handler.create(this, () => {
			this.parseDataConfig(complete);
		}), null, Laya.Loader.JSON);
	}
	private parseDataConfig(complete: Laya.Handler): void {
		let data: any = Laya.loader.getRes(CustomDefine.dataConfigUrl);
		DataConfig.ins.init(data);
		complete.run();
	}

}